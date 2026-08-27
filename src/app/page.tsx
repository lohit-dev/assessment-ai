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
    <div className="flex min-h-screen bg-gradient-to-b from-[#F5F5F5] to-[#E9E5E5] p-3 md:p-4">
      <Sidebar />

      <div className="flex flex-1 flex-col gap-3 md:ml-82">
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

          <p className="font-heading text-body mt-1.5 text-center text-base font-normal">
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

          <div className="flex w-full max-w-2xl flex-col gap-2.5 rounded-3xl border border-white/70 bg-white/50 p-2.5 sm:flex-row">
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
            className="font-heading bg-body mt-4 flex h-11 items-center justify-center gap-2 rounded-full border-2 border-white/15 py-3 pr-5 pl-6 text-sm font-semibold text-white transition-all enabled:cursor-pointer enabled:shadow-[0_4px_16px_rgba(48,48,48,0.25)] disabled:cursor-not-allowed disabled:opacity-25"
          >
            Start Mapping
            <ArrowRight size={16} strokeWidth={2.25} />
          </button>

          <p className="mt-2.5 max-w-85 text-center font-sans text-xs text-[#8E8E8E] md:max-w-none">
            Once both files are uploaded, you&apos;ll able to map answers with
            questions
          </p>
        </main>
      </div>
    </div>
  );
}
