import type {
  AnswerRegion,
  GradeResult,
  MappedQuestion,
  PageImage,
  Question,
} from "@/types";

interface ExtractQuestionsResponse {
  questions: Question[];
  pages: PageImage[];
}

interface ExtractAnswersResponse {
  regions: AnswerRegion[];
  mapped: MappedQuestion[];
  pages: PageImage[];
}

interface GradeResponse {
  result: GradeResult;
}

export async function extractQuestions(
  file: File
): Promise<ExtractQuestionsResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return postForm("/api/extract-questions", formData);
}

export async function extractAnswers(
  file: File,
  questions: Question[]
): Promise<ExtractAnswersResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("questions", JSON.stringify(questions));

  return postForm("/api/extract-answers", formData);
}

export async function gradeQuestion(
  question: Question,
  regions: AnswerRegion[],
  pages: PageImage[]
): Promise<GradeResult> {
  const { result } = await postJson<GradeResponse>("/api/grade", {
    question,
    regions,
    pages,
  });

  return result;
}

async function postForm<T>(url: string, body: FormData): Promise<T> {
  return request<T>(url, { method: "POST", body });
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  return request<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error =
      getErrorMessage(payload) ?? "The request could not be completed.";
    throw new Error(error);
  }

  return payload as T;
}

function getErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const { error } = payload as { error?: unknown };
  return typeof error === "string" ? error : null;
}
