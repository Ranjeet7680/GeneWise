"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Loader2,
  Sparkles,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import { sound } from "@/lib/sound";
import { MedicalReport } from "@/types";

interface ReportUploaderProps {
  onSuccess: (report: MedicalReport) => void;
  onCancel?: () => void;
}

const SAMPLE_PANELS = [
  {
    name: "Celiac Disease Serology & Immunoglobulins",
    category: "Celiac Serology & Immunoglobulins",
    text: `Tissue Transglutaminase IgA (anti-tTG IgA): 68.4 U/mL (Ref: < 10.0 U/mL)
Total Serum IgA: 2.8 g/L (Ref: 0.8 - 3.0 g/L)
Deamidated Gliadin Peptide IgG (DGP IgG): 45.2 U/mL (Ref: < 15.0 U/mL)
Deamidated Gliadin Peptide IgA (DGP IgA): 39.8 U/mL (Ref: < 15.0 U/mL)`,
  },
  {
    name: "Comprehensive Metabolic & Lipid Panel",
    category: "Biochemical Analysis",
    text: `Fasting Blood Glucose: 118 mg/dL (Ref: 70 - 99 mg/dL)
Hemoglobin A1c (HbA1c): 6.2 % (Ref: 4.0 - 5.6 %)
Alanine Aminotransferase (ALT): 64 U/L (Ref: 7 - 56 U/L)
Aspartate Aminotransferase (AST): 38 U/L (Ref: 10 - 40 U/L)
Total Cholesterol: 215 mg/dL (Ref: < 200 mg/dL)
Low-Density Lipoprotein (LDL-C): 138 mg/dL (Ref: < 100 mg/dL)`,
  },
  {
    name: "Renal Function & Electrolyte Profile",
    category: "Nephrology & Chemistry",
    text: `Serum Creatinine: 1.1 mg/dL (Ref: 0.7 - 1.3 mg/dL)
eGFR (CKD-EPI): 82 mL/min/1.73m² (Ref: > 90 mL/min/1.73m²)
Blood Urea Nitrogen (BUN): 18 mg/dL (Ref: 7 - 20 mg/dL)
Potassium: 4.4 mmol/L (Ref: 3.5 - 5.1 mmol/L)
Sodium: 141 mmol/L (Ref: 136 - 145 mmol/L)`,
  },
  {
    name: "Complete Blood Count & Ferritin Saturation",
    category: "Hematology & Serology",
    text: `Hemoglobin: 10.4 g/dL (Ref: 12.0 - 15.5 g/dL)
White Blood Cells (WBC): 6.8 x10^3/uL (Ref: 4.5 - 11.0 x10^3/uL)
Platelet Count: 245 x10^3/uL (Ref: 150 - 450 x10^3/uL)
Serum Ferritin: 12 ng/mL (Ref: 30 - 200 ng/mL)
Transferrin Saturation: 14 % (Ref: 20 - 50 %)`,
  },
];

const EXTRACTION_STEPS = [
  "Validating file integrity and computing SHA-256 hash...",
  "Applying multi-pass multimodal OCR and document layout analysis...",
  "Extracting laboratory measurements, units, and physiological intervals...",
  "Benchmarking against prior longitudinal records to compute delta percentages...",
  "Preparing structured clinical data for clinician verification..."
];

export default function ReportUploader({ onSuccess, onCancel }: ReportUploaderProps) {
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [title, setTitle] = useState("Celiac Disease Serology & Autoantibody Panel");
  const [reportType, setReportType] = useState("Celiac Serology & Immunoglobulins");
  const [rawText, setRawText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStepIndex, setUploadStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const maxBytes = 15 * 1024 * 1024; // 15MB
    if (file.size > maxBytes) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum permitted limit of 15MB.`);
      sound.playAlert();
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty (0 bytes). Please upload a valid medical report.");
      sound.playAlert();
      return;
    }

    const validExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".csv", ".txt"];
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validExtensions.includes(extension)) {
      setError(`Unsupported file extension '${extension}'. Allowed formats: PDF, JPG, JPEG, PNG, CSV, TXT.`);
      sound.playAlert();
      return;
    }

    setSelectedFile(file);
    sound.playClick();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setError(null);
    setIsUploading(true);
    setUploadStepIndex(0);

    // Simulated multi-stage progress
    const progressTimer = setInterval(() => {
      setUploadStepIndex((prev) => (prev < EXTRACTION_STEPS.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("report_type", reportType);

      if (activeTab === "file" && selectedFile) {
        formData.append("file", selectedFile);
      } else if (rawText.trim()) {
        formData.append("raw_text", rawText.trim());
      } else {
        throw new Error("Please select a file or paste laboratory test measurements.");
      }

      const report = await api.uploadReport(formData);
      clearInterval(progressTimer);
      sound.playSuccess();
      onSuccess(report);
    } catch (err: any) {
      clearInterval(progressTimer);
      sound.playAlert();
      setError(err.message || "Failed to process medical report.");
    } finally {
      setIsUploading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_PANELS[0]) => {
    sound.playClick();
    setActiveTab("text");
    setTitle(sample.name);
    setReportType(sample.category);
    setRawText(sample.text);
  };

  return (
    <div className="rounded-xl border border-border bg-white dark:bg-[#162732] p-5 shadow-2xs transition-colors duration-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Advanced Document Upload & OCR Processing</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
              HIPAA Compliant
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Accepts multi-page PDF, JPG, PNG, CSV, and clinical text format. SHA-256 verification and anti-duplicate audit active.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-low dark:bg-[#111d24] p-1 rounded-lg border border-border/50">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab("file");
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === "file"
                  ? "bg-white dark:bg-[#1c303d] text-primary shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Document File
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab("text");
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === "text"
                  ? "bg-white dark:bg-[#1c303d] text-primary shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Direct Values
            </button>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-low"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-medium text-muted-foreground mb-1">Report Title / Study Description</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] focus:ring-1 focus:ring-primary text-foreground"
              required
            />
          </div>
          <div>
            <label className="block font-medium text-muted-foreground mb-1">Diagnostic Classification</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="Celiac Serology & Immunoglobulins">Celiac Serology & Immunoglobulins</option>
              <option value="Biochemical Analysis">Biochemical Analysis (CMP / BMP)</option>
              <option value="Nephrology & Chemistry">Nephrology & Renal Function</option>
              <option value="Hematology & Serology">Hematology & Complete Blood Count</option>
              <option value="Lipid & Cardiovascular Panel">Lipid & Cardiovascular Risk</option>
              <option value="Endocrinology">Endocrine & Thyroid Profiling</option>
            </select>
          </div>
        </div>

        {activeTab === "file" ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative overflow-hidden border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? "border-primary bg-primary/5 shadow-inner scale-[0.99]"
                : "border-border hover:border-primary/50 bg-surface-low/30 dark:bg-[#111d24]/40"
            }`}
          >
            {isUploading && (
              <div className="absolute inset-0 bg-surface-low/95 dark:bg-[#162732]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-10 animate-in fade-in">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent absolute top-0 animate-pulse shadow-[0_0_15px_#00837b]" />
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <span className="text-xs font-bold text-foreground">Extracting Clinical Laboratory Measurements...</span>
                <span className="text-[11px] text-primary font-medium mt-1">
                  {EXTRACTION_STEPS[uploadStepIndex]}
                </span>
                <div className="w-48 bg-border h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-primary h-full transition-all duration-500 rounded-full"
                    style={{ width: `${((uploadStepIndex + 1) / EXTRACTION_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              accept=".pdf,.csv,.txt,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  validateAndSetFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2.5 text-primary">
                {selectedFile ? <FileCheck className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
              </div>
              <span className="text-xs font-semibold text-foreground">
                {selectedFile ? (
                  <span className="text-primary font-bold">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                ) : (
                  "Drag & drop medical report here, or click to browse"
                )}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1">
                Supports multi-page PDF, JPG, PNG, CSV, or TXT up to 15MB
              </span>
              {selectedFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="mt-2 text-[11px] text-red-500 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove selected file
                </button>
              )}
            </label>
          </div>
        ) : (
          <div>
            <label className="block font-medium text-xs text-muted-foreground mb-1">
              Paste Report Biomarkers, Reference Intervals & Observed Values
            </label>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. Tissue Transglutaminase IgA (anti-tTG IgA): 68.4 U/mL (Ref: < 10.0 U/mL)&#10;Total Serum IgA: 2.8 g/L (Ref: 0.8 - 3.0 g/L)"
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#111d24] font-mono text-xs text-foreground focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {/* Sample presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Load Pre-Calibrated Clinical Panel:
          </span>
          {SAMPLE_PANELS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => loadSample(p)}
              className="px-2.5 py-1 rounded-md border border-border bg-surface-low dark:bg-[#111d24] hover:bg-surface-container dark:hover:bg-[#1c303d] text-[11px] font-medium text-foreground transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted in transit & at rest • Extracted data requires verification</span>
          </div>
          <button
            type="submit"
            disabled={isUploading || (activeTab === "file" && !selectedFile && !rawText.trim())}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing Document...
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                Process & Extract Measurements
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
