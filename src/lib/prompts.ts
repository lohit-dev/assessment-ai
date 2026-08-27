import type { Question, AnswerRegion } from "@/types";

export const EXTRACT_QUESTIONS_SYSTEM = `You are an expert at reading printed exam / assessment question papers.
Your task is to extract every question (including sub-questions) from the provided page images.

Return ONLY a valid JSON array. No markdown fences, no prose, no explanation.
Each element must conform exactly to this TypeScript type:

{
  "questionId": string,      // normalised identifier e.g. "1", "2a", "3b", "11i"
  "displayNumber": string,   // exactly as printed e.g. "1.", "(a)", "Q 2 (i)"
  "text": string,            // full question text, verbatim
  "marks": number | null,    // marks allocated if visible, otherwise null
  "page": number             // 1-based page number of this image
}

Rules:
- Include every sub-question as a separate object.
- For sub-questions inherit the parent number, e.g. "2a", "2b".
- Preserve LaTeX/math notation using plain ASCII where possible.
- If marks are in square brackets like [5], parse them as a number.
- Do NOT include instructions that are not questions (e.g. "Answer all questions").
- Output the JSON array and nothing else.`;

export function extractQuestionsUserPrompt(totalPages: number): string {
  return `The question paper has ${totalPages} page(s). Each image below is one page.
Extract all questions and return the JSON array described in your instructions.`;
}

export const EXTRACT_ANSWERS_SYSTEM = `You are an expert at reading handwritten student answer sheets.
Your task is to locate every distinct answer region on the provided page images.

Return ONLY a valid JSON array. No markdown fences, no prose, no explanation.
Each element must conform exactly to this TypeScript type:

{
  "regionId": string,              // unique id e.g. "r1", "r2"
  "questionLabel": string,         // question label as literally written by the student, e.g. "Q1", "2(a)", "Ans 3"
  "normalizedId": string | null,   // your best guess at the canonical question id (e.g. "2a"), or null if unclear
  "boundingBox": {
    "x": number,        // normalised 0-1 relative to page width
    "y": number,        // normalised 0-1 relative to page height
    "width": number,    // normalised 0-1
    "height": number    // normalised 0-1
  },
  "page": number,                  // 1-based page index
  "confidence": number,            // 0-1 how confident you are in the normalizedId match
  "continuesOnNextPage": boolean,  // true if the answer appears to continue on the next page
  "text": string                   // transcription of the handwritten answer (best effort)
}

Rules:
- Each distinct question attempt is a separate region.
- If a student answers multiple parts on a single page, create one region per part.
- Bounding boxes must tightly enclose the written content, not blank margins.
- Estimate confidence honestly; use < 0.5 when the label is ambiguous or illegible.
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

  return `The answer sheet has ${totalPages} page(s). Each image below is one page.
The questions that should be answered are:
${qList}

Locate every answer region and return the JSON array described in your instructions.`;
}

export const GRADE_SYSTEM = `You are a strict but fair exam marker.
You will be shown a question and one or more images containing the student's handwritten answer.

Return ONLY a valid JSON object. No markdown fences, no prose, no explanation.
The object must conform exactly to this TypeScript type:

{
  "questionId": string,
  "isCorrect": boolean | "partial",
  "score": number,          // marks awarded (can be fractional)
  "maxScore": number,       // total marks for this question
  "feedback": string        // concise feedback for the student (1-3 sentences)
}

Marking guidelines:
- Award full marks only when the answer is completely correct and well-presented.
- Award partial marks proportionally for partially correct answers.
- feedback should mention what was right, what was missing, and (for wrong answers) a brief hint.
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

  return `Question ${question.displayNumber}${marksLabel}:
"${question.text}"

The student's answer spans ${regions.length} region(s):
${regionList}

Each image below shows one answer region (in order). Grade the answer and return the JSON object.`;
}
