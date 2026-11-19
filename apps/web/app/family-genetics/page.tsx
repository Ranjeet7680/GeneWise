"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Dna,
  Download,
  FileCheck,
  FileText,
  Filter,
  FolderHeart,
  Heart,
  HeartPulse,
  HelpCircle,
  Info,
  Layers,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Network,
  Plus,
  Printer,
  Radio,
  RotateCcw,
  Search,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import MetricCard from "@/components/MetricCard";
import { api } from "@/lib/api";
import { sound } from "@/lib/sound";
import CarrierScreeningModule from "./components/CarrierScreeningModule";
import FamilyTreeVisualizer from "./components/FamilyTreeVisualizer";
import GeneticAssistantConsole from "./components/GeneticAssistantConsole";
import GeneticExplorerView from "./components/GeneticExplorerView";
import GeneticRiskEngineView from "./components/GeneticRiskEngineView";
import PreconceptionWorkspace from "./components/PreconceptionWorkspace";
import PrivacyConsentView from "./components/PrivacyConsentView";
import SpecialistDirectoryView from "./components/SpecialistDirectoryView";
import {
  INITIAL_CARRIER_CONDITIONS,
  INITIAL_COUNSELLORS,
  INITIAL_MEMBERS,
  INITIAL_OVERVIEW,
  INITIAL_PRECONCEPTION_PLAN,
  INITIAL_REFERRALS,
  INITIAL_RISK_SUMMARY,
  MANDATED_DISCLAIMER,
} from "./mockData";
import {
  CarrierConditionInfo,
  FamilyCondition,
  FamilyGeneticsOverview,
  FamilyMember,
  GeneticCounsellor,
  GeneticRiskSummary,
  PreconceptionPlan,
  SpecialistReferral,
} from "./types";

export default function FamilyGeneticsPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loading, setLoading] = useState<boolean>(true);

  // Core Data States
  const [overview, setOverview] = useState<FamilyGeneticsOverview>(INITIAL_OVERVIEW);
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_MEMBERS);
  const [riskSummary, setRiskSummary] = useState<GeneticRiskSummary>(INITIAL_RISK_SUMMARY);
  const [carrierConditions, setCarrierConditions] = useState<CarrierConditionInfo[]>(INITIAL_CARRIER_CONDITIONS);
  const [preconceptionPlan, setPreconceptionPlan] = useState<PreconceptionPlan>(INITIAL_PRECONCEPTION_PLAN);
  const [counsellors, setCounsellors] = useState<GeneticCounsellor[]>(INITIAL_COUNSELLORS);
  const [referrals, setReferrals] = useState<SpecialistReferral[]>(INITIAL_REFERRALS);

  // Load from backend API with fallback
  useEffect(() => {
    let isMounted = true;

    async function loadAllData() {
      try {
        const [
          ovRes,
          treeRes,
          riskRes,
          carrierRes,
          planRes,
          counsRes,
          refsRes,
        ] = await Promise.allSettled([
          api.getFamilyGeneticsOverview(),
          api.getFamilyTree(),
          api.getGeneticRiskAnalysis(),
          api.getCarrierScreeningInfo(),
          api.getPreconceptionPlan(),
          api.getGeneticCounsellors(),
          api.getSpecialistReferrals(),
        ]);

        if (!isMounted) return;

        if (ovRes.status === "fulfilled" && ovRes.value?.data) {
          setOverview(ovRes.value.data);
        }
        if (treeRes.status === "fulfilled" && Array.isArray(treeRes.value?.data?.members)) {
          setMembers(treeRes.value.data.members);
        }
        if (riskRes.status === "fulfilled" && riskRes.value?.data) {
          setRiskSummary(riskRes.value.data);
        }
        if (carrierRes.status === "fulfilled" && Array.isArray(carrierRes.value?.data)) {
          setCarrierConditions(carrierRes.value.data);
        }
        if (planRes.status === "fulfilled" && planRes.value?.data) {
          setPreconceptionPlan(planRes.value.data);
        }
        if (counsRes.status === "fulfilled" && Array.isArray(counsRes.value?.data)) {
          setCounsellors(counsRes.value.data);
        }
        if (refsRes.status === "fulfilled" && Array.isArray(refsRes.value?.data)) {
          setReferrals(refsRes.value.data);
        }
      } catch (err) {
        console.warn("Using offline initial demo datasets for Family Genetics Hub:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAllData();

    return () => {
      isMounted = false;
    };
  }, []);

  // CRUD Handler: Add Family Member
  const handleAddMember = async (memberData: Partial<FamilyMember>) => {
    sound.playPop();
    const tempId = Date.now();
    const newMember: FamilyMember = {
      id: tempId,
      first_name: memberData.first_name || "",
      last_name: memberData.last_name || "",
      relationship: memberData.relationship || "Relative",
      biological_branch: memberData.biological_branch || "immediate",
      biological_sex: memberData.biological_sex || "unknown",
      generation_depth: memberData.generation_depth || 3,
      is_proband: false,
      vital_status: memberData.vital_status || "living",
      age_current_or_death: memberData.age_current_or_death || 30,
      carrier_status: memberData.carrier_status || "unknown",
      notes: memberData.notes || "",
      conditions: [],
    };

    setMembers((prev) => [...prev, newMember]);
    setOverview((prev) => ({
      ...prev,
      family_members_count: prev.family_members_count + 1,
      pedigree_completeness_pct: Math.min(100, prev.pedigree_completeness_pct + 3),
    }));

    try {
      const res = await api.createFamilyMember(memberData);
      if (res?.data?.id) {
        setMembers((prev) => prev.map((m) => (m.id === tempId ? { ...m, id: res.data.id } : m)));
      }
    } catch (e) {
      console.warn("Backend sync fallback for member creation:", e);
    }
  };

  // CRUD Handler: Update Member
  const handleUpdateMember = async (id: number, memberData: Partial<FamilyMember>) => {
    sound.playPop();
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...memberData } : m)));
    try {
      await api.updateFamilyMember(id, memberData);
    } catch (e) {
      console.warn("Backend sync fallback for member update:", e);
    }
  };

  // CRUD Handler: Delete Member
  const handleDeleteMember = async (id: number) => {
    sound.playPop();
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setOverview((prev) => ({
      ...prev,
      family_members_count: Math.max(1, prev.family_members_count - 1),
    }));
    try {
      await api.deleteFamilyMember(id);
    } catch (e) {
      console.warn("Backend sync fallback for member delete:", e);
    }
  };

  // CRUD Handler: Add Condition
  const handleAddCondition = async (memberId: number, conditionData: FamilyCondition) => {
    sound.playPop();
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            conditions: [...(m.conditions || []), conditionData],
          };
        }
        return m;
      })
    );
    setOverview((prev) => ({
      ...prev,
      conditions_recorded_count: prev.conditions_recorded_count + 1,
    }));
    try {
      await api.addFamilyCondition({
        family_member_id: memberId,
        ...conditionData,
      });
    } catch (e) {
      console.warn("Backend sync fallback for condition add:", e);
    }
  };

  // Save Preconception Plan
  const handleSavePreconceptionPlan = async (updatedPlan: PreconceptionPlan) => {
    sound.playPop();
    setPreconceptionPlan(updatedPlan);
    try {
      await api.savePreconceptionPlan(updatedPlan);
    } catch (e) {
      console.warn("Backend sync fallback for preconception plan:", e);
    }
  };

  // Request Specialist Referral
  const handleRequestReferral = async (referralData: {
    counsellor_id: number;
    preferred_date?: string;
    reason_for_referral: string;
    notes?: string;
    consent_given: boolean;
  }) => {
    sound.playSuccess();
    const counsellor = counsellors.find((c) => c.id === referralData.counsellor_id);
    const newRef: SpecialistReferral = {
      id: Date.now(),
      counsellor_id: referralData.counsellor_id,
      counsellor_name: counsellor?.full_name || "Specialist Counsellor",
      specialty: counsellor?.specialty || "Genetic Counselling",
      referral_status: "requested",
      preferred_date: referralData.preferred_date,
      reason_for_referral: referralData.reason_for_referral,
      notes: referralData.notes,
      consent_given: referralData.consent_given,
      created_at: new Date().toISOString(),
    };

    setReferrals((prev) => [newRef, ...prev]);
    setOverview((prev) => ({ ...prev, referrals_count: prev.referrals_count + 1 }));

    try {
      await api.createSpecialistReferral(referralData);
    } catch (e) {
      console.warn("Backend sync fallback for referral creation:", e);
    }
  };

  // Export All Family Data JSON
  const handleExportAllData = async () => {
    sound.playPop();
    const exportBundle = {
      exported_at: new Date().toISOString(),
      governance: "MediPredict AI — Family Health & Genetic Risk Intelligence",
      disclaimer: MANDATED_DISCLAIMER,
      overview,
      members,
      risk_summary: riskSummary,
      carrier_conditions: carrierConditions,
      preconception_plan: preconceptionPlan,
      referrals,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `medipredict-family-genetics-complete-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Purge All Family Data
  const handlePurgeAllData = async () => {
    sound.playPop();
    setMembers([]);
    setReferrals([]);
    setOverview({
      family_members_count: 0,
      pedigree_completeness_pct: 0,
      conditions_recorded_count: 0,
      genetic_variants_count: 0,
      carrier_conditions_count: carrierConditions.length,
      referrals_count: 0,
      primary_risk_level: "Insufficient information",
      disclaimer: MANDATED_DISCLAIMER,
    });
    try {
      await api.purgeGeneticData("CONFIRM_PURGE_ALL_DATA");
    } catch (e) {
      console.warn("Backend sync fallback for purge:", e);
    }
  };

  const navTabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "tree", label: "Family Health Tree", icon: Network, badge: `${members.length}` },
    { id: "risk", label: "Genetic Risk Engine", icon: ShieldAlert },
    { id: "carrier", label: "Carrier Screening", icon: Dna, badge: "6 Topics" },
    { id: "preconception", label: "Preconception Planner", icon: FileCheck },
    { id: "explorer", label: "Genetic Explorer", icon: BookOpen },
    { id: "assistant", label: "AI Genetic Assistant", icon: MessageSquare, badge: "AI Voice" },
    { id: "counsellors", label: "Find a Counsellor", icon: Stethoscope, badge: `${referrals.length}` },
    { id: "privacy", label: "Privacy & Consent", icon: Lock },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f4faff] dark:bg-[#0a161d] text-foreground">
      <AppHeader />

      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <AppSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full animate-fade-in-up pb-28 md:pb-16">
          {/* Top Medical Disclaimer Banner verbatim */}
          <div className="p-4 rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-teal-500/10 to-sky-500/5 dark:from-sky-950/40 dark:via-teal-950/30 dark:to-sky-950/20 shadow-2xs flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold uppercase tracking-wider text-teal-800 dark:text-teal-200">
                CLINICAL GOVERNANCE & SAFETY STANDARD
              </span>
              <p className="text-foreground/90 font-medium leading-relaxed">
                "{MANDATED_DISCLAIMER}"
              </p>
            </div>
          </div>

          {/* Page Title & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                  CLINICAL GENETICS & PEDIGREE INTELLIGENCE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-bold">
                  DPDP Act & HIPAA Compliant
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Family Health History & Genetic Risk Intelligence
              </h1>
              <p className="text-xs text-muted-foreground">
                3-generation pedigree mapping, educational pattern detection (AD, AR, X-linked), carrier screening guidance, and preconception workflow.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={handleExportAllData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-white dark:bg-[#162732] hover:bg-surface-low text-xs font-semibold text-foreground transition-all shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>Export Data</span>
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  setActiveTab("assistant");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Assistant</span>
              </button>
            </div>
          </div>

          {/* 6 Dashboard Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <MetricCard
              title="Family Members"
              value={members.length}
              icon={Users}
              subtitle="3 generations tracked"
              className="border-teal-500/20"
            />
            <MetricCard
              title="Pedigree Depth"
              value={`${overview.pedigree_completeness_pct}%`}
              icon={Network}
              subtitle="Lineage completeness"
              className="border-emerald-500/20"
            />
            <MetricCard
              title="Recorded Conditions"
              value={members.reduce((acc, m) => acc + (m.conditions?.length || 0), 0)}
              icon={Heart}
              subtitle="Diagnosed health traits"
              className="border-rose-500/20"
            />
            <MetricCard
              title="Genetic Variants"
              value={overview.genetic_variants_count || 2}
              icon={Dna}
              subtitle="Documented lab reports"
              className="border-indigo-500/20"
            />
            <MetricCard
              title="Carrier Topics"
              value={carrierConditions.length}
              icon={BookOpen}
              subtitle="Core screening guides"
              className="border-amber-500/20"
            />
            <MetricCard
              title="Referrals & Visits"
              value={referrals.length}
              icon={Stethoscope}
              subtitle="Counsellor consultations"
              className="border-sky-500/20"
            />
          </div>

          {/* Navigation Tab Bar (9 Sections) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#162732] border border-border shadow-2xs overflow-x-auto">
            {navTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playPop();
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-low dark:hover:bg-[#1c303d]"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-surface-low dark:bg-[#1c303d] text-muted-foreground"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview Dashboard */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* Primary Risk Level Announcement */}
              <div className="p-5 rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/5 dark:from-teal-950/40 dark:via-cyan-950/30 dark:to-teal-950/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                    PRIMARY EDUCATIONAL RISK EVALUATION
                  </span>
                  <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-teal-600" />
                    <span>{overview.primary_risk_level}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-2xl">
                    Documented Beta Thalassemia trait across 2 generations (proband and paternal lineage) warrants partner screening prior to conception.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab("risk")}
                    className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <span>View 7-Point Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Navigation Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab("tree")}
                  className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-2xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 border border-teal-500/20 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Network className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Interactive 3-Gen Pedigree</h4>
                  <p className="text-xs text-muted-foreground">
                    Inspect maternal and paternal inheritance branches, zoom/pan pedigree nodes, and record conditions with age of diagnosis.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 pt-1 group-hover:underline">
                    <span>Open Tree Visualizer</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab("carrier")}
                  className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-2xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-500/20 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Dna className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Carrier Screening Guides</h4>
                  <p className="text-xs text-muted-foreground">
                    Deep dives on Thalassemia, Sickle Cell, CF, SMA, metabolic disorders, residual risk calculation, and partner testing.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 pt-1 group-hover:underline">
                    <span>Explore Screening Topics</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab("preconception")}
                  className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-2xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-500/20 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Preconception Workspace</h4>
                  <p className="text-xs text-muted-foreground">
                    Review partner health, medication teratogens, maternal vaccinations (Rubella, HepB), and download visit summaries.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 pt-1 group-hover:underline">
                    <span>Start Planning Workflow</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Pedigree Completeness & Summary Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Key Pedigree Risk Observations</span>
                  </h4>
                  <ul className="text-xs space-y-2 text-foreground">
                    {riskSummary.observed_family_history.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Actionable Clinician Discussion Prompts</span>
                  </h4>
                  <ul className="text-xs space-y-2 text-foreground">
                    {riskSummary.suggested_clinician_questions.slice(0, 3).map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span className="font-medium">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Family Health Tree Visualizer */}
          {activeTab === "tree" && (
            <FamilyTreeVisualizer
              members={members}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
              onAddCondition={handleAddCondition}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* Tab 3: Genetic Risk Intelligence Engine */}
          {activeTab === "risk" && (
            <GeneticRiskEngineView
              summary={riskSummary}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* Tab 4: Carrier Screening Recommendation Module */}
          {activeTab === "carrier" && (
            <CarrierScreeningModule
              conditions={carrierConditions}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* Tab 5: Preconception Planning Workspace */}
          {activeTab === "preconception" && (
            <PreconceptionWorkspace
              plan={preconceptionPlan}
              onSavePlan={handleSavePreconceptionPlan}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* Tab 6: Genetic Explorer */}
          {activeTab === "explorer" && <GeneticExplorerView />}

          {/* Tab 7: AI Genetic Assistant */}
          {activeTab === "assistant" && (
            <GeneticAssistantConsole onNavigateTab={setActiveTab} />
          )}

          {/* Tab 8: Specialist Directory & Referrals */}
          {activeTab === "counsellors" && (
            <SpecialistDirectoryView
              counsellors={counsellors}
              referrals={referrals}
              onRequestReferral={handleRequestReferral}
            />
          )}

          {/* Tab 9: Privacy, Consent & Governance */}
          {activeTab === "privacy" && (
            <PrivacyConsentView
              onExportAllData={handleExportAllData}
              onPurgeData={handlePurgeAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
