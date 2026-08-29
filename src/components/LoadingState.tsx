"use client";

import Image from "next/image";

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
}

/**
 * Full-height loading card shown during extraction/grading.
 *
 * Desktop: white card fills the content area, content centred inside.
 * Mobile : same card but with a slightly tighter min-height so it fills
 *          the viewport below the top bar (matches Figma phone loading screen).
 */
export default function LoadingState({
  title = "Extracting...",
  subtitle = "This may take a while",
}: LoadingStateProps) {
  return (
    <div className="animate-fade-in flex min-h-[calc(100vh-120px)] w-full flex-1 items-center justify-center rounded-3xl bg-white px-4 py-10 md:min-h-[calc(100vh-88px)]">
      <div className="flex flex-col items-center justify-center gap-3.75">
        {/* Animated loader SVG — pulse matches Figma spinning loader */}
        <Image
          src="/images/ui/loader.svg"
          alt=""
          width={128}
          height={135}
          className="animate-pulse"
          style={{ width: "auto", height: "auto" }}
          priority
        />

        {/* Title + subtitle — re-animate when stage label changes */}
        <div
          key={title}
          className="animate-fade-in-up flex flex-col items-center gap-0.5 text-center"
        >
          <p className="font-heading animate-shimmer-text text-[28px] leading-9 font-bold tracking-[-1.2px] md:text-[30px]">
            {title}
          </p>
          <p className="font-heading text-[18px] leading-9 tracking-[-1.2px] text-[rgba(70,70,70,0.75)] md:text-[20px]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
