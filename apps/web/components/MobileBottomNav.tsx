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
      <div className="md:hidden h-16 shrink-0 pointer-events-none print:hidden" aria-hidden="true" />

      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0f1c23]/95 backdrop-blur-xl border-t border-border/90 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-2 pt-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))] transition-colors duration-200 select-none print:hidden"
      >
        <div className="grid grid-cols-5 items-center max-w-lg mx-auto gap-0.5">
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
                  "flex flex-col items-center justify-center min-h-[46px] py-1 px-1 rounded-xl transition-all duration-200 relative group active:scale-95",
                  isActive
                    ? "text-primary font-bold bg-primary/8 dark:bg-primary/15"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-primary shadow-xs animate-in fade-in" />
                )}

                <Icon
                  className={cn(
                    "w-[19px] h-[19px] transition-transform duration-200",
                    isActive ? "text-primary scale-105" : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <span className="text-[10px] mt-0.5 leading-tight tracking-tight truncate max-w-full">
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
