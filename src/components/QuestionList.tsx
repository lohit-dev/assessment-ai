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
    <div className="flex h-full w-full max-w-[672px] shrink-0 flex-col gap-4 overflow-hidden rounded-[20px] bg-white/50 p-4">
      <div className="flex w-full items-center justify-between">
        <p className="font-heading text-body text-[16px] font-bold tracking-[-0.64px]">
          Extracted Questions (from question paper)
        </p>
        <button
          onClick={handleExpandAll}
          className="font-heading rounded-full bg-white px-5 py-3 text-[14px] font-medium tracking-[-0.56px] text-[#181818] transition-colors hover:bg-gray-50"
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
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
