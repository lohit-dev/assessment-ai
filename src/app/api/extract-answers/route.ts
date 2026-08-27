import { NextRequest, NextResponse } from "next/server";
import type { Question, AnswerRegion, PageImage } from "@/types";
import { pdfToImages, pdfToBase64 } from "@/lib/pdfToImages";
import {
  geminiJSON,
  buildPdfPart,
  buildImagePartsFromDataUrls,
} from "@/lib/gemini";
import {
  EXTRACT_ANSWERS_SYSTEM,
  extractAnswersUserPrompt,
} from "@/lib/prompts";
import { matchRegionsToQuestions } from "@/lib/matching";
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

  const questionsRaw = formData.get("questions");
  if (typeof questionsRaw !== "string") {
    return NextResponse.json(
      { error: 'Missing required field "questions" (JSON string).' },
      { status: 400 }
    );
  }

  let questions: Question[];
  try {
    const parsed = JSON.parse(questionsRaw);
    if (!Array.isArray(parsed)) throw new Error("questions must be an array");
    questions = parsed as Question[];
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid "questions" JSON: ${(err as Error).message}` },
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
      { error: `Unsupported file type: ${file.type}.` },
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
    console.error("[extract-answers] file processing error:", err);
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
      EXTRACT_ANSWERS_SYSTEM,
      extractAnswersUserPrompt(totalPages, questions),
      parts
    );
  } catch (err) {
    console.error("[extract-answers] Gemini error:", err);
    return NextResponse.json(
      { error: "AI extraction failed. Please try again." },
      { status: 502 }
    );
  }

  if (!Array.isArray(rawResult)) {
    console.error("[extract-answers] Unexpected Gemini response:", rawResult);
    return NextResponse.json(
      { error: "Unexpected response from AI. Please try again." },
      { status: 502 }
    );
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

  return NextResponse.json({ regions, mapped, pages });
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
