"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { RenderedPage } from "@/lib/renderPdfPages";
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

  // Jump to the first matched page whenever the selected question changes.
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

  const shortLabel = selectedQuestion
    ? `Q${selectedQuestion.displayNumber.replace(/^q\.?\s*/i, "").replace(/\s+/g, "")}`
    : "";

  return (
    <div className="border-hairline/60 flex h-full flex-1 flex-col overflow-hidden rounded-[20px] border-[1.25px] bg-white">
      <div className="bg-body flex h-16 w-full shrink-0 items-center justify-between px-6 py-3">
        <p className="font-heading text-[16px] font-bold tracking-[-0.64px] text-white/80">
          Answer Sheet
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2">
            <button
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="text-white transition-opacity hover:opacity-75"
            >
              <Minus size={16} />
            </button>
            <span className="font-heading w-9 text-center text-[14px] font-bold tracking-[-0.56px] text-white">
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

          <div className="flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2">
            <button
              aria-label="Previous page"
              onClick={() => scrollToPage(Math.max(1, visiblePage - 1))}
              disabled={visiblePage <= 1}
              className="text-white transition-opacity hover:opacity-75 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-heading text-[14px] font-bold tracking-[-0.56px] text-white">
              Page {visiblePage} of {totalPages || 1}
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

      <div
        ref={containerRef}
        className="flex flex-1 flex-col items-center gap-2.5 overflow-y-auto bg-[#e5e5e5] p-2.5"
        onScroll={() => {
          // report the page nearest the top of the viewport as "visible"
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
