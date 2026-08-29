import { NextRequest, NextResponse } from "next/server";
import type { Question, AnswerRegion } from "@/types";
import { geminiJSON } from "@/lib/ai/client";
import {
  EXTRACT_ANSWERS_SYSTEM,
  extractAnswersUserPrompt,
} from "@/lib/ai/prompts";
import { matchRegionsToQuestions } from "@/lib/ai/matching";
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

  const questionsRaw = formData.get("questions");
  if (typeof questionsRaw !== "string") {
    return errorResponse(
      400,
      'Missing required field "questions" (JSON string).'
    );
  }

  let questions: Question[];
  try {
    const parsed = JSON.parse(questionsRaw);
    if (!Array.isArray(parsed)) throw new Error("questions must be an array");
    questions = parsed as Question[];
  } catch (err) {
    return errorResponse(
      400,
      `Invalid "questions" JSON: ${(err as Error).message}`
    );
  }

  if (!SUPPORTED_DOCUMENT_TYPES.has(file.type)) {
    return errorResponse(415, `Unsupported file type: ${file.type}.`);
  }

  let document: Awaited<ReturnType<typeof createAiDocument>>;

  try {
    document = await createAiDocument(file);
  } catch (err) {
    console.error("[extract-answers] file processing error:", err);
    return errorResponse(422, "Failed to process the uploaded file.");
  }

  if (document.pages.length === 0) {
    return errorResponse(422, "The file has no readable pages.");
  }

  let rawResult: unknown;
  try {
    rawResult = await geminiJSON(
      EXTRACT_ANSWERS_SYSTEM,
      extractAnswersUserPrompt(document.pages.length, questions),
      document.parts
    );
  } catch (err) {
    console.error("[extract-answers] Gemini error:", err);
    return errorResponse(502, "AI extraction failed. Please try again.");
  }

  if (!Array.isArray(rawResult)) {
    console.error("[extract-answers] Unexpected Gemini response:", rawResult);
    return errorResponse(502, "Unexpected response from AI. Please try again.");
  }

  const regions: AnswerRegion[] = (rawResult as Record<string, unknown>[])
    .filter(isAnswerRegionShape)
    .map((r, idx) => ({
      regionId: typeof r.regionId === "string" ? r.regionId : `r${idx + 1}`,
      questionLabel: String(r.questionLabel ?? ""),
      normalizedId: typeof r.normalizedId === "string" ? r.normalizedId : null,
      boundingBox: coerceBoundingBox(r.boundingBox),
      page: typeof r.page === "number" ? r.page : 1,
      confidence: typeof r.confidence === "number" ? r.confidence : 0.5,
      continuesOnNextPage:
        typeof r.continuesOnNextPage === "boolean"
          ? r.continuesOnNextPage
          : false,
      text: typeof r.text === "string" ? r.text : "",
    }));

  const mapped = matchRegionsToQuestions(questions, regions);

  return NextResponse.json({ regions, mapped, pages: document.pages });
}

function isAnswerRegionShape(v: unknown): v is Record<string, unknown> {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.questionLabel === "string" && typeof r.boundingBox === "object"
  );
}

function coerceBoundingBox(bb: unknown): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const defaults = { x: 0, y: 0, width: 1, height: 0.1 };
  if (!bb || typeof bb !== "object") return defaults;
  const b = bb as Record<string, unknown>;
  return {
    x: typeof b.x === "number" ? clamp(b.x) : defaults.x,
    y: typeof b.y === "number" ? clamp(b.y) : defaults.y,
    width: typeof b.width === "number" ? clamp(b.width) : defaults.width,
    height: typeof b.height === "number" ? clamp(b.height) : defaults.height,
  };
}

function clamp(n: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, n));
}
