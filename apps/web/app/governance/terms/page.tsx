"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileCheck,
  FileText,
  HelpCircle,
  Lock,
  PhoneCall,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import PublicDocShell from "@/components/PublicDocShell";
import SafetyNotice from "@/components/SafetyNotice";
import { sound } from "@/lib/sound";

export default function TermsOfEducationalUsePage() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <PublicDocShell
      sectionLabel="GOVERNANCE"
      pageTitle="Terms of Educational Use"
      activeHref="/governance/terms"
    >
      <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25">
                <Scale className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Governance Protocol · Clinical Decision Support Boundary
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  Terms of Educational Use
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              GeneWise is designed exclusively as an educational literacy platform and patient communication bridge. Please review our institutional non-diagnostic framework and clinical terms of use.
            </p>
          </div>

          {/* Emergency Safety Alert */}
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-red-900 dark:text-red-300">
                Non-Emergency Notice · Immediate Medical Attention
              </p>
              <p className="text-red-800/90 dark:text-red-300/80 leading-relaxed text-[11px]">
                If you or a loved one are experiencing acute medical symptoms, sudden chest discomfort, neurological deficit, or severe pain, do not navigate this software. Dial emergency dispatch (112 / 911) or report immediately to the nearest hospital triage facility.
              </p>
            </div>
          </div>

          {/* Core Institutional Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-[#162730] border border-border shadow-2xs space-y-1.5">
              <span className="p-2 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 inline-block">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-foreground">100% Educational</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                All probabilities, pedigree visualizers, and ClinVar references are for genetic literacy, not definitive diagnostic determinations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#162730] border border-border shadow-2xs space-y-1.5">
              <span className="p-2 rounded-lg bg-primary/10 text-primary inline-block">
                <Stethoscope className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-foreground">Physician Bridge</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Portfolios and checklists are formatted specifically to facilitate informed discussions with board-certified medical geneticists.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#162730] border border-border shadow-2xs space-y-1.5">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-block">
                <Lock className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-foreground">Zero Raw DNA Storage</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                GeneWise does not process or warehouse raw FASTQ, BAM, or VCF sequence files, guaranteeing zero biological re-identification.
              </p>
            </div>
          </div>

          {/* Document Sections */}
          <div className="space-y-4 text-xs leading-relaxed">
            {/* Section 1 */}
            <article className="p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                  1
                </span>
                <h2 className="font-bold text-sm text-foreground">
                  Educational Scope & Non-Diagnostic Clinical Device Boundary
                </h2>
              </div>
              <p className="text-muted-foreground">
                GeneWise (&quot;the Platform&quot;) provides hereditary education, probabilistic pedigree modeling, and curated open-source scientific genomic summaries (derived from NCBI ClinVar, Orphanet, and Kaggle Genomic research corpora).
              </p>
              <p className="text-muted-foreground">
                The Platform does <strong className="text-foreground">not</strong> constitute a clinical in-vitro diagnostic medical device (IVD) under 21 CFR § 809 or European Medical Device Regulation (EU MDR 2017/745). No calculations, Mendelian segregation odds, or risk tier badges produced by GeneWise should ever replace molecular genetic laboratory testing (e.g. Sanger sequencing, next-generation targeted panels, or chromosomal microarray) ordered by a licensed physician.
              </p>
            </article>

            {/* Section 2 */}
            <article className="p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                  2
                </span>
                <h2 className="font-bold text-sm text-foreground">
                  Proband Self-Reporting & Family Pedigree Accuracy
                </h2>
              </div>
              <p className="text-muted-foreground">
                Family history diagrams, generation links, and self-reported health milestones entered into GeneWise reflect only the accuracy of user submissions. The Platform does not verify kinship or maternal/paternal biological relationships. Users acknowledge that:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Pedigree algorithms assume standard Mendelian segregation frequencies unless modified by user-documented penetrance parameters.</li>
                <li>Non-paternity, unrecorded adoptions, and variable expressivity can substantially alter true empirical recurrence risks.</li>
                <li>Checklists generated by GeneWise should be reviewed and verified by a board-certified genetic counselor (CGC/ABGC) prior to making reproductive or surgical decisions.</li>
              </ul>
            </article>

            {/* Section 3 */}
            <article className="p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                  3
                </span>
                <h2 className="font-bold text-sm text-foreground">
                  Open Genomic Data Lineage & Scientific Currency
                </h2>
              </div>
              <p className="text-muted-foreground">
                GeneWise synthesizes variant interpretations from the National Center for Biotechnology Information (NCBI) ClinVar registry and Orphanet. Genetic knowledge evolves rapidly:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>A variant previously classified as a Variant of Uncertain Significance (VUS) may be reclassified as Likely Pathogenic or Benign as clinical evidence expands.</li>
                <li>While GeneWise syncs monthly against authoritative ClinVar data releases, clinical teams should always consult the live NCBI ClinVar accession database for real-time variant assertions.</li>
              </ul>
            </article>

            {/* Section 4 */}
            <article className="p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                  4
                </span>
                <h2 className="font-bold text-sm text-foreground">
                  Limitation of Liability & Indemnification
                </h2>
              </div>
              <p className="text-muted-foreground">
                To the fullest extent permitted by applicable law, GeneWise, its clinical advisors, and its open-source contributors shall not be liable for any direct, indirect, incidental, or consequential damages resulting from user interpretation or clinical actions taken without the direct supervision of a licensed healthcare provider.
              </p>
            </article>
          </div>

          {/* Interactive User Acknowledgment */}
          <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Educational Terms Acknowledgment
              </p>
              <p className="text-[11px] text-teal-800/80 dark:text-teal-400/80">
                Acknowledge that GeneWise provides non-diagnostic genetic literacy insights.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playSuccess();
                setAcknowledged(!acknowledged);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                acknowledged
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-teal-700 hover:bg-teal-800 text-white shadow-xs"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {acknowledged ? "Terms Acknowledged" : "I Understand & Accept"}
            </button>
          </div>

          {/* Footer Quick Links */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <Link href="/governance/privacy-charter" className="text-primary hover:underline">
                Privacy Charter
              </Link>
              <span>•</span>
              <Link href="/governance/zero-sale-pledge" className="text-primary hover:underline">
                Zero-Sale Pledge
              </Link>
              <span>•</span>
              <Link href="/clinical-support/find-counselor" className="text-primary hover:underline">
                Find a Genetic Counselor
              </Link>
            </div>
            <p className="text-[10px]">Document Ref: GW-TOU-2025.1</p>
          </div>

          <SafetyNotice />
      </div>
    </PublicDocShell>
  );
}
