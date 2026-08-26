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
    <div
      className="flex min-h-screen p-3 md:p-4"
      style={{
        background: "linear-gradient(180deg, #F5F5F5 0%, #E9E5E5 100%)",
      }}
    >
      <Sidebar />

      <div className="flex flex-1 flex-col gap-3 md:ml-82">
        <TopBar />

        <main className="flex flex-1 flex-col items-center justify-center px-4 pt-4 pb-8">
          <h1
            className="text-center text-2xl leading-tight md:hidden"
            style={{
              fontFamily: "var(--font-bricolage)",
              fontWeight: 700,
              color: "#303030",
            }}
          >
            Upload{" "}
            <span className="underline decoration-[#FF6A2B] decoration-2 underline-offset-3">
              Q
            </span>
            uestion Paper
            <br />
            &amp; Answer Sheets
          </h1>

          <h1
            className="hidden text-center leading-tight md:block"
            style={{
              fontFamily: "var(--font-bricolage)",
              fontWeight: 700,
              color: "#303030",
              fontSize: 34,
            }}
          >
            Upload{" "}
            <span
              className="inline-block rounded-xl px-3 py-0.5"
              style={{
                color: "#FF6A2B",
                backgroundColor: "#FFE5D6",
              }}
            >
              <span className="underline decoration-[#FF6A2B] decoration-2 underline-offset-4">
                Q
              </span>
              uestion Paper &amp; Answer Sheets
            </span>
          </h1>

          <p
            className="mt-1.5 text-center text-base"
            style={{
              fontFamily: "var(--font-bricolage)",
              fontWeight: 400,
              color: "#303030",
            }}
          >
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

          <div
            className="flex w-full max-w-2xl flex-col gap-2.5 p-2.5 sm:flex-row"
            style={{
              backgroundColor: "#FFFFFF80",
              borderRadius: 24,
              border: "1px solid rgba(255, 255, 255, 0.7)",
            }}
          >
            <UploadCard
              label="Question Paper"
              isQuestionPaper={true}
              file={questionPaperFile}
              onFileSelect={setQuestionPaperFile}
            />
            <UploadCard
              label="Answer Sheet"
              isQuestionPaper={false}
              file={answerSheetFile}
              onFileSelect={setAnswerSheetFile}
            />
          </div>

          <button
            disabled={!bothUploaded}
            onClick={handleStartMapping}
            className="mt-4 flex h-11 items-center justify-center gap-2 rounded-full py-3 pr-5 pl-6 text-sm font-semibold text-white transition-all"
            style={{
              fontFamily: "var(--font-bricolage)",
              backgroundColor: "#303030",
              border: "2px solid #FFFFFF26",
              borderRadius: 64,
              opacity: bothUploaded ? 1 : 0.25,
              cursor: bothUploaded ? "pointer" : "not-allowed",
              boxShadow: bothUploaded
                ? "0 4px 16px rgba(48, 48, 48, 0.25)"
                : "none",
            }}
          >
            Start Mapping
            <ArrowRight size={16} strokeWidth={2.25} />
          </button>

          <p
            className="mt-2.5 max-w-85 text-center text-xs md:max-w-none"
            style={{
              fontFamily: "var(--font-inter)",
              color: "#8E8E8E",
            }}
          >
            Once both files are uploaded, you&apos;ll able to map answers with
            questions
          </p>
        </main>
      </div>
    </div>
  );
}
