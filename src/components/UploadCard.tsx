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
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !file && inputRef.current?.click()}
      className={clsx(
        // Mobile: shorter (py-6), full width, softer dashed border
        // Desktop: taller (h-52), flex-1 side-by-side
        "flex w-full flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-6 py-6 text-center transition-colors",
        "sm:h-52 sm:py-0",
        file
          ? "border-accent/50"
          : "border-gray-300",
        isDragging && "border-accent bg-accent-50",
        !file && "cursor-pointer hover:border-gray-400"
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
          {/* Upload icon box */}
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
            <Upload size={18} className="text-gray-700" />
          </div>
          <p className="text-[15px] font-semibold text-[color:var(--color-ink)]">
            Upload <span className="text-accent">{label}</span>
          </p>
          <p className="mt-1 text-sm text-gray-400">Max {maxSizeMb}MB</p>
        </>
      ) : (
        <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <FileText size={18} />
            </div>
            <div className="text-left">
              <p className="max-w-[150px] truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          </div>
          <button
            aria-label={`Remove ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-200"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
