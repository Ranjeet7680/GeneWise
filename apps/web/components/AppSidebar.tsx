"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Award,
  Bell,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Dna,
  FileText,
  FlaskConical,
  FolderHeart,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  LayoutGrid,
  LineChart,
  MessageSquare,
  Microscope,
  Network,
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
  Search,
  X,
  Compass,
  Users,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  keywords?: string;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "clinical",
    title: "Clinical Practice",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/family-genetics?tab=risk", label: "Genetic Risk Assessment", icon: Activity, badge: "ACMG", keywords: "risk acmg breast colon cancer" },
      { href: "/family-genetics?tab=carrier", label: "Carrier Screening", icon: FlaskConical, badge: "ClinVar", keywords: "carrier recessive mendelian screening" },
      { href: "/family-genetics?tab=tree", label: "Pedigree Visualizer", icon: Network, badge: "3-Gen", keywords: "pedigree tree family history genealogy" },
      { href: "/family-genetics?tab=cds", label: "Clinical Decision Support", icon: BrainCircuit, badge: "AI", keywords: "decision support cds ai bi-lstm" },
      { href: "/clinician", label: "Clinician Queue", icon: Stethoscope, badge: "MD", keywords: "doctor queue triage reviews" },
      { href: "/clinical-support/find-counselor", label: "Genetic Counseling", icon: Users, badge: "Telehealth", keywords: "counseling counselor appointment" },
    ],
  },
  {
    id: "academy",
    title: "Genomics Academy & Labs",
    items: [
      { href: "/genetics", label: "Genes & Genetics Explorer", icon: Dna, badge: "Catalog", keywords: "genes genetics variants clinvar omim dna mutations" },
      { href: "/academy", label: "Academy Hub", icon: GraduationCap, badge: "Curriculum", keywords: "academy courses lessons learning" },
      { href: "/academy/labs", label: "Virtual Genetics Labs", icon: FlaskConical, badge: "10 Labs", keywords: "labs simulation punnett karyotype pedigree" },
      { href: "/academy/my-courses", label: "My Certificates & Progress", icon: Award, badge: "Certs", keywords: "certificates credentials exams my courses" },
      { href: "/verify-certificate", label: "Public Certificate Registry", icon: CheckCircle2, keywords: "verify registry credential check validation" },
      { href: "/risk-education", label: "Genetics Education Center", icon: BookOpen, keywords: "education interactive guides risk" },
    ],
  },
  {
    id: "assistants",
    title: "AI & Clinical Assistive",
    items: [
      { href: "/assistant", label: "AI Medical Assistant", icon: MessageSquare, badge: "AI", keywords: "chat assistant clinical query" },
      { href: "/assistant/voice", label: "Live Voice Assistant", icon: Radio, badge: "Live", keywords: "voice audio speech realtime" },
      { href: "/clinical-support/discussion-prep", label: "Doctor Discussion Prep", icon: FileText, keywords: "prep questions visit summary" },
      { href: "/clinical-support/scientific-faq", label: "Scientific & Clinical FAQ", icon: Compass, keywords: "faq questions evidence answers" },
    ],
  },
  {
    id: "data_connected",
    title: "Records & Connected Health",
    items: [
      { href: "/my-family-history", label: "Family Health History", icon: FolderHeart, keywords: "history pedigree relatives records" },
      { href: "/reports", label: "Laboratory Reports", icon: FileText, keywords: "reports lab tests vcf sequencing" },
      { href: "/health-metrics", label: "Health Metrics & Trends", icon: HeartPulse, keywords: "metrics vitals biomarkers trends" },
      { href: "/devices/wearables", label: "Wearables & Medical IoT", icon: Watch, badge: "IoT", keywords: "wearables apple watch garmin fitbit iot" },
      { href: "/devices/sensors", label: "Telemetry & Sensor Gateways", icon: Cpu, keywords: "sensors hardware telemetry ecg pulse" },
      { href: "/records", label: "Personal Health Records", icon: FolderHeart, keywords: "ehr phr clinical documentation" },
    ],
  },
  {
    id: "governance",
    title: "Intelligence & Governance",
    items: [
      { href: "/analytics", label: "Analytics & Outcomes", icon: LineChart, keywords: "analytics cohorts stats" },
      { href: "/research", label: "Evidence Library", icon: Microscope, badge: "PubMed", keywords: "pubmed literature citations studies" },
      { href: "/ml-lab", label: "Biomarker ML Studio", icon: Sparkles, badge: "Bi-LSTM", keywords: "machine learning lstm models trajectory" },
      { href: "/notifications", label: "Notification Center", icon: Bell, keywords: "alerts notifications messages" },
      { href: "/admin", label: "Platform Administration", icon: ShieldAlert, badge: "Admin", keywords: "admin governance security audit" },
      { href: "/settings/profile", label: "Profile & Account Settings", icon: Settings, keywords: "settings user profile credentials" },
      { href: "/settings/privacy", label: "Privacy & Consents", icon: ShieldCheck, badge: "GINA", keywords: "privacy consent gina hipaa" },
    ],
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  // Sidebar expansion state: allows toggling between compact rail (w-16) and expanded sidebar (w-[18rem])
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  // Search filter query inside sidebar
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Collapsible section accordions state for expanded mode
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Current URL query string for active tab detection
  const [currentSearch, setCurrentSearch] = useState<string>("");

  // Floating tooltip hover state with viewport top coordinates
  const [hoveredItem, setHoveredItem] = useState<{
    label: string;
    category: string;
    badge?: string;
    href?: string;
    top: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("medipredict_sidebar_collapsed");
        if (stored === "false") {
          setIsCollapsed(false);
        } else {
          setIsCollapsed(true);
        }

        const storedSections = localStorage.getItem("medipredict_sidebar_sections");
        if (storedSections) {
          setCollapsedSections(JSON.parse(storedSections));
        }

        setCurrentSearch(window.location.search);
      } catch {
        // Ignore localStorage issues
      }
    }
  }, [pathname]);

  // Keyboard shortcut: Ctrl + B or [ to toggle sidebar expand / collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && (e.key === "b" || e.key === "B")) || e.key === "[") {
        e.preventDefault();
        toggleSidebar();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K") && !isCollapsed) {
        e.preventDefault();
        const input = document.getElementById("sidebar-search-input");
        if (input) input.focus();
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
    setCollapsedSections((prev) => {
      const next = { ...prev, [sectionId]: !prev[sectionId] };
      try {
        localStorage.setItem("medipredict_sidebar_sections", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Precise active link detection: checks pathname AND tab query parameters so multiple tabs never light up simultaneously
  const isItemActive = (href: string) => {
    const [itemPath, itemQuery] = href.split("?");
    const currentPath = pathname;

    if (itemPath === "/dashboard") {
      return currentPath === "/dashboard" || currentPath === "/";
    }

    if (currentPath !== itemPath && !currentPath.startsWith(`${itemPath}/`)) {
      return false;
    }

    // If item specifies a tab query like ?tab=risk
    if (itemQuery) {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search || currentSearch);
        const itemParams = new URLSearchParams(itemQuery);
        for (const [key, val] of Array.from(itemParams.entries())) {
          if (params.get(key) !== val) return false;
        }
        return true;
      }
      return false;
    }

    // If item does NOT have a tab query, but current URL has ?tab=, do not mark base route as active
    if (typeof window !== "undefined") {
      const currentQuery = window.location.search || currentSearch;
      if (currentQuery && currentQuery.includes("tab=") && itemPath === "/family-genetics") {
        return false;
      }
    }

    return currentPath === itemPath;
  };

  // Filter groups if search is active
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return NAV_GROUPS;
    const query = searchQuery.toLowerCase().trim();

    return NAV_GROUPS.map((group) => {
      const matchedItems = group.items.filter((item) => {
        return (
          item.label.toLowerCase().includes(query) ||
          item.badge?.toLowerCase().includes(query) ||
          item.keywords?.toLowerCase().includes(query)
        );
      });
      return { ...group, items: matchedItems };
    }).filter((group) => group.items.length > 0);
  }, [searchQuery]);

  return (
    <>
      {/* Dynamic Navigation Rail */}
      <aside
        aria-label="Clinical Navigation"
        className={cn(
          "fixed top-16 left-0 bottom-0 z-30 border-r border-border bg-surface-low/95 dark:bg-[#111d24]/95 backdrop-blur-md hidden md:flex flex-col justify-between shrink-0 select-none shadow-xs transition-all duration-300 ease-in-out print:hidden",
          isCollapsed ? "w-16" : "w-[19.5rem]"
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
                <span className="w-2.5 h-2.5 rounded-full bg-[#00837b] animate-pulse" />
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

        {/* Quick Search Filter (When Expanded) */}
        {!isCollapsed && (
          <div className="px-3 pt-2.5 pb-1 border-b border-border/50 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="sidebar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search navigation..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-surface-container/50 dark:bg-[#162732]/70 border border-border/70 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-muted-foreground/70 bg-surface-container px-1 rounded border border-border/50">
                  /
                </kbd>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Navigation Body */}
        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-3 scrollbar-thin scrollbar-thumb-border/60",
            isCollapsed ? "px-2" : "px-3"
          )}
        >
          {filteredGroups.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground space-y-1">
              <p>No matching navigation items.</p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-primary font-bold text-[11px] underline"
              >
                Clear filter
              </button>
            </div>
          ) : (
            filteredGroups.map((group, groupIndex) => {
              const isSectionCollapsed = !searchQuery && (collapsedSections[group.id] || false);

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
                      <span className="flex items-center gap-1.5">
                        {group.title}
                        <span className="text-[9px] font-normal opacity-60">({group.items.length})</span>
                      </span>
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
                              onClick={() => {
                                sound.playClick();
                                setCurrentSearch(item.href.includes("?") ? `?${item.href.split("?")[1]}` : "");
                              }}
                              aria-label={item.label}
                              className={cn(
                                "flex items-center rounded-xl text-xs font-medium transition-all duration-200 group relative overflow-hidden cursor-pointer",
                                isCollapsed
                                  ? "justify-center p-2.5 w-11 h-11 mx-auto"
                                  : "px-3 py-2 gap-2.5 w-full",
                                isActive
                                  ? "bg-[#00837b]/12 text-[#00837b] dark:bg-[#00837b]/20 dark:text-[#2dd4bf] font-bold shadow-2xs border border-[#00837b]/30"
                                  : "text-muted-foreground hover:text-foreground hover:bg-surface-container/80 dark:hover:bg-[#162732]"
                              )}
                            >
                              {/* Precise Active Indicator on Left Edge */}
                              {isActive && (
                                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#00837b]" />
                              )}

                              <Icon
                                className={cn(
                                  "w-4 h-4 transition-transform group-hover:scale-110 shrink-0",
                                  isActive
                                    ? "text-[#00837b] dark:text-[#2dd4bf]"
                                    : "text-muted-foreground group-hover:text-primary"
                                )}
                              />

                              {/* Label & Badges in Expanded Mode */}
                              {!isCollapsed && (
                                <div className="flex-1 flex items-center justify-between gap-1.5 min-w-0">
                                  <span className="text-[12px] font-medium leading-tight truncate text-foreground/90 group-hover:text-foreground">
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <span
                                      className={cn(
                                        "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 transition-colors",
                                        item.badge === "Live"
                                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                          : item.badge === "AI"
                                          ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30"
                                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
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
                                      ? "bg-[#00837b]"
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
            })
          )}
        </div>

        {/* Pinned Bottom Status Section */}
        <div
          className={cn(
            "border-t border-border/80 bg-surface-container/20 dark:bg-black/15 shrink-0 transition-all",
            isCollapsed ? "p-2 flex flex-col items-center gap-2.5 py-3" : "p-3 space-y-2"
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
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
                    AUC 0.967
                  </span>
                </div>
                <p className="text-[10.5px] text-muted-foreground leading-tight">
                  Bi-LSTM longitudinal trajectory &amp; ClinVar grounded.
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

      {/* Structural Layout Spacer */}
      <div
        className={cn(
          "shrink-0 hidden md:block transition-all duration-300 ease-in-out print:hidden",
          isCollapsed ? "w-16" : "w-[19.5rem]"
        )}
        aria-hidden="true"
      />

      {/* Floating Tooltip in Collapsed Mode */}
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
