"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCheck,
  Edit2,
  HelpCircle,
  Plus,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  X,
  AlertTriangle,
  History,
  Info
} from "lucide-react";
import MedicalStatusBadge from "@/components/MedicalStatusBadge";
import { LaboratoryMeasurement } from "@/types";
import { sound } from "@/lib/sound";

interface LabResultsTableProps {
  measurements: LaboratoryMeasurement[];
  onUpdateMeasurement?: (
    id: number,
    data: {
      value?: number;
      unit?: string;
      flag?: string;
      user_verified?: boolean;
      verification_status?: string;
      test_name?: string;
      reference_range?: string;
      notes?: string;
    }
  ) => Promise<void>;
  onVerifyAll?: () => Promise<void>;
  onAddMeasurement?: (data: Partial<LaboratoryMeasurement>) => Promise<void>;
  readOnly?: boolean;
}

export default function LabResultsTable({
  measurements,
  onUpdateMeasurement,
  onVerifyAll,
  onAddMeasurement,
  readOnly = false,
}: LabResultsTableProps) {
  const [editingItem, setEditingItem] = useState<LaboratoryMeasurement | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editValue, setEditValue] = useState<number>(0);
  const [editUnit, setEditUnit] = useState<string>("");
  const [editRange, setEditRange] = useState<string>("");
  const [editFlag, setEditFlag] = useState<string>("normal");
  const [editNotes, setEditNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add missing biomarker state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Serology & Chemistry");
  const [newValue, setNewValue] = useState<number>(0);
  const [newUnit, setNewUnit] = useState("U/mL");
  const [newRange, setNewRange] = useState("Standard");
  const [newFlag, setNewFlag] = useState<"normal" | "low" | "high" | "critical">("normal");

  const startEdit = (m: LaboratoryMeasurement) => {
    sound.playClick();
    setEditingItem(m);
    setEditName(m.test_name || m.name || "");
    setEditValue(m.value);
    setEditUnit(m.unit);
    setEditRange(m.reference_range || m.reference_text || (m.reference_low !== undefined ? `${m.reference_low} - ${m.reference_high} ${m.unit}` : "Standard"));
    setEditFlag(m.flag);
    setEditNotes(m.notes || "");
  };

  const saveEdit = async () => {
    if (!editingItem || !onUpdateMeasurement) return;
    sound.playClick();
    setIsSubmitting(true);
    try {
      await onUpdateMeasurement(editingItem.id, {
        test_name: editName,
        value: Number(editValue),
        unit: editUnit,
        reference_range: editRange,
        flag: editFlag,
        user_verified: true,
        verification_status: "corrected",
        notes: editNotes,
      });
      sound.playSuccess();
      setEditingItem(null);
    } catch (e) {
      sound.playAlert();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickVerify = async (m: LaboratoryMeasurement) => {
    if (!onUpdateMeasurement) return;
    sound.playClick();
    try {
      await onUpdateMeasurement(m.id, {
        user_verified: true,
        verification_status: "verified",
      });
      sound.playSuccess();
    } catch (e) {
      sound.playAlert();
    }
  };

  const handleMarkUncertain = async (m: LaboratoryMeasurement) => {
    if (!onUpdateMeasurement) return;
    sound.playClick();
    try {
      await onUpdateMeasurement(m.id, {
        user_verified: false,
        verification_status: "uncertain",
      });
    } catch (e) {
      sound.playAlert();
    }
  };

  const handleReject = async (m: LaboratoryMeasurement) => {
    if (!onUpdateMeasurement) return;
    sound.playClick();
    try {
      await onUpdateMeasurement(m.id, {
        user_verified: false,
        verification_status: "rejected",
      });
    } catch (e) {
      sound.playAlert();
    }
  };

  const handleCreateBiomarker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddMeasurement || !newName.trim()) return;
    sound.playClick();
    setIsSubmitting(true);
    try {
      await onAddMeasurement({
        test_name: newName.trim(),
        category: newCategory,
        value: Number(newValue),
        unit: newUnit,
        reference_text: newRange,
        reference_range: newRange,
        flag: newFlag,
        is_abnormal: newFlag !== "normal",
        confidence: 1.0,
        verification_status: "verified",
        user_verified: true,
      });
      sound.playSuccess();
      setShowAddModal(false);
      setNewName("");
      setNewValue(0);
    } catch (err) {
      sound.playAlert();
    } finally {
      setIsSubmitting(false);
    }
  };

  const unverifiedCount = measurements.filter(
    (m) => m.verification_status === "pending" || (!m.user_verified && m.verification_status !== "verified")
  ).length;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-white dark:bg-[#162732] shadow-2xs">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border bg-surface-low/30 dark:bg-[#111d24]/40">
        <div>
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <span>Extracted Clinical Biomarkers</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
              {measurements.length} Test{measurements.length === 1 ? "" : "s"}
            </span>
            {unverifiedCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {unverifiedCount} Pending Verification
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                <CheckCheck className="w-3 h-3" /> All Verified
              </span>
            )}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Original OCR extractions preserved. Clinicians may edit values, calibrate units, or reject non-diagnostic artifacts.
          </p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            {onAddMeasurement && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-[#162732] hover:bg-surface-low text-xs font-medium text-foreground transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>Add Missing Test</span>
              </button>
            )}

            {onVerifyAll && unverifiedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onVerifyAll();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Verify All ({unverifiedCount})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-low/60 dark:bg-[#111d24]/60 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3.5">Biomarker / Test</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3.5">Observed Value</th>
              <th className="py-3 px-3">Reference Interval</th>
              <th className="py-3 px-3">Prior Value</th>
              <th className="py-3 px-3">Change (Δ%)</th>
              <th className="py-3 px-3">Clinical Flag</th>
              <th className="py-3 px-3">Confidence</th>
              <th className="py-3 px-3">Status</th>
              {!readOnly && <th className="py-3 px-3.5 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {measurements.map((m) => {
              const testTitle = m.test_name || m.name || "Unnamed Test";
              const hasCorrection = m.original_value !== undefined && m.original_value !== m.value;
              const isVerified = m.verification_status === "verified" || (m.user_verified && m.verification_status !== "rejected" && m.verification_status !== "uncertain");
              const isCorrected = m.verification_status === "corrected" || hasCorrection;
              const isUncertain = m.verification_status === "uncertain";
              const isRejected = m.verification_status === "rejected";

              return (
                <tr
                  key={m.id}
                  className={`hover:bg-surface-low/40 dark:hover:bg-[#1c303d]/40 transition-colors ${
                    isRejected ? "opacity-50 line-through bg-red-500/5" : ""
                  }`}
                >
                  <td className="py-3 px-3.5 font-semibold text-foreground">
                    <div className="flex flex-col">
                      <span>{testTitle}</span>
                      {hasCorrection && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal flex items-center gap-1">
                          <History className="w-3 h-3" /> OCR was: {m.original_value} {m.original_unit || m.unit}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{m.category}</td>
                  <td className="py-3 px-3.5">
                    <div className="flex items-baseline gap-1">
                      <span className="font-extrabold text-sm text-foreground">{m.value}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">{m.unit}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                    {m.reference_range || m.reference_text || (m.reference_low !== undefined ? `${m.reference_low} - ${m.reference_high} ${m.unit}` : "Standard")}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                    {m.previous_value !== undefined ? `${m.previous_value} ${m.unit}` : "—"}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    {m.change_pct !== undefined ? (
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          Math.abs(m.change_pct) < 5
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            : m.change_pct > 0
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        }`}
                      >
                        {m.change_pct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {m.change_pct > 0 ? `+${m.change_pct.toFixed(1)}%` : `${m.change_pct.toFixed(1)}%`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Baseline</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <MedicalStatusBadge flag={m.flag} />
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <span className="text-muted-foreground">
                      {Math.round((m.confidence || 0.95) * 100)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : isCorrected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        <Check className="w-3.5 h-3.5" /> Corrected
                      </span>
                    ) : isUncertain ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> Uncertain
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                        <ShieldAlert className="w-3.5 h-3.5" /> Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium">
                        <HelpCircle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  {!readOnly && onUpdateMeasurement && (
                    <td className="py-3 px-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        {!isVerified && (
                          <button
                            type="button"
                            title="Verify value"
                            onClick={() => handleQuickVerify(m)}
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Edit measurement"
                          onClick={() => startEdit(m)}
                          className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!isUncertain && (
                          <button
                            type="button"
                            title="Flag as uncertain"
                            onClick={() => handleMarkUncertain(m)}
                            className="p-1 rounded text-amber-600 hover:bg-amber-500/10 transition-colors"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!isRejected && (
                          <button
                            type="button"
                            title="Reject extracted value"
                            onClick={() => handleReject(m)}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden divide-y divide-border">
        {measurements.map((m) => {
          const testTitle = m.test_name || m.name || "Unnamed Test";
          const isVerified = m.verification_status === "verified" || (m.user_verified && m.verification_status !== "rejected");
          const hasCorrection = m.original_value !== undefined && m.original_value !== m.value;

          return (
            <div key={m.id} className="p-3.5 space-y-2.5 hover:bg-surface-low/30 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-foreground">{testTitle}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase">{m.category}</p>
                </div>
                <MedicalStatusBadge flag={m.flag} />
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-surface-low/50 dark:bg-[#111d24]/50 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Observed:</span>
                  <span className="font-extrabold text-sm text-foreground">{m.value}</span>{" "}
                  <span className="text-[11px] text-muted-foreground">{m.unit}</span>
                  {hasCorrection && (
                    <span className="block text-[10px] text-amber-600">OCR: {m.original_value}</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Reference:</span>
                  <span className="font-mono text-[11px] text-foreground">
                    {m.reference_range || m.reference_text || "Standard"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] text-muted-foreground">
                  Confidence: {Math.round((m.confidence || 0.95) * 100)}%
                </span>
                {!readOnly && onUpdateMeasurement && (
                  <div className="flex items-center gap-1.5">
                    {!isVerified && (
                      <button
                        type="button"
                        onClick={() => handleQuickVerify(m)}
                        className="px-2 py-1 rounded bg-emerald-600/10 text-emerald-600 text-[11px] font-semibold"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(m)}
                      className="px-2 py-1 rounded bg-primary/10 text-primary text-[11px] font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Measurement Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#162732] rounded-xl border border-border shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-primary" /> Edit Extracted Measurement
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-muted-foreground mb-1">Test Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Observed Value</label>
                  <input
                    type="number"
                    step="any"
                    value={editValue}
                    onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Reference Range</label>
                  <input
                    type="text"
                    value={editRange}
                    onChange={(e) => setEditRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Clinical Flag</label>
                  <select
                    value={editFlag}
                    onChange={(e) => setEditFlag(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground"
                  >
                    <option value="normal">Normal (Within Reference)</option>
                    <option value="low">Low (Below Interval)</option>
                    <option value="high">High (Elevated)</option>
                    <option value="critical">Critical / STAT Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-muted-foreground mb-1">Clinical Note / Reason for Edit</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Corrected decimal point misread by OCR scanner."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground"
                />
              </div>

              {editingItem.original_value !== undefined && (
                <div className="p-2.5 rounded-lg bg-surface-low dark:bg-[#111d24] border border-border/60 text-[11px] text-muted-foreground flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    Original scanned value: <strong>{editingItem.original_value} {editingItem.original_unit || editingItem.unit}</strong>.
                    An audit trail record will preserve both values.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-surface-low"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={saveEdit}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shadow-2xs"
              >
                Save & Verify Correction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Missing Biomarker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateBiomarker}
            className="bg-white dark:bg-[#162732] rounded-xl border border-border shadow-xl max-w-md w-full p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-primary" /> Add Missing Clinical Biomarker
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-muted-foreground mb-1">Test Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Total Serum IgA or Anti-DGP IgG"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-muted-foreground mb-1">Diagnostic Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Observed Value</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Reference Range</label>
                  <input
                    type="text"
                    value={newRange}
                    onChange={(e) => setNewRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Clinical Flag</label>
                  <select
                    value={newFlag}
                    onChange={(e) => setNewFlag(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground"
                  >
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-surface-low"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newName.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shadow-2xs"
              >
                Add Biomarker
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
