"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Cpu,
  Dna,
  FileText,
  FolderHeart,
  HeartPulse,
  LayoutDashboard,
  LayoutGrid,
  LineChart,
  MessageSquare,
  Microscope,
  PanelLeftClose,
  PanelLeftOpen,
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
      { href: "/documentation", label: "All Documentary Portal", icon: LayoutGrid, badge: "Portal" },
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
    id: "documentary",
    title: "Public Documentary",
    items: [
      { href: "/documentation", label: "All Documentary Portal", icon: LayoutGrid, badge: "Portal" },
      { href: "/clinical-support/find-counselor", label: "Find Genetic Counselor", icon: Stethoscope },
      { href: "/clinical-support/discussion-prep", label: "Doctor Discussion Prep", icon: FileText },
      { href: "/clinical-support/scientific-faq", label: "Scientific & Clinical FAQ", icon: BookOpen },
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

  // Sidebar expansion state: allows toggling between compact rail (w-16) and expanded sidebar (w-64)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  // Collapsible section accordions state for expanded mode
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Floating tooltip hover state with viewport top coordinates so it is never clipped
  const [hoveredItem, setHoveredItem] = useState<{
    label: string;
    category: string;
    badge?: string;
    href?: string;
    top: number;
  } | null>(null);

  // Initialize: read user's saved preference from localStorage (defaults to collapsed w-16)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("medipredict_sidebar_collapsed");
        if (stored === "false") {
          setIsCollapsed(false);
        } else {
          setIsCollapsed(true);
        }
      } catch {
        // Ignore localStorage issues
      }
    }
  }, []);

  // Keyboard shortcut: Ctrl + B or [ to toggle sidebar expand / shorten mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && (e.key === "b" || e.key === "B")) || e.key === "[") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    sound.playPop();
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("medipredict_sidebar_collapsed", next ? "true" : "false");
      } catch {}
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    sound.playClick();
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const isItemActive = (href: string) => {
    const baseHref = href.split("?")[0];
    if (href.includes("?")) {
      return pathname === baseHref;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Dynamic Navigation Rail (w-16 compact or w-64 expanded with smooth transition) */}
      <aside
        aria-label="Clinical Navigation"
        className={cn(
          "fixed top-16 left-0 bottom-0 z-30 border-r border-border bg-surface-low/95 dark:bg-[#111d24]/95 backdrop-blur-md hidden md:flex flex-col justify-between shrink-0 select-none shadow-xs transition-all duration-300 ease-in-out print:hidden",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Top Header with Expand / Shorten Toggle Button */}
        <div className="h-14 flex items-center border-b border-border/70 bg-surface-container/30 dark:bg-black/10 shrink-0 px-3">
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggleSidebar}
              title="Expand Navigation (Ctrl + B)"
              aria-label="Expand Navigation"
              className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 border border-primary/25 shadow-2xs group cursor-pointer transition-all hover:scale-105"
            >
              <PanelLeftOpen className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </button>
          ) : (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black tracking-wider uppercase text-foreground">
                  Navigation
                </span>
              </div>
              <button
                type="button"
                onClick={toggleSidebar}
                title="Shorten Navigation (Ctrl + B)"
                aria-label="Shorten Navigation"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-surface-container/80 dark:hover:bg-[#162732] border border-border/70 transition-all cursor-pointer shadow-2xs"
              >
                <span>Shorten</span>
                <PanelLeftClose className="w-3.5 h-3.5 text-primary" />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Body */}
        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-3.5 scrollbar-thin scrollbar-thumb-border/60",
            isCollapsed ? "px-2" : "px-3"
          )}
        >
          {NAV_GROUPS.map((group, groupIndex) => {
            const isSectionCollapsed = collapsedSections[group.id] || false;

            return (
              <div key={group.id} className="space-y-1">
                {/* Group Divider in Collapsed Mode */}
                {isCollapsed && groupIndex > 0 && (
                  <div className="w-full flex justify-center py-1">
                    <div className="w-6 h-px bg-border/70 dark:bg-border/50" />
                  </div>
                )}

                {/* Group Header in Expanded Mode */}
                {!isCollapsed && (
                  <button
                    type="button"
                    onClick={() => toggleSection(group.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200 text-muted-foreground group-hover:text-foreground",
                        isSectionCollapsed && "-rotate-90"
                      )}
                    />
                  </button>
                )}

                {/* Items in this group */}
                {(!isSectionCollapsed || isCollapsed) && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = isItemActive(item.href);
                      const Icon = item.icon;

                      return (
                        <div
                          key={`${group.id}-${item.href}`}
                          className="relative"
                          onMouseEnter={(e) => {
                            if (isCollapsed) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredItem({
                                label: item.label,
                                category: group.title,
                                badge: item.badge,
                                href: item.href,
                                top: rect.top + rect.height / 2,
                              });
                            }
                          }}
                          onMouseLeave={() => isCollapsed && setHoveredItem(null)}
                        >
                          <Link
                            href={item.href}
                            onClick={() => sound.playClick()}
                            aria-label={item.label}
                            className={cn(
                              "flex items-center rounded-xl text-xs font-medium transition-all duration-200 group relative overflow-hidden cursor-pointer",
                              isCollapsed
                                ? "justify-center p-2.5 w-11 h-11 mx-auto"
                                : "px-3 py-2 gap-3 w-full",
                              isActive
                                ? "bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary font-bold shadow-2xs border border-primary/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-surface-container/80 dark:hover:bg-[#162732]"
                            )}
                          >
                            {/* Active Vertical Pill on Left Edge */}
                            {isActive && (
                              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                            )}

                            <Icon
                              className={cn(
                                "w-4 h-4 transition-transform group-hover:scale-110 shrink-0",
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-primary"
                              )}
                            />

                            {/* Label & Badges in Expanded Mode */}
                            {!isCollapsed && (
                              <div className="flex-1 flex items-center justify-between min-w-0">
                                <span className="truncate text-xs font-medium">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0",
                                      item.badge === "Live"
                                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                        : item.badge === "AI"
                                        ? "bg-primary/15 text-primary border border-primary/30"
                                        : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                                    )}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Status Badge Dots in Collapsed Mode */}
                            {isCollapsed && item.badge && (
                              <span
                                className={cn(
                                  "absolute top-2 right-2 w-1.5 h-1.5 rounded-full",
                                  item.badge === "Live"
                                    ? "bg-emerald-500"
                                    : item.badge === "AI"
                                    ? "bg-primary"
                                    : "bg-purple-500"
                                )}
                              />
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pinned Bottom Status Section */}
        <div
          className={cn(
            "border-t border-border/80 bg-surface-container/20 dark:bg-black/15 shrink-0 transition-all",
            isCollapsed ? "p-2 flex flex-col items-center gap-2.5 py-3" : "p-3 space-y-2.5"
          )}
        >
          {isCollapsed ? (
            <>
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
            </>
          ) : (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-surface-container/60 dark:bg-[#162732] border border-border/70 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-foreground flex items-center gap-1.5">
                    <Microscope className="w-3.5 h-3.5 text-primary" />
                    Clinical Decision Support
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    AUC 0.967
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Bi-LSTM longitudinal trajectory &amp; ClinVar evidence grounded.
                </p>
              </div>

              <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  API Mesh Active
                </span>
                <span className="font-mono text-[9px]">FastAPI 0.111</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Structural Layout Spacer: Synchronized width reserves space for main page content */}
      <div
        className={cn(
          "shrink-0 hidden md:block transition-all duration-300 ease-in-out print:hidden",
          isCollapsed ? "w-16" : "w-64"
        )}
        aria-hidden="true"
      />

      {/* Floating Tooltip in Collapsed Mode (Viewport-anchored, never clipped by container overflow) */}
      {isCollapsed && hoveredItem && (
        <div
          style={{ top: `${hoveredItem.top}px` }}
          className="fixed left-[4.5rem] -translate-y-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100 print:hidden"
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
