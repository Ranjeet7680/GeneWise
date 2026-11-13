"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  Dna,
  HeartPulse,
  MessageSquare,
  User as UserIcon,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: HeartPulse },
  { href: "/assistant", label: "AI Chat", icon: MessageSquare },
  { href: "/ml-lab", label: "ML Lab", icon: BrainCircuit },
  { href: "/genetics", label: "Genetics", icon: Dna },
  { href: "/settings/profile", label: "Profile", icon: UserIcon },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on public landing, auth flows, and full-screen text chat (which has its own bottom composer)
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/assistant"
  ) {
    return null;
  }

  return (
    <>
      {/* Layout spacer so scrolled page content never rests underneath the fixed mobile dock */}
      <div className="md:hidden h-24 shrink-0 pointer-events-none print:hidden" aria-hidden="true" />

      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0c181f]/95 backdrop-blur-2xl border-t border-teal-500/25 dark:border-teal-500/35 shadow-[0_-10px_35px_rgba(0,0,0,0.15)] px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-all duration-300 select-none print:hidden"
      >
        <div className="grid grid-cols-5 items-center max-w-lg mx-auto gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)) ||
              (item.href === "/genetics" && pathname.startsWith("/my-family-history"));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => sound.playClick()}
                className={cn(
                  "flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-2xl transition-all duration-200 relative group active:scale-95 touch-manipulation",
                  isActive
                    ? "text-teal-700 dark:text-teal-300 font-bold bg-teal-500/15 dark:bg-teal-400/20 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-low/70"
                )}
              >
                {isActive && (
                  <span className="absolute -top-2 w-8 h-1 rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.95)] animate-in fade-in zoom-in-75" />
                )}

                <Icon
                  className={cn(
                    "w-[21px] h-[21px] transition-transform duration-200",
                    isActive
                      ? "text-teal-700 dark:text-teal-300 scale-110 -translate-y-0.5"
                      : "text-muted-foreground group-hover:text-primary group-hover:scale-105"
                  )}
                />
                <span
                  className={cn(
                    "text-[10.5px] mt-0.5 leading-tight tracking-tight truncate max-w-full transition-colors",
                    isActive ? "font-bold text-teal-800 dark:text-teal-200" : "font-medium"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
