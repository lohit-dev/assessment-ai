import type { Question, AnswerRegion } from "@/types";

// ─── Extract Questions ────────────────────────────────────────────────────────

export const EXTRACT_QUESTIONS_SYSTEM = `You are an expert at reading printed exam / assessment question papers.
Your task is to extract every question (including sub-questions) from the provided page images.

Return ONLY a valid JSON array. No markdown fences, no prose, no explanation.
Each element must conform exactly to this TypeScript type:

{
  "questionId": string,      // normalised identifier e.g. "1", "2a", "3b", "11i"
  "displayNumber": string,   // exactly as printed e.g. "1.", "(a)", "Q 2 (i)"
  "text": string,            // full question text, verbatim
  "marks": number | null,    // marks allocated if visible, otherwise null
  "page": number             // 1-based page number
}

Rules:
- Include every sub-question as a separate object.
- For sub-questions inherit the parent number, e.g. "2a", "2b".
- Preserve LaTeX/math notation using plain ASCII where possible.
- If marks are in square brackets like [5], parse them as a number.
- Do NOT include non-question instructions (e.g. "Answer all questions").
- Output the JSON array and nothing else.`;

export function extractQuestionsUserPrompt(totalPages: number): string {
  return `The question paper has ${totalPages} page(s). Extract all questions and return the JSON array.`;
}

// ─── Extract Answers ──────────────────────────────────────────────────────────

export const EXTRACT_ANSWERS_SYSTEM = `You are an expert at reading handwritten student answer sheets.
Your task is to locate every distinct answer region on the provided page images.

Return ONLY a valid JSON array. No markdown fences, no prose, no explanation.
Each element must conform exactly to this TypeScript type:

{
  "regionId": string,              // unique id e.g. "r1", "r2"
  "questionLabel": string,         // question label as literally written by the student e.g. "Q1", "2(a)"
  "normalizedId": string | null,   // your best guess at the canonical question id e.g. "2a", or null
  "boundingBox": {
    "x": number,      // normalised 0-1 relative to page width
    "y": number,      // normalised 0-1 relative to page height
    "width": number,
    "height": number
  },
  "page": number,
  "confidence": number,            // 0-1
  "continuesOnNextPage": boolean,
  "text": string                   // transcription of the handwritten answer
}

Rules:
- Each distinct question attempt is a separate region.
- The bounding box must cover the ENTIRE answer — extend it through every line
  of handwriting belonging to this answer, down to where the next question begins.
- Estimate confidence honestly; use < 0.5 when the label is ambiguous.
- Output the JSON array and nothing else.`;

export function extractAnswersUserPrompt(
  totalPages: number,
  questions: Question[]
): string {
  const qList = questions
    .map(
      (q) =>
        `  • ${q.questionId} (${q.displayNumber}) — ${q.marks ?? "?"} marks`
    )
    .join("\n");

  return `The answer sheet has ${totalPages} page(s).
Questions that should be answered:
${qList}

Locate every answer region and return the JSON array.`;
}

// ─── Grade ────────────────────────────────────────────────────────────────────

export const GRADE_SYSTEM = `You are a strict but fair exam marker.
You will be shown a question and images containing the student's handwritten answer.

Return ONLY a valid JSON object. No markdown fences, no prose, no explanation.
The object must conform exactly to:

{
  "questionId": string,
  "isCorrect": boolean | "partial",
  "score": number,      // marks awarded (can be fractional)
  "maxScore": number,
  "feedback": string    // 1-3 sentences: what was right, what was missing, a brief hint
}

Rules:
- Full marks only when the answer is completely correct and well-presented.
- Partial marks proportionally for partially correct answers.
- Do NOT award marks for blank or unreadable answers.
- Output the JSON object and nothing else.`;

export function gradeUserPrompt(
  question: Question,
  regions: AnswerRegion[]
): string {
  const marksLabel =
    question.marks != null
      ? ` [${question.marks} mark${question.marks !== 1 ? "s" : ""}]`
      : "";

  const regionList = regions
    .map((r) => `  • Region ${r.regionId} on page ${r.page}`)
    .join("\n");

  return `Question ${question.displayNumber}${marksLabel}: "${question.text}"

The student's answer spans ${regions.length} region(s):
${regionList}

Grade the answer and return the JSON object.`;
}
