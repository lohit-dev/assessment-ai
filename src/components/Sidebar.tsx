// src/components/Sidebar.tsx
"use client";

import {
  LayoutGrid,
  Presentation,
  FileText,
  ClipboardList,
  PieChart,
  Settings,
  Sparkles,
  PanelLeft,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { label: "Home", icon: LayoutGrid },
  { label: "My Classroom", icon: Presentation },
  { label: "Assignments", icon: FileText },
  { label: "Exams", icon: ClipboardList, active: true },
  { label: "My Library", icon: PieChart },
];

export default function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 flex-col justify-between border-r border-black/5 bg-white px-4 py-5 md:flex">
      <div>
        <div className="mb-6 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white font-heading text-lg">
              V
            </div>
            <span className="font-heading text-xl font-semibold">VedaAI</span>
          </div>
          <button
            aria-label="Toggle sidebar"
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <PanelLeft size={18} />
          </button>
        </div>

        <button className="mb-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-accent bg-[color:var(--color-ink)] px-4 py-2.5 text-sm font-semibold text-white" style={{ fontFamily: "var(--font-inter)" }}>
          <Sparkles size={16} className="text-accent" />
          AI Teacher&apos;s Toolkit
        </button>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, icon: Icon, active }) => (
            <a
              key={label}
              href="#"
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium",
                active
                  ? "bg-gray-100 text-[color:var(--color-ink)]"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Icon size={18} />
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div>
        <a
          href="#"
          className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-gray-500 hover:bg-gray-50"
        >
          <Settings size={18} />
          Settings
        </a>
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
          <div className="h-9 w-9 shrink-0 rounded-full bg-green-100" />
          <div>
            <p className="text-sm font-semibold leading-tight">Delhi Public School</p>
            <p className="text-xs text-gray-500">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
