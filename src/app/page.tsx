// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import UploadCard from "@/components/UploadCard";
import { useAssessmentStore } from "@/store/useAssessmentStore";

/** Mini icon badges orbiting on the avatar ring matching Figma */
const AVATAR_BADGES = [
  { top: "8px", left: "50%", transform: "translateX(-50%)" },
  { top: "42px", left: "6px" },
  { top: "42px", right: "6px" },
  { bottom: "16px", left: "18px" },
  { bottom: "16px", right: "18px" },
];

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

      {/* Right column — offset by fixed sidebar width on desktop */}
      <div className="flex flex-1 flex-col gap-3 md:ml-[328px]">
        {/* TopBar: standalone elevated card */}
        <TopBar />

        {/* Main: no card background, sits directly on gradient */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-6 md:py-8">
          {/* Mobile heading */}
          <h1
            className="text-center text-[24px] leading-tight md:hidden"
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

          {/* Desktop heading: orange highlight pill */}
          <h1
            className="hidden text-center text-[34px] leading-tight md:block"
            style={{
              fontFamily: "var(--font-bricolage)",
              fontWeight: 700,
              color: "#303030",
            }}
          >
            Upload{" "}
            <span
              className="inline-block rounded-[12px] px-3.5 py-1"
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

          {/* Desktop subheading */}
          <p
            className="mt-2 text-center text-[16px]"
            style={{
              fontFamily: "var(--font-bricolage)",
              fontWeight: 400,
              color: "#303030",
            }}
          >
            Upload both files to get started
          </p>

          {/* Avatar with peach glow rings and orbiting badges */}
          <div
            className="relative my-6 flex items-center justify-center md:my-8"
            style={{ width: 148, height: 148 }}
          >
            {/* Layer 1 — outermost soft glow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(255, 106, 43, 0.08)" }}
            />
            {/* Layer 2 — middle peach ring */}
            <div
              className="absolute rounded-full"
              style={{
                inset: 10,
                background: "rgba(255, 106, 43, 0.18)",
              }}
            />
            {/* Layer 3 — white ring */}
            <div
              className="absolute rounded-full bg-white shadow-xs"
              style={{ inset: 20 }}
            />
            {/* Layer 4 — image circle */}
            <div
              className="absolute overflow-hidden rounded-full bg-[#fdf6f0]"
              style={{ inset: 24 }}
            >
              <Image
                src="/assets/tutor_image.svg"
                alt="AI tutor illustration"
                fill
                sizes="100px"
                className="object-cover object-top"
                priority
              />
            </div>

            {/* Orbiting peach/orange icon dots */}
            {AVATAR_BADGES.map((pos, i) => (
              <span
                key={i}
                className="absolute flex items-center justify-center rounded-full shadow-xs"
                style={{
                  width: 14,
                  height: 14,
                  backgroundColor: "#FF7950",
                  border: "2px solid white",
                  ...pos,
                }}
              />
            ))}
          </div>

          {/* Upload cards outer container: bg #FFFFFF80 (white-50) */}
          <div
            className="flex w-full max-w-[720px] flex-col gap-3 p-3 sm:flex-row sm:gap-4 sm:p-4"
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

          {/* CTA Button — Primary Button Dark */}
          <button
            disabled={!bothUploaded}
            onClick={handleStartMapping}
            className="mt-7 flex h-[44px] items-center justify-center gap-2 rounded-full py-3 pr-5 pl-6 text-[14px] font-semibold text-white transition-all"
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

          {/* Caption */}
          <p
            className="mt-3.5 max-w-[340px] text-center text-[13px] md:max-w-none"
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
