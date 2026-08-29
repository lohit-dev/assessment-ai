/**
 * tests/api.test.ts
 *
 * Integration tests for the assessment-mapper API routes.
 * Targets a running Next.js dev server at http://localhost:3000.
 *
 * Exam theme: Science — Light & Optics (Class 10)
 * Fixtures:
 *   tests/fixtures/documents/question-paper.pdf  — 4 questions, 20 marks total
 *   tests/fixtures/documents/answer-sheet.pdf    — Aryan Sharma's answers
 *
 * ── Test groups ──────────────────────────────────────────────────────────────
 *  Group A — error-path tests (no API key needed, always run):
 *    1.  POST /api/extract-questions — missing file → 400
 *    2.  POST /api/extract-questions — wrong mime type → 415
 *    3.  POST /api/extract-answers   — missing questions field → 400
 *    4.  POST /api/extract-answers   — malformed questions JSON → 400
 *    5.  POST /api/grade             — missing question field → 400
 *    6.  POST /api/grade             — empty regions → 200, score 0, no AI call
 *
 *  Group B — happy-path + full flow (require GEMINI_API_KEY):
 *    7.  POST /api/extract-questions — extracts Question[] + PageImage[]
 *    8.  POST /api/extract-answers   — extracts AnswerRegion[] + MappedQuestion[]
 *    9.  POST /api/grade             — grades one matched question
 *    10. POST /api/grade             — allGrades triggers ExamSummary
 *    11. Full flow: extract → match → grade all → summary
 */

import * as fs from "fs";
import * as path from "path";
import type {
  Question,
  AnswerRegion,
  MappedQuestion,
  GradeResult,
  ExamSummary,
  PageImage,
} from "@/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = "http://127.0.0.1:3100";
const FIXTURES = path.join(__dirname, "..", "fixtures", "documents");

function requireApiKey(): void {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "your_gemini_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY must be set in .env.local for the full integration suite."
    );
  }
}

/**
 * A short pause between AI calls avoids burst-rate limiting in local runs.
 * Error-path tests use wait(1000) since they don't hit Gemini.
 */
const wait = (ms = 3_000) => new Promise((r) => setTimeout(r, ms));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function questionPaperForm(): FormData {
  const form = new FormData();
  const buf = fs.readFileSync(path.join(FIXTURES, "question-paper.pdf"));
  form.append(
    "file",
    new Blob([buf], { type: "application/pdf" }),
    "question-paper.pdf"
  );
  return form;
}

function answerSheetForm(questions: Question[]): FormData {
  const form = new FormData();
  const buf = fs.readFileSync(path.join(FIXTURES, "answer-sheet.pdf"));
  form.append(
    "file",
    new Blob([buf], { type: "application/pdf" }),
    "answer-sheet.pdf"
  );
  form.append("questions", JSON.stringify(questions));
  return form;
}

async function postForm(
  route: string,
  form: FormData
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${BASE_URL}${route}`, {
    method: "POST",
    body: form,
  });
  return {
    status: res.status,
    body: (await res.json()) as Record<string, unknown>,
  };
}

async function postJSON(
  route: string,
  payload: unknown
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${BASE_URL}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return {
    status: res.status,
    body: (await res.json()) as Record<string, unknown>,
  };
}

// ─── Group A: error-path tests (always run, no API key needed) ────────────────
// These describe blocks have NO beforeAll — they never touch Gemini.

describe("POST /api/extract-questions — error paths", () => {
  test("1. missing file field → 400", async () => {
    const form = new FormData();
    form.append("data", "not a file");

    const { status, body } = await postForm("/api/extract-questions", form);

    expect(status).toBe(400);
    expect(typeof body.error).toBe("string");
    expect(body.error).toMatch(/file/i);

    await wait(1000);
  });

  test("2. unsupported file type → 415", async () => {
    const form = new FormData();
    form.append(
      "file",
      new Blob(["hello world"], { type: "text/plain" }),
      "test.txt"
    );

    const { status, body } = await postForm("/api/extract-questions", form);

    expect(status).toBe(415);
    expect(typeof body.error).toBe("string");

    await wait(1000);
  });
});

describe("POST /api/extract-answers — error paths", () => {
  test("3. missing questions field → 400", async () => {
    const form = new FormData();
    const buf = fs.readFileSync(path.join(FIXTURES, "answer-sheet.pdf"));
    form.append(
      "file",
      new Blob([buf], { type: "application/pdf" }),
      "answer-sheet.pdf"
    );

    const { status, body } = await postForm("/api/extract-answers", form);

    expect(status).toBe(400);
    expect(typeof body.error).toBe("string");
    expect(body.error).toMatch(/questions/i);

    await wait(1000);
  });

  test("4. malformed questions JSON → 400", async () => {
    const form = new FormData();
    const buf = fs.readFileSync(path.join(FIXTURES, "answer-sheet.pdf"));
    form.append(
      "file",
      new Blob([buf], { type: "application/pdf" }),
      "answer-sheet.pdf"
    );
    form.append("questions", "{ this is not valid json }");

    const { status, body } = await postForm("/api/extract-answers", form);

    expect(status).toBe(400);
    expect(typeof body.error).toBe("string");

    await wait(1000);
  });
});

describe("POST /api/grade — error paths", () => {
  test("5. missing question field → 400", async () => {
    const { status, body } = await postJSON("/api/grade", {
      regions: [],
      pages: [],
    });

    expect(status).toBe(400);
    expect(typeof body.error).toBe("string");
    expect(body.error).toMatch(/question/i);

    await wait(1000);
  });

  test("6. empty regions (unanswered) → 200, score 0, instant response", async () => {
    const unanswered: Question = {
      questionId: "99",
      displayNumber: "Q99",
      text: "A question the student did not attempt.",
      marks: 5,
      page: 1,
    };

    const start = Date.now();
    const { status, body } = await postJSON("/api/grade", {
      question: unanswered,
      regions: [],
      pages: [
        {
          page: 1,
          url: "data:application/pdf;base64,abc",
          width: 595,
          height: 842,
        },
      ],
    });
    const elapsed = Date.now() - start;

    expect(status).toBe(200);
    const result = body.result as GradeResult;
    expect(result.questionId).toBe("99");
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(5);
    expect(typeof result.feedback).toBe("string");
    expect(elapsed).toBeLessThan(3000);
  });
});

// ─── Group B: AI happy-path tests ─────────────────────────────────────────────

describe("AI happy-path tests (requires GEMINI_API_KEY)", () => {
  // Shared data populated by beforeAll
  let questions: Question[] = [];
  let questionPages: PageImage[] = [];
  let regions: AnswerRegion[] = [];
  let mapped: MappedQuestion[] = [];
  let answerPages: PageImage[] = [];

  beforeAll(async () => {
    requireApiKey();

    // ── Step 1: extract questions ─────────────────────────────────────────
    const qRes = await postForm("/api/extract-questions", questionPaperForm());
    if (qRes.status !== 200) {
      throw new Error(
        `extract-questions failed (${qRes.status}): ${JSON.stringify(qRes.body)}`
      );
    }
    questions = (qRes.body.questions as Question[]) ?? [];
    questionPages = (qRes.body.pages as PageImage[]) ?? [];

    if (questions.length === 0) {
      throw new Error("extract-questions returned 0 questions");
    }

    await wait(); // respect RPM

    // ── Step 2: extract answers ────────────────────────────────────────────
    const aRes = await postForm(
      "/api/extract-answers",
      answerSheetForm(questions)
    );
    if (aRes.status !== 200) {
      throw new Error(
        `extract-answers failed (${aRes.status}): ${JSON.stringify(aRes.body)}`
      );
    }
    regions = (aRes.body.regions as AnswerRegion[]) ?? [];
    mapped = (aRes.body.mapped as MappedQuestion[]) ?? [];
    answerPages = (aRes.body.pages as PageImage[]) ?? [];

    await wait(); // respect RPM before first test runs
  }, 120_000);

  // ── Test 7 ─────────────────────────────────────────────────────────────

  test("7. extract-questions: returns Question[] and PageImage[]", async () => {
    expect(questions.length).toBeGreaterThan(0);
    expect(questionPages.length).toBeGreaterThan(0);

    for (const q of questions) {
      expect(typeof q.questionId).toBe("string");
      expect(q.questionId.length).toBeGreaterThan(0);
      expect(typeof q.displayNumber).toBe("string");
      expect(typeof q.text).toBe("string");
      expect(q.text.length).toBeGreaterThan(0);
      expect(q.marks === null || typeof q.marks === "number").toBe(true);
      expect(typeof q.page).toBe("number");
      expect(q.page).toBeGreaterThanOrEqual(1);
    }

    for (const p of questionPages) {
      expect(typeof p.page).toBe("number");
      expect(typeof p.url).toBe("string");
      expect(p.url.length).toBeGreaterThan(0);
    }

    // The exam is about Light & Optics
    const allText = questions
      .map((q) => q.text)
      .join(" ")
      .toLowerCase();
    expect(allText).toMatch(/light|refract|mirror|speed|optic/i);
  });

  // ── Test 8 ─────────────────────────────────────────────────────────────

  test("8. extract-answers: returns AnswerRegion[], MappedQuestion[], PageImage[]", async () => {
    expect(regions.length).toBeGreaterThan(0);
    expect(mapped.length).toBeGreaterThanOrEqual(questions.length);
    expect(answerPages.length).toBeGreaterThan(0);

    for (const r of regions) {
      expect(typeof r.regionId).toBe("string");
      expect(typeof r.questionLabel).toBe("string");
      expect(
        r.normalizedId === null || typeof r.normalizedId === "string"
      ).toBe(true);
      expect(r.boundingBox.x).toBeGreaterThanOrEqual(0);
      expect(r.boundingBox.x).toBeLessThanOrEqual(1);
      expect(r.boundingBox.y).toBeGreaterThanOrEqual(0);
      expect(r.boundingBox.y).toBeLessThanOrEqual(1);
      expect(r.boundingBox.width).toBeGreaterThan(0);
      expect(r.boundingBox.width).toBeLessThanOrEqual(1);
      expect(r.boundingBox.height).toBeGreaterThan(0);
      expect(r.boundingBox.height).toBeLessThanOrEqual(1);
      expect(r.page).toBeGreaterThanOrEqual(1);
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }

    for (const m of mapped) {
      expect(typeof m.question.questionId).toBe("string");
      expect(["matched", "unanswered", "unmatched-answer"]).toContain(m.status);
      expect(Array.isArray(m.regions)).toBe(true);
    }

    // Answer sheet has real answers — at least one must be matched
    expect(mapped.some((m) => m.status === "matched")).toBe(true);
  });

  // ── Test 9 ─────────────────────────────────────────────────────────────

  test("9. grade: matched question returns valid GradeResult", async () => {
    const matchedEntry = mapped.find((m) => m.status === "matched");
    expect(matchedEntry).toBeDefined();

    const { status, body } = await postJSON("/api/grade", {
      question: matchedEntry!.question,
      regions: matchedEntry!.regions,
      pages: answerPages,
    });

    expect(status).toBe(200);
    const result = body.result as GradeResult;
    expect(typeof result.questionId).toBe("string");
    expect(["partial", true, false]).toContain(result.isCorrect);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(result.maxScore);
    expect(typeof result.feedback).toBe("string");
    expect(result.feedback.length).toBeGreaterThan(0);

    await wait();
  });

  // ── Test 10 ────────────────────────────────────────────────────────────

  test("10. grade: allGrades triggers ExamSummary in response", async () => {
    const matchedEntry = mapped.find((m) => m.status === "matched");
    expect(matchedEntry).toBeDefined();

    const priorGrades: GradeResult[] = questions
      .filter((q) => q.questionId !== matchedEntry!.question.questionId)
      .map((q) => ({
        questionId: q.questionId,
        isCorrect: true as const,
        score: q.marks ?? 2,
        maxScore: q.marks ?? 2,
        feedback: "Correct.",
      }));

    const { status, body } = await postJSON("/api/grade", {
      question: matchedEntry!.question,
      regions: matchedEntry!.regions,
      pages: answerPages,
      allGrades: priorGrades,
    });

    expect(status).toBe(200);
    expect(typeof body.result).toBe("object");

    const summary = body.summary as ExamSummary;
    expect(typeof summary).toBe("object");
    expect(typeof summary.totalScore).toBe("number");
    expect(typeof summary.maxScore).toBe("number");
    expect(summary.totalScore).toBeGreaterThanOrEqual(0);
    expect(summary.maxScore).toBeGreaterThan(0);
    expect(summary.totalScore).toBeLessThanOrEqual(summary.maxScore);
    expect(typeof summary.overallFeedback).toBe("string");
    expect(summary.overallFeedback.length).toBeGreaterThan(0);

    await wait();
  });

  // ── Test 11: Full flow ──────────────────────────────────────────────────

  test("11. full flow: extract → match → grade all → summary", async () => {
    // Steps 1 & 2 already done in beforeAll — verify the shared data
    expect(questions.length).toBeGreaterThan(0);
    expect(regions.length).toBeGreaterThan(0);
    expect(mapped.some((m) => m.status === "matched")).toBe(true);

    // Grade every matched/unanswered question sequentially
    const toGrade = mapped.filter(
      (m) => m.status === "matched" || m.status === "unanswered"
    );
    expect(toGrade.length).toBeGreaterThan(0);

    const grades: GradeResult[] = [];

    for (const entry of toGrade) {
      const isLast = entry === toGrade[toGrade.length - 1];

      const gradeRes = await postJSON("/api/grade", {
        question: entry.question,
        regions: entry.regions,
        pages: answerPages,
        ...(isLast && grades.length > 0 ? { allGrades: grades } : {}),
      });

      expect(gradeRes.status).toBe(200);

      const result = gradeRes.body.result as GradeResult;
      expect(typeof result.questionId).toBe("string");
      expect(["partial", true, false]).toContain(result.isCorrect);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(result.maxScore);
      expect(typeof result.feedback).toBe("string");

      grades.push(result);

      if (isLast && grades.length > 1) {
        const summary = gradeRes.body.summary as ExamSummary | undefined;
        if (summary) {
          expect(typeof summary.totalScore).toBe("number");
          expect(typeof summary.maxScore).toBe("number");
          expect(summary.totalScore).toBeLessThanOrEqual(summary.maxScore);
          expect(typeof summary.overallFeedback).toBe("string");
        }
      }

      if (!isLast) await wait();
    }

    expect(grades.length).toBe(toGrade.length);

    const totalScore = grades.reduce((s, g) => s + g.score, 0);
    const maxScore = grades.reduce((s, g) => s + g.maxScore, 0);
    expect(totalScore).toBeGreaterThanOrEqual(0);
    expect(maxScore).toBeGreaterThan(0);
    expect(totalScore).toBeLessThanOrEqual(maxScore);

    // Aryan answered all questions — at least some should be positive
    const hasPositive = grades.some(
      (g) => g.isCorrect === true || g.isCorrect === "partial"
    );
    expect(hasPositive).toBe(true);
  }, 300_000); // Allow time for multiple remote grading requests.
});
