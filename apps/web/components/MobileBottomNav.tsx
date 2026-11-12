"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Dna,
  HeartPulse,
  Microscope,
  Network,
  Search,
  User as UserIcon,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: HeartPulse },
  { href: "/diseases", label: "Explorer", icon: Microscope },
  { href: "/genetics", label: "Family", icon: Network },
  { href: "/research", label: "Learn", icon: BookOpen },
  { href: "/settings/profile", label: "Profile", icon: UserIcon },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on public landing and auth pages
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  ) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111d24]/95 backdrop-blur-lg border-t border-border shadow-lg px-2 py-1.5 transition-colors duration-200">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)) ||
            (item.href === "/diseases" && pathname === "/diseases") ||
            (item.href === "/genetics" && pathname === "/genetics") ||
            (item.href === "/research" && pathname === "/research");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => sound.playClick()}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative group",
                isActive
                  ? "text-primary font-bold scale-105"
                  : "text-muted-foreground hover:text-foreground hover:scale-102"
              )}
            >
              {/* Active top glow indicator pill */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-primary shadow-xs animate-in fade-in" />
              )}

              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-primary"
                )}
              />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
