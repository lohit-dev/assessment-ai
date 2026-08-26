"use client";

import { Settings, PanelLeft } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

const SECONDARY = "#5E5E5ECC";

function HomeIcon({
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
    <aside
      className="hidden flex-col justify-between bg-white md:flex"
      style={{
        position: "fixed",
        top: 12,
        left: 12,
        width: 304,
        height: "calc(100vh - 24px)",
        borderRadius: 16,
        padding: 24,
        boxShadow:
          "0 32px 48px 0 rgba(0,0,0,0.20), 0 16px 48px 0 rgba(0,0,0,0.12)",
        zIndex: 40,
      }}
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/assets/veda-ai.svg"
              alt="VedaAI logo"
              width={36}
              height={36}
              priority
            />
            <span
              style={{
                fontFamily: "var(--font-bricolage)",
                fontWeight: 700,
                color: "#303030",
                fontSize: 20,
              }}
            >
              VedaAI
            </span>
          </div>
          <button
            aria-label="Toggle sidebar"
            className="rounded-md p-1.5 transition-colors hover:bg-gray-100"
            style={{ color: SECONDARY }}
          >
            <PanelLeft size={17} />
          </button>
        </div>

        <button
          className="mb-6 flex w-full items-center justify-center gap-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            fontFamily: "var(--font-bricolage)",
            height: 42,
            paddingLeft: 43,
            paddingRight: 43,
            background: "#272727",
            border: "4px solid transparent",
            backgroundClip: "padding-box",
            outline: "4px solid transparent",
            position: "relative",
            boxShadow:
              "0 32px 48px 0 rgba(255,255,255,0.20), 0 16px 48px 0 rgba(255,255,255,0.12)",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: "inherit",
              padding: 4,
              background: "linear-gradient(135deg, #FF7950 0%, #C0350A 100%)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              pointerEvents: "none",
            }}
          />
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
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors",
                active ? "bg-[#F0F0F0]" : "hover:bg-gray-50"
              )}
              style={{
                fontFamily: "var(--font-bricolage)",
                fontWeight: active ? 500 : 400,
                color: active ? "#303030" : SECONDARY,
              }}
            >
              <Icon
                style={{
                  color: active ? "#303030" : SECONDARY,
                }}
              />
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div>
        <a
          href="#"
          className="mb-3 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-normal transition-colors hover:bg-gray-50"
          style={{
            fontFamily: "var(--font-bricolage)",
            fontWeight: 400,
            color: SECONDARY,
          }}
        >
          <Settings size={17} strokeWidth={1.75} style={{ color: SECONDARY }} />
          Settings
        </a>

        <div
          className="flex items-center gap-3 rounded-2xl p-3"
          style={{ background: "#F0F0F0" }}
        >
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
            <p
              style={{
                fontFamily: "var(--font-bricolage)",
                fontWeight: 700,
                fontSize: 13.5,
                color: "#303030",
                lineHeight: 1.25,
              }}
            >
              Delhi Public School
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#5E5E5E",
                lineHeight: 1.25,
                marginTop: 2,
              }}
            >
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
