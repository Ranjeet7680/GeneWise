"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Dna,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Layers,
  ListChecks,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { EducationalRiskCategory, GeneticRiskSummary } from "../types";

interface GeneticRiskEngineViewProps {
  summary: GeneticRiskSummary;
  onNavigateTab: (tabId: string) => void;
}

export default function GeneticRiskEngineView({
  summary,
  onNavigateTab,
}: GeneticRiskEngineViewProps) {
  const [activeEducationTab, setActiveEducationTab] = useState<"ar" | "ad" | "xlinked" | "carrier">("ar");

  const getCategoryBadge = (cat: EducationalRiskCategory) => {
    switch (cat) {
      case "Professional genetic evaluation suggested":
        return {
          bg: "bg-rose-500/10 text-rose-800 dark:text-rose-200 border-rose-500/30",
          icon: AlertTriangle,
          bar: "bg-rose-600",
        };
      case "Further discussion may be useful":
        return {
          bg: "bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/30",
          icon: Info,
          bar: "bg-amber-500",
        };
      case "No clear pattern identified":
        return {
          bg: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/30",
          icon: ShieldCheck,
          bar: "bg-emerald-600",
        };
      case "Insufficient information":
      default:
        return {
          bg: "bg-slate-500/10 text-slate-800 dark:text-slate-200 border-slate-500/30",
          icon: HelpCircle,
          bar: "bg-slate-500",
        };
    }
  };

  const badgeStyle = getCategoryBadge(summary.risk_category);
  const StatusIcon = badgeStyle.icon;

  return (
    <div className="space-y-6">
      {/* Risk Category Announcement Card */}
      <div className={`p-5 rounded-2xl border ${badgeStyle.bg} shadow-xs relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 bottom-0 w-2 ${badgeStyle.bar}`} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/70 dark:bg-black/30 px-2.5 py-0.5 rounded-full border border-current">
                Educational Risk Engine Assessment
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
              <StatusIcon className="w-6 h-6 shrink-0" />
              <span>{summary.risk_category}</span>
            </h2>
            <p className="text-xs opacity-90 max-w-2xl">
              Based on authorized 3-generation family health data and validated clinical documentation. Designed exclusively for health awareness and doctor discussion preparation.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              onClick={() => onNavigateTab("carrier")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Dna className="w-4 h-4" />
              <span>Carrier Guides</span>
            </button>
            <button
              onClick={() => onNavigateTab("counsellors")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-current bg-white/50 dark:bg-black/20 hover:bg-white/80 text-xs font-semibold transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Find Counsellor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Clinical Governance Callout */}
      <div className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/10 dark:bg-sky-950/20 text-sky-900 dark:text-sky-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold">
            Clinical Governance & Evidence Standard: No Definitive Diagnosis
          </p>
          <p className="text-muted-foreground dark:text-sky-300/80">
            {summary.disclaimer}
          </p>
        </div>
      </div>

      {/* 7-Point Structured Clinical Risk Summary */}
      <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600">
              CLINICAL EVIDENCE ENGINE v3.4
            </span>
            <h3 className="text-lg font-bold text-foreground">
              7-Point Educational Risk Assessment Report
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            Standard Format: ACMG & ACOG Education Guidelines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Point 1: Observed Family History */}
          <div className="p-4 rounded-xl border border-border bg-surface-low/40 dark:bg-[#192c38] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Observed Family-History Information</span>
            </h4>
            <ul className="text-xs space-y-1.5 pl-6 list-disc text-foreground">
              {summary.observed_family_history.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Point 2: Relevant Inherited Conditions */}
          <div className="p-4 rounded-xl border border-border bg-surface-low/40 dark:bg-[#192c38] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Relevant Inherited-Condition Information</span>
            </h4>
            <ul className="text-xs space-y-1.5 pl-6 list-disc text-foreground">
              {summary.relevant_inherited_conditions.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Point 3: Why Pattern May Deserve Attention */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Why the Pattern May Deserve Attention</span>
            </h4>
            <ul className="text-xs space-y-1.5 pl-6 list-disc text-foreground">
              {summary.why_pattern_deserves_attention.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Point 4: Missing Information */}
          <div className="p-4 rounded-xl border border-slate-400/30 bg-slate-500/5 dark:bg-slate-900/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-600 text-white flex items-center justify-center text-[10px]">
                4
              </span>
              <span>Missing Information & Pedigree Gaps</span>
            </h4>
            <ul className="text-xs space-y-1.5 pl-6 list-disc text-foreground">
              {summary.missing_information.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Point 5: Evidence & Source References */}
          <div className="p-4 rounded-xl border border-border bg-surface-low/40 dark:bg-[#192c38] space-y-2 md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                5
              </span>
              <span>Medical Evidence & Scientific Reference Layer</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {summary.evidence_and_sources.map((src, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border/80 bg-white dark:bg-[#14232d] text-xs flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                      {src.level || "Clinical Reference"}
                    </span>
                    <h5 className="font-semibold text-foreground mt-0.5">{src.title}</h5>
                    <p className="text-[11px] text-muted-foreground">{src.source}</p>
                  </div>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-teal-600 hover:text-teal-700 font-semibold mt-2 hover:underline"
                    >
                      <span>Read Guidelines</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Point 6: Suggested Questions for Clinician */}
          <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 dark:bg-teal-950/10 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                6
              </span>
              <span>Suggested Questions for Qualified Clinicians</span>
            </h4>
            <ul className="text-xs space-y-2 pl-6 list-decimal text-foreground">
              {summary.suggested_clinician_questions.map((q, idx) => (
                <li key={idx} className="font-medium">
                  {q}
                </li>
              ))}
            </ul>
          </div>

          {/* Point 7: Recommended Next Steps */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                7
              </span>
              <span>Recommended Next Steps & Action Plan</span>
            </h4>
            <ul className="text-xs space-y-2 pl-6 list-disc text-foreground">
              {summary.recommended_next_steps.map((step, idx) => (
                <li key={idx} className="font-medium">
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Inheritance Patterns Education Hub */}
      <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600">
              GENETIC EDUCATION CENTER
            </span>
            <h3 className="text-base font-bold text-foreground">
              Understand How Genes & Health Traits Are Passed Down
            </h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-low dark:bg-[#1c303d] border border-border text-xs">
            <button
              onClick={() => setActiveEducationTab("ar")}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                activeEducationTab === "ar"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Autosomal Recessive
            </button>
            <button
              onClick={() => setActiveEducationTab("ad")}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                activeEducationTab === "ad"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Autosomal Dominant
            </button>
            <button
              onClick={() => setActiveEducationTab("xlinked")}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                activeEducationTab === "xlinked"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              X-Linked
            </button>
            <button
              onClick={() => setActiveEducationTab("carrier")}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                activeEducationTab === "carrier"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Carrier Guidance
            </button>
          </div>
        </div>

        {/* Tab 1: Autosomal Recessive */}
        {activeEducationTab === "ar" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fade-in">
            <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-2">
              <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px]">Transmission Mechanics</span>
              <h4 className="font-bold text-foreground text-sm">Two Gene Copies Required</h4>
              <p className="text-muted-foreground">
                An autosomal recessive condition occurs only when a person inherits two altered copies of a specific gene (one from each biological parent). Parents typically carry one altered copy and one typical copy, remaining asymptomatic.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-2">
              <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px]">Reproductive Probability</span>
              <h4 className="font-bold text-foreground text-sm">25% Affected / 50% Carrier / 25% Neither</h4>
              <p className="text-muted-foreground">
                When both biological parents are carriers for the same recessive gene, each pregnancy has a 25% (1 in 4) chance of being affected, a 50% chance of being an asymptomatic carrier, and a 25% chance of inheriting neither altered copy.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-2">
              <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px]">Classic Examples</span>
              <h4 className="font-bold text-foreground text-sm">Hemoglobinopathies & Rare Disorders</h4>
              <p className="text-muted-foreground">
                Beta Thalassemia (HBB), Sickle Cell Disease (HBB), Cystic Fibrosis (CFTR), Spinal Muscular Atrophy (SMN1), and Tay-Sachs Disease (HEXA). Horizontal pattern in siblings with unaffected parents.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Autosomal Dominant */}
        {activeEducationTab === "ad" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fade-in">
            <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-2">
              <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px]">Transmission Mechanics</span>
              <h4 className="font-bold text-foreground text-sm">Single Altered Copy Sufficient</h4>
              <p className="text-muted-foreground">
                In autosomal dominant inheritance, an alteration in only one copy of the gene is sufficient to cause or increase susceptibility to the condition. It affects males and females equally.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-2">
              <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px]">Reproductive Probability</span>
              <h4 className="font-bold text-foreground text-sm">50% Transmission Each Pregnancy</h4>
              <p className="text-muted-foreground">
                An affected individual has a 50% (1 in 2) chance of passing the altered gene to each child. Vertical transmission is visible across multiple successive generations, with male-to-male transmission possible.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-2">
              <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px]">Classic Examples</span>
              <h4 className="font-bold text-foreground text-sm">Hereditary Syndromes & Hyperlipidemia</h4>
              <p className="text-muted-foreground">
                Familial Hypercholesterolemia (LDLR, APOB), Lynch Syndrome (MLH1, MSH2), Marfan Syndrome (FBN1), and Hereditary Breast and Ovarian Cancer (BRCA1/2). Note incomplete penetrance may occur.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: X-Linked */}
        {activeEducationTab === "xlinked" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fade-in">
            <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-2">
              <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px]">Chromosomal Basis</span>
              <h4 className="font-bold text-foreground text-sm">Gene Located on X Chromosome</h4>
              <p className="text-muted-foreground">
                Males have one X and one Y chromosome (XY). Females have two X chromosomes (XX). In X-linked recessive disorders, males are primarily affected because they have only one X chromosome copy.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-2">
              <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px]">Transmission Rules</span>
              <h4 className="font-bold text-foreground text-sm">No Male-to-Male Transmission</h4>
              <p className="text-muted-foreground">
                Fathers pass their Y chromosome to sons and X to daughters. An affected male cannot transmit an X-linked condition to his sons, but all his daughters will be obligate carriers. A carrier female has a 50% chance of passing it to each son (affected) or daughter (carrier).
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-2">
              <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px]">Classic Examples</span>
              <h4 className="font-bold text-foreground text-sm">Hemophilia & Muscular Dystrophies</h4>
              <p className="text-muted-foreground">
                Hemophilia A and B (F8, F9), Duchenne and Becker Muscular Dystrophy (DMD), and Fragile X Syndrome (FMR1).
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Carrier Guidance */}
        {activeEducationTab === "carrier" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fade-in">
            <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-2">
              <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px]">What is Carrier Status?</span>
              <h4 className="font-bold text-foreground text-sm">Healthy Individual with One Variant</h4>
              <p className="text-muted-foreground">
                A carrier has one altered copy and one typical copy of a recessive gene. Carriers are usually completely healthy, though subtle laboratory markers (like low MCV in Thalassemia trait) may be detected.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-2">
              <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px]">Partner Testing Is Key</span>
              <h4 className="font-bold text-foreground text-sm">Assessing Reproductive Risk</h4>
              <p className="text-muted-foreground">
                A carrier status has clinical significance primarily when planning children. Both partners must be tested. If only one partner is a carrier, their children will not have the condition, though they may also be carriers.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-2">
              <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px]">Actionable Steps</span>
              <h4 className="font-bold text-foreground text-sm">Preconception Genetic Counseling</h4>
              <p className="text-muted-foreground">
                If you are a known carrier, consult a genetic counselor to explore carrier screening for your partner, pre-implantation genetic diagnosis, or prenatal diagnostic options.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
