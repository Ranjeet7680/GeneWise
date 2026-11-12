"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Dna,
  FileText,
  FolderHeart,
  HeartPulse,
  LayoutDashboard,
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
  Zap,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

interface NavGroup {
  id: string;
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
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

  // Sidebar expansion state: false = Full expanded (w-64), true = Short / compact rail (w-16)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Collapsible section accordions state for expanded mode
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Tooltip hover state in short / collapsed mode
  const [hoveredItem, setHoveredItem] = useState<{
    label: string;
    category: string;
    badge?: string;
  } | null>(null);

  // Initialize from localStorage preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("medipredict_sidebar_collapsed");
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    }
  }, []);

  // Keyboard shortcut: Ctrl + B or [ to toggle sidebar short / expanded mode
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
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("medipredict_sidebar_collapsed", next ? "true" : "false");
    }
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
    <aside
      className={cn(
        "border-r border-border bg-surface-low/50 dark:bg-[#111d24]/70 backdrop-blur-xs flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out relative select-none",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Top Sidebar Header with Shorten / Expand Toggle */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div
          className={cn(
            "flex items-center border-b border-border/80 px-3 py-2.5 bg-surface-container/30 dark:bg-black/10 transition-all",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Navigation
              </span>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            title={
              isCollapsed
                ? "Expand sidebar (Ctrl + B)"
                : "Shorten sidebar to compact mode (Ctrl + B)"
            }
            className={cn(
              "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-container dark:hover:bg-[#1a2c38] transition-all cursor-pointer flex items-center gap-1 group",
              isCollapsed && "w-10 h-10 justify-center"
            )}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-primary group-hover:scale-115 transition-transform" />
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground">
                <span className="text-[10px] font-semibold text-muted-foreground/80 group-hover:text-primary transition-colors">
                  Shorten
                </span>
                <PanelLeftClose className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
            )}
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 scrollbar-thin">
          {NAV_GROUPS.map((group) => {
            const isGroupCollapsed = !!collapsedSections[group.id];

            return (
              <div key={group.id} className="space-y-1">
                {/* Section Header */}
                {!isCollapsed ? (
                  <button
                    onClick={() => toggleSection(group.id)}
                    title={isGroupCollapsed ? `Expand ${group.title}` : `Collapse ${group.title}`}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground transition-colors group cursor-pointer"
                  >
                    <span className="truncate">{group.title}</span>
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 text-muted-foreground/60 group-hover:text-foreground transition-transform duration-200",
                        isGroupCollapsed && "-rotate-90"
                      )}
                    />
                  </button>
                ) : (
                  <div className="w-full flex justify-center py-1">
                    <div className="w-6 h-px bg-border/80" />
                  </div>
                )}

                {/* Items Container */}
                {(!isGroupCollapsed || isCollapsed) && (
                  <div className="space-y-0.5 pt-0.5">
                    {group.items.map((item) => {
                      const isActive = isItemActive(item.href);
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.href}
                          className="relative"
                          onMouseEnter={() =>
                            isCollapsed &&
                            setHoveredItem({
                              label: item.label,
                              category: group.title,
                              badge: item.badge,
                            })
                          }
                          onMouseLeave={() => isCollapsed && setHoveredItem(null)}
                        >
                          <Link
                            href={item.href}
                            onClick={() => sound.playClick()}
                            className={cn(
                              "flex items-center rounded-xl text-xs font-medium transition-all duration-200 group relative overflow-hidden",
                              isCollapsed
                                ? "justify-center p-2.5 w-11 h-11 mx-auto"
                                : "justify-between px-3 py-2",
                              isActive
                                ? "bg-primary/12 text-primary dark:bg-primary/20 dark:text-primary font-semibold shadow-2xs border border-primary/25"
                                : "text-muted-foreground hover:text-foreground hover:bg-surface-container/70 dark:hover:bg-[#162732] hover:translate-x-0.5"
                            )}
                          >
                            {/* Active Vertical Indicator in Short Mode */}
                            {isActive && isCollapsed && (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
                            )}

                            <div className="flex items-center gap-2.5">
                              <Icon
                                className={cn(
                                  "w-4 h-4 transition-transform group-hover:scale-115 shrink-0",
                                  isActive
                                    ? "text-primary"
                                    : "text-muted-foreground group-hover:text-primary"
                                )}
                              />
                              {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </div>

                            {/* Badge in Expanded Mode */}
                            {!isCollapsed && item.badge && (
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide shrink-0",
                                  item.badge === "AI"
                                    ? "bg-primary text-primary-foreground shadow-2xs"
                                    : item.badge === "Live"
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse"
                                    : item.badge === "MD"
                                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                                    : "bg-surface-container dark:bg-[#1a2c38] text-primary border border-primary/20"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}

                            {/* Dot Badge in Short Mode */}
                            {isCollapsed && item.badge && (
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
                          </Link>

                          {/* Floating Tooltip in Short Mode */}
                          {isCollapsed && hoveredItem?.label === item.label && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                              <div className="rounded-xl bg-slate-900/95 dark:bg-[#162732]/95 backdrop-blur-md text-white border border-slate-700/60 dark:border-border/80 shadow-2xl p-2.5 whitespace-nowrap min-w-[140px]">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold leading-tight">
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-primary text-white">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {group.title}
                                </span>
                                {isActive && (
                                  <span className="text-[9px] font-semibold text-emerald-400 block mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Current View
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Section */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-border/80 space-y-2 bg-surface-container/20 dark:bg-black/10 transition-all">
          <div className="p-2 rounded-lg bg-surface-container/70 dark:bg-[#162732] border border-border text-[11px] space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px]">API Mesh Active</span>
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/80">FastAPI 0.111</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-surface-container/40 dark:bg-[#162732]/60 border border-border/50 text-[10px] text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground flex items-center gap-1 mb-0.5">
              <Microscope className="w-3 h-3 text-primary" /> Clinical Decision Support
            </p>
            GeneWise grounds insights in peer-reviewed evidence.
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-border/80 flex flex-col items-center gap-2 py-3">
          <button
            onClick={toggleSidebar}
            title="Expand menu bar"
            className="w-10 h-10 rounded-xl bg-surface-container dark:bg-[#162732] hover:bg-primary/10 text-muted-foreground hover:text-primary flex items-center justify-center transition-all cursor-pointer border border-border"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div
            title="FastAPI 0.111 Mesh Online"
            className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse cursor-help"
          />
        </div>
      )}
    </aside>
  );
}
