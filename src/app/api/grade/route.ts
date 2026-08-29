import { NextRequest, NextResponse } from "next/server";
import type {
  Question,
  AnswerRegion,
  GradeResult,
  ExamSummary,
  PageImage,
} from "@/types";
import { geminiJSON, buildImageParts } from "@/lib/ai/client";
import { GRADE_SYSTEM, gradeUserPrompt } from "@/lib/ai/prompts";
import { errorResponse } from "@/lib/http/response";

export const runtime = "nodejs";

interface GradeRequestBody {
  question: Question;
  regions: AnswerRegion[];
  pages: PageImage[];
  allGrades?: GradeResult[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: GradeRequestBody;
  try {
    body = (await req.json()) as GradeRequestBody;
  } catch {
    return errorResponse(400, "Request body must be valid JSON.");
  }

  const { question, regions, pages, allGrades } = body;

  if (!question || typeof question.questionId !== "string") {
    return errorResponse(400, 'Missing or invalid "question".');
  }
  if (!Array.isArray(regions)) {
    return errorResponse(400, '"regions" must be an array.');
  }
  if (!Array.isArray(pages)) {
    return errorResponse(400, '"pages" must be an array.');
  }

  if (regions.length === 0) {
    return NextResponse.json({
      result: {
        questionId: question.questionId,
        isCorrect: false,
        score: 0,
        maxScore: question.marks ?? 0,
        feedback: "No answer provided for this question.",
      } satisfies GradeResult,
    });
  }

  const docParts = buildImageParts(pages);
  if (docParts.length === 0) {
    return errorResponse(
      422,
      "Could not resolve any page images for this question."
    );
  }

  let rawResult: unknown;
  try {
    rawResult = await geminiJSON(
      GRADE_SYSTEM,
      gradeUserPrompt(question, regions),
      docParts
    );
  } catch (err) {
    console.error("[grade] Gemini error:", err);
    return errorResponse(502, "AI grading failed. Please try again.");
  }

  const result = coerceGradeResult(rawResult, question);
  if (!result) {
    console.error("[grade] Unexpected Gemini response:", rawResult);
    return errorResponse(502, "Unexpected grading response from AI.");
  }

  const summary =
    allGrades && allGrades.length > 0
      ? buildSummary([...allGrades, result])
      : undefined;

  return NextResponse.json({ result, ...(summary ? { summary } : {}) });
}

function coerceGradeResult(
  raw: unknown,
  question: Question
): GradeResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  let isCorrect: boolean | "partial";
  if (r.isCorrect === "partial") {
    isCorrect = "partial";
  } else if (typeof r.isCorrect === "boolean") {
    isCorrect = r.isCorrect;
  } else {
    isCorrect = false;
  }

  const maxScore =
    typeof r.maxScore === "number" ? r.maxScore : (question.marks ?? 0);
  const score =
    typeof r.score === "number"
      ? Math.min(r.score, maxScore)
      : isCorrect === true
        ? maxScore
        : 0;

  return {
    questionId:
      typeof r.questionId === "string" ? r.questionId : question.questionId,
    isCorrect,
    score,
    maxScore,
    feedback:
      typeof r.feedback === "string" ? r.feedback : "No feedback provided.",
  };
}

function buildSummary(grades: GradeResult[]): ExamSummary {
  const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
  const maxScore = grades.reduce((sum, g) => sum + g.maxScore, 0);
  const pct = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  let overallFeedback: string;
  if (pct >= 80) {
    overallFeedback = `Excellent work! You scored ${totalScore}/${maxScore} (${pct.toFixed(0)}%).`;
  } else if (pct >= 60) {
    overallFeedback = `Good effort. You scored ${totalScore}/${maxScore} (${pct.toFixed(0)}%). Review the questions you missed.`;
  } else if (pct >= 40) {
    overallFeedback = `You scored ${totalScore}/${maxScore} (${pct.toFixed(0)}%). Significant revision is recommended.`;
  } else {
    overallFeedback = `You scored ${totalScore}/${maxScore} (${pct.toFixed(0)}%). Please revisit the topic and seek help from your teacher.`;
  }

  return { totalScore, maxScore, overallFeedback };
}
