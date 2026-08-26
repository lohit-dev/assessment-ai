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
  { top: "6px", left: "50%", transform: "translateX(-50%)" },
  { top: "42px", left: "6px" },
  { top: "42px", right: "6px" },
  { bottom: "14px", left: "16px" },
  { bottom: "14px", right: "16px" },
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
          {/* Mobile heading: bold, two lines */}
          <h1
            className="text-center text-[22px] leading-tight md:hidden"
            style={{
              fontFamily: "var(--font-bricolage)",
              fontWeight: 700,
              color: "#303030",
            }}
          >
            Upload <u>Q</u>uestion Paper
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
              className="inline-block rounded-[10px] px-3 py-0.5"
              style={{
                color: "#FF6A2B",
                backgroundColor: "#FFE5D6",
              }}
            >
              Question Paper &amp; Answer Sheets
            </span>
          </h1>

          {/* Desktop subheading: #303030, font weight 400, Bricolage */}
          <p
            className="mt-2 text-center text-[15px]"
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
            style={{ width: 140, height: 140 }}
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
                background: "rgba(255, 106, 43, 0.16)",
              }}
            />
            {/* Layer 3 — white ring */}
            <div
              className="absolute rounded-full bg-white"
              style={{ inset: 18 }}
            />
            {/* Layer 4 — image circle */}
            <div
              className="absolute overflow-hidden rounded-full bg-[#fdf6f0]"
              style={{ inset: 22 }}
            >
              <Image
                src="/assets/tutor_image.svg"
                alt="AI tutor illustration"
                fill
                sizes="96px"
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
            className="flex w-full max-w-[700px] flex-col gap-3 p-3 sm:flex-row sm:gap-4 sm:p-4"
            style={{
              backgroundColor: "#FFFFFF80",
              borderRadius: 24,
              border: "1px solid rgba(255, 255, 255, 0.7)",
            }}
          >
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

          {/* CTA Button — pill shape */}
          <button
            disabled={!bothUploaded}
            onClick={handleStartMapping}
            className="mt-6 flex items-center justify-center gap-2 rounded-full px-8 py-3 text-[14px] font-semibold text-white transition-all"
            style={{
              fontFamily: "var(--font-bricolage)",
              backgroundColor: bothUploaded ? "#303030" : "#C5C5C5",
              cursor: bothUploaded ? "pointer" : "not-allowed",
              boxShadow: bothUploaded
                ? "0 4px 16px rgba(48, 48, 48, 0.2)"
                : "none",
            }}
          >
            Start Mapping
            <ArrowRight size={16} strokeWidth={2.25} />
          </button>

          {/* Caption */}
          <p
            className="mt-3 max-w-[300px] text-center text-[13px] md:max-w-none"
            style={{
              fontFamily: "var(--font-inter)",
              color: "#8E8E8E",
            }}
          >
            Once both files are uploaded, you&apos;ll be able to map answers
            with questions
          </p>
        </main>
      </div>
    </div>
  );
}
