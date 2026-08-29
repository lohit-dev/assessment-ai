"use client";

import { useState } from "react";
import QuestionItem from "@/components/QuestionItem";
import type { MappedQuestion, GradeResult } from "@/types";

interface QuestionListProps {
  mapped: MappedQuestion[];
  selectedQuestionId: string | null;
  grades: Record<string, GradeResult>;
  gradingIds: Set<string>;
  onSelectQuestion: (questionId: string) => void;
}

export default function QuestionList({
  mapped,
  selectedQuestionId,
  grades,
  gradingIds,
  onSelectQuestion,
}: QuestionListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  function handleSelect(questionId: string) {
    onSelectQuestion(questionId);
    setExpandedIds((prev) => {
      if (prev.has(questionId)) return prev;
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  }

  function toggleExpand(questionId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  function handleExpandAll() {
    if (allExpanded) {
      setExpandedIds(new Set());
      setAllExpanded(false);
    } else {
      setExpandedIds(new Set(mapped.map((m) => m.question.questionId)));
      setAllExpanded(true);
    }
  }

  return (
    /* Outer container: half-white backdrop, rounded, flex column */
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden rounded-[20px] bg-white/50 p-4 md:max-w-[672px] md:flex-none">
      {/* Header row */}
      <div className="flex w-full shrink-0 items-center justify-between gap-2">
        <p className="font-heading text-[14px] leading-[1.4] font-bold tracking-[-0.56px] text-[#303030] md:text-[16px] md:tracking-[-0.64px]">
          Extracted Questions{" "}
          <span className="hidden text-[#303030] md:inline">
            (from question paper)
          </span>
        </p>
        <button
          onClick={handleExpandAll}
          className="font-heading shrink-0 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium tracking-[-0.52px] text-[#181818] shadow-sm transition-colors hover:bg-gray-50 md:px-5 md:py-2.5 md:text-[14px] md:tracking-[-0.56px]"
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* Scrollable question list */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-0.5">
        {mapped.map((m) => (
          <QuestionItem
            key={m.question.questionId}
            mapped={m}
            isSelected={selectedQuestionId === m.question.questionId}
            isExpanded={expandedIds.has(m.question.questionId)}
            grade={grades[m.question.questionId]}
            isGrading={gradingIds.has(m.question.questionId)}
            onSelect={() => handleSelect(m.question.questionId)}
            onToggleExpand={() => toggleExpand(m.question.questionId)}
          />
        ))}
      </div>
    </div>
  );
}
