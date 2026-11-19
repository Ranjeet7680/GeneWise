"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Copy,
  ExternalLink,
  HelpCircle,
  PhoneCall,
  RotateCcw,
  Send,
  ShieldAlert,
  Stethoscope,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { SymptomCheckRequest, SymptomCheckResponse } from "@/types";

interface SymptomCheckerWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (summaryText: string) => void;
  initialSymptoms?: string;
  patientHistory?: string[];
  patientMedications?: string[];
}

const COMMON_ASSOCIATED_SYMPTOMS = [
  "Fever or chills",
  "Shortness of breath",
  "Dizziness or lightheadedness",
  "Heart palpitations",
  "Nausea or vomiting",
  "Diarrhea or loose stools",
  "Cough or congestion",
  "Headache",
  "Fatigue or extreme exhaustion",
  "Joint pain or swelling",
  "Skin rash or itching",
  "Chest tightness or pressure",
];

const DURATION_OPTIONS = [
  "< 24 hours (Acute onset)",
  "1 to 3 days",
  "4 to 7 days",
  "1 to 4 weeks (Subacute)",
  "> 1 month (Chronic)",
];

export default function SymptomCheckerWizardModal({
  isOpen,
  onClose,
  onSendToChat,
  initialSymptoms = "",
  patientHistory = [],
  patientMedications = [],
}: SymptomCheckerWizardModalProps) {
  const [step, setStep] = useState<number>(1);
  const [primarySymptom, setPrimarySymptom] = useState<string>(initialSymptoms);
  const [duration, setDuration] = useState<string>("1 to 3 days");
  const [severity, setSeverity] = useState<number>(5);
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<string[]>(
    patientHistory.length > 0 ? patientHistory : ["Mild hypertension", "Family history of CAD"]
  );
  const [medications, setMedications] = useState<string[]>(
    patientMedications.length > 0 ? patientMedications : ["Metformin 500mg daily"]
  );
  const [customHistoryInput, setCustomHistoryInput] = useState<string>("");
  const [customMedInput, setCustomMedInput] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SymptomCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleAssociated = (symptom: string) => {
    setAssociatedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleEvaluate = async () => {
    if (!primarySymptom.trim()) {
      setError("Please describe your primary symptom or reason for evaluation.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const payload: SymptomCheckRequest = {
        primary_symptom: primarySymptom.trim(),
        duration,
        severity,
        associated_symptoms: associatedSymptoms,
        relevant_medical_history: medicalHistory,
        current_medications: medications,
      };

      const res = await api.checkSymptoms(payload);
      setResult(res);
      setStep(4);
    } catch (err: any) {
      setError(err?.message || "Failed to evaluate symptoms. Please check connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setPrimarySymptom("");
    setSeverity(5);
    setAssociatedSymptoms([]);
    setResult(null);
    setError(null);
  };

  const handleSendToChatAction = () => {
    if (!result || !onSendToChat) return;
    const formattedSummary =
      `**Clinical Symptom Evaluation Summary**\n` +
      `- **Chief Complaint:** ${primarySymptom} (Duration: ${duration}, Severity: ${severity}/10)\n` +
      `- **Triage Urgency:** ${result.triage_level}\n` +
      `- **Assessment Guidance:** ${result.urgency_explanation}\n` +
      (((result as any).red_flags_detected?.length ?? 0) > 0
        ? `- **Warning Signs Identified:** ${((result as any).red_flags_detected || []).join("; ")}\n`
        : "") +
      `- **Doctor Discussion Questions:**\n` +
      ((result.suggested_doctor_questions || (result as any).suggested_questions_for_doctor || []).map((q: any, idx: number) => `  ${idx + 1}. ${q}`).join("\n")) +
      `\n\n*Please discuss these findings with your attending physician.*`;

    onSendToChat(formattedSummary);
    onClose();
  };

  const copyDoctorQuestions = () => {
    if (!result?.suggested_doctor_questions) return;
    const text = result.suggested_doctor_questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
    navigator.clipboard?.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const getTriageBadgeColor = (level: string) => {
    switch (level) {
      case "EMERGENCY_SOS":
        return "bg-red-600 text-white border-red-500 animate-pulse";
      case "URGENT_EVALUATION":
        return "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30";
      case "ROUTINE_CLINICAL_REVIEW":
        return "bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="symptom-checker-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#14262f] rounded-2xl border border-border shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 animate-scale-in max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-primary border border-teal-500/20">
              <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 id="symptom-checker-title" className="text-base sm:text-lg font-bold text-foreground">
                Clinical Symptom Checker & Triage Engine
              </h3>
              <p className="text-xs text-muted-foreground">
                Evidence-grounded educational triage • Step {step} of 4
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close symptom checker"
            className="p-1 rounded-lg text-muted-foreground hover:bg-surface-low transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2">
          {["Primary Symptoms", "Associated Signs", "History & Meds", "Triage & Guidelines"].map(
            (label, idx) => (
              <div key={label} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    step >= idx + 1 ? "bg-teal-600 dark:bg-teal-400" : "bg-muted"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground hidden sm:block truncate">
                  {label}
                </span>
              </div>
            )
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Chief Symptom, Duration & Severity */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                What is your primary symptom or concern? *
              </label>
              <textarea
                value={primarySymptom}
                onChange={(e) => setPrimarySymptom(e.target.value)}
                rows={3}
                placeholder="e.g., Sharp chest pressure that radiates to my left shoulder during exertion, accompanied by shortness of breath."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-border bg-surface-low focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  How long have symptoms lasted?
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-surface-low focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Severity: {severity}/10
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      severity <= 3
                        ? "bg-emerald-500/20 text-emerald-700"
                        : severity <= 6
                        ? "bg-teal-500/20 text-teal-700"
                        : severity <= 8
                        ? "bg-amber-500/20 text-amber-700"
                        : "bg-red-500/20 text-red-700"
                    }`}
                  >
                    {severity <= 3
                      ? "Mild Discomfort"
                      : severity <= 6
                      ? "Moderate Intensity"
                      : severity <= 8
                      ? "Severe / Urgent"
                      : "Critical / Emergency"}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>1 (Barely noticeable)</span>
                  <span>5 (Noticeable)</span>
                  <span>10 (Unbearable)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!primarySymptom.trim()) {
                    setError("Please describe your primary symptom first.");
                    return;
                  }
                  setError(null);
                  setStep(2);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <span>Next: Associated Signs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Associated Symptoms Checklist */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-foreground mb-1">
                Select any associated signs or co-occurring symptoms:
              </h4>
              <p className="text-[11px] text-muted-foreground mb-3">
                Selecting additional observations helps refine organ-system mapping and red-flag screening.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMMON_ASSOCIATED_SYMPTOMS.map((sym) => {
                  const isSelected = associatedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleAssociated(sym)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-teal-500/15 border-teal-500/40 text-teal-800 dark:text-teal-200 font-semibold"
                          : "bg-surface-low border-border text-muted-foreground hover:text-foreground hover:border-teal-500/30"
                      }`}
                    >
                      <span className="truncate">{sym}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <span>Next: History & Meds</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Medical History & Current Medications */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Known Pre-Existing Conditions
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {medicalHistory.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-surface-low border border-border text-foreground"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => setMedicalHistory((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customHistoryInput}
                  onChange={(e) => setCustomHistoryInput(e.target.value)}
                  placeholder="Add another condition (e.g. Asthma, Diabetes)..."
                  className="flex-1 text-xs p-2 rounded-xl border border-border bg-surface-low"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customHistoryInput.trim()) {
                      e.preventDefault();
                      setMedicalHistory((prev) => [...prev, customHistoryInput.trim()]);
                      setCustomHistoryInput("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customHistoryInput.trim()) {
                      setMedicalHistory((prev) => [...prev, customHistoryInput.trim()]);
                      setCustomHistoryInput("");
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold hover:bg-surface-low"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Current Medications
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {medications.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-surface-low border border-border text-foreground"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => setMedications((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customMedInput}
                  onChange={(e) => setCustomMedInput(e.target.value)}
                  placeholder="Add current medication (e.g. Atorvastatin 20mg)..."
                  className="flex-1 text-xs p-2 rounded-xl border border-border bg-surface-low"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customMedInput.trim()) {
                      e.preventDefault();
                      setMedications((prev) => [...prev, customMedInput.trim()]);
                      setCustomMedInput("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customMedInput.trim()) {
                      setMedications((prev) => [...prev, customMedInput.trim()]);
                      setCustomMedInput("");
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold hover:bg-surface-low"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleEvaluate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Evaluating Clinical Guidelines...</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4" />
                    <span>Run Clinical Triage</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Triage & Guidelines Results */}
        {step === 4 && result && (
          <div className="space-y-4 animate-in fade-in">
            {/* Triage Level Banner */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${getTriageBadgeColor(
                result.triage_level
              )}`}
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black uppercase tracking-wider">
                    Triage Urgency: {(result?.triage_level || "routine").replace(/_/g, " ")}
                  </div>
                  <p className="text-xs font-medium mt-0.5">{result.urgency_explanation}</p>
                </div>
              </div>
              {result.triage_level === "EMERGENCY_SOS" && (
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="tel:112"
                    className="px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-bold hover:bg-red-800 transition-colors inline-flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call 112</span>
                  </a>
                  <a
                    href="tel:911"
                    className="px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-bold hover:bg-red-800 transition-colors inline-flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call 911</span>
                  </a>
                </div>
              )}
            </div>

            {/* Red Flags Alert if detected */}
            {((result as any).red_flags_detected?.length ?? 0) > 0 && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-1.5">
                <div className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Red-Flag Warning Signs Identified:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-foreground/90 pl-1">
                  {((result as any).red_flags_detected || []).map((rf: any, idx: number) => (
                    <li key={idx}>{rf}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Educational Considerations */}
            <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>Educational Considerations (Not Clinical Diagnoses):</span>
              </div>
              <ul className="space-y-1 text-xs text-foreground/80 pl-1">
                {((result as any).possible_considerations || (result as any).possible_explanations || []).map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Doctor Discussion Questions */}
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>Prepared Questions for Your Doctor:</span>
                </span>
                <button
                  type="button"
                  onClick={copyDoctorQuestions}
                  className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline inline-flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedPrompt ? "Copied!" : "Copy Questions"}</span>
                </button>
              </div>
              <ol className="list-decimal list-inside text-xs text-teal-950 dark:text-teal-100 space-y-1">
                {((result as any).suggested_doctor_questions || (result as any).suggested_questions_for_doctor || []).map((q: any, idx: number) => (
                  <li key={idx}>{q}</li>
                ))}
              </ol>
            </div>

            {/* Evidence Citations */}
            {result.evidence_sources && result.evidence_sources.length > 0 && (
              <div className="text-[11px] space-y-1.5 pt-1">
                <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Clinical Guideline Citations:
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.evidence_sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url || `https://pubmed.ncbi.nlm.nih.gov/${src.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-low border border-border hover:border-teal-500/40 text-foreground transition-colors"
                    >
                      <BookOpen className="w-3 h-3 text-teal-600" />
                      <span className="truncate max-w-[240px]">
                        {src.guideline} ({src.journal} {src.year})
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Statutory Disclaimer */}
            <div className="p-2.5 rounded-lg bg-surface-low text-[10px] text-muted-foreground leading-relaxed border border-border/60">
              <span className="font-bold">Statutory Notice:</span> {result.statutory_disclaimer}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={resetWizard}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Evaluation</span>
              </button>

              <div className="flex items-center gap-2">
                {onSendToChat && (
                  <button
                    type="button"
                    onClick={handleSendToChatAction}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Consultation Chat</span>
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
