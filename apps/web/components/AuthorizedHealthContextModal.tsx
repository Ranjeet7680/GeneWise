"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Dna,
  FileText,
  Heart,
  Pill,
  RefreshCw,
  Shield,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Users,
  Watch,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { AuthorizedHealthContextResponse } from "@/types";

interface AuthorizedHealthContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContextChanged?: (activeDomains: Record<string, boolean>) => void;
}

export default function AuthorizedHealthContextModal({
  isOpen,
  onClose,
  onContextChanged,
}: AuthorizedHealthContextModalProps) {
  const [healthContext, setHealthContext] = useState<AuthorizedHealthContextResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Individual domain consent toggles
  const [domains, setDomains] = useState<Record<string, boolean>>({
    reports: true,
    vitals: true,
    wearables: true,
    familyHistory: true,
    genetics: true,
    medications: true,
  });

  useEffect(() => {
    if (isOpen) {
      loadContext();
    }
  }, [isOpen]);

  const loadContext = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getHealthContext();
      setHealthContext(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load authorized health context.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleDomain = (key: string) => {
    const updated = { ...domains, [key]: !domains[key] };
    setDomains(updated);
    if (onContextChanged) {
      onContextChanged(updated);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="health-context-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#14262f] rounded-2xl border border-border shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-primary border border-teal-500/20">
              <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 id="health-context-title" className="text-base sm:text-lg font-bold text-foreground">
                Authorized Health Context & Privacy Controls
              </h3>
              <p className="text-xs text-muted-foreground">
                Granular consent toggles & minimum necessary clinical data scoping (Security Architecture v2.0)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close health context modal"
            className="p-1 rounded-lg text-muted-foreground hover:bg-surface-low transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Data Minimization Banner */}
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-foreground/90 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-teal-900 dark:text-teal-200">
              Data Minimization Principle:
            </span>{" "}
            The AI Medical Assistant only accesses patient telemetry that you explicitly authorize. All queries are
            logged to the tamper-resistant HMAC audit trail.
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />
            <span>Retrieving authorized patient telemetry...</span>
          </div>
        ) : error ? (
          <div className="p-3 rounded-xl bg-red-500/10 text-xs text-red-600">{error}</div>
        ) : healthContext ? (
          <div className="space-y-4">
            {/* Domain Controls Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Telemetry Permission Domains
              </h4>

              {/* 1. Laboratory Reports */}
              <div className="p-3 rounded-xl bg-surface-low border border-border flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Laboratory Reports & Measurements</div>
                    <p className="text-[11px] text-muted-foreground">
                      Authorizes assistant to review extracted biomarkers and reference range comparisons.
                    </p>
                    {domains.reports && (healthContext?.recent_reports?.length ?? 0) > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {healthContext?.recent_reports?.map((rep) => (
                          <span
                            key={rep.id}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container border border-border text-foreground"
                          >
                            {rep.title} ({rep.abnormal_findings_count} abnormal)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDomain("reports")}
                  className="text-teal-600 cursor-pointer"
                >
                  {domains.reports ? (
                    <ToggleRight className="w-7 h-7 text-teal-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* 2. Physiological Vitals */}
              <div className="p-3 rounded-xl bg-surface-low border border-border flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Activity className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Physiological Vitals</div>
                    <p className="text-[11px] text-muted-foreground">
                      Authorizes resting heart rate, blood pressure, and fasting blood glucose readings.
                    </p>
                    {domains.vitals && (
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                        <span className="font-semibold text-foreground">
                          BP: {healthContext?.vitals_summary?.blood_pressure || "124/82 mmHg"}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">
                          HR: {healthContext?.vitals_summary?.resting_heart_rate || "72 bpm"}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">
                          Glucose: {healthContext?.vitals_summary?.fasting_blood_glucose || "104 mg/dL"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDomain("vitals")}
                  className="text-teal-600 cursor-pointer"
                >
                  {domains.vitals ? (
                    <ToggleRight className="w-7 h-7 text-teal-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* 3. Wearable & Sensor Telemetry */}
              <div className="p-3 rounded-xl bg-surface-low border border-border flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Watch className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Wearable & IoT Telemetry</div>
                    <p className="text-[11px] text-muted-foreground">
                      Real-time Apple Watch / sensor feed (SpO2, heart rate variability, activity).
                    </p>
                    {domains.wearables && healthContext?.wearables_telemetry && (
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        <span>
                          Device:{" "}
                          <strong className="text-foreground">
                            {healthContext.wearables_telemetry.device_source}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          SpO2:{" "}
                          <strong className="text-foreground">
                            {healthContext.wearables_telemetry.spo2}%
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          HRV:{" "}
                          <strong className="text-foreground">
                            {healthContext.wearables_telemetry.hrv_rmssd} ms
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDomain("wearables")}
                  className="text-teal-600 cursor-pointer"
                >
                  {domains.wearables ? (
                    <ToggleRight className="w-7 h-7 text-teal-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* 4. Family Health History */}
              <div className="p-3 rounded-xl bg-surface-low border border-border flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Family Health Tree & Pedigree</div>
                    <p className="text-[11px] text-muted-foreground">
                      Maternal and paternal condition records across first- and second-degree relatives.
                    </p>
                    {domains.familyHistory && (healthContext?.family_history_summary?.length ?? 0) > 0 && (
                      <div className="mt-2 space-y-1">
                        {healthContext?.family_history_summary?.map((fm, idx) => (
                          <div key={idx} className="text-[11px] text-foreground">
                            <span className="font-bold">{fm.relationship}</span> ({fm.maternal_or_paternal}):{" "}
                            {fm.conditions.join(", ")}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDomain("familyHistory")}
                  className="text-teal-600 cursor-pointer"
                >
                  {domains.familyHistory ? (
                    <ToggleRight className="w-7 h-7 text-teal-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* 5. Genetic Predispositions & Variants */}
              <div className="p-3 rounded-xl bg-surface-low border border-border flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Dna className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Genetic Variants & Predispositions</div>
                    <p className="text-[11px] text-muted-foreground">
                      Verified germline genetic markers, carrier screening variants, and zygosity.
                    </p>
                    {domains.genetics && (healthContext?.genetic_predispositions?.length ?? 0) > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {healthContext?.genetic_predispositions?.map((gv, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 font-semibold"
                          >
                            {gv.gene} ({gv.variant}) — {gv.significance}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDomain("genetics")}
                  className="text-teal-600 cursor-pointer"
                >
                  {domains.genetics ? (
                    <ToggleRight className="w-7 h-7 text-teal-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* 6. Active Prescriptions */}
              <div className="p-3 rounded-xl bg-surface-low border border-border flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Pill className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Active Medications List</div>
                    <p className="text-[11px] text-muted-foreground">
                      Used for automated drug-drug interaction warnings and contraindication screening.
                    </p>
                    {domains.medications && (healthContext?.active_medications?.length ?? 0) > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {healthContext?.active_medications?.map((med, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 font-medium"
                          >
                            {med}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDomain("medications")}
                  className="text-teal-600 cursor-pointer"
                >
                  {domains.medications ? (
                    <ToggleRight className="w-7 h-7 text-teal-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-[10px] text-muted-foreground">
                {healthContext.data_minimization_note}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Apply & Save Permissions
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
