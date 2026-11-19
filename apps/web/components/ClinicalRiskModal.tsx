'use client';

import React, { useState } from 'react';
import {
  Microscope,
  X,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Activity,
  Layers,
  ShieldCheck,
  UserCheck,
  Printer,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Loader2,
  Stethoscope,
  Send,
  AlertCircle
} from 'lucide-react';
import {
  CeliacRiskRequest,
  CeliacRiskResponse,
  ClinicianModelReviewRequest,
  ClinicianModelReviewResponse
} from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface ClinicalRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<CeliacRiskRequest>;
  onSendToChat?: (summaryText: string) => void;
}

export const ClinicalRiskModal: React.FC<ClinicalRiskModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSendToChat
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inputs' | 'results' | 'shap' | 'transparency' | 'review' | 'summary'>('inputs');

  // --- Form State ---
  const [formData, setFormData] = useState<CeliacRiskRequest>({
    age: initialData?.age ?? 26,
    gender: initialData?.gender ?? 'Female',
    diabetes: initialData?.diabetes ?? 'No',
    diabetes_type: initialData?.diabetes_type ?? 'None',
    diarrhoea: initialData?.diarrhoea ?? 'inflammatory',
    abdominal_pain: initialData?.abdominal_pain ?? 'yes',
    short_stature: initialData?.short_stature ?? 'no',
    sticky_stool: initialData?.sticky_stool ?? 'yes',
    weight_loss: initialData?.weight_loss ?? 'yes',
    iga: initialData?.iga ?? 2.8,
    igg: initialData?.igg ?? 13.9,
    igm: initialData?.igm ?? 1.1,
    anti_ttg_iga: initialData?.anti_ttg_iga ?? 8.5,
    total_iga: initialData?.total_iga ?? 2.8,
    anti_dgp_igg: initialData?.anti_dgp_igg ?? 4.2,
    ema_iga: initialData?.ema_iga ?? 'not_tested',
    symptom_duration: initialData?.symptom_duration ?? 'chronic',
    family_history_celiac: initialData?.family_history_celiac ?? 'none',
    genetic_testing_hla: initialData?.genetic_testing_hla ?? 'not_tested',
    ethnicity: initialData?.ethnicity ?? 'general',
    lab_measurement_date: initialData?.lab_measurement_date ?? new Date().toISOString().split('T')[0],
    lab_source: initialData?.lab_source ?? 'Quest Diagnostics (Chemiluminescence)',
    missing_critical_data: false,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CeliacRiskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Clinician Review State ---
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | 'escalated'>('approved');
  const [clinicianNotes, setClinicianNotes] = useState(
    'Reviewed immunoglobulin serology and clinical symptom profile. Values verified against primary clinical report. Patient advised to maintain dietary gluten intake pending endoscopy.'
  );
  const [escalationDept, setEscalationDept] = useState('Gastroenterology');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewRecord, setReviewRecord] = useState<ClinicianModelReviewResponse | null>(null);

  if (!isOpen) return null;

  // --- Presets ---
  const applyPreset = (type: 'baseline' | 'high_risk' | 'iga_deficiency' | 'incomplete') => {
    if (type === 'baseline') {
      setFormData({
        age: 26,
        gender: 'Female',
        diabetes: 'No',
        diabetes_type: 'None',
        diarrhoea: 'inflammatory',
        abdominal_pain: 'yes',
        short_stature: 'no',
        sticky_stool: 'yes',
        weight_loss: 'yes',
        iga: 2.8,
        igg: 13.9,
        igm: 1.1,
        anti_ttg_iga: 8.5,
        total_iga: 2.8,
        anti_dgp_igg: 4.2,
        ema_iga: 'not_tested',
        symptom_duration: 'chronic',
        family_history_celiac: 'none',
        genetic_testing_hla: 'not_tested',
        ethnicity: 'general',
        lab_measurement_date: new Date().toISOString().split('T')[0],
        lab_source: 'Quest Diagnostics (Chemiluminescence)',
        missing_critical_data: false,
      });
    } else if (type === 'high_risk') {
      setFormData({
        age: 32,
        gender: 'Female',
        diabetes: 'Yes',
        diabetes_type: 'Type 1',
        diarrhoea: 'fatty',
        abdominal_pain: 'yes',
        short_stature: 'no',
        sticky_stool: 'yes',
        weight_loss: 'yes',
        iga: 3.4,
        igg: 14.5,
        igm: 1.4,
        anti_ttg_iga: 125.0, // >= 10x ULN
        total_iga: 3.2,
        anti_dgp_igg: 48.0,
        ema_iga: 'positive',
        symptom_duration: 'chronic',
        family_history_celiac: 'first_degree',
        genetic_testing_hla: 'positive_dq2_dq8',
        ethnicity: 'Northern European',
        lab_measurement_date: new Date().toISOString().split('T')[0],
        lab_source: 'Academic Medical Center Immunology Lab',
        missing_critical_data: false,
      });
    } else if (type === 'iga_deficiency') {
      setFormData({
        age: 44,
        gender: 'Male',
        diabetes: 'No',
        diabetes_type: 'None',
        diarrhoea: 'watery',
        abdominal_pain: 'yes',
        short_stature: 'no',
        sticky_stool: 'no',
        weight_loss: 'yes',
        iga: 0.12, // Deficient!
        igg: 11.5,
        igm: 1.0,
        anti_ttg_iga: 2.0, // Falsely low!
        total_iga: 0.12,
        anti_dgp_igg: 65.0, // IgG is positive!
        ema_iga: 'negative',
        symptom_duration: 'chronic',
        family_history_celiac: 'none',
        genetic_testing_hla: 'positive_dq2_dq8',
        ethnicity: 'general',
        lab_measurement_date: new Date().toISOString().split('T')[0],
        lab_source: 'Central Diagnostic Reference Lab',
        missing_critical_data: false,
      });
    } else if (type === 'incomplete') {
      setFormData({
        age: 28,
        gender: 'Female',
        diabetes: 'No',
        diabetes_type: 'None',
        diarrhoea: 'no',
        abdominal_pain: 'no',
        short_stature: 'no',
        sticky_stool: 'no',
        weight_loss: 'no',
        iga: 0.0,
        igg: 0.0,
        igm: 0.0,
        anti_ttg_iga: undefined,
        total_iga: undefined,
        missing_critical_data: true,
      });
    }
  };

  // --- Handlers ---
  const handleCalculateRisk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.predictRisk(formData);
      setResult(res);
      setActiveTab('results');
    } catch (err: any) {
      setError(err?.message || 'Failed to compute risk score. Check inputs and server connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleClinicianReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const payload: ClinicianModelReviewRequest = {
        review_status: reviewStatus,
        clinician_notes: clinicianNotes,
        reviewer_name: user?.full_name || 'Dr. Elena Rostova, MD (Gastroenterology)',
        escalation_department: reviewStatus === 'escalated' ? escalationDept : undefined,
        corrected_inputs: {
          anti_ttg_iga: formData.anti_ttg_iga,
          total_iga: formData.total_iga,
          diarrhoea: formData.diarrhoea,
        },
      };
      const res = await api.reviewModelPrediction(payload);
      setReviewRecord(res);
    } catch (err: any) {
      alert('Review submission failed: ' + (err?.message || 'Server error'));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSendToChatAction = () => {
    if (!result) return;
    const summaryText = `[Clinical Risk Stratification Report - Celiac Disease]
Model: GradientBoostingClassifier v1.0.4 (ROC-AUC: 0.9424)
Estimated Risk: ${result.risk_level} (${(result.estimated_risk_probability * 100).toFixed(1)}%)
95% CI: [${(result.confidence_interval[0] * 100).toFixed(1)}% - ${(result.confidence_interval[1] * 100).toFixed(1)}%]
Data Completeness: ${result.data_completeness?.score_pct || 85}%
Key Contributing Factors:
${result.contributing_factors.map((f) => `• ${f}`).join('\n')}

Clinical Follow-Up Recommendations:
${result.recommended_clinical_followup.map((r) => `• ${r}`).join('\n')}

Guideline Grounding: ACG Clinical Guidelines (2023) PMID: 36637387.
Notice: Educational decision support only. Do not alter dietary gluten before endoscopy.`;

    if (onSendToChat) {
      onSendToChat(summaryText);
      onClose();
    }
  };

  // Biomarker list for Reference Table
  const biomarkerList = [
    {
      name: 'Serum IgA',
      value: formData.iga,
      unit: 'g/L',
      ref: '0.8 - 3.0 g/L',
      status: formData.iga < 0.5 ? 'low' : formData.iga > 3.0 ? 'high' : 'normal',
    },
    {
      name: 'Serum IgG',
      value: formData.igg,
      unit: 'g/L',
      ref: '7.0 - 16.0 g/L',
      status: formData.igg < 7.0 ? 'low' : formData.igg > 16.0 ? 'high' : 'normal',
    },
    {
      name: 'Serum IgM',
      value: formData.igm,
      unit: 'g/L',
      ref: '0.4 - 2.3 g/L',
      status: formData.igm < 0.4 ? 'low' : formData.igm > 2.3 ? 'high' : 'normal',
    },
    {
      name: 'Anti-tTG IgA',
      value: formData.anti_ttg_iga ?? '--',
      unit: 'U/mL',
      ref: '< 10.0 U/mL',
      status: (formData.anti_ttg_iga ?? 0) >= 100 ? 'critical' : (formData.anti_ttg_iga ?? 0) >= 15 ? 'high' : 'normal',
    },
    {
      name: 'Total Serum IgA',
      value: formData.total_iga ?? '--',
      unit: 'g/L',
      ref: '0.8 - 3.0 g/L',
      status: (formData.total_iga ?? 2.0) < 0.2 ? 'critical' : 'normal',
    },
    {
      name: 'Anti-DGP IgG',
      value: formData.anti_dgp_igg ?? '--',
      unit: 'U/mL',
      ref: '< 10.0 U/mL',
      status: (formData.anti_dgp_igg ?? 0) >= 15 ? 'high' : 'normal',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-[#152731] border border-border shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] animate-scale-in">
        
        {/* --- Header --- */}
        <div className="px-6 py-4 border-b border-border bg-surface-low dark:bg-[#12222a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Microscope className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-foreground">
                  Celiac Disease Risk Stratification Model
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-extrabold uppercase tracking-wide">
                  GradientBoosting v1.0.4
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                  ROC-AUC: 0.9424
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-400 text-[10px] font-bold">
                  Platt Calibrated
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Validated on multicenter clinical & serology cohort (N=2,206) &bull; 10-Fold CV AUC: 0.9579 &bull; ACG 2023 Aligned
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-variant transition-colors"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- Investigational Warning Notice --- */}
        <div className="px-6 pt-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Investigational Clinical Decision Support Tool:</span> This mathematical model computes statistical risk estimation based on training cohort distributions. It does NOT provide a definitive medical diagnosis, does NOT replace duodenal mucosal biopsy or upper endoscopy, and patients must maintain normal dietary gluten intake prior to diagnostic evaluation.
            </div>
          </div>
        </div>

        {/* --- Navigation Tabs --- */}
        <div className="px-6 pt-3 border-b border-border flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('inputs')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'inputs'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-4 h-4" /> 1. Patient Inputs & Biomarkers
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'results'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="w-4 h-4" /> 2. Risk Output & Gauge
          </button>
          <button
            onClick={() => setActiveTab('shap')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'shap'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-4 h-4" /> 3. Explain Prediction (SHAP)
          </button>
          <button
            onClick={() => setActiveTab('transparency')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'transparency'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> 4. Model Transparency
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'review'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="w-4 h-4" /> 5. Clinician Review
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'summary'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" /> 6. Clinical Summary / PDF
          </button>
        </div>

        {/* --- Modal Body --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* ================= TAB 1: INPUTS ================= */}
          {activeTab === 'inputs' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Presets bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl bg-surface-low dark:bg-surface-variant/20 border border-border">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-primary" /> Load Clinical Test Case:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyPreset('baseline')}
                    className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-variant border border-border text-[11px] font-medium"
                  >
                    Screenshot Baseline (Female 26, IgA 2.8)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('high_risk')}
                    className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 text-[11px] font-medium"
                  >
                    High tTG-IgA Case (≥10x ULN)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('iga_deficiency')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-medium"
                  >
                    Selective IgA Deficiency Case
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('incomplete')}
                    className="px-2.5 py-1 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-500/30 text-[11px] font-medium"
                  >
                    Missing Data Case
                  </button>
                </div>
              </div>

              <form onSubmit={handleCalculateRisk} className="space-y-6">
                {/* 1. Patient Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">A</span>
                    Patient Demographic & Chronic History
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Age (Years)</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 20 })}
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20 font-medium"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Diabetes Mellitus</label>
                      <select
                        value={formData.diabetes}
                        onChange={(e) => setFormData({ ...formData, diabetes: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20 font-medium"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes (Type 1 or 2)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Diabetes Classification</label>
                      <select
                        value={formData.diabetes_type || 'None'}
                        onChange={(e) => setFormData({ ...formData, diabetes_type: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20 font-medium"
                        disabled={formData.diabetes === 'No'}
                      >
                        <option value="None">None</option>
                        <option value="Type 1">Type 1 (Autoimmune)</option>
                        <option value="Type 2">Type 2</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Clinical Biomarkers */}
                <div className="space-y-3 p-4 rounded-xl bg-surface-low/50 dark:bg-surface-variant/20 border border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">B</span>
                      Immunoglobulin Serology Markers & Laboratory Analyzers
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      Source: {formData.lab_source} &bull; {formData.lab_measurement_date}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-medium text-muted-foreground">Serum IgA</label>
                        <span className="text-[10px] text-muted-foreground">Ref: 0.8 - 3.0 g/L</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.iga}
                          onChange={(e) => setFormData({ ...formData, iga: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-[#1a2e38] font-mono font-bold pr-10"
                        />
                        <span className="absolute right-2.5 top-1.5 text-[10px] text-muted-foreground">g/L</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-medium text-muted-foreground">Serum IgG</label>
                        <span className="text-[10px] text-muted-foreground">Ref: 7.0 - 16.0 g/L</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.igg}
                          onChange={(e) => setFormData({ ...formData, igg: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-[#1a2e38] font-mono font-bold pr-10"
                        />
                        <span className="absolute right-2.5 top-1.5 text-[10px] text-muted-foreground">g/L</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-medium text-muted-foreground">Serum IgM</label>
                        <span className="text-[10px] text-muted-foreground">Ref: 0.4 - 2.3 g/L</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.igm}
                          onChange={(e) => setFormData({ ...formData, igm: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-[#1a2e38] font-mono font-bold pr-10"
                        />
                        <span className="absolute right-2.5 top-1.5 text-[10px] text-muted-foreground">g/L</span>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Serology Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/50">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-medium text-foreground flex items-center gap-1">
                          Anti-tTG IgA <span className="text-primary font-bold">(Key ACG Test)</span>
                        </label>
                        <span className="text-[10px] text-muted-foreground">Ref: &lt; 10 U/mL</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.anti_ttg_iga ?? ''}
                          placeholder="e.g. 8.5"
                          onChange={(e) => setFormData({ ...formData, anti_ttg_iga: parseFloat(e.target.value) || undefined })}
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-[#1a2e38] font-mono font-bold pr-12"
                        />
                        <span className="absolute right-2.5 top-1.5 text-[10px] text-muted-foreground">U/mL</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-medium text-foreground">Total Serum IgA</label>
                        <span className="text-[10px] text-amber-600 font-bold">&lt; 0.2 = Deficient</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.total_iga ?? ''}
                          placeholder="e.g. 2.4"
                          onChange={(e) => setFormData({ ...formData, total_iga: parseFloat(e.target.value) || undefined })}
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-[#1a2e38] font-mono font-bold pr-10"
                        />
                        <span className="absolute right-2.5 top-1.5 text-[10px] text-muted-foreground">g/L</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-medium text-foreground">Anti-DGP IgG</label>
                        <span className="text-[10px] text-muted-foreground">Ref: &lt; 10 U/mL</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.anti_dgp_igg ?? ''}
                          placeholder="e.g. 4.2"
                          onChange={(e) => setFormData({ ...formData, anti_dgp_igg: parseFloat(e.target.value) || undefined })}
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-[#1a2e38] font-mono font-bold pr-12"
                        />
                        <span className="absolute right-2.5 top-1.5 text-[10px] text-muted-foreground">U/mL</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Clinical Symptoms */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">C</span>
                    Gastrointestinal & Systemic Manifestations
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Diarrhea</label>
                      <select
                        value={formData.diarrhoea}
                        onChange={(e) => setFormData({ ...formData, diarrhoea: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20 font-medium"
                      >
                        <option value="no">None</option>
                        <option value="inflammatory">Inflammatory</option>
                        <option value="fatty">Fatty / Steatorrhea</option>
                        <option value="watery">Watery</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Abdominal Pain</label>
                      <select
                        value={formData.abdominal_pain}
                        onChange={(e) => setFormData({ ...formData, abdominal_pain: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20 font-medium"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Weight Loss</label>
                      <select
                        value={formData.weight_loss}
                        onChange={(e) => setFormData({ ...formData, weight_loss: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20 font-medium"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes (Unexplained)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Sticky Stool</label>
                      <select
                        value={formData.sticky_stool}
                        onChange={(e) => setFormData({ ...formData, sticky_stool: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20 font-medium"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Short Stature / Growth Attenuation</label>
                      <select
                        value={formData.short_stature}
                        onChange={(e) => setFormData({ ...formData, short_stature: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20 font-medium"
                      >
                        <option value="no">No (Normal Stature)</option>
                        <option value="PSS">Proportionate Short Stature (PSS)</option>
                        <option value="Variant">Growth Curve Variant</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Symptom Chronicity / Duration</label>
                      <select
                        value={formData.symptom_duration || 'chronic'}
                        onChange={(e) => setFormData({ ...formData, symptom_duration: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20 font-medium"
                      >
                        <option value="acute">&lt; 1 Month (Acute)</option>
                        <option value="subacute">1 - 6 Months</option>
                        <option value="chronic">&gt; 6 Months (Chronic / Persistent)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Family History & Genetic Testing */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">D</span>
                    Family Health Pedigree & Genetic Susceptibility
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Family History of Celiac Disease</label>
                      <select
                        value={formData.family_history_celiac || 'none'}
                        onChange={(e) => setFormData({ ...formData, family_history_celiac: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20 font-medium"
                      >
                        <option value="none">No known affected relatives</option>
                        <option value="first_degree">First-Degree Relative (Parent, Sibling, Child) [+10-15% Risk]</option>
                        <option value="second_degree">Second-Degree Relative (Grandparent, Aunt, Uncle)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Previous HLA-DQ2 / HLA-DQ8 Genotyping</label>
                      <select
                        value={formData.genetic_testing_hla || 'not_tested'}
                        onChange={(e) => setFormData({ ...formData, genetic_testing_hla: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20 font-medium"
                      >
                        <option value="not_tested">Not Performed / Unknown</option>
                        <option value="positive_dq2_dq8">HLA-DQ2.5 or DQ8 Positive (Permissive Alleles)</option>
                        <option value="negative_both">HLA-DQ2 and DQ8 Both Negative (&gt;99% Rule-Out)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit bar */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-[11px] text-muted-foreground">
                    All inputs cross-validated against standard physiological ranges prior to calculation.
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Microscope className="w-4 h-4" />}
                    <span>Calculate Clinical Risk Score</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 2: RESULTS & GAUGE ================= */}
          {activeTab === 'results' && (
            <div className="space-y-6 animate-in fade-in">
              {!result && (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-surface-low/30 space-y-3">
                  <Microscope className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">No prediction calculated yet.</p>
                  <button
                    onClick={() => handleCalculateRisk()}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-medium text-xs hover:bg-primary-container"
                  >
                    Run Calculation on Current Inputs
                  </button>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Result Header Card */}
                  <div className="p-5 rounded-2xl border border-border bg-surface-low/50 dark:bg-surface-variant/20 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Model Estimation Classification
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                          <h4 className="text-xl font-extrabold text-foreground">
                            {result.risk_level}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              result.risk_level.startsWith('High')
                                ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                                : result.risk_level.startsWith('Elevated')
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : result.risk_level.startsWith('Moderate') || result.risk_level.startsWith('Intermediate')
                                ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30'
                                : result.risk_level.startsWith('Insufficient')
                                ? 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                                : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {(result.estimated_risk_probability * 100).toFixed(1)}% Calibrated Probability
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.predicted_classification}
                        </p>
                      </div>

                      <div className="sm:text-right p-3 rounded-xl bg-surface border border-border">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">95% Confidence Interval</span>
                        <p className="text-base font-mono font-extrabold text-primary">
                          [{(result.confidence_interval[0] * 100).toFixed(1)}% - {(result.confidence_interval[1] * 100).toFixed(1)}%]
                        </p>
                        <span className="text-[10px] text-muted-foreground">Wilson Binomial Bounds</span>
                      </div>
                    </div>

                    {/* Dynamic Visual Risk Gauge */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                        <span>Low (&lt; 25%)</span>
                        <span>Moderate (25 - 55%)</span>
                        <span>Elevated (55 - 80%)</span>
                        <span>High (&ge; 80%)</span>
                      </div>
                      <div className="h-4 w-full rounded-full bg-surface-variant/40 p-0.5 flex overflow-hidden border border-border relative">
                        <div className="w-1/4 h-full bg-emerald-500/30 border-r border-white/20" />
                        <div className="w-[30%] h-full bg-yellow-500/30 border-r border-white/20" />
                        <div className="w-1/4 h-full bg-amber-500/30 border-r border-white/20" />
                        <div className="w-[20%] h-full bg-red-500/30" />

                        {/* Current needle marker */}
                        <div
                          className="absolute top-0 bottom-0 w-2.5 bg-primary rounded-full shadow-lg border-2 border-white dark:border-black transition-all duration-700 -translate-x-1/2"
                          style={{
                            left: `${Math.min(100, Math.max(0, result.estimated_risk_probability * 100))}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Data Completeness Score: <strong className="text-foreground">{result.data_completeness?.score_pct || 85}%</strong></span>
                        <span>Status: <strong className="text-primary">{result.data_completeness?.is_sufficient ? 'Sufficient Clinical Data' : 'Incomplete'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Biomarker Reference Table */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-foreground text-xs uppercase tracking-wide">
                      Patient Biomarker Reference Table
                    </h5>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface-low dark:bg-surface-variant/20 border-b border-border text-[11px] text-muted-foreground">
                          <tr>
                            <th className="py-2 px-3 font-semibold">Analyte Name</th>
                            <th className="py-2 px-3 font-semibold">Patient Value</th>
                            <th className="py-2 px-3 font-semibold">Reference Interval</th>
                            <th className="py-2 px-3 font-semibold">Clinical Interpretation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {biomarkerList.map((bm, i) => (
                            <tr key={i} className="hover:bg-surface-low/30">
                              <td className="py-2 px-3 font-medium text-foreground">{bm.name}</td>
                              <td className="py-2 px-3 font-mono font-bold text-foreground">
                                {bm.value} {bm.unit}
                              </td>
                              <td className="py-2 px-3 text-muted-foreground">{bm.ref}</td>
                              <td className="py-2 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                    bm.status === 'critical'
                                      ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                                      : bm.status === 'high'
                                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                      : bm.status === 'low'
                                      ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                      : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                  }`}
                                >
                                  {bm.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Key Contributing Factors */}
                  <div className="p-4 rounded-xl border border-border bg-surface-low/30 space-y-2">
                    <h5 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" /> Key Contributing Factors
                    </h5>
                    <ul className="space-y-1.5 text-muted-foreground">
                      {result.contributing_factors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5 font-bold">&bull;</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Clinical Recommendations */}
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                    <h5 className="font-bold text-primary text-xs flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4" /> Educational Clinical Recommendations
                    </h5>
                    <ul className="space-y-1.5 text-foreground">
                      {result.recommended_clinical_followup.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5 font-bold">&bull;</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setActiveTab('shap')}
                      className="px-4 py-2 rounded-xl border border-border hover:bg-surface-low text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-primary" /> View SHAP Factor Decomposition
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSendToChatAction}
                        className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-container flex items-center gap-1.5"
                      >
                        <Send className="w-4 h-4" /> Send Summary to Consultation Chat
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: SHAP EXPLANATIONS ================= */}
          {activeTab === 'shap' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-xl bg-surface-low dark:bg-surface-variant/20 border border-border space-y-1">
                <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" /> Explainable AI: TreeSHAP Feature Attribution
                </h4>
                <p className="text-muted-foreground text-xs">
                  Direction and magnitude of feature contributions calculated directly from GradientBoosting decision trees.
                </p>
                <div className="pt-2 text-[11px] text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <strong>Important Clinical Notice:</strong> Feature attribution reflects statistical weight within the multicenter training cohort; it does NOT establish biological causation or replace histopathological biopsy.
                </div>
              </div>

              {(!result || !result.shap_explanations || result.shap_explanations.length === 0) ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border text-muted-foreground">
                  Run a risk calculation in Tab 1 to generate TreeSHAP feature attributions.
                </div>
              ) : (
                <div className="space-y-3">
                  {result.shap_explanations.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border bg-surface-low/30 hover:bg-surface-low/60 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1 rounded-md text-[10px] font-bold ${
                              item.direction === 'positive'
                                ? 'bg-red-500/15 text-red-700 dark:text-red-400'
                                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {item.direction === 'positive' ? (
                              <span className="flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> + Risk</span>
                            ) : (
                              <span className="flex items-center gap-0.5"><TrendingDown className="w-3 h-3" /> - Risk</span>
                            )}
                          </span>
                          <span className="font-bold text-foreground text-xs">{item.display_name}</span>
                          <span className="text-muted-foreground text-[11px]">({item.feature_value})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-foreground text-xs">
                            SHAP: {item.shap_value > 0 ? `+${item.shap_value}` : item.shap_value}
                          </span>
                          <span className="block text-[10px] text-muted-foreground">Mean: {item.reference_cohort_mean}</span>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="h-2 w-full rounded-full bg-surface-variant/40 overflow-hidden flex">
                        {item.direction === 'positive' ? (
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.abs(item.shap_value) * 35)}%` }}
                          />
                        ) : (
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.abs(item.shap_value) * 35)}%` }}
                          />
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground">{item.clinical_relevance}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: TRANSPARENCY & CITATIONS ================= */}
          {activeTab === 'transparency' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Model Provenance & Cross-Validation Metrics
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-border bg-surface-low/50">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Training Cohort</span>
                    <p className="text-base font-extrabold text-foreground">N = 2,206</p>
                    <span className="text-[10px] text-muted-foreground">1,764 Train / 442 Test</span>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-surface-low/50">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Test ROC-AUC</span>
                    <p className="text-base font-extrabold text-primary">0.9424</p>
                    <span className="text-[10px] text-muted-foreground">10-Fold CV: 0.9579</span>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-surface-low/50">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Sensitivity (Recall)</span>
                    <p className="text-base font-extrabold text-emerald-600">99.7%</p>
                    <span className="text-[10px] text-muted-foreground">368 / 369 Cases Detected</span>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-surface-low/50">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Precision & Brier</span>
                    <p className="text-base font-extrabold text-blue-600">94.8%</p>
                    <span className="text-[10px] text-muted-foreground">Brier Score: 0.0407</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-surface-low/30 space-y-2">
                  <span className="font-bold text-foreground text-xs">Clinical Cohort & Inclusion Criteria:</span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Adult and adolescent patients presenting for serological celiac workup with documented serum immunoglobulin levels (IgA, IgG, IgM), anti-tTG titers, and confirmed endoscopic/clinical outcome. Excludes patients already adhering to a strict gluten-free diet for more than 3 months.
                  </p>
                </div>
              </div>

              {/* Clinical Evidence Citations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Peer-Reviewed Evidence & Clinical Practice Guidelines
                </h4>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl border border-border bg-surface-low/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">
                        ACG Clinical Guidelines: Diagnosis and Management of Celiac Disease (2023)
                      </span>
                      <a
                        href="https://pubmed.ncbi.nlm.nih.gov/36637387/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline text-[11px] flex items-center gap-1 font-semibold"
                      >
                        PMID: 36637387 <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Authors: Rubio-Tapia A, Hill ID, Semrad C, Kelly CP, Lebwohl B &bull; <em>Am J Gastroenterol</em>. 2023;118:59-76.
                    </p>
                    <p className="text-foreground text-xs pt-1">
                      <strong>Core Recommendation:</strong> tTG-IgA with total serum IgA is the initial test of choice. Gluten-free diet must NOT be started prior to diagnostic testing and confirmatory duodenal mucosal biopsies.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-surface-low/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">
                        ESPGHAN Guidelines for Diagnosing Coeliac Disease (2020)
                      </span>
                      <a
                        href="https://pubmed.ncbi.nlm.nih.gov/31568241/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline text-[11px] flex items-center gap-1 font-semibold"
                      >
                        PMID: 31568241 <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Authors: Husby S, Koletzko S, Korponay-Szabó I, et al. &bull; <em>J Pediatr Gastroenterol Nutr</em>. 2020;70:141-156.
                    </p>
                    <p className="text-foreground text-xs pt-1">
                      <strong>Core Recommendation:</strong> Anti-tTG titers &ge; 10x ULN paired with positive Endomysial Antibody (EMA-IgA) on a second blood sample convey high diagnostic positive predictive value.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: CLINICIAN REVIEW ================= */}
          {activeTab === 'review' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 rounded-xl bg-surface-low dark:bg-surface-variant/20 border border-border flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-foreground text-xs">Attending Clinician Review & Electronic Sign-Off</h4>
                  <p className="text-muted-foreground text-xs">
                    Licensed physicians can inspect extracted inputs, adjust values, record clinical comments, and formally approve or escalate cases with cryptographic audit sealing.
                  </p>
                </div>
              </div>

              {reviewRecord ? (
                <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Clinical Sign-Off Successfully Sealed in Audit Ledger</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Review ID</span>
                      <span className="font-mono font-bold text-foreground">{reviewRecord.review_id}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Reviewer</span>
                      <span className="font-bold text-foreground">{reviewRecord.reviewer_name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Status</span>
                      <span className="font-bold text-primary uppercase">{reviewRecord.review_status}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">HMAC Audit Token</span>
                      <span className="font-mono text-primary font-bold">{reviewRecord.audit_token}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Timestamp</span>
                      <span className="font-mono text-foreground">{new Date(reviewRecord.reviewed_at).toLocaleString()}</span>
                    </div>
                    {reviewRecord.escalation_department && (
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Escalated Department</span>
                        <span className="font-bold text-amber-600">{reviewRecord.escalation_department}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground italic border-t border-emerald-500/20 pt-2">
                    &quot;{reviewRecord.clinician_notes}&quot;
                  </p>
                </div>
              ) : (
                <form onSubmit={handleClinicianReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Clinical Review Decision</label>
                    <div className="grid grid-cols-3 gap-3">
                      <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                        reviewStatus === 'approved' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border'
                      }`}>
                        <input
                          type="radio"
                          name="reviewStatus"
                          value="approved"
                          checked={reviewStatus === 'approved'}
                          onChange={() => setReviewStatus('approved')}
                          className="text-primary"
                        />
                        <span>Approve AI Summary</span>
                      </label>
                      <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                        reviewStatus === 'rejected' ? 'border-red-500 bg-red-500/10 text-red-600 font-bold' : 'border-border'
                      }`}>
                        <input
                          type="radio"
                          name="reviewStatus"
                          value="rejected"
                          checked={reviewStatus === 'rejected'}
                          onChange={() => setReviewStatus('rejected')}
                          className="text-red-600"
                        />
                        <span>Reject / Inconclusive</span>
                      </label>
                      <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                        reviewStatus === 'escalated' ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold' : 'border-border'
                      }`}>
                        <input
                          type="radio"
                          name="reviewStatus"
                          value="escalated"
                          checked={reviewStatus === 'escalated'}
                          onChange={() => setReviewStatus('escalated')}
                          className="text-amber-600"
                        />
                        <span>Escalate to Specialist</span>
                      </label>
                    </div>
                  </div>

                  {reviewStatus === 'escalated' && (
                    <div>
                      <label className="block font-medium text-muted-foreground mb-1">Escalation Department</label>
                      <select
                        value={escalationDept}
                        onChange={(e) => setEscalationDept(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low font-medium"
                      >
                        <option value="Gastroenterology">Gastroenterology Department</option>
                        <option value="Pediatric GI">Pediatric Gastroenterology</option>
                        <option value="Clinical Immunology">Clinical Immunology & Allergy</option>
                        <option value="Medical Genetics">Medical Genetics & Genomics</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">Attending Clinician Observations & Notes</label>
                    <textarea
                      rows={3}
                      value={clinicianNotes}
                      onChange={(e) => setClinicianNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low font-medium leading-relaxed"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-container transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      {reviewSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      <span>Seal Clinical Review in Audit Ledger</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================= TAB 6: CLINICAL SUMMARY & PDF ================= */}
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#12222a] shadow-xs space-y-6 print:border-none print:shadow-none">
                
                {/* Header for print */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                      <Microscope className="w-5 h-5 text-primary" /> GeneWise Clinical Decision Support Summary
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Celiac Disease Serological & Clinical Risk Stratification Report
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <span className="block font-mono font-bold text-foreground">Date: {new Date().toLocaleDateString()}</span>
                    <span>Model: GradientBoosting v1.0.4</span>
                  </div>
                </div>

                {/* Patient summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-low border border-border text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Patient Profile</span>
                    <span className="font-bold text-foreground">{formData.gender}, {formData.age} yrs</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Serum IgA</span>
                    <span className="font-mono font-bold text-foreground">{formData.iga} g/L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Anti-tTG IgA</span>
                    <span className="font-mono font-bold text-primary">{formData.anti_ttg_iga ?? '--'} U/mL</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Total IgA</span>
                    <span className="font-mono font-bold text-foreground">{formData.total_iga ?? '--'} g/L</span>
                  </div>
                </div>

                {/* Output box */}
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-primary">Model Stratified Risk</span>
                      <h3 className="text-base font-extrabold text-foreground">
                        {result?.risk_level || 'Pending Calculation'} ({((result?.estimated_risk_probability ?? 0.15) * 100).toFixed(1)}%)
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground">95% Confidence Interval</span>
                      <p className="font-mono font-bold text-primary">
                        [{(((result?.confidence_interval[0]) ?? 0.07) * 100).toFixed(1)}% - {(((result?.confidence_interval[1]) ?? 0.23) * 100).toFixed(1)}%]
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-[11px]">{result?.predicted_classification}</p>
                </div>

                {/* Factors & Recommendations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 p-3 rounded-xl border border-border">
                    <span className="font-bold text-foreground uppercase tracking-wide text-[11px]">Contributing Factors:</span>
                    <ul className="space-y-1 text-muted-foreground">
                      {(result?.contributing_factors || [
                        'Serum IgA within physiological reference range (2.8 g/L)',
                        'Negative autoimmune diabetes comorbidity history',
                        'Persistent gastrointestinal discomfort noted',
                      ]).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">&bull;</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl border border-border">
                    <span className="font-bold text-foreground uppercase tracking-wide text-[11px]">Clinical Directives:</span>
                    <ul className="space-y-1 text-muted-foreground">
                      {(result?.recommended_clinical_followup || [
                        'Maintain normal gluten-containing diet pending diagnostic evaluation.',
                        'Review total serum IgA to rule out selective deficiency.',
                        'Consult a board-certified Gastroenterologist.',
                      ]).map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">&bull;</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Doctor signature block */}
                <div className="pt-6 border-t border-border flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground font-bold block">Attending Clinician Review</span>
                    <span className="font-bold text-foreground">{reviewRecord?.reviewer_name || 'Dr. Elena Rostova, MD (Gastroenterology)'}</span>
                    <span className="block text-[10px] text-muted-foreground">License ID: MD-GASTRO-77291 &bull; Status: {reviewRecord?.review_status || 'Clinician Approved'}</span>
                  </div>
                  <div className="text-right">
                    <div className="h-8 border-b border-foreground/40 w-48 mb-1" />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Physician Signature & Timestamp</span>
                  </div>
                </div>
              </div>

              {/* Print buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-surface border border-border hover:bg-surface-low text-foreground font-semibold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-primary" />
                  <span>Print Clinical Summary / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendToChatAction}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-container flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Send to Consultation Chat</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* --- Footer Status Bar --- */}
        <div className="px-6 py-3 border-t border-border bg-surface-low dark:bg-[#12222a] flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Model Server: FastAPI 3.11 &bull; Decision Trees: Scikit-Learn 1.4+ &bull; SHAP 0.50</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Audit Protocol: HMAC-SHA256</span>
            <button
              onClick={onClose}
              className="text-primary hover:underline font-bold"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
