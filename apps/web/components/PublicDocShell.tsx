"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  BookOpen,
  ChevronRight,
  Database,
  FileQuestion,
  FileText,
  Home,
  LayoutGrid,
  Moon,
  Network,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Sun,
  UserCheck,
} from "lucide-react";
import MediPredictLogo from "@/components/MediPredictLogo";
import { useAuth } from "@/lib/auth";
import { sound } from "@/lib/sound";
import { useTheme } from "@/lib/theme";

export interface PublicDocItem {
  title: string;
  href: string;
  shortDesc: string;
  badge: string;
  readTime: string;
  iconKey:
    | "shield"
    | "scale"
    | "ban"
    | "database"
    | "citations"
    | "network"
    | "counselor"
    | "stethoscope"
    | "faq";
}

export interface PublicDocSection {
  id: "governance" | "data-lineage" | "clinical-support";
  label: string;
  summary: string;
  items: PublicDocItem[];
}

export const PUBLIC_DOC_SECTIONS: PublicDocSection[] = [
  {
    id: "governance",
    label: "GOVERNANCE",
    summary: "Privacy protections, non-diagnostic scope, and zero-commercialization charters.",
    items: [
      {
        title: "Privacy Charter",
        href: "/governance/privacy-charter",
        shortDesc: "Client-side AES-256 encryption, pseudonymity & 1-click purge rights.",
        badge: "ISO 27701",
        readTime: "4 min read",
        iconKey: "shield",
      },
      {
        title: "Terms of Educational Use",
        href: "/governance/terms",
        shortDesc: "Institutional clinical support boundaries and educational disclosures.",
        badge: "GW-TOU-2025.1",
        readTime: "5 min read",
        iconKey: "scale",
      },
      {
        title: "Zero-Sale Pledge",
        href: "/governance/zero-sale-pledge",
        shortDesc: "Binding covenant against commercializing hereditary health data.",
        badge: "GW-ZSP-2025",
        readTime: "3 min read",
        iconKey: "ban",
      },
    ],
  },
  {
    id: "data-lineage",
    label: "DATA LINEAGE",
    summary: "Open science provenance, ClinVar panel ratings & Orphanet mappings.",
    items: [
      {
        title: "Kaggle Genomic Hub",
        href: "/data-lineage?source=kaggle",
        shortDesc: "Curated rare-disease training & validation dataset provenance (v2.4).",
        badge: "Kaggle v2.4",
        readTime: "4 min read",
        iconKey: "database",
      },
      {
        title: "NCBI ClinVar Citations",
        href: "/data-lineage?source=clinvar",
        shortDesc: "Peer-reviewed variant classifications & expert panel citations.",
        badge: "GRCh38.p14",
        readTime: "4 min read",
        iconKey: "citations",
      },
      {
        title: "Orphanet Database",
        href: "/data-lineage?source=orphanet",
        shortDesc: "Rare disorder ontologies harmonized across ORPHA & OMIM IDs.",
        badge: "ORPHA / OMIM",
        readTime: "4 min read",
        iconKey: "network",
      },
    ],
  },
  {
    id: "clinical-support",
    label: "CLINICAL SUPPORT",
    summary: "Genetic counselor directory, visit prep toolkit & scientific FAQs.",
    items: [
      {
        title: "Find a Genetic Counselor",
        href: "/clinical-support/find-counselor",
        shortDesc: "Browse board-certified NSGC & ABGC genetic counseling specialists.",
        badge: "NSGC / ABGC",
        readTime: "Directory",
        iconKey: "counselor",
      },
      {
        title: "Doctor Discussion Prep",
        href: "/clinical-support/discussion-prep",
        shortDesc: "Interactive 4-step consultation wizard with printable clinic summary.",
        badge: "Interactive",
        readTime: "4-Step Tool",
        iconKey: "stethoscope",
      },
      {
        title: "Scientific FAQ",
        href: "/clinical-support/scientific-faq",
        shortDesc: "Evidence-grounded genetics literacy, ACMG rules & GINA guidance.",
        badge: "ACMG / GINA",
        readTime: "6 min read",
        iconKey: "faq",
      },
    ],
  },
];

export const ALL_PUBLIC_DOC_ITEMS: PublicDocItem[] = PUBLIC_DOC_SECTIONS.flatMap(
  (sec) => sec.items
);

export function renderPublicDocIcon(
  iconKey: PublicDocItem["iconKey"],
  className = "w-4 h-4"
) {
  switch (iconKey) {
    case "shield":
      return <ShieldCheck className={className} />;
    case "scale":
      return <Scale className={className} />;
    case "ban":
      return <Ban className={className} />;
    case "database":
      return <Database className={className} />;
    case "citations":
      return <FileText className={className} />;
    case "network":
      return <Network className={className} />;
    case "counselor":
      return <UserCheck className={className} />;
    case "stethoscope":
      return <Stethoscope className={className} />;
    case "faq":
      return <FileQuestion className={className} />;
  }
}

interface PublicDocShellProps {
  sectionLabel: "GOVERNANCE" | "DATA LINEAGE" | "CLINICAL SUPPORT" | "DOCUMENTATION";
  pageTitle: string;
  activeHref?: string;
  children: React.ReactNode;
}

/**
 * Public documentary layout rendered completely outside the clinical dashboard
 * workspace chrome for institutional Governance, Data Lineage, and Clinical Support docs.
 */
export default function PublicDocShell({
  sectionLabel,
  pageTitle,
  activeHref,
  children,
}: PublicDocShellProps) {
  const pathname = usePathname() || "";
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const resolvedHref = activeHref || pathname;
  const currentIndex = ALL_PUBLIC_DOC_ITEMS.findIndex(
    (item) => item.href === resolvedHref || item.href.split("?")[0] === resolvedHref
  );
  const prevDoc = currentIndex > 0 ? ALL_PUBLIC_DOC_ITEMS[currentIndex - 1] : null;
  const nextDoc =
    currentIndex >= 0 && currentIndex < ALL_PUBLIC_DOC_ITEMS.length - 1
      ? ALL_PUBLIC_DOC_ITEMS[currentIndex + 1]
      : null;

  return (
    <div
      data-testid="public-doc-shell"
      className="min-h-screen flex flex-col bg-[#f4fbfa] dark:bg-[#081318] text-foreground relative overflow-x-clip"
    >
      {/* Subtle Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-16 w-[420px] h-[420px] bg-gradient-to-br from-teal-400/18 via-emerald-400/10 to-transparent rounded-full blur-[110px]" />
        <div className="absolute bottom-0 right-0 w-[440px] h-[440px] bg-gradient-to-tl from-cyan-400/14 via-teal-500/10 to-transparent rounded-full blur-[120px]" />
      </div>

      {/* Public Documentary Top Navbar (Outside Dashboard) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/85 dark:bg-[#0c181d]/90 border-b border-teal-500/15 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <MediPredictLogo href="/" size="sm" brand="genewise" showSubtitle={true} />
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              <BookOpen className="w-3 h-3" />
              Public Documentary Library
            </span>
          </div>

          <nav
            aria-label="Documentary categories"
            className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-slate-100/85 dark:bg-[#13252d]/85 border border-teal-500/15 text-[11px] font-semibold"
          >
            <Link
              href="/documentation"
              onClick={() => sound.playSoft()}
              className={`px-3 py-1 rounded-full transition-colors inline-flex items-center gap-1.5 ${
                pathname === "/documentation"
                  ? "bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>All Docs</span>
            </Link>
            <Link
              href="/governance/privacy-charter"
              onClick={() => sound.playSoft()}
              className={`px-3 py-1 rounded-full transition-colors ${
                sectionLabel === "GOVERNANCE"
                  ? "bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Governance
            </Link>
            <Link
              href="/data-lineage?source=kaggle"
              onClick={() => sound.playSoft()}
              className={`px-3 py-1 rounded-full transition-colors ${
                sectionLabel === "DATA LINEAGE"
                  ? "bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Data Lineage
            </Link>
            <Link
              href="/clinical-support/find-counselor"
              onClick={() => sound.playSoft()}
              className={`px-3 py-1 rounded-full transition-colors ${
                sectionLabel === "CLINICAL SUPPORT"
                  ? "bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Clinical Support
            </Link>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playSoft();
                toggleTheme();
              }}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="w-8 h-8 rounded-xl border border-border bg-white/80 dark:bg-[#13252d] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-teal-500/40 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/"
              onClick={() => sound.playSoft()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-white/80 dark:bg-[#13252d] hover:border-teal-500/40 text-xs font-semibold text-foreground transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Home</span>
            </Link>

            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#004d47] to-[#00635e] hover:from-[#003833] hover:to-[#004d47] text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>{isAuthenticated ? "Open Workspace" : "Launch App"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Public Documentary Body */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/70 text-[11px] print:hidden">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
            <Link href="/" className="hover:text-teal-700 dark:hover:text-teal-300 font-medium inline-flex items-center gap-1">
              <Home className="w-3 h-3" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <Link href="/documentation" className="hover:text-teal-700 dark:hover:text-teal-300 font-medium">
              Documentation
            </Link>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <span className="font-mono font-bold text-teal-700 dark:text-teal-300">{sectionLabel}</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <span className="font-semibold text-foreground">{pageTitle}</span>
          </nav>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-300">
            Open Access · No Login Required
          </span>
        </div>

        {/* Mobile / Tablet Quick Horizontal Documentary Switcher */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-1 py-1 -mx-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden print:hidden">
          <Link
            href="/documentation"
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border active:scale-95 transition-all touch-manipulation ${
              pathname === "/documentation"
                ? "bg-teal-700 text-white border-teal-700 shadow-2xs"
                : "bg-white dark:bg-[#13252d] border-border text-muted-foreground"
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            <span>All Docs</span>
          </Link>
          {ALL_PUBLIC_DOC_ITEMS.map((item) => {
            const isActive = resolvedHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border active:scale-95 transition-all touch-manipulation ${
                  isActive
                    ? "bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white border-teal-600 shadow-xs"
                    : "bg-white dark:bg-[#13252d] border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {renderPublicDocIcon(item.iconKey, "w-3 h-3")}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Sticky Documentary Navigation Rail (NOT Dashboard Sidebar) */}
          <aside
            aria-label="Documentary index navigation"
            className="hidden lg:block lg:col-span-3 sticky top-22 space-y-4 print:hidden"
          >
            <div className="rounded-2xl bg-white/90 dark:bg-[#102027]/90 border border-teal-500/20 p-4 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <Link
                  href="/documentation"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-800 dark:text-teal-200 hover:underline"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>All Documentary Portal</span>
                </Link>
                <span className="text-[10px] font-mono text-muted-foreground">9 Guides</span>
              </div>

              {PUBLIC_DOC_SECTIONS.map((sec) => (
                <div key={sec.id} className="space-y-1.5">
                  <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-muted-foreground px-2">
                    {sec.label}
                  </p>
                  <div className="space-y-1">
                    {sec.items.map((item) => {
                      const isActive =
                        resolvedHref === item.href ||
                        (item.href.indexOf("?") === -1 && pathname === item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => sound.playSoft()}
                          className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white font-bold shadow-xs"
                              : "text-foreground/85 hover:bg-teal-500/10 hover:text-teal-800 dark:hover:text-teal-200 font-medium"
                          }`}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className={`shrink-0 ${
                                isActive
                                  ? "text-emerald-200"
                                  : "text-teal-600 dark:text-teal-400"
                              }`}
                            >
                              {renderPublicDocIcon(item.iconKey, "w-3.5 h-3.5")}
                            </span>
                            <span className="truncate">{item.title}</span>
                          </span>
                          <ChevronRight
                            className={`w-3 h-3 shrink-0 transition-transform ${
                              isActive
                                ? "opacity-100 translate-x-0.5"
                                : "opacity-0 group-hover:opacity-70"
                            }`}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Guidance Card */}
            <div className="rounded-2xl bg-red-500/8 border border-red-500/25 p-4 space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                EMERGENCY CARE
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                For acute symptoms or clinical emergencies, dial local emergency dispatch (911 / 112) immediately instead of consulting documentation.
              </p>
            </div>
          </aside>

          {/* Primary Documentary Content Pane */}
          <main className="lg:col-span-9 min-w-0 space-y-6 animate-fade-in-up print:col-span-12 print:w-full print:p-0 print:m-0">
            {children}

            {/* Previous / Next Documentary Navigation Cards */}
            {(prevDoc || nextDoc) && (
              <div className="pt-4 border-t border-border/70 grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
                {prevDoc ? (
                  <Link
                    href={prevDoc.href}
                    onClick={() => sound.playSoft()}
                    className="group p-4 rounded-2xl bg-white/85 dark:bg-[#102027]/85 border border-border hover:border-teal-500/40 transition-all flex items-center gap-3"
                  >
                    <ArrowLeft className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                        Previous Document
                      </span>
                      <span className="text-xs font-bold text-foreground truncate block">
                        {prevDoc.title}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}

                {nextDoc && (
                  <Link
                    href={nextDoc.href}
                    onClick={() => sound.playSoft()}
                    className="group p-4 rounded-2xl bg-white/85 dark:bg-[#102027]/85 border border-border hover:border-teal-500/40 transition-all flex items-center justify-end gap-3 text-right"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                        Next Document
                      </span>
                      <span className="text-xs font-bold text-foreground truncate block">
                        {nextDoc.title}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Institutional Public Footer */}
      <footer className="relative z-10 mt-12 border-t border-border bg-white/95 dark:bg-[#111f26]/95 backdrop-blur-md text-muted-foreground text-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {PUBLIC_DOC_SECTIONS.map((sec) => (
              <div key={sec.id} className="space-y-3">
                <p className="font-bold uppercase tracking-wider text-foreground text-[11px]">
                  {sec.label}
                </p>
                <ul className="space-y-2 text-xs">
                  {sec.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-red-600 dark:text-red-400 text-[11px] flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> EMERGENCY CARE
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                In case of acute symptoms or sudden clinical crisis, do not consult this portal. Contact local emergency services (e.g. 911 or local healthcare dispatcher) immediately.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>
              <strong className="text-foreground">GeneWise</strong> • Clinical-grade genetics literacy &amp; Open Documentation
            </p>
            <p>© 2025 GeneWise. HIPAA &amp; GDPR Aligned</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
