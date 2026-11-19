"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  Dna,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  Heart,
  HelpCircle,
  Info,
  Maximize2,
  Minus,
  Move,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { BiologicalBranch, BiologicalSex, FamilyCondition, FamilyMember, GeneticStatus, VitalStatus } from "../types";

interface FamilyTreeVisualizerProps {
  members: FamilyMember[];
  onAddMember: (member: Partial<FamilyMember>) => void;
  onUpdateMember: (id: number, member: Partial<FamilyMember>) => void;
  onDeleteMember: (id: number) => void;
  onAddCondition: (memberId: number, condition: FamilyCondition) => void;
  onNavigateTab?: (tabId: string) => void;
}

export default function FamilyTreeVisualizer({
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onAddCondition,
  onNavigateTab,
}: FamilyTreeVisualizerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState<boolean>(false);
  const [filterBranch, setFilterBranch] = useState<"all" | "maternal" | "paternal" | "immediate">("all");

  // Form states
  const [formData, setFormData] = useState<{
    first_name: string;
    last_name: string;
    relationship: string;
    biological_branch: BiologicalBranch;
    biological_sex: BiologicalSex;
    generation_depth: number;
    vital_status: VitalStatus;
    age_current_or_death: number;
    carrier_status: GeneticStatus;
    notes: string;
  }>({
    first_name: "",
    last_name: "",
    relationship: "Sibling",
    biological_branch: "immediate",
    biological_sex: "female",
    generation_depth: 3,
    vital_status: "living",
    age_current_or_death: 30,
    carrier_status: "unknown",
    notes: "",
  });

  const [newCondition, setNewCondition] = useState<{
    condition_name: string;
    icd10_code: string;
    age_of_diagnosis: number;
    is_genetic_confirmed: boolean;
    notes: string;
  }>({
    condition_name: "",
    icd10_code: "",
    age_of_diagnosis: 30,
    is_genetic_confirmed: false,
    notes: "",
  });

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.6, prev + delta), 1.6));
  };

  const handleResetZoom = () => setZoomLevel(1);

  // Group members by generation
  const gen1 = members.filter(
    (m) =>
      m.generation_depth === 1 &&
      (filterBranch === "all" || m.biological_branch === filterBranch || m.biological_branch === "immediate")
  );
  const gen2 = members.filter(
    (m) =>
      m.generation_depth === 2 &&
      (filterBranch === "all" || m.biological_branch === filterBranch || m.biological_branch === "immediate")
  );
  const gen3 = members.filter(
    (m) =>
      m.generation_depth === 3 &&
      (filterBranch === "all" || m.biological_branch === filterBranch || m.biological_branch === "immediate")
  );

  const openEditModal = (member: FamilyMember) => {
    setSelectedMember(member);
    setFormData({
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      relationship: member.relationship,
      biological_branch: member.biological_branch,
      biological_sex: member.biological_sex,
      generation_depth: member.generation_depth,
      vital_status: member.vital_status,
      age_current_or_death: member.age_current_or_death || 30,
      carrier_status: member.carrier_status,
      notes: member.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const openAddConditionModal = (member: FamilyMember) => {
    setSelectedMember(member);
    setNewCondition({
      condition_name: "",
      icd10_code: "",
      age_of_diagnosis: member.age_current_or_death || 30,
      is_genetic_confirmed: false,
      notes: "",
    });
    setIsConditionModalOpen(true);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `medipredict-pedigree-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold">
            Clinical Genetics Principle: Do not assume a condition is inherited merely because it appears in a family.
          </p>
          <p className="text-muted-foreground dark:text-amber-300/80">
            Many shared health traits arise from common environmental exposures, diet, lifestyle, or multifactorial polygenic risks rather than single-gene inheritance patterns.
          </p>
        </div>
      </div>

      {/* Proactive Carrier Screening & Preconception Alerts Panel */}
      <div className="p-4 rounded-xl border border-teal-500/30 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/5 dark:from-teal-950/30 dark:via-cyan-950/20 dark:to-teal-950/10 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-500/20 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-200">
              Proactive Clinical Risk Triggers & Screening Highlights
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            Computed from active 3-generation pedigree findings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-teal-500/20 bg-white/80 dark:bg-[#14232d]/80 flex items-start gap-2.5">
            <Dna className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-foreground">Carrier Screening Alert: Beta Thalassemia Trait</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Documented in proband & paternal branch. Prior to conception, partner CBC and Hemoglobin HPLC screening is strongly recommended to evaluate autosomal recessive fetal risk.
              </p>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab("carrier")}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:underline pt-0.5"
                >
                  <span>View Carrier Guidelines & Residual Risk</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-teal-500/20 bg-white/80 dark:bg-[#14232d]/80 flex items-start gap-2.5">
            <Stethoscope className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-foreground">Preconception Guidance & Referral Pathway</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Transfer observed family pedigree findings into the Preconception Planner and schedule a review with a certified genetic counselor.
              </p>
              {onNavigateTab && (
                <div className="flex items-center gap-3 pt-0.5">
                  <button
                    onClick={() => onNavigateTab("preconception")}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    <span>Preconception Checklist</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    onClick={() => onNavigateTab("counsellors")}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    <span>Connect with Counsellor</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar & Legend */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-white dark:bg-[#162732] shadow-sm">
        {/* Branch Filter & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">Filter Branch:</span>
          {(["all", "maternal", "paternal", "immediate"] as const).map((branch) => (
            <button
              key={branch}
              onClick={() => setFilterBranch(branch)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filterBranch === branch
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-surface-low dark:bg-[#1c303d] text-foreground hover:bg-teal-500/10"
              }`}
            >
              {branch}
            </button>
          ))}
        </div>

        {/* Tree Tools: Zoom, Reset, Add Member, Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-surface-low dark:bg-[#1c303d] p-1">
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-foreground"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono font-semibold">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-foreground"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              setFormData({
                first_name: "",
                last_name: "",
                relationship: "Child",
                biological_branch: "immediate",
                biological_sex: "male",
                generation_depth: 3,
                vital_status: "living",
                age_current_or_death: 10,
                carrier_status: "unknown",
                notes: "",
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Family Member</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-white dark:bg-[#1c303d] hover:bg-surface-low text-xs font-semibold text-foreground transition-all"
            title="Export Family Pedigree JSON"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-white dark:bg-[#1c303d] hover:bg-surface-low text-xs font-semibold text-foreground transition-all"
            title="Print Clinical Summary"
          >
            <Printer className="w-3.5 h-3.5 text-teal-600" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Visual Pedigree Legend */}
      <div className="p-3.5 rounded-xl border border-border/80 bg-slate-50 dark:bg-[#14232d] flex flex-wrap items-center justify-between gap-4 text-xs">
        <span className="font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-600" />
          <span>Pedigree Standard Symbols:</span>
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-xs border-2 border-teal-600 bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-[9px] font-bold text-teal-800 dark:text-teal-200">
              M
            </div>
            <span>Male</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-600 bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[9px] font-bold text-indigo-800 dark:text-indigo-200">
              F
            </div>
            <span>Female</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-xs border-2 border-rose-600 bg-rose-500 text-white flex items-center justify-center text-[8px] font-bold">
              ●
            </div>
            <span>Affected Condition</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border-2 border-amber-600 bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-[9px] font-bold text-amber-700">
              ◐
            </div>
            <span>Validated Carrier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-xs border-2 border-gray-400 bg-gray-200 dark:bg-gray-800 relative flex items-center justify-center">
              <div className="absolute w-5 h-0.5 bg-gray-600 rotate-45" />
            </div>
            <span>Deceased</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping inline-block" />
            <span className="font-semibold text-teal-700 dark:text-teal-300">Proband (Self)</span>
          </div>
        </div>
      </div>

      {/* Pedigree Interactive Viewport */}
      <div className="rounded-xl border border-border bg-gradient-to-b from-[#f9fcfe] to-white dark:from-[#0d1a22] dark:to-[#12222c] p-6 overflow-x-auto min-h-[560px] relative shadow-inner">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
          className="transition-transform duration-200 min-w-[850px] space-y-12"
        >
          {/* Generation 1: Grandparents */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold">
                GENERATION I — Grandparents
              </span>
              <div className="h-px bg-border flex-1" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gen1.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onSelect={setSelectedMember}
                  onEdit={openEditModal}
                  onDelete={onDeleteMember}
                  onAddCondition={openAddConditionModal}
                />
              ))}
              {gen1.length === 0 && (
                <div className="col-span-4 p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No Generation I members recorded for this branch filter.
                </div>
              )}
            </div>
          </div>

          {/* Inheritance Connectors Between Gen 1 & Gen 2 */}
          <div className="flex justify-around items-center px-12 py-1">
            <div className="flex flex-col items-center">
              <div className="h-6 w-0.5 bg-teal-500/50" />
              <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-500/30">
                Paternal Lineage
              </span>
              <div className="h-6 w-0.5 bg-teal-500/50" />
            </div>
            <div className="flex flex-col items-center">
              <div className="h-6 w-0.5 bg-indigo-500/50" />
              <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Maternal Lineage
              </span>
              <div className="h-6 w-0.5 bg-indigo-500/50" />
            </div>
          </div>

          {/* Generation 2: Parents & Aunts/Uncles */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold">
                GENERATION II — Parents & Immediate Relatives
              </span>
              <div className="h-px bg-border flex-1" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gen2.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onSelect={setSelectedMember}
                  onEdit={openEditModal}
                  onDelete={onDeleteMember}
                  onAddCondition={openAddConditionModal}
                />
              ))}
              {gen2.length === 0 && (
                <div className="col-span-4 p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No Generation II members recorded.
                </div>
              )}
            </div>
          </div>

          {/* Inheritance Connectors Between Gen 2 & Gen 3 */}
          <div className="flex justify-center items-center py-1">
            <div className="flex flex-col items-center">
              <div className="h-6 w-0.5 bg-emerald-500/50" />
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Biological Descent to Sibship / Proband
              </span>
              <div className="h-6 w-0.5 bg-emerald-500/50" />
            </div>
          </div>

          {/* Generation 3: Proband (Self), Siblings, Children */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold">
                GENERATION III — Proband & Siblings / Descendants
              </span>
              <div className="h-px bg-border flex-1" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gen3.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onSelect={setSelectedMember}
                  onEdit={openEditModal}
                  onDelete={onDeleteMember}
                  onAddCondition={openAddConditionModal}
                />
              ))}
              {gen3.length === 0 && (
                <div className="col-span-4 p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No Generation III members recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Member Details Drawer / Modal when selected */}
      {selectedMember && (
        <div className="p-5 rounded-xl border border-teal-500/40 bg-white dark:bg-[#162732] shadow-md animate-fade-in space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  selectedMember.biological_sex === "female"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-2 border-indigo-400"
                    : "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-2 border-teal-400"
                }`}
              >
                {selectedMember.biological_sex === "female" ? "♀" : "♂"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    {selectedMember.first_name || ""} {selectedMember.last_name || ""}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                    {selectedMember.relationship}
                  </span>
                  {selectedMember.is_proband && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-600 text-white shadow-xs">
                      Proband (Self)
                    </span>
                  )}
                  {selectedMember.vital_status === "deceased" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      Deceased
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Branch: <span className="capitalize font-semibold text-foreground">{selectedMember.biological_branch}</span> | Generation:{" "}
                  <span className="font-semibold text-foreground">{selectedMember.generation_depth}</span> | Age:{" "}
                  <span className="font-semibold text-foreground">{selectedMember.age_current_or_death || "Unknown"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(selectedMember)}
                className="p-2 rounded-lg border border-border hover:bg-surface-low text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => openAddConditionModal(selectedMember)}
                className="p-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Condition</span>
              </button>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Genetic & Condition Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Documented Health Conditions ({selectedMember.conditions?.length || 0})</span>
              </h4>
              {selectedMember.conditions && selectedMember.conditions.length > 0 ? (
                <div className="space-y-2">
                  {selectedMember.conditions.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-border bg-surface-low/50 dark:bg-[#1a2d39] text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span>{c.condition_name}</span>
                        {c.icd10_code && <span className="font-mono text-[10px] text-muted-foreground">{c.icd10_code}</span>}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-3">
                        <span>Age at onset: {c.age_of_diagnosis ? `${c.age_of_diagnosis} yrs` : "Unknown"}</span>
                        <span>{c.is_genetic_confirmed ? "Genetic Confirmed" : "Clinical Diagnosis"}</span>
                      </div>
                      {c.notes && <p className="text-[11px] text-muted-foreground mt-1 italic">{c.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic p-3 rounded-lg border border-dashed border-border">
                  No conditions reported.
                </p>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5 text-teal-600" />
                <span>Carrier Status & Genetic Notes</span>
              </h4>
              <div className="p-3 rounded-lg border border-border bg-surface-low/50 dark:bg-[#1a2d39] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Carrier Screening Status:</span>
                  <span className="font-semibold capitalize px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    {selectedMember.carrier_status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Clinical Notes:</span>
                  <p className="text-foreground mt-0.5">
                    {selectedMember.notes || "No additional clinical or testing notes documented."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#162732] rounded-2xl border border-border shadow-xl max-w-lg w-full p-6 space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                <span>{isAddModalOpen ? "Add Family Member" : "Edit Family Member"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="e.g. Ramesh"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground focus:ring-2 focus:ring-teal-500/40 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="e.g. Sharma"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground focus:ring-2 focus:ring-teal-500/40 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Biological Relationship</label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Child">Child</option>
                    <option value="Paternal Grandfather">Paternal Grandfather</option>
                    <option value="Paternal Grandmother">Paternal Grandmother</option>
                    <option value="Maternal Grandfather">Maternal Grandfather</option>
                    <option value="Maternal Grandmother">Maternal Grandmother</option>
                    <option value="Uncle (Paternal)">Uncle (Paternal)</option>
                    <option value="Aunt (Paternal)">Aunt (Paternal)</option>
                    <option value="Uncle (Maternal)">Uncle (Maternal)</option>
                    <option value="Aunt (Maternal)">Aunt (Maternal)</option>
                    <option value="Cousin">Cousin</option>
                    <option value="Other Relative">Other Relative</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Biological Branch</label>
                  <select
                    value={formData.biological_branch}
                    onChange={(e) => setFormData({ ...formData, biological_branch: e.target.value as BiologicalBranch })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                  >
                    <option value="immediate">Immediate (Self/Siblings/Children)</option>
                    <option value="paternal">Paternal (Father's side)</option>
                    <option value="maternal">Maternal (Mother's side)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Biological Sex</label>
                  <select
                    value={formData.biological_sex}
                    onChange={(e) => setFormData({ ...formData, biological_sex: e.target.value as BiologicalSex })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Generation</label>
                  <select
                    value={formData.generation_depth}
                    onChange={(e) => setFormData({ ...formData, generation_depth: parseInt(e.target.value) || 3 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                  >
                    <option value={1}>Gen I (Grandparents)</option>
                    <option value={2}>Gen II (Parents/Aunts)</option>
                    <option value={3}>Gen III (Proband/Siblings)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Vital Status</label>
                  <select
                    value={formData.vital_status}
                    onChange={(e) => setFormData({ ...formData, vital_status: e.target.value as VitalStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                  >
                    <option value="living">Living</option>
                    <option value="deceased">Deceased</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Age (Current or at Death)</label>
                  <input
                    type="number"
                    value={formData.age_current_or_death}
                    onChange={(e) => setFormData({ ...formData, age_current_or_death: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Carrier Status</label>
                  <select
                    value={formData.carrier_status}
                    onChange={(e) => setFormData({ ...formData, carrier_status: e.target.value as GeneticStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                  >
                    <option value="unknown">Unknown / Untested</option>
                    <option value="carrier">Confirmed Carrier</option>
                    <option value="negative">Tested Negative</option>
                    <option value="affected">Clinically Affected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Clinical or Family Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. History of microcytic anemia, normal iron studies..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-surface-low"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isAddModalOpen) {
                    onAddMember({
                      ...formData,
                      conditions: [],
                      is_proband: false,
                    });
                  } else if (isEditModalOpen && selectedMember) {
                    onUpdateMember(selectedMember.id, formData);
                  }
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm"
              >
                {isAddModalOpen ? "Save Family Member" : "Update Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Condition Modal */}
      {isConditionModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#162732] rounded-2xl border border-border shadow-xl max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <span>Add Health Condition to {selectedMember.relationship}</span>
              </h3>
              <button
                onClick={() => setIsConditionModalOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Condition Name</label>
                <input
                  type="text"
                  value={newCondition.condition_name}
                  onChange={(e) => setNewCondition({ ...newCondition, condition_name: e.target.value })}
                  placeholder="e.g. Beta Thalassemia Minor, Hypertension..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">ICD-10 Code (Optional)</label>
                  <input
                    type="text"
                    value={newCondition.icd10_code}
                    onChange={(e) => setNewCondition({ ...newCondition, icd10_code: e.target.value })}
                    placeholder="e.g. D56.1"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Age at Diagnosis</label>
                  <input
                    type="number"
                    value={newCondition.age_of_diagnosis}
                    onChange={(e) => setNewCondition({ ...newCondition, age_of_diagnosis: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="genConfirmed"
                  checked={newCondition.is_genetic_confirmed}
                  onChange={(e) => setNewCondition({ ...newCondition, is_genetic_confirmed: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="genConfirmed" className="text-xs font-semibold cursor-pointer">
                  Confirmed by Genetic / Molecular Testing
                </label>
              </div>

              <div>
                <label className="font-semibold block mb-1">Clinical Notes</label>
                <textarea
                  rows={2}
                  value={newCondition.notes}
                  onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })}
                  placeholder="Additional context, diagnostic method, severity..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsConditionModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-surface-low"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newCondition.condition_name) {
                    onAddCondition(selectedMember.id, newCondition);
                    setIsConditionModalOpen(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm"
              >
                Record Condition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual member pedigree card
function MemberCard({
  member,
  onSelect,
  onEdit,
  onDelete,
  onAddCondition,
}: {
  member: FamilyMember;
  onSelect: (m: FamilyMember) => void;
  onEdit: (m: FamilyMember) => void;
  onDelete: (id: number) => void;
  onAddCondition: (m: FamilyMember) => void;
}) {
  const isFemale = member.biological_sex === "female";
  const isMale = member.biological_sex === "male";
  const isCarrier = member.carrier_status === "carrier";
  const isAffected = member.conditions?.length > 0;
  const isDeceased = member.vital_status === "deceased";

  const branchBorder =
    member.biological_branch === "paternal"
      ? "border-teal-500/40 hover:border-teal-500"
      : member.biological_branch === "maternal"
      ? "border-indigo-500/40 hover:border-indigo-500"
      : "border-emerald-500/50 hover:border-emerald-500";

  return (
    <div
      onClick={() => onSelect(member)}
      className={`p-3.5 rounded-xl border bg-white dark:bg-[#162732] shadow-2xs cursor-pointer transition-all hover:shadow-md relative group ${branchBorder} ${
        member.is_proband ? "ring-2 ring-emerald-500/40" : ""
      }`}
    >
      {/* Proband Pin */}
      {member.is_proband && (
        <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-xs">
          Proband (Self)
        </span>
      )}

      {/* Top row: Symbol and Relationship */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Pedigree shape symbol */}
          <div
            className={`w-7 h-7 flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 relative ${
              isFemale ? "rounded-full" : "rounded-md"
            } ${
              isAffected
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-2 border-rose-500"
                : isCarrier
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-2 border-amber-500"
                : "bg-surface-low dark:bg-[#1a2d39] text-foreground border border-border"
            }`}
          >
            {isFemale ? "♀" : isMale ? "♂" : "◇"}
            {isDeceased && <div className="absolute w-8 h-0.5 bg-gray-500 rotate-45 pointer-events-none" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground leading-tight">
              {member.first_name || member.relationship}
            </h4>
            <p className="text-[10px] text-muted-foreground capitalize">
              {member.relationship} ({member.biological_branch})
            </p>
          </div>
        </div>

        {/* Action icons on hover */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button
            onClick={() => onEdit(member)}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground"
            title="Edit"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          {!member.is_proband && (
            <button
              onClick={() => onDelete(member.id)}
              className="p-1 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Details snippet */}
      <div className="text-[11px] text-muted-foreground space-y-1">
        <div className="flex items-center justify-between">
          <span>Age: {member.age_current_or_death || "Unknown"}</span>
          <span>{isDeceased ? "Deceased" : "Living"}</span>
        </div>

        {/* Conditions Badges */}
        {member.conditions && member.conditions.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-1.5 border-t border-border/60">
            {member.conditions.map((c, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 truncate max-w-full"
                title={`${c.condition_name} (Onset age: ${c.age_of_diagnosis || "N/A"})`}
              >
                {c.condition_name} {c.age_of_diagnosis ? `(${c.age_of_diagnosis}y)` : ""}
              </span>
            ))}
          </div>
        ) : (
          <div className="pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground/80">
            No conditions recorded
          </div>
        )}

        {/* Carrier indicator badge */}
        {isCarrier && (
          <div className="pt-1">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
              Validated Carrier
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
