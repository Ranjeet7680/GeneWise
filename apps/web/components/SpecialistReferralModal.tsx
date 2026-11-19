"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  FileCheck,
  Lock,
  Send,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { ConsultationSummaryRequest, ConsultationSummaryResponse } from "@/types";

interface SpecialistReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReferralCreated?: (referral: ConsultationSummaryResponse) => void;
}

const SPECIALTIES = [
  "Cardiogenetics & Familial Hypercholesterolemia",
  "Cancer Genetics & Hereditary Oncology",
  "Reproductive & Preconception Genetics",
  "Neurogenetics & Movement Disorders",
  "Pharmacogenomics & Precision Medicine",
  "Internal Medicine & Preventive Cardiology",
];

const SPECIALISTS = [
  {
    id: 1,
    name: "Dr. Elena Rostova, MD, PhD",
    title: "Board-Certified Clinical Geneticist",
    clinic: "GeneWise Precision Genomics Institute",
    languages: "English, Hindi, Russian",
    telehealth: true,
  },
  {
    id: 2,
    name: "Dr. Priya Sharma, MS, CGC",
    title: "Licensed Genetic Counselor",
    clinic: "Apollo Genomics & Hereditary Risk Center",
    languages: "Hindi, English, Gujarati",
    telehealth: true,
  },
  {
    id: 3,
    name: "Dr. Vikram Nair, MD, DM",
    title: "Preventive Cardiologist & Lipidologist",
    clinic: "National Heart & Vascular Institute",
    languages: "English, Tamil, Malayalam",
    telehealth: true,
  },
];

export default function SpecialistReferralModal({
  isOpen,
  onClose,
  onReferralCreated,
}: SpecialistReferralModalProps) {
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<number>(1);
  const [specialty, setSpecialty] = useState<string>(SPECIALTIES[0]);
  const [clinicalPriority, setClinicalPriority] = useState<string>("routine");
  const [referralReason, setReferralReason] = useState<string>(
    "Cardiogenetic and lipid risk evaluation following family history of early myocardial infarction in maternal grandfather and elevated LDL-C / ALT biomarkers."
  );

  const [includeFamilyTree, setIncludeFamilyTree] = useState<boolean>(true);
  const [includeGenetics, setIncludeGenetics] = useState<boolean>(true);
  const [includeVitals, setIncludeVitals] = useState<boolean>(true);
  const [includeMedications, setIncludeMedications] = useState<boolean>(true);

  const [consentGranted, setConsentGranted] = useState<boolean>(true);
  const [notesForSpecialist, setNotesForSpecialist] = useState<string>(
    "Patient inquires whether cascade screening is recommended for first-degree relatives and if Lipoprotein(a) testing is indicated."
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<ConsultationSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    if (!consentGranted) {
      setError("Affirmative patient consent is mandatory to assemble a clinical consultation summary.");
      return;
    }
    if (!referralReason.trim()) {
      setError("Please describe the primary reason for referral.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const payload: ConsultationSummaryRequest = {
        counsellor_id: selectedSpecialistId,
        specialty_requested: specialty,
        referral_reason: referralReason.trim(),
        clinical_priority: clinicalPriority,
        include_family_tree: includeFamilyTree,
        include_genetic_tests: includeGenetics,
        include_recent_vitals: includeVitals,
        include_medications: includeMedications,
        consent_granted: true,
        notes_for_specialist: notesForSpecialist.trim(),
      };

      const res = await api.createReferralSummary(payload);
      setSummary(res);
      if (onReferralCreated) {
        onReferralCreated(res);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to generate specialist referral packet.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyPacket = () => {
    if (!summary) return;
    const text =
      `MEDIPREDICT AI — SPECIALIST CONSULTATION REFERRAL SUMMARY\n` +
      `Audit Token: ${summary.consent_audit_token}\n` +
      `Specialty: ${summary.patient_summary.specialty_requested} (Priority: ${summary.patient_summary.clinical_priority})\n` +
      `Chief Complaint: ${summary.chief_complaint_and_history}\n\n` +
      `Relevant Findings:\n` +
      summary.relevant_family_and_genetic_findings.map((f) => `- ${f}`).join("\n") +
      `\n\nPrepared Clinical Discussion Points:\n` +
      summary.prepared_clinical_discussion_points.map((q, i) => `${i + 1}. ${q}`).join("\n") +
      `\n\nStatutory Disclaimer: ${summary.statutory_disclaimer}`;

    navigator.clipboard?.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="specialist-referral-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#14262f] rounded-2xl border border-border shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
              <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 id="specialist-referral-title" className="text-base sm:text-lg font-bold text-foreground">
                Specialist Referral & Consultation Packet
              </h3>
              <p className="text-xs text-muted-foreground">
                Consent-gated clinical summary compilation with tamper-resistant audit tokens
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close specialist referral modal"
            className="p-1 rounded-lg text-muted-foreground hover:bg-surface-low transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        {!summary ? (
          <div className="space-y-4">
            {/* Specialist Selection */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Select Verified Specialist / Genetic Counselor
              </label>
              <div className="space-y-2">
                {SPECIALISTS.map((s) => {
                  const isSelected = selectedSpecialistId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSpecialistId(s.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-indigo-500/10 border-indigo-500/40 text-foreground font-semibold"
                          : "bg-surface-low border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-foreground">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {s.title} • {s.clinic}
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                          Languages: {s.languages} • Telehealth Available
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specialty & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Specialty Requested
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-surface-low"
                >
                  {SPECIALTIES.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Clinical Priority
                </label>
                <select
                  value={clinicalPriority}
                  onChange={(e) => setClinicalPriority(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-surface-low"
                >
                  <option value="routine">Routine (Next available)</option>
                  <option value="urgent">Urgent (&lt; 7 days)</option>
                  <option value="expedited">Expedited Preconception Review</option>
                </select>
              </div>
            </div>

            {/* Referral Reason */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Reason for Referral / Chief Clinical Concern *
              </label>
              <textarea
                value={referralReason}
                onChange={(e) => setReferralReason(e.target.value)}
                rows={3}
                placeholder="Describe primary clinical reason or family pattern requiring specialist evaluation..."
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-surface-low"
              />
            </div>

            {/* Consent Scope Checkboxes */}
            <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Authorized Data Inclusions:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFamilyTree}
                    onChange={(e) => setIncludeFamilyTree(e.target.checked)}
                    className="accent-indigo-600 rounded"
                  />
                  <span>Include Family Pedigree Tree</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeGenetics}
                    onChange={(e) => setIncludeGenetics(e.target.checked)}
                    className="accent-indigo-600 rounded"
                  />
                  <span>Include Genetic Variants</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeVitals}
                    onChange={(e) => setIncludeVitals(e.target.checked)}
                    className="accent-indigo-600 rounded"
                  />
                  <span>Include Key Biomarkers & Vitals</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMedications}
                    onChange={(e) => setIncludeMedications(e.target.checked)}
                    className="accent-indigo-600 rounded"
                  />
                  <span>Include Active Medications</span>
                </label>
              </div>
            </div>

            {/* Mandatory Affirmative Consent Checkbox */}
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="accent-indigo-600 rounded mt-0.5"
                />
                <span className="font-medium text-foreground/90 leading-relaxed">
                  <strong>Affirmative Patient Consent Declaration:</strong> I hereby affirmatively authorize
                  MediPredict AI to compile and transmit this structured clinical and genetic health summary to the
                  selected specialist. I understand this summary supports clinical review and does not constitute a
                  definitive diagnosis.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-surface-low"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading || !consentGranted}
                onClick={handleGenerateSummary}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Compiling Referral Packet...</span>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Generate Structured Referral Packet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Compiled Summary Preview */
          <div className="space-y-4 animate-in fade-in">
            {/* Audit Token Card */}
            <div className="p-3.5 rounded-xl bg-linear-to-r from-indigo-500/10 via-teal-500/5 to-transparent border border-indigo-500/20 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Tamper-Resistant Consent Token</span>
                </div>
                <div className="font-mono text-sm font-black text-foreground mt-0.5">
                  {summary.consent_audit_token}
                </div>
              </div>
              <button
                type="button"
                onClick={copyPacket}
                className="px-3 py-1.5 rounded-lg bg-surface-low border border-border text-xs font-bold hover:bg-surface-container inline-flex items-center gap-1.5 text-foreground"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedToken ? "Copied Packet!" : "Copy Packet"}</span>
              </button>
            </div>

            {/* Demographic & Reason */}
            <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-1.5 text-xs">
              <div className="font-bold text-foreground">
                Specialty: {summary?.patient_summary?.specialty_requested || (summary as any)?.specialty_requested || "Clinical Genetics"} • Urgency:{" "}
                {(summary?.patient_summary?.clinical_priority || (summary as any)?.clinical_priority || "routine")?.toUpperCase()}
              </div>
              <p className="text-foreground/80 leading-relaxed">
                <strong className="text-foreground">Chief Concern:</strong> {summary?.chief_complaint_and_history}
              </p>
            </div>

            {/* Findings */}
            <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-1.5 text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Synthesized Clinical Findings:</span>
              </span>
              <ul className="space-y-1 pl-1 text-foreground/85">
                {(summary?.relevant_family_and_genetic_findings || []).map((f, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Biomarkers */}
            {(summary?.key_biomarkers_and_vitals?.length ?? 0) > 0 && (
              <div className="p-3 rounded-xl bg-surface-low border border-border text-xs flex flex-wrap gap-2">
                <span className="font-bold text-foreground">Recent Telemetry:</span>
                {summary?.key_biomarkers_and_vitals?.map((v, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-surface-container border border-border text-foreground"
                  >
                    {v.metric}: {v.value} {v.unit}
                  </span>
                ))}
              </div>
            )}

            {/* Prepared Questions */}
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-500/20 space-y-1.5 text-xs">
              <span className="font-bold text-indigo-950 dark:text-indigo-200">
                Prepared Specialist Discussion Points:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-indigo-950 dark:text-indigo-100">
                {(summary?.prepared_clinical_discussion_points || []).map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ol>
            </div>

            {/* Statutory Disclaimer */}
            <div className="p-2.5 rounded-lg bg-surface-low text-[10px] text-muted-foreground leading-relaxed border border-border">
              <span className="font-bold">Statutory Notice:</span> {summary?.statutory_disclaimer}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSummary(null)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Back / Edit Details
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyPacket}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {copiedToken ? "Copied!" : "Copy Full Packet"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-surface-low"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
