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
      <div className="md:hidden h-20 shrink-0 pointer-events-none print:hidden" aria-hidden="true" />

      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0c181f]/90 backdrop-blur-2xl border-t border-teal-500/20 dark:border-teal-500/30 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-colors duration-200 select-none print:hidden"
      >
        <div className="grid grid-cols-5 items-center max-w-lg mx-auto gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => sound.playClick()}
                className={cn(
                  "flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-2xl transition-all duration-200 relative group active:scale-95 touch-manipulation",
                  isActive
                    ? "text-teal-700 dark:text-teal-300 font-bold bg-teal-500/10 dark:bg-teal-400/15"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-low/60"
                )}
              >
                {isActive && (
                  <span className="absolute -top-1.5 w-7 h-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_0_8px_rgba(20,184,166,0.8)] animate-in fade-in" />
                )}

                <Icon
                  className={cn(
                    "w-[20px] h-[20px] transition-transform duration-200",
                    isActive ? "text-teal-700 dark:text-teal-300 scale-110" : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <span className="text-[10.5px] mt-0.5 leading-tight tracking-tight truncate max-w-full font-medium">
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
