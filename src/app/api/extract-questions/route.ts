import { NextRequest, NextResponse } from "next/server";
import type { Question, PageImage } from "@/types";
import { pdfToImages, pdfToBase64 } from "@/lib/pdfToImages";
import {
  geminiJSON,
  buildPdfPart,
  buildImagePartsFromDataUrls,
} from "@/lib/gemini";
import {
  EXTRACT_QUESTIONS_SYSTEM,
  extractQuestionsUserPrompt,
} from "@/lib/prompts";
import type { Part } from "@google/genai";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing required field "file".' },
      { status: 400 }
    );
  }

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}. Send a PDF or an image.` },
      { status: 415 }
    );
  }

  let parts: Part[];
  let pages: PageImage[];
  let totalPages: number;

  try {
    const buffer = await file.arrayBuffer();

    if (file.type === "application/pdf") {
      pages = await pdfToImages(buffer);
      totalPages = pages.length;
      parts = [buildPdfPart(pdfToBase64(buffer))];
    } else {
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      pages = [{ page: 1, url: dataUrl, width: 0, height: 0 }];
      totalPages = 1;
      parts = buildImagePartsFromDataUrls([dataUrl]);
    }
  } catch (err) {
    console.error("[extract-questions] file processing error:", err);
    return NextResponse.json(
      { error: "Failed to process the uploaded file." },
      { status: 422 }
    );
  }

  if (pages.length === 0) {
    return NextResponse.json(
      { error: "The file has no readable pages." },
      { status: 422 }
    );
  }

  let rawResult: unknown;
  try {
    rawResult = await geminiJSON(
      EXTRACT_QUESTIONS_SYSTEM,
      extractQuestionsUserPrompt(totalPages),
      parts
    );
  } catch (err) {
    console.error("[extract-questions] Gemini error:", err);
    return NextResponse.json(
      { error: "AI extraction failed. Please try again." },
      { status: 502 }
    );
  }

  if (!Array.isArray(rawResult)) {
    console.error("[extract-questions] Unexpected Gemini response:", rawResult);
    return NextResponse.json(
      { error: "Unexpected response from AI. Please try again." },
      { status: 502 }
    );
  }

  const questions: Question[] = (rawResult as Record<string, unknown>[])
    .filter(isQuestionShape)
    .map((q) => ({
      questionId: String(q.questionId),
      displayNumber: String(q.displayNumber),
      text: String(q.text),
      marks: typeof q.marks === "number" ? q.marks : null,
      page: typeof q.page === "number" ? q.page : 1,
    }));

  return NextResponse.json({ questions, pages });
}

function isQuestionShape(v: unknown): v is Record<string, unknown> {
  if (!v || typeof v !== "object") return false;
  const q = v as Record<string, unknown>;
  return (
    typeof q.questionId === "string" &&
    typeof q.displayNumber === "string" &&
    typeof q.text === "string"
  );
}
