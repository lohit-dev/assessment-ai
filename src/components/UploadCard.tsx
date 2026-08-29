"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
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
    if (!file) return;
    let cancelled = false;
    getPageCount(file)
      .then((count) => {
        if (!cancelled) setPageCount(count);
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
        "relative flex h-32 w-full flex-1 flex-col items-center justify-center overflow-visible rounded-[20px] border-[1.5px] border-dashed bg-white px-6 py-4 text-center transition-all md:h-[181px]",
        isDragging
          ? "border-accent bg-accent-50 cursor-copy"
          : file
            ? "border-accent/50 cursor-default"
            : "border-hairline cursor-pointer hover:border-gray-400"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!file ? (
        <>
          <div className="bg-surface-muted mb-4 flex size-12 items-center justify-center rounded-lg transition-transform hover:scale-105">
            <Upload size={24} strokeWidth={2} className="text-body" />
          </div>
          <p className="font-heading text-body text-xl leading-snug font-semibold tracking-[-1.2px]">
            Upload <span className="text-accent">{label}</span>
          </p>
          <p className="mt-0.5 font-sans text-sm font-normal tracking-[-0.84px] text-[#5E5E5E8C]">
            Max {maxSizeMb}MB
          </p>
        </>
      ) : (
        <div className="relative">
          <div className="bg-surface-soft flex items-center gap-3 rounded-xl py-3 pr-5 pl-3">
            <div className="flex h-10 w-[35px] shrink-0 items-center justify-center rounded-md bg-red-50 text-red-500">
              <FileText size={18} strokeWidth={1.75} />
            </div>
            <div className="text-left">
              <p className="font-heading text-heading max-w-45 truncate text-[16px] leading-[1.4] font-bold tracking-[-0.64px]">
                {file.name}
              </p>
              <div className="flex items-center gap-2 text-[14px] leading-[1.4] tracking-[-0.56px] text-[rgba(94,94,94,0.8)]">
                <span>{(file.size / 1024 / 1024).toFixed(0)}MB</span>
                <span className="size-[5px] rounded-full bg-[rgba(94,94,94,0.8)]" />
                <span>
                  {pageCount ?? "…"} Page{pageCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          <button
            aria-label={`Remove ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute top-0 right-0 flex size-6.5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(43,43,43,0.8)] text-white shadow-[0_4px_11px_0_rgba(0,0,0,0.25)] transition-colors hover:bg-[rgba(43,43,43,0.95)]"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
