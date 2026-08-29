"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { getPageCount } from "@/lib/getPageCount";

interface UploadCardProps {
  label: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  maxSizeMb?: number;
  accept?: string;
}

export default function UploadCard({
  label,
  file,
  onFileSelect,
  maxSizeMb = 10,
  accept = ".pdf,.png,.jpg,.jpeg",
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    if (!file) {
      setPageCount(null);
      return;
    }
    let cancelled = false;
    getPageCount(file)
      .then((n) => {
        if (!cancelled) setPageCount(n);
      })
      .catch(() => {
        if (!cancelled) setPageCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  function handleFiles(fileList: FileList | null) {
    const picked = fileList?.[0];
    if (!picked) return;
    if (picked.size > maxSizeMb * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMb}MB`);
      return;
    }
    setError(null);
    onFileSelect(picked);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !file && inputRef.current?.click()}
      className={clsx(
        "relative flex w-full flex-1 flex-col items-center justify-center gap-3",
        "min-h-[120px] rounded-[20px] border-[1.5px] border-dashed bg-white",
        "px-4 py-5 text-center transition-all",
        "md:min-h-[181px]",
        isDragging
          ? "cursor-copy border-[#ff5623] bg-[rgba(255,147,80,0.05)]"
          : file
            ? "cursor-default border-[#cecece]"
            : "cursor-pointer border-[#cecece] hover:border-gray-400"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* ── Empty state ── */}
      {!file && (
        <>
          {/* Upload icon box */}
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#f3f3f3] md:size-12">
            <svg
              className="text-[#303030]"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="16 6 12 2 8 6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="2"
                x2="12"
                y2="15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Label + size hint */}
          <div className="flex flex-col items-center gap-0.5">
            <p className="font-heading text-[18px] leading-[22px] font-semibold tracking-[-0.06em] text-[#303030] md:text-[20px]">
              Upload <span className="text-[#ff5623]">{label}</span>
            </p>
            <p className="font-heading text-[12px] leading-[1.4] tracking-[-0.06em] text-[rgba(94,94,94,0.55)] md:text-[14px]">
              Max {maxSizeMb}MB
            </p>
          </div>
        </>
      )}

      {/* ── Filled state ── */}
      {file && (
        <div className="relative w-full">
          {/* File pill */}
          <div className="flex items-center gap-3 rounded-xl bg-[#f6f6f6] py-3 pr-4 pl-3">
            {/* Document thumbnail SVG */}
            <div className="shrink-0">
              <svg
                width="35"
                height="40"
                viewBox="0 0 35 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <rect width="35" height="40" rx="4" fill="#E8E8E8" />
                <path
                  d="M8 13h19M8 18h14M8 23h10"
                  stroke="#A0A0A0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <rect
                  x="21"
                  y="26"
                  width="10"
                  height="11"
                  rx="2"
                  fill="#ff5623"
                />
                <text
                  x="26"
                  y="33.5"
                  textAnchor="middle"
                  fontSize="4.5"
                  fontWeight="700"
                  fill="white"
                  fontFamily="sans-serif"
                >
                  PDF
                </text>
              </svg>
            </div>

            {/* File name + meta */}
            <div className="min-w-0 flex-1 text-left">
              <p className="font-heading max-w-[160px] truncate text-[13px] leading-[1.4] font-bold tracking-[-0.04em] text-[#2b2b2b] md:max-w-[200px] md:text-[16px]">
                {file.name}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] leading-[1.4] tracking-[-0.04em] text-[rgba(94,94,94,0.8)] md:gap-2 md:text-[14px]">
                <span>{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                <span className="size-[4px] rounded-full bg-[rgba(94,94,94,0.8)]" />
                <span>
                  {pageCount != null ? pageCount : "…"} Page
                  {pageCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          {/* Remove button: dark circle pinned to top-right of pill */}
          <button
            aria-label={`Remove ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute -top-2.5 -right-2.5 flex size-[26px] items-center justify-center rounded-full bg-[rgba(43,43,43,0.8)] text-white shadow-[0_4px_11px_0_rgba(0,0,0,0.25)] transition-colors hover:bg-[rgba(43,43,43,0.95)]"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
