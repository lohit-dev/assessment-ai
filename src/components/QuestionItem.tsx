"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import type { MappedQuestion, GradeResult } from "@/types";

interface QuestionItemProps {
  mapped: MappedQuestion;
  isSelected: boolean;
  isExpanded: boolean;
  grade: GradeResult | undefined;
  isGrading: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}

/**
 * Splits "11 (a)" -> { main: "11", sub: "a." }; "7" -> { main: "7", sub: null }.
 * Strips a leading "Q"/"Q." prefix so the badge always shows a bare number.
 */
function parseDisplayNumber(displayNumber: string): {
  main: string;
  sub: string | null;
} {
  const stripped = displayNumber.replace(/^q\.?\s*/i, "").trim();
  const match = stripped.match(/^(\d+)\s*\(?\s*([a-zA-Z])\)?\.?\s*$/);
  if (match) return { main: match[1], sub: `${match[2].toLowerCase()}.` };
  const bare = stripped.match(/^(\d+)\.?\s*$/);
  if (bare) return { main: bare[1], sub: null };
  return { main: stripped || displayNumber, sub: null };
}

function scorePillStyle(score: number, maxScore: number) {
  if (maxScore <= 0) return { bg: "bg-[#f6f6f6]", text: "text-[#5e5e5e]" };
  const ratio = score / maxScore;
  if (ratio >= 0.8)
    return { bg: "bg-[rgba(69,181,41,0.1)]", text: "text-[#34ac15]" };
  if (ratio > 0)
    return { bg: "bg-[rgba(255,153,0,0.1)]", text: "text-[#e3600f]" };
  return { bg: "bg-[#ffe9e2]", text: "text-[#c0350a]" };
}

export default function QuestionItem({
  mapped,
  isSelected,
  isExpanded,
  grade,
  isGrading,
  onSelect,
  onToggleExpand,
}: QuestionItemProps) {
  const { question, status } = mapped;
  const { main, sub } = parseDisplayNumber(question.displayNumber);
  const isUnmatched = status === "unmatched-answer";

  const pillStyle = grade ? scorePillStyle(grade.score, grade.maxScore) : null;

  return (
    <div
      onClick={onSelect}
      className={clsx(
        "font-heading flex w-full cursor-pointer flex-col items-start gap-3 rounded-2xl p-3 transition-all",
        isSelected && !isUnmatched
          ? "border-accent border-2 bg-white shadow-sm"
          : "border border-transparent bg-white",
        isUnmatched && "border border-dashed border-gray-300 bg-white"
      )}
    >
      {/* Row: badge + question text + score pill + chevron */}
      <div className="flex w-full items-center gap-4">
        {/* Number badge(s) */}
        <div className="flex shrink-0 items-center gap-2">
          <div
            className={clsx(
              "flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white/25 text-[20px] font-extrabold tracking-[-0.8px] text-white",
              "shadow-[0_8px_8.8px_0_rgba(134,134,134,0.1),0_4px_16px_0_rgba(67,67,67,0.1)]",
              isSelected && !isUnmatched
                ? "bg-accent shadow-[0_8px_4.4px_rgba(255,121,80,0.1)]"
                : "bg-[rgba(43,43,43,0.8)]"
            )}
          >
            {isUnmatched ? "?" : main}
          </div>
          {sub && !isUnmatched && (
            <div className="bg-surface-soft text-body flex size-8 shrink-0 items-center justify-center rounded-full text-[16px] font-bold tracking-[-0.64px]">
              {sub}
            </div>
          )}
        </div>

        {/* Question text */}
        <p className="text-body min-w-0 flex-1 text-[14px] leading-[1.4] tracking-[-0.56px] md:text-[16px] md:tracking-[-0.64px]">
          {isUnmatched ? (
            <>
              <span className="text-[rgba(94,94,94,0.55)]">Unrecognized: </span>
              &ldquo;{question.displayNumber}&rdquo;
            </>
          ) : (
            question.text
          )}
        </p>

        {/* Right side: score pill + chevron */}
        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          {/* Score / status pill */}
          {isUnmatched ? (
            <span className="rounded-full bg-[#ffe9e2] px-3 py-1 text-[14px] font-bold tracking-[-0.56px] text-[#c0350a]">
              Unmatched
            </span>
          ) : status === "unanswered" ? (
            <span className="bg-surface-soft rounded-full px-3 py-1 text-[14px] font-bold tracking-[-0.56px] text-[rgba(94,94,94,0.8)]">
              —
            </span>
          ) : isGrading ? (
            <span className="bg-surface-soft rounded-full px-3 py-1 text-[14px] font-bold tracking-[-0.56px] text-[rgba(94,94,94,0.8)]">
              …
            </span>
          ) : grade ? (
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-[16px] font-bold tracking-[-0.64px]",
                pillStyle!.bg,
                pillStyle!.text
              )}
            >
              {grade.score}&nbsp;/&nbsp;{grade.maxScore}
            </span>
          ) : null}

          {/* Expand / collapse chevron – shown when there's feedback or question is unanswered */}
          {!isUnmatched && (grade?.feedback || status === "unanswered") && (
            <button
              aria-label={isExpanded ? "Collapse" : "Expand"}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
                onToggleExpand();
              }}
              className="bg-surface-soft flex items-center justify-center rounded-lg p-1 transition-colors hover:bg-gray-200"
            >
              {isExpanded ? (
                <ChevronUp size={20} className="text-body" />
              ) : (
                <ChevronDown size={20} className="text-body" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded AI Feedback panel */}
      {isExpanded && grade?.feedback && (
        <div className="bg-surface-soft flex w-full flex-col gap-2.5 rounded-2xl px-4 py-4 md:px-6">
          <p className="text-body text-[16px] font-bold tracking-[-0.64px]">
            AI Feedback
          </p>
          <p className="text-body text-[14px] leading-[1.4] tracking-[-0.56px]">
            {grade.feedback}
          </p>
        </div>
      )}
    </div>
  );
}
