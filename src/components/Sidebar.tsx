"use client";

import { Settings, PanelLeft } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

function HomeIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <rect
        x="2.5"
        y="2.5"
        width="5.25"
        height="5.25"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="10.25"
        y="2.5"
        width="5.25"
        height="5.25"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="2.5"
        y="10.25"
        width="5.25"
        height="5.25"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="10.25"
        y="10.25"
        width="5.25"
        height="5.25"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ClassroomIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <rect
        x="2"
        y="2"
        width="14"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="11" cy="7" r="1.5" fill="currentColor" />
      <path
        d="M5 5L8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.5 15C7.5 12.5 8.8 10.5 11 10.5C13.2 10.5 14.5 12.5 14.5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AssignmentsIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M10.5 2.5H4.5C3.67157 2.5 3 3.17157 3 4V14C3 14.8284 3.67157 15.5 4.5 15.5H13.5C14.3284 15.5 15 14.8284 15 14V7L10.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 2.5V7H15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.5H12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 13H12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExamsIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
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
  );
}

function LibraryIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M9 2.5C5.41015 2.5 2.5 5.41015 2.5 9C2.5 12.5899 5.41015 15.5 9 15.5C12.5899 15.5 15.5 12.5899 15.5 9H9V2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 2.5V7.5H15.5C15.5 4.73858 13.2614 2.5 10.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const navItems = [
  { label: "Home", icon: HomeIcon },
  { label: "My Classroom", icon: ClassroomIcon },
  { label: "Assignments", icon: AssignmentsIcon },
  { label: "Exams", icon: ExamsIcon, active: true },
  { label: "My Library", icon: LibraryIcon },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-3 left-3 z-40 hidden h-[calc(100vh-24px)] w-76 flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_32px_48px_0_rgba(0,0,0,0.20),0_16px_48px_0_rgba(0,0,0,0.12)] md:flex">
      <div>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/assets/veda-ai.svg"
              alt="VedaAI logo"
              width={36}
              height={36}
              priority
            />
            <span className="font-heading text-body text-[28px] font-bold tracking-[-1.68px]">
              VedaAI
            </span>
          </div>
          <button
            aria-label="Toggle sidebar"
            className="text-muted-2/80 rounded-md p-1.5 transition-colors hover:bg-gray-100"
          >
            <PanelLeft size={17} />
          </button>
        </div>

        <button className="border-accent-glow relative mb-4 flex h-[42px] w-full items-center justify-center gap-2.5 rounded-full border-4 bg-[#272727] px-[43px] font-sans text-base font-medium tracking-[-0.64px] text-white shadow-[0_32px_48px_0_rgba(255,255,255,0.20),0_16px_48px_0_rgba(255,255,255,0.12)] transition-opacity hover:opacity-90">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M8 1l1.545 4.455L14 7l-4.455 1.545L8 15l-1.545-4.455L2 9l4.455-1.545L8 1z"
              fill="white"
            />
          </svg>
          AI Teacher&apos;s Toolkit
        </button>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, icon: Icon, active }) => (
            <a
              key={label}
              href="#"
              className={clsx(
                "font-heading flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-base tracking-[-0.64px] transition-colors",
                active
                  ? "text-body bg-[#F0F0F0] font-medium"
                  : "text-muted-2/80 font-normal hover:bg-gray-50"
              )}
            >
              <Icon className={active ? "text-body" : "text-muted-2/80"} />
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div>
        <a
          href="#"
          className="font-heading text-muted-2/80 mb-3 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-normal transition-colors hover:bg-gray-50"
        >
          <Settings size={17} strokeWidth={1.75} className="text-muted-2/80" />
          Settings
        </a>

        <div className="bg-surface-alt flex items-center gap-3 rounded-2xl p-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
            <Image
              src="/assets/delhi_public_school.svg"
              alt="Delhi Public School logo"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-heading text-body text-[16px] leading-[1.4] font-bold tracking-[-0.64px]">
              Delhi Public School
            </p>
            <p className="font-heading text-muted-2 mt-0.5 text-[14px] leading-[1.4] tracking-[-0.56px]">
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
