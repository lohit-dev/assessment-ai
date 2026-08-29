"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { RenderedPage } from "@/lib/pdf/client";
import type { AnswerRegion, Question } from "@/types";

interface AnswerSheetViewerProps {
  pages: RenderedPage[];
  isLoadingPages: boolean;
  selectedQuestion: Question | null;
  selectedRegions: AnswerRegion[];
}

export default function AnswerSheetViewer({
  pages,
  isLoadingPages,
  selectedQuestion,
  selectedRegions,
}: AnswerSheetViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [visiblePage, setVisiblePage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const totalPages = pages.length;

  // Jump to the first matched page whenever the selected question changes
  useEffect(() => {
    if (selectedRegions.length === 0) return;
    const targetPage = selectedRegions[0].page;
    const el = pageRefs.current.get(targetPage);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedRegions]);

  function scrollToPage(page: number) {
    const el = pageRefs.current.get(page);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /** Short label like "Q2" rendered above highlighted regions */
  const shortLabel = selectedQuestion
    ? `Q${selectedQuestion.displayNumber.replace(/^q\.?\s*/i, "").replace(/\s+/g, "")}`
    : "";

  return (
    /* Outer card: white bg, rounded, flex column, fills remaining width */
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[20px] border-[1.25px] border-[#cecece]/60 bg-white">
      {/* ── Header bar (dark #303030 background) ── */}
      <div className="flex h-14 w-full shrink-0 items-center justify-between gap-2 bg-[#303030] px-4 py-3 md:h-16 md:px-6">
        <p className="font-heading shrink-0 text-[14px] font-bold tracking-[-0.56px] text-white/80 md:text-[16px] md:tracking-[-0.64px]">
          Answer Sheet
        </p>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Zoom controls */}
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-2 py-1.5 md:gap-2 md:px-3 md:py-2">
            <button
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="text-white transition-opacity hover:opacity-75"
            >
              <Minus size={16} />
            </button>
            <span className="font-heading w-8 text-center text-[13px] font-bold tracking-[-0.52px] text-white md:w-10 md:text-[14px]">
              {zoom}%
            </span>
            <button
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="text-white transition-opacity hover:opacity-75"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Page navigation */}
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-2 py-1.5 md:gap-2 md:px-3 md:py-2">
            <button
              aria-label="Previous page"
              onClick={() => scrollToPage(Math.max(1, visiblePage - 1))}
              disabled={visiblePage <= 1}
              className="text-white transition-opacity hover:opacity-75 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-heading text-[13px] font-bold tracking-[-0.52px] whitespace-nowrap text-white md:text-[14px]">
              <span className="md:hidden">
                {visiblePage}/{totalPages || 1}
              </span>
              <span className="hidden md:inline">
                Page {visiblePage} of {totalPages || 1}
              </span>
            </span>
            <button
              aria-label="Next page"
              onClick={() =>
                scrollToPage(Math.min(totalPages, visiblePage + 1))
              }
              disabled={visiblePage >= totalPages}
              className="text-white transition-opacity hover:opacity-75 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable page area ── */}
      <div
        ref={containerRef}
        className="flex flex-1 flex-col items-center gap-2.5 overflow-y-auto bg-[#e5e5e5] p-2.5"
        onScroll={() => {
          const container = containerRef.current;
          if (!container) return;
          let closest = 1;
          let closestDist = Infinity;
          pageRefs.current.forEach((el, page) => {
            const dist = Math.abs(
              el.getBoundingClientRect().top -
                container.getBoundingClientRect().top
            );
            if (dist < closestDist) {
              closestDist = dist;
              closest = page;
            }
          });
          setVisiblePage(closest);
        }}
      >
        {isLoadingPages && (
          <div className="flex h-full w-full flex-1 items-center justify-center text-sm text-gray-400">
            Rendering answer sheet…
          </div>
        )}

        {!isLoadingPages &&
          pages.map((p) => {
            const regionsOnThisPage = selectedRegions.filter(
              (r) => r.page === p.page
            );
            return (
              <div
                key={p.page}
                ref={(el) => {
                  if (el) pageRefs.current.set(p.page, el);
                  else pageRefs.current.delete(p.page);
                }}
                className="relative shrink-0 overflow-hidden rounded-2xl shadow-sm"
                style={{ width: `${zoom}%`, maxWidth: 660 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.dataUrl}
                  alt={`Answer sheet page ${p.page}`}
                  className="block w-full"
                  draggable={false}
                />

                {/* Green highlighted region overlays */}
                {regionsOnThisPage.map((region) => (
                  <div
                    key={region.regionId}
                    className="absolute rounded-2xl border-2 border-[#3dd218] bg-[rgba(94,255,53,0.1)]"
                    style={{
                      left: `${region.boundingBox.x * 100}%`,
                      top: `${region.boundingBox.y * 100}%`,
                      width: `${region.boundingBox.width * 100}%`,
                      height: `${region.boundingBox.height * 100}%`,
                    }}
                  >
                    {/* Question label tab above the box */}
                    <span className="absolute -top-[26px] left-3 rounded-t-xl bg-[#34ac15] px-3 py-1 text-[14px] font-bold tracking-[-0.56px] text-white">
                      {shortLabel}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}

        {!isLoadingPages && pages.length === 0 && (
          <div className="flex h-full w-full flex-1 items-center justify-center text-sm text-gray-400">
            No pages to display.
          </div>
        )}
      </div>
    </div>
  );
}
