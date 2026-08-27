"use client";

import {
  ArrowLeft,
  HelpCircle,
  Bell,
  Sparkles,
  ChevronDown,
  Menu,
} from "lucide-react";
import Image from "next/image";

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
      className={`bg-surface-soft relative flex size-8.5 items-center justify-center rounded-full transition-colors hover:brightness-95 ${className}`}
    >
      {children}
    </button>
  );
}

export default function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2.5 rounded-2xl bg-white/75 pr-2 pl-6 shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.03)] backdrop-blur-md">
      <div className="flex items-center gap-3 md:hidden">
        <button
          aria-label="Back"
          className="text-body flex size-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={19} strokeWidth={2} />
        </button>
        <span className="font-heading text-body text-lg font-bold">VedaAI</span>
      </div>

      <div className="hidden items-center gap-2.5 md:flex">
        <button
          aria-label="Back"
          className="text-body flex size-7 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={17} strokeWidth={2.25} />
        </button>

        <div className="text-disabled flex items-center gap-1.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3.5"
              y="4"
              width="11"
              height="12"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M6.5 4.5V3C6.5 2.17157 7.17157 1.5 8 1.5H10C10.8284 1.5 11.5 2.17157 11.5 3V4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-heading text-disabled text-base font-semibold tracking-[-0.64px]">
            Exams
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:hidden">
        <button aria-label="Notifications" className="text-body relative">
          <Bell size={20} strokeWidth={1.75} />
          <span className="bg-accent absolute -top-0.5 -right-0.5 size-2 rounded-full ring-2 ring-white" />
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
        <button aria-label="Menu" className="text-body">
          <Menu size={22} strokeWidth={1.75} />
        </button>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <IconBtn ariaLabel="Help">
          <HelpCircle size={17} strokeWidth={1.75} className="text-body" />
        </IconBtn>

        <IconBtn ariaLabel="Notifications">
          <Bell size={17} strokeWidth={1.75} className="text-body" />
          <span className="bg-accent absolute top-[7px] right-[7px] size-1.75 rounded-full outline-[1.5px] outline-white" />
        </IconBtn>

        <IconBtn ariaLabel="AI features">
          <Sparkles size={17} strokeWidth={1.75} className="text-body" />
        </IconBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        <button className="flex items-center gap-2 rounded-full px-1.5 py-1 transition-colors hover:bg-gray-50">
          <div className="relative size-7.5 overflow-hidden rounded-full">
            <Image
              src="/assets/madhur-profile.svg"
              alt="Madhur Rastogi"
              fill
              sizes="30px"
              className="object-cover"
            />
          </div>
          <span className="font-heading text-body text-base font-semibold tracking-[-0.64px]">
            Madhur Rastogi
          </span>
          <ChevronDown size={14} className="text-body" />
        </button>
      </div>
    </header>
  );
}
