"use client";

import clsx from "clsx";

export type MobileTab = "questions" | "answers";

interface MobileTabToggleProps {
  activeTab: MobileTab;
  onChange: (tab: MobileTab) => void;
}

/**
 * Mobile-only pill toggle that switches between "Questions" and "Answer Sheet"
 * views. Matches the Figma design: a pill container with a sliding dark active
 * state and a lighter inactive label.
 */
export default function MobileTabToggle({
  activeTab,
  onChange,
}: MobileTabToggleProps) {
  return (
    <div className="flex w-full shrink-0 items-center rounded-full bg-[#f6f6f6] p-1 md:hidden">
      <button
        onClick={() => onChange("questions")}
        className={clsx(
          "font-heading flex-1 rounded-full py-2.5 text-[15px] leading-none font-semibold tracking-[-0.6px] transition-all duration-200",
          activeTab === "questions"
            ? "bg-[#303030] text-white shadow-sm"
            : "text-[rgba(94,94,94,0.8)] hover:text-[#303030]"
        )}
      >
        Questions
      </button>
      <button
        onClick={() => onChange("answers")}
        className={clsx(
          "font-heading flex-1 rounded-full py-2.5 text-[15px] leading-none font-semibold tracking-[-0.6px] transition-all duration-200",
          activeTab === "answers"
            ? "bg-[#303030] text-white shadow-sm"
            : "text-[rgba(94,94,94,0.8)] hover:text-[#303030]"
        )}
      >
        Answer Sheet
      </button>
    </div>
  );
}
