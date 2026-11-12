"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  Search,
  Sparkles,
} from "lucide-react";
import PublicDocShell, {
  PUBLIC_DOC_SECTIONS,
  PublicDocSection,
  renderPublicDocIcon,
} from "@/components/PublicDocShell";
import SafetyNotice from "@/components/SafetyNotice";
import { sound } from "@/lib/sound";

type DocFilterId = "all" | PublicDocSection["id"];

export default function DocumentationPortalPage() {
  const [selectedSection, setSelectedSection] = useState<DocFilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PUBLIC_DOC_SECTIONS.filter(
      (sec) => selectedSection === "all" || sec.id === selectedSection
    )
      .map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (item) =>
            q.length === 0 ||
            item.title.toLowerCase().includes(q) ||
            item.shortDesc.toLowerCase().includes(q) ||
            item.badge.toLowerCase().includes(q) ||
            sec.label.toLowerCase().includes(q)
        ),
      }))
      .filter((sec) => sec.items.length > 0);
  }, [selectedSection, searchQuery]);

  return (
    <PublicDocShell
      sectionLabel="DOCUMENTATION"
      pageTitle="Institutional Documentary Portal"
      activeHref="/documentation"
    >
      {/* Hero Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#062d2a] via-[#0a4a44] to-[#0f645c] text-white shadow-xl border border-teal-400/25 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider text-teal-200">
            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
            Open Access Documentary Hub
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-300/30 text-[10px] font-mono font-bold text-emerald-200">
            <Lock className="w-3 h-3" /> Outside Dashboard · Public Reference
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          GeneWise Governance, Data Lineage &amp; Clinical Support Documentary Library
        </h1>
        <p className="text-xs sm:text-sm text-teal-100/85 max-w-2xl leading-relaxed">
          Browse our public constitutional charters, scientific database provenance ledgers, and board-certified patient preparation resources without signing in to the clinical workspace.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-teal-100/90">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> 3 Governance Protocols
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> 3 Open Genomic Sources
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> 3 Clinical Support Tools
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl bg-white dark:bg-[#102027] border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "all" as const, label: "All Sections (9)" },
            { id: "governance" as const, label: "Governance" },
            { id: "data-lineage" as const, label: "Data Lineage" },
            { id: "clinical-support" as const, label: "Clinical Support" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.playSoft();
                setSelectedSection(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSection === tab.id
                  ? "bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white shadow-xs"
                  : "bg-surface-low border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search charters, ClinVar, FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-surface-low focus:outline-none focus:ring-2 focus:ring-teal-500/25"
          />
        </div>
      </div>

      {/* Categorized Documentary Grids */}
      {filteredSections.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#102027] border border-border p-10 text-center space-y-2">
          <Sparkles className="w-6 h-6 text-teal-600 mx-auto" />
          <p className="text-sm font-bold text-foreground">No matching documentary entries</p>
          <p className="text-xs text-muted-foreground">
            Try clearing your search filter or selecting All Sections.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredSections.map((sec) => (
            <section key={sec.id} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 pb-2 border-b border-border/70">
                <div>
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                    {sec.label}
                  </span>
                  <p className="text-xs text-muted-foreground">{sec.summary}</p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {sec.items.length} documents
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sec.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => sound.playClick()}
                    className="group rounded-2xl bg-white dark:bg-[#102027] border border-border hover:border-teal-500/45 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-700 dark:text-teal-300 group-hover:scale-105 transition-transform">
                          {renderPublicDocIcon(item.iconKey, "w-4 h-4")}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-low border border-border font-mono text-[10px] font-semibold text-muted-foreground">
                          {item.badge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-sm font-extrabold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                          {item.title}
                        </h2>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.shortDesc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-muted-foreground">{item.readTime}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-teal-700 dark:text-teal-300 group-hover:translate-x-0.5 transition-transform">
                        <span>Read Documentary</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <SafetyNotice />
    </PublicDocShell>
  );
}
