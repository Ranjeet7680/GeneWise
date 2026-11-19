"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Check,
  CheckCircle,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  History,
  Info,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  X,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import LabResultsTable from "@/components/LabResultsTable";
import MedicalStatusBadge from "@/components/MedicalStatusBadge";
import SafetyNotice from "@/components/SafetyNotice";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { sound } from "@/lib/sound";
import { ClinicianReportItem, ClinicianSignOffResponse } from "@/types";

const SPECIALIST_DEPARTMENTS = [
  "Pediatric & Adult Gastroenterology",
  "Endocrinology & Diabetes Clinic",
  "Cardiology Acute Care",
  "Hematology & Oncology",
  "Nephrology & Renal Dialysis",
  "Clinical Genetics MDT",
];

const ESCALATION_REASONS = [
  "Critical panic biomarker threshold (STAT attention required)",
  "Strongly positive autoimmune serology meeting diagnostic criteria",
  "Conflicting clinical presentation or unexpected laboratory variance",
  "Complex multi-morbidity requiring multi-disciplinary review",
  "Secondary physician opinion requested before immunosuppressive therapy",
];

export default function ClinicianWorkspacePage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ClinicianReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ClinicianReportItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [clinicianNotes, setClinicianNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Formal Electronic Sign-Off Modal State
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [attendingName, setAttendingName] = useState("Dr. Elena Rostova, MD");
  const [attendingRole, setAttendingRole] = useState("Attending Gastroenterologist & Clinical Geneticist");
  const [checklist, setChecklist] = useState({
    serology_verified: true,
    outliers_evaluated: true,
    history_correlated: true,
    guidelines_referenced: true,
  });
  const [signOffResult, setSignOffResult] = useState<ClinicianSignOffResponse | null>(null);

  // Escalation Modal State
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(SPECIALIST_DEPARTMENTS[0]);
  const [selectedReason, setSelectedReason] = useState(ESCALATION_REASONS[0]);

  // Audit Logs State
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    loadReports();
  }, [statusFilter, priorityFilter]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await api.listClinicianReports(
        statusFilter === "all" ? undefined : statusFilter,
        priorityFilter === "all" ? undefined : priorityFilter,
        searchQuery || undefined
      );
      const safeData = Array.isArray(data) ? data : [];
      setReports(safeData);
      if (safeData.length > 0 && !selectedReport) {
        setSelectedReport(safeData[0]);
        setClinicianNotes(safeData[0].clinician_notes || "");
      } else if (selectedReport) {
        const found = safeData.find((r: ClinicianReportItem) => r.id === selectedReport.id);
        if (found) setSelectedReport(found);
      }
    } catch (err) {
      console.error("Failed to load clinician queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReports();
  };

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const logs = await api.getClinicianAuditLogs(40);
      setAuditLogs(logs);
    } catch (err) {
      console.error("Failed to load clinician audit logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSelectReport = (rep: ClinicianReportItem) => {
    sound.playClick();
    setSelectedReport(rep);
    setClinicianNotes(rep.clinician_notes || "");
    setActionSuccess(null);
    setSignOffResult(null);
  };

  const handleExecuteSignOff = async () => {
    if (!selectedReport) return;
    sound.playClick();
    setIsSubmitting(true);
    setActionSuccess(null);
    try {
      const result = await api.signOffClinicianReport(selectedReport.id, {
        decision: "approved",
        clinician_notes: clinicianNotes || "Serology and metabolic measurements clinically verified according to diagnostic guidelines.",
        attending_physician: attendingName,
        clinician_name: attendingName,
        clinician_role: attendingRole,
        verification_checklist: checklist,
      });

      setSignOffResult(result);
      sound.playSuccess();
      setActionSuccess(`Case #${selectedReport.id} successfully approved and signed off. Sealed token: ${result.audit_token}`);

      const updatedReport: ClinicianReportItem = {
        ...selectedReport,
        status: "verified",
        clinician_status: "approved",
        audit_token: result.audit_token,
        clinician_reviewed_at: result.signed_off_at,
        clinician_notes: clinicianNotes,
      };

      setSelectedReport(updatedReport);
      setReports((prev) => prev.map((r) => (r.id === updatedReport.id ? updatedReport : r)));
    } catch (err: any) {
      sound.playAlert();
      alert(`Sign-off failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmEscalation = async () => {
    if (!selectedReport) return;
    sound.playClick();
    setIsSubmitting(true);
    setActionSuccess(null);
    try {
      const updated = await api.escalateClinicianReport(
        selectedReport.id,
        selectedDept,
        selectedReason,
        clinicianNotes || `Case escalated to ${selectedDept}. Reason: ${selectedReason}`
      );
      sound.playSuccess();
      setActionSuccess(`Case #${selectedReport.id} successfully escalated to ${selectedDept}. Sealed Token: ${updated.audit_token}`);
      setSelectedReport(updated);
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setShowEscalateModal(false);
    } catch (err: any) {
      sound.playAlert();
      alert(`Escalation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTriageBadge = (priority?: string) => {
    if (priority === "stat_critical") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          STAT CRITICAL
        </span>
      );
    }
    if (priority === "urgent") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          URGENT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
        ROUTINE
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up pb-28 md:pb-16">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Stethoscope className="w-5 h-5" />
                </span>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Clinician Review & Diagnostic Sign-Off Queue
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white uppercase tracking-wider">
                  CDS Workspace
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Clinical decision support environment for licensed medical officers. Validate extracted biomarker measurements, review panic flags, and execute electronic sign-offs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  loadAuditLogs();
                  setShowAuditLogs(true);
                }}
                className="smooth-button flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-white dark:bg-[#162732] text-foreground hover:bg-surface-low transition-all cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-secondary" />
                Audit Trail
              </button>

              <button
                onClick={loadReports}
                disabled={isLoading}
                className="smooth-button flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-container transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh Queue
              </button>
            </div>
          </div>

          {/* Clinical Ethics & Decision Notice */}
          <SafetyNotice
            type="research_warning"
            message="Biomarker parsing and AI summaries are advisory decision support tools. Clinical diagnosis, critical laboratory validation, and diagnostic escalation remain the exclusive responsibility of the licensed attending clinician."
          />

          {/* Filter & Search Bar */}
          <div className="p-4 rounded-xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by patient name, MRN, title, or lab..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground text-xs"
                />
              </form>

              {/* Status Filters */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 [scrollbar-width:none]">
                {[
                  { id: "all", label: "All Cases" },
                  { id: "pending", label: "Pending Review" },
                  { id: "pending_verification", label: "Needs Verification" },
                  { id: "verified", label: "Verified" },
                  { id: "approved", label: "Signed Off" },
                  { id: "escalated", label: "Escalated" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sound.playClick();
                      setStatusFilter(tab.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === tab.id
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "bg-surface-low dark:bg-[#111d24] text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Priority Select */}
              <select
                value={priorityFilter}
                onChange={(e) => {
                  sound.playClick();
                  setPriorityFilter(e.target.value);
                }}
                className="px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground text-xs font-semibold"
              >
                <option value="all">All Priorities</option>
                <option value="stat_critical">STAT Critical</option>
                <option value="urgent">Urgent</option>
                <option value="routine">Routine</option>
              </select>
            </div>
          </div>

          {/* Main Layout: Left Queue Table / Right Case Review Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Queue Panel (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="font-semibold text-foreground">Cases in Queue ({reports.length})</span>
                <span>Sorted by Urgency</span>
              </div>

              {isLoading ? (
                <div className="p-8 rounded-xl border border-border bg-surface-low dark:bg-[#162732] text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-muted-foreground">Loading clinical verification queue...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-border bg-surface-low dark:bg-[#162732] text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-secondary mx-auto" />
                  <p className="text-xs font-semibold text-foreground">Queue is Clear</p>
                  <p className="text-[11px] text-muted-foreground">
                    No clinical reports match the selected queue filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
                  {reports.map((rep, idx) => {
                    const isSelected = selectedReport?.id === rep.id;
                    const hasAbnormal = (rep.abnormal_count || 0) > 0;
                    // CRUCIAL BUG FIX: Calculate dynamic biomarker count from measurement records
                    const biomarkerCount = rep.measurement_count ?? (rep.measurements ? rep.measurements.length : 0);

                    return (
                      <div
                        key={rep.id}
                        onClick={() => handleSelectReport(rep)}
                        className={`p-4 rounded-xl border cursor-pointer smooth-card transition-all ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30 translate-x-1"
                            : "bg-white dark:bg-[#162732] border-border hover:border-primary/40 hover:bg-surface-low"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              {renderTriageBadge(rep.triage_priority)}
                              <span className="text-[10px] font-mono text-muted-foreground">#{rep.id}</span>
                              {rep.patient_mrn && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-low border border-border text-foreground">
                                  {rep.patient_mrn}
                                </span>
                              )}
                            </div>
                            <h3 className="text-xs font-bold text-foreground line-clamp-1">{rep.title}</h3>
                          </div>
                          <MedicalStatusBadge
                            flag={
                              rep.clinician_status === "approved"
                                ? "normal"
                                : rep.clinician_status === "escalated"
                                ? "critical"
                                : "irregular"
                            }
                          />
                        </div>

                        <div className="text-[11px] text-muted-foreground space-y-0.5 mb-2">
                          <p className="flex items-center gap-1 font-medium text-foreground">
                            <UserCheck className="w-3 h-3 text-secondary" />
                            {rep.patient_name || "Patient Record"}
                          </p>
                          <p className="flex items-center gap-1 text-[10px]">
                            <Clock className="w-3 h-3" />
                            Report Date: {new Date(rep.report_date).toLocaleDateString()} • Lab: {rep.laboratory_name || "Diagnostic Services"}
                          </p>
                        </div>

                        {/* CRUCIAL BUG FIX: Dynamic Biomarker Count Display */}
                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/50">
                          <span className="text-muted-foreground">
                            Biomarkers: <strong className="text-foreground">{biomarkerCount}</strong>
                          </span>
                          {hasAbnormal ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              {rep.abnormal_count} Panic / Abnormal
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              All Physiological Range
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Detailed Review Panel (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {selectedReport ? (
                <div className="p-5 rounded-xl border border-border bg-white dark:bg-[#162732] space-y-5 shadow-xs">
                  {/* Case Header */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {renderTriageBadge(selectedReport.triage_priority)}
                        <h2 className="text-sm font-bold text-foreground">{selectedReport.title}</h2>
                        <MedicalStatusBadge
                          flag={
                            selectedReport.clinician_status === "approved"
                              ? "normal"
                              : selectedReport.clinician_status === "escalated"
                              ? "critical"
                              : "irregular"
                          }
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Patient: <strong className="text-foreground">{selectedReport.patient_name}</strong>
                        {selectedReport.patient_mrn && ` • MRN: ${selectedReport.patient_mrn}`}
                        {` • Lab: ${selectedReport.laboratory_name || "Diagnostic Laboratory"}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={api.getReportExportPdfUrl(selectedReport.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground hover:bg-surface-container flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-primary" />
                        PDF
                      </a>
                      <a
                        href={api.getReportExportCsvUrl(selectedReport.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground hover:bg-surface-container flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-secondary" />
                        CSV
                      </a>
                    </div>
                  </div>

                  {/* Success Alert */}
                  {actionSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{actionSuccess}</span>
                    </div>
                  )}

                  {/* Sealed Audit Token Notice if Approved */}
                  {selectedReport.audit_token && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Formal Clinician Electronic Sign-Off Verified
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Sealed Audit Token: <strong>{selectedReport.audit_token}</strong>
                        {selectedReport.clinician_reviewed_at && ` • Timestamp: ${new Date(selectedReport.clinician_reviewed_at).toLocaleString()}`}
                      </p>
                    </div>
                  )}

                  {/* Escalation Alert if already escalated */}
                  {selectedReport.clinician_status === "escalated" && (
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-800 dark:text-purple-300 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-purple-600" />
                        Case Escalated for Specialist MDT Review
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Target Service: <strong>{selectedReport.escalation_department || "Specialist MDT"}</strong>
                        {selectedReport.escalation_reason && ` • Rationale: ${selectedReport.escalation_reason}`}
                      </p>
                    </div>
                  )}

                  {/* Section A: Patient Overview & Context */}
                  <div className="p-3.5 rounded-xl bg-surface-low/70 dark:bg-[#111d24]/70 border border-border text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-primary" /> Patient Clinical Overview
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        MRN: {selectedReport.patient_mrn || "MRN-92041"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Patient Name:</span>
                        <strong className="text-foreground">{selectedReport.patient_name || "Rajesh Kumar"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Age / Sex:</span>
                        <span className="text-foreground font-medium">26 Years • Female</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Diagnoses:</span>
                        <span className="text-foreground font-medium">Dyspepsia, Malabsorption</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Medications:</span>
                        <span className="text-foreground font-medium">Omeprazole 20mg</span>
                      </div>
                    </div>
                  </div>

                  {/* Section C: AI Triage Summary */}
                  {selectedReport.summary && (
                    <div className="p-3.5 rounded-lg bg-surface-low dark:bg-[#111d24] border border-border text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        AI Triage Summary & Decision Support (Advisory)
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedReport.summary}
                      </p>
                    </div>
                  )}

                  {/* Section B: Laboratory Measurements Table with Inline Verification */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-secondary" />
                      Extracted Laboratory Biomarkers ({selectedReport.measurements?.length || 0})
                    </h3>
                    <LabResultsTable
                      measurements={selectedReport.measurements || []}
                      onUpdateMeasurement={async (mId, updates) => {
                        try {
                          await api.updateMeasurement(selectedReport.id, mId, updates);
                          sound.playSuccess();
                          loadReports();
                        } catch (err: any) {
                          alert(`Update failed: ${err.message}`);
                        }
                      }}
                    />
                  </div>

                  {/* Section D: Clinician Review & Attestation Box */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-primary" />
                        Attending Clinician Observations & Diagnostic Notes
                      </label>
                      {selectedReport.clinician_reviewed_at && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Last sign-off: {new Date(selectedReport.clinician_reviewed_at).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <textarea
                      value={clinicianNotes}
                      onChange={(e) => setClinicianNotes(e.target.value)}
                      placeholder="Add diagnostic impressions, clinical correlation, required follow-up tests, or physician recommendations..."
                      rows={4}
                      className="w-full p-3 text-xs rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />

                    {/* Action Sign-Off Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Lock className="w-3.5 h-3.5 text-secondary" />
                        <span>Sign-off logged in immutable audit trail with HMAC-SHA256 sealing token.</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            sound.playClick();
                            setShowEscalateModal(true);
                          }}
                          disabled={isSubmitting}
                          className="smooth-button px-3.5 py-2 text-xs font-semibold rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Escalate to Specialist
                        </button>

                        <button
                          onClick={() => {
                            sound.playClick();
                            setShowSignOffModal(true);
                          }}
                          disabled={isSubmitting}
                          className="smooth-button px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-container shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Electronic Sign-Off Modal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-xl border border-dashed border-border bg-surface-low dark:bg-[#162732] text-center space-y-2">
                  <Stethoscope className="w-10 h-10 text-muted-foreground mx-auto" />
                  <h3 className="text-xs font-bold text-foreground">Select a Laboratory Report</h3>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Select a patient report from the queue on the left to review parsed biomarkers, evaluate abnormal thresholds, and record diagnostic sign-off.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Electronic Sign-Off Modal */}
          {showSignOffModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white dark:bg-[#162732] border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-foreground">Formal Clinician Diagnostic Sign-Off</h3>
                  </div>
                  <button
                    onClick={() => setShowSignOffModal(false)}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-surface-low dark:bg-[#111d24] border border-border/60 text-[11px] space-y-1">
                    <span className="font-semibold text-foreground">Attending Review Attestation:</span>
                    <p className="text-muted-foreground">
                      Executing electronic sign-off seals the extracted biomarker records and issues an immutable HMAC-SHA256 cryptographic audit token.
                    </p>
                  </div>

                  {/* Verification Checklist */}
                  <div className="space-y-2 border border-border p-3 rounded-xl bg-surface-low/30">
                    <span className="font-bold text-foreground block mb-1">Pre-Sign-Off Verification Checklist:</span>
                    <label className="flex items-center gap-2 text-[11px] text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.serology_verified}
                        onChange={(e) => setChecklist({ ...checklist, serology_verified: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span>Serological & biochemical measurements validated against physiological reference cut-offs.</span>
                    </label>
                    <label className="flex items-center gap-2 text-[11px] text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.outliers_evaluated}
                        onChange={(e) => setChecklist({ ...checklist, outliers_evaluated: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span>STAT panic outliers evaluated and correlated with clinical symptoms.</span>
                    </label>
                    <label className="flex items-center gap-2 text-[11px] text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.history_correlated}
                        onChange={(e) => setChecklist({ ...checklist, history_correlated: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span>Patient personal history, existing medications, and genetic risks reviewed.</span>
                    </label>
                    <label className="flex items-center gap-2 text-[11px] text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.guidelines_referenced}
                        onChange={(e) => setChecklist({ ...checklist, guidelines_referenced: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span>Guideline diagnostic criteria (ACG 2023 / ADA 2024 / KDIGO) verified.</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Attending Physician Name</label>
                      <input
                        type="text"
                        value={attendingName}
                        onChange={(e) => setAttendingName(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Clinical Role / Specialty</label>
                      <input
                        type="text"
                        value={attendingRole}
                        onChange={(e) => setAttendingRole(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Clinical Review Justification Notes</label>
                    <textarea
                      value={clinicianNotes}
                      onChange={(e) => setClinicianNotes(e.target.value)}
                      placeholder="Add diagnostic impressions, confirmatory endoscopy referral notes, or follow-up timelines..."
                      rows={3}
                      className="w-full p-2.5 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground"
                    />
                  </div>

                  {/* Statutory Medical Disclaimer */}
                  <div className="text-[10px] text-muted-foreground p-2 rounded bg-surface-low/50 border border-border/40 leading-relaxed">
                    <strong>Statutory Disclaimer:</strong> GeneWise AI Laboratory Analysis & Clinician CDS is an investigational decision-support tool. It is strictly for research and clinical education. It does NOT provide an independent diagnosis, does NOT prescribe treatments, and does NOT replace licensed clinician evaluation or clinical pathology consultation.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => setShowSignOffModal(false)}
                    className="smooth-button px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface-low text-foreground hover:bg-surface-container cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await handleExecuteSignOff();
                      setShowSignOffModal(false);
                    }}
                    disabled={isSubmitting || !checklist.serology_verified || !checklist.outliers_evaluated}
                    className="smooth-button px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    Confirm & Seal Diagnostic Sign-Off
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Specialist Escalation Modal */}
          {showEscalateModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white dark:bg-[#162732] border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-foreground">Escalate Case to Specialist Service</h3>
                  </div>
                  <button
                    onClick={() => setShowEscalateModal(false)}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Target Specialist Department</label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground"
                    >
                      {SPECIALIST_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Clinical Rationale for Escalation</label>
                    <select
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground"
                    >
                      {ESCALATION_REASONS.map((reason) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Additional Attending Notes</label>
                    <textarea
                      value={clinicianNotes}
                      onChange={(e) => setClinicianNotes(e.target.value)}
                      placeholder="Specific clinical findings or patient symptoms to highlight for the specialist team..."
                      rows={3}
                      className="w-full p-2.5 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => setShowEscalateModal(false)}
                    className="smooth-button px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface-low text-foreground hover:bg-surface-container cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmEscalation}
                    disabled={isSubmitting}
                    className="smooth-button px-4 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Confirm Escalation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs Drawer / Modal */}
          {showAuditLogs && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white dark:bg-[#162732] border border-border rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <History className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-foreground">Clinician Review Audit Trail</h3>
                  </div>
                  <button
                    onClick={() => setShowAuditLogs(false)}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Immutable regulatory audit records for electronic signatures, verifications, and diagnostic escalations under DPDP Act 2023 / HIPAA compliance.
                </p>

                {loadingLogs ? (
                  <div className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Loading audit records...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No clinician audit events recorded yet.
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-xs flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-foreground">
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary/10 text-primary uppercase">
                              {log.action}
                            </span>
                            <span>Report #{log.resource_id}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Clinician ID: {log.user_id} • Status: {log.details?.status || "Reviewed"}
                            {log.details?.department && ` • Escalated to: ${log.details.department}`}
                            {log.details?.audit_token && ` • Token: ${log.details.audit_token}`}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-3 border-t border-border">
                  <button
                    onClick={() => setShowAuditLogs(false)}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-container cursor-pointer"
                  >
                    Close Audit Trail
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
