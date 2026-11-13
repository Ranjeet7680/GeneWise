"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  BookOpen,
  BrainCircuit,
  Cpu,
  Dna,
  FileText,
  FolderHeart,
  HeartPulse,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  Microscope,
  Radio,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Watch,
  Wifi,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

export interface NavGroup {
  id: string;
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "clinical",
    title: "Clinical Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/assistant", label: "AI Medical Assistant", icon: MessageSquare, badge: "AI" },
      { href: "/assistant/voice", label: "Voice Assistant", icon: Radio, badge: "Live" },
      { href: "/my-family-history", label: "My Family History", icon: FolderHeart },
      { href: "/reports", label: "Laboratory Reports", icon: FileText },
      { href: "/health-metrics", label: "Health Metrics & Trends", icon: HeartPulse },
      { href: "/clinician", label: "Clinician Queue", icon: Stethoscope, badge: "MD" },
    ],
  },
  {
    id: "connected",
    title: "Connected Healthcare",
    items: [
      { href: "/devices/wearables", label: "Wearable Sync", icon: Watch, badge: "IoT" },
      { href: "/devices/sensors", label: "Medical Sensors", icon: Cpu, badge: "Live" },
      { href: "/devices/iot", label: "Hardware Gateways", icon: Wifi },
    ],
  },
  {
    id: "intelligence",
    title: "Intelligence & ML",
    items: [
      { href: "/analytics", label: "Analytics Engine", icon: LineChart },
      { href: "/ml-lab", label: "ML Research Lab", icon: BrainCircuit, badge: "Lab" },
      { href: "/ml-lab?tab=features", label: "Feature Engineering", icon: Sparkles, badge: "Studio" },
      { href: "/diseases", label: "Disease Research", icon: Activity },
      { href: "/genetics", label: "Genes & Genetics", icon: Dna },
      { href: "/risk-education", label: "Risk Education", icon: ShieldCheck },
      { href: "/research", label: "Evidence Library", icon: BookOpen },
      { href: "/records", label: "Personal Health Records", icon: FolderHeart },
    ],
  },
  {
    id: "governance",
    title: "Account & Governance",
    items: [
      { href: "/notifications", label: "Notification Center", icon: Bell },
      { href: "/admin", label: "Platform Admin", icon: ShieldAlert, badge: "Sec" },
      { href: "/settings/profile", label: "Settings", icon: Settings },
      { href: "/settings/privacy", label: "Privacy & Consents", icon: ShieldCheck },
    ],
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  // Floating tooltip hover state with viewport top coordinates so it is never clipped
  const [hoveredItem, setHoveredItem] = useState<{
    label: string;
    category: string;
    badge?: string;
    href?: string;
    top: number;
  } | null>(null);

  // Permanently lock navigation to compact rail (w-16) across the entire application.
  // Navigation NEVER expands, honoring user requirement: "navgation expend nhi hona chahiya".
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("medipredict_sidebar_collapsed", "true");
      } catch {
        // Ignore localStorage quota or private mode issues
      }
    }
  }, [pathname]);

  const isItemActive = (href: string) => {
    const baseHref = href.split("?")[0];
    if (href.includes("?")) {
      return pathname === baseHref;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Fixed Navigation Rail (Locked to w-16, never expands, stays visible when page scrolls down) */}
      <aside
        aria-label="Clinical Navigation Rail"
        className="fixed top-16 left-0 bottom-0 w-16 z-30 border-r border-border bg-surface-low/95 dark:bg-[#111d24]/95 backdrop-blur-md hidden md:flex flex-col justify-between shrink-0 select-none shadow-xs"
      >
        {/* Top Mini Brand Accent / Pulse Indicator */}
        <div className="h-12 flex items-center justify-center border-b border-border/70 bg-surface-container/30 dark:bg-black/10 shrink-0">
          <div
            title="GeneWise Clinical Rail • Locked Compact"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-primary bg-primary/10 border border-primary/25 shadow-2xs group cursor-default"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>

        {/* Scrollable Navigation Rail Icons */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2.5 px-2 space-y-3.5 scrollbar-none">
          {NAV_GROUPS.map((group, groupIndex) => {
            return (
              <div key={group.id} className="space-y-1">
                {/* Subtle Divider between groups */}
                {groupIndex > 0 && (
                  <div className="w-full flex justify-center py-1">
                    <div className="w-6 h-px bg-border/70 dark:bg-border/50" />
                  </div>
                )}

                {/* Items in this group */}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = isItemActive(item.href);
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.href}
                        className="relative"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredItem({
                            label: item.label,
                            category: group.title,
                            badge: item.badge,
                            href: item.href,
                            top: rect.top + rect.height / 2,
                          });
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <Link
                          href={item.href}
                          onClick={() => sound.playClick()}
                          aria-label={item.label}
                          className={cn(
                            "flex items-center justify-center rounded-xl p-2.5 w-11 h-11 mx-auto text-xs font-medium transition-all duration-200 group relative overflow-hidden cursor-pointer",
                            isActive
                              ? "bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary font-semibold shadow-2xs border border-primary/30"
                              : "text-muted-foreground hover:text-foreground hover:bg-surface-container/80 dark:hover:bg-[#162732] hover:scale-105"
                          )}
                        >
                          {/* Active Vertical Pill on Left Edge */}
                          {isActive && (
                            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                          )}

                          <Icon
                            className={cn(
                              "w-4 h-4 transition-transform group-hover:scale-115 shrink-0",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-primary"
                            )}
                          />

                          {/* Status Badge Dots */}
                          {item.badge && (
                            <span
                              className={cn(
                                "absolute top-2 right-2 w-1.5 h-1.5 rounded-full",
                                item.badge === "Live"
                                  ? "bg-emerald-500 animate-ping"
                                  : item.badge === "AI"
                                  ? "bg-primary"
                                  : "bg-purple-500"
                              )}
                            />
                          )}
                          {item.badge === "Live" && (
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pinned Bottom Status Section */}
        <div className="p-2 border-t border-border/80 flex flex-col items-center gap-2.5 py-3 bg-surface-container/20 dark:bg-black/15 shrink-0">
          <div
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem({
                label: "Clinical Decision Support",
                category: "Evidence-Grounded Intelligence",
                badge: "FastAPI",
                top: rect.top + rect.height / 2,
              });
            }}
            onMouseLeave={() => setHoveredItem(null)}
            className="w-10 h-10 rounded-xl bg-surface-container/80 dark:bg-[#162732] text-muted-foreground hover:text-primary flex items-center justify-center transition-all cursor-pointer border border-border group"
          >
            <Microscope className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          </div>

          <div
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem({
                label: "API Mesh Active",
                category: "FastAPI 0.111 • Zero-Trust Enclave",
                badge: "93.9%",
                top: rect.top + rect.height / 2,
              });
            }}
            onMouseLeave={() => setHoveredItem(null)}
            className="relative flex h-2.5 w-2.5 items-center justify-center cursor-pointer"
            title="FastAPI 0.111 Mesh Online"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
        </div>
      </aside>

      {/* Structural Layout Spacer: Exactly 64px width (w-16) reserved in the flex layout */}
      {/* Ensures page content (<main>) flows alongside the fixed rail without overlapping or clipping */}
      <div className="w-16 shrink-0 hidden md:block" aria-hidden="true" />

      {/* Floating Tooltip (Viewport-anchored via fixed coordinates, never clipped by overflow) */}
      {hoveredItem && (
        <div
          style={{ top: `${hoveredItem.top}px` }}
          className="fixed left-[4.5rem] -translate-y-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="rounded-xl bg-slate-900/95 dark:bg-[#162732]/95 backdrop-blur-md text-white border border-slate-700/60 dark:border-border/80 shadow-2xl p-2.5 whitespace-nowrap min-w-[130px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold leading-tight">
                {hoveredItem.label}
              </span>
              {hoveredItem.badge && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-primary text-white">
                  {hoveredItem.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {hoveredItem.category}
            </span>
            {hoveredItem.href && isItemActive(hoveredItem.href) && (
              <span className="text-[9px] font-semibold text-emerald-400 block mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Current View
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
