"use client";

import Image from "next/image";

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
}

export default function LoadingState({
  title = "Extracting...",
  subtitle = "This may take a while",
}: LoadingStateProps) {
  return (
    <div className="flex h-[calc(100vh-88px)] items-center justify-center rounded-3xl bg-white">
      <div className="flex flex-col items-center justify-center gap-[15px]">
        <Image
          src="/assets/loader.svg"
          alt=""
          width={128}
          height={135}
          className="animate-pulse"
          priority
        />
        <div className="flex flex-col items-center">
          <p className="font-heading animate-shimmer-text text-[30px] leading-[36px] font-bold tracking-[-1.2px]">
            {title}
          </p>
          <p className="font-heading text-[20px] leading-[36px] tracking-[-1.2px] text-[rgba(70,70,70,0.75)]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
