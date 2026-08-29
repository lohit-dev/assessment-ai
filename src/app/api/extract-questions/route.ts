import { NextRequest, NextResponse } from "next/server";
import type { Question } from "@/types";
import { geminiJSON } from "@/lib/ai/client";
import {
  EXTRACT_QUESTIONS_SYSTEM,
  extractQuestionsUserPrompt,
} from "@/lib/ai/prompts";
import {
  createAiDocument,
  SUPPORTED_DOCUMENT_TYPES,
} from "@/features/assessment/server/document";
import { errorResponse } from "@/lib/http/response";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse(400, "Invalid form data.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return errorResponse(400, 'Missing required field "file".');
  }
  if (!SUPPORTED_DOCUMENT_TYPES.has(file.type)) {
    return errorResponse(415, `Unsupported file type: ${file.type}.`);
  }

  let document: Awaited<ReturnType<typeof createAiDocument>>;

  try {
    document = await createAiDocument(file);
  } catch (e) {
    console.error("[extract-questions] file processing:", e);
    return errorResponse(422, "Failed to process the uploaded file.");
  }

  if (document.pages.length === 0) {
    return errorResponse(422, "The file has no readable pages.");
  }

  let rawResult: unknown;
  try {
    rawResult = await geminiJSON(
      EXTRACT_QUESTIONS_SYSTEM,
      extractQuestionsUserPrompt(document.pages.length),
      document.parts
    );
  } catch (e) {
    console.error("[extract-questions] Gemini:", e);
    return errorResponse(502, "AI extraction failed. Please try again.");
  }

  if (!Array.isArray(rawResult)) {
    console.error("[extract-questions] unexpected response:", rawResult);
    return errorResponse(502, "Unexpected response from AI. Please try again.");
  }

  return NextResponse.json({
    questions: rawResult.filter(isQuestion).map(toQuestion),
    pages: document.pages,
  });
}

function isQuestion(v: unknown): v is Record<string, unknown> {
  if (!v || typeof v !== "object") return false;
  const q = v as Record<string, unknown>;
  return (
    typeof q.questionId === "string" &&
    typeof q.displayNumber === "string" &&
    typeof q.text === "string"
  );
}

function toQuestion(question: Record<string, unknown>): Question {
  return {
    questionId: question.questionId as string,
    displayNumber: question.displayNumber as string,
    text: question.text as string,
    marks: typeof question.marks === "number" ? question.marks : null,
    page: typeof question.page === "number" ? question.page : 1,
  };
}
