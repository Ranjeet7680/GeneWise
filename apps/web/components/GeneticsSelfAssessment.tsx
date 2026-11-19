"use client";

import React, { useState } from "react";
import {
  Award,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { sound } from "@/lib/sound";

export interface AssessmentQuestion {
  id: number;
  category: string;
  difficulty: "Foundational" | "Intermediate" | "Advanced Clinical";
  question: string;
  options: { key: string; label: string; text: string }[];
  correctKey: string;
  explanation: string;
  clinicalRelevance: string;
  resourceTitle: string;
  resourcePmid?: string;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    category: "Autosomal Recessive Inheritance",
    difficulty: "Foundational",
    question:
      "Does having a first-degree relative with an autosomal recessive condition mean you will inevitably develop the condition?",
    options: [
      { key: "A", label: "A", text: "Yes, inevitably." },
      {
        key: "B",
        label: "B",
        text: "No, not necessarily (depends on both maternal and paternal carrier transmission status).",
      },
      {
        key: "C",
        label: "C",
        text: "Only if you are male due to chromosomal hemizygosity.",
      },
      {
        key: "D",
        label: "D",
        text: "Yes, because all first-degree relatives express complete Mendelian penetrance.",
      },
    ],
    correctKey: "B",
    explanation:
      "Autosomal recessive disorders require two pathogenic alleles (one from each biological parent) to manifest disease. An individual with an affected first-degree relative is typically an obligate or 2/3 potential carrier, but will not manifest disease unless both inherited alleles are mutated.",
    clinicalRelevance:
      "Essential for carrier screening and preconception counseling (e.g., Cystic Fibrosis CFTR, Sickle Cell HBB, Tay-Sachs HEXA).",
    resourceTitle: "ACMG Recommendations for Carrier Screening & Reproductive Risk Evaluation",
    resourcePmid: "34012068",
  },
  {
    id: 2,
    category: "Autosomal Dominant Inheritance",
    difficulty: "Intermediate",
    question:
      "A parent with an autosomal dominant pathogenic variant (heterozygous Aa) has a child with an unaffected partner (aa). What is the mathematical transmission risk per pregnancy?",
    options: [
      { key: "A", label: "A", text: "25% chance of inheriting the pathogenic variant." },
      { key: "B", label: "B", text: "50% chance of inheriting the pathogenic variant for each pregnancy." },
      { key: "C", label: "C", text: "100% transmission to all biological male offspring." },
      { key: "D", label: "D", text: "0% transmission unless maternal age exceeds 35 years." },
    ],
    correctKey: "B",
    explanation:
      "In autosomal dominant inheritance, each conception carries an independent 50% probability of receiving the mutant allele (Aa vs aa) regardless of the biological sex of previous offspring.",
    clinicalRelevance:
      "Governs hereditary cancer syndromes (Lynch syndrome MLH1/MSH2, BRCA1/2) and Marfan syndrome (FBN1).",
    resourceTitle: "NCCN Clinical Practice Guidelines in Oncology: Genetic/Familial High-Risk Assessment",
    resourcePmid: "33892029",
  },
  {
    id: 3,
    category: "X-Linked Inheritance",
    difficulty: "Advanced Clinical",
    question:
      "Why do carrier females for X-linked recessive conditions (e.g., Duchenne Muscular Dystrophy DMD, Hemophilia A F8) occasionally manifest mild-to-moderate clinical symptoms?",
    options: [
      { key: "A", label: "A", text: "Due to complete autosomal transposition of chromosome X." },
      { key: "B", label: "B", text: "Skewed X-chromosome inactivation (lyonization) favoring expression of the mutant allele." },
      { key: "C", label: "C", text: "Homozygous maternal imprinting silencing the wild-type locus." },
      { key: "D", label: "D", text: "Somatic hypermutation occurring exclusively during embryogenesis." },
    ],
    correctKey: "B",
    explanation:
      "Non-random or skewed lyonization (X-inactivation) can lead to preferential inactivation of the normal X chromosome in key tissues, causing manifesting heterozygote phenotypes in females.",
    clinicalRelevance:
      "Critical for recognizing cardiac, skeletal, or bleeding phenotypes in female carriers of X-linked disorders.",
    resourceTitle: "Orphanet Journal of Rare Diseases: Manifesting Carriers in X-Linked Disorders",
    resourcePmid: "30514331",
  },
  {
    id: 4,
    category: "Pedigree Interpretation",
    difficulty: "Intermediate",
    question:
      "In a standardized three-generation clinical genetic pedigree, what does a half-filled square symbol represent?",
    options: [
      { key: "A", label: "A", text: "Deceased female individual." },
      { key: "B", label: "B", text: "Heterozygous male carrier for an autosomal recessive condition." },
      { key: "C", label: "C", text: "Proband with unspecified biological sex." },
      { key: "D", label: "D", text: "Unaffected male with non-paternity confirmation." },
    ],
    correctKey: "B",
    explanation:
      "Per the National Society of Genetic Counselors (NSGC) pedigree standardization rules, squares denote males, circles denote females, and half-shaded quadrants represent verified or obligate heterozygous carriers.",
    clinicalRelevance:
      "Standard pedigree documentation enables cross-institutional clinical validation and cascade relative testing.",
    resourceTitle: "NSGC Standardized Pedigree Nomenclature Update",
    resourcePmid: "18663675",
  },
  {
    id: 5,
    category: "Genetic Testing Interpretation",
    difficulty: "Advanced Clinical",
    question:
      "According to ACMG/AMP consensus guidelines, how should a 'Variant of Uncertain Significance' (VUS) be managed clinically in medical decision-making?",
    options: [
      { key: "A", label: "A", text: "Treated as definitively pathogenic to initiate prophylactic surgical resection." },
      { key: "B", label: "B", text: "A VUS should NOT dictate irreversible clinical or prophylactic interventions; managed by personal/family history." },
      { key: "C", label: "C", text: "Disregarded entirely without periodic re-annotation or family segregation tracking." },
      { key: "D", label: "D", text: "Automatically reclassified as benign after 6 months." },
    ],
    correctKey: "B",
    explanation:
      "ACMG guidelines strictly state that a VUS must not be used to direct major irreversible clinical interventions. Management should follow documented family phenotypic history while awaiting periodic laboratory variant reclassification.",
    clinicalRelevance:
      "Prevents overtreatment, unnecessary prophylactic surgeries, and psychological distress in patients receiving multigene panel testing.",
    resourceTitle: "Standards and Guidelines for the Interpretation of Sequence Variants: ACMG and AMP",
    resourcePmid: "25741868",
  },
];

export default function GeneticsSelfAssessment() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const currentQ = ASSESSMENT_QUESTIONS[currentIndex];
  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = Object.entries(selectedAnswers).filter(
    ([id, ans]) => {
      const q = ASSESSMENT_QUESTIONS.find((item) => item.id === Number(id));
      return q && q.correctKey === ans;
    }
  ).length;
  const scorePercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const handleSelectOption = (key: string) => {
    sound.playClick();
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: key }));
    setShowExplanation((prev) => ({ ...prev, [currentQ.id]: true }));
    if (key === currentQ.correctKey) {
      sound.playSuccess();
    } else {
      sound.playWarning();
    }
  };

  const toggleBookmark = (id: number) => {
    sound.playSoft();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    sound.playPop();
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIndex(0);
  };

  const isAnswered = Boolean(selectedAnswers[currentQ.id]);
  const currentAnswer = selectedAnswers[currentQ.id];
  const isCorrect = currentAnswer === currentQ.correctKey;
  const isBookmarked = bookmarkedIds.includes(currentQ.id);

  return (
    <div className="bg-surface-lowest dark:bg-slate-900/60 rounded-3xl border border-border/80 shadow-2xs p-6 sm:p-8 space-y-6 flex flex-col justify-between">
      {/* Top Header & Metrics Bar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              GENETICS SELF-ASSESSMENT • Checkpoint {currentIndex + 1} of {totalQuestions}
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase">
                {currentQ.category}
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-low border border-border text-foreground">
                {currentQ.difficulty}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmark(currentQ.id)}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
              className={`p-2 rounded-xl border text-xs transition-all flex items-center gap-1.5 ${
                isBookmarked
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
                  : "bg-surface-lowest border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
              <span className="hidden sm:inline font-semibold">{isBookmarked ? "Saved" : "Save"}</span>
            </button>
            <button
              onClick={handleReset}
              title="Reset Assessment Progress"
              className="p-2 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
            {currentQ.question}
          </h3>
          <p className="text-xs text-muted-foreground">
            Select the most clinically defensible conclusion based on classical Mendelian and ACMG guidelines:
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5 pt-1">
          {currentQ.options.map((option) => {
            const isSelected = currentAnswer === option.key;
            const isThisOptionCorrect = option.key === currentQ.correctKey;
            let btnClass = "bg-surface-container-low dark:bg-slate-800/60 border-border hover:border-teal-500/50 text-foreground";

            if (isAnswered) {
              if (isSelected && isCorrect) {
                btnClass = "bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-500/30";
              } else if (isSelected && !isCorrect) {
                btnClass = "bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500/30";
              } else if (!isSelected && isThisOptionCorrect) {
                btnClass = "bg-emerald-500/5 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 border-dashed";
              }
            }

            return (
              <button
                key={option.key}
                onClick={() => handleSelectOption(option.key)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all text-xs sm:text-sm flex items-start gap-3 ${btnClass}`}
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
                <span className="pt-0.5 font-medium leading-relaxed">{option.text}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback & Clinical Relevance Box */}
        {showExplanation[currentQ.id] && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm animate-in fade-in duration-200 space-y-2.5 ${
              isCorrect
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    Correct clinical conclusion
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    Review required · Correct Answer: Option {currentQ.correctKey}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs leading-relaxed text-foreground/90 font-sans">
              {currentQ.explanation}
            </p>

            <div className="pt-2 border-t border-border/40 text-[11px] space-y-1">
              <span className="font-bold text-foreground block">Clinical Relevance:</span>
              <p className="text-muted-foreground">{currentQ.clinicalRelevance}</p>
              <div className="pt-1 flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-mono text-[10px]">
                <BookOpen className="w-3 h-3" />
                <span>{currentQ.resourceTitle}</span>
                {currentQ.resourcePmid && <span>(PMID: {currentQ.resourcePmid})</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stepper Footer & Performance Score */}
      <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-muted-foreground font-mono">
          <span>
            Score: <strong className="text-foreground">{correctCount}/{answeredCount || 0}</strong> ({scorePercent}%)
          </span>
          <span className="text-border">|</span>
          <span>
            Answered: <strong className="text-foreground">{answeredCount}</strong> / {totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              sound.playSoft();
              setCurrentIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentIndex === 0}
            className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <button
            onClick={() => {
              sound.playSoft();
              setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
            }}
            disabled={currentIndex === totalQuestions - 1}
            className="px-4 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
