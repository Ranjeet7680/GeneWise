"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Dna,
  Download,
  FileCheck,
  FileText,
  Heart,
  HelpCircle,
  Info,
  Layers,
  ListChecks,
  Lock,
  Printer,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Video,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { sound } from "@/lib/sound";
import { DoctorPrepBrief, GeneticCounselor } from "@/types";

interface DoctorPrepWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCounselor?: GeneticCounselor | null;
  onSelectCounselorForBooking?: (counselor: GeneticCounselor) => void;
}

const CLINICAL_CATEGORIES = [
  {
    id: "cancer",
    title: "Hereditary Cancer Risk",
    desc: "BRCA1/2, Lynch Syndrome, Li-Fraumeni, familial colorectal / breast / ovarian cancer",
    specialty: "Oncogenetics",
    loci: ["BRCA1", "BRCA2", "MLH1", "MSH2", "TP53"],
  },
  {
    id: "pediatric",
    title: "Pediatric & Rare Diseases",
    desc: "Mendelian inborn errors of metabolism, dysmorphology, syndromic delays",
    specialty: "Pediatric & Rare Diseases",
    loci: ["CFTR", "GAA", "PAH", "IDUA", "FGFR3"],
  },
  {
    id: "cardio",
    title: "Cardiovascular & Connective Tissue",
    desc: "Marfan syndrome (FBN1), Loeys-Dietz, Familial Hypercholesterolemia, HCM",
    specialty: "Cardiogenetics",
    loci: ["FBN1", "TGFBR1", "LDLR", "APOB", "PCSK9"],
  },
  {
    id: "prenatal",
    title: "Prenatal & Reproductive Genetics",
    desc: "Preconception carrier screening, NIPT discordance, carrier trios, recurrent pregnancy loss",
    specialty: "Prenatal",
    loci: ["HBB", "SMN1", "CFTR", "G6PD", "DMD"],
  },
  {
    id: "neuro",
    title: "Adult-Onset Neurogenetics",
    desc: "Huntington disease, familial ALS, hereditary ataxias, early-onset dementia",
    specialty: "Neurogenetics",
    loci: ["HTT", "SOD1", "C9orf72", "ATXN1"],
  },
  {
    id: "pharmacogenomics",
    title: "Pharmacogenomics & Drug Response",
    desc: "CPIC Level A guidelines, fluoropyrimidine toxicity (DPYD), clopidogrel resistance",
    specialty: "Pharmacogenetics",
    loci: ["CYP2D6", "CYP2C19", "DPYD", "TPMT", "SLCO1B1"],
  },
  {
    id: "metabolic",
    title: "Metabolic & Lysosomal Storage",
    desc: "Fabry, Gaucher, Pompe disease, newborn screening confirmatory triage",
    specialty: "Metabolic Genetics",
    loci: ["GLA", "GBA", "GAA"],
  },
  {
    id: "unexplained",
    title: "Unexplained Multi-Generational Pattern",
    desc: "Pedigree tracing for multi-system conditions across 3 biological generations",
    specialty: "Clinical Genomics",
    loci: [],
  },
];

const QUICK_CONDITIONS = [
  "Early-Onset Breast Cancer (<45)",
  "Ovarian Cancer",
  "Colorectal Cancer (<50)",
  "Early Myocardial Infarction (<55)",
  "Thoracic Aortic Aneurysm",
  "Familial Hypercholesterolemia",
  "Cystic Fibrosis",
  "Beta-Thalassemia / Sickle Cell",
  "Huntington Disease",
  "Hypertrophic Cardiomyopathy",
  "Sudden Unexplained Cardiac Death",
];

export default function DoctorPrepWizardModal({
  isOpen,
  onClose,
  initialCounselor,
  onSelectCounselorForBooking,
}: DoctorPrepWizardModalProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("cardio");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Review 3-generation pedigree risk patterns",
    "Determine ACMG diagnostic panel candidacy",
    "Identify cascade testing for first-degree relatives",
  ]);

  // Step 2 State
  const [familyEntries, setFamilyEntries] = useState<
    Array<{ relative: string; branch: string; condition: string; age: string }>
  >([
    { relative: "Father", branch: "Paternal", condition: "Early Myocardial Infarction (<55)", age: "48" },
    { relative: "Paternal Grandfather", branch: "Paternal", condition: "Thoracic Aortic Aneurysm", age: "62" },
  ]);
  const [newRelative, setNewRelative] = useState<string>("Mother");
  const [newBranch, setNewBranch] = useState<string>("Maternal");
  const [newCondition, setNewCondition] = useState<string>("");
  const [newAge, setNewAge] = useState<string>("");

  // Step 3 State
  const [selectedLoci, setSelectedLoci] = useState<string[]>(["FBN1", "LDLR"]);
  const [customLocus, setCustomLocus] = useState<string>("");
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    "Patient reporting palpitations and family history of aortic root dilatation on paternal side. Inquiring whether genetic testing is indicated prior to elective surgery."
  );
  const [includeSavedPedigree, setIncludeSavedPedigree] = useState<boolean>(true);

  // Step 4 & 5 State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedBrief, setGeneratedBrief] = useState<DoctorPrepBrief | null>(null);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [consentShareWithCounselor, setConsentShareWithCounselor] = useState<boolean>(false);
  const [recommendedCounselors, setRecommendedCounselors] = useState<GeneticCounselor[]>([]);

  useEffect(() => {
    if (initialCounselor) {
      const match = CLINICAL_CATEGORIES.find(
        (c) => c.specialty.toLowerCase() === initialCounselor.specialty.toLowerCase()
      );
      if (match) setSelectedCategory(match.id);
      if (initialCounselor.target_loci && initialCounselor.target_loci.length > 0) {
        setSelectedLoci(initialCounselor.target_loci.slice(0, 3));
      }
    }
  }, [initialCounselor]);

  if (!isOpen) return null;

  const currentCategoryData =
    CLINICAL_CATEGORIES.find((c) => c.id === selectedCategory) || CLINICAL_CATEGORIES[0];

  const handleToggleGoal = (goal: string) => {
    sound.playSoft();
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleAddFamilyEntry = () => {
    if (!newCondition) return;
    sound.playSuccess();
    setFamilyEntries((prev) => [
      ...prev,
      {
        relative: newRelative,
        branch: newBranch,
        condition: newCondition,
        age: newAge || "Unknown",
      },
    ]);
    setNewCondition("");
    setNewAge("");
  };

  const handleRemoveFamilyEntry = (idx: number) => {
    sound.playSoft();
    setFamilyEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddLocus = () => {
    if (!customLocus.trim()) return;
    const clean = customLocus.trim().toUpperCase();
    if (!selectedLoci.includes(clean)) {
      sound.playSuccess();
      setSelectedLoci((prev) => [...prev, clean]);
    }
    setCustomLocus("");
  };

  const handleToggleLocus = (locus: string) => {
    sound.playSoft();
    setSelectedLoci((prev) =>
      prev.includes(locus) ? prev.filter((l) => l !== locus) : [...prev, locus]
    );
  };

  const handleGenerateBrief = async () => {
    sound.playSuccess();
    setIsGenerating(true);
    setStep(4);

    try {
      const brief = await api.generateDoctorPrepBrief({
        counselor_id: initialCounselor?.id,
        consultation_purpose: currentCategoryData.title,
        selected_goals: selectedGoals,
        family_conditions: familyEntries.map((e) => ({
          relative: e.relative,
          branch: e.branch,
          condition: e.condition,
          age_at_diagnosis: parseInt(e.age) || undefined,
        })),
        relevant_genes: selectedLoci,
        include_saved_pedigree: includeSavedPedigree,
        patient_notes: clinicalNotes,
      });

      setGeneratedBrief(brief);

      // Fetch matching counselors
      const matched = await api.matchCounselors({
        family_conditions: familyEntries.map((e) => e.condition),
        gene_loci: selectedLoci,
        limit: 3,
      });
      setRecommendedCounselors(matched);
    } catch (err) {
      console.error("Error generating doctor prep brief:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyBrief = () => {
    if (!generatedBrief) return;
    sound.playSuccess();
    const text = `
=== GENEWISE AI CLINICAL CONSULTATION BRIEF ===
Consultation Purpose: ${generatedBrief.consultation_purpose}
Prepared At: ${new Date(generatedBrief.created_at).toLocaleString()}
Suggested Specialty: ${generatedBrief.suggested_counselor_specialty}

FAMILY HISTORY OVERVIEW:
${generatedBrief.family_history_overview}

TOP 5 HIGH-YIELD QUESTIONS FOR THE COUNSELOR:
${generatedBrief.questions_to_ask.map((q, i) => `${i + 1}. ${q}`).join("\n")}

DOCUMENTS & RECORDS TO BRING:
${generatedBrief.documents_to_bring.map((d) => `• ${d}`).join("\n")}

RECOMMENDED SCREENING & ACMG TOPICS:
${generatedBrief.screening_topics.map((t) => `• ${t}`).join("\n")}

MISSING INFORMATION & PEDIGREE GAPS:
${generatedBrief.missing_information.map((m) => `• ${m}`).join("\n")}

IMPORTANT CLINICAL UNCERTAINTIES & LIMITATIONS:
${generatedBrief.important_uncertainties.map((u) => `• ${u}`).join("\n")}

STATUTORY DISCLAIMER:
${generatedBrief.disclaimer}
================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  const handlePrintBrief = () => {
    sound.playSoft();
    window.print();
  };

  return typeof document !== "undefined"
    ? createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              sound.playSoft();
              onClose();
            }
          }}
          className="fixed inset-0 z-[99999] bg-slate-950/80 dark:bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-fade-in transition-all"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <div className="bg-white/98 dark:bg-[#112128]/98 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 dark:border-teal-500/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] max-w-3xl w-full max-h-[92dvh] flex flex-col overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border bg-surface-low/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25">
                  <Stethoscope className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      Doctor Prep Wizard · AI Decision Support
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary/10 text-primary">
                      ACMG Informed
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                    Clinical Genetic Consultation Preparation
                  </h2>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playSoft();
                  onClose();
                }}
                className="p-1.5 rounded-xl text-muted-foreground hover:bg-surface-low hover:text-foreground transition-all"
                aria-label="Close Doctor Prep Wizard"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Navigation */}
            <div className="px-4 sm:px-6 py-2.5 bg-surface-low/30 border-b border-border shrink-0 flex items-center justify-between overflow-x-auto [scrollbar-width:none]">
              {[
                { n: 1, label: "Purpose & Goals" },
                { n: 2, label: "Family History" },
                { n: 3, label: "Biomarkers & Genes" },
                { n: 4, label: "AI Brief Synthesis" },
                { n: 5, label: "Review & Follow-Up" },
              ].map((s) => (
                <button
                  key={s.n}
                  onClick={() => {
                    if (s.n <= step || (step === 4 && s.n === 5)) {
                      sound.playSoft();
                      setStep(s.n);
                    }
                  }}
                  disabled={s.n > step && s.n !== 4}
                  className={`flex items-center gap-2 text-xs font-bold transition-all px-2 py-1 rounded-lg ${
                    step === s.n
                      ? "text-teal-700 dark:text-teal-400 bg-teal-500/10"
                      : s.n < step
                      ? "text-foreground hover:text-teal-700"
                      : "text-muted-foreground/60 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step === s.n
                        ? "bg-teal-700 text-white"
                        : s.n < step
                        ? "bg-emerald-600 text-white"
                        : "bg-border text-muted-foreground"
                    }`}
                  >
                    {s.n < step ? <Check className="w-3 h-3" /> : s.n}
                  </span>
                  <span className="hidden sm:inline whitespace-nowrap">{s.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* STEP 1: PURPOSE & CLINICAL GOALS */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <span>Step 1: Select Your Primary Clinical Category</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Choose the genetic or family concern you wish to address. This helps our AI engine tailor specific ACMG clinical guidelines and formulate high-yield consultation questions.
                    </p>
                  </div>

                  {/* Category Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CLINICAL_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          sound.playSoft();
                          setSelectedCategory(cat.id);
                          if (cat.loci.length > 0) {
                            setSelectedLoci(cat.loci.slice(0, 3));
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                          selectedCategory === cat.id
                            ? "bg-teal-50/80 dark:bg-teal-950/40 border-teal-600 dark:border-teal-400 ring-2 ring-teal-500/20"
                            : "bg-surface-low border-border hover:border-teal-500/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-extrabold text-foreground">{cat.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-surface-low text-muted-foreground border border-border">
                            {cat.specialty}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {cat.desc}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Consultation Goals */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <label className="text-xs font-bold text-foreground">
                      What do you hope to accomplish during this consultation?
                    </label>
                    <div className="space-y-1.5">
                      {[
                        "Review 3-generation pedigree risk patterns",
                        "Determine ACMG diagnostic panel candidacy",
                        "Identify cascade testing for first-degree relatives",
                        "Clarify Variant of Uncertain Significance (VUS) findings",
                        "Understand health insurance coverage & GINA protections",
                        "Discuss reproductive transmission risk & preconception options",
                      ].map((goal) => (
                        <label
                          key={goal}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-low/70 border border-border/80 text-xs text-foreground cursor-pointer hover:bg-surface-low transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGoals.includes(goal)}
                            onChange={() => handleToggleGoal(goal)}
                            className="rounded border-border text-teal-700 focus:ring-teal-700"
                          />
                          <span className="font-medium">{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: FAMILY HEALTH HISTORY */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <span>Step 2: Multi-Generational Family Health Tree</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Record known conditions, age at onset, and lineage (maternal or paternal). A genetic counselor uses 3 biological generations to detect autosomal dominant, recessive, or X-linked patterns.
                    </p>
                  </div>

                  {/* Add New Entry Form */}
                  <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-3">
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                      Add Family Member Condition
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      <select
                        value={newRelative}
                        onChange={(e) => setNewRelative(e.target.value)}
                        className="p-2 rounded-lg border border-border bg-white dark:bg-[#182d37] text-foreground text-xs"
                      >
                        <option>Father</option>
                        <option>Mother</option>
                        <option>Brother</option>
                        <option>Sister</option>
                        <option>Son</option>
                        <option>Daughter</option>
                        <option>Paternal Grandfather</option>
                        <option>Paternal Grandmother</option>
                        <option>Maternal Grandfather</option>
                        <option>Maternal Grandmother</option>
                        <option>Paternal Uncle/Aunt</option>
                        <option>Maternal Uncle/Aunt</option>
                        <option>Cousin</option>
                      </select>

                      <select
                        value={newBranch}
                        onChange={(e) => setNewBranch(e.target.value)}
                        className="p-2 rounded-lg border border-border bg-white dark:bg-[#182d37] text-foreground text-xs"
                      >
                        <option>Paternal</option>
                        <option>Maternal</option>
                        <option>Direct / Proband</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Health condition (or pick below)"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        className="p-2 rounded-lg border border-border bg-white dark:bg-[#182d37] text-foreground text-xs sm:col-span-1"
                      />

                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          placeholder="Age at diagnosis"
                          value={newAge}
                          onChange={(e) => setNewAge(e.target.value)}
                          className="w-full p-2 rounded-lg border border-border bg-white dark:bg-[#182d37] text-foreground text-xs"
                        />
                        <button
                          onClick={handleAddFamilyEntry}
                          className="px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shrink-0 shadow-2xs"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Quick Pick Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-muted-foreground mr-1">Quick Suggestions:</span>
                      {QUICK_CONDITIONS.slice(0, 6).map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            sound.playSoft();
                            setNewCondition(c);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-[#182d37] border border-border hover:border-teal-500 text-foreground transition-all"
                        >
                          + {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recorded Family Conditions Table */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>Recorded Family Tree Patterns ({familyEntries.length})</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Maternal &amp; Paternal Lineage
                      </span>
                    </span>

                    {familyEntries.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                        No family conditions recorded yet. Use the form above to add known diagnoses or select quick suggestions.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {familyEntries.map((entry, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-surface-low border border-border flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  entry.branch === "Maternal"
                                    ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                                    : entry.branch === "Paternal"
                                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                                    : "bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20"
                                }`}
                              >
                                {entry.branch}
                              </span>
                              <span className="font-bold text-foreground">{entry.relative}:</span>
                              <span className="text-foreground">{entry.condition}</span>
                              {entry.age && entry.age !== "Unknown" && (
                                <span className="text-muted-foreground text-[11px]">
                                  (dx at age {entry.age})
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveFamilyEntry(idx)}
                              className="text-muted-foreground hover:text-rose-600 p-1 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: BIOMARKERS, GENES & CLINICAL NOTES */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <span>Step 3: Gene Loci &amp; Prior Test Reports</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Specify suspected genetic loci or prior lab findings (e.g. elevated LDL, serology, carrier panels) to ensure targeted ACMG clinical correlation.
                    </p>
                  </div>

                  {/* Loci Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">
                      Gene Loci of Interest ({selectedLoci.length} selected)
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {["BRCA1", "BRCA2", "CFTR", "LDLR", "FBN1", "HFE", "GAA", "G6PD", "HTT", "SMN1"].map(
                        (locus) => {
                          const isSelected = selectedLoci.includes(locus);
                          return (
                            <button
                              key={locus}
                              onClick={() => handleToggleLocus(locus)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                isSelected
                                  ? "bg-teal-700 text-white shadow-2xs"
                                  : "bg-surface-low text-muted-foreground hover:text-foreground border border-border"
                              }`}
                            >
                              {locus}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add custom locus (e.g. TP53, APOB, PCSK9)..."
                        value={customLocus}
                        onChange={(e) => setCustomLocus(e.target.value)}
                        className="flex-1 p-2 rounded-lg border border-border bg-white dark:bg-[#182d37] text-foreground text-xs font-mono"
                      />
                      <button
                        onClick={handleAddLocus}
                        className="px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-2xs"
                      >
                        Add Locus
                      </button>
                    </div>
                  </div>

                  {/* Clinical Context & Specific Questions */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Specific Symptoms or Questions for the Counselor
                    </label>
                    <textarea
                      rows={3}
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      placeholder="e.g. Any specific test results, symptoms, or upcoming family planning decisions..."
                      className="w-full p-2.5 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground text-xs leading-relaxed resize-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>

                  {/* Attachment Toggle */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-low border border-border text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSavedPedigree}
                      onChange={(e) => setIncludeSavedPedigree(e.target.checked)}
                      className="rounded border-border text-teal-700 focus:ring-teal-700"
                    />
                    <div>
                      <span className="font-bold text-foreground">
                        Integrate saved GeneWise Pedigree &amp; Lab History
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Securely cross-references your authorized family tree without transmitting raw DNA sequences.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* STEP 4: AI BRIEF SYNTHESIS */}
              {step === 4 && (
                <div className="space-y-5">
                  {isGenerating ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center mx-auto border border-teal-500/25 animate-pulse">
                        <Brain className="w-7 h-7 animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-base text-foreground">
                          Synthesizing Clinical Consultation Brief
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Analyzing 3 generations of family records, correlating ACMG guidelines, and formulating high-yield discussion points...
                        </p>
                      </div>
                    </div>
                  ) : generatedBrief ? (
                    <div className="space-y-5">
                      {/* Brief Header Banner */}
                      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                            AI Synthesized Clinical Discussion Packet
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white">
                            Ready for Counselor
                          </span>
                        </div>
                        <h3 className="font-extrabold text-sm text-foreground">
                          {generatedBrief.consultation_purpose} — Clinical Discussion Guide
                        </h3>
                        <p className="text-xs text-teal-900/80 dark:text-teal-200/80 leading-relaxed">
                          {generatedBrief.family_history_overview}
                        </p>
                      </div>

                      {/* Top 5 High-Yield Questions */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-teal-600" />
                          Top 5 High-Yield Questions to Ask Your Counselor
                        </h4>
                        <div className="space-y-1.5">
                          {(generatedBrief.questions_to_ask || []).map((q, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-surface-low border border-border text-xs flex items-start gap-2.5"
                            >
                              <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="font-medium text-foreground leading-relaxed">{q}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Two Column Grid: Documents to Bring + Screening Topics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-2">
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Documents &amp; Records to Bring
                          </h4>
                          <ul className="space-y-1.5 text-xs text-muted-foreground">
                            {(generatedBrief.documents_to_bring || []).map((doc, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-teal-600">•</span>
                                <span>{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-2">
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-primary" />
                            Recommended Screening Topics
                          </h4>
                          <ul className="space-y-1.5 text-xs text-muted-foreground">
                            {(generatedBrief.screening_topics || []).map((top, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-teal-600">•</span>
                                <span>{top}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Uncertainties & Limitations Alert */}
                      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          Clinical Limitations &amp; Missing Information
                        </h4>
                        <div className="text-[11px] text-amber-900/80 dark:text-amber-300/80 space-y-1 leading-relaxed">
                          {(generatedBrief.important_uncertainties || []).map((u, i) => (
                            <p key={i}>• {u}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* STEP 5: REVIEW, EXPORT & FOLLOW-UP */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <span>Step 5: Professional Follow-Up &amp; Counselor Connection</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Export your clinical brief or directly request a consultation with a board-certified counselor specializing in {generatedBrief?.suggested_counselor_specialty || currentCategoryData.specialty}.
                    </p>
                  </div>

                  {/* Export Options Bar */}
                  <div className="p-4 rounded-2xl bg-surface-low border border-border flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-foreground block">
                        Clinical Brief Export Options
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Ready for electronic transmission or clinical printing
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyBrief}
                        className="px-3 py-1.5 rounded-xl border border-border bg-white dark:bg-[#182d37] text-xs font-bold text-foreground hover:bg-surface-low transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        {copiedBrief ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handlePrintBrief}
                        className="px-3 py-1.5 rounded-xl border border-border bg-white dark:bg-[#182d37] text-xs font-bold text-foreground hover:bg-surface-low transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print / PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Recommended Counselors Matching this Brief */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Matched Specialists for {generatedBrief?.suggested_counselor_specialty || "this Profile"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        NSGC / ABGC Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(recommendedCounselors.length > 0
                        ? recommendedCounselors
                        : [initialCounselor].filter(Boolean)
                      ).map((c) => {
                        if (!c) return null;
                        return (
                          <div
                            key={c.id}
                            className="p-3.5 rounded-xl bg-surface-low border border-border space-y-3 hover:border-teal-500/50 transition-all flex flex-col justify-between"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={c.avatar || "/images/counselors/maya-lin.jpg"}
                                alt={c.name}
                                className="w-12 h-12 rounded-xl object-cover ring-1 ring-teal-500/30 shrink-0"
                              />
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                                  {c.specialty}
                                </span>
                                <h4 className="font-extrabold text-xs text-foreground truncate">
                                  {c.name}
                                </h4>
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {c.institution}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                sound.playSuccess();
                                onClose();
                                if (onSelectCounselorForBooking) {
                                  onSelectCounselorForBooking(c);
                                }
                              }}
                              className="w-full py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-2xs flex items-center justify-center gap-1.5"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Book Intake with this Counselor</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explicit Informed Consent Box */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 text-xs text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentShareWithCounselor}
                      onChange={(e) => setConsentShareWithCounselor(e.target.checked)}
                      className="rounded border-border text-teal-700 focus:ring-teal-700"
                    />
                    <span className="text-[11px] text-teal-900 dark:text-teal-200 leading-relaxed">
                      I explicitly authorize GeneWise AI to transmit this structured consultation brief and anonymized family risk history to my chosen attending counselor.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-border bg-surface-low/50 flex items-center justify-between shrink-0">
              {step > 1 ? (
                <button
                  onClick={() => {
                    sound.playSoft();
                    setStep((prev) => Math.max(1, prev - 1));
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-low border border-border flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Step</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    sound.playSoft();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-surface-low transition-all"
                >
                  Cancel
                </button>
              )}

              {step < 3 && (
                <button
                  onClick={() => {
                    sound.playSoft();
                    setStep((prev) => prev + 1);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-2xs flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={handleGenerateBrief}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-xs flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Consultation Brief</span>
                </button>
              )}

              {step === 4 && (
                <button
                  onClick={() => {
                    sound.playSoft();
                    setStep(5);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Proceed to Follow-Up &amp; Booking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 5 && (
                <button
                  onClick={() => {
                    sound.playSuccess();
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Done &amp; Close</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
}
