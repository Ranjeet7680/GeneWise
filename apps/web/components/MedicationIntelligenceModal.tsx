"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Pill,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { MedicationEducationResponse } from "@/types";

interface MedicationIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (medSummary: string) => void;
  patientActiveMeds?: string[];
  patientConditions?: string[];
}

const COMMON_DRUGS = [
  "Metformin",
  "Atorvastatin",
  "Lisinopril",
  "Amlodipine",
  "Levothyroxine",
  "Omeprazole",
  "Metoprolol",
  "Losartan",
  "Amoxicillin",
  "Aspirin",
];

export default function MedicationIntelligenceModal({
  isOpen,
  onClose,
  onSendToChat,
  patientActiveMeds = ["Metformin 500mg daily", "Atorvastatin 20mg nocte"],
  patientConditions = ["Type 2 Diabetes Mellitus", "Hypertension"],
}: MedicationIntelligenceModalProps) {
  const [searchTerm, setSearchTerm] = useState<string>("Metformin");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [monograph, setMonograph] = useState<MedicationEducationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (queryMed?: string) => {
    const medToQuery = (queryMed || searchTerm).trim();
    if (!medToQuery) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.getMedicationEducation({
        medication_name: medToQuery,
        current_conditions: patientConditions,
        other_medications: patientActiveMeds,
      });
      setMonograph(res);
    } catch (err: any) {
      setError(err?.message || "Failed to retrieve medication monograph.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToChatAction = () => {
    if (!monograph || !onSendToChat) return;
    const text =
      `**Medication Education Monograph: ${monograph.generic_name}**\n` +
      `- **Drug Class:** ${monograph.drug_class}\n` +
      `- **Primary Indications:** ${monograph.primary_uses.slice(0, 2).join("; ")}\n` +
      `- **Mechanism of Action:** ${monograph.mechanism_of_action}\n` +
      `- **Common Side Effects:** ${monograph.common_side_effects.slice(0, 3).join("; ")}\n` +
      (monograph.serious_side_effects_warning.length > 0
        ? `- **Serious Warnings:** ${monograph.serious_side_effects_warning[0]}\n`
        : "") +
      `- **Questions for Pharmacist/Doctor:**\n` +
      monograph.questions_for_pharmacist_or_doctor.map((q, i) => `  ${i + 1}. ${q}`).join("\n") +
      `\n\n*Notice: ${monograph.non_prescribing_disclaimer}*`;

    onSendToChat(text);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="medication-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#14262f] rounded-2xl border border-border shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Pill className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 id="medication-modal-title" className="text-base sm:text-lg font-bold text-foreground">
                Medication Intelligence & Pharmacology Reference
              </h3>
              <p className="text-xs text-muted-foreground">
                Evidence-grounded drug monographs, interaction screening & precautions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close medication modal"
            className="p-1 rounded-lg text-muted-foreground hover:bg-surface-low transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Quick Chips */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search prescription or OTC drug (e.g. Metformin, Lipitor, Lisinopril)..."
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-border bg-surface-low focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSearch()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isLoading ? "Looking up..." : "Lookup"}
            </button>
          </div>

          {/* Quick Drug Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Quick Reference:
            </span>
            {COMMON_DRUGS.map((drug) => (
              <button
                key={drug}
                type="button"
                onClick={() => {
                  setSearchTerm(drug);
                  handleSearch(drug);
                }}
                className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-surface-low hover:border-amber-500/40 text-foreground transition-all cursor-pointer hover:bg-amber-500/10"
              >
                {drug}
              </button>
            ))}
          </div>

          {/* Active Patient Medications */}
          {patientActiveMeds.length > 0 && (
            <div className="p-2.5 rounded-xl bg-surface-low border border-border text-[11px] flex flex-wrap items-center gap-2">
              <span className="font-bold text-foreground">Your Prescriptions:</span>
              {patientActiveMeds.map((med, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const cleanName = med.split(" ")[0];
                    setSearchTerm(cleanName);
                    handleSearch(cleanName);
                  }}
                  className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/20 font-medium hover:bg-teal-500/20 transition-colors"
                >
                  {med}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Monograph Display */}
        {monograph && (
          <div className="space-y-4 animate-in fade-in">
            {/* Monograph Header Card */}
            <div className="p-4 rounded-xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-black text-foreground">{monograph.generic_name}</h4>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {monograph.drug_class}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-low border border-border text-muted-foreground">
                  Evidence-Grounded Monograph
                </span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed pt-1">
                <span className="font-bold">Mechanism:</span> {monograph.mechanism_of_action}
              </p>
            </div>

            {/* Primary Uses & Indications */}
            <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-1.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Primary Clinical Indications:</span>
              </span>
              <ul className="list-disc list-inside text-xs text-foreground/85 space-y-0.5 pl-1">
                {(monograph.primary_uses || []).map((use, idx) => (
                  <li key={idx}>{use}</li>
                ))}
              </ul>
            </div>

            {/* Side Effects & Warnings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-1.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Common Side Effects:</span>
                </span>
                <ul className="list-disc list-inside text-xs text-foreground/85 space-y-0.5 pl-1">
                  {(monograph.common_side_effects || []).map((se, idx) => (
                    <li key={idx}>{se}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1.5">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  <span>Serious Warnings & Black Box:</span>
                </span>
                <ul className="list-disc list-inside text-xs text-foreground/90 space-y-0.5 pl-1">
                  {(monograph.serious_side_effects_warning || []).map((warn, idx) => (
                    <li key={idx} className="font-medium">
                      {warn}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Precautions & Interactions */}
            <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Clinical Precautions & Interaction Alerts:</span>
              </span>
              <ul className="space-y-1.5 text-xs text-foreground/85">
                {(monograph.precautions_and_warnings || []).map((prec, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{prec}</span>
                  </li>
                ))}
                {((monograph as any).potential_interactions || []).map((inter: any, idx: number) => (
                  <li key={`inter-${idx}`} className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold">•</span>
                    <span>
                      <strong className="text-red-600 dark:text-red-400">
                        Interaction with {inter.drug} ({inter.severity}):
                      </strong>{" "}
                      {inter.effect}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Food & Lifestyle Guidelines */}
            {((monograph as any).food_and_lifestyle_interactions?.length ?? 0) > 0 && (
              <div className="p-3 rounded-xl bg-surface-low border border-border text-xs space-y-1">
                <span className="font-bold text-foreground">Food, Timing & Lifestyle Advice:</span>
                <ul className="list-disc list-inside space-y-0.5 text-foreground/80 pl-1">
                  {((monograph as any).food_and_lifestyle_interactions || []).map((item: any, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Doctor / Pharmacist Questions */}
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-500/20 space-y-1.5">
              <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                <span>Questions for Your Pharmacist or Doctor:</span>
              </span>
              <ol className="list-decimal list-inside text-xs text-teal-950 dark:text-teal-100 space-y-1">
                {((monograph as any).questions_for_pharmacist_or_doctor || []).map((q: any, idx: number) => (
                  <li key={idx}>{q}</li>
                ))}
              </ol>
            </div>

            {/* Citations */}
            {monograph.citations && monograph.citations.length > 0 && (
              <div className="text-[11px] space-y-1 pt-1">
                <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Pharmacological Evidence Guideline:
                </span>
                <div className="flex flex-wrap gap-2">
                  {monograph.citations.map((cite, idx) => (
                    <a
                      key={idx}
                      href={cite.url || `https://pubmed.ncbi.nlm.nih.gov/${cite.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-low border border-border hover:border-amber-500/40 text-foreground transition-colors"
                    >
                      <BookOpen className="w-3 h-3 text-amber-600" />
                      <span className="truncate max-w-[280px]">
                        {cite.guideline} ({cite.journal} {cite.year})
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Statutory Non-Prescribing Disclaimer */}
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-[10px] text-amber-900 dark:text-amber-200 leading-relaxed border border-amber-500/20 font-medium">
              <span className="font-bold">Statutory Non-Prescribing Notice:</span>{" "}
              {monograph.non_prescribing_disclaimer}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setMonograph(null)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Clear Search
              </button>

              <div className="flex items-center gap-2">
                {onSendToChat && (
                  <button
                    type="button"
                    onClick={handleSendToChatAction}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Insert into Consultation</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-surface-low"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
