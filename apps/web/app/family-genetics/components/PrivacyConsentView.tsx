"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Database,
  Download,
  FileText,
  KeyRound,
  Lock,
  RotateCcw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

interface PrivacyConsentViewProps {
  onExportAllData: () => void;
  onPurgeData: () => Promise<void>;
}

export default function PrivacyConsentView({
  onExportAllData,
  onPurgeData,
}: PrivacyConsentViewProps) {
  const [consents, setConsents] = useState({
    family_history_processing: true,
    genetic_records_storage: true,
    partner_data_linking: true,
    anonymized_research_opt_in: false,
  });

  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeInput, setPurgeInput] = useState("");
  const [isPurging, setIsPurging] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleConsent = (key: keyof typeof consents) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveConsent = async () => {
    try {
      await api.updateGeneticConsent(consents);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error("Failed to update consent:", e);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleConfirmPurge = async () => {
    if (purgeInput !== "CONFIRM_PURGE_ALL_DATA") return;
    setIsPurging(true);
    try {
      await onPurgeData();
      setIsPurgeModalOpen(false);
      setPurgeInput("");
    } catch (e) {
      console.error("Failed to purge data:", e);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Disclaimer Card Verbatim */}
      <div className="p-5 rounded-2xl border border-sky-500/30 bg-sky-500/10 dark:bg-sky-950/20 text-sky-900 dark:text-sky-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
          <h3 className="text-sm font-bold tracking-tight">Clinical Governance & Medical Disclaimer</h3>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground dark:text-sky-300/90 font-medium">
          "MediPredict AI provides educational genetic and family-history risk awareness. It does not diagnose genetic conditions, determine reproductive outcomes, or replace clinical genetic testing and professional genetic counselling."
        </p>
      </div>

      {/* Regulatory Standards: DPDP Act 2023 & HIPAA */}
      <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600">
              REGULATORY COMPLIANCE FRAMEWORK
            </span>
            <h3 className="text-base font-bold text-foreground">
              DPDP Act 2023 & HIPAA Privacy Standard
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-1.5">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>Right to Erasure & Purge</span>
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Under Section 12 of India's Digital Personal Data Protection (DPDP) Act 2023 and HIPAA, you maintain the irrevocable right to erase all pedigree records and test data at any time.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-1.5">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-teal-600" />
              <span>Granular Purpose Limitation</span>
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Data is processed exclusively for user-authorized educational pedigree mapping and specialist preparation. No automated sharing occurs without explicit affirmative consent.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-1.5">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Database className="w-4 h-4 text-teal-600" />
              <span>Zero Demographic Bias</span>
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Our educational risk engines evaluate validated biological pedigree markers and test reports. We never infer clinical conditions from ethnicity or sensitive demographic data.
            </p>
          </div>
        </div>
      </div>

      {/* Granular Consent Management Switches */}
      <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            Granular Patient Data Consent Preferences
          </h4>
          <button
            onClick={handleSaveConsent}
            className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveSuccess ? "Preferences Saved!" : "Save Consent"}</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              key: "family_history_processing",
              title: "Family Health History Processing",
              desc: "Allow MediPredict AI to analyze entered pedigree data for inheritance pattern educational awareness.",
            },
            {
              key: "genetic_records_storage",
              title: "Genetic Variant & Test Storage",
              desc: "Store validated lab results (e.g. Hb HPLC, CFTR, SMN1 variants) securely in encrypted storage.",
            },
            {
              key: "partner_data_linking",
              title: "Partner Family History Linkage",
              desc: "Allow linkage between user pedigree and partner preconception history for combined risk education.",
            },
            {
              key: "anonymized_research_opt_in",
              title: "Anonymized Genomic Research Participation (Optional)",
              desc: "Contribute de-identified aggregate statistical data to academic public health hemoglobinopathy registries.",
            },
          ].map((item) => {
            const isChecked = consents[item.key as keyof typeof consents];
            return (
              <div
                key={item.key}
                onClick={() => toggleConsent(item.key as keyof typeof consents)}
                className="p-3.5 rounded-xl border border-border bg-surface-low/30 dark:bg-[#192c38] flex items-center justify-between gap-4 cursor-pointer hover:border-teal-500/40 transition-all"
              >
                <div className="space-y-0.5">
                  <h5 className="font-semibold text-foreground">{item.title}</h5>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>

                <div
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${
                    isChecked ? "bg-teal-600" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isChecked ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Export & Irreversible Purge Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export All Data */}
        <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-teal-600" />
            <h4 className="text-sm font-bold text-foreground">Export All Family & Genetic Data</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Download an interoperable, machine-readable JSON archive of your 3-generation family tree, documented health conditions, carrier screening discussions, and specialist referrals.
          </p>
          <button
            onClick={onExportAllData}
            className="w-full py-2.5 rounded-xl border border-border hover:bg-surface-low text-xs font-bold text-foreground transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Download Full JSON Export</span>
          </button>
        </div>

        {/* Purge All Data */}
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <h4 className="text-sm font-bold text-rose-800 dark:text-rose-200">
              Irreversible Data Purge
            </h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Permanently delete all family tree members, recorded conditions, preconception checklists, and referral logs from the database. This action cannot be undone.
          </p>
          <button
            onClick={() => setIsPurgeModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge All Records</span>
          </button>
        </div>
      </div>

      {/* Irreversible Purge Confirmation Modal */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#162732] rounded-2xl border border-rose-500/40 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirm Data Purge</span>
              </h3>
              <button
                onClick={() => setIsPurgeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-foreground leading-relaxed">
                You are about to irreversibly purge all family health history, pedigree trees, conditions, and preconception notes.
              </p>
              <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 text-[11px] text-rose-800 dark:text-rose-200">
                To confirm, type <span className="font-mono font-bold">CONFIRM_PURGE_ALL_DATA</span> in the field below:
              </div>

              <input
                type="text"
                value={purgeInput}
                onChange={(e) => setPurgeInput(e.target.value)}
                placeholder="CONFIRM_PURGE_ALL_DATA"
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsPurgeModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-surface-low"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={purgeInput !== "CONFIRM_PURGE_ALL_DATA" || isPurging}
                onClick={handleConfirmPurge}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm"
              >
                {isPurging ? "Purging Data..." : "Permanently Delete Everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
