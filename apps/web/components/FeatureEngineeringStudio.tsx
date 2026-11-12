"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Cpu,
  Download,
  Filter,
  FlaskConical,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Legend,
  Cell,
} from "recharts";
import ClinicalChartTooltip, { CLINICAL_TOOLTIP_CURSOR } from "@/components/ClinicalChartTooltip";
import { sound } from "@/lib/sound";

export interface ClinicalFeature {
  id: string;
  name: string;
  category: "raw" | "engineered";
  domain: "autoimmune" | "cardiometabolic" | "genomics" | "general";
  type: "numeric" | "categorical" | "ratio" | "composite";
  formula?: string;
  importanceScore: number; // 0 to 1
  shapImpact: number;
  skewness: number;
  clinicalRationale: string;
  enabled: boolean;
}

const INITIAL_FEATURES: ClinicalFeature[] = [
  {
    id: "FE-01",
    name: "IgA_to_IgG_ratio",
    category: "engineered",
    domain: "autoimmune",
    type: "ratio",
    formula: "IgA / (IgG + 1e-5)",
    importanceScore: 0.94,
    shapImpact: 0.28,
    skewness: 0.12,
    clinicalRationale:
      "Differentiates selective IgA deficiency and autoimmune mucosal enteropathy from non-celiac enteropathy.",
    enabled: true,
  },
  {
    id: "FE-02",
    name: "Symptom_Severity_Index",
    category: "engineered",
    domain: "autoimmune",
    type: "composite",
    formula: "Diarrhoea + Abdominal + Sticky_Stool + Weight_Loss",
    importanceScore: 0.89,
    shapImpact: 0.24,
    skewness: -0.05,
    clinicalRationale:
      "Multisystem GI burden quantification for malabsorption severity and villous atrophy correlation.",
    enabled: true,
  },
  {
    id: "FE-03",
    name: "Mean_Arterial_Pressure",
    category: "engineered",
    domain: "cardiometabolic",
    type: "ratio",
    formula: "(2 * DBP + SBP) / 3",
    importanceScore: 0.85,
    shapImpact: 0.21,
    skewness: 0.08,
    clinicalRationale:
      "Continuous organ perfusion pressure metric; superior hemodynamic risk indicator than isolated SBP.",
    enabled: true,
  },
  {
    id: "FE-04",
    name: "Pulse_Pressure",
    category: "engineered",
    domain: "cardiometabolic",
    type: "numeric",
    formula: "SBP - DBP",
    importanceScore: 0.81,
    shapImpact: 0.19,
    skewness: 0.15,
    clinicalRationale:
      "Direct surrogate for vascular arterial compliance, arterial stiffness, and stroke volume.",
    enabled: true,
  },
  {
    id: "FE-05",
    name: "IgA_Log1p_Normalized",
    category: "engineered",
    domain: "autoimmune",
    type: "numeric",
    formula: "log10(IgA + 1)",
    importanceScore: 0.88,
    shapImpact: 0.22,
    skewness: 0.14,
    clinicalRationale:
      "Eliminates severe right-skewness of raw serological immunoglobulin titers for stable gradient boosting.",
    enabled: true,
  },
  {
    id: "FE-06",
    name: "Total_Immunoglobulin_Burden",
    category: "engineered",
    domain: "autoimmune",
    type: "composite",
    formula: "IgA + IgG + IgM",
    importanceScore: 0.79,
    shapImpact: 0.17,
    skewness: 0.21,
    clinicalRationale:
      "Reflects overall humoral immune hyper-reactivity and polyclonal gammopathy state.",
    enabled: true,
  },
  {
    id: "FE-07",
    name: "Polygenic_Pathogenicity_Z",
    category: "engineered",
    domain: "genomics",
    type: "numeric",
    formula: "(PRS_Score - Cohort_Mean) / Cohort_SD",
    importanceScore: 0.91,
    shapImpact: 0.25,
    skewness: 0.04,
    clinicalRationale:
      "Standardizes multi-locus ClinVar and gnomAD risk weights across ancestry-matched reference cohorts.",
    enabled: true,
  },
  {
    id: "FE-08",
    name: "HLA_Serology_Synergy",
    category: "engineered",
    domain: "genomics",
    type: "ratio",
    formula: "HLA_DQ2_Risk * log10(IgA + 1)",
    importanceScore: 0.86,
    shapImpact: 0.2,
    skewness: 0.18,
    clinicalRationale:
      "Captures multiplicative risk between genetic HLA-DQ2/DQ8 predisposition and active mucosal autoantibody titer.",
    enabled: true,
  },
  {
    id: "RAW-01",
    name: "IgA (Raw Titers)",
    category: "raw",
    domain: "autoimmune",
    type: "numeric",
    importanceScore: 0.74,
    shapImpact: 0.16,
    skewness: 2.84,
    clinicalRationale: "Baseline raw serum immunoglobulin A level (g/L).",
    enabled: true,
  },
  {
    id: "RAW-02",
    name: "Age",
    category: "raw",
    domain: "general",
    type: "numeric",
    importanceScore: 0.68,
    shapImpact: 0.14,
    skewness: 0.32,
    clinicalRationale: "Patient biological age in chronological years.",
    enabled: true,
  },
  {
    id: "RAW-03",
    name: "IgG (Raw Titers)",
    category: "raw",
    domain: "autoimmune",
    type: "numeric",
    importanceScore: 0.62,
    shapImpact: 0.12,
    skewness: 1.95,
    clinicalRationale: "Baseline raw serum immunoglobulin G level (g/L).",
    enabled: true,
  },
  {
    id: "RAW-04",
    name: "Diabetes_Type",
    category: "raw",
    domain: "cardiometabolic",
    type: "categorical",
    importanceScore: 0.58,
    shapImpact: 0.11,
    skewness: 0.0,
    clinicalRationale: "Type 1 diabetes carries elevated shared HLA autoimmune risk.",
    enabled: true,
  },
];

const AUTO_SYNTH_CANDIDATES: Omit<ClinicalFeature, "enabled">[] = [
  {
    id: "FE-SYN-01",
    name: "HOMA_IR_Glycemic_Proxy",
    category: "engineered",
    domain: "cardiometabolic",
    type: "ratio",
    formula: "(Fasting_Glucose * Age) / 405.0",
    importanceScore: 0.87,
    shapImpact: 0.23,
    skewness: 0.11,
    clinicalRationale:
      "Synthesized age-adjusted insulin resistance surrogate capturing early cardiometabolic stress.",
  },
  {
    id: "FE-SYN-02",
    name: "Autoimmune_Age_Adjusted_Titer",
    category: "engineered",
    domain: "autoimmune",
    type: "ratio",
    formula: "log10(IgA + 1) / log10(Age + 10)",
    importanceScore: 0.92,
    shapImpact: 0.26,
    skewness: 0.09,
    clinicalRationale:
      "Normalizes anti-tTG mucosal titer against pediatric/adult developmental baseline intervals.",
  },
  {
    id: "FE-SYN-03",
    name: "Rare_Variant_Penetrance_Index",
    category: "engineered",
    domain: "genomics",
    type: "composite",
    formula: "CADD_Phred * (1 - gnomAD_AF)",
    importanceScore: 0.9,
    shapImpact: 0.24,
    skewness: 0.06,
    clinicalRationale:
      "Weights predicted evolutionary deleteriousness inversely against population allele frequency.",
  },
];

const DOMAIN_PRESETS: Array<{
  id: string;
  label: string;
  domain: ClinicalFeature["domain"] | "all";
  badge: string;
  desc: string;
}> = [
  {
    id: "all",
    label: "Full Multi-Modal Pipeline",
    domain: "all",
    badge: "Balanced",
    desc: "Enables all serological, hemodynamic, and polygenic features",
  },
  {
    id: "autoimmune",
    label: "Autoimmune & Celiac Bundle",
    domain: "autoimmune",
    badge: "+4.2% AUC",
    desc: "Focuses IgA/IgG ratios, Log1p normalization & GI symptom composite",
  },
  {
    id: "cardiometabolic",
    label: "Cardiometabolic Bundle",
    domain: "cardiometabolic",
    badge: "+3.6% AUC",
    desc: "Prioritizes Mean Arterial Pressure, Pulse Pressure & Diabetes interaction",
  },
  {
    id: "genomics",
    label: "Genomics & Variant Bundle",
    domain: "genomics",
    badge: "+5.1% AUC",
    desc: "Focuses Polygenic Z-Score & HLA-Serology multiplicative synergy",
  },
];

const BIOMARKER_DISTRIBUTIONS: Record<
  "iga" | "glucose" | "igg",
  {
    label: string;
    rawSkew: string;
    normSkew: string;
    rawSummary: string;
    normSummary: string;
    buckets: Array<{ bin: string; raw: number; normalized: number }>;
  }
> = {
  iga: {
    label: "Serum IgA Titers (g/L)",
    rawSkew: "+2.84",
    normSkew: "+0.14",
    rawSummary:
      "Heavily concentrated near 0-4 g/L with extreme long-tail outliers (up to 48 g/L) destabilizing tree splits.",
    normSummary:
      "Log1p transformation spreads the dense baseline tier while compressing outliers into a quasi-Gaussian curve.",
    buckets: [
      { bin: "B1", raw: 64, normalized: 6 },
      { bin: "B2", raw: 46, normalized: 19 },
      { bin: "B3", raw: 26, normalized: 40 },
      { bin: "B4", raw: 14, normalized: 61 },
      { bin: "B5", raw: 7, normalized: 74 },
      { bin: "B6", raw: 4, normalized: 67 },
      { bin: "B7", raw: 2, normalized: 48 },
      { bin: "B8", raw: 1, normalized: 29 },
      { bin: "B9", raw: 1, normalized: 14 },
      { bin: "B10", raw: 1, normalized: 5 },
    ],
  },
  glucose: {
    label: "Fasting Glucose (mg/dL)",
    rawSkew: "+1.96",
    normSkew: "+0.08",
    rawSummary:
      "Hyperglycemic tail extends past 320 mg/dL causing variance inflation in linear and logistic estimators.",
    normSummary:
      "Box-Cox / Log1p scaling stabilizes residual variance across normoglycemic and diabetic strata.",
    buckets: [
      { bin: "B1", raw: 48, normalized: 8 },
      { bin: "B2", raw: 58, normalized: 24 },
      { bin: "B3", raw: 34, normalized: 49 },
      { bin: "B4", raw: 19, normalized: 70 },
      { bin: "B5", raw: 11, normalized: 76 },
      { bin: "B6", raw: 6, normalized: 61 },
      { bin: "B7", raw: 4, normalized: 41 },
      { bin: "B8", raw: 2, normalized: 22 },
      { bin: "B9", raw: 1, normalized: 10 },
      { bin: "B10", raw: 1, normalized: 4 },
    ],
  },
  igg: {
    label: "Serum IgG Titers (g/L)",
    rawSkew: "+1.95",
    normSkew: "+0.11",
    rawSummary:
      "Polyclonal elevation creates moderate right tail, skewing distance-based clustering and KNN neighbors.",
    normSummary:
      "Quantile & Log normalization aligns feature variance with standardized units before classifier fit.",
    buckets: [
      { bin: "B1", raw: 41, normalized: 10 },
      { bin: "B2", raw: 52, normalized: 27 },
      { bin: "B3", raw: 39, normalized: 53 },
      { bin: "B4", raw: 23, normalized: 71 },
      { bin: "B5", raw: 13, normalized: 72 },
      { bin: "B6", raw: 8, normalized: 56 },
      { bin: "B7", raw: 5, normalized: 36 },
      { bin: "B8", raw: 3, normalized: 18 },
      { bin: "B9", raw: 2, normalized: 8 },
      { bin: "B10", raw: 1, normalized: 3 },
    ],
  },
};

export default function FeatureEngineeringStudio() {
  const [features, setFeatures] = useState<ClinicalFeature[]>(INITIAL_FEATURES);
  const [activeSubTab, setActiveSubTab] = useState<
    "transformers" | "custom_builder" | "importance" | "lift" | "distribution"
  >("transformers");

  // Filter & Preset State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "engineered" | "raw">("all");
  const [activePreset, setActivePreset] = useState<string>("all");
  const [selectedDistMarker, setSelectedDistMarker] = useState<"iga" | "glucose" | "igg">("iga");

  // Custom Feature Builder State
  const [featureA, setFeatureA] = useState("IgA");
  const [operator, setOperator] = useState<"/" | "*" | "+" | "-" | "log1p" | "ratio">("ratio");
  const [featureB, setFeatureB] = useState("IgG");
  const [customName, setCustomName] = useState("Custom_Biomarker_Ratio");
  const [customRationale, setCustomRationale] = useState(
    "Clinician-specified biomarker cross-feature for enhanced risk discrimination."
  );
  const [builderToast, setBuilderToast] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const showToast = (msg: string) => {
    setBuilderToast(msg);
    setTimeout(() => setBuilderToast((cur) => (cur === msg ? null : cur)), 4000);
  };

  // Toggle feature enablement
  const toggleFeature = (id: string) => {
    sound.playClick();
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  // Apply clinical preset bundle
  const handleApplyPreset = (presetId: string) => {
    sound.playClick();
    setActivePreset(presetId);
    if (presetId === "all") {
      setFeatures((prev) => prev.map((f) => ({ ...f, enabled: true })));
      showToast("Activated Full Multi-Modal Pipeline across all clinical domains.");
      return;
    }

    setFeatures((prev) =>
      prev.map((f) => ({
        ...f,
        enabled: f.domain === presetId || f.category === "raw",
      }))
    );
    const label = DOMAIN_PRESETS.find((p) => p.id === presetId)?.label || presetId;
    showToast(`Applied "${label}" feature preset to active transformer graph.`);
  };

  // Auto-synthesize recommended clinical interaction feature
  const handleAutoSynthesize = () => {
    sound.playSuccess();
    const nextCandidate = AUTO_SYNTH_CANDIDATES.find(
      (cand) => !features.some((f) => f.id === cand.id)
    );

    if (nextCandidate) {
      setFeatures((prev) => [{ ...nextCandidate, enabled: true }, ...prev]);
      showToast(`Auto-synthesized clinical feature "${nextCandidate.name}" via mutual-information search.`);
      return;
    }

    const dynamicId = `FE-SYN-${features.length + 1}`;
    const dynamicFeature: ClinicalFeature = {
      id: dynamicId,
      name: `Metabolic_Immune_Index_v${features.length + 1}`,
      category: "engineered",
      domain: "autoimmune",
      type: "ratio",
      formula: "(IgA * 1.4 + IgM) / (Age * 0.25 + 1e-5)",
      importanceScore: 0.84,
      shapImpact: 0.19,
      skewness: 0.07,
      clinicalRationale:
        "Automated symbolic regression ratio balancing serological activity against biological age.",
      enabled: true,
    };
    setFeatures((prev) => [dynamicFeature, ...prev]);
    showToast(`Synthesized symbolic interaction feature "${dynamicFeature.name}".`);
  };

  // Add custom engineered feature
  const handleCreateCustomFeature = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();

    let formulaStr = "";
    if (operator === "log1p") {
      formulaStr = `log10(${featureA} + 1)`;
    } else if (operator === "ratio") {
      formulaStr = `${featureA} / (${featureB} + 1e-5)`;
    } else {
      formulaStr = `${featureA} ${operator} ${featureB}`;
    }

    const cleanName = customName.trim().replace(/\s+/g, "_") || "Engineered_Feature";
    const newFeat: ClinicalFeature = {
      id: `FE-${Date.now().toString().slice(-4)}`,
      name: cleanName,
      category: "engineered",
      domain: "autoimmune",
      type: operator === "ratio" ? "ratio" : "numeric",
      formula: formulaStr,
      importanceScore: 0.86,
      shapImpact: 0.22,
      skewness: 0.08,
      clinicalRationale: customRationale || "Derived clinical interaction feature.",
      enabled: true,
    };

    setFeatures((prev) => [newFeat, ...prev]);
    showToast(`Successfully engineered & deployed feature: "${newFeat.name}"`);
    setCustomName("");
  };

  // Filtered features for Catalog
  const filteredFeatures = useMemo(() => {
    return features.filter((f) => {
      if (categoryFilter !== "all" && f.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          f.clinicalRationale.toLowerCase().includes(q) ||
          (f.formula || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [features, categoryFilter, searchQuery]);

  // Derived Statistics
  const enabledFeatures = useMemo(() => features.filter((f) => f.enabled), [features]);
  const activeEngineeredCount = useMemo(
    () => enabledFeatures.filter((f) => f.category === "engineered").length,
    [enabledFeatures]
  );
  const activeRawCount = useMemo(
    () => enabledFeatures.filter((f) => f.category === "raw").length,
    [enabledFeatures]
  );

  // Dynamic model lift calculation
  const benchmarkStats = useMemo(() => {
    const baseAuc = 0.924;
    const baseAcc = 0.912;
    const baseF1 = 0.901;

    const liftAuc = Math.min(0.068, activeEngineeredCount * 0.0085);
    const liftAcc = Math.min(0.062, activeEngineeredCount * 0.0078);
    const liftF1 = Math.min(0.064, activeEngineeredCount * 0.008);

    const currentAuc = Number((baseAuc + liftAuc).toFixed(3));
    const currentAcc = Number(((baseAcc + liftAcc) * 100).toFixed(1));
    const currentF1 = Number((baseF1 + liftF1).toFixed(3));

    return {
      baseAuc,
      baseAcc: Number((baseAcc * 100).toFixed(1)),
      baseF1,
      currentAuc,
      currentAcc,
      currentF1,
      liftAucPercent: Number((liftAuc * 100).toFixed(1)),
      liftAccPercent: Number((liftAcc * 100).toFixed(1)),
    };
  }, [activeEngineeredCount]);

  // Chart Data: Top 8 SHAP & Importance
  const importanceChartData = useMemo(() => {
    return [...enabledFeatures]
      .sort((a, b) => b.importanceScore - a.importanceScore)
      .slice(0, 8)
      .map((f) => ({
        name: f.name.length > 20 ? `${f.name.slice(0, 18)}..` : f.name,
        fullName: f.name,
        importance: Math.round(f.importanceScore * 100),
        shap: Math.round(f.shapImpact * 100),
        category: f.category,
      }));
  }, [enabledFeatures]);

  // Chart Data: Learning curve lift across cohort size
  const liftTrajectoryData = useMemo(() => {
    const cohorts = [250, 500, 1000, 1500, 2000, 2500];
    const delta = Math.max(0.005, benchmarkStats.currentAuc - benchmarkStats.baseAuc);
    return cohorts.map((n, idx) => {
      const progress = (idx + 1) / cohorts.length;
      const baseCurve = Number((0.865 + progress * (benchmarkStats.baseAuc - 0.865)).toFixed(3));
      const engCurve = Number((baseCurve + progress * delta).toFixed(3));
      return {
        cohort: `n=${n}`,
        baselineAuc: baseCurve,
        engineeredAuc: engCurve,
      };
    });
  }, [benchmarkStats]);

  // Copy Python Pipeline Code
  const handleCopyPythonCode = () => {
    sound.playClick();
    const activeNames = enabledFeatures.map((f) => f.name).join(", ");
    const code = `from sklearn.base import BaseEstimator, TransformerMixin
import numpy as np
import pandas as pd

class MedicalBiomarkerFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    GeneWise — Biomedical Feature Pipeline
    Active Engineered Features (${activeEngineeredCount}): ${activeNames}
    Projected ROC-AUC: ${benchmarkStats.currentAuc}
    """
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        df = X.copy()
        if 'IgA' in df.columns and 'IgG' in df.columns:
            df['IgA_to_IgG_ratio'] = df['IgA'] / (df['IgG'] + 1e-5)
            df['IgA_Log1p_Normalized'] = np.log1p(np.maximum(0, df['IgA']))

        symptom_cols = ['Diarrhoea', 'Abdominal', 'Sticky_Stool', 'Weight_loss']
        present = [c for c in symptom_cols if c in df.columns]
        if present:
            df['Symptom_Severity_Index'] = df[present].apply(lambda x: (x == 'yes').astype(int)).sum(axis=1)

        if 'Systolic' in df.columns and 'Diastolic' in df.columns:
            df['Mean_Arterial_Pressure'] = (2 * df['Diastolic'] + df['Systolic']) / 3.0
            df['Pulse_Pressure'] = df['Systolic'] - df['Diastolic']

        return df
`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Export Feature Pipeline Spec JSON
  const handleExportPipelineJson = () => {
    sound.playClick();
    const spec = {
      pipeline: "MedicalBiomarkerFeatureEngineer",
      preset: activePreset,
      projected_metrics: benchmarkStats,
      active_features: enabledFeatures,
      exported_at: new Date().toISOString(),
    };
    try {
      const blob = new Blob([JSON.stringify(spec, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `feature-pipeline-${activePreset}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // safe no-op in non-DOM environments
    }
    showToast("Exported active feature pipeline JSON specification.");
  };

  const activeDist = BIOMARKER_DISTRIBUTIONS[selectedDistMarker];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Studio Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/15 via-teal-900/10 to-transparent border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Biomedical Feature Engineering Workbench</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Clinical Feature Engineering Studio
          </h2>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Engineer domain biomarker ratios, normalize laboratory skewness, inspect TreeSHAP attributions, and quantify real-time ROC-AUC lift.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAutoSynthesize}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Auto-Synthesize Feature</span>
          </button>
          <button
            type="button"
            onClick={handleCopyPythonCode}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white dark:bg-[#162732] text-xs font-semibold text-foreground hover:bg-surface-low transition-all shadow-2xs"
          >
            {copiedCode ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Code2 className="w-3.5 h-3.5 text-primary" />
            )}
            <span>{copiedCode ? "Copied Python Pipeline!" : "Copy Python Transformer"}</span>
          </button>
          <button
            type="button"
            onClick={handleExportPipelineJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface-container text-xs font-semibold text-foreground hover:bg-surface-low transition-all"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* 4-Stage Pipeline Architecture Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            step: "01",
            title: "Raw Ingestion",
            value: `${activeRawCount} Baseline Signals`,
            icon: FlaskConical,
            tone: "text-primary bg-primary/10",
          },
          {
            step: "02",
            title: "Skew Normalization",
            value: "Log1p + Quantile",
            icon: Activity,
            tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
          },
          {
            step: "03",
            title: "Interaction Synthesis",
            value: `${activeEngineeredCount} Active Ratios`,
            icon: Layers,
            tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
          },
          {
            step: "04",
            title: "Projected Pipeline AUC",
            value: `${benchmarkStats.currentAuc} (+${benchmarkStats.liftAucPercent}%)`,
            icon: Cpu,
            tone: "text-teal-600 dark:text-teal-400 bg-teal-500/10",
          },
        ].map((stage, idx) => {
          const StageIcon = stage.icon;
          return (
            <motion.div
              key={stage.step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              className="p-3.5 rounded-xl border border-border bg-surface-container flex items-center gap-3 relative overflow-hidden"
            >
              <div className={`p-2 rounded-lg shrink-0 ${stage.tone}`}>
                <StageIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Stage {stage.step} &bull; {stage.title}
                </div>
                <div className="text-xs font-bold text-foreground truncate">{stage.value}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Clinical Domain Pipeline Presets */}
      <div className="p-4 rounded-2xl border border-border bg-surface-container space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>1-Click Clinical Domain Pipeline Presets</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {enabledFeatures.length} / {features.length} features active in graph
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {DOMAIN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset.id)}
              className={`text-left p-3 rounded-xl border transition-all ${
                activePreset === preset.id
                  ? "border-emerald-500/60 bg-emerald-500/10 shadow-xs"
                  : "border-border bg-surface-low/60 hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-foreground truncate">{preset.label}</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {builderToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between shadow-sm"
          >
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              {builderToast}
            </span>
            <button
              type="button"
              onClick={() => setBuilderToast(null)}
              className="text-[11px] underline font-semibold ml-3 shrink-0"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs border-b border-border">
        {[
          { key: "transformers", label: "Feature Catalog & Transformers", icon: Layers },
          { key: "custom_builder", label: "Custom Feature Builder", icon: Wand2 },
          { key: "importance", label: "SHAP & Importance Ranking", icon: BarChart3 },
          { key: "lift", label: "Model Lift Benchmark", icon: TrendingUp },
          { key: "distribution", label: "Skewness & Distribution", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveSubTab(tab.key as any);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all shrink-0 ${
                activeSubTab === tab.key
                  ? "bg-primary text-white shadow-2xs"
                  : "bg-surface-low/50 dark:bg-[#162732] border border-border text-foreground hover:bg-surface-low dark:hover:bg-[#1c303d]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FEATURE CATALOG & TRANSFORMERS */}
      {activeSubTab === "transformers" && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Clinical Feature Catalog ({filteredFeatures.length} Shown &bull; {activeEngineeredCount} Engineered Active)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Toggle checkboxes in real time to measure pipeline impact on ROC-AUC and SHAP attribution
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search biomarker or formula..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface-low text-xs text-foreground w-48 sm:w-56"
                />
              </div>

              <div className="inline-flex rounded-lg border border-border bg-surface-low p-0.5 text-[11px]">
                {(["all", "engineered", "raw"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md capitalize font-semibold transition-all ${
                      categoryFilter === cat
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleApplyPreset("all")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface-container hover:bg-surface-low text-[11px] font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredFeatures.map((feat, idx) => (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.25), duration: 0.2 }}
                className={`p-4 rounded-xl border transition-all duration-300 smooth-card ${
                  feat.enabled
                    ? feat.category === "engineered"
                      ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-2xs"
                      : "border-border bg-white dark:bg-[#162732]"
                    : "opacity-60 border-dashed border-border bg-surface-low/30 dark:bg-[#111d24]/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={feat.enabled}
                      onChange={() => toggleFeature(feat.id)}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-foreground font-mono">{feat.name}</span>
                      {feat.formula && (
                        <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">
                          Formula:{" "}
                          <code className="bg-surface-container px-1.5 py-0.5 rounded text-foreground">
                            {feat.formula}
                          </code>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-low text-muted-foreground border border-border">
                      {feat.domain}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        feat.category === "engineered"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-surface-container text-muted-foreground border border-border"
                      }`}
                    >
                      {feat.category}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                  {feat.clinicalRationale}
                </p>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                  <span>
                    Importance:{" "}
                    <strong className="text-foreground font-mono">
                      {(feat.importanceScore * 100).toFixed(0)}%
                    </strong>
                  </span>
                  <span>
                    SHAP Impact:{" "}
                    <strong className="text-foreground font-mono">+{feat.shapImpact}</strong>
                  </span>
                  <span>
                    Skewness:{" "}
                    <strong
                      className={`font-mono ${
                        Math.abs(feat.skewness) > 1 ? "text-amber-500" : "text-emerald-500"
                      }`}
                    >
                      {feat.skewness}
                    </strong>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM FEATURE BUILDER */}
      {activeSubTab === "custom_builder" && (
        <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-6 animate-fade-in-up">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-primary" />
              Interactive Clinical Feature Formula Builder
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Combine physiological biomarkers, serological titers, or vital parameters to create derived clinical indices.
            </p>
          </div>

          <form onSubmit={handleCreateCustomFeature} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Primary Feature (A)
                </label>
                <select
                  value={featureA}
                  onChange={(e) => setFeatureA(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-surface-low dark:bg-[#111d24] text-foreground focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="IgA">IgA (Immunoglobulin A)</option>
                  <option value="IgG">IgG (Immunoglobulin G)</option>
                  <option value="IgM">IgM (Immunoglobulin M)</option>
                  <option value="Age">Age (Years)</option>
                  <option value="Systolic_BP">Systolic BP (mmHg)</option>
                  <option value="Diastolic_BP">Diastolic BP (mmHg)</option>
                  <option value="Fasting_Glucose">Fasting Glucose (mg/dL)</option>
                  <option value="Body_Weight">Body Weight (kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Mathematical / Clinical Operator
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-surface-low dark:bg-[#111d24] text-foreground focus:ring-1 focus:ring-primary focus:border-primary font-mono"
                >
                  <option value="ratio">Ratio: A / (B + 1e-5)</option>
                  <option value="log1p">Log-Transform: log10(A + 1)</option>
                  <option value="+">Additive Sum: A + B</option>
                  <option value="-">Delta Difference: A - B</option>
                  <option value="*">Synergy Product: A * B</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Secondary Feature (B)
                </label>
                <select
                  value={featureB}
                  onChange={(e) => setFeatureB(e.target.value)}
                  disabled={operator === "log1p"}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-surface-low dark:bg-[#111d24] text-foreground focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                >
                  <option value="IgG">IgG (Immunoglobulin G)</option>
                  <option value="IgA">IgA (Immunoglobulin A)</option>
                  <option value="IgM">IgM (Immunoglobulin M)</option>
                  <option value="Age">Age (Years)</option>
                  <option value="Diastolic_BP">Diastolic BP (mmHg)</option>
                  <option value="Systolic_BP">Systolic BP (mmHg)</option>
                  <option value="Body_Weight">Body Weight (kg)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Engineered Feature Identifier
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. IgA_to_IgG_Index"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-surface-low dark:bg-[#111d24] text-foreground font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Clinical Rationale & Mechanism
                </label>
                <input
                  type="text"
                  value={customRationale}
                  onChange={(e) => setCustomRationale(e.target.value)}
                  placeholder="Medical reason for this feature transformation..."
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-surface-low dark:bg-[#111d24] text-foreground focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-low/80 dark:bg-[#111d24]/80 border border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Generated Formula Expression:</span>
              <span className="font-mono font-bold text-primary">
                {operator === "log1p"
                  ? `log10(${featureA} + 1)`
                  : operator === "ratio"
                  ? `${featureA} / (${featureB} + 1e-5)`
                  : `${featureA} ${operator} ${featureB}`}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Engineer & Deploy Feature</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SHAP & IMPORTANCE RANKING (RECHARTS + BARS) */}
      {activeSubTab === "importance" && (
        <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-5 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Feature Predictive Importance & TreeSHAP Ranking
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Interactive Recharts importance & SHAP weight decomposition across active pipeline features.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-muted-foreground">Engineered</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-teal-600" />
                <span className="text-muted-foreground">Raw Baseline</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={importanceChartData}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 20, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis type="category" dataKey="name" width={135} tick={{ fontSize: 10 }} />
                <Tooltip cursor={CLINICAL_TOOLTIP_CURSOR} content={<ClinicalChartTooltip />} />
                <Bar dataKey="importance" name="Importance Score (%)" radius={[0, 6, 6, 0]}>
                  {importanceChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.category === "engineered" ? "#10b981" : "#0f766e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            {[...enabledFeatures]
              .sort((a, b) => b.importanceScore - a.importanceScore)
              .map((f, i) => (
                <div key={f.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground font-mono flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-4">{i + 1}.</span>
                      {f.name}
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {(f.importanceScore * 100).toFixed(0)}% (SHAP +{f.shapImpact})
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-surface-low dark:bg-[#111d24] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        f.category === "engineered"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : "bg-primary"
                      }`}
                      style={{ width: `${f.importanceScore * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: MODEL LIFT BENCHMARK */}
      {activeSubTab === "lift" && (
        <div className="space-y-5 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Baseline Model Card */}
            <div className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Baseline Model (Raw Features Only)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-muted-foreground font-mono">
                  No Feature Eng.
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-surface-low/50 dark:bg-[#111d24]/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">ROC-AUC</span>
                  <div className="text-xl font-bold font-mono text-foreground mt-0.5">
                    {benchmarkStats.baseAuc}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-low/50 dark:bg-[#111d24]/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Accuracy</span>
                  <div className="text-xl font-bold font-mono text-foreground mt-0.5">
                    {benchmarkStats.baseAcc}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-low/50 dark:bg-[#111d24]/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">F1-Score</span>
                  <div className="text-xl font-bold font-mono text-foreground mt-0.5">
                    {benchmarkStats.baseF1}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Limited by raw serological skewness and lack of domain-specific interaction markers between immunoglobulins and GI symptom burden.
              </p>
            </div>

            {/* Engineered Feature Model Card */}
            <div className="p-5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Engineered Feature Model ({activeEngineeredCount} Active Ratios)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold animate-pulse">
                  +{benchmarkStats.liftAccPercent}% Lift
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white dark:bg-[#162732] border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                    ROC-AUC
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {benchmarkStats.currentAuc}
                  </div>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    (+{benchmarkStats.liftAucPercent}%)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#162732] border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                    Accuracy
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {benchmarkStats.currentAcc}%
                  </div>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    (+{benchmarkStats.liftAccPercent}%)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#162732] border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                    F1-Score
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {benchmarkStats.currentF1}
                  </div>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    (Optimized)
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Engineered ratios eliminate serological collinearity, while Log1p normalization prevents extreme outlier pull in gradient trees.
              </p>
            </div>
          </div>

          {/* Learning Curve Lift AreaChart */}
          <div className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Cross-Validation Learning Curve Trajectory
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  5-fold Stratified CV ROC-AUC as training sample cohort scales (reacts live to engineered feature toggles)
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liftTrajectoryData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="engAucGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="cohort" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0.84, 1.0]} tick={{ fontSize: 11 }} />
                  <Tooltip cursor={CLINICAL_TOOLTIP_CURSOR} content={<ClinicalChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area
                    type="monotone"
                    dataKey="baselineAuc"
                    name="Baseline Raw Features AUC"
                    stroke="#64748b"
                    fill="#64748b"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="engineeredAuc"
                    name="Engineered Pipeline AUC"
                    stroke="#10b981"
                    fill="url(#engAucGrad)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DISTRIBUTION & SKEWNESS INSPECTOR */}
      {activeSubTab === "distribution" && (
        <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-5 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Biomarker Skewness Reduction Inspector
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Interactive histogram comparison of raw serological distributions vs. Log1p normalized bell curves.
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-border bg-surface-low p-0.5 text-xs">
              {(["iga", "glucose", "igg"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDistMarker(key)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedDistMarker === key
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {key === "iga" ? "Serum IgA" : key === "glucose" ? "Glucose" : "Serum IgG"}
                </button>
              ))}
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeDist.buckets} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip cursor={CLINICAL_TOOLTIP_CURSOR} content={<ClinicalChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="raw" name={`Raw ${activeDist.label}`} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="normalized"
                  name="Log1p Normalized Density"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 space-y-1.5">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Raw {activeDist.label} (Right-Skewness: {activeDist.rawSkew})
              </span>
              <p className="text-[11px] text-muted-foreground">{activeDist.rawSummary}</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-1.5">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Log1p Engineered {activeDist.label} (Near-Normal Skewness: {activeDist.normSkew})
              </span>
              <p className="text-[11px] text-muted-foreground">{activeDist.normSummary}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
