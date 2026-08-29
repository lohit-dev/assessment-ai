"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import LoadingState from "@/components/LoadingState";
import QuestionList from "@/components/QuestionList";
import AnswerSheetViewer from "@/components/AnswerSheetViewer";
import MobileTabToggle, { type MobileTab } from "@/components/MobileTabToggle";
import { useAssessmentStore } from "@/store/useAssessmentStore";
import { renderPdfPages, type RenderedPage } from "@/lib/pdf/client";
import {
  extractAnswers,
  extractQuestions,
  gradeQuestion,
} from "@/features/assessment/client";

const STAGE_COPY: Partial<Record<string, { title: string; subtitle: string }>> =
  {
    uploading: { title: "Uploading...", subtitle: "Preparing your files" },
    "extracting-questions": {
      title: "Extracting...",
      subtitle: "Reading the question paper",
    },
    "extracting-answers": {
      title: "Mapping...",
      subtitle: "Matching answers to each question",
    },
  };

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
  const [mobileTab, setMobileTab] = useState<MobileTab>("questions");

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
        const { questions: extractedQs, pages: qPages } =
          await extractQuestions(questionPaperFile!);
        setQuestions(extractedQs);
        setQuestionPaperPages(qPages);

        setStage("extracting-answers");
        const {
          regions,
          mapped: mappedResult,
          pages: aPages,
        } = await extractAnswers(answerSheetFile!, extractedQs);
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

  useEffect(() => {
    if (stage !== "done" || hasGraded.current || mapped.length === 0) return;
    hasGraded.current = true;

    const gradable = mapped.filter((m) => m.status !== "unmatched-answer");
    setGradingIds(new Set(gradable.map((m) => m.question.questionId)));

    gradable.forEach((m) => {
      gradeQuestion(m.question, m.regions, answerSheetPages)
        .then((result) => setGrade(m.question.questionId, result))
        .catch(() => {})
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
      {/* Desktop sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      {/* Main content area – shifts right to make room for the sidebar on desktop */}
      <div
        className={
          sidebarCollapsed
            ? "flex flex-1 flex-col gap-3 transition-[margin] duration-200 md:ml-22"
            : "flex flex-1 flex-col gap-3 transition-[margin] duration-200 md:ml-82"
        }
      >
        <TopBar />

        <main className="flex flex-1 flex-col">
          {stage === "error" ? (
            <div className="animate-fade-in-up flex h-[calc(100vh-88px)] flex-col items-center justify-center gap-3 rounded-3xl bg-white px-6 text-center">
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
            <div className="animate-fade-in-up flex h-[calc(100vh-88px)] flex-col items-center justify-center gap-3 rounded-3xl bg-white px-6 text-center">
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
            <div className="animate-fade-in flex flex-1 flex-col gap-3">
              {/*
               * Mobile tab toggle — "Questions" / "Answer Sheet"
               * Only visible on small screens; hides on md+
               */}
              <MobileTabToggle activeTab={mobileTab} onChange={setMobileTab} />

              {/*
               * Split layout:
               *   – Mobile: one panel visible at a time (controlled by mobileTab)
               *   – Desktop (md+): side-by-side, QuestionList left, AnswerSheetViewer right
               *
               * Height: fill available viewport minus top bar (~88px with gap).
               */}
              <div
                className="flex flex-1 gap-3"
                style={{ minHeight: "calc(100vh - 120px)" }}
              >
                {/* Questions panel */}
                <div
                  className={
                    mobileTab === "questions"
                      ? "flex flex-1 flex-col md:flex md:max-w-2xl md:flex-none"
                      : "hidden md:flex md:max-w-2xl md:flex-none md:flex-col"
                  }
                >
                  <QuestionList
                    mapped={mapped}
                    selectedQuestionId={selectedQuestionId}
                    grades={grades}
                    gradingIds={gradingIds}
                    onSelectQuestion={(id) => {
                      handleSelectQuestion(id);
                      // On mobile: automatically switch to answer sheet after selecting
                      setMobileTab("answers");
                    }}
                  />
                </div>

                {/* Answer sheet viewer panel */}
                <div
                  className={
                    mobileTab === "answers"
                      ? "flex flex-1 flex-col"
                      : "hidden md:flex md:flex-1 md:flex-col"
                  }
                >
                  <AnswerSheetViewer
                    pages={renderedPages}
                    isLoadingPages={pagesLoading}
                    selectedQuestion={selectedMapped?.question ?? null}
                    selectedRegions={selectedMapped?.regions ?? []}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
