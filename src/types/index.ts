export type UploadStage =
  | "idle"
  | "uploading"
  | "extracting-questions"
  | "extracting-answers"
  | "mapping"
  | "grading"
  | "done"
  | "error";

export interface BoundingBox {
  /** normalized 0-1 relative to the page image */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Question {
  questionId: string; // normalized, e.g. "11a"
  displayNumber: string; // as printed, e.g. "11 (a)"
  text: string;
  marks: number | null;
  page: number;
}

export interface AnswerRegion {
  regionId: string;
  questionLabel: string; // as literally written by the student
  normalizedId: string | null; // best-guess match to a Question.questionId
  boundingBox: BoundingBox;
  page: number;
  confidence: number; // 0-1
  continuesOnNextPage?: boolean;
  text?: string; // transcribed handwriting, if requested
}

export type MatchStatus = "matched" | "unanswered" | "unmatched-answer";

export interface MappedQuestion {
  question: Question;
  status: MatchStatus;
  regions: AnswerRegion[];
}

export interface GradeResult {
  questionId: string;
  isCorrect: boolean | "partial";
  score: number;
  maxScore: number;
  feedback: string;
}

export interface ExamSummary {
  totalScore: number;
  maxScore: number;
  overallFeedback: string;
}

export interface PageImage {
  page: number;
  url: string;
  width: number;
  height: number;
}
