"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, Settings } from "lucide-react";
import clsx from "clsx";
import { navItems } from "@/components/Sidebar";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileNavDrawer({
  open,
  onClose,
}: MobileNavDrawerProps) {
  // lock background scroll while the drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-50 md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        className={clsx(
          "absolute inset-0 bg-black/30 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* panel */}
      <div
        className={clsx(
          "absolute top-0 right-0 flex h-full w-[80%] max-w-80 flex-col justify-between bg-white p-5 shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div>
          <div className="mb-5 flex items-center justify-between">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-2.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/brand/veda-ai.svg"
                alt="VedaAI logo"
                width={32}
                height={32}
              />
              <span className="font-heading text-body text-xl font-bold tracking-[-0.9px]">
                VedaAI
              </span>
            </Link>
            <button
              aria-label="Close menu"
              onClick={onClose}
              className="text-muted-2/80 rounded-full p-1.5 transition-colors hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <button
            type="button"
            className="border-accent-glow relative mb-4 flex h-10.5 w-full items-center justify-center gap-2.5 rounded-full border-4 bg-[#272727] px-6 font-sans text-sm font-medium tracking-[-0.56px] text-white"
          >
            <svg
              width="14"
              height="14"
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
                onClick={onClose}
                className={clsx(
                  "font-heading flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-base tracking-[-0.64px] transition-colors",
                  active
                    ? "text-body bg-surface-alt font-medium"
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
            <Settings
              size={17}
              strokeWidth={1.75}
              className="text-muted-2/80"
            />
            Settings
          </a>
          <div className="bg-surface-alt flex items-center gap-3 rounded-2xl p-3">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/brand/delhi-public-school.svg"
                alt="Delhi Public School logo"
                className="size-full object-cover"
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
      </div>
    </div>,
    document.body
  );
}
