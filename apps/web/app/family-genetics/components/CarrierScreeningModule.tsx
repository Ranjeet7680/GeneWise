"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Dna,
  ExternalLink,
  HelpCircle,
  Info,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { CarrierConditionInfo } from "../types";

interface CarrierScreeningModuleProps {
  conditions: CarrierConditionInfo[];
  onNavigateTab: (tabId: string) => void;
}

export default function CarrierScreeningModule({
  conditions,
  onNavigateTab,
}: CarrierScreeningModuleProps) {
  const [selectedCondition, setSelectedCondition] = useState<CarrierConditionInfo>(conditions[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredConditions = conditions.filter(
    (c) =>
      c.condition_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gene_symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.inheritance_pattern.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Clinical Caution & Educational Boundary */}
      <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/10 dark:bg-teal-950/20 text-teal-900 dark:text-teal-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold">
            Educational Carrier Screening Information Center
          </p>
          <p className="text-muted-foreground dark:text-teal-300/80">
            This module provides educational context regarding carrier screening options, clinical indications, and residual risks. MediPredict AI does not order medical tests or claim a specific test is required without professional clinical evaluation.
          </p>
        </div>
      </div>

      {/* 4 Essential Educational Foundations Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-2">
          <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px] flex items-center gap-1.5">
            <Dna className="w-3.5 h-3.5" />
            <span>1. What is Screening?</span>
          </span>
          <h4 className="font-bold text-foreground">Identifies Asymptomatic Variants</h4>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Carrier screening analyzes your DNA to identify whether you carry an altered copy of a recessive gene that could affect future children if both parents are carriers.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-2">
          <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>2. Screening vs Diagnostic</span>
          </span>
          <h4 className="font-bold text-foreground">Likelihood vs Confirmation</h4>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Carrier screening assesses risk in prospective parents. It is NOT diagnostic prenatal testing (like CVS or amniocentesis), which directly diagnoses a fetus.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-2">
          <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>3. Residual Risk Principle</span>
          </span>
          <h4 className="font-bold text-foreground">Negative ≠ Zero Risk</h4>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            A negative test significantly lowers carrier probability, but does not eliminate it because screening panels evaluate common variants, not all rare DNA alterations.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-2">
          <span className="font-bold uppercase tracking-wider text-teal-600 text-[10px] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>4. Partner Testing</span>
          </span>
          <h4 className="font-bold text-foreground">Both Parents Must Be Evaluated</h4>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            For autosomal recessive conditions, risk to pregnancy exists only if BOTH biological parents carry alterations in the same gene. Partner screening is essential.
          </p>
        </div>
      </div>

      {/* Main Condition Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Condition Directory (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Condition Library ({conditions.length})
            </h3>
            <span className="text-[10px] text-muted-foreground">ACMG / ACOG Guidelines</span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search condition or gene..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-[#1c303d] text-xs text-foreground outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* List of condition cards */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredConditions.map((cond, idx) => {
              const isSelected = selectedCondition?.condition_name === cond.condition_name;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedCondition(cond)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "border-teal-500 bg-teal-500/10 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 shadow-xs"
                      : "border-border bg-white dark:bg-[#1a2d39] text-foreground hover:border-teal-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>{cond.condition_name}</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-teal-600" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold">{cond.gene_symbol}</span>
                    <span>•</span>
                    <span>{cond.inheritance_pattern}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Condition Detail Dossier (8 cols) */}
        {selectedCondition && (
          <div className="lg:col-span-8 p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                    {selectedCondition.inheritance_pattern}
                  </span>
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    Gene: <span className="text-teal-600">{selectedCondition.gene_symbol}</span>
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-foreground tracking-tight mt-1">
                  {selectedCondition.condition_name}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground self-start sm:self-center">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Reviewed: {selectedCondition.last_reviewed_date}</span>
              </div>
            </div>

            {/* Section 1: Who Should Consider Discussing with Clinician */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Who May Consider Discussing Screening with a Clinician</span>
              </h4>
              <ul className="text-xs space-y-1.5 pl-6 list-disc text-foreground">
                {selectedCondition.who_should_consider.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 2: Screening Limitations */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Clinical Limitations of Screening</span>
              </h4>
              <ul className="text-xs space-y-1.5 pl-6 list-disc text-foreground">
                {selectedCondition.screening_limitations.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 3: Residual Risk Explanation */}
            <div className="p-4 rounded-xl border border-border bg-surface-low/50 dark:bg-[#1a2d39] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Understanding Residual Risk (After a Negative Result)</span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedCondition.residual_risk_explanation}
              </p>
            </div>

            {/* Section 4: Partner Testing Guidance */}
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-950/10 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Partner Testing Protocol & Reproductive Implications</span>
              </h4>
              <p className="text-xs text-foreground leading-relaxed">
                {selectedCondition.partner_testing_guidance}
              </p>
            </div>

            {/* Section 5: Sources & Preconception Action Button */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Clinical Evidence Sources:
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {selectedCondition.source_references.join(" • ")}
                </p>
              </div>

              <button
                onClick={() => onNavigateTab("preconception")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs whitespace-nowrap self-start sm:self-center"
              >
                <span>Add to Preconception Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
