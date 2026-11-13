"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Dna,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  HeartPulse,
  Layers,
  LineChart as LineChartIcon,
  Lock,
  Microscope,
  Network,
  PictureInPicture2,
  PieChart as PieChartIcon,
  Plus,
  Search,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import ClinicalChartTooltip, { CLINICAL_TOOLTIP_CURSOR } from "@/components/ClinicalChartTooltip";
import PipTelemetryWidget, { PipTelemetryPoint } from "@/components/PipTelemetryWidget";
import SafetyNotice from "@/components/SafetyNotice";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/lib/auth";
import { sound } from "@/lib/sound";

interface PrepTopic {
  id: string;
  title: string;
  done: boolean;
}

interface ActivityEntry {
  id: string;
  title: string;
  meta: string;
  kind: "report" | "family" | "download";
}

type DashRange = "7d" | "30d" | "90d";
type DashDataset = "cardio" | "telemetry" | "genomics";
type DashChartType = "area" | "line" | "bar";

const INITIAL_PREP_TOPICS: PrepTopic[] = [
  { id: "p1", title: "ClinVar pathogenic classification notes", done: true },
  { id: "p2", title: "Maternal grandfather cardio history summary", done: true },
  { id: "p3", title: "Targeted gene panel query list (Cardio/Heme)", done: true },
  { id: "p4", title: "Pharmacogenomics drug-interaction queries", done: false },
  { id: "p5", title: "Secondary findings ACMG SF v3.2 review list", done: false },
];

const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    id: "act1",
    title: "Reviewed Cystic Fibrosis (CFTR gene) details",
    meta: "2 hours ago • ClinVar ID: 7120",
    kind: "report",
  },
  {
    id: "act2",
    title: "Updated Maternal Grandparent health notes",
    meta: "Yesterday at 4:15 PM • Family Tree Sync",
    kind: "family",
  },
  {
    id: "act3",
    title: "Exported Educational Summary PDF",
    meta: "3 days ago • Report #GW-9824",
    kind: "download",
  },
];

const QUICK_FILTERS = [
  "Rare Diseases",
  "Cardiovascular Genetics",
  "Neurogenetics",
  "Hereditary Cancer",
];

const LOOKUP_RESULTS = [
  {
    gene: "CFTR",
    locus: "7q31.2",
    name: "Cystic Fibrosis Transmembrane Conductance Regulator",
    inheritance: "Autosomal Recessive",
    category: "Rare Diseases",
    clinvarId: "VCV000007105",
  },
  {
    gene: "FBN1",
    locus: "15q21.1",
    name: "Fibrillin-1 (Marfan Syndrome)",
    inheritance: "Autosomal Dominant",
    category: "Cardiovascular Genetics",
    clinvarId: "VCV000016375",
  },
  {
    gene: "HTT",
    locus: "4p16.3",
    name: "Huntingtin (CAG Trinucleotide Repeat)",
    inheritance: "Autosomal Dominant",
    category: "Neurogenetics",
    clinvarId: "VCV000014234",
  },
  {
    gene: "BRCA1",
    locus: "17q21.31",
    name: "Breast Cancer 1 Early Onset DNA Repair",
    inheritance: "Autosomal Dominant",
    category: "Hereditary Cancer",
    clinvarId: "VCV000017652",
  },
];

const DASHBOARD_SERIES: Record<
  DashRange,
  Array<{ label: string; systolic: number; diastolic: number; hr: number; spo2: number; curated: number; reviewed: number }>
> = {
  "7d": [
    { label: "Mon", systolic: 120, diastolic: 76, hr: 71, spo2: 98.5, curated: 42, reviewed: 28 },
    { label: "Tue", systolic: 123, diastolic: 79, hr: 74, spo2: 98.4, curated: 48, reviewed: 32 },
    { label: "Wed", systolic: 118, diastolic: 75, hr: 69, spo2: 98.9, curated: 51, reviewed: 36 },
    { label: "Thu", systolic: 126, diastolic: 81, hr: 76, spo2: 98.2, curated: 57, reviewed: 40 },
    { label: "Fri", systolic: 122, diastolic: 78, hr: 73, spo2: 98.7, curated: 64, reviewed: 45 },
    { label: "Sat", systolic: 117, diastolic: 74, hr: 68, spo2: 99.1, curated: 69, reviewed: 49 },
    { label: "Sun", systolic: 121, diastolic: 77, hr: 72, spo2: 98.8, curated: 74, reviewed: 54 },
  ],
  "30d": [
    { label: "Wk 1", systolic: 126, diastolic: 81, hr: 75, spo2: 98.1, curated: 180, reviewed: 110 },
    { label: "Wk 2", systolic: 124, diastolic: 79, hr: 73, spo2: 98.4, curated: 245, reviewed: 162 },
    { label: "Wk 3", systolic: 121, diastolic: 77, hr: 71, spo2: 98.7, curated: 310, reviewed: 224 },
    { label: "Wk 4", systolic: 119, diastolic: 76, hr: 70, spo2: 98.9, curated: 390, reviewed: 286 },
  ],
  "90d": [
    { label: "Aug", systolic: 129, diastolic: 83, hr: 76, spo2: 97.9, curated: 410, reviewed: 260 },
    { label: "Sep", systolic: 124, diastolic: 80, hr: 73, spo2: 98.5, curated: 620, reviewed: 445 },
    { label: "Oct", systolic: 120, diastolic: 77, hr: 71, spo2: 98.8, curated: 890, reviewed: 675 },
  ],
};

const COHORT_BREAKDOWN = [
  { name: "Rare Diseases", count: 542, share: "38%", color: "#0d9488" },
  { name: "Cardiovascular Genetics", count: 384, share: "27%", color: "#38bdf8" },
  { name: "Hereditary Cancer", count: 271, share: "19%", color: "#8b5cf6" },
  { name: "Neurogenetics", count: 231, share: "16%", color: "#10b981" },
];

export default function GeneWiseDashboardPage() {
  const { user, workspaceBrand } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Rare Diseases");
  const [prepTopics, setPrepTopics] = useState<PrepTopic[]>(INITIAL_PREP_TOPICS);
  const [relativesCount, setRelativesCount] = useState<number>(8);
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>(INITIAL_ACTIVITY);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: "", relationship: "Father", condition: "None" });

  // Dashboard Dynamic Graph + PiP States
  const [dashRange, setDashRange] = useState<DashRange>("7d");
  const [dashDataset, setDashDataset] = useState<DashDataset>("cardio");
  const [dashChartType, setDashChartType] = useState<DashChartType>("area");
  const [showPip, setShowPip] = useState<boolean>(false);
  const [isPipStreaming, setIsPipStreaming] = useState<boolean>(true);
  const [liveVitals, setLiveVitals] = useState({ hr: 72, spo2: 98.7, systolic: 121, diastolic: 77 });
  const [pipLiveHistory, setPipLiveHistory] = useState<PipTelemetryPoint[]>(() =>
    DASHBOARD_SERIES["7d"].map((d) => ({
      label: d.label,
      hr: d.hr,
      spo2: d.spo2,
      systolic: d.systolic,
      diastolic: d.diastolic,
    }))
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isPipStreaming) return;
    const timer = setInterval(() => {
      const stamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLiveVitals((prev) => {
        const hr = Math.max(60, Math.min(92, Math.round(prev.hr + (Math.random() - 0.5) * 3)));
        const spo2 = Math.min(99.9, Math.max(96.5, Number((prev.spo2 + (Math.random() - 0.5) * 0.2).toFixed(1))));
        const systolic = Math.max(115, Math.min(129, Math.round(prev.systolic + (Math.random() - 0.5) * 3)));
        const diastolic = Math.max(72, Math.min(83, Math.round(prev.diastolic + (Math.random() - 0.5) * 2)));
        setPipLiveHistory((hist) => [
          ...hist.slice(-10),
          { label: stamp, hr, spo2, systolic, diastolic },
        ]);
        return { hr, spo2, systolic, diastolic };
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [isPipStreaming]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const toggleTopic = (id: string) => {
    sound.playPop();
    setPrepTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedCount = prepTopics.filter((t) => t.done).length;
  const prepProgress = Math.round((completedCount / prepTopics.length) * 100);

  const handleDownloadPacket = () => {
    sound.playSuccess();
    const lines = [
      `${workspaceBrand.name} Clinician Consultation Checklist`,
      "==========================================",
      `Prepared For: ${user?.full_name || "Clinical Workspace"} (${completedCount}/${prepTopics.length} Topics Completed)`,
      `Latest Telemetry: ${liveVitals.systolic}/${liveVitals.diastolic} mmHg | HR ${liveVitals.hr} BPM | SpO2 ${liveVitals.spo2}%`,
      "",
      "Discussion Questions & Prep Checklist:",
      ...prepTopics.map((t, i) => `${i + 1}. [${t.done ? "x" : " "}] ${t.title}`),
    ].join("\n");

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "genewise-clinician-checklist.txt";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Clinician Question Packet downloaded and synced to audit log.");
  };

  const handleSaveNewRelative = () => {
    if (!newMember.name.trim()) return;
    sound.playSuccess();
    setRelativesCount((c) => c + 1);
    setRecentActivity((prev) => [
      {
        id: `act-${Date.now()}`,
        title: `Encrypted ${newMember.name.trim()} (${newMember.relationship})`,
        meta: `Just now • Condition: ${newMember.condition || "None"}`,
        kind: "family",
      },
      ...prev.slice(0, 4),
    ]);
    setNewMember({ name: "", relationship: "Father", condition: "None" });
    setShowAddMemberModal(false);
    showToast("Family relative encrypted locally and added to workspace.");
  };

  const filteredLookup = LOOKUP_RESULTS.filter(
    (item) =>
      (item.category === activeFilter || searchQuery.trim().length > 0) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.gene.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const chartSeries = DASHBOARD_SERIES[dashRange];

  const datasetConfig = useMemo(() => {
    if (dashDataset === "telemetry") {
      return {
        primaryKey: "hr" as const,
        primaryName: "Heart Rate (BPM)",
        primaryColor: "#0d9488",
        secondaryKey: "spo2" as const,
        secondaryName: "SpO2 (%)",
        secondaryColor: "#38bdf8",
      };
    }
    if (dashDataset === "genomics") {
      return {
        primaryKey: "curated" as const,
        primaryName: "Curated Loci",
        primaryColor: "#8b5cf6",
        secondaryKey: "reviewed" as const,
        secondaryName: "ClinVar Verified",
        secondaryColor: "#10b981",
      };
    }
    return {
      primaryKey: "systolic" as const,
      primaryName: "Systolic BP (mmHg)",
      primaryColor: "#0d9488",
      secondaryKey: "diastolic" as const,
      secondaryName: "Diastolic BP (mmHg)",
      secondaryColor: "#38bdf8",
    };
  }, [dashDataset]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4faff] dark:bg-[#0a161d] text-foreground overflow-x-hidden">
      <AppHeader />

      <div className="flex-1 flex min-w-0 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-[1440px] w-full mx-auto overflow-y-auto animate-fade-in-up pb-6 md:pb-8">
          {/* Dynamic Personalized Workspace Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <Link
                href="/settings/profile"
                title="Customize Avatar, Name, Phone & Workspace Brand"
                className="shrink-0 group"
              >
                <UserAvatar
                  name={user?.full_name || "Dr. Vance"}
                  avatarUrl={user?.avatar_url}
                  avatarColor={user?.avatar_color}
                  size="lg"
                  showOnlineDot={true}
                  className="group-hover:scale-105 transition-transform"
                />
              </Link>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                    <span>{workspaceBrand.name} Analytics Workspace</span>
                  </div>
                  {user?.phone_verified && user?.phone && (
                    <Link
                      href="/settings/profile"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-[10px] font-mono font-semibold hover:bg-emerald-500/15"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{user.phone}</span>
                    </Link>
                  )}
                </div>

                <h1 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight truncate">
                  Welcome back, {user?.full_name || "Dr. Vance"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {user?.specialty ? `${user.specialty} · ` : ""}
                  Monitor live physiological trends, explore ClinVar genetics, and launch PiP overlays.{" "}
                  <Link
                    href="/settings/profile"
                    className="font-semibold text-primary hover:underline ml-1"
                  >
                    Customize Profile & Logo
                  </Link>
                </p>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:flex-wrap w-full lg:w-auto">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowAddMemberModal(true);
                }}
                className="px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-[#004d47] hover:bg-[#003833] text-white transition-all shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Add Family Member</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowPip((v) => !v);
                }}
                className={`px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold border transition-all shadow-2xs flex items-center justify-center gap-1.5 ${
                  showPip
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-white dark:bg-[#14262f] border-border text-foreground hover:bg-surface-low"
                }`}
              >
                <PictureInPicture2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300 shrink-0" />
                <span className="truncate">{showPip ? "Hide PiP Graph" : "Launch PiP Graph"}</span>
              </button>

              <Link
                href="/analytics"
                onClick={() => sound.playSoft()}
                className="px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#14262f] border border-border text-foreground hover:bg-surface-low transition-all shadow-2xs flex items-center justify-center gap-1.5"
              >
                <LineChartIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">Analytics Engine</span>
              </Link>

              <button
                type="button"
                onClick={handleDownloadPacket}
                className="px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#14262f] border border-border text-foreground hover:bg-surface-low transition-all shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">Checklist</span>
              </button>
            </div>
          </div>

          {toastMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between animate-fade-in-up shadow-xs">
              <span className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                {toastMsg}
              </span>
              <button type="button" onClick={() => setToastMsg(null)} className="text-[11px] font-bold underline">
                Dismiss
              </button>
            </div>
          )}

          {/* 4 Stat Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  FAMILY HISTORY
                </span>
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-foreground">{relativesCount}</span>
                <span className="text-xs text-foreground font-semibold ml-1">Relatives logged</span>
              </div>
              <div className="pt-1 border-t border-border/60 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>3 generations • Encrypted</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  LIVE VITALS TELEMETRY
                </span>
                <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-foreground">{liveVitals.hr}</span>
                <span className="text-xs text-foreground font-semibold ml-1">BPM • {liveVitals.spo2}% SpO2</span>
              </div>
              <div className="pt-1 border-t border-border/60 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                BP: {liveVitals.systolic}/{liveVitals.diastolic} mmHg calibrated
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  CURATED DISEASES
                </span>
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-foreground">1,428</span>
                <span className="text-xs text-foreground font-semibold ml-1">Indexed loci</span>
              </div>
              <div className="pt-1 border-t border-border/60 text-[10px] text-teal-700 dark:text-teal-300 font-medium">
                ClinVar v2.4 & Orphanet
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  CONSULTATION PREP
                </span>
                <Network className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-foreground">{prepProgress}%</span>
                <span className="text-xs text-foreground font-semibold ml-1">Readiness score</span>
              </div>
              <div className="pt-1 border-t border-border/60 text-[10px] text-muted-foreground truncate">
                {completedCount}/{prepTopics.length} clinician questions ready
              </div>
            </div>
          </div>

          {/* Dynamic Healthcare Analytics & PiP Graph Section inside Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 8 cols: Dynamic Recharts Trend & Bar/Line/Area Switcher */}
            <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>HEALTHCARE ANALYTICS & TELEMETRY TRENDS</span>
                  </div>
                  <h2 className="text-base font-bold text-foreground">
                    Longitudinal Signal & Variant Coverage Graph
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap py-0.5 max-w-full">
                  <div className="inline-flex rounded-lg bg-surface-low border border-border p-0.5 text-[11px] font-semibold">
                    {(["cardio", "telemetry", "genomics"] as DashDataset[]).map((ds) => (
                      <button
                        key={ds}
                        type="button"
                        onClick={() => {
                          sound.playSoft();
                          setDashDataset(ds);
                        }}
                        className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                          dashDataset === ds
                            ? "bg-teal-700 text-white shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {ds === "cardio" ? "BP" : ds === "telemetry" ? "HR/SpO2" : "Genomics"}
                      </button>
                    ))}
                  </div>

                  <div className="inline-flex rounded-lg bg-surface-low border border-border p-0.5 text-[11px] font-semibold">
                    {(["area", "line", "bar"] as DashChartType[]).map((ct) => (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => {
                          sound.playSoft();
                          setDashChartType(ct);
                        }}
                        className={`p-1.5 rounded-md transition-colors ${
                          dashChartType === ct
                            ? "bg-white dark:bg-[#1b333e] text-primary shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title={`${ct} chart`}
                      >
                        {ct === "area" ? (
                          <Layers className="w-3.5 h-3.5" />
                        ) : ct === "line" ? (
                          <LineChartIcon className="w-3.5 h-3.5" />
                        ) : (
                          <BarChart3 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="inline-flex rounded-lg bg-surface-low border border-border p-0.5 text-[11px] font-semibold">
                    {(["7d", "30d", "90d"] as DashRange[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          sound.playSoft();
                          setDashRange(r);
                        }}
                        className={`px-2 py-1 rounded-md transition-colors ${
                          dashRange === r
                            ? "bg-primary text-white shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-60 w-full rounded-xl bg-surface-low/60 border border-border/70 p-2 sm:p-3">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    {dashChartType === "bar" ? (
                      <BarChart data={chartSeries} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,140,140,0.16)" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                        <Tooltip cursor={CLINICAL_TOOLTIP_CURSOR} content={<ClinicalChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                        <Bar dataKey={datasetConfig.primaryKey} name={datasetConfig.primaryName} fill={datasetConfig.primaryColor} radius={[5, 5, 0, 0]} />
                        <Bar dataKey={datasetConfig.secondaryKey} name={datasetConfig.secondaryName} fill={datasetConfig.secondaryColor} radius={[5, 5, 0, 0]} />
                      </BarChart>
                    ) : dashChartType === "line" ? (
                      <LineChart data={chartSeries} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,140,140,0.16)" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                        <Tooltip cursor={CLINICAL_TOOLTIP_CURSOR} content={<ClinicalChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                        <Line
                          type="monotone"
                          dataKey={datasetConfig.primaryKey}
                          name={datasetConfig.primaryName}
                          stroke={datasetConfig.primaryColor}
                          strokeWidth={2.75}
                          dot={{ r: 3.5, strokeWidth: 1.5, stroke: "#ffffff", fill: datasetConfig.primaryColor }}
                          activeDot={{ r: 5.5, strokeWidth: 2, stroke: "#ffffff", fill: datasetConfig.primaryColor }}
                        />
                        <Line
                          type="monotone"
                          dataKey={datasetConfig.secondaryKey}
                          name={datasetConfig.secondaryName}
                          stroke={datasetConfig.secondaryColor}
                          strokeWidth={2.25}
                          dot={{ r: 3.5, strokeWidth: 1.5, stroke: "#ffffff", fill: datasetConfig.secondaryColor }}
                          activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff", fill: datasetConfig.secondaryColor }}
                        />
                      </LineChart>
                    ) : (
                      <AreaChart data={chartSeries} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                        <defs>
                          <linearGradient id="dashPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={datasetConfig.primaryColor} stopOpacity={0.34} />
                            <stop offset="95%" stopColor={datasetConfig.primaryColor} stopOpacity={0.03} />
                          </linearGradient>
                          <linearGradient id="dashSecGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={datasetConfig.secondaryColor} stopOpacity={0.28} />
                            <stop offset="95%" stopColor={datasetConfig.secondaryColor} stopOpacity={0.03} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,140,140,0.16)" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                        <Tooltip cursor={CLINICAL_TOOLTIP_CURSOR} content={<ClinicalChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                        <Area
                          type="monotone"
                          dataKey={datasetConfig.primaryKey}
                          name={datasetConfig.primaryName}
                          stroke={datasetConfig.primaryColor}
                          strokeWidth={2.75}
                          fill="url(#dashPrimaryGrad)"
                          activeDot={{ r: 5.5, strokeWidth: 2, stroke: "#ffffff", fill: datasetConfig.primaryColor }}
                        />
                        <Area
                          type="monotone"
                          dataKey={datasetConfig.secondaryKey}
                          name={datasetConfig.secondaryName}
                          stroke={datasetConfig.secondaryColor}
                          strokeWidth={2.25}
                          fill="url(#dashSecGrad)"
                          activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff", fill: datasetConfig.secondaryColor }}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowPip(true);
                  }}
                  className="inline-flex items-center gap-1.5 font-bold text-teal-700 dark:text-teal-300 hover:underline"
                >
                  <PictureInPicture2 className="w-3.5 h-3.5" />
                  <span>Detach into Floating PiP Monitor</span>
                </button>
                <Link
                  href="/analytics"
                  onClick={() => sound.playSoft()}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <span>Open Full Healthcare Analytics Engine</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Right 4 cols: Clickable Cohort Distribution Donut */}
            <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  <PieChartIcon className="w-3.5 h-3.5" />
                  <span>GENOMIC CATALOG DISTRIBUTION</span>
                </div>
                <h3 className="text-base font-bold text-foreground">Cohort Mix by Category</h3>
              </div>

              <div className="h-44 w-full">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={COHORT_BREAKDOWN}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={68}
                        paddingAngle={3}
                        onClick={(entry: { name?: string }) => {
                          if (entry?.name) {
                            sound.playSoft();
                            setActiveFilter(entry.name);
                          }
                        }}
                      >
                        {COHORT_BREAKDOWN.map((seg) => (
                          <Cell
                            key={seg.name}
                            fill={seg.color}
                            opacity={activeFilter === seg.name ? 1 : 0.72}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ClinicalChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="space-y-1.5 text-[11px]">
                {COHORT_BREAKDOWN.map((seg) => (
                  <button
                    key={seg.name}
                    type="button"
                    onClick={() => {
                      sound.playSoft();
                      setActiveFilter(seg.name);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all ${
                      activeFilter === seg.name
                        ? "border-teal-600/50 bg-teal-500/10 font-bold"
                        : "border-border/70 bg-surface-low/60 hover:bg-surface-low"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="truncate">{seg.name}</span>
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {seg.count} ({seg.share})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main 2-Column Desktop Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 of 12 columns) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Card 1: Module In Progress */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Module In Progress</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated 8 mins remaining</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Understanding X-Linked Recessive Inheritance in Hemophilia
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Explore carrier genetics, maternal inheritance pathways, and clinical manifestation factors in coagulation factor genes (F8 & F9).
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[11px] font-medium text-muted-foreground">Module Completion</span>
                    <span className="font-bold text-teal-700 dark:text-teal-300">65% Completed</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-low overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 rounded-full w-[65%]" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowModuleModal(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#004d47] hover:bg-[#003833] text-white transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <span>Resume Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 2: Quick Disease & Gene Lookup */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Quick Disease & Gene Lookup
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cross-reference phenotype markers with NCBI and Kaggle biomedical clusters
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by gene symbol (e.g. BRCA1, CFTR, HBB) or disease name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-28 py-2 text-xs rounded-xl border border-border bg-surface-low text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#1b2f3a] border border-border text-muted-foreground">
                    Kaggle v2.4
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">
                    Quick Filters:
                  </span>
                  {QUICK_FILTERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        sound.playSoft();
                        setActiveFilter(f);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        activeFilter === f && !searchQuery
                          ? "bg-teal-700 text-white shadow-2xs font-semibold"
                          : "bg-surface-low border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-1">
                  {filteredLookup.map((item) => (
                    <Link
                      key={item.gene}
                      href="/diseases"
                      onClick={() => sound.playSoft()}
                      className="p-3.5 rounded-xl border border-border bg-surface-low/70 hover:bg-surface-low hover:border-teal-500/50 transition-all flex items-center justify-between group text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                          <Dna className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-foreground">{item.gene}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">• {item.locus}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{item.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-[#14262f] border border-border text-muted-foreground">
                          {item.inheritance}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Card 3: Recent Activity */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
                  <Link
                    href="/reports"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View audit log</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-2.5 text-xs">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="p-3 rounded-xl bg-surface-low border border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-700 flex items-center justify-center">
                          {act.kind === "family" ? (
                            <Users className="w-4 h-4" />
                          ) : act.kind === "download" ? (
                            <Download className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{act.title}</p>
                          <p className="text-[11px] text-muted-foreground">{act.meta}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (4 of 12 columns) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Fact of the Day */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GENOMIC INSIGHT</span>
                </span>
                <h4 className="text-xs font-bold text-foreground">Fact of the Day</h4>
                <blockquote className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-teal-500 pl-3">
                  &ldquo;A genetic variant is simply a difference in DNA sequence. Over 99% of variants are benign and do not cause health conditions.&rdquo;
                </blockquote>
                <div className="pt-1 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Source: NHGRI Genome Data</span>
                  <Link href="/research" className="text-primary hover:underline font-medium">
                    Read Article &rarr;
                  </Link>
                </div>
              </div>

              {/* Doctor Prep Checklist */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">Doctor Prep</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200">
                    {completedCount}/{prepTopics.length} Ready
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Questions to ask a certified genetic counselor or primary physician:
                </p>

                <div className="space-y-2">
                  {prepTopics.map((item) => (
                    <label
                      key={item.id}
                      onClick={() => toggleTopic(item.id)}
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                        item.done
                          ? "bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/60"
                          : "bg-surface-low border-border"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-border text-teal-700 focus:ring-teal-700"
                      />
                      <span className={`leading-relaxed text-[11px] ${item.done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {item.title}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPacket}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Geneticist Packet</span>
                </button>
              </div>

              {/* Privacy & Data Control */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-foreground font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Privacy & Data Control</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Your genetic inquiries and family records are client-encrypted. We do not sell or monetize personal health inquiries.
                </p>
                <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Row Level Security Active
                  </span>
                  <span>Zero Third-Party Tracking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Modal: Active Guide (Hemophilia F8/F9) */}
          {showModuleModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#14262f] rounded-2xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      Module In Progress • 65% Completed
                    </span>
                    <h3 className="font-bold text-sm text-foreground">
                      X-Linked Recessive Inheritance in Hemophilia
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModuleModal(false)}
                    className="p-1 rounded-lg text-muted-foreground hover:bg-surface-low"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3 rounded-xl bg-surface-low border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Key Biological Findings</span>
                    <p className="text-foreground">
                      Hemophilia A is caused by pathogenic variants in the <strong>F8 gene (Xq28)</strong>, while Hemophilia B affects <strong>F9 (Xq27.1)</strong>.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Because males are hemizygous (XY), possessing one mutant X chromosome produces severe bleeding phenotype. Female carriers (XX) have 50% carrier risk transmission to daughters.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="text-[11px] text-teal-900 dark:text-teal-200">
                      Your progress has been auto-saved to your local client vault.
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModuleModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 transition-all shadow-2xs"
                  >
                    Continue Reading
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Modal: Add Family Member */}
          {showAddMemberModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#14262f] rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Pedigree Workspace
                    </span>
                    <h3 className="font-bold text-sm text-foreground">
                      Document Family Relative
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="p-1 rounded-lg text-muted-foreground hover:bg-surface-low"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-foreground block mb-1">Relative Identifier</label>
                    <input
                      type="text"
                      placeholder="e.g. Relative D or Maternal Aunt"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">Generational Branch</label>
                    <select
                      value={newMember.relationship}
                      onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground"
                    >
                      <option>Paternal Branch (Father/Grandfather)</option>
                      <option>Maternal Branch (Mother/Grandmother)</option>
                      <option>Sibling / Immediate</option>
                      <option>Offspring (Child)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">Documented Condition</label>
                    <input
                      type="text"
                      placeholder="e.g. Type 2 Diabetes, Early CAD, None"
                      value={newMember.condition}
                      onChange={(e) => setNewMember({ ...newMember, condition: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-surface-low"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewRelative}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#004d47] text-white hover:bg-[#003833] transition-all shadow-2xs"
                  >
                    Save Encrypted Relative
                  </button>
                </div>
              </div>
            </div>
          )}

          <SafetyNotice />
        </main>
      </div>

      {/* Floating PiP Telemetry Window */}
      <PipTelemetryWidget
        isOpen={showPip}
        onClose={() => setShowPip(false)}
        isStreaming={isPipStreaming}
        onToggleStream={() => setIsPipStreaming((v) => !v)}
        heartRate={liveVitals.hr}
        spo2={liveVitals.spo2}
        bpSystolic={liveVitals.systolic}
        bpDiastolic={liveVitals.diastolic}
        series={pipLiveHistory}
        analyticsHref="/analytics"
      />
    </div>
  );
}
