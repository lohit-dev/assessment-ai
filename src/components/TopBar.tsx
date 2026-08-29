"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell, Sparkles, ChevronDown, Menu } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";

const MobileNavDrawer = dynamic(() => import("@/components/MobileNavDrawer"), {
  ssr: false,
});

export default function TopBar() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          Mobile top bar  (hidden md+)
          Matches Figma phone nav: white card, back + logo left,
          bell + avatar + hamburger right.
      ───────────────────────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 rounded-2xl bg-white px-3 pr-4 shadow-sm md:hidden">
        {/* Left: back arrow + VedaAI logo */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Back"
            onClick={() => router.back()}
            className="text-body flex size-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <Link href="/" className="flex items-center gap-2">
            {/* VedaAI icon SVG */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/veda-ai.svg"
              alt="VedaAI logo"
              width={28}
              height={28}
              className="shrink-0"
            />
            <span className="font-heading text-body text-[20px] leading-[1.4] font-bold tracking-[-0.06em]">
              VedaAI
            </span>
          </Link>
        </div>

        {/* Right: bell (with orange dot) + avatar + hamburger */}
        <div className="flex items-center gap-3">
          {/* Bell with notification dot */}
          <button
            aria-label="Notifications"
            className="bg-surface-soft relative flex size-9 items-center justify-center rounded-full transition-colors hover:brightness-95"
          >
            <Bell size={18} strokeWidth={1.75} className="text-body" />
            <span className="bg-accent absolute top-1.5 right-1.5 size-2 rounded-full ring-[1.5px] ring-white" />
          </button>

          {/* User avatar */}
          <div className="relative size-8 overflow-hidden rounded-full">
            <Image
              src="/images/avatars/madhur-profile.svg"
              alt="User avatar"
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>

          {/* Hamburger / menu */}
          <button
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="text-body"
          >
            <Menu size={22} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          Desktop top bar  (hidden below md)
          Matches Figma desktop nav bar: white/75 glass pill, back +
          Exams breadcrumb left, help + bell + sparkles + user right.
      ───────────────────────────────────────────────────────────── */}
      <header className="hidden h-14 shrink-0 items-center justify-between gap-2.5 rounded-2xl bg-white/75 pr-2 pl-6 shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.03)] backdrop-blur-md md:flex">
        {/* Left: back + Exams breadcrumb */}
        <div className="flex items-center gap-2.5">
          <button
            aria-label="Back"
            onClick={() => router.back()}
            className="text-body flex size-7 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
          >
            <ArrowLeft size={17} strokeWidth={2.25} />
          </button>

          <div className="text-disabled flex items-center gap-1.5">
            {/* Clipboard / exams icon */}
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

        {/* Right: help + bell + sparkles + divider + user profile */}
        <div className="flex items-center gap-2">
          {/* Help / ? button */}
          <button
            aria-label="Help"
            className="bg-surface-soft flex size-9 items-center justify-center rounded-full transition-colors hover:brightness-95"
          >
            <span className="border-body text-body flex size-6 items-center justify-center rounded-full border-2 text-[16px] leading-none font-bold tracking-[-0.64px]">
              ?
            </span>
          </button>

          {/* Bell with notification dot */}
          <button
            aria-label="Notifications"
            className="bg-surface-soft relative flex size-9 items-center justify-center rounded-full transition-colors hover:brightness-95"
          >
            <Bell size={17} strokeWidth={1.75} className="text-body" />
            <span className="bg-accent absolute top-1.75 right-1.75 size-1.75 rounded-full outline-[1.5px] outline-white" />
          </button>

          {/* Sparkles / AI features */}
          <button
            aria-label="AI features"
            className="bg-surface-soft flex size-9 items-center justify-center rounded-full transition-colors hover:brightness-95"
          >
            <Sparkles size={17} strokeWidth={1.75} className="text-body" />
          </button>

          {/* Divider */}
          <div className="mx-1 h-5 w-px bg-gray-200" />

          {/* User profile button */}
          <button className="flex items-center gap-2 rounded-full px-1.5 py-1 transition-colors hover:bg-gray-50">
            <div className="relative size-8 overflow-hidden rounded-full">
              <Image
                src="/images/avatars/madhur-profile.svg"
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

      <MobileNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
