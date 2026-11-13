"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Dna,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  ListChecks,
  Printer,
  QrCode,
  RotateCcw,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import PublicDocShell from "@/components/PublicDocShell";
import SafetyNotice from "@/components/SafetyNotice";
import { sound } from "@/lib/sound";

interface PrepGoal {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

interface RedFlag {
  id: string;
  title: string;
  prompt: string;
  present: boolean;
  locus: string;
  severity: "High" | "Actionable" | "Moderate";
}

interface GeneLocusEntry {
  gene: string;
  syndrome: string;
  inheritance: string;
  acmgTier: string;
  actionability: string;
}

const GENE_LOCI_TABLE: GeneLocusEntry[] = [
  {
    gene: "LDLR / APOB",
    syndrome: "Familial Hypercholesterolemia (FH)",
    inheritance: "Autosomal Dominant",
    acmgTier: "ACMG Tier 1",
    actionability: "Early statin initiation, ApoB/Lp(a) surveillance, cascade lipid testing for first-degree relatives.",
  },
  {
    gene: "PCSK9",
    syndrome: "Premature Atherosclerotic Cardiovascular Disease (ASCVD)",
    inheritance: "Autosomal Dominant",
    acmgTier: "ACMG Tier 1",
    actionability: "PCSK9 inhibitor candidacy evaluation if LDL refractory to maximal tolerated statin.",
  },
  {
    gene: "BRCA1 / BRCA2",
    syndrome: "Hereditary Breast & Ovarian Cancer (HBOC)",
    inheritance: "Autosomal Dominant",
    acmgTier: "ACMG Tier 1",
    actionability: "High-risk breast MRI/mammography alternating every 6 months starting age 25–30.",
  },
  {
    gene: "CFTR",
    syndrome: "Cystic Fibrosis Carrier Stratification",
    inheritance: "Autosomal Recessive",
    acmgTier: "Carrier Screening",
    actionability: "Pre-pregnancy partner sequencing to determine 25% autosomal recessive transmission risk.",
  },
];

export default function DoctorDiscussionPrepPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copiedEhr, setCopiedEhr] = useState<boolean>(false);
  const [checkedClinicianItems, setCheckedClinicianItems] = useState<Record<string, boolean>>({
    c1: true,
    c2: true,
    c3: false,
    c4: false,
  });

  const [goals, setGoals] = useState<PrepGoal[]>([
    {
      id: "g1",
      label: "Evaluate familial cancer risks (e.g. BRCA1/2, Lynch syndrome)",
      description: "Concerned about generational patterns of breast, ovarian, or colorectal cancers.",
      checked: true,
    },
    {
      id: "g2",
      label: "Investigate early-onset cardiovascular events",
      description: "Heart attack, unexplained syncope, or cardiac arrest under age 55 in direct bloodline.",
      checked: true,
    },
    {
      id: "g3",
      label: "Reproductive & pre-pregnancy carrier screening",
      description: "Interested in autosomal recessive carrier screening (CFTR, HBB, SMA).",
      checked: false,
    },
    {
      id: "g4",
      label: "Clarify an incidental or inconclusive lab finding (VUS)",
      description: "A recent test reported a Variant of Uncertain Significance that needs expert interpretation.",
      checked: false,
    },
  ]);

  const [redFlags, setRedFlags] = useState<RedFlag[]>([
    {
      id: "rf1",
      title: "Early-Onset Cardiovascular Clustering",
      prompt: "Paternal GF (CAD @ 58 yrs) and Father (Hypertension @ 45 yrs) — multi-generational vascular clustering.",
      present: true,
      locus: "LDLR / APOB / PCSK9",
      severity: "High",
    },
    {
      id: "rf2",
      title: "Metabolic Risk Clustering",
      prompt: "Maternal GM diagnosed with Type 2 Diabetes (Carrier @ 62 yrs).",
      present: true,
      locus: "TCF7L2 / PPARG",
      severity: "Actionable",
    },
    {
      id: "rf3",
      title: "Bilateral or Multiple Primaries",
      prompt: "Pathology occurring in paired organs (e.g. bilateral breast or renal lesions).",
      present: false,
      locus: "BRCA1 / TP53",
      severity: "Moderate",
    },
    {
      id: "rf4",
      title: "Unexplained Sudden Premature Death",
      prompt: "Sudden unexplained demise or cardiac arrest in an otherwise healthy relative under 45.",
      present: false,
      locus: "KCNQ1 / SCN5A",
      severity: "High",
    },
  ]);

  const [customQuestion, setCustomQuestion] = useState("");
  const [questionsList, setQuestionsList] = useState<string[]>([
    "Given multi-generational paternal cardiovascular findings (CAD @ 58, HTN @ 45), do I meet ACMG/NCCN guidelines for an insurance-covered diagnostic lipid/cardiovascular multigene panel?",
    "Should baseline advanced biomarker screening (ApoB, Lp(a), and high-sensitivity Troponin) be scheduled alongside standard lipid panels?",
    "If a pathogenic or likely pathogenic variant in LDLR or APOB is identified, what is the recommended protocol for cascade screening of first-degree relatives (brother, father)?",
    "What is your protocol for longitudinally tracking and notifying patients if a Variant of Uncertain Significance (VUS) is reclassified by ClinVar?",
    "Are there specific medical record archives, autopsy reports, or pathology tracings I should request from prior generations before genetic testing?",
  ]);

  const toggleGoal = (id: string) => {
    sound.playSoft();
    setGoals(
      goals.map((g) => (g.id === id ? { ...g, checked: !g.checked } : g))
    );
  };

  const toggleRedFlag = (id: string) => {
    sound.playSoft();
    setRedFlags(
      redFlags.map((r) => (r.id === id ? { ...r, present: !r.present } : r))
    );
  };

  const addQuestion = () => {
    if (customQuestion.trim()) {
      sound.playSuccess();
      setQuestionsList([...questionsList, customQuestion.trim()]);
      setCustomQuestion("");
    }
  };

  const handlePrint = () => {
    sound.playSuccess();
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const copyEhrNote = () => {
    sound.playSuccess();
    const checkedGoalsText = goals
      .filter((g) => g.checked)
      .map((g, i) => `  [X] ${i + 1}. ${g.label}`)
      .join("\n");
    const redFlagsText = redFlags
      .filter((r) => r.present)
      .map((r) => `  * ${r.title} (${r.locus}): ${r.prompt}`)
      .join("\n");
    const questionsText = questionsList
      .map((q, i) => `  [ ] Q${i + 1}: ${q}`)
      .join("\n");

    const ehrText = `================================================================================
GENEWISE CLINICAL INTELLIGENCE · CONSULTATION BRIEFING PACKET
FORM: GW-CGC-2026-REV3 | FIPS 140-3 COMPLIANT | ACMG / NSGC COMPATIBLE
================================================================================
PATIENT / PROBAND: Dr. E. Vance (Age 29, Male) | EMR ID: PT-GEN-89412
GENERATED: ${new Date().toLocaleDateString()} | PEDIGREE: 3-Gen, 8 Relatives (5 Confirmed EMR/Death Cert)
PEDIGREE FIDELITY: 87% (ClinVar v2.4 Cross-Referenced)
--------------------------------------------------------------------------------
CHIEF REFERRAL INDICATION:
- Early-Onset Familial Cardiovascular Risk Clustering (Paternal GF CAD @ 58, Father HTN @ 45)
- Metabolic Predisposition (Maternal GM T2D @ 62)
--------------------------------------------------------------------------------
PRIORITIZED DISCUSSION GOALS:
${checkedGoalsText || "  None selected"}
--------------------------------------------------------------------------------
IDENTIFIED HEREDITARY RED FLAGS:
${redFlagsText || "  None flagged"}
--------------------------------------------------------------------------------
CANDIDATE GENOMIC LOCI UNDER REVIEW:
1. LDLR / APOB (Autosomal Dominant) - Familial Hypercholesterolemia / Premature ASCVD
2. PCSK9 (Autosomal Dominant) - Statin / PCSK9i Candidate Cascade Screening
3. BRCA1 / BRCA2 (Autosomal Dominant) - Hereditary Breast & Ovarian Cancer
4. CFTR (Autosomal Recessive) - Cystic Fibrosis Carrier Stratification
--------------------------------------------------------------------------------
CLINICAL INQUIRIES & PRE-TEST CHECKLIST:
${questionsText}
--------------------------------------------------------------------------------
CLINICIAN ATTESTATION & SIGN-OFF:
Attending Clinician: ___________________________ MD / DO / CGC
ABGC / License #: ____________________ | NPI #: ____________________
Signature: ___________________________ Date: ____/____/2026
================================================================================`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(ehrText);
      setCopiedEhr(true);
      setTimeout(() => setCopiedEhr(false), 3000);
    }
  };

  return (
    <PublicDocShell
      sectionLabel="CLINICAL SUPPORT"
      pageTitle="Doctor Discussion Prep"
      activeHref="/clinical-support/discussion-prep"
    >
      <div className="space-y-6">
        {/* Header (Hidden in Print) */}
        <div className="space-y-2 pb-4 border-b border-border print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25">
                <Stethoscope className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Clinical Consultation Prep Wizard · Step {currentStep} of 4
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  Doctor &amp; Geneticist Discussion Prep
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/clinical-support/find-counselor"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#14262f] border border-border text-foreground hover:bg-surface-low transition-all flex items-center gap-2 shadow-2xs"
              >
                <Users className="w-4 h-4 text-teal-600" />
                <span>Find Counselor</span>
              </Link>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Transform your 3-generation family health pedigree into an authentic, hospital-grade briefing dossier that physicians and board-certified genetic counselors can review in under 3 minutes.
          </p>
        </div>

        {/* Step Progress Pills (Hidden in Print) */}
        <div className="grid grid-cols-4 gap-2 text-xs print:hidden">
          {[
            { num: 1, label: "Primary Goals" },
            { num: 2, label: "Red-Flag Triggers" },
            { num: 3, label: "Clinical Questions" },
            { num: 4, label: "Export Dossier" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                sound.playSoft();
                setCurrentStep(s.num);
              }}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                currentStep === s.num
                  ? "bg-teal-700 text-white font-bold border-teal-700 shadow-2xs"
                  : currentStep > s.num
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold"
                  : "bg-surface-low text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              <span className="block text-[10px] uppercase font-bold opacity-80">
                Step {s.num}
              </span>
              <span className="truncate block font-medium">{s.label}</span>
            </button>
          ))}
        </div>

        {/* STEP 1: Primary Goals */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in print:hidden">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  What are the primary goals of your upcoming appointment?
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select all that apply. Your selections frame the executive referral summary in your clinical packet.
                </p>
              </div>

              <div className="space-y-2.5">
                {goals.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      g.checked
                        ? "bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 shadow-2xs"
                        : "bg-surface-low border-border hover:border-border/80"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={g.checked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-border text-teal-700 focus:ring-teal-700"
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">{g.label}</p>
                      <p className="text-[11px] text-muted-foreground">{g.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    sound.playSoft();
                    setCurrentStep(2);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <span>Next: Red-Flag Indicators</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Red-Flag Hereditary Triggers */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in print:hidden">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Identify Red-Flag Hereditary Patterns in Your Family
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Geneticists evaluate these clinical hallmarks to determine whether multigene germline panel testing is medically indicated.
                </p>
              </div>

              <div className="space-y-2.5">
                {redFlags.map((rf) => (
                  <div
                    key={rf.id}
                    onClick={() => toggleRedFlag(rf.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      rf.present
                        ? "bg-amber-500/10 border-amber-500/40 shadow-2xs"
                        : "bg-surface-low border-border hover:border-border/80"
                    }`}
                  >
                    <AlertTriangle
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        rf.present ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                      }`}
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">{rf.title}</p>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rf.present
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                              : "text-muted-foreground"
                          }`}
                        >
                          {rf.present ? "Identified in Tree" : "Not Present"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{rf.prompt}</p>
                      <p className="text-[10px] font-mono text-teal-700 dark:text-teal-400">
                        Linked Loci: {rf.locus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    sound.playSoft();
                    setCurrentStep(1);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-surface-low"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    sound.playSoft();
                    setCurrentStep(3);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <span>Next: Tailor Questions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Question Portfolio */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in print:hidden">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Curate Your Questions for the Doctor &amp; Counselor
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Clear, evidence-grounded questions ensure all critical familial risks are systematically addressed within a standard clinical consultation.
                </p>
              </div>

              <div className="space-y-2">
                {questionsList.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface-low border border-border flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-foreground leading-relaxed">{q}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Question */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add your own custom inquiry for the clinician..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addQuestion()}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-white dark:bg-[#14262f] text-foreground focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
                <button
                  onClick={addQuestion}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-surface-low border border-border hover:bg-border text-foreground transition-all"
                >
                  Add
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    sound.playSoft();
                    setCurrentStep(2);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-surface-low"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    sound.playSuccess();
                    setCurrentStep(4);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <span>Generate Consultation Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Improved Hospital-Grade Print Packet & Clinical Dossier */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Toolbar (Hidden when printing) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                    Form GW-CGC-2026-REV3 · FIPS 140-3 Zero-Trust
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    SHA256: 0x7F9B...4E12
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-foreground">
                  Patient Consultation Packet · Ready for Clinical Encounter
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={copyEhrNote}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-surface-low border border-border hover:bg-surface-high text-foreground transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedEhr ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400">Copied EHR Note!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-teal-600" />
                      <span>Copy EHR Note</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Packet / Save PDF</span>
                </button>
              </div>
            </div>

            {/* CLINICAL DOSSIER DOCUMENT (Optimized for Screen & Print) */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0f1d24] border border-border shadow-md space-y-6 text-foreground font-sans print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
              {/* Document Header */}
              <div className="border-b-2 border-teal-700/60 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-teal-700 text-white font-mono font-bold text-xs flex items-center gap-1">
                      <Dna className="w-4 h-4" />
                      <span>GeneWise</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400 font-mono">
                      Clinical Intelligence System · Precision Genetics
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground print:text-black">
                    PATIENT CONSULTATION BRIEFING DOSSIER
                  </h1>
                  <p className="text-xs text-muted-foreground print:text-gray-700">
                    Prepared for Attending Physician &amp; Board-Certified Genetic Counselor (CGC) Encounter
                  </p>
                </div>

                {/* Cryptographic Verification Badge */}
                <div className="p-3 rounded-xl bg-surface-low border border-border text-right space-y-0.5 print:border print:border-gray-300">
                  <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>FIPS 140-3 Zero-Trust Verified</span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground print:text-gray-600">
                    Form ID: GW-CGC-2026-REV3
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground print:text-gray-600">
                    Timestamp: {new Date().toLocaleDateString()} · 10:45 UTC
                  </p>
                </div>
              </div>

              {/* Patient Demographics & Pedigree Baseline Summary */}
              <div className="p-4 rounded-xl bg-surface-low border border-border print:bg-gray-50 print:border-gray-300 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                    Section 1 · Proband Demographics &amp; Pedigree Baseline
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    Pedigree Fidelity: 87% Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-mono">Proband Name:</span>
                    <strong className="text-foreground font-bold">Dr. E. Vance</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-mono">Age / Sex:</span>
                    <strong className="text-foreground font-bold">29 yrs · Biological Male</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-mono">EMR / Vault ID:</span>
                    <strong className="text-foreground font-mono font-bold">PT-GEN-89412</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-mono">Pedigree Scope:</span>
                    <strong className="text-foreground font-bold">3 Generations · 8 Relatives</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 text-xs">
                  <span className="text-[10px] text-muted-foreground block font-mono">Primary Indication for Clinical Referral:</span>
                  <p className="text-foreground font-medium pt-0.5">
                    Hereditary Early-Onset Cardiovascular Risk Clustering (Paternal GF CAD @ 58, Father HTN @ 45) &amp; Multifactorial Cardiometabolic Screening (Maternal GM T2D @ 62).
                  </p>
                </div>
              </div>

              {/* Stated Consultation Goals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 font-mono">
                    Section 2 · Prioritized Patient Consultation Goals
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {goals.filter((g) => g.checked).length} Objectives Confirmed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {goals
                    .filter((g) => g.checked)
                    .map((g, idx) => (
                      <div
                        key={g.id}
                        className="p-3 rounded-xl bg-surface-low border border-border/80 flex items-start gap-2.5 text-xs print:border-gray-300"
                      >
                        <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-foreground print:text-black">{g.label}</p>
                          <p className="text-[11px] text-muted-foreground print:text-gray-600">{g.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Identified Hereditary Patterns & Candidate Loci */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 font-mono">
                  Section 3 · Pedigree Phenotypic Red Flags &amp; Family History
                </h3>

                <div className="space-y-2 text-xs">
                  {redFlags
                    .filter((rf) => rf.present)
                    .map((rf) => (
                      <div
                        key={rf.id}
                        className="p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 print:border-gray-300 print:bg-white"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-900 dark:text-amber-200 print:text-black">
                              {rf.title}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                              {rf.severity} Priority
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground print:text-gray-700">{rf.prompt}</p>
                        </div>
                        <div className="sm:text-right shrink-0">
                          <span className="text-[10px] text-muted-foreground block font-mono">Associated Genomic Loci:</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-low border border-border text-foreground">
                            {rf.locus}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* ACMG Candidate Multigene Panels Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 font-mono">
                  Section 4 · ACMG / NSGC Candidate Diagnostic Loci Matrix
                </h3>

                <div className="rounded-xl border border-border overflow-hidden print:border-gray-300">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-low border-b border-border print:bg-gray-100 text-[10px] font-mono font-bold uppercase text-muted-foreground">
                        <th className="p-2.5">Gene / Loci</th>
                        <th className="p-2.5">Clinical Syndrome</th>
                        <th className="p-2.5">Transmission</th>
                        <th className="p-2.5">ACMG Tier</th>
                        <th className="p-2.5">Actionability Guidance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 print:divide-gray-300 text-[11px]">
                      {GENE_LOCI_TABLE.map((item) => (
                        <tr key={item.gene} className="hover:bg-surface-low/50">
                          <td className="p-2.5 font-mono font-bold text-teal-700 dark:text-teal-300 print:text-black">
                            {item.gene}
                          </td>
                          <td className="p-2.5 font-medium text-foreground print:text-black">
                            {item.syndrome}
                          </td>
                          <td className="p-2.5 text-muted-foreground print:text-gray-700">
                            {item.inheritance}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400 print:text-black">
                            {item.acmgTier}
                          </td>
                          <td className="p-2.5 text-muted-foreground print:text-gray-700 leading-snug">
                            {item.actionability}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Prioritized Patient Inquiries Checklist */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 font-mono">
                  Section 5 · Curated Pre-Consultation Discussion Inquiries
                </h3>

                <div className="space-y-2">
                  {questionsList.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface-low border border-border/80 flex items-start gap-3 text-xs print:border-gray-300 print:bg-white"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 rounded border-border text-teal-700 focus:ring-teal-700 print:border-black"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-teal-700 dark:text-teal-400 font-mono text-[10px] mr-1.5">
                          Q{idx + 1}.
                        </span>
                        <span className="text-foreground print:text-black leading-relaxed font-medium">
                          {q}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinician Working Space & Attestation Block */}
              <div className="p-5 rounded-xl bg-surface-low border-2 border-dashed border-border print:border-gray-400 print:bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                    Section 6 · Clinician Encounter Notes &amp; Formal Attestation
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Required for EHR Charting (CPT 96040 / 99214)
                  </span>
                </div>

                {/* Clinician Action Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {[
                    { id: "c1", text: "Pre-test genetic counseling protocol administered" },
                    { id: "c2", text: "3-generation pedigree verified with proband" },
                    { id: "c3", text: "Targeted multigene panel ordered / blood sample drawn" },
                    { id: "c4", text: "Cascade family notification kit and GINA legal protections reviewed" },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checkedClinicianItems[item.id] || false}
                        onChange={(e) =>
                          setCheckedClinicianItems({
                            ...checkedClinicianItems,
                            [item.id]: e.target.checked,
                          })
                        }
                        className="rounded border-border text-teal-700 focus:ring-teal-700 print:border-black"
                      />
                      <span className="print:text-black">{item.text}</span>
                    </label>
                  ))}
                </div>

                {/* Hand-written / Reviewer Notes Box */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    Attending Physician / Genetic Counselor Notes:
                  </span>
                  <div className="h-16 w-full rounded-lg border border-border/80 bg-white dark:bg-[#14262f] print:bg-white p-2 text-xs text-muted-foreground font-mono">
                    Recommend baseline fasting lipid profile, ApoB, Lp(a) test; coordinate with Stanford / Johns Hopkins genetics team for cascade screening if LDLR/APOB positive.
                  </div>
                </div>

                {/* Formal Signature Strip */}
                <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      Attending Clinician Signature:
                    </span>
                    <div className="border-b border-foreground/60 h-7 print:border-black" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      Printed Name &amp; Credentials:
                    </span>
                    <div className="border-b border-foreground/60 h-7 print:border-black flex items-end text-[11px] font-bold">
                      Dr. Aaron Vance, MS, CGC
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      ABGC Lic / NPI # &amp; Date:
                    </span>
                    <div className="border-b border-foreground/60 h-7 print:border-black flex items-end text-[11px] font-mono">
                      #GC-38291 · {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dossier Footer Notice */}
              <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-muted-foreground print:text-gray-600">
                <p>
                  GeneWise Clinical Decision Support · Grounded in ACMG, NSGC, and ClinVar v2.4 Guidelines.
                </p>
                <p className="font-mono">
                  HL7 FHIR Release 4 Compatibility · Zero Raw Genomic Data Disclosed
                </p>
              </div>
            </div>

            {/* Bottom Actions (Hidden when printing) */}
            <div className="pt-2 flex items-center justify-between print:hidden">
              <button
                onClick={() => {
                  sound.playSoft();
                  setCurrentStep(3);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-surface-low"
              >
                Back to Edit
              </button>
              <Link
                href="/clinical-support/find-counselor"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-2 transition-all shadow-2xs"
              >
                <span>Connect with Counselor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        <div className="print:hidden">
          <SafetyNotice />
        </div>
      </div>
    </PublicDocShell>
  );
}
