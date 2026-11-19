"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Heart,
  HelpCircle,
  Info,
  Pill,
  Plus,
  Printer,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { PreconceptionPlan } from "../types";
import { api } from "@/lib/api";

const WIZARD_SECTIONS = [
  {
    id: "ancestry_consanguinity",
    title: "Ancestral Origins & Consanguinity",
    description: "Certain ethnic and geographical backgrounds carry higher carrier prevalence for recessive conditions.",
    questions: [
      {
        id: "q_consanguinity",
        label: "Are you and your reproductive partner biologically related by blood (e.g., first or second cousins)?",
        clinical_significance: "Consanguinity increases the statistical baseline sharing of recessive alleles.",
      },
      {
        id: "q_ancestry_origins",
        label: "Do either of you have ancestry from Mediterranean, Southeast Asian, Middle Eastern, or African regions?",
        clinical_significance: "Associated with higher prevalence of hemoglobinopathies (Thalassemia, Sickle Cell Disease).",
      },
    ],
  },
  {
    id: "personal_family_conditions",
    title: "Personal & Partner Health Conditions",
    description: "Audit congenital abnormalities, neurodevelopmental conditions, or early-onset chronic diseases.",
    questions: [
      {
        id: "q_chronic_conditions",
        label: "Do you or your partner have a history of diabetes, hypertension, epilepsy, or autoimmune conditions?",
        clinical_significance: "Maternal glycemic control and blood pressure require preconception stabilization to prevent congenital anomalies.",
      },
      {
        id: "q_unexplained_loss",
        label: "Has there been any history of recurrent pregnancy loss (2+ miscarriages) or stillbirth in your family?",
        clinical_significance: "May warrant parental karyotyping to rule out balanced chromosomal translocations.",
      },
    ],
  },
  {
    id: "medications_teratogens",
    title: "Medications & Teratogen Audit",
    description: "Certain prescription drugs carry teratogenic risk during embryogenesis.",
    questions: [
      {
        id: "q_teratogens",
        label: "Are you taking medications such as ACE inhibitors, retinoids/isotretinoin, methotrexate, or anti-seizure drugs (valproate)?",
        clinical_significance: "High teratogenic risk requiring medication transition prior to attempting conception.",
      },
      {
        id: "q_folic_acid",
        label: "Have you begun daily folic acid supplementation (400-800 mcg/day)?",
        clinical_significance: "Significantly mitigates neural tube defect (anencephaly, spina bifida) risk when started prior to conception.",
      },
    ],
  },
  {
    id: "previous_genetics",
    title: "Prior Genetic & Carrier Testing",
    description: "Record previous molecular or chromosomal tests.",
    questions: [
      {
        id: "q_past_testing",
        label: "Have you or your partner ever undergone carrier screening, karyotyping, or DNA variant testing?",
        clinical_significance: "Prevents redundant testing and guides targeted single-gene testing.",
      },
    ],
  },
];

interface PreconceptionWorkspaceProps {
  plan: PreconceptionPlan;
  onSavePlan: (updatedPlan: PreconceptionPlan) => Promise<void>;
  onNavigateTab: (tabId: string) => void;
}

export default function PreconceptionWorkspace({
  plan,
  onSavePlan,
  onNavigateTab,
}: PreconceptionWorkspaceProps) {
  const [formData, setFormData] = useState<PreconceptionPlan>(plan);
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [newTask, setNewTask] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Clinical Intake Wizard State
  const [showWizardModal, setShowWizardModal] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, boolean | null>>({});
  const [isSubmittingWizard, setIsSubmittingWizard] = useState<boolean>(false);
  const [wizardSuccessMessage, setWizardSuccessMessage] = useState<string | null>(null);

  const handleSelectWizardAnswer = (questionId: string, answer: boolean) => {
    setWizardAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitWizard = async () => {
    setIsSubmittingWizard(true);
    try {
      await api.submitPreconceptionQuestionnaire(wizardAnswers);
      const updated: PreconceptionPlan = {
        ...formData,
        partner_family_history_collected: true,
        known_conditions_reviewed: true,
        previous_genetic_tests_reviewed:
          wizardAnswers.q_past_testing !== undefined
            ? true
            : formData.previous_genetic_tests_reviewed,
        carrier_screening_discussed:
          wizardAnswers.q_past_testing === true
            ? true
            : formData.carrier_screening_discussed,
        medications_reviewed:
          wizardAnswers.q_teratogens !== undefined
            ? true
            : formData.medications_reviewed,
        folic_acid_initiated:
          wizardAnswers.q_folic_acid === true
            ? true
            : formData.folic_acid_initiated,
      };
      setFormData(updated);
      await onSavePlan(updated);
      setWizardSuccessMessage(
        "Clinical questionnaire processed! Readiness milestones and follow-ups updated."
      );
      setTimeout(() => {
        setWizardSuccessMessage(null);
        setShowWizardModal(false);
        setWizardStep(0);
      }, 1600);
    } catch (err) {
      console.error("Failed to submit questionnaire:", err);
    } finally {
      setIsSubmittingWizard(false);
    }
  };

  const toggleCheck = (key: keyof PreconceptionPlan) => {
    setFormData((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setFormData((prev) => ({
      ...prev,
      custom_questions: [...(prev.custom_questions || []), newQuestion.trim()],
    }));
    setNewQuestion("");
  };

  const handleRemoveQuestion = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      custom_questions: (prev.custom_questions || []).filter((_, i) => i !== idx),
    }));
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setFormData((prev) => ({
      ...prev,
      follow_up_checklist: [
        ...(prev.follow_up_checklist || []),
        { task: newTask.trim(), completed: false },
      ],
    }));
    setNewTask("");
  };

  const toggleTask = (idx: number) => {
    setFormData((prev) => {
      const list = [...(prev.follow_up_checklist || [])];
      list[idx] = { ...list[idx], completed: !list[idx].completed };
      return { ...prev, follow_up_checklist: list };
    });
  };

  const handleRemoveTask = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      follow_up_checklist: (prev.follow_up_checklist || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSavePlan(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadSummary = () => {
    const summaryText = `
MEDIPREDICT AI — PRECONCEPTION CLINICAL DISCUSSION SUMMARY
Generated: ${new Date().toLocaleDateString()}
Governance Standard: Educational Preconception Risk Awareness

=======================================================
CLINICAL DISCLAIMER
MediPredict AI provides educational genetic and family-history risk awareness.
It does not diagnose genetic conditions, determine reproductive outcomes, or replace
clinical genetic testing and professional genetic counselling.
Do not provide individualized fertility treatment or pregnancy-risk decisions.
=======================================================

1. CHECKLIST STATUS
- Partner Family History Collected: ${formData.partner_family_history_collected ? "YES" : "NO / PENDING"}
- Known Genetic Conditions Reviewed: ${formData.known_conditions_reviewed ? "YES" : "NO / PENDING"}
- Previous Genetic Tests Reviewed: ${formData.previous_genetic_tests_reviewed ? "YES" : "NO / PENDING"}
- Carrier Screening Discussed: ${formData.carrier_screening_discussed ? "YES" : "NO / PENDING"}
- Prescription Medications Reviewed for Teratogens: ${formData.medications_reviewed ? "YES" : "NO / PENDING"}
- Routine Vaccinations Reviewed (Rubella/Varicella/HepB): ${formData.vaccinations_reviewed ? "YES" : "NO / PENDING"}
- Daily Folic Acid / Folate Supplementation Initiated: ${formData.folic_acid_initiated ? "YES" : "NO / PENDING"}
- Clinician Discussion Questions Prepared: ${formData.clinician_questions_prepared ? "YES" : "NO / PENDING"}
- Genetic Counsellor Consultation Scheduled: ${formData.counsellor_consultation_scheduled ? "YES" : "NO / PENDING"}

2. PARTNER FAMILY HISTORY & TESTING NOTES
${formData.partner_notes || "None documented."}

3. MEDICATION & SUPPLEMENT NOTES
${formData.medication_notes || "None documented."}

4. VACCINATION & GENERAL PRECONCEPTION HEALTH
${formData.vaccination_notes || "None documented."}

5. QUESTIONS TO ASK HEALTHCARE PROVIDER / COUNSELLOR
${(formData.custom_questions || []).map((q, i) => `${i + 1}. ${q}`).join("\n") || "No questions recorded."}

6. FOLLOW-UP ACTION ITEMS
${(formData.follow_up_checklist || []).map((t, i) => `[${t.completed ? "X" : " "}] ${t.task}`).join("\n") || "No follow-up items recorded."}
`;

    const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medipredict-preconception-summary-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Clinical Boundary Callout */}
      <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/10 dark:bg-teal-950/20 text-teal-900 dark:text-teal-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold">
            Guided Preconception Educational Workspace
          </p>
          <p className="text-muted-foreground dark:text-teal-300/80">
            This workspace prepares prospective parents for clinician consultations. It does not provide individualized fertility treatment, pregnancy-risk decisions, or medical prescriptions. Always review this summary with an obstetrician or certified genetic counsellor.
          </p>
        </div>
      </div>

      {/* Action Header: Save & Download */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-white dark:bg-[#162732] shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Preconception Health & Discussion Planner
          </h3>
          <p className="text-xs text-muted-foreground">
            Track key preconception health milestones, partner history, medication safety, and questions for your doctor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWizardModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-xs font-bold transition-all shadow-2xs"
            title="Launch interactive 4-step preconception questionnaire wizard"
          >
            <ClipboardList className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Clinical Intake Wizard</span>
          </button>

          <button
            onClick={handleDownloadSummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-white dark:bg-[#1c303d] hover:bg-surface-low text-xs font-semibold text-foreground transition-all"
            title="Download formatted clinical visit summary"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Download Summary</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Progress"}</span>
          </button>
        </div>
      </div>

      {/* Step 1: Core Preconception Health Checklist */}
      <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Clinical Preconception Readiness Milestones</span>
          </h4>
          <span className="text-[10px] text-muted-foreground font-mono">ACOG Preconception Practice Bulletin</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            {
              key: "partner_family_history_collected",
              label: "Partner Family Health History Collected",
              desc: "Record health conditions across 3 generations on partner's biological side.",
            },
            {
              key: "known_conditions_reviewed",
              label: "Known Inherited Conditions Identified",
              desc: "Verify any history of thalassemia, sickle cell, cystic fibrosis, or congenital heart conditions.",
            },
            {
              key: "previous_genetic_tests_reviewed",
              label: "Previous Genetic Test Records Reviewed",
              desc: "Gather any prior carrier screening, karyotypes, or chromosome microarray reports.",
            },
            {
              key: "carrier_screening_discussed",
              label: "Carrier Screening Options Evaluated",
              desc: "Discuss pan-ethnic carrier panels or targeted hemoglobinopathy screening with clinician.",
            },
            {
              key: "medications_reviewed",
              label: "Prescription Medications Reviewed for Teratogens",
              desc: "Audit prescription and over-the-counter drugs (e.g. ACE inhibitors, retinoids, valproate).",
            },
            {
              key: "vaccinations_reviewed",
              label: "Routine Maternal Immunity Verified",
              desc: "Confirm immunity to Rubella (MMR) and Varicella, and Hepatitis B vaccination status.",
            },
            {
              key: "folic_acid_initiated",
              label: "Folic Acid Supplementation Initiated",
              desc: "Take 400–800 mcg/day of folic acid starting at least 1–3 months before conception.",
            },
            {
              key: "counsellor_consultation_scheduled",
              label: "Genetic Counsellor Consultation Scheduled",
              desc: "Meet with a Certified Genetic Counsellor to review personalized family pedigree.",
            },
          ].map((item) => {
            const isChecked = !!(formData as any)[item.key];
            return (
              <div
                key={item.key}
                onClick={() => toggleCheck(item.key as keyof PreconceptionPlan)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isChecked
                    ? "border-teal-500 bg-teal-500/10 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100"
                    : "border-border bg-surface-low/30 dark:bg-[#1a2d39] text-foreground hover:border-teal-500/40"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                    isChecked ? "bg-teal-600 border-teal-600 text-white" : "border-border bg-white dark:bg-[#14232d]"
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="font-semibold">{item.label}</h5>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Detailed Clinical Prompts (Partner, Medications, Vaccinations) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Partner Family History */}
        <div className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Partner Health Notes</span>
          </h4>
          <p className="text-[11px] text-muted-foreground">
            Document partner's ancestry, known hereditary conditions, and CBC / HPLC screening results:
          </p>
          <textarea
            rows={4}
            value={formData.partner_notes || ""}
            onChange={(e) => setFormData({ ...formData, partner_notes: e.target.value })}
            placeholder="e.g. Partner has ancestry from Gujarat; had normal CBC at last physical; scheduled for HPLC next week..."
            className="w-full p-2.5 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-xs text-foreground outline-none"
          />
        </div>

        {/* Medication Review */}
        <div className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-teal-600" />
            <span>Medications & Teratogen Review</span>
          </h4>
          <p className="text-[11px] text-muted-foreground">
            List current prescription, OTC, herbal supplements, and vitamins for clinical safety evaluation:
          </p>
          <textarea
            rows={4}
            value={formData.medication_notes || ""}
            onChange={(e) => setFormData({ ...formData, medication_notes: e.target.value })}
            placeholder="e.g. Taking prenatal vitamin with 800mcg folic acid; stopped topical retinoid; no blood pressure meds..."
            className="w-full p-2.5 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-xs text-foreground outline-none"
          />
        </div>

        {/* Vaccinations & General Health */}
        <div className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Vaccinations & Preventive Health</span>
          </h4>
          <p className="text-[11px] text-muted-foreground">
            Note immunity titers (Rubella IgG), Varicella, Hepatitis B status, and metabolic baselines:
          </p>
          <textarea
            rows={4}
            value={formData.vaccination_notes || ""}
            onChange={(e) => setFormData({ ...formData, vaccination_notes: e.target.value })}
            placeholder="e.g. Rubella titer positive (immune); Hepatitis B series up to date; fasting glucose normal..."
            className="w-full p-2.5 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-xs text-foreground outline-none"
          />
        </div>
      </div>

      {/* Step 3: Clinician Discussion Questions & Follow-Up Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Questions for Doctor */}
        <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span>Questions to Ask Healthcare Provider</span>
            </h4>
            <span className="text-[10px] text-muted-foreground">Printable</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
              placeholder="e.g. Which carrier screening panel do you recommend?"
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-xs text-foreground outline-none"
            />
            <button
              onClick={handleAddQuestion}
              className="p-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs max-h-56 overflow-y-auto">
            {(formData.custom_questions || []).map((q, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-border bg-surface-low/30 dark:bg-[#1a2d39] flex items-center justify-between gap-2"
              >
                <span className="text-foreground">{q}</span>
                <button
                  onClick={() => handleRemoveQuestion(idx)}
                  className="p-1 rounded text-muted-foreground hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items & Follow-up Checklist */}
        <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>Personal Follow-Up Action Items</span>
            </h4>
            <span className="text-[10px] text-muted-foreground">Personalized</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              placeholder="e.g. Pick up folate prescription..."
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-xs text-foreground outline-none"
            />
            <button
              onClick={handleAddTask}
              className="p-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs max-h-56 overflow-y-auto">
            {(formData.follow_up_checklist || []).map((t, idx) => (
              <div
                key={idx}
                onClick={() => toggleTask(idx)}
                className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between gap-2 ${
                  t.completed
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 line-through"
                    : "border-border bg-surface-low/30 dark:bg-[#1a2d39] text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                      t.completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-border"
                    }`}
                  >
                    {t.completed && "✓"}
                  </div>
                  <span>{t.task}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTask(idx);
                  }}
                  className="p-1 rounded text-muted-foreground hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clinical Intake Questionnaire Wizard Modal */}
      {showWizardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#162732] rounded-2xl border border-border shadow-2xl max-w-xl w-full p-6 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  CLINICAL PRECONCEPTION QUESTIONNAIRE
                </span>
                <h3 className="text-base font-bold text-foreground">
                  Step {wizardStep + 1} of {WIZARD_SECTIONS.length}: {WIZARD_SECTIONS[wizardStep].title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowWizardModal(false);
                  setWizardStep(0);
                }}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Pills */}
            <div className="flex items-center gap-1.5">
              {WIZARD_SECTIONS.map((sec, idx) => (
                <div
                  key={sec.id}
                  onClick={() => setWizardStep(idx)}
                  className={`flex-1 h-1.5 rounded-full cursor-pointer transition-all ${
                    idx === wizardStep
                      ? "bg-teal-600"
                      : idx < wizardStep
                      ? "bg-teal-400/60"
                      : "bg-surface-low dark:bg-[#1c303d]"
                  }`}
                  title={sec.title}
                />
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {WIZARD_SECTIONS[wizardStep].description}
            </p>

            {/* Questions for current step */}
            <div className="space-y-4">
              {WIZARD_SECTIONS[wizardStep].questions.map((q) => {
                const currentVal = wizardAnswers[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#192c38] space-y-3"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground leading-relaxed">
                        {q.label}
                      </p>
                      <p className="text-[11px] text-teal-700 dark:text-teal-300 font-mono">
                        Clinical rationale: {q.clinical_significance}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSelectWizardAnswer(q.id, true)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                          currentVal === true
                            ? "border-teal-600 bg-teal-600 text-white shadow-xs"
                            : "border-border bg-white dark:bg-[#14232d] text-foreground hover:border-teal-500/50"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectWizardAnswer(q.id, false)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                          currentVal === false
                            ? "border-teal-600 bg-teal-600 text-white shadow-xs"
                            : "border-border bg-white dark:bg-[#14232d] text-foreground hover:border-teal-500/50"
                        }`}
                      >
                        No / Unknown
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Success banner if completed */}
            {wizardSuccessMessage && (
              <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{wizardSuccessMessage}</span>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setWizardStep((prev) => Math.max(0, prev - 1))}
                disabled={wizardStep === 0}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-border text-xs font-semibold disabled:opacity-40 hover:bg-surface-low"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {wizardStep < WIZARD_SECTIONS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((prev) => Math.min(WIZARD_SECTIONS.length - 1, prev + 1))}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <span>Next Section</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitWizard}
                    disabled={isSubmittingWizard}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmittingWizard ? "Processing..." : "Complete & Sync Milestones"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
