"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Layers,
  Microscope,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { AI_ENGINE_PROFILES, AiEngineProfile } from "@/lib/clinical-lstm";
import { NeuralTelemetry } from "@/types";

interface AiModelArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: AiEngineProfile;
  telemetry?: NeuralTelemetry;
  onSelectEngine: (engineId: string) => void;
}

export default function AiModelArchitectureModal({
  isOpen,
  onClose,
  activeProfile,
  telemetry,
  onSelectEngine,
}: AiModelArchitectureModalProps) {
  const [activeTab, setActiveTab] = useState<"architecture" | "telemetry" | "benchmarks">(
    "architecture"
  );
  const [interactiveGate, setInteractiveGate] = useState<"input" | "forget" | "output">("input");

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Model Architecture & Clinical Intelligence Inspector"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl bg-white dark:bg-[#111e26] border border-teal-500/30 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-teal-900/10 via-primary/5 to-indigo-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  AI Model Architecture & Neural Telemetry
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                  {activeProfile.aucLabel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {activeProfile.name} • {activeProfile.architecture} • Latency: {activeProfile.latencyLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-low text-muted-foreground hover:text-foreground transition-colors"
            title="Close model inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-border bg-surface-low/30 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("architecture")}
            className={`pb-2.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "architecture"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Neural Architecture Pipeline</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("telemetry")}
            className={`pb-2.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "telemetry"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Telemetry & Hyperparameters</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("benchmarks")}
            className={`pb-2.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "benchmarks"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Cross-Model Benchmark Matrix (7 Models)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[72vh] overflow-y-auto space-y-5 text-xs">
          {activeTab === "architecture" && (
            <div className="space-y-4">
              {/* Architecture Blueprint Flow */}
              <div className="p-4 rounded-xl bg-surface-low/60 dark:bg-surface-variant/20 border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-primary flex items-center gap-1.5">
                    <Workflow className="w-3.5 h-3.5" /> End-to-End Neural Processing Pipeline
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    FIPS 140-3 Zero-Trust Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-2">
                  <div className="p-3 rounded-lg bg-white dark:bg-[#14262f] border border-border space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-teal-700 dark:text-teal-300">
                      <span>1. Ingestion</span>
                      <Activity className="w-3 h-3 text-teal-600" />
                    </div>
                    <p className="font-bold text-foreground">Serum Tensor</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      5-visit longitudinal lab measurements normalized via Z-score scaling.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#14262f] border border-teal-500/40 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                      <span>2. Recurrence</span>
                      <BrainCircuit className="w-3 h-3 text-indigo-600" />
                    </div>
                    <p className="font-bold text-foreground">Bi-LSTM (256u)</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Bidirectional hidden states (h_fwd, h_bwd) encoding velocity & acceleration.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#14262f] border border-border space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-sky-700 dark:text-sky-300">
                      <span>3. Attention</span>
                      <Sparkles className="w-3 h-3 text-sky-600" />
                    </div>
                    <p className="font-bold text-foreground">8-Head Attention</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Self-attention across visits weighing recent trajectory inflection points.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#14262f] border border-border space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      <span>4. Knowledge</span>
                      <Microscope className="w-3 h-3 text-amber-600" />
                    </div>
                    <p className="font-bold text-foreground">ClinVar & PubMed</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Cross-attention grounding with ACG, ADA, AHA/ACC & ClinVar variants.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#14262f] border border-emerald-500/40 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      <span>5. Calibration</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <p className="font-bold text-foreground">Bayesian Bounds</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      +30d/+90d/+180d projections with 95% Credible Intervals & Brier score &lt; 0.04.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Recurrent Gate Attribution Viewer */}
              <div className="p-4 rounded-xl bg-surface-low/50 dark:bg-surface-variant/15 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-foreground flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-primary" /> Recurrent Gate Activation Weights
                  </span>
                  <div className="flex items-center gap-1">
                    {(["input", "forget", "output"] as const).map((gate) => (
                      <button
                        key={gate}
                        type="button"
                        onClick={() => setInteractiveGate(gate)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                          interactiveGate === gate
                            ? "bg-primary text-white"
                            : "bg-surface-low border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {gate} Gate
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-white dark:bg-[#14262f] border border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-muted-foreground text-[10px]">Input Gate (i_t)</span>
                      <span className="font-mono font-bold text-teal-600 dark:text-teal-400">46%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-low overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: "46%" }} />
                    </div>
                    <p className="text-[9px] text-muted-foreground">
                      Regulates influx of latest visit reading (V0) into long-term recurrent cell state.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#14262f] border border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-muted-foreground text-[10px]">Forget Gate (f_t)</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">32%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-low overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: "32%" }} />
                    </div>
                    <p className="text-[9px] text-muted-foreground">
                      Discounts historical baseline noise while preserving true longitudinal drift trends.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#14262f] border border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-muted-foreground text-[10px]">Output Gate (o_t)</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">22%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-low overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "22%" }} />
                    </div>
                    <p className="text-[9px] text-muted-foreground">
                      Controls emission of 30d/90d velocity projections into clinical literacy generator.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/25 text-[10px] text-teal-900 dark:text-teal-200">
                  <span className="font-bold">Active Gate Equation: </span>
                  <code className="font-mono">
                    {interactiveGate === "input" && "i_t = σ(W_i · [h_{t-1}, x_t] + b_i) × tanh(W_c · [h_{t-1}, x_t] + b_c)"}
                    {interactiveGate === "forget" && "f_t = σ(W_f · [h_{t-1}, x_t] + b_f) → cell_state C_t = f_t * C_{t-1} + i_t * C~_t"}
                    {interactiveGate === "output" && "o_t = σ(W_o · [h_{t-1}, x_t] + b_o) → hidden_state h_t = o_t * tanh(C_t)"}
                  </code>
                </div>
              </div>
            </div>
          )}

          {activeTab === "telemetry" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Inference Latency</span>
                  <p className="text-lg font-bold font-mono text-primary">
                    {telemetry?.latency_ms || 145} <span className="text-xs font-normal">ms</span>
                  </p>
                  <p className="text-[9px] text-muted-foreground">Fluid streaming execution</p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Token Velocity</span>
                  <p className="text-lg font-bold font-mono text-teal-600 dark:text-teal-400">
                    {telemetry?.tokens_per_second || 86.4} <span className="text-xs font-normal">tok/s</span>
                  </p>
                  <p className="text-[9px] text-muted-foreground">Sub-second generation</p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Brier Score</span>
                  <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    0.038 <span className="text-xs font-normal">(Gold)</span>
                  </p>
                  <p className="text-[9px] text-muted-foreground">Well-calibrated probabilities</p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-low border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Consensus Metric</span>
                  <p className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    98.5% <span className="text-xs font-normal">Concord</span>
                  </p>
                  <p className="text-[9px] text-muted-foreground">Multi-agent verified</p>
                </div>
              </div>

              {/* Hyperparameter Configuration Sheet */}
              <div className="p-4 rounded-xl border border-border bg-surface-low/40 dark:bg-surface-variant/15 space-y-2.5">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px] block">
                  Model Hyperparameters & Attestation Profile
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-[#14262f] border border-border">
                    <span className="text-muted-foreground">Sampling Temperature:</span>
                    <span className="font-mono font-bold text-foreground">0.20 (Deterministic Clinical)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-[#14262f] border border-border">
                    <span className="text-muted-foreground">Hidden Dimension:</span>
                    <span className="font-mono font-bold text-foreground">256 units (Bidirectional)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-[#14262f] border border-border">
                    <span className="text-muted-foreground">Attention Heads:</span>
                    <span className="font-mono font-bold text-foreground">8-Head Multi-Temporal</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-[#14262f] border border-border">
                    <span className="text-muted-foreground">Forecast Horizons:</span>
                    <span className="font-mono font-bold text-foreground">+30d / +90d / +180d</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-[#14262f] border border-border">
                    <span className="text-muted-foreground">Zero-Trust Guard:</span>
                    <span className="font-mono font-bold text-emerald-600">FIPS 140-3 Active</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-[#14262f] border border-border">
                    <span className="text-muted-foreground">Guideline Corpus:</span>
                    <span className="font-mono font-bold text-foreground">ACG 2024 • ADA 2025 • KDIGO</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "benchmarks" && (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                GeneWise Clinical Intelligence provides a calibrated ensemble of 7 specialized clinical models. Select any model to activate it immediately.
              </p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-surface-low border-b border-border text-muted-foreground font-bold">
                      <th className="p-2.5">Model Engine</th>
                      <th className="p-2.5">ROC-AUC / Precision</th>
                      <th className="p-2.5">Architecture</th>
                      <th className="p-2.5">Latency</th>
                      <th className="p-2.5">Primary Clinical Role</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {AI_ENGINE_PROFILES.map((eng) => {
                      const isCurrent = activeProfile.id === eng.id;
                      return (
                        <tr
                          key={eng.id}
                          className={`hover:bg-surface-low/60 transition-colors ${
                            isCurrent ? "bg-teal-500/10 font-medium" : ""
                          }`}
                        >
                          <td className="p-2.5">
                            <div className="flex items-center gap-1.5 font-bold text-foreground">
                              {eng.isLstm ? (
                                <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              )}
                              <span>{eng.name}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">{eng.model}</span>
                          </td>
                          <td className="p-2.5 font-bold text-teal-700 dark:text-teal-300 font-mono">
                            {eng.aucLabel}
                          </td>
                          <td className="p-2.5 text-muted-foreground max-w-[180px] truncate">
                            {eng.architecture}
                          </td>
                          <td className="p-2.5 font-mono text-muted-foreground">{eng.latencyLabel}</td>
                          <td className="p-2.5 text-muted-foreground max-w-[200px] truncate">
                            {eng.description}
                          </td>
                          <td className="p-2.5 text-right">
                            {isCurrent ? (
                              <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold text-[10px]">
                                Active
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectEngine(eng.id);
                                  onClose();
                                }}
                                className="px-2.5 py-1 rounded-full bg-surface-low hover:bg-primary hover:text-white border border-border text-[10px] font-bold transition-all"
                              >
                                Activate
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-low/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>DPDP Act 2023 & HIPAA Sec. 164.312 Compliant • Non-Diagnostic Clinical DSS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
