// src/components/TopBar.tsx
"use client";

import {
  ArrowLeft,
  ClipboardList,
  HelpCircle,
  Bell,
  Sparkles,
  ChevronDown,
  Menu,
} from "lucide-react";
import Image from "next/image";

/** Reusable icon button with #F6F6F6 circle background */
function IconBtn({
  children,
  ariaLabel,
  className = "",
}: {
  children: React.ReactNode;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`relative flex size-[34px] items-center justify-center rounded-full transition-colors hover:brightness-95 ${className}`}
      style={{ background: "#F6F6F6" }}
    >
      {children}
    </button>
  );
}

export default function TopBar() {
  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between gap-2.5 rounded-2xl pr-2 pl-6 backdrop-blur-md"
      style={{
        background: "#FFFFFFBF",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)",
      }}
    >
      {/* ── Mobile: back arrow + wordmark ── */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          aria-label="Back"
          className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          style={{ color: "#303030" }}
        >
          <ArrowLeft size={19} strokeWidth={2} />
        </button>
        <span
          className="text-[17px]"
          style={{
            fontFamily: "var(--font-bricolage)",
            fontWeight: 700,
            color: "#303030",
          }}
        >
          VedaAI
        </span>
      </div>

      {/* ── Desktop: back + breadcrumb ── */}
      <div className="hidden items-center gap-2.5 md:flex">
        {/* Back button — #303030 text-primary */}
        <button
          aria-label="Back"
          className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
          style={{ color: "#303030" }}
        >
          <ArrowLeft size={17} strokeWidth={2.25} />
        </button>

        {/* Breadcrumb — disabled/secondary #A9A9A9 */}
        <div className="flex items-center gap-1.5" style={{ color: "#A9A9A9" }}>
          <ClipboardList size={15} strokeWidth={1.75} />
          <span
            className="text-sm"
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 400,
              color: "#A9A9A9",
            }}
          >
            Exams
          </span>
        </div>
      </div>

      {/* ── Mobile: bell + avatar + hamburger ── */}
      <div className="flex items-center gap-3 md:hidden">
        <button aria-label="Notifications" className="relative">
          <Bell size={20} strokeWidth={1.75} style={{ color: "#303030" }} />
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#ff6a2b] ring-2 ring-white" />
        </button>
        <div className="relative size-8 overflow-hidden rounded-full">
          <Image
            src="/assets/madhur-profile.svg"
            alt="User avatar"
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>
        <button aria-label="Menu" style={{ color: "#303030" }}>
          <Menu size={22} strokeWidth={1.75} />
        </button>
      </div>

      {/* ── Desktop: icon trio + divider + profile ── */}
      <div className="hidden items-center gap-2 md:flex">
        {/* Help icon — #F6F6F6 bg */}
        <IconBtn ariaLabel="Help">
          <HelpCircle
            size={17}
            strokeWidth={1.75}
            style={{ color: "#303030" }}
          />
        </IconBtn>

        {/* Bell icon — #F6F6F6 bg + orange dot */}
        <IconBtn ariaLabel="Notifications">
          <Bell size={17} strokeWidth={1.75} style={{ color: "#303030" }} />
          <span
            className="absolute size-[7px] rounded-full bg-[#ff6a2b]"
            style={{
              top: 7,
              right: 7,
              outline: "1.5px solid white",
            }}
          />
        </IconBtn>

        {/* Sparkle icon — #F6F6F6 bg */}
        <IconBtn ariaLabel="AI features">
          <Sparkles size={17} strokeWidth={1.75} style={{ color: "#303030" }} />
        </IconBtn>

        {/* Vertical divider */}
        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Profile — real avatar + Bricolage SemiBold 600 */}
        <button className="flex items-center gap-2 rounded-full px-1.5 py-1 transition-colors hover:bg-gray-50">
          <div className="relative size-[30px] overflow-hidden rounded-full">
            <Image
              src="/assets/madhur-profile.svg"
              alt="Madhur Rastogi"
              fill
              sizes="30px"
              className="object-cover"
            />
          </div>
          <span
            className="text-sm"
            style={{
              fontFamily: "var(--font-bricolage)",
              fontWeight: 600,
              color: "#303030",
            }}
          >
            Madhur Rastogi
          </span>
          <ChevronDown size={14} style={{ color: "#A9A9A9" }} />
        </button>
      </div>
    </header>
  );
}
