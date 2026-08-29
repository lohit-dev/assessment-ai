"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import UploadCard from "@/components/UploadCard";
import { useAssessmentStore } from "@/store/useAssessmentStore";

export default function UploadPage() {
  const router = useRouter();
  // Sidebar starts expanded on desktop (matches Figma), collapses on demand
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    questionPaperFile,
    answerSheetFile,
    setQuestionPaperFile,
    setAnswerSheetFile,
    setStage,
  } = useAssessmentStore();

  const bothUploaded = Boolean(questionPaperFile && answerSheetFile);

  function handleStartMapping() {
    if (!bothUploaded) return;
    setStage("uploading");
    router.push("/results");
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-linear-to-b from-[#F5F5F5] to-[#E9E5E5] p-3 md:p-4">
      {/* Decorative blurred ellipses — subtle, matches Figma */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-100px] left-[15%] h-[428px] w-[1318px] rounded-full bg-[rgba(23,23,23,0.2)] blur-[200px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-200px] left-[22%] h-[428px] w-[1113px] rounded-full bg-[rgba(76,76,76,0.2)] blur-[200px]"
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div
        className={
          sidebarCollapsed
            ? "flex flex-1 flex-col gap-3 transition-[margin] duration-200 md:ml-[88px]"
            : "flex flex-1 flex-col gap-3 transition-[margin] duration-200 md:ml-82"
        }
      >
        <TopBar />

        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-2 pt-4 pb-8 md:gap-5">
          {/* ── Hero heading ── */}
          {/* Mobile: two-line centered, plain dark text */}
          <h1 className="font-heading text-center text-[24px] leading-[1.2] font-bold tracking-[-0.96px] text-[#2b2b2b] md:hidden">
            Upload Question Paper
            <br />
            &amp; Answer Sheets
          </h1>

          {/* Desktop: "Upload " plain + orange-highlight pill for the long part */}
          <h1 className="font-heading hidden items-center justify-center gap-3 text-center text-[40px] leading-[1.2] font-bold tracking-[-1.6px] md:flex">
            <span className="text-[#2b2b2b]">Upload</span>
            <span className="inline-flex items-center rounded-lg bg-[rgba(255,147,80,0.15)] px-2 py-1 text-[#ff5623]">
              Question Paper &amp; Answer Sheets
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-heading text-center text-[18px] leading-[1.4] font-normal tracking-[-0.72px] text-[#303030] md:text-[20px] md:tracking-[-0.8px]">
            Upload both files to get started
          </p>

          {/* Tutor illustration */}
          <Image
            src="/assets/tutor_image.svg"
            alt="AI tutor illustration"
            width={110}
            height={110}
            priority
            className="select-none md:!h-[138px] md:!w-[138px]"
          />

          {/* ── Upload cards container ──
               Mobile : stacked column, white/50 card wrapper
               Desktop: side-by-side row, 789px wide, each card ~181px tall
          */}
          <div className="flex w-full max-w-[789px] flex-col gap-3 rounded-3xl bg-white/50 p-3 md:flex-row md:gap-4">
            <UploadCard
              label="Question Paper"
              file={questionPaperFile}
              onFileSelect={setQuestionPaperFile}
            />
            <UploadCard
              label="Answer Sheet"
              file={answerSheetFile}
              onFileSelect={setAnswerSheetFile}
            />
          </div>

          {/* ── CTA ── */}
          <div className="flex flex-col items-center gap-3">
            <button
              disabled={!bothUploaded}
              onClick={handleStartMapping}
              className="font-heading flex h-11 items-center justify-center gap-2 rounded-full border-2 border-white/15 bg-[#303030] py-3 pr-5 pl-6 text-[14px] font-medium tracking-[-0.56px] text-white transition-all enabled:cursor-pointer enabled:shadow-[0_4px_16px_rgba(48,48,48,0.25)] disabled:cursor-not-allowed disabled:opacity-25"
            >
              Start Mapping
              <ArrowRight size={20} strokeWidth={2} />
            </button>

            <p className="font-heading max-w-[340px] text-center text-[14px] leading-[22px] tracking-[-0.56px] text-[rgba(94,94,94,0.8)] md:max-w-none">
              Once both files are uploaded, you&apos;ll able to map answers with
              questions
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
