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

export default function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-black/5 bg-white px-4 md:px-6">
      {/* Mobile: back + wordmark */}
      <div className="flex items-center gap-3 md:hidden">
        <button aria-label="Back" className="text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <span className="font-heading text-lg font-semibold">VedaAI</span>
      </div>

      {/* Desktop: back + breadcrumb */}
      <div className="hidden items-center gap-3 text-gray-500 md:flex">
        <button aria-label="Back" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft size={18} />
        </button>
        <ClipboardList size={16} />
        <span className="text-[15px] font-medium">Exams</span>
      </div>

      {/* Mobile: bell, avatar, hamburger */}
      <div className="flex items-center gap-3 md:hidden">
        <button aria-label="Notifications" className="relative text-gray-600">
          <Bell size={20} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
        </button>
        <div className="h-8 w-8 rounded-full bg-orange-100" />
        <button aria-label="Menu" className="text-gray-700">
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop: help, bell, sparkle, profile */}
      <div className="hidden items-center gap-4 md:flex">
        <button aria-label="Help" className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100">
          <HelpCircle size={20} />
        </button>
        <button
          aria-label="Notifications"
          className="relative rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>
        <Sparkles size={20} className="text-accent" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-orange-100" />
          <span className="text-[15px] font-semibold">Madhur Rastogi</span>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
