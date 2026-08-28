"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import LoadingState from "@/components/LoadingState";
import QuestionList from "@/components/QuestionList";
import AnswerSheetViewer from "@/components/AnswerSheetViewer";
import { useAssessmentStore } from "@/store/useAssessmentStore";
import { renderPdfPages, type RenderedPage } from "@/lib/renderPdfPages";
import type {
  Question,
  AnswerRegion,
  MappedQuestion,
  PageImage,
  GradeResult,
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

async function gradeOne(
  question: Question,
  regions: AnswerRegion[],
  pages: PageImage[]
): Promise<GradeResult> {
  const res = await fetch("/api/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, regions, pages }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to grade question.");
  }
  const { result } = await res.json();
  return result as GradeResult;
}

export default function ResultsPage() {
  const router = useRouter();
  const hasRun = useRef(false);
  const hasGraded = useRef(false);

  const {
    stage,
    error,
    questionPaperFile,
    answerSheetFile,
    mapped,
    grades,
    answerSheetPages,
    selectedQuestionId,
    setStage,
    setError,
    setQuestionPaperPages,
    setAnswerSheetPages,
    setQuestions,
    setAnswerRegions,
    setMapped,
    setGrade,
    selectQuestion,
  } = useAssessmentStore();

  const [retryKey, setRetryKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [gradingIds, setGradingIds] = useState<Set<string>>(new Set());

  // ---- Stage 1 & 2: extraction pipeline ----
  useEffect(() => {
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

  // ---- Render answer sheet pages client-side for the viewer ----
  useEffect(() => {
    if (stage !== "done" || !answerSheetFile) return;
    let cancelled = false;
    renderPdfPages(answerSheetFile)
      .then((pages) => {
        if (!cancelled) setRenderedPages(pages);
      })
      .catch(() => {
        if (!cancelled) setRenderedPages([]);
      })
      .finally(() => {
        if (!cancelled) setPagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stage, answerSheetFile]);

  // ---- Background grading: every matched/unanswered question, in parallel ----
  useEffect(() => {
    if (stage !== "done" || hasGraded.current || mapped.length === 0) return;
    hasGraded.current = true;

    const gradable = mapped.filter((m) => m.status !== "unmatched-answer");
    setGradingIds(new Set(gradable.map((m) => m.question.questionId)));

    gradable.forEach((m) => {
      gradeOne(m.question, m.regions, answerSheetPages)
        .then((result) => setGrade(m.question.questionId, result))
        .catch(() => {
          // leave ungraded on failure; pill just won't show for this one
        })
        .finally(() => {
          setGradingIds((prev) => {
            const next = new Set(prev);
            next.delete(m.question.questionId);
            return next;
          });
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, mapped]);

  // ---- Default-select the first matched question once results land ----
  useEffect(() => {
    if (stage !== "done" || selectedQuestionId) return;
    const first = mapped.find((m) => m.status === "matched");
    if (first) selectQuestion(first.question.questionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, mapped]);

  const handleSelectQuestion = useCallback(
    (questionId: string) => selectQuestion(questionId),
    [selectQuestion]
  );

  function handleRetry() {
    hasRun.current = false;
    hasGraded.current = false;
    setRetryKey((k) => k + 1);
  }

  const isLoading =
    stage === "uploading" ||
    stage === "extracting-questions" ||
    stage === "extracting-answers" ||
    stage === "mapping";

  const copy = STAGE_COPY[stage] ?? STAGE_COPY["extracting-questions"]!;

  const selectedMapped = mapped.find(
    (m) => m.question.questionId === selectedQuestionId
  );

  return (
    <div className="flex min-h-screen bg-linear-to-b from-[#eeeeee] to-[#dadada] p-3 md:p-4">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div
        className={
          sidebarCollapsed
            ? "flex flex-1 flex-col gap-3 transition-[margin] md:ml-[88px]"
            : "flex flex-1 flex-col gap-3 transition-[margin] md:ml-82"
        }
      >
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
          ) : mapped.length === 0 ? (
            <div className="flex h-[calc(100vh-88px)] flex-col items-center justify-center gap-3 rounded-3xl bg-white px-6 text-center">
              <p className="font-heading text-heading text-xl font-bold">
                No questions found
              </p>
              <p className="max-w-md text-sm text-gray-500">
                We couldn&apos;t extract any questions from that question paper.
                Try a clearer scan or a different file.
              </p>
              <button
                onClick={() => router.push("/")}
                className="font-heading bg-body mt-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Upload again
              </button>
            </div>
          ) : (
            <div className="flex h-[calc(100vh-88px)] w-full gap-3">
              <QuestionList
                mapped={mapped}
                selectedQuestionId={selectedQuestionId}
                grades={grades}
                gradingIds={gradingIds}
                onSelectQuestion={handleSelectQuestion}
              />
              <AnswerSheetViewer
                pages={renderedPages}
                isLoadingPages={pagesLoading}
                selectedQuestion={selectedMapped?.question ?? null}
                selectedRegions={selectedMapped?.regions ?? []}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
