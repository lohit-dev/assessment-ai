"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import LoadingState from "@/components/LoadingState";
import { useAssessmentStore } from "@/store/useAssessmentStore";
import type {
  Question,
  AnswerRegion,
  MappedQuestion,
  PageImage,
} from "@/types";

const STAGE_COPY: Partial<Record<string, { title: string; subtitle: string }>> =
  {
    uploading: {
      title: "Uploading...",
      subtitle: "Preparing your files",
    },
    "extracting-questions": {
      title: "Extracting...",
      subtitle: "Reading the question paper",
    },
    "extracting-answers": {
      title: "Mapping...",
      subtitle: "Matching answers to each question",
    },
  };

async function extractQuestions(
  file: File
): Promise<{ questions: Question[]; pages: PageImage[] }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/extract-questions", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to extract questions.");
  }
  return res.json();
}

async function extractAnswers(
  file: File,
  questions: Question[]
): Promise<{
  regions: AnswerRegion[];
  mapped: MappedQuestion[];
  pages: PageImage[];
}> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("questions", JSON.stringify(questions));
  const res = await fetch("/api/extract-answers", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to extract answers.");
  }
  return res.json();
}

export default function ResultsPage() {
  const router = useRouter();
  const hasRun = useRef(false);

  const {
    stage,
    error,
    questionPaperFile,
    answerSheetFile,
    questions,
    mapped,
    setStage,
    setError,
    setQuestionPaperPages,
    setAnswerSheetPages,
    setQuestions,
    setAnswerRegions,
    setMapped,
  } = useAssessmentStore();

  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    // guard against StrictMode double-invoke and re-navigation
    if (hasRun.current) return;

    if (!questionPaperFile || !answerSheetFile) {
      router.replace("/");
      return;
    }

    hasRun.current = true;

    async function run() {
      try {
        setError(null);
        setStage("extracting-questions");
        const { questions: extractedQuestions, pages: qPages } =
          await extractQuestions(questionPaperFile!);
        setQuestions(extractedQuestions);
        setQuestionPaperPages(qPages);

        setStage("extracting-answers");
        const {
          regions,
          mapped: mappedResult,
          pages: aPages,
        } = await extractAnswers(answerSheetFile!, extractedQuestions);
        setAnswerRegions(regions);
        setMapped(mappedResult);
        setAnswerSheetPages(aPages);

        setStage("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey, questionPaperFile, answerSheetFile]);

  function handleRetry() {
    hasRun.current = false;
    setRetryKey((k) => k + 1);
  }

  const isLoading =
    stage === "uploading" ||
    stage === "extracting-questions" ||
    stage === "extracting-answers" ||
    stage === "mapping";

  const copy = STAGE_COPY[stage] ?? STAGE_COPY["extracting-questions"]!;

  return (
    <div className="flex min-h-screen bg-linear-to-b from-[#eeeeee] to-[#dadada] p-3 md:p-4">
      <Sidebar variant="collapsed" />

      <div className="flex flex-1 flex-col gap-3 md:ml-[88px]">
        <TopBar />

        <main className="flex flex-1 flex-col">
          {stage === "error" ? (
            <div className="flex h-[calc(100vh-88px)] flex-col items-center justify-center gap-3 rounded-3xl bg-white px-6 text-center">
              <p className="font-heading text-heading text-xl font-bold">
                Something went wrong
              </p>
              <p className="max-w-md text-sm text-gray-500">{error}</p>
              <button
                onClick={handleRetry}
                className="font-heading bg-body mt-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Try again
              </button>
            </div>
          ) : isLoading ? (
            <LoadingState title={copy.title} subtitle={copy.subtitle} />
          ) : (
            <div className="flex h-[calc(100vh-88px)] flex-col items-center justify-center gap-3 rounded-3xl bg-white px-6 text-center">
              <p className="font-heading text-heading text-xl font-bold">
                Extraction complete
              </p>
              <p className="max-w-md text-sm text-gray-500">
                {questions.length} question{questions.length === 1 ? "" : "s"}{" "}
                extracted ·{" "}
                {mapped.filter((m) => m.status === "matched").length} matched to
                an answer ·{" "}
                {mapped.filter((m) => m.status === "unanswered").length}{" "}
                unanswered. The full side-by-side mapping view is next.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
