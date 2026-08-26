// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import UploadCard from "@/components/UploadCard";
import { useAssessmentStore } from "@/store/useAssessmentStore";

export default function UploadPage() {
  const router = useRouter();
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
    <div className="flex min-h-screen bg-[#f4f4f5]">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <TopBar />

        <main className="flex flex-1 flex-col items-center px-4 py-8 md:px-6 md:py-16">

          {/* Mobile heading: bold, no decoration, two lines */}
          <h1 className="font-heading text-[22px] font-bold text-center leading-tight md:hidden">
            Upload Question Paper<br />&amp; Answer Sheets
          </h1>

          {/* Desktop heading: orange highlight pill */}
          <h1 className="hidden font-heading text-4xl font-semibold text-center md:block">
            Upload{" "}
            <span className="rounded-lg bg-accent-100 px-2 text-accent">
              Question Paper &amp; Answer Sheets
            </span>
          </h1>

          {/* Avatar with peach glow ring */}
          <div className="relative my-6 flex h-32 w-32 items-center justify-center md:my-10 md:h-44 md:w-44">
            {/* Outermost soft glow */}
            <div className="absolute inset-0 rounded-full bg-accent/10" />
            {/* Middle ring — thicker peach band */}
            <div className="absolute inset-3 rounded-full bg-accent/20" />
            {/* White gap ring */}
            <div className="absolute inset-5 rounded-full bg-white" />
            {/* Image circle */}
            <div className="absolute inset-6 overflow-hidden rounded-full bg-gray-100">
              <Image
                src="/assets/tutor_image.svg"
                alt="AI tutor illustration"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>

          {/* Upload cards — vertical stack on mobile, side-by-side on sm+ */}
          <div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:gap-6">
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

          {/* CTA — full-width pill on mobile */}
          <button
            disabled={!bothUploaded}
            onClick={handleStartMapping}
            className="mt-6 flex w-full max-w-3xl items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium text-white transition-colors
              disabled:cursor-not-allowed disabled:bg-gray-300
              enabled:bg-[color:var(--color-ink)] enabled:hover:bg-black
              sm:w-auto sm:px-10 md:mt-10"
          >
            Start Mapping
            <ArrowRight size={16} />
          </button>

          <p className="mt-3 max-w-xs text-center text-sm font-normal text-gray-400 md:max-w-none">
            Once both files are uploaded, you&apos;ll be able to map answers with questions
          </p>
        </main>
      </div>
    </div>
  );
}
