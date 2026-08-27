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
        "flex h-32 w-full flex-1 flex-col items-center justify-center rounded-[20px] border-[1.5px] border-dashed px-6 py-4 text-center transition-all sm:h-34",
        isDragging
          ? "border-accent bg-accent-50 cursor-copy"
          : file
            ? "border-accent/50 cursor-default bg-white"
            : "border-hairline cursor-pointer bg-white hover:border-gray-400"
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
            <Upload size={20} strokeWidth={2} className="text-body" />
          </div>
          <p className="font-heading text-body text-xl leading-snug font-semibold tracking-[-1.2px]">
            Upload <span className="text-accent">{label}</span>
          </p>
          <p className="mt-0.5 font-sans text-sm font-normal text-[#5E5E5E8C]">
            Max {maxSizeMb}MB
          </p>
        </>
      ) : (
        <div className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-[#F9F9F9] px-3.5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <FileText size={17} strokeWidth={1.75} />
            </div>
            <div className="text-left">
              <p className="font-heading text-body max-w-35 truncate text-sm font-semibold">
                {file.name}
              </p>
              <p className="text-xs text-gray-400">
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
            className="flex size-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
