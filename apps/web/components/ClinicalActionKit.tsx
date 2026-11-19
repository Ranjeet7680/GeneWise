"use client";

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Layers,
  Sparkles,
  Stethoscope,
  User,
} from "lucide-react";
import { sound } from "@/lib/sound";

export interface ActionCardItem {
  id: string;
  title: string;
  description: string;
  clinicalRelevance: string;
  requiredInfo: string;
  recommendedNextStep: string;
  status: "Not Started" | "In Progress" | "Pending Review" | "Completed";
  responsibleUser: string;
  dueDate: string;
  actionUrl?: string;
  buttonLabel?: string;
}

export const INITIAL_ACTION_CARDS: ActionCardItem[] = [
  {
    id: "action-1",
    title: "1. Review Family History",
    description: "Audit 3-generation pedigree records for early-onset hereditary clustering.",
    clinicalRelevance: "Identifies candidate phenotypes qualifying for ACMG/NCCN high-risk assessment.",
    requiredInfo: "Maternal and paternal diagnoses, age of onset, confirmed histology.",
    recommendedNextStep: "Schedule structured interview with proband and verify pedigree links.",
    status: "Completed",
    responsibleUser: "Patient / Primary Care",
    dueDate: "2026-11-25",
    actionUrl: "/my-family-history",
    buttonLabel: "Open Pedigree",
  },
  {
    id: "action-2",
    title: "2. Perform Carrier Screening",
    description: "Evaluate reproductive carrier status for autosomal recessive and X-linked conditions.",
    clinicalRelevance: "Estimates Mendelian transmission risk prior to conception or assisted reproduction.",
    requiredInfo: "Expanded carrier screening (ECS) panel results or targeted locus testing.",
    recommendedNextStep: "Review carrier concordance with partner.",
    status: "In Progress",
    responsibleUser: "Clinical Geneticist",
    dueDate: "2026-11-28",
    actionUrl: "/family-genetics?tab=carrier",
    buttonLabel: "View Carrier Loci",
  },
  {
    id: "action-3",
    title: "3. Consider Genetic Counseling",
    description: "Connect with a board-certified counselor (NSGC/ABGC) for pre-test education and informed consent.",
    clinicalRelevance: "Mitigates psychosocial risks and reviews GINA insurance non-discrimination protections.",
    requiredInfo: "Documented pedigree brief and consultation objectives.",
    recommendedNextStep: "Book telehealth consultation session.",
    status: "In Progress",
    responsibleUser: "Genetic Counselor",
    dueDate: "2026-12-02",
    actionUrl: "/clinical-support/find-counselor",
    buttonLabel: "Find Counselor",
  },
  {
    id: "action-4",
    title: "4. Review Laboratory Reports",
    description: "Verify uploaded biochemical and genomic assays against standardized reference intervals.",
    clinicalRelevance: "Correlates phenotypic biomarkers (e.g., lipid profiles, anti-tTG) with genomic predisposition.",
    requiredInfo: "Complete PDF or digital laboratory report with specimen accession date.",
    recommendedNextStep: "Submit flagged abnormal results for clinician sign-off.",
    status: "Pending Review",
    responsibleUser: "Attending Physician",
    dueDate: "2026-12-05",
    actionUrl: "/reports",
    buttonLabel: "Review Reports",
  },
  {
    id: "action-5",
    title: "5. Evaluate Genetic Test Results",
    description: "Examine ClinVar pathogenicity assertions (Pathogenic, VUS, Likely Benign).",
    clinicalRelevance: "Ensures therapeutic decisions are grounded exclusively in validated pathogenic variants.",
    requiredInfo: "CLIA/CAP accredited NGS sequence report and HGVS variant nomenclature.",
    recommendedNextStep: "Cross-reference variant alleles against ACMG secondary findings lists.",
    status: "Not Started",
    responsibleUser: "Molecular Pathologist",
    dueDate: "2026-12-10",
    actionUrl: "/family-genetics?tab=risk",
    buttonLabel: "Inspect Variants",
  },
  {
    id: "action-6",
    title: "6. Prepare Clinical Consultation",
    description: "Generate structured consultation brief and high-yield doctor discussion questions.",
    clinicalRelevance: "Focuses consultation time on high-priority clinical queries.",
    requiredInfo: "Selected primary clinical concern and current medication list.",
    recommendedNextStep: "Export vector PDF discussion checklist.",
    status: "In Progress",
    responsibleUser: "Patient Proband",
    dueDate: "2026-12-12",
    actionUrl: "/clinical-support/discussion-prep",
    buttonLabel: "Prepare Prompts",
  },
  {
    id: "action-7",
    title: "7. Generate Patient Education Report",
    description: "Synthesize plain-language summary of findings for the patient and immediate family.",
    clinicalRelevance: "Promotes genomic literacy and empowers informed shared decision-making.",
    requiredInfo: "Clinician-approved summary and approved educational units.",
    recommendedNextStep: "Generate and export accessible PDF summary.",
    status: "Not Started",
    responsibleUser: "Clinical Educator",
    dueDate: "2026-12-15",
    actionUrl: "/academy",
    buttonLabel: "Open Academy Hub",
  },
  {
    id: "action-8",
    title: "8. Schedule Follow-up",
    description: "Establish automated reminder cadence for annual pedigree updates and VUS re-evaluation.",
    clinicalRelevance: "Captures evolving scientific literature and new variant reclassifications.",
    requiredInfo: "Registry consent and preferred communication channel.",
    recommendedNextStep: "Set next annual pedigree review date.",
    status: "Not Started",
    responsibleUser: "Care Coordinator",
    dueDate: "2026-12-20",
    actionUrl: "/notifications",
    buttonLabel: "Set Cadence",
  },
];

interface ClinicalActionKitProps {
  onOpenDoctorPrep?: () => void;
  onDownloadPdf?: () => void;
}

export default function ClinicalActionKit({
  onOpenDoctorPrep,
  onDownloadPdf,
}: ClinicalActionKitProps) {
  const [cards, setCards] = useState<ActionCardItem[]>(INITIAL_ACTION_CARDS);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const handleStatusChange = (id: string, newStatus: ActionCardItem["status"]) => {
    sound.playSoft();
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, status: newStatus } : card))
    );
  };

  const filteredCards = statusFilter === "All"
    ? cards
    : cards.filter((c) => c.status === statusFilter);

  const getStatusBadge = (status: ActionCardItem["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30";
      case "In Progress":
        return "bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30";
      case "Pending Review":
        return "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30";
      case "Not Started":
      default:
        return "bg-surface-low text-muted-foreground border-border";
    }
  };

  return (
    <div className="bg-surface-lowest dark:bg-slate-900/60 rounded-3xl border border-border/80 shadow-2xs p-6 sm:p-8 space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/20">
            <Layers className="w-3.5 h-3.5" />
            CLINICAL ACTION WORKFLOW KIT • 8 Specialized Care Protocols
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Prepare Questions &amp; Clinical Action Cards
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            Manage your end-to-end clinical genetics journey. Follow structured ACMG &amp; NSGC action protocols with real-time status management.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenDoctorPrep && (
            <button
              onClick={onOpenDoctorPrep}
              className="px-3.5 py-2 rounded-xl border border-border bg-surface-lowest text-xs font-semibold hover:bg-muted text-foreground transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Preview Prompts</span>
            </button>
          )}

          {onDownloadPdf && (
            <button
              onClick={onDownloadPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00635e] to-[#004e4a] text-white text-xs font-bold hover:brightness-110 shadow-sm transition-all flex items-center gap-1.5 ring-2 ring-teal-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Guide</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-muted-foreground font-semibold flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {["All", "Not Started", "In Progress", "Pending Review", "Completed"].map((s) => (
          <button
            key={s}
            onClick={() => {
              sound.playSoft();
              setStatusFilter(s);
            }}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              statusFilter === s
                ? "bg-teal-600 text-white font-bold"
                : "bg-surface-low border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className="p-4 rounded-2xl bg-surface-container-low/60 dark:bg-slate-800/40 border border-border/80 flex flex-col justify-between space-y-3 hover:border-teal-500/40 transition-all shadow-2xs group"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-extrabold text-xs text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  {card.title}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getStatusBadge(
                    card.status
                  )}`}
                >
                  {card.status}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                {card.description}
              </p>

              <div className="text-[10px] space-y-1 pt-1 border-t border-border/40 font-mono text-muted-foreground">
                <div>
                  <strong className="text-foreground font-sans">Relevance:</strong>{" "}
                  {card.clinicalRelevance}
                </div>
                <div>
                  <strong className="text-foreground font-sans">Role:</strong>{" "}
                  {card.responsibleUser}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
              <select
                value={card.status}
                onChange={(e) =>
                  handleStatusChange(card.id, e.target.value as ActionCardItem["status"])
                }
                className="text-[10px] bg-surface-lowest border border-border rounded-lg px-2 py-1 text-foreground font-medium outline-hidden"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Completed">Completed</option>
              </select>

              {card.actionUrl && (
                <a
                  href={card.actionUrl}
                  className="font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-0.5 text-[11px]"
                >
                  <span>{card.buttonLabel || "Action"}</span>
                  <ChevronRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
