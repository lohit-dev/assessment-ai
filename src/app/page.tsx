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
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-72 left-1/3 h-[428px] w-[1318px] rounded-full bg-[radial-gradient(closest-side,rgba(255,147,80,0.10),transparent)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-84 left-1/2 h-[428px] w-[1113px] rounded-full bg-[radial-gradient(closest-side,rgba(255,86,35,0.08),transparent)] blur-3xl"
      />

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

        <main className="flex flex-1 flex-col items-center justify-center px-4 pt-4 pb-8">
          <h1 className="font-heading text-heading text-center text-2xl leading-tight font-bold md:hidden">
            Upload{" "}
            <span className="decoration-accent underline decoration-2 underline-offset-3">
              Q
            </span>
            uestion Paper
            <br />
            &amp; Answer Sheets
          </h1>

          <h1 className="font-heading text-heading hidden text-center text-[40px] leading-tight font-bold tracking-[-1.6px] md:block">
            Upload{" "}
            <span className="bg-accent-100 text-accent inline-block rounded-lg px-2 py-1">
              <span className="decoration-accent underline decoration-2 underline-offset-4">
                Q
              </span>
              uestion Paper &amp; Answer Sheets
            </span>
          </h1>

          <p className="font-heading text-body mt-1.5 text-center text-[20px] font-normal tracking-[-0.8px]">
            Upload both files to get started
          </p>

          <div className="my-3 flex items-center justify-center">
            <Image
              src="/assets/tutor_image.svg"
              alt="AI tutor illustration"
              width={88}
              height={88}
              priority
              className="select-none"
            />
          </div>

          <div className="flex w-full max-w-2xl flex-col gap-4 rounded-3xl bg-white/50 p-3 sm:flex-row">
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

          <button
            disabled={!bothUploaded}
            onClick={handleStartMapping}
            className="font-heading bg-body mt-4 flex h-11 items-center justify-center gap-2 rounded-full border-2 border-white/15 py-3 pr-5 pl-6 text-sm font-medium tracking-[-0.56px] text-white transition-all enabled:cursor-pointer enabled:shadow-[0_4px_16px_rgba(48,48,48,0.25)] disabled:cursor-not-allowed disabled:opacity-25"
          >
            Start Mapping
            <ArrowRight size={20} strokeWidth={2} />
          </button>

          <p className="font-heading mt-2.5 max-w-85 text-center text-sm tracking-[-0.84px] text-[rgba(94,94,94,0.8)] md:max-w-none">
            Once both files are uploaded, you&apos;ll able to map answers with
            questions
          </p>
        </main>
      </div>
    </div>
  );
}
