"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileCheck,
  FileText,
  HelpCircle,
  ListChecks,
  Printer,
  RotateCcw,
  Shield,
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
}

export default function DoctorDiscussionPrepPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
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
      checked: false,
    },
    {
      id: "g3",
      label: "Reproductive & pre-pregnancy carrier screening",
      description: "Interested in autosomal recessive carrier screening (CFTR, HBB, SMA).",
      checked: true,
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
      title: "Early Onset Diagnosis",
      prompt: "Condition diagnosed at a younger age than typical (e.g. colon cancer before age 50).",
      present: false,
    },
    {
      id: "rf2",
      title: "Multiple Relatives on Same Side",
      prompt: "Two or more close relatives on maternal or paternal lineage with related diseases.",
      present: true,
    },
    {
      id: "rf3",
      title: "Bilateral or Multiple Primaries",
      prompt: "Cancer or pathology occurring in paired organs (e.g. both breasts or both kidneys).",
      present: false,
    },
    {
      id: "rf4",
      title: "Unexplained Sudden Death",
      prompt: "Sudden unexplained demise in an otherwise healthy relative under 45.",
      present: false,
    },
  ]);

  const [customQuestion, setCustomQuestion] = useState("");
  const [questionsList, setQuestionsList] = useState<string[]>([
    "Based on my family history, do I meet standard NCCN/ACMG criteria for insurance-covered genetic testing?",
    "If a pathogenic mutation is identified, what specific surveillance or prophylactic measures would you recommend?",
    "Should my siblings, adult children, or other first-degree relatives be notified for cascade screening?",
    "If results return as a Variant of Uncertain Significance (VUS), what is your protocol for tracking reclassifications?",
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

  return (
    <PublicDocShell
      sectionLabel="CLINICAL SUPPORT"
      pageTitle="Doctor Discussion Prep"
      activeHref="/clinical-support/discussion-prep"
    >
      <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25">
                <Stethoscope className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Clinical Consultation Prep Wizard · Step {currentStep} of 4
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  Doctor & Geneticist Discussion Prep
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Turn your family observations into structured, clinically actionable discussion topics. Generate a print-ready briefing portfolio that busy physicians can review in under 3 minutes.
            </p>
          </div>

          {/* Step Progress Pills */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[
              { num: 1, label: "Primary Goals" },
              { num: 2, label: "Red-Flag Triggers" },
              { num: 3, label: "Clinical Questions" },
              { num: 4, label: "Export Portfolio" },
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
            <div className="space-y-4 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    What are the primary goals of your upcoming appointment?
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select all that apply. Your selections will frame the executive summary for your doctor.
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
            <div className="space-y-4 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Identify Red-Flag Hereditary Patterns in Your Family
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Geneticists use these clinical hallmarks to determine whether diagnostic multi-gene panel testing is indicated.
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
                            {rf.present ? "Identified" : "Not Present"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{rf.prompt}</p>
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
            <div className="space-y-4 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Curate Your Questions for the Doctor
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Clear, concise questions ensure you cover your highest-priority genetic concerns within a standard 20-minute clinical visit.
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
                    placeholder="Add your own custom question..."
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
                    <span>Generate Physician Packet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Export Physician Briefing Packet */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      Standard Clinical Briefing Sheet
                    </span>
                    <h2 className="text-lg font-bold text-foreground">
                      Patient Consultation Packet · Ready for Review
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Packet</span>
                    </button>
                  </div>
                </div>

                {/* Printable Document Box */}
                <div className="p-6 rounded-2xl bg-surface-low border border-border space-y-5 text-xs font-sans">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-foreground">
                        GeneWise Clinical Intake Summary
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Prepared for Attending Physician / Licensed Genetic Counselor
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Generated: {new Date().toLocaleDateString()}
                    </span>
                  </div>

                  {/* Stated Goals */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Prioritized Discussion Goals:
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-foreground">
                      {goals
                        .filter((g) => g.checked)
                        .map((g) => (
                          <li key={g.id} className="font-medium">
                            {g.label}
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Identified Red Flags */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Identified Family Hereditary Patterns:
                    </span>
                    <div className="space-y-1">
                      {redFlags
                        .filter((rf) => rf.present)
                        .map((rf) => (
                          <div
                            key={rf.id}
                            className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300 font-medium"
                          >
                            • {rf.title}: {rf.prompt}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Question Checklist */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      Patient Questions Checklist:
                    </span>
                    <ol className="list-decimal pl-5 space-y-1.5 text-foreground">
                      {questionsList.map((q, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Clinician Signature Section */}
                  <div className="pt-4 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Clinical Reviewer Notes / Next Steps: ___________________________</span>
                    <span>MD/CGC Sign-off: _________</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
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
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <span>Connect with Counselor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <SafetyNotice />
      </div>
    </PublicDocShell>
  );
}
