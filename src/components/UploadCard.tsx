// src/components/UploadCard.tsx
"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import clsx from "clsx";

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
        "flex w-full flex-1 flex-col items-center justify-center text-center transition-all",
        "h-[180px] sm:h-[190px] px-6 py-6",
        file
          ? "cursor-default"
          : isDragging
            ? "bg-[#FFF8F5] cursor-copy"
            : "cursor-pointer hover:border-gray-400"
      )}
      style={{
        backgroundColor: isDragging ? "#FFF8F5" : "#FFFFFF",
        border: `1.5px dashed ${isDragging ? "#FF6A2B" : file ? "#FF6A2B80" : "#CECECE"}`,
        borderRadius: 16,
      }}
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
          {/* Upload icon box */}
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
            style={{ background: "#F6F6F6" }}
          >
            <Upload size={18} strokeWidth={2} style={{ color: "#303030" }} />
          </div>
          <p
            className="text-[15px] leading-snug"
            style={{
              fontFamily: "var(--font-bricolage)",
              fontWeight: 600,
              color: "#303030",
            }}
          >
            Upload <span style={{ color: "#FF6A2B" }}>{label}</span>
          </p>
          <p
            className="mt-1 text-[13px]"
            style={{
              fontFamily: "var(--font-inter)",
              color: "#8E8E8E",
            }}
          >
            Max {maxSizeMb}MB
          </p>
        </>
      ) : (
        <div className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-[#F9F9F9] px-3.5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <FileText size={17} strokeWidth={1.75} />
            </div>
            <div className="text-left">
              <p
                className="max-w-[140px] truncate text-[13.5px] font-semibold"
                style={{
                  fontFamily: "var(--font-bricolage)",
                  color: "#303030",
                }}
              >
                {file.name}
              </p>
              <p className="text-[12px] text-gray-400">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          <button
            aria-label={`Remove ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-[12px] text-red-500">{error}</p>}
    </div>
  );
}
