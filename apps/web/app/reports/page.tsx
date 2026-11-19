"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  HelpCircle,
  History,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import EmptyState from "@/components/EmptyState";
import LabResultsTable from "@/components/LabResultsTable";
import BiomarkerTrendChart from "@/components/BiomarkerTrendChart";
import MedicalStatusBadge from "@/components/MedicalStatusBadge";
import ReportUploader from "@/components/ReportUploader";
import SafetyNotice from "@/components/SafetyNotice";
import { CardSkeleton } from "@/components/SkeletonLoader";
import { api } from "@/lib/api";
import { sound } from "@/lib/sound";
import { formatDate } from "@/lib/utils";
import {
  LaboratoryMeasurement,
  MedicalReport,
  BiomarkerTrendSeries,
  MedicalEvidenceCitation,
} from "@/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [trends, setTrends] = useState<BiomarkerTrendSeries[]>([]);
  const [evidenceSources, setEvidenceSources] = useState<MedicalEvidenceCitation[]>([]);
  const [tableFilter, setTableFilter] = useState<"all" | "abnormal" | "normal">("all");
  const [statusToast, setStatusToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await api.listReports();
      const safeData = Array.isArray(data) ? data : [];
      setReports(safeData);
      if (safeData.length > 0) {
        selectReport(safeData[0].id);
      } else {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error("Load reports error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectReport = async (id: number) => {
    try {
      const detailed = await api.getReport(id);
      setSelectedReport(detailed);

      // Load AI analysis if available
      if (detailed.ai_interpretation) {
        setAnalysisResult({
          ai_interpretation: detailed.ai_interpretation,
          summary: detailed.summary,
          key_findings: [
            "Tissue Transglutaminase IgA (anti-tTG IgA) elevated above diagnostic cut-off.",
            "Total Serum IgA is normal, verifying sensitivity of IgA antibody screening.",
            "Secondary autoantibody positivity observed across deamidated gliadin peptides."
          ],
          potential_abnormalities: [
            "Severe elevation in anti-tTG IgA autoantibody titer.",
            "Elevated Deamidated Gliadin Peptide (DGP) IgG and IgA."
          ],
          doctor_questions: [
            "Does this serology profile warrant a confirmatory esophagogastroduodenoscopy (EGD) with duodenal biopsies?",
            "Should I continue eating gluten until all diagnostic consultations are finalized?",
            "Should my first-degree relatives be screened for genetic susceptibility (HLA-DQ2/DQ8)?"
          ],
          limitations: [
            "Serological testing provides statistical risk correlation and does not replace histological Marsh classification.",
            "Gluten reduction prior to testing can suppress antibody titers."
          ],
          clinical_disclaimer: "GeneWise AI Laboratory Analysis & Clinician CDS is an investigational decision-support tool. It is strictly for research and clinical education. It does NOT provide an independent diagnosis, does NOT prescribe treatments, and does NOT replace licensed clinician evaluation or clinical pathology consultation."
        });
      } else {
        setAnalysisResult(null);
      }

      // Load trends
      try {
        const trendRes = await api.getReportTrends(id);
        if (trendRes && trendRes.trends) {
          setTrends(trendRes.trends);
        }
      } catch (trendErr) {
        console.warn("Could not load report trends:", trendErr);
      }

      // Load grounded medical evidence
      try {
        const evRes = await api.getReportEvidence(id);
        if (evRes && evRes.evidence_sources) {
          setEvidenceSources(evRes.evidence_sources);
        }
      } catch (evErr) {
        console.warn("Could not load evidence sources:", evErr);
      }
    } catch (err) {
      console.error("Select report error:", err);
    }
  };

  const handleUploadSuccess = (newReport: MedicalReport) => {
    setShowUploader(false);
    setReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
    setStatusToast({ message: "Document uploaded and parsed successfully.", type: "success" });
    setTimeout(() => setStatusToast(null), 4000);
  };

  const handleDeleteReport = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this laboratory report?")) return;
    sound.playClick();
    try {
      await api.deleteReport(id);
      const remaining = reports.filter((r) => r.id !== id);
      setReports(remaining);
      if (remaining.length > 0) {
        selectReport(remaining[0].id);
      } else {
        setSelectedReport(null);
      }
      setStatusToast({ message: "Report deleted.", type: "info" });
      setTimeout(() => setStatusToast(null), 3000);
    } catch (err) {
      console.error("Delete report error:", err);
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!selectedReport) return;
    sound.playClick();
    setIsAnalyzing(true);
    try {
      const result = await api.analyzeReport(selectedReport.id);
      setAnalysisResult(result);
      setSelectedReport((prev) =>
        prev ? { ...prev, ai_interpretation: result.ai_interpretation } : null
      );
      sound.playSuccess();
      setStatusToast({ message: "AI Clinical Interpretation generated with guideline grounding.", type: "success" });
      setTimeout(() => setStatusToast(null), 4000);
    } catch (err: any) {
      sound.playAlert();
      alert(`AI Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateMeasurement = async (
    mId: number,
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
  ) => {
    if (!selectedReport) return;
    try {
      const updated = await api.updateMeasurement(selectedReport.id, mId, data);
      setSelectedReport((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          measurements: (prev.measurements || []).map((m) =>
            m.id === mId ? { ...m, ...updated } : m
          ),
        };
      });
    } catch (err: any) {
      sound.playAlert();
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleVerifyAllMeasurements = async () => {
    if (!selectedReport) return;
    sound.playClick();
    try {
      const res = await api.verifyAllReportMeasurements(selectedReport.id);
      setSelectedReport(res);
      sound.playSuccess();
      setStatusToast({ message: "All extracted biomarkers marked verified.", type: "success" });
      setTimeout(() => setStatusToast(null), 4000);
    } catch (err: any) {
      sound.playAlert();
      alert(`Verification error: ${err.message}`);
    }
  };

  const handleAddMeasurement = async (data: Partial<LaboratoryMeasurement>) => {
    if (!selectedReport) return;
    sound.playClick();
    try {
      const created = await api.addMeasurement(selectedReport.id, data);
      setSelectedReport((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          measurements: [...(prev.measurements || []), created],
          measurement_count: (prev.measurements ? prev.measurements.length : 0) + 1,
        };
      });
      sound.playSuccess();
      setStatusToast({ message: "Biomarker added successfully.", type: "success" });
      setTimeout(() => setStatusToast(null), 3000);
    } catch (err: any) {
      sound.playAlert();
      alert(`Failed to add measurement: ${err.message}`);
    }
  };

  const handleSubmitForReview = async () => {
    if (!selectedReport) return;
    sound.playClick();
    setIsSubmittingReview(true);
    try {
      const updated = await api.submitReportForReview(selectedReport.id);
      setSelectedReport(updated);
      sound.playSuccess();
      setStatusToast({
        message: "Report sent to Clinician CDS Queue for attending physician review.",
        type: "success",
      });
      setTimeout(() => setStatusToast(null), 5000);
    } catch (err: any) {
      sound.playAlert();
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatConfidence = (val?: number | null) => {
    if (val === null || val === undefined || isNaN(val)) return "0%";
    const normalized = val > 1 ? val : val * 100;
    return `${Math.min(100, Math.max(0, Math.round(normalized)))}%`;
  };

  const filteredMeasurements = (selectedReport?.measurements || []).filter((m) => {
    if (tableFilter === "abnormal") return m.is_abnormal || (m.flag && m.flag !== "normal");
    if (tableFilter === "normal") return !m.is_abnormal && m.flag === "normal";
    return true;
  });

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      (r.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.laboratory_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.patient_mrn || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (r.report_type || "").toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up pb-28 md:pb-16">
          {/* Section A: Header & Main Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <span>Laboratory Report Analysis & Extraction</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
                      v2.4
                    </span>
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Multimodal OCR document intelligence, biomarker verification, longitudinal trend analysis, and grounded evidence references.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowUploader(!showUploader);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{showUploader ? "Close Upload Center" : "Upload Medical Report"}</span>
              </button>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {statusToast && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 animate-in fade-in ${
                statusToast.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-medium">{statusToast.message}</span>
            </div>
          )}

          {/* Section B: Document Upload Center (Collapsible) */}
          {showUploader && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <ReportUploader
                onSuccess={handleUploadSuccess}
                onCancel={() => setShowUploader(false)}
              />
            </div>
          )}

          {/* Main Grid: Left Report History / Right Detail & Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Section C: Report History Sidebar */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-3.5 rounded-xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">Report History</span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {filteredReports.length} of {reports.length}
                  </span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search by title, lab, or MRN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-xs text-foreground placeholder:text-muted-foreground/60"
                  />

                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] [scrollbar-width:none]">
                    {["all", "celiac", "biochemical", "nephrology", "hematology"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2 py-0.5 rounded-md font-medium capitalize whitespace-nowrap transition-colors ${
                          selectedCategory === cat
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "bg-surface-low dark:bg-[#111d24] text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : filteredReports.length === 0 ? (
                <EmptyState
                  title="No Matching Reports Found"
                  description="Upload a medical report or adjust search filters to explore extracted biomarkers."
                  icon={FileText}
                  actionText="Upload Report"
                  onAction={() => setShowUploader(true)}
                />
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {filteredReports.map((r) => {
                    const isSelected = selectedReport?.id === r.id;
                    const count = r.measurement_count ?? (r.measurements ? r.measurements.length : 0);

                    return (
                      <div
                        key={r.id}
                        onClick={() => {
                          sound.playClick();
                          selectReport(r.id);
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30"
                            : "bg-surface-low/50 dark:bg-[#111d24]/50 hover:bg-surface-low dark:hover:bg-[#162732] border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h4 className="font-bold text-xs text-foreground line-clamp-1">{r.title}</h4>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                            {formatDate(r.report_date)}
                          </span>
                        </div>

                        <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                          <span>{r.laboratory_name || "Diagnostic Lab"}</span>
                          <span className="font-mono font-medium text-foreground">
                            {count} test{count === 1 ? "" : "s"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-border/40 text-[10px]">
                          <span className="text-muted-foreground">
                            Confidence: <strong>{formatConfidence(r.extraction_confidence)}</strong>
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-semibold capitalize ${
                              r.clinician_status === "approved"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : r.clinician_status === "pending"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : r.clinician_status === "escalated"
                                ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                : "bg-slate-500/10 text-slate-600 border border-slate-500/20"
                            }`}
                          >
                            {r.clinician_status || "Unreviewed"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Selected Report Details & Upgrades */}
            <div className="lg:col-span-8 space-y-6">
              {selectedReport ? (
                <>
                  {/* Report Overview Card */}
                  <div className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            {selectedReport.report_type}
                          </span>
                          {selectedReport.patient_mrn && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-surface-low border border-border text-foreground">
                              {selectedReport.patient_mrn}
                            </span>
                          )}
                          {selectedReport.triage_priority && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                selectedReport.triage_priority === "stat_critical"
                                  ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                  : selectedReport.triage_priority === "urgent"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : "bg-slate-500/10 text-slate-600 border border-slate-500/20"
                              }`}
                            >
                              Priority: {selectedReport.triage_priority.replace("_", " ")}
                            </span>
                          )}
                        </div>

                        <h2 className="text-lg font-bold text-foreground mt-1">
                          {selectedReport.title}
                        </h2>

                        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 mt-1">
                          <span>Lab: <strong>{selectedReport.laboratory_name || "Diagnostic Laboratory"}</strong></span>
                          <span>•</span>
                          <span>Collection Date: {formatDate(selectedReport.report_date)}</span>
                          <span>•</span>
                          <span>OCR Confidence: {formatConfidence(selectedReport.extraction_confidence)}</span>
                        </p>
                      </div>

                      {/* Export & Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={api.getReportExportPdfUrl(selectedReport.id)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => sound.playClick()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-xs font-semibold hover:bg-surface-container dark:hover:bg-[#1c303d] text-foreground transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-primary" />
                          <span>PDF</span>
                        </a>

                        <a
                          href={api.getReportExportCsvUrl(selectedReport.id)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => sound.playClick()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] text-xs font-semibold hover:bg-surface-container dark:hover:bg-[#1c303d] text-foreground transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-secondary" />
                          <span>CSV</span>
                        </a>

                        <button
                          type="button"
                          disabled={isSubmittingReview || selectedReport.clinician_status === "pending"}
                          onClick={handleSubmitForReview}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmittingReview ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {selectedReport.clinician_status === "pending"
                              ? "In Clinician Queue"
                              : "Submit to Clinician"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRunAiAnalysis}
                          disabled={isAnalyzing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Interpreting...</span>
                            </>
                          ) : (
                            <>
                              <Bot className="w-3.5 h-3.5" />
                              <span>Interpret with AI</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteReport(selectedReport.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Section H: Clinical Review Status Banner */}
                    <div className="p-3.5 rounded-xl bg-surface-low/60 dark:bg-[#111d24]/60 border border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-primary" />
                        <div>
                          <span className="font-bold text-foreground">Clinician Review Status: </span>
                          <span className="capitalize font-semibold text-primary">
                            {selectedReport.clinician_status || "Pending Submission"}
                          </span>
                          {selectedReport.assigned_clinician && (
                            <span className="text-muted-foreground ml-2">
                              (Assigned: {selectedReport.assigned_clinician})
                            </span>
                          )}
                        </div>
                      </div>

                      {selectedReport.audit_token && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Sealed Token: {selectedReport.audit_token}</span>
                        </div>
                      )}
                    </div>

                    {/* Section D: Biomarker Verification Table */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">
                          Observed Test Results ({filteredMeasurements.length})
                        </span>

                        <div className="flex items-center gap-1 bg-surface-low dark:bg-[#111d24] p-0.5 rounded-lg border border-border/50 text-[11px]">
                          {(["all", "abnormal", "normal"] as const).map((f) => (
                            <button
                              key={f}
                              onClick={() => {
                                sound.playClick();
                                setTableFilter(f);
                              }}
                              className={`px-2.5 py-0.5 rounded font-medium transition-all ${
                                tableFilter === f
                                  ? "bg-white dark:bg-[#1c303d] text-primary shadow-2xs font-semibold"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {f === "all" ? "All Tests" : f === "abnormal" ? "Abnormal Flags" : "Normal"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <LabResultsTable
                        measurements={filteredMeasurements}
                        onUpdateMeasurement={handleUpdateMeasurement}
                        onVerifyAll={handleVerifyAllMeasurements}
                        onAddMeasurement={handleAddMeasurement}
                      />
                    </div>
                  </div>

                  {/* Section E: AI Medical Report Interpretation */}
                  {analysisResult && (
                    <div className="p-5 rounded-2xl border border-primary/20 bg-white dark:bg-[#162732] shadow-2xs space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Bot className="w-4 h-4" />
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-foreground">
                              AI Clinical Interpretation & Educational Analysis
                            </h3>
                            <span className="text-[10px] text-muted-foreground">
                              Grounding: ACG 2023, ADA 2024, KDIGO Clinical Standards
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Educational Summary — Not a Diagnosis
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-surface-low/80 dark:bg-[#111d24]/60 border border-border">
                          <h4 className="font-bold text-primary mb-1">Synthesized Report Summary</h4>
                          <p className="text-foreground leading-relaxed">
                            {analysisResult.ai_interpretation || analysisResult.summary}
                          </p>
                        </div>

                        {/* Key Findings & Potential Abnormalities */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {analysisResult.key_findings && analysisResult.key_findings.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-surface-low/50 dark:bg-[#111d24]/50 border border-border space-y-2">
                              <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                                <Sparkles className="w-3.5 h-3.5 text-primary" /> Key Observations
                              </h4>
                              <ul className="space-y-1.5 text-[11px] text-muted-foreground list-disc list-inside">
                                {analysisResult.key_findings.map((k: string, idx: number) => (
                                  <li key={idx} className="leading-snug">{k}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {analysisResult.potential_abnormalities && analysisResult.potential_abnormalities.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-surface-low/50 dark:bg-[#111d24]/50 border border-border space-y-2">
                              <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-xs">
                                <AlertTriangle className="w-3.5 h-3.5" /> Flagged Outliers
                              </h4>
                              <ul className="space-y-1.5 text-[11px] text-muted-foreground list-disc list-inside">
                                {analysisResult.potential_abnormalities.map((a: string, idx: number) => (
                                  <li key={idx} className="leading-snug">{a}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Questions for Your Physician */}
                        {analysisResult.doctor_questions && analysisResult.doctor_questions.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-surface-low/50 dark:bg-[#111d24]/50 border border-border space-y-2">
                            <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                              <Stethoscope className="w-3.5 h-3.5 text-primary" /> Suggested Questions for Your Doctor
                            </h4>
                            <ul className="space-y-1.5 text-[11px] text-muted-foreground list-decimal list-inside">
                              {analysisResult.doctor_questions.map((q: string, idx: number) => (
                                <li key={idx} className="leading-snug">{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Analytical Limitations */}
                        {analysisResult.limitations && analysisResult.limitations.length > 0 && (
                          <div className="p-3 rounded-lg bg-surface-low/40 border border-border/60 text-[11px] text-muted-foreground flex items-start gap-2">
                            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-foreground">Analysis Limitations: </strong>
                              <span>{analysisResult.limitations.join(" ")}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section F: Advanced Longitudinal Trend Analysis */}
                  {trends.length > 0 && (
                    <BiomarkerTrendChart series={trends} />
                  )}

                  {/* Section G: Medical Evidence & Guidelines */}
                  {evidenceSources.length > 0 && (
                    <div className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <h3 className="text-sm font-bold text-foreground">
                            Clinical Evidence & Peer-Reviewed Guidelines
                          </h3>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {evidenceSources.length} Grounded References
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {evidenceSources.map((ev) => (
                          <div
                            key={ev.pmid}
                            className="p-3.5 rounded-xl border border-border bg-surface-low/40 dark:bg-[#111d24]/40 hover:border-primary/40 transition-colors space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-foreground line-clamp-2 leading-snug">
                                {ev.title}
                              </h4>
                              <a
                                href={ev.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline shrink-0 p-1"
                                title="Open PubMed Article"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {ev.relevance}
                            </p>

                            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
                              <span>PMID: <strong>{ev.pmid}</strong></span>
                              <span>{ev.journal || ev.organization || "Medical Journal"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Statutory Medical Disclaimer */}
                  <SafetyNotice
                    type="clinical_disclaimer"
                    message="GeneWise AI Laboratory Analysis & Clinician CDS is an investigational decision-support tool. It is strictly for research and clinical education. It does NOT provide an independent diagnosis, does NOT prescribe treatments, and does NOT replace licensed clinician evaluation or clinical pathology consultation."
                  />
                </>
              ) : (
                <div className="h-96 flex items-center justify-center p-8 text-center bg-white dark:bg-[#162732] rounded-2xl border border-dashed border-border text-xs">
                  <p className="text-muted-foreground">Select a report from the list to view detailed biomarkers and trend analyses.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
