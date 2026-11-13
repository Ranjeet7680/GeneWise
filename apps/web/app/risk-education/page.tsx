"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Info,
  Layers,
  Lightbulb,
  Lock,
  MessageSquare,
  Network,
  RotateCw,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Users,
  X,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import SafetyNotice from "@/components/SafetyNotice";
import { sound } from "@/lib/sound";

interface EducationUnit {
  id: number;
  unit: string;
  title: string;
  description: string;
  badgeLabel?: string;
  badgeContent?: string;
  readTime: string;
  fullGuideTitle: string;
  fullGuideSections: {
    heading: string;
    body: string;
  }[];
}

const SYLLABUS_UNITS: EducationUnit[] = [
  {
    id: 1,
    unit: "Unit 1",
    title: "Inheritance Patterns Decoded",
    description:
      "Autosomal dominant vs. recessive alleles, X-linked inheritance, and non-Mendelian mitochondrial maternal transmission. Discover how pedigree modeling estimates transmission probabilities.",
    badgeLabel: "Mendelian Autosomal Segregation",
    badgeContent: "1 : 2 : 1 (25% Ref · 50% Carrier · 25% Recessive)",
    readTime: "8 min read",
    fullGuideTitle: "Mendelian & Non-Mendelian Transmission Architecture",
    fullGuideSections: [
      {
        heading: "1. Autosomal Dominant Transmission",
        body: "A single altered gene copy from either parent is sufficient to confer disease risk (e.g., Huntington disease, Marfan syndrome). Each child has a 50% statistical probability of inheriting the pathogenic variant.",
      },
      {
        heading: "2. Autosomal Recessive Transmission",
        body: "Requires two pathogenic alleles (one maternal, one paternal) to express the phenotype (e.g., Cystic Fibrosis, Sickle Cell Disease). Unaffected carriers (Aa) have a 25% probability of having an affected child when both partners carry the allele.",
      },
      {
        heading: "3. X-Linked & Mitochondrial Peculiarities",
        body: "X-linked recessive disorders (e.g., Hemophilia A, Duchenne Muscular Dystrophy) disproportionately affect males because males have only one X chromosome. Mitochondrial DNA is inherited almost exclusively through the maternal oocyte lineage.",
      },
    ],
  },
  {
    id: 2,
    unit: "Unit 2",
    title: "The Spectrum of Genetic Variants",
    description:
      "Over 99% of human variations are neutral polymorphisms. We break down Single Nucleotide Variants (SNVs), micro-insertions/deletions (indels), and large Copy Number Variations (CNVs).",
    badgeLabel: "Variant Distribution",
    badgeContent: ">99% Benign · VUS Clarification",
    readTime: "6 min read",
    fullGuideTitle: "Molecular Variant Taxonomy & ACMG Classifications",
    fullGuideSections: [
      {
        heading: "1. SNVs, Indels, and Structural Variants",
        body: "Single Nucleotide Variants (SNVs) represent single base changes (e.g., A to G). Indels insert or delete small nucleotide stretches, frequently causing frameshifts. CNVs involve duplications or deletions spanning thousands of bases.",
      },
      {
        heading: "2. The 5-Tier ACMG/AMP Classification System",
        body: "Clinicians do not view genetics as binary. Variants are placed into: (1) Pathogenic, (2) Likely Pathogenic, (3) Variant of Uncertain Significance (VUS), (4) Likely Benign, and (5) Benign. A VUS must never be treated as clinical proof of disease.",
      },
    ],
  },
  {
    id: 3,
    unit: "Unit 3",
    title: "Penetrance & Variable Expressivity",
    description:
      "Carrying a pathogenic variant does not guarantee clinical expression. Understand complete vs. incomplete penetrance, modifiers, and why symptoms differ drastically across siblings.",
    badgeLabel: "Penetrance vs. Expressivity",
    badgeContent: "Penetrance: 'Will it show?' · Expressivity: 'How severe?'",
    readTime: "10 min read",
    fullGuideTitle: "Biological Modifiers & Incomplete Penetrance",
    fullGuideSections: [
      {
        heading: "1. Incomplete vs. Complete Penetrance",
        body: "Complete penetrance means 100% of individuals with the variant develop the condition (e.g., Huntington disease). Incomplete penetrance means only a fraction will manifest disease (e.g., BRCA1 lifetime breast cancer penetrance is ~70%, not 100%).",
      },
      {
        heading: "2. Variable Expressivity",
        body: "Even among individuals with the exact same genetic variant within the same family, disease severity, age of onset, and organ system involvement can vary widely due to genetic background and environmental modifiers.",
      },
    ],
  },
  {
    id: 4,
    unit: "Unit 4",
    title: "Multifactorial & Complex Traits",
    description:
      "Common conditions like type 2 diabetes and coronary artery disease result from thousands of small-effect genetic variants interacting dynamically with diet, sleep, and lifestyle.",
    badgeLabel: "Polygenic Risk Limitations",
    badgeContent: "Population-Specific · Non-Deterministic",
    readTime: "8 min read",
    fullGuideTitle: "Polygenic Risk Scores (PRS) & Complex Trait Biology",
    fullGuideSections: [
      {
        heading: "1. Polygenic Architecture",
        body: "Unlike rare monogenic diseases caused by a single major mutation, complex conditions involve hundreds to thousands of polygenic loci, each shifting odds by fractional percentages.",
      },
      {
        heading: "2. Why PRS Cannot Diagnose Individuals",
        body: "Polygenic risk scores provide statistical percentiles relative to specific studied reference populations, but cannot account for protective lifestyle factors or individual clinical trajectories.",
      },
    ],
  },
  {
    id: 5,
    unit: "Unit 5",
    title: "Genetic Testing Modalities",
    description:
      "Differentiating Targeted Single-Gene tests, Next-Generation Sequencing (NGS) panels, Whole Exome Sequencing (WES), and Direct-to-Consumer (DTC) genotyping arrays.",
    badgeLabel: "DTC Arrays vs. Clinical NGS",
    badgeContent: "Coverage Gaps · False Positive Verification",
    readTime: "12 min read",
    fullGuideTitle: "Comparative Clinical Testing Methodologies",
    fullGuideSections: [
      {
        heading: "1. Targeted Panels vs. Whole Exome Sequencing (WES)",
        body: "Targeted panels interrogate curated sets of 20 to 500 genes with high read depth (>100x). WES captures all protein-coding regions (~20,000 genes), ideal for undiagnosed pediatric or multi-system presentations.",
      },
      {
        heading: "2. The DTC Fallacy",
        body: "Consumer tests generally use SNP arrays that spot-check specific loci and fail to sequence whole coding regions. Over 40% of pathogenic DTC 'raw data' variants turn out to be false positives when Sanger re-sequenced in clinical CLIA/CAP labs.",
      },
    ],
  },
  {
    id: 6,
    unit: "Unit 6",
    title: "When to Consult a Genetic Counselor",
    description:
      "Licensed Genetic Counselors (CGC) assess multigenerational pedigrees, contextualize uncertain results, and provide critical psychological and clinical guidance.",
    badgeLabel: "Clinical Referrals",
    badgeContent: "Recommended when family shows repeat early-onset conditions.",
    readTime: "7 min read",
    fullGuideTitle: "The Genetic Counseling Process & Cascade Testing",
    fullGuideSections: [
      {
        heading: "1. What Certified Genetic Counselors Do",
        body: "Genetic counselors bridge complex genomic science with compassionate patient advocacy. They evaluate personal and familial health history, determine appropriate testing, and protect against unnecessary interventions.",
      },
      {
        heading: "2. Cascade Screening for At-Risk Kin",
        body: "When a true pathogenic variant is identified in a proband, genetic counselors map family branches to identify first-degree relatives who benefit from targeted, cost-effective single-site testing.",
      },
    ],
  },
];

export default function RiskEducationPage() {
  const [selectedUnit, setSelectedUnit] = useState<EducationUnit | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [showDoctorPrepModal, setShowDoctorPrepModal] = useState(false);

  const handleSelectQuiz = (option: string) => {
    sound.playClick();
    setQuizAnswer(option);
    if (option === "B") {
      sound.playSuccess();
    } else {
      sound.playWarning();
    }
  };

  const handleDownloadPDF = () => {
    sound.playSuccess();
    const guideText = `GeneWise Clinical Genetics Discussion Prep Kit
===================================================
Document Reference: #GW-CLIN-PREP-2026
Methodological Alignment: ACMG & NSGC Standards

KEY DISCUSSION PROMPTS FOR YOUR PHYSICIAN / GENETIC COUNSELOR:
1. "Given my family history of early-onset conditions, would a multigene NGS panel be clinically indicated?"
2. "Are any of my documented family conditions associated with known autosomal dominant or incomplete penetrance patterns?"
3. "Should any first-degree relatives consider cascade carrier screening?"
4. "How do recent ClinVar classifications interpret the variants recorded in our family record?"
5. "If a Variant of Uncertain Significance (VUS) was reported, what is the protocol for periodic re-evaluation?"

FAMILY PEDIGREE SUMMARY:
- Pedigree Depth: 3 Generations Documented
- Relatives Logged: 4 (Paternal & Maternal Branches)
- Monitored Conditions: Cardiovascular, Type 2 Diabetes, Hypertension

DISCLAIMER:
This document is for educational preparation and does not constitute medical advice or a clinical diagnosis.`;

    const blob = new Blob([guideText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GeneWise_Doctor_Discussion_Kit_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AppHeader />

      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header Tag */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              EVIDENCE-BASED GENETICS EDUCATION #00-ED-016
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Understand Inherited Disease Risk
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
              Learn what genetics and inheritance can tell us — and what they cannot. We do not generate automated hazard percentages or unvalidated risk scores.
            </p>
          </div>

          {/* ACMG / ClinGen Callout Card */}
          <div className="relative rounded-3xl p-6 sm:p-8 border border-teal-500/30 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-600 text-white shadow-2xs">
                  <Activity className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                  METHODOLOGICAL INTEGRITY • ACMG / ClinGen Standard
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-lowest dark:bg-slate-900 border border-border text-xs font-semibold text-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Clinically Grounded • No Synthetic Scores
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Why GeneWise does not provide a single "Risk Percentage"
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-4xl">
              Clinical genetic risk is governed by complex biological factors including multi-locus polygenic variation, incomplete penetrance, variable expressivity, and epigenetic environmental factors. Reducing patient genetics to a single automated metric creates false certainty and clinical bias.
            </p>
          </div>

          {/* Syllabus Overview: 6 Foundational Genetic Principles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                  SYLLABUS OVERVIEW
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  Foundational Genetic Principles
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Modular self-paced clinical genetic literacy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SYLLABUS_UNITS.map((unit) => (
                <div
                  key={unit.id}
                  className="bg-surface-lowest dark:bg-slate-900/60 rounded-3xl border border-border/80 shadow-2xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-500/20">
                        {unit.id}
                      </div>
                      <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-surface-container-low dark:bg-slate-800 text-muted-foreground">
                        {unit.unit}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                      {unit.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {unit.description}
                    </p>

                    {unit.badgeLabel && (
                      <div className="p-3 rounded-2xl bg-surface-container-low dark:bg-slate-800/60 border border-border/60 text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          {unit.badgeLabel}
                        </span>
                        <div className="font-semibold text-foreground text-[11px]">
                          {unit.badgeContent}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {unit.readTime}
                    </span>
                    <button
                      onClick={() => {
                        sound.playPop();
                        setSelectedUnit(unit);
                      }}
                      className="text-teal-700 dark:text-teal-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      Explore Guide →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Checkpoint & Carrier Pedigree Punnett Square */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Interactive Self-Assessment (7 cols) */}
            <div className="lg:col-span-7 bg-surface-lowest dark:bg-slate-900/60 rounded-3xl border border-border/80 shadow-2xs p-6 sm:p-8 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
                  <GraduationCap className="w-3.5 h-3.5" />
                  INTERACTIVE SELF-ASSESSMENT • Clinical Checkpoint
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Does having a first-degree relative with an autosomal recessive condition mean you will develop the condition?
                </h3>

                <p className="text-xs text-muted-foreground">
                  Select the most accurate clinical conclusion based on classical Mendelian inheritance laws:
                </p>

                {/* Multiple Choice Options */}
                <div className="space-y-3 pt-2">
                  {[
                    { key: "A", label: "A", text: "Yes, inevitably." },
                    {
                      key: "B",
                      label: "B",
                      text: "No, not necessarily (depends on maternal/paternal carrier status).",
                    },
                    {
                      key: "C",
                      label: "C",
                      text: "Only if you are male due to chromosomal hemizygosity.",
                    },
                  ].map((option) => {
                    const isSelected = quizAnswer === option.key;
                    const isCorrect = option.key === "B";
                    return (
                      <button
                        key={option.key}
                        onClick={() => handleSelectQuiz(option.key)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm flex items-start gap-3 ${
                          isSelected
                            ? isCorrect
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm"
                              : "bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-200"
                            : "bg-surface-container-low dark:bg-slate-800/60 border-border hover:border-teal-500/50 text-foreground"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                            isSelected
                              ? isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-rose-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {option.label}
                        </span>
                        <span className="pt-0.5 font-medium leading-snug">{option.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Box */}
                {quizAnswer && (
                  <div
                    className={`p-4 rounded-2xl border text-xs sm:text-sm animate-in fade-in duration-200 ${
                      quizAnswer === "B"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {quizAnswer === "B" ? (
                      <div className="space-y-1">
                        <span className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4" /> Correct clinical conclusion!
                        </span>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Autosomal recessive disorders require pathogenic alleles from both biological parents. An individual with an affected first-degree relative is typically an obligate or potential carrier, but will not manifest disease unless both alleles are mutated.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                          <AlertCircle className="w-4 h-4" /> Not clinically accurate.
                        </span>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Review Mendelian segregation: having a relative with an autosomal recessive condition does not guarantee disease onset. Option B is correct because transmission requires alleles from both maternal and paternal lineages.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Carrier Pedigree Model 2x2 Punnett Square (5 cols) */}
            <div className="lg:col-span-5 bg-surface-lowest dark:bg-slate-900/60 rounded-3xl border border-border/80 shadow-2xs p-6 sm:p-8 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    CARRIER PEDIGREE MODEL
                  </span>
                  <span className="font-mono text-muted-foreground font-semibold">Aa × Aa</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Two carrier parents (Aa) transmission breakdown:
                </p>
              </div>

              {/* Punnett Square Diagram */}
              <div className="bg-surface-container-low/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-border/80">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                  {/* Row 1 Header */}
                  <div className="p-2" />
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300">A</div>
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300">a</div>

                  {/* Row 2 */}
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                    A
                  </div>
                  <div className="p-3 rounded-xl bg-surface-lowest dark:bg-slate-900 border border-border flex flex-col items-center justify-center space-y-0.5">
                    <span className="text-foreground text-sm font-extrabold">AA</span>
                    <span className="text-[10px] text-muted-foreground font-sans">25% Unaff.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/20 flex flex-col items-center justify-center space-y-0.5">
                    <span className="text-teal-800 dark:text-teal-300 text-sm font-extrabold">Aa</span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-sans">Carrier</span>
                  </div>

                  {/* Row 3 */}
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                    a
                  </div>
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/20 flex flex-col items-center justify-center space-y-0.5">
                    <span className="text-teal-800 dark:text-teal-300 text-sm font-extrabold">aA</span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-sans">Carrier</span>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-600 text-white shadow-sm flex flex-col items-center justify-center space-y-0.5">
                    <span className="text-white text-sm font-extrabold">aa</span>
                    <span className="text-[10px] text-teal-100 font-sans">25% Affect.</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground leading-relaxed">
                Only homozygous recessive (<strong className="text-foreground">aa</strong>) manifests disease. Heterozygous carriers (<strong className="text-foreground">Aa</strong>) remain clinically unaffected in classic recessive inheritance.
              </div>
            </div>
          </div>

          {/* Clinical Action Kit: Prepare Questions for Your Doctor */}
          <div className="bg-surface-lowest dark:bg-slate-900/60 rounded-3xl border border-border/80 shadow-2xs p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                <ClipboardList className="w-4 h-4" />
                CLINICAL ACTION KIT
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
                Prepare Questions for Your Doctor
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                Take clinical ownership. Download a concise evidence-based checklist formatted for primary care physicians and clinical genetics consultations.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                onClick={() => {
                  sound.playPop();
                  setShowDoctorPrepModal(true);
                }}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Prompts
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-5 py-2.5 rounded-xl bg-[#00635e] text-white text-xs font-bold hover:bg-[#00504c] shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF Guide
              </button>
            </div>
          </div>
        </main>

        <SafetyNotice />
      </div>
    </div>

      {/* Guide Details Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-background rounded-3xl border border-border shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {selectedUnit.unit} • {selectedUnit.readTime}
                </span>
                <h3 className="text-2xl font-extrabold text-foreground">
                  {selectedUnit.fullGuideTitle}
                </h3>
              </div>
              <button
                onClick={() => {
                  sound.playPop();
                  setSelectedUnit(null);
                }}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedUnit.fullGuideSections.map((sec, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/60 border border-border space-y-1.5">
                  <h4 className="text-sm font-bold text-foreground">{sec.heading}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{sec.body}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() => {
                  sound.playPop();
                  setSelectedUnit(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#00635e] text-white text-xs font-bold hover:bg-[#00504c]"
              >
                Close Syllabus Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Discussion Prompts Modal */}
      {showDoctorPrepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-background rounded-3xl border border-border shadow-2xl max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  CLINICAL DIALOGUE TOOLKIT
                </span>
                <h3 className="text-2xl font-extrabold text-foreground">
                  Doctor Discussion Prompts
                </h3>
                <p className="text-xs text-muted-foreground">
                  Evidence-based questions to bring to your clinical geneticist or general practitioner.
                </p>
              </div>
              <button
                onClick={() => setShowDoctorPrepModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              {[
                "1. 'Given my family history of early-onset cardiovascular conditions, would a multigene NGS panel be clinically indicated?'",
                "2. 'Are any of my documented family conditions associated with known autosomal dominant or incomplete penetrance patterns?'",
                "3. 'Should any first-degree relatives consider cascade carrier screening?'",
                "4. 'How do recent ClinVar classifications interpret the variants recorded in our family record?'",
                "5. 'If a Variant of Uncertain Significance (VUS) was reported, what is the protocol for periodic re-evaluation?'",
              ].map((prompt, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-surface-container-low dark:bg-slate-800 border border-border text-foreground font-medium flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{prompt}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download as Checklist
              </button>
              <button
                onClick={() => setShowDoctorPrepModal(false)}
                className="px-5 py-2 rounded-xl bg-[#00635e] text-white text-xs font-bold hover:bg-[#00504c]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
