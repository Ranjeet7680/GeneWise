"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
  Layers,
  Lightbulb,
  Microscope,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { sound } from "@/lib/sound";

export interface ExplainabilityDossier {
  insight_id: string;
  insight_title: string;
  insight_type: string;
  generated_at: string;
  explainability_dimensions: {
    "1_information_analyzed": string[];
    "2_relevant_family_history": string[];
    "3_clinical_logic_rationale": string;
    "4_supporting_evidence_citations": Array<{
      title: string;
      source?: string;
      publication_year?: number;
      pmid?: string;
      url?: string;
      evidence_tier?: string;
      is_outdated_warning?: boolean;
      consensus_status?: string;
    }>;
    "5_uncertainties_and_limitations": string[];
    "6_suggested_professional_followup": string[];
  };
  statutory_disclaimer?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dossier: ExplainabilityDossier | null;
}

export default function ExplainableInsightModal({ isOpen, onClose, dossier }: Props) {
  if (!isOpen || !dossier) return null;

  const dims = dossier.explainability_dimensions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-white dark:bg-[#0f1f26] border border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-transparent flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-200 border border-teal-500/25">
                <Lightbulb className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                Explainable AI (XAI)
              </span>
              <span className="text-[10px] text-muted-foreground">
                6-Point Clinical Rationale
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              {dossier.insight_title}
            </h2>
            <p className="text-xs text-muted-foreground">
              Transparent breakdown of data sources, pedigree heuristics, and evidence grounding.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content: 6 Dimensions */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Dimension 1: Information Analyzed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] font-black">
                1
              </div>
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Information &amp; Health Data Analyzed</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1.5">
              {dims["1_information_analyzed"].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension 2: Relevant Family-History Observations */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] font-black">
                2
              </div>
              <Users className="w-4 h-4 text-teal-600" />
              <span>Relevant Family-History Observations</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1.5">
              {dims["2_relevant_family_history"].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension 3: Clinical Logic & Rationale */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] font-black">
                3
              </div>
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Why This Insight Was Generated (Clinical Logic)</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-xs text-foreground leading-relaxed">
              {dims["3_clinical_logic_rationale"]}
            </div>
          </div>

          {/* Dimension 4: Supporting Medical Evidence & Outdated Literature Check */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] font-black">
                  4
                </div>
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Supporting Medical Evidence &amp; Literature Grounding</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Peer-Reviewed / Guideline Validated
              </span>
            </div>

            <div className="space-y-2">
              {dims["4_supporting_evidence_citations"].map((cite, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                    cite.is_outdated_warning
                      ? "bg-amber-500/5 border-amber-500/30"
                      : "bg-muted/40 border-border/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-foreground">{cite.title}</span>
                    {cite.url && (
                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-600 hover:text-teal-700 dark:text-teal-400 shrink-0 inline-flex items-center gap-1 text-[10px] font-bold"
                      >
                        <span>View Citation</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                    {cite.source && <span>{cite.source}</span>}
                    {cite.publication_year && <span>• {cite.publication_year}</span>}
                    {cite.pmid && (
                      <span className="font-mono text-teal-700 dark:text-teal-300">
                        PMID: {cite.pmid}
                      </span>
                    )}
                    {cite.evidence_tier && (
                      <span className="px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-800 dark:text-teal-200">
                        {cite.evidence_tier}
                      </span>
                    )}
                  </div>

                  {cite.is_outdated_warning && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-300 font-semibold pt-1">
                      <Clock className="w-3 h-3" />
                      <span>{cite.consensus_status}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dimension 5: Uncertainties & Limitations */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-center text-[10px] font-black">
                5
              </div>
              <HelpCircle className="w-4 h-4 text-rose-500" />
              <span>Uncertainties, Data Gaps &amp; Missing Information</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 space-y-1.5">
              {dims["5_uncertainties_and_limitations"].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-foreground">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension 6: Suggested Professional Follow-Up */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-black">
                6
              </div>
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span>Suggested Clinical &amp; Counseling Follow-Up</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
              {dims["6_suggested_professional_followup"].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-foreground">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer Banner */}
          <div className="p-3 rounded-2xl bg-muted/60 border border-border text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              {dossier.statutory_disclaimer ||
                "MediPredict AI provides educational risk awareness based on authorized records. It does not provide definitive medical or genetic diagnoses and cannot replace clinical evaluation."}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
}
