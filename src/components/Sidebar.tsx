// src/components/Sidebar.tsx
"use client";

import { Settings, PanelLeft } from "lucide-react";
import {
  LayoutGrid,
  Presentation,
  FileText,
  ClipboardList,
  Library,
} from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

/** Secondary default colour with alpha */
const SECONDARY = "#5E5E5ECC";

const navItems = [
  { label: "Home", icon: LayoutGrid },
  { label: "My Classroom", icon: Presentation },
  { label: "Assignments", icon: FileText },
  { label: "Exams", icon: ClipboardList, active: true },
  { label: "My Library", icon: Library },
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
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* VedaAI brand SVG */}
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
                fontSize: 18,
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

        {/* ── AI Teacher's Toolkit CTA ── */}
        {/* Figma: bg #272727, border 4px gradient #FF7950→#C0350A, h-42, px-43, gap-10 */}
        {/* Shadows: 0 32 48 0 #FFFFFF33, 0 16 48 0 #FFFFFF1F */}
        <button
          className="mb-6 flex w-full items-center justify-center gap-[10px] rounded-full text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
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
          {/* Gradient border via pseudo-layer */}
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
          {/* Sparkle icon — white 4-pointed star */}
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

        {/* ── Nav links ── */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ label, icon: Icon, active }) => (
            <a
              key={label}
              href="#"
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-[9px] text-[14px] transition-colors",
                active
                  ? "bg-gray-100 font-medium"
                  : "font-normal hover:bg-gray-50"
              )}
              style={{
                fontFamily: "var(--font-bricolage)",
                fontWeight: active ? 500 : 400,
                color: active ? "#303030" : SECONDARY,
              }}
            >
              <Icon
                size={17}
                strokeWidth={active ? 2 : 1.75}
                style={{ color: SECONDARY }}
              />
              {label}
            </a>
          ))}
        </nav>
      </div>

      {/* ── Bottom: Settings + school card ── */}
      <div>
        <a
          href="#"
          className="mb-2 flex items-center gap-3 rounded-lg px-3 py-[9px] text-[14px] font-normal transition-colors hover:bg-gray-50"
          style={{
            fontFamily: "var(--font-bricolage)",
            fontWeight: 400,
            color: SECONDARY,
          }}
        >
          <Settings size={17} strokeWidth={1.75} style={{ color: SECONDARY }} />
          Settings
        </a>

        {/* School card */}
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-3"
          style={{ background: "#F0F0F0" }}
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
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
                fontSize: 13,
                color: "#303030",
                lineHeight: 1.3,
              }}
            >
              Delhi Public School
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#5E5E5E",
                lineHeight: 1.3,
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
