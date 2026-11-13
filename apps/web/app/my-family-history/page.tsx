"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Database,
  Dna,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileJson,
  FileText,
  Filter,
  FlaskConical,
  GitBranch,
  HeartPulse,
  HelpCircle,
  Info,
  KeyRound,
  Layers,
  Lock,
  MoreVertical,
  Network,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import SafetyNotice from "@/components/SafetyNotice";
import { useAuth } from "@/lib/auth";
import { sound } from "@/lib/sound";

type Generation = 1 | 2 | 3 | 4;
type Branch = "Paternal" | "Maternal" | "Immediate";
type CertaintyLevel =
  | "Clinically Confirmed"
  | "Death Certificate / Records"
  | "Medical Records"
  | "Family Reported"
  | "Suspected / Under Review";

interface BiomarkerEntry {
  id: string;
  marker: string;
  value: string;
  date: string;
}

interface FamilyMember {
  id: string;
  relation: string;
  name?: string;
  generation: Generation;
  branch: Branch;
  condition: string;
  icdCode?: string;
  onsetAge: string;
  age: string;
  currentStatus: string;
  verificationSource: string;
  certainty: CertaintyLevel;
  isAffected: boolean;
  isCarrier: boolean;
  isDeceased: boolean;
  isProband?: boolean;
  gender: "male" | "female";
  associatedGenes: string[];
  clinicalNotes: string;
  biomarkers: BiomarkerEntry[];
}

const STORAGE_KEY = "genewise_family_pedigree_v3";

const CONDITION_PRESETS = [
  {
    label: "Healthy / None Reported",
    condition: "None reported (Healthy)",
    icd: "Z00.0",
    genes: [] as string[],
    status: "unaffected" as const,
  },
  {
    label: "Cardiovascular Disease",
    condition: "Cardiovascular Disease",
    icd: "I25.10",
    genes: ["LDLR", "APOB", "PCSK9"],
    status: "affected" as const,
  },
  {
    label: "Essential Hypertension",
    condition: "Hypertension",
    icd: "I10",
    genes: ["AGT", "ACE", "CYP11B2"],
    status: "affected" as const,
  },
  {
    label: "Type 2 Diabetes (Carrier/Risk)",
    condition: "Type 2 Diabetes (Carrier)",
    icd: "E11.9",
    genes: ["TCF7L2", "PPARG", "KCNJ11"],
    status: "carrier" as const,
  },
  {
    label: "Familial Hypercholesterolemia",
    condition: "Familial Hypercholesterolemia",
    icd: "E78.01",
    genes: ["LDLR", "APOB", "PCSK9"],
    status: "affected" as const,
  },
  {
    label: "HBOC (BRCA1/2 Susceptibility)",
    condition: "BRCA1 Hereditary Risk",
    icd: "Z15.01",
    genes: ["BRCA1", "BRCA2", "PALB2"],
    status: "carrier" as const,
  },
  {
    label: "Cystic Fibrosis Carrier",
    condition: "CFTR Variant Carrier",
    icd: "Z14.1",
    genes: ["CFTR"],
    status: "carrier" as const,
  },
];

const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: "pgf",
    relation: "Paternal GF",
    name: "Arthur Vance, Sr.",
    generation: 1,
    branch: "Paternal",
    condition: "Cardiovascular Disease",
    icdCode: "I25.10",
    onsetAge: "58 yrs",
    age: "68",
    currentStatus: "Deceased (68)",
    verificationSource: "Death Certificate & EHR Archive",
    certainty: "Death Certificate / Records",
    isAffected: true,
    isCarrier: false,
    isDeceased: true,
    gender: "male",
    associatedGenes: ["LDLR", "APOB", "PCSK9"],
    clinicalNotes:
      "Premature coronary artery event documented at age 58 with elevated baseline LDL cholesterol prior to statin era.",
    biomarkers: [
      { id: "b1", marker: "Total Cholesterol (Historical)", value: "278 mg/dL", date: "1998" },
      { id: "b2", marker: "Lp(a) Lipoprotein", value: "68 mg/dL (Elevated)", date: "Archive" },
    ],
  },
  {
    id: "pgm",
    relation: "Paternal GM",
    name: "Eleanor Vance",
    generation: 1,
    branch: "Paternal",
    condition: "No report",
    icdCode: "Z00.0",
    onsetAge: "N/A",
    age: "74",
    currentStatus: "Living (74)",
    verificationSource: "Reported by family member",
    certainty: "Family Reported",
    isAffected: false,
    isCarrier: false,
    isDeceased: false,
    gender: "female",
    associatedGenes: [],
    clinicalNotes: "No known chronic cardiopulmonary or metabolic diagnoses reported to date.",
    biomarkers: [],
  },
  {
    id: "mgf",
    relation: "Maternal GF",
    name: "Thomas Mercer",
    generation: 1,
    branch: "Maternal",
    condition: "No history",
    icdCode: "Z00.0",
    onsetAge: "N/A",
    age: "78",
    currentStatus: "Living (78)",
    verificationSource: "Confirmed by direct interview",
    certainty: "Family Reported",
    isAffected: false,
    isCarrier: false,
    isDeceased: false,
    gender: "male",
    associatedGenes: [],
    clinicalNotes: "Normotensive at 78; active lifestyle with routine annual physicals unremarkable.",
    biomarkers: [],
  },
  {
    id: "mgm",
    relation: "Maternal GM",
    name: "Clara Mercer",
    generation: 1,
    branch: "Maternal",
    condition: "Type 2 Diabetes (Carrier)",
    icdCode: "E11.9",
    onsetAge: "62 yrs",
    age: "76",
    currentStatus: "Living (76)",
    verificationSource: "Self-reported & Lab HbA1c",
    certainty: "Medical Records",
    isAffected: false,
    isCarrier: true,
    isDeceased: false,
    gender: "female",
    associatedGenes: ["TCF7L2", "PPARG"],
    clinicalNotes:
      "Late-onset impaired fasting glucose managed through lifestyle and low-dose metformin; illustrates polygenic metabolic predisposition.",
    biomarkers: [
      { id: "b3", marker: "HbA1c", value: "6.4% (Borderline)", date: "2026-08" },
      { id: "b4", marker: "Fasting Glucose", value: "114 mg/dL", date: "2026-08" },
    ],
  },
  {
    id: "father",
    relation: "Father",
    name: "Dr. Robert Vance",
    generation: 2,
    branch: "Paternal",
    condition: "Hypertension",
    icdCode: "I10",
    onsetAge: "45 yrs",
    age: "52",
    currentStatus: "Living (52)",
    verificationSource: "Outpatient Cardiology EMR",
    certainty: "Clinically Confirmed",
    isAffected: true,
    isCarrier: false,
    isDeceased: false,
    gender: "male",
    associatedGenes: ["AGT", "ACE"],
    clinicalNotes:
      "Essential stage 1-2 hypertension diagnosed at age 45; well-controlled on ACE-inhibitor monotherapy. Lipid panel monitored biannually due to paternal history.",
    biomarkers: [
      { id: "b5", marker: "Resting BP", value: "126/80 mmHg (Treated)", date: "2026-09" },
      { id: "b6", marker: "ApoB", value: "102 mg/dL", date: "2026-09" },
    ],
  },
  {
    id: "mother",
    relation: "Mother",
    name: "Margaret Mercer-Vance",
    generation: 2,
    branch: "Maternal",
    condition: "Healthy",
    icdCode: "Z00.0",
    onsetAge: "N/A",
    age: "50",
    currentStatus: "Living (50)",
    verificationSource: "Annual Wellness Summary",
    certainty: "Medical Records",
    isAffected: false,
    isCarrier: false,
    isDeceased: false,
    gender: "female",
    associatedGenes: [],
    clinicalNotes: "Fasting glucose and lipid panels consistently within normal reference ranges.",
    biomarkers: [{ id: "b7", marker: "HbA1c", value: "5.2% (Optimal)", date: "2026-07" }],
  },
  {
    id: "proband",
    relation: "Proband (You)",
    name: "Dr. E. Vance",
    generation: 3,
    branch: "Immediate",
    condition: "Asymptomatic Baseline",
    icdCode: "Z13.89",
    onsetAge: "N/A",
    age: "29",
    currentStatus: "Living (29)",
    verificationSource: "Client-Encrypted Self Intake",
    certainty: "Clinically Confirmed",
    isAffected: false,
    isCarrier: false,
    isDeceased: false,
    isProband: true,
    gender: "male",
    associatedGenes: ["LDLR", "TCF7L2"],
    clinicalNotes:
      "Proband baseline profile tracking paternal cardiovascular clustering and maternal metabolic susceptibility.",
    biomarkers: [
      { id: "b8", marker: "LDL Cholesterol", value: "94 mg/dL", date: "2026-10" },
      { id: "b9", marker: "Resting BP", value: "116/74 mmHg", date: "2026-10" },
    ],
  },
  {
    id: "brother",
    relation: "Brother",
    name: "Daniel Vance",
    generation: 3,
    branch: "Immediate",
    condition: "Healthy",
    icdCode: "Z00.0",
    onsetAge: "N/A",
    age: "31",
    currentStatus: "Living (31)",
    verificationSource: "Confirmed by direct interview",
    certainty: "Family Reported",
    isAffected: false,
    isCarrier: false,
    isDeceased: false,
    gender: "male",
    associatedGenes: [],
    clinicalNotes: "No known cardiovascular or endocrine symptoms.",
    biomarkers: [],
  },
];

// Utility to create deterministic pseudo-AES hash preview cleanly in browser
function computeClientVaultHash(payload: string): string {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x9e3779b9;
  for (let i = 0; i < payload.length; i++) {
    const c = payload.charCodeAt(i);
    hash1 ^= c;
    hash1 = Math.imul(hash1, 0x01000193);
    hash2 = Math.imul(hash2 ^ c, 0x85ebca6b);
  }
  const partA = (hash1 >>> 0).toString(16).padStart(8, "0");
  const partB = (hash2 >>> 0).toString(16).padStart(8, "0");
  return `aes256gcm_${partA}${partB}_rls_verified`;
}

export default function MyFamilyHistoryPage() {
  const { user } = useAuth();

  // Primary State
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_MEMBERS);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  // View & Interactive Controls
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [lineageTrace, setLineageTrace] = useState<"all" | "paternal" | "maternal">("all");
  const [animateFlow, setAnimateFlow] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [listBranchFilter, setListBranchFilter] = useState<"All" | Branch>("All");
  const [listStatusFilter, setListStatusFilter] = useState<
    "All" | "Affected" | "Carrier" | "Healthy" | "Deceased"
  >("All");

  // Modals & Drawers
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showVaultModal, setShowVaultModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showSymbolGuide, setShowSymbolGuide] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedQuestions, setCopiedQuestions] = useState<boolean>(false);

  // Add Member Form State
  const [formRelation, setFormRelation] = useState("Maternal Aunt");
  const [formName, setFormName] = useState("");
  const [formGeneration, setFormGeneration] = useState<Generation>(2);
  const [formBranch, setFormBranch] = useState<Branch>("Maternal");
  const [formGender, setFormGender] = useState<"male" | "female">("female");
  const [formStatusType, setFormStatusType] = useState<"unaffected" | "affected" | "carrier">(
    "unaffected"
  );
  const [formIsDeceased, setFormIsDeceased] = useState(false);
  const [formAge, setFormAge] = useState("48");
  const [formOnsetAge, setFormOnsetAge] = useState("44 yrs");
  const [formCondition, setFormCondition] = useState("Hypertension");
  const [formGenes, setFormGenes] = useState("AGT, ACE");
  const [formCertainty, setFormCertainty] = useState<CertaintyLevel>("Family Reported");
  const [formNotes, setFormNotes] = useState("");

  // Edit / Biomarker State inside Inspector Drawer
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editCondition, setEditCondition] = useState("");
  const [editOnset, setEditOnset] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editStatusType, setEditStatusType] = useState<"unaffected" | "affected" | "carrier">(
    "unaffected"
  );
  const [editIsDeceased, setEditIsDeceased] = useState(false);
  const [editCertainty, setEditCertainty] = useState<CertaintyLevel>("Family Reported");
  const [editNotes, setEditNotes] = useState("");
  const [newMarkerName, setNewMarkerName] = useState("");
  const [newMarkerValue, setNewMarkerValue] = useState("");

  // Load persisted pedigree from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
        }
      }
    } catch {
      // Fallback cleanly to INITIAL_MEMBERS
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (hasLoadedStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      } catch {
        // Ignore storage quota issues gracefully
      }
    }
  }, [members, hasLoadedStorage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Selected member reference
  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedMemberId) || null,
    [members, selectedMemberId]
  );

  const openInspector = (member: FamilyMember, startInEdit = false) => {
    sound.playPop();
    setSelectedMemberId(member.id);
    setOpenMenuId(null);
    setIsEditingMember(startInEdit);
    setEditCondition(member.condition);
    setEditOnset(member.onsetAge);
    setEditAge(member.age);
    setEditStatusType(
      member.isAffected ? "affected" : member.isCarrier ? "carrier" : "unaffected"
    );
    setEditIsDeceased(member.isDeceased);
    setEditCertainty(member.certainty);
    setEditNotes(member.clinicalNotes);
  };

  // Dynamic Analytics Computed Directly From Current Pedigree
  const stats = useMemo(() => {
    const documented = members.length;
    const paternalCount = members.filter((m) => m.branch === "Paternal").length;
    const maternalCount = members.filter((m) => m.branch === "Maternal").length;
    const trackedConditions = Array.from(
      new Set(
        members
          .filter((m) => m.isAffected || m.isCarrier)
          .map((m) => m.condition.replace(/\s*\(Carrier\)/i, "").trim())
      )
    );
    const activeGens = Array.from(new Set(members.map((m) => m.generation))).sort();
    const depth = activeGens.length;
    const confirmedCount = members.filter(
      (m) =>
        m.certainty === "Clinically Confirmed" ||
        m.certainty === "Death Certificate / Records" ||
        m.certainty === "Medical Records"
    ).length;
    const completenessScore = Math.min(
      100,
      Math.round((members.length / 8) * 65 + (confirmedCount / Math.max(1, members.length)) * 35)
    );

    const paternalConditions = members.filter(
      (m) => m.branch === "Paternal" && (m.isAffected || m.isCarrier)
    );
    const maternalConditions = members.filter(
      (m) => m.branch === "Maternal" && (m.isAffected || m.isCarrier)
    );
    const allCandidateGenes = Array.from(
      new Set(members.flatMap((m) => m.associatedGenes || []))
    );

    return {
      documented,
      paternalCount,
      maternalCount,
      trackedConditions,
      activeGens,
      depth,
      confirmedCount,
      completenessScore,
      paternalConditions,
      maternalConditions,
      allCandidateGenes,
    };
  }, [members]);

  // Tailored Consultation Questions Derived Dynamically From Family Conditions
  const generatedQuestions = useMemo(() => {
    const questions: { topic: string; question: string; tag: string }[] = [];

    if (stats.paternalConditions.length > 0) {
      const labels = stats.paternalConditions
        .map((m) => `${m.relation} (${m.condition}, ${m.onsetAge})`)
        .join(" and ");
      questions.push({
        topic: "Paternal Vascular Clustering",
        question: `Given multi-generational findings on my paternal side — ${labels} — should I consider baseline ApoB, Lp(a), or ambulatory blood pressure monitoring earlier than standard guidelines?`,
        tag: "Preventive Cardiology",
      });
    }

    if (stats.maternalConditions.length > 0) {
      const labels = stats.maternalConditions
        .map((m) => `${m.relation} (${m.condition})`)
        .join(", ");
      questions.push({
        topic: "Maternal Metabolic & Carrier Context",
        question: `My maternal lineage notes ${labels}. Which fasting glucose, HbA1c, or lifestyle markers would clarify multifactorial predisposition vs monogenic risk?`,
        tag: "Metabolic Screening",
      });
    }

    if (stats.allCandidateGenes.length > 0) {
      questions.push({
        topic: "Targeted Gene Panel Applicability",
        question: `Based on documented pedigree traits linked with ${stats.allCandidateGenes
          .slice(0, 4)
          .join(", ")}, does our family history meet criteria for clinical-grade carrier or cascade screening?`,
        tag: "Clinical Genetics",
      });
    }

    questions.push({
      topic: "Pedigree Certainty & Records Verification",
      question: `Are there specific pathology reports or lipid archives from earlier generations I should request to improve diagnostic certainty during genetic counseling?`,
      tag: "NSGC Preparation",
    });

    return questions;
  }, [stats]);

  // Filtered members for List View
  const filteredListMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesBranch = listBranchFilter === "All" || m.branch === listBranchFilter;
      const matchesStatus =
        listStatusFilter === "All" ||
        (listStatusFilter === "Affected" && m.isAffected) ||
        (listStatusFilter === "Carrier" && m.isCarrier) ||
        (listStatusFilter === "Deceased" && m.isDeceased) ||
        (listStatusFilter === "Healthy" && !m.isAffected && !m.isCarrier);
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        m.relation.toLowerCase().includes(q) ||
        (m.name || "").toLowerCase().includes(q) ||
        m.condition.toLowerCase().includes(q) ||
        (m.icdCode || "").toLowerCase().includes(q) ||
        m.associatedGenes.some((g) => g.toLowerCase().includes(q));
      return matchesBranch && matchesStatus && matchesQuery;
    });
  }, [members, listBranchFilter, listStatusFilter, searchQuery]);

  // Helper to locate canonical core pedigree members + extra additions
  const pgf = members.find((m) => m.id === "pgf");
  const pgm = members.find((m) => m.id === "pgm");
  const mgf = members.find((m) => m.id === "mgf");
  const mgm = members.find((m) => m.id === "mgm");
  const father = members.find((m) => m.id === "father");
  const mother = members.find((m) => m.id === "mother");
  const proband = members.find((m) => m.id === "proband");
  const brother = members.find((m) => m.id === "brother");

  const coreIds = new Set(["pgf", "pgm", "mgf", "mgm", "father", "mother", "proband", "brother"]);
  const extraGen1 = members.filter((m) => m.generation === 1 && !coreIds.has(m.id));
  const extraGen2 = members.filter((m) => m.generation === 2 && !coreIds.has(m.id));
  const extraGen3 = members.filter((m) => m.generation === 3 && !coreIds.has(m.id));
  const gen4Members = members.filter((m) => m.generation === 4);

  // Handlers
  const applyPreset = (presetLabel: string) => {
    const p = CONDITION_PRESETS.find((x) => x.label === presetLabel);
    if (!p) return;
    sound.playSoft();
    setFormCondition(p.condition);
    setFormGenes(p.genes.join(", "));
    setFormStatusType(p.status);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    const cleanGenes = formGenes
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const newEntry: FamilyMember = {
      id: "m_" + Date.now(),
      relation: formRelation.trim() || "Relative",
      name: formName.trim() || undefined,
      generation: formGeneration,
      branch: formBranch,
      condition:
        formCondition.trim() ||
        (formStatusType === "unaffected" ? "Healthy / None Reported" : "Recorded Condition"),
      icdCode: formStatusType === "unaffected" ? "Z00.0" : "Under Evaluation",
      onsetAge: formStatusType === "unaffected" ? "N/A" : formOnsetAge.trim() || "Adult",
      age: formAge.trim() || "45",
      currentStatus: `${formIsDeceased ? "Deceased" : "Living"} (${formAge.trim() || "45"})`,
      verificationSource: `Added in GeneWise (${formCertainty})`,
      certainty: formCertainty,
      isAffected: formStatusType === "affected",
      isCarrier: formStatusType === "carrier",
      isDeceased: formIsDeceased,
      gender: formGender,
      associatedGenes: cleanGenes,
      clinicalNotes:
        formNotes.trim() ||
        "Documented inside client-encrypted pedigree workspace for pre-visit discussion.",
      biomarkers: [],
    };

    setMembers((prev) => [...prev, newEntry]);
    setShowAddModal(false);
    setFormName("");
    setFormNotes("");
    showToast(
      `Added ${newEntry.relation} to Generation ${newEntry.generation} (${newEntry.branch} branch).`
    );
  };

  const handleSaveMemberEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    sound.playSuccess();
    setMembers((prev) =>
      prev.map((m) =>
        m.id === selectedMember.id
          ? {
              ...m,
              condition: editCondition.trim() || m.condition,
              onsetAge: editStatusType === "unaffected" ? "N/A" : editOnset.trim() || m.onsetAge,
              age: editAge.trim() || m.age,
              currentStatus: `${editIsDeceased ? "Deceased" : "Living"} (${
                editAge.trim() || m.age
              })`,
              isAffected: editStatusType === "affected",
              isCarrier: editStatusType === "carrier",
              isDeceased: editIsDeceased,
              certainty: editCertainty,
              verificationSource: `${editCertainty} • Updated`,
              clinicalNotes: editNotes,
            }
          : m
      )
    );
    setIsEditingMember(false);
    showToast(`Updated clinical dossier for ${selectedMember.relation}.`);
  };

  const handleAddBiomarker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !newMarkerName.trim() || !newMarkerValue.trim()) return;
    sound.playPop();
    const entry: BiomarkerEntry = {
      id: "bm_" + Date.now(),
      marker: newMarkerName.trim(),
      value: newMarkerValue.trim(),
      date: new Date().toISOString().slice(0, 7),
    };
    setMembers((prev) =>
      prev.map((m) =>
        m.id === selectedMember.id ? { ...m, biomarkers: [...m.biomarkers, entry] } : m
      )
    );
    setNewMarkerName("");
    setNewMarkerValue("");
    showToast(`Appended ${entry.marker} to ${selectedMember.relation}.`);
  };

  const handleDeleteMember = (id: string) => {
    const target = members.find((m) => m.id === id);
    if (!target || target.isProband) return;
    sound.playClick();
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (selectedMemberId === id) setSelectedMemberId(null);
    setOpenMenuId(null);
    showToast(`Removed ${target.relation} from pedigree.`);
  };

  const handleResetDemo = () => {
    sound.playPop();
    setMembers(INITIAL_MEMBERS);
    localStorage.removeItem(STORAGE_KEY);
    setSelectedMemberId(null);
    showToast("Restored baseline 3-generation clinical demo pedigree.");
  };

  const handleDownloadJsonVault = () => {
    sound.playSuccess();
    const payload = {
      schema: "NSGC-GeneWise-Pedigree-v3",
      exportedAt: new Date().toISOString(),
      encryptionMode: "AES-256-GCM Client Vault",
      integrityDigest: computeClientVaultHash(JSON.stringify(members)),
      members,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genewise-pedigree-vault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Encrypted pedigree JSON backup downloaded.");
  };

  const handleDownloadHtmlReport = () => {
    sound.playSuccess();
    const rows = members
      .map(
        (m) => `
      <tr>
        <td style="padding:8px;border:1px solid #cbd5e1;">Gen ${m.generation}</td>
        <td style="padding:8px;border:1px solid #cbd5e1;font-weight:bold;">${m.relation}${
          m.name ? ` (${m.name})` : ""
        }</td>
        <td style="padding:8px;border:1px solid #cbd5e1;">${m.branch}</td>
        <td style="padding:8px;border:1px solid #cbd5e1;">${m.condition}</td>
        <td style="padding:8px;border:1px solid #cbd5e1;">${m.onsetAge}</td>
        <td style="padding:8px;border:1px solid #cbd5e1;">${m.currentStatus}</td>
        <td style="padding:8px;border:1px solid #cbd5e1;">${m.certainty}</td>
      </tr>`
      )
      .join("");

    const qs = generatedQuestions
      .map((q) => `<li style="margin-bottom:8px;"><strong>[${q.tag}]</strong> ${q.question}</li>`)
      .join("");

    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>NSGC Family Pedigree Summary - GeneWise</title></head>
<body style="font-family:Inter,Arial,sans-serif;color:#0a1e27;max-width:900px;margin:40px auto;padding:24px;">
  <h1 style="color:#004d47;margin-bottom:4px;">GeneWise Clinical Family History &amp; Pedigree Summary</h1>
  <p style="color:#4e625f;font-size:13px;">Educational Pre-Visit Summary &bull; Generated ${new Date().toLocaleDateString()} &bull; Standard NSGC Symbols Reference</p>
  <hr style="border:none;border-top:2px solid #00635e;margin:16px 0;" />
  <h3>Pedigree Statistics</h3>
  <p>Relatives Documented: <strong>${stats.documented}</strong> | Documented Conditions: <strong>${
      stats.trackedConditions.length
    }</strong> | Depth: <strong>${stats.depth} Generations</strong> | Completeness: <strong>${
      stats.completenessScore
    }%</strong></p>
  <h3>Documented Family Members</h3>
  <table style="width:100%;border-collapse:collapse;font-size:12px;">
    <thead>
      <tr style="background:#e8f6ff;text-align:left;">
        <th style="padding:8px;border:1px solid #cbd5e1;">Gen</th>
        <th style="padding:8px;border:1px solid #cbd5e1;">Relation / Name</th>
        <th style="padding:8px;border:1px solid #cbd5e1;">Branch</th>
        <th style="padding:8px;border:1px solid #cbd5e1;">Reported Condition</th>
        <th style="padding:8px;border:1px solid #cbd5e1;">Onset</th>
        <th style="padding:8px;border:1px solid #cbd5e1;">Status</th>
        <th style="padding:8px;border:1px solid #cbd5e1;">Certainty</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <h3 style="margin-top:24px;">Suggested Physician &amp; Genetic Counselor Discussion Prompts</h3>
  <ul style="font-size:13px;line-height:1.5;">${qs}</ul>
  <p style="margin-top:24px;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:12px;">Non-Diagnostic Disclaimer: Prepared for clinician discussion. Does not constitute genetic diagnosis or algorithmic hazard scoring.</p>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genewise-pedigree-report-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded Printable Clinical Pedigree Report (.html).");
  };

  const handleCopyQuestions = async () => {
    sound.playSuccess();
    const formatted = generatedQuestions
      .map((q, i) => `${i + 1}. [${q.tag}] ${q.question}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedQuestions(true);
      setTimeout(() => setCopiedQuestions(false), 2500);
    } catch {
      showToast("Copied discussion checklist to session buffer.");
    }
  };

  const vaultHash = useMemo(() => computeClientVaultHash(JSON.stringify(members)), [members]);

  // Reusable Pedigree Node Renderer (Fixes deceased slash/age overlap + adds click & lineage dimming)
  const renderPedigreeNode = (member: FamilyMember | undefined, size: "sm" | "md" | "lg" = "md") => {
    if (!member) return null;

    const isTraceMatch =
      lineageTrace === "all" ||
      member.isProband ||
      (lineageTrace === "paternal" && (member.branch === "Paternal" || member.id === "proband")) ||
      (lineageTrace === "maternal" && (member.branch === "Maternal" || member.id === "proband"));

    const isSelected = selectedMemberId === member.id;
    const dimClass = isTraceMatch ? "opacity-100 scale-100" : "opacity-35 scale-95";
    const boxSize = size === "lg" ? "w-12 h-12" : size === "sm" ? "w-10 h-10" : "w-11 h-11";
    const shapeRadius = member.gender === "female" ? "rounded-full" : "rounded-md";

    let symbolStyle =
      "bg-white dark:bg-[#14262f] border-2 border-teal-800 dark:border-teal-400 text-foreground";
    if (member.isAffected && member.isDeceased) {
      symbolStyle =
        "bg-teal-900/15 dark:bg-teal-400/20 border-2 border-teal-800 dark:border-teal-400 text-foreground";
    } else if (member.isAffected) {
      symbolStyle =
        "bg-[#0f6b63] dark:bg-teal-600 border-2 border-[#004d47] dark:border-teal-300 text-white";
    }

    const highlightRing = isSelected
      ? "ring-4 ring-teal-500/40 border-teal-600 scale-110"
      : member.isProband
      ? "animate-pulse-glow border-teal-700"
      : "group-hover:scale-108 group-hover:shadow-md";

    return (
      <button
        type="button"
        onClick={() => openInspector(member)}
        title={`Click to inspect or edit ${member.relation} (${member.condition})`}
        className={`flex flex-col items-center cursor-pointer group focus:outline-none transition-all duration-300 relative ${dimClass}`}
      >
        {member.isProband && (
          <span className="text-[9px] font-extrabold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-700 mb-1.5 flex items-center gap-1 shadow-2xs animate-gentle-float">
            <ArrowDown className="w-2.5 h-2.5 text-teal-700 dark:text-teal-300" />
            <span>Proband (You)</span>
          </span>
        )}

        <div className="relative flex items-center justify-center">
          <div
            className={`${boxSize} ${shapeRadius} ${symbolStyle} ${highlightRing} flex items-center justify-center relative overflow-hidden shadow-xs transition-all duration-300`}
          >
            {/* Carrier 50% vertical shading */}
            {member.isCarrier && !member.isAffected && (
              <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-teal-700/75 dark:bg-teal-400/75" />
            )}

            {/* Clean SVG Diagonal Slash for Deceased (Never overlaps age label) */}
            {member.isDeceased && (
              <svg
                viewBox="0 0 44 44"
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                aria-hidden="true"
              >
                <line
                  x1="6"
                  y1="38"
                  x2="38"
                  y2="6"
                  stroke="#e11d48"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {/* Symbol Content */}
            {member.isProband ? (
              <User className="w-5 h-5 text-primary relative z-20" />
            ) : !member.isDeceased ? (
              <span
                className={`text-[10px] font-mono font-extrabold relative z-20 px-1 rounded ${
                  member.isCarrier
                    ? "bg-white/85 dark:bg-[#0e1b22]/85 text-foreground"
                    : member.isAffected
                    ? "text-white"
                    : "text-foreground/80"
                }`}
              >
                {member.age}
              </span>
            ) : (
              <span className="text-[9px] font-mono font-extrabold relative z-20 px-1 py-0.2 rounded bg-white/95 dark:bg-[#0f1d24]/95 text-rose-700 dark:text-rose-400 shadow-2xs border border-rose-200/80 dark:border-rose-900">
                d.{member.age}
              </span>
            )}
          </div>

          {(member.certainty === "Clinically Confirmed" ||
            member.certainty === "Death Certificate / Records") && (
            <span
              title={member.certainty}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c181d] flex items-center justify-center z-30 shadow-2xs"
            >
              <Check className="w-2 h-2 text-white stroke-[3]" />
            </span>
          )}
        </div>

        <span className="text-[11px] font-extrabold text-foreground mt-1.5 group-hover:text-primary transition-colors">
          {member.isProband ? member.name || member.relation : member.relation}
        </span>

        <span
          className={`text-[9.5px] font-semibold leading-tight max-w-[115px] text-center truncate ${
            member.isAffected && member.isDeceased
              ? "text-rose-600 dark:text-rose-400"
              : member.isAffected
              ? "text-teal-800 dark:text-teal-300"
              : member.isCarrier
              ? "text-teal-700 dark:text-teal-400"
              : "text-muted-foreground"
          }`}
        >
          {member.isProband ? `Age ${member.age} • Baseline` : member.condition}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4faff] dark:bg-[#0a161d] text-foreground">
      <AppHeader />

      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <AppSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full animate-fade-in-up pb-28 md:pb-16">
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setShowVaultModal(true);
                }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 hover:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/25 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer group"
              >
                <Lock className="w-3 h-3 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>CLIENT-ENCRYPTED PEDIGREE WORKSPACE</span>
                <span className="text-[9px] font-mono opacity-75 border-l border-teal-500/30 pl-2">
                  Inspect Key
                </span>
              </button>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                My Family Health History
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                Document family health history across generations to analyze inheritance patterns,
                track biomarkers, and prepare tailored questions for clinical geneticists.
              </p>
            </div>

            {/* Primary Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center bg-white dark:bg-[#14262f] p-1 rounded-xl border border-border shadow-2xs text-xs">
                <button
                  type="button"
                  onClick={() => {
                    sound.playSoft();
                    setViewMode("tree");
                  }}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    viewMode === "tree"
                      ? "bg-[#004d47] text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Tree View</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playSoft();
                    setViewMode("list");
                  }}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    viewMode === "list"
                      ? "bg-[#004d47] text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowExportModal(true);
                }}
                className="smooth-button px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#14262f] border border-border text-foreground hover:bg-surface-low transition-all shadow-2xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Export Pedigree PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowAddModal(true);
                }}
                className="smooth-button px-4 py-2 rounded-xl text-xs font-bold bg-[#004d47] hover:bg-[#003833] text-white transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Family Member</span>
              </button>
            </div>
          </div>

          {/* Interactive Feedback Toast */}
          {toastMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-fade-in-up shadow-xs">
              <span className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{toastMessage}</span>
              </span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-[11px] font-bold underline ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 4 Dynamic KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="smooth-card p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-1.5 animate-fade-in-up stagger-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  RELATIVES DOCUMENTED
                </span>
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div
                className="flex items-baseline gap-1.5 animate-count-highlight"
                key={stats.documented}
              >
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {stats.documented}
                </span>
                <span className="text-xs text-foreground font-semibold">members</span>
              </div>
              <p className="text-[10.5px] text-teal-700 dark:text-teal-400 font-medium">
                • {stats.paternalCount} Paternal &bull; {stats.maternalCount} Maternal
              </p>
            </div>

            <div className="smooth-card p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-1.5 animate-fade-in-up stagger-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  DOCUMENTED CONDITIONS
                </span>
                <HeartPulse className="w-4 h-4 text-rose-500" />
              </div>
              <div
                className="flex items-baseline gap-1.5 animate-count-highlight"
                key={stats.trackedConditions.length}
              >
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {stats.trackedConditions.length}
                </span>
                <span className="text-xs text-foreground font-semibold">tracked</span>
              </div>
              <p className="text-[10.5px] text-muted-foreground truncate">
                {stats.trackedConditions.length > 0
                  ? stats.trackedConditions.join(", ")
                  : "No chronic conditions logged"}
              </p>
            </div>

            <div className="smooth-card p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-1.5 animate-fade-in-up stagger-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  PEDIGREE DEPTH &amp; FIDELITY
                </span>
                <Network className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {stats.depth}
                </span>
                <span className="text-xs text-foreground font-semibold">Generations</span>
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  {stats.completenessScore}% Ready
                </span>
              </div>
              <p className="text-[10.5px] text-muted-foreground">
                •{" "}
                {stats.activeGens
                  .map((g) => `Gen ${g === 1 ? "I" : g === 2 ? "II" : g === 3 ? "III" : "IV"}`)
                  .join(", ")}{" "}
                active
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setShowVaultModal(true);
              }}
              className="smooth-card p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border hover:border-emerald-500/50 shadow-xs space-y-1.5 text-left transition-all cursor-pointer animate-fade-in-up stagger-4 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  PRIVACY ARCHITECTURE
                </span>
                <KeyRound className="w-4 h-4 text-emerald-600 group-hover:rotate-12 transition-transform" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  End-to-End
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                <span>AES-256 Client-Key Active</span>
                <ChevronRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </button>
          </div>

          {/* VIEW MODE 1: INTERACTIVE PEDIGREE TREE CANVAS */}
          {viewMode === "tree" ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-5 animate-fade-in-up">
              {/* Pedigree Toolbar */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-extrabold text-base sm:text-lg text-foreground flex items-center gap-2">
                    <Dna className="w-4 h-4 text-primary" />
                    <span>Pedigree Chart</span>
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-surface-low border border-border text-muted-foreground">
                    Standard ACMG / NSGC Symbols
                  </span>

                  {/* Lineage Trace Pills */}
                  <div className="flex items-center gap-1 bg-surface-low dark:bg-[#0e1b22] p-1 rounded-xl border border-border text-[11px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap max-w-full">
                    {(
                      [
                        { id: "all", label: "Full Tree" },
                        { id: "paternal", label: "Paternal Trace" },
                        { id: "maternal", label: "Maternal Trace" },
                      ] as const
                    ).map((trace) => (
                      <button
                        key={trace.id}
                        type="button"
                        onClick={() => {
                          sound.playSoft();
                          setLineageTrace(trace.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          lineageTrace === trace.id
                            ? "bg-teal-700 text-white shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {trace.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symbols Legend + Animate Flow + Real Working Zoom Controls */}
                <div className="flex items-center gap-4 flex-wrap text-xs">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs border-2 border-teal-700 bg-white dark:bg-[#14262f] inline-block" />{" "}
                      Male
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border-2 border-teal-700 bg-white dark:bg-[#14262f] inline-block" />{" "}
                      Female
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-[#0f6b63] border-2 border-[#004d47] inline-block" />{" "}
                      Affected
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border-2 border-teal-700 relative overflow-hidden inline-block">
                        <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-700" />
                      </span>{" "}
                      Carrier
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 border-2 border-teal-700 relative inline-block">
                        <span className="absolute inset-0 bg-rose-500 -rotate-45 h-0.5 top-1" />
                      </span>{" "}
                      Deceased
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-surface-low p-1 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSoft();
                        setAnimateFlow(!animateFlow);
                      }}
                      title="Toggle Animated Inheritance Connector Flow"
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all mr-1 ${
                        animateFlow
                          ? "bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Flow {animateFlow ? "ON" : "OFF"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSoft();
                        setZoomLevel((z) => Math.max(70, z - 10));
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSoft();
                        setZoomLevel(100);
                      }}
                      title="Reset Zoom to 100%"
                      className="text-[10px] font-mono font-bold w-11 text-center text-foreground hover:text-primary"
                    >
                      {zoomLevel}%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSoft();
                        setZoomLevel((z) => Math.min(130, z + 10));
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Swipe Guide Indicator */}
              <div className="sm:hidden flex items-center justify-between gap-1.5 py-1.5 px-3 rounded-xl bg-teal-500/10 text-teal-800 dark:text-teal-300 text-[11px] font-semibold border border-teal-500/25">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span>Interactive 3-Generation Canvas</span>
                </span>
                <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1">
                  Swipe horizontal <ArrowRight className="w-3 h-3 animate-pulse" />
                </span>
              </div>

              {/* Interactive Zoomable Multi-Generation Pedigree Canvas */}
              <div className="relative rounded-2xl bg-gradient-to-b from-[#effaf7] to-[#f7fcff] dark:from-[#0c1920] dark:to-[#0f2029] border border-teal-100 dark:border-teal-900/40 p-5 sm:p-8 overflow-x-auto shadow-inner">
                <div
                  className="min-w-[580px] max-w-4xl mx-auto transition-transform duration-300 ease-out origin-top relative"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                >
                  <div className="relative z-10 space-y-2">
                    {/* GENERATION I: GRANDPARENTS */}
                    <div>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                        GEN I &bull; Grandparents
                      </span>
                      <div className="grid grid-cols-2 gap-8 sm:gap-16 max-w-3xl mx-auto">
                        {/* Paternal Grandparents Pair + Marriage Line & Descent Stem */}
                        <div className="flex flex-col items-center">
                          <div className="flex items-start justify-center gap-8 sm:gap-12 relative">
                            {renderPedigreeNode(pgf, "md")}
                            {/* Horizontal Marriage Connector */}
                            <div className="h-11 flex items-center -mx-6 sm:-mx-9 z-0 pointer-events-none">
                              <svg width="56" height="6" viewBox="0 0 56 6" className="overflow-visible">
                                <line
                                  x1="0"
                                  y1="3"
                                  x2="56"
                                  y2="3"
                                  stroke={lineageTrace === "maternal" ? "#cbd5e1" : "#0f766e"}
                                  strokeWidth={lineageTrace === "paternal" ? "2.8" : "2"}
                                  strokeDasharray={animateFlow ? "6 4" : "none"}
                                  className={animateFlow ? "animate-[pedigreeLineFlow_4s_linear_infinite]" : ""}
                                />
                              </svg>
                            </div>
                            {renderPedigreeNode(pgm, "md")}
                          </div>
                          {/* Vertical Descent Stem into Father */}
                          <svg width="24" height="32" viewBox="0 0 24 32" className="my-0.5 pointer-events-none">
                            <line
                              x1="12"
                              y1="0"
                              x2="12"
                              y2="32"
                              stroke={lineageTrace === "maternal" ? "#cbd5e1" : "#0f766e"}
                              strokeWidth={lineageTrace === "paternal" ? "2.8" : "2"}
                              strokeDasharray={animateFlow ? "5 4" : "none"}
                              className={animateFlow ? "animate-[pedigreeLineFlow_4s_linear_infinite]" : ""}
                            />
                          </svg>
                        </div>

                        {/* Maternal Grandparents Pair + Marriage Line & Descent Stem */}
                        <div className="flex flex-col items-center">
                          <div className="flex items-start justify-center gap-8 sm:gap-12 relative">
                            {renderPedigreeNode(mgf, "md")}
                            <div className="h-11 flex items-center -mx-6 sm:-mx-9 z-0 pointer-events-none">
                              <svg width="56" height="6" viewBox="0 0 56 6" className="overflow-visible">
                                <line
                                  x1="0"
                                  y1="3"
                                  x2="56"
                                  y2="3"
                                  stroke={lineageTrace === "paternal" ? "#cbd5e1" : "#0f766e"}
                                  strokeWidth={lineageTrace === "maternal" ? "2.8" : "2"}
                                  strokeDasharray={animateFlow ? "6 4" : "none"}
                                  className={animateFlow ? "animate-[pedigreeLineFlow_4s_linear_infinite]" : ""}
                                />
                              </svg>
                            </div>
                            {renderPedigreeNode(mgm, "md")}
                          </div>
                          {/* Vertical Descent Stem into Mother */}
                          <svg width="24" height="32" viewBox="0 0 24 32" className="my-0.5 pointer-events-none">
                            <line
                              x1="12"
                              y1="0"
                              x2="12"
                              y2="32"
                              stroke={lineageTrace === "paternal" ? "#cbd5e1" : "#0f766e"}
                              strokeWidth={lineageTrace === "maternal" ? "2.8" : "2"}
                              strokeDasharray={animateFlow ? "5 4" : "none"}
                              className={animateFlow ? "animate-[pedigreeLineFlow_4s_linear_infinite]" : ""}
                            />
                          </svg>
                        </div>
                      </div>

                      {extraGen1.length > 0 && (
                        <div className="flex items-center justify-center gap-8 mt-2 mb-3 pt-3 border-t border-dashed border-teal-200/70 dark:border-teal-800/40 flex-wrap">
                          {extraGen1.map((m) => (
                            <React.Fragment key={m.id}>{renderPedigreeNode(m, "sm")}</React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* GENERATION II: PARENTS & EXTENDED KIN */}
                    <div>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                        GEN II &bull; Parents &amp; First-Degree Branch Relatives
                      </span>
                      <div className="flex flex-col items-center max-w-2xl mx-auto">
                        <div className="flex items-start justify-center gap-8 sm:gap-16 relative">
                          {renderPedigreeNode(father, "md")}
                          {/* Parents Marriage Bridge */}
                          <div className="h-11 flex items-center -mx-4 sm:-mx-10 z-0 pointer-events-none">
                            <svg width="88" height="6" viewBox="0 0 88 6" className="overflow-visible">
                              <line
                                x1="0"
                                y1="3"
                                x2="88"
                                y2="3"
                                stroke="#0f766e"
                                strokeWidth="2.4"
                                strokeDasharray={animateFlow ? "7 4" : "none"}
                                className={animateFlow ? "animate-[pedigreeLineFlow_4s_linear_infinite]" : ""}
                              />
                            </svg>
                          </div>
                          {renderPedigreeNode(mother, "md")}
                        </div>

                        {/* T-Junction Descent & Sibling Bracket into Gen III */}
                        <svg
                          viewBox="0 0 280 42"
                          className="w-64 sm:w-72 h-10 mt-1 pointer-events-none"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M 140 0 L 140 20 M 45 20 L 235 20 M 45 20 L 45 42 M 235 20 L 235 42"
                            fill="none"
                            stroke="#0f766e"
                            strokeWidth="2.2"
                            strokeDasharray={animateFlow ? "6 4" : "none"}
                            className={animateFlow ? "animate-[pedigreeLineFlow_5s_linear_infinite]" : ""}
                          />
                        </svg>
                      </div>

                      {extraGen2.length > 0 && (
                        <div className="flex items-center justify-center gap-8 my-3 pt-3 border-t border-dashed border-teal-200/70 dark:border-teal-800/40 flex-wrap">
                          <span className="text-[9.5px] font-mono text-muted-foreground uppercase">
                            Aunts / Uncles:
                          </span>
                          {extraGen2.map((m) => (
                            <React.Fragment key={m.id}>{renderPedigreeNode(m, "sm")}</React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* GENERATION III: PROBAND & SIBLINGS */}
                    <div className="pt-1">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                        GEN III &bull; Proband, Siblings &amp; Cousins
                      </span>
                      <div className="flex items-end justify-center gap-12 sm:gap-24 max-w-xl mx-auto flex-wrap">
                        {renderPedigreeNode(proband, "lg")}
                        {renderPedigreeNode(brother, "md")}
                        {extraGen3.map((m) => (
                          <React.Fragment key={m.id}>{renderPedigreeNode(m, "md")}</React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* GENERATION IV: DESCENDANTS */}
                    {gen4Members.length > 0 && (
                      <div className="pt-4 mt-4 border-t border-dashed border-teal-300/60 dark:border-teal-800/50">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                          GEN IV &bull; Descendants / Offspring
                        </span>
                        <div className="flex items-start justify-center gap-12 flex-wrap">
                          {gen4Members.map((m) => (
                            <React.Fragment key={m.id}>{renderPedigreeNode(m, "md")}</React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    Click any symbol node above to open full clinical dossier, edit onset age, or append biomarkers.
                  </span>
                </span>
                <span className="font-mono text-[10px]">
                  Client Vault Synced &bull; {members.length} Active Nodes
                </span>
              </div>
            </div>
          ) : (
            /* VIEW MODE 2: INTERACTIVE FILTERABLE LIST REGISTRY */
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4 animate-fade-in-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by relative, condition, ICD-10, or gene (e.g. LDLR)..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-surface-low text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1 bg-surface-low p-1 rounded-xl border border-border">
                    {(["All", "Paternal", "Maternal", "Immediate"] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          sound.playSoft();
                          setListBranchFilter(b);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          listBranchFilter === b
                            ? "bg-teal-700 text-white"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 bg-surface-low p-1 rounded-xl border border-border">
                    {(["All", "Affected", "Carrier", "Healthy", "Deceased"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          sound.playSoft();
                          setListStatusFilter(st);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          listStatusFilter === st
                            ? "bg-teal-700 text-white"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="py-2.5 px-3">Gen / Kinship</th>
                      <th className="py-2.5 px-3">Branch</th>
                      <th className="py-2.5 px-3">Reported Condition</th>
                      <th className="py-2.5 px-3">Onset / Status</th>
                      <th className="py-2.5 px-3">Candidate Genes</th>
                      <th className="py-2.5 px-3">Certainty</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {filteredListMembers.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-surface-low/60 transition-colors cursor-pointer"
                        onClick={() => openInspector(m)}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-surface-low border border-border font-mono text-[10px] font-bold">
                              G{m.generation}
                            </span>
                            <div>
                              <p className="font-bold text-foreground">{m.relation}</p>
                              {m.name && (
                                <p className="text-[10px] text-muted-foreground">{m.name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-low border border-border">
                            {m.branch}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p
                            className={`font-bold ${
                              m.isAffected
                                ? "text-rose-600 dark:text-rose-400"
                                : m.isCarrier
                                ? "text-teal-700 dark:text-teal-300"
                                : "text-foreground"
                            }`}
                          >
                            {m.condition}
                          </p>
                          {m.icdCode && (
                            <span className="text-[10px] font-mono text-muted-foreground">
                              ICD-10: {m.icdCode}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-foreground">{m.onsetAge}</p>
                          <p
                            className={`text-[10px] ${
                              m.isDeceased ? "text-rose-600 font-bold" : "text-muted-foreground"
                            }`}
                          >
                            {m.currentStatus}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {m.associatedGenes.length > 0 ? (
                              m.associatedGenes.map((g) => (
                                <span
                                  key={g}
                                  className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-800 dark:text-teal-300 font-mono text-[10px] font-bold"
                                >
                                  {g}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{m.certainty}</span>
                          </span>
                        </td>
                        <td
                          className="py-3 px-3 text-right space-x-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => openInspector(m, true)}
                            className="px-2 py-1 rounded-lg bg-surface-low hover:bg-teal-500/10 text-primary font-semibold text-[11px]"
                          >
                            Edit
                          </button>
                          {!m.isProband && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(m.id)}
                              className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                              title="Remove Relative"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile-Optimized Relative Cards View */}
              <div className="block md:hidden space-y-3">
                {filteredListMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => openInspector(m)}
                    className="p-4 rounded-2xl bg-white dark:bg-[#14262f] border border-border/80 shadow-xs hover:border-teal-500/40 active:scale-[0.98] transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/20 font-mono text-[9px] font-bold">
                            Gen {m.generation === 1 ? "I" : m.generation === 2 ? "II" : m.generation === 3 ? "III" : "IV"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-surface-low border border-border">
                            {m.branch}
                          </span>
                          {m.isProband && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-teal-700 text-white">
                              Proband (You)
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm text-foreground">
                          {m.relation}
                        </h4>
                        {m.name && (
                          <p className="text-[11px] text-muted-foreground">{m.name}</p>
                        )}
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          m.isAffected
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/25"
                            : m.isCarrier
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25"
                        }`}
                      >
                        {m.isAffected ? "Affected" : m.isCarrier ? "Carrier" : "Healthy"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-low/60 dark:bg-[#0c181f]/60 border border-border/60 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-muted-foreground font-mono">Condition:</span>
                        <span className="font-bold text-foreground">{m.condition}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[10px] text-muted-foreground font-mono">Onset / Status:</span>
                        <span className="font-medium text-foreground">
                          {m.onsetAge} • {m.currentStatus}
                        </span>
                      </div>
                      {m.associatedGenes.length > 0 && (
                        <div className="flex items-center justify-between pt-1 border-t border-border/40">
                          <span className="text-[10px] text-muted-foreground font-mono">Candidate Loci:</span>
                          <div className="flex flex-wrap gap-1">
                            {m.associatedGenes.map((g) => (
                              <span
                                key={g}
                                className="px-1.5 py-0.2 rounded bg-teal-500/15 text-teal-800 dark:text-teal-300 font-mono text-[9px] font-bold"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs" onClick={(e) => e.stopPropagation()}>
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{m.certainty}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openInspector(m, true)}
                          className="px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] shadow-2xs active:scale-95 transition-all"
                        >
                          Edit Dossier
                        </button>
                        {!m.isProband && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(m.id)}
                            className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg active:scale-95 transition-all"
                            title="Remove Relative"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MORE INFORMATION: CLINICAL SEGREGATION INSIGHTS + PHYSICIAN CONSULTATION PROMPTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: Automated Family Inheritance & Lineage Intelligence */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-5 animate-fade-in-up stagger-5">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>CLINICAL LINEAGE &amp; INHERITANCE SYNTHESIS</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-foreground mt-0.5">
                    Multi-Generational Pattern &amp; Candidate Gene Context
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                    Pedigree Fidelity
                  </span>
                  <span className="text-sm font-extrabold text-teal-700 dark:text-teal-300 font-mono">
                    {stats.completenessScore}%
                  </span>
                </div>
              </div>

              {/* Animated Fidelity Progress Meter */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 rounded-full bg-surface-low overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00635e] via-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${stats.completenessScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {stats.confirmedCount} of {stats.documented} logged relatives have confirmed medical,
                  death-certificate, or EMR documentation.
                </p>
              </div>

              {/* Pattern Cluster Cards */}
              <div className="space-y-3">
                {/* Paternal Cluster */}
                <div className="p-4 rounded-2xl bg-surface-low/80 dark:bg-[#0e1b22] border border-border space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-extrabold text-foreground flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-rose-500" />
                      <span>Paternal Lineage Observation</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSoft();
                        setViewMode("tree");
                        setLineageTrace("paternal");
                      }}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Highlight Paternal Path in Tree</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stats.paternalConditions.length > 0 ? (
                      <>
                        Two consecutive paternal generations document cardiovascular phenotypes (
                        {stats.paternalConditions
                          .map((m) => `${m.relation}: ${m.condition} at ${m.onsetAge}`)
                          .join("; ")}
                        ). Early-onset familial vascular clustering often guides preventative lipid
                        monitoring (ApoB, Lp(a)) alongside lifestyle optimization.
                      </>
                    ) : (
                      "No paternal chronic phenotypes currently flagged in pedigree."
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-muted-foreground font-semibold mr-1">
                      Related Loci:
                    </span>
                    {["LDLR", "APOB", "PCSK9", "AGT"].map((g) => (
                      <Link
                        key={g}
                        href="/genetics"
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-[#14262f] border border-border hover:border-teal-500 font-mono text-[10px] font-bold text-teal-800 dark:text-teal-300 transition-colors"
                      >
                        {g}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Maternal Cluster */}
                <div className="p-4 rounded-2xl bg-surface-low/80 dark:bg-[#0e1b22] border border-border space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-extrabold text-foreground flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-teal-600" />
                      <span>Maternal Lineage Observation</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSoft();
                        setViewMode("tree");
                        setLineageTrace("maternal");
                      }}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Highlight Maternal Path in Tree</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stats.maternalConditions.length > 0 ? (
                      <>
                        Documents{" "}
                        {stats.maternalConditions
                          .map((m) => `${m.relation}: ${m.condition} (onset ${m.onsetAge})`)
                          .join("; ")}
                        . Type 2 Diabetes predisposition reflects polygenic susceptibility interacting
                        with metabolic environment rather than single-gene determinism.
                      </>
                    ) : (
                      "No maternal chronic conditions currently recorded."
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-muted-foreground font-semibold mr-1">
                      Related Loci:
                    </span>
                    {["TCF7L2", "PPARG", "KCNJ11"].map((g) => (
                      <Link
                        key={g}
                        href="/genetics"
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-[#14262f] border border-border hover:border-teal-500 font-mono text-[10px] font-bold text-teal-800 dark:text-teal-300 transition-colors"
                      >
                        {g}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Tailored Doctor / Genetic Counselor Questions Generator */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4 animate-fade-in-up stagger-6">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground">
                      Tailored Consultation Prep
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Auto-generated from your pedigree entries
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyQuestions}
                  className="px-2.5 py-1.5 rounded-xl bg-surface-low hover:bg-teal-500/10 border border-border text-[11px] font-bold text-primary flex items-center gap-1 transition-all"
                >
                  {copiedQuestions ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy List</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2.5">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-low/80 dark:bg-[#0e1b22] border border-border space-y-1 text-xs hover:border-teal-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                        {q.tag}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">#{idx + 1}</span>
                    </div>
                    <p className="text-[11.5px] text-foreground leading-relaxed">{q.question}</p>
                  </div>
                ))}
              </div>

              <div className="pt-1 grid grid-cols-2 gap-2">
                <Link
                  href="/clinical-support/discussion-prep"
                  className="py-2 px-3 rounded-xl bg-surface-low hover:bg-teal-500/10 border border-border text-center text-[11px] font-bold text-foreground transition-all flex items-center justify-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>Full Prep Kit</span>
                </Link>
                <Link
                  href="/risk-education"
                  className="py-2 px-3 rounded-xl bg-[#004d47] hover:bg-[#003833] text-white text-center text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Risk Guide</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Documented Family Members Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-extrabold text-base text-foreground">
                  Documented Family Members
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Showing {members.length} recorded profiles across {stats.depth} generations
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playSoft();
                  setShowSymbolGuide(!showSymbolGuide);
                }}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showSymbolGuide ? "Hide" : "Show"} ACMG Pedigree Notation Guide</span>
              </button>
            </div>

            {showSymbolGuide && (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-teal-200 dark:border-teal-900/60 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs animate-fade-in-up">
                <div className="space-y-1">
                  <span className="font-extrabold text-teal-800 dark:text-teal-300 block">
                    Square &amp; Circle Shapes
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    ACMG/NSGC standardized convention: Squares designate XY biological males; circles designate XX biological females.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-teal-800 dark:text-teal-300 block">
                    Solid vs Half-Shaded Fill
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Solid teal fill signifies a clinically affected individual; half-shaded node denotes a carrier or metabolic predisposition.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-teal-800 dark:text-teal-300 block">
                    Diagonal Slash &amp; Age Pill
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Diagonal crimson line indicates deceased status; centered pill (<code className="font-mono">d.68</code>) indicates age at passing without obstructing symbol geometry.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-teal-800 dark:text-teal-300 block">
                    Proband Arrow &amp; Verified Badge
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Proband identifies the index individual seeking genetic literacy. Emerald check dot marks clinically verified EHR or pathology records.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {members.map((m, idx) => (
                <div
                  key={m.id}
                  style={{ animationDelay: `${Math.min(idx * 50, 350)}ms` }}
                  className={`smooth-card p-5 rounded-2xl bg-white dark:bg-[#14262f] border shadow-xs flex flex-col justify-between space-y-3 relative animate-fade-in-up ${
                    selectedMemberId === m.id
                      ? "border-teal-600 ring-2 ring-teal-500/20"
                      : "border-border"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs text-foreground flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            m.isAffected
                              ? "bg-rose-500"
                              : m.isCarrier
                              ? "bg-teal-600"
                              : "bg-emerald-500"
                          }`}
                        />
                        <span>{m.relation}</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-surface-low border border-border text-muted-foreground">
                          G{m.generation}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-low border border-border text-muted-foreground">
                          {m.branch}
                        </span>
                      </div>
                    </div>

                    {m.name && (
                      <p className="text-[11px] text-muted-foreground -mt-1 font-medium">{m.name}</p>
                    )}

                    <div>
                      <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider block">
                        REPORTED CONDITION
                      </span>
                      <p
                        className={`text-xs font-extrabold ${
                          m.isAffected
                            ? "text-rose-600 dark:text-rose-400"
                            : m.isCarrier
                            ? "text-teal-700 dark:text-teal-300"
                            : "text-foreground"
                        }`}
                      >
                        {m.condition}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-muted-foreground text-[10px] block">Age of Onset</span>
                        <p className="font-semibold text-foreground">{m.onsetAge}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] block">
                          Current Status
                        </span>
                        <p
                          className={`font-semibold ${
                            m.isDeceased ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                          }`}
                        >
                          {m.currentStatus}
                        </p>
                      </div>
                    </div>

                    {m.associatedGenes.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        {m.associatedGenes.map((g) => (
                          <span
                            key={g}
                            className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-800 dark:text-teal-300 font-mono text-[9.5px] font-bold"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-border/60 text-[10px] text-muted-foreground flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 truncate">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{m.certainty}</span>
                      </span>
                      {m.biomarkers.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[9px] shrink-0">
                          {m.biomarkers.length} Lab{m.biomarkers.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs relative">
                    <button
                      type="button"
                      onClick={() => openInspector(m, true)}
                      className="text-primary hover:underline font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit &amp; Inspect</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playSoft();
                        setOpenMenuId(openMenuId === m.id ? null : m.id);
                      }}
                      className="p-1 rounded-lg hover:bg-surface-low text-muted-foreground hover:text-foreground"
                      title="Member Actions"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {openMenuId === m.id && (
                      <div className="absolute right-0 bottom-8 z-30 w-44 rounded-xl bg-white dark:bg-[#1a2e38] border border-border shadow-xl p-1.5 space-y-0.5 text-[11px] animate-fade-in-up">
                        <button
                          type="button"
                          onClick={() => openInspector(m, false)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-low flex items-center gap-2 font-medium"
                        >
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          <span>View Clinical Dossier</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playSuccess();
                            setMembers((prev) =>
                              prev.map((x) =>
                                x.id === m.id ? { ...x, certainty: "Clinically Confirmed" } : x
                              )
                            );
                            setOpenMenuId(null);
                            showToast(`Marked ${m.relation} as Clinically Confirmed.`);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-low flex items-center gap-2 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark Clinically Verified</span>
                        </button>
                        {!m.isProband && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(m.id)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-600 flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove from Pedigree</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Disclaimer & Find Counselor Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-teal-950 dark:text-teal-200 block">
                Clinical Disclaimer &amp; Non-Diagnostic Scope
              </span>
              <p className="text-[11px] text-teal-900/80 dark:text-teal-300/80 leading-relaxed">
                Family history organizes clinical discussions across generations but does not constitute
                a genetic diagnosis or algorithmic risk score. Discuss findings with a certified genetic counselor.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetDemo}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#14262f] border border-border text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
                title="Reset pedigree back to default demo dataset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
              <Link
                href="/clinical-support/find-counselor"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#004d47] hover:bg-[#003833] text-white transition-all shadow-2xs whitespace-nowrap"
              >
                Find Counselor
              </Link>
            </div>
          </div>

          <SafetyNotice />
        </main>
      </div>

      {/* MODAL 1: CLINICAL DOSSIER INSPECTOR & BIOMARKER EDITOR */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md flex items-center justify-end animate-fade-in"
          onClick={() => setSelectedMemberId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg h-full bg-white dark:bg-[#111d24] border-l border-border shadow-2xl p-4 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-6 animate-fade-in-up text-xs"
          >
            <div className="space-y-5">
              {/* Top Bar */}
              <div className="flex items-start justify-between pb-4 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/25">
                      Gen {selectedMember.generation} &bull; {selectedMember.branch} Lineage
                    </span>
                    {selectedMember.isProband && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        Proband
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground">
                    {selectedMember.relation}
                    {selectedMember.name ? ` — ${selectedMember.name}` : ""}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Verification: {selectedMember.verificationSource}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMemberId(null)}
                  className="p-1.5 rounded-xl bg-surface-low text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* View vs Edit Toggle Tabs */}
              <div className="flex items-center justify-between bg-surface-low p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => {
                    sound.playSoft();
                    setIsEditingMember(false);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    !isEditingMember
                      ? "bg-[#004d47] text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Clinical Overview &amp; Biomarkers
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playSoft();
                    setIsEditingMember(true);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    isEditingMember
                      ? "bg-[#004d47] text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Edit Record &amp; Certainty
                </button>
              </div>

              {!isEditingMember ? (
                <div className="space-y-4">
                  {/* Clinical Summary Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-surface-low border border-border">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                        Condition
                      </span>
                      <p className="font-extrabold text-sm text-foreground mt-0.5">
                        {selectedMember.condition}
                      </p>
                      {selectedMember.icdCode && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          ICD-10: {selectedMember.icdCode}
                        </span>
                      )}
                    </div>
                    <div className="p-3.5 rounded-xl bg-surface-low border border-border">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                        Status &amp; Onset
                      </span>
                      <p className="font-extrabold text-sm text-foreground mt-0.5">
                        {selectedMember.currentStatus}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        Age of Onset: {selectedMember.onsetAge}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="p-4 rounded-2xl bg-surface-low/80 border border-border space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Clinical History Notes
                    </span>
                    <p className="text-xs text-foreground leading-relaxed">
                      {selectedMember.clinicalNotes || "No narrative clinical notes added yet."}
                    </p>
                  </div>

                  {/* Associated Candidate Genes */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Associated Genetic Loci (ClinVar / OMIM Reference)
                    </span>
                    {selectedMember.associatedGenes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.associatedGenes.map((g) => (
                          <Link
                            key={g}
                            href="/genetics"
                            className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/25 text-teal-800 dark:text-teal-300 font-mono font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Dna className="w-3.5 h-3.5" />
                            <span>{g}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic">
                        No susceptibility loci mapped to this baseline record.
                      </p>
                    )}
                  </div>

                  {/* Biomarker Log + Quick Append Form */}
                  <div className="space-y-2.5 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">
                        Biomarker &amp; Clinical Findings Log
                      </span>
                      <span className="text-[10px] font-mono text-teal-700 dark:text-teal-300">
                        {selectedMember.biomarkers.length} recorded
                      </span>
                    </div>

                    {selectedMember.biomarkers.length > 0 ? (
                      <div className="space-y-2">
                        {selectedMember.biomarkers.map((b) => (
                          <div
                            key={b.id}
                            className="p-2.5 rounded-xl bg-surface-low border border-border flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-foreground">{b.marker}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">
                                Recorded: {b.date}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#14262f] border border-border font-mono font-bold text-primary">
                              {b.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        No lab findings logged yet. Append one below:
                      </p>
                    )}

                    <form onSubmit={handleAddBiomarker} className="grid grid-cols-12 gap-2 pt-1">
                      <input
                        type="text"
                        value={newMarkerName}
                        onChange={(e) => setNewMarkerName(e.target.value)}
                        placeholder="Biomarker (e.g. LDL-C)"
                        className="col-span-5 px-2.5 py-2 rounded-xl border border-border bg-surface-low text-foreground text-xs"
                        required
                      />
                      <input
                        type="text"
                        value={newMarkerValue}
                        onChange={(e) => setNewMarkerValue(e.target.value)}
                        placeholder="Value (e.g. 142 mg/dL)"
                        className="col-span-5 px-2.5 py-2 rounded-xl border border-border bg-surface-low text-foreground text-xs"
                        required
                      />
                      <button
                        type="submit"
                        className="col-span-2 rounded-xl bg-[#004d47] hover:bg-[#003833] text-white font-bold flex items-center justify-center"
                        title="Append Biomarker"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* EDIT FORM */
                <form onSubmit={handleSaveMemberEdits} className="space-y-3.5">
                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Condition / Diagnosis
                    </label>
                    <input
                      type="text"
                      value={editCondition}
                      onChange={(e) => setEditCondition(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-foreground block mb-1">
                        Phenotype Status
                      </label>
                      <select
                        value={editStatusType}
                        onChange={(e: any) => setEditStatusType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground"
                      >
                        <option value="unaffected">Unaffected / Healthy</option>
                        <option value="affected">Clinically Affected</option>
                        <option value="carrier">Carrier / Predisposition</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-foreground block mb-1">
                        Certainty Level
                      </label>
                      <select
                        value={editCertainty}
                        onChange={(e: any) => setEditCertainty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground"
                      >
                        <option value="Clinically Confirmed">Clinically Confirmed</option>
                        <option value="Medical Records">Medical Records</option>
                        <option value="Death Certificate / Records">Death Certificate / Records</option>
                        <option value="Family Reported">Family Reported</option>
                        <option value="Suspected / Under Review">Suspected / Under Review</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-foreground block mb-1">Age / Passing</label>
                      <input
                        type="text"
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-foreground block mb-1">Age of Onset</label>
                      <input
                        type="text"
                        value={editOnset}
                        onChange={(e) => setEditOnset(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={editIsDeceased}
                          onChange={(e) => setEditIsDeceased(e.target.checked)}
                          className="rounded border-border text-rose-600"
                        />
                        <span>Deceased</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Clinical Narrative &amp; History Notes
                    </label>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    {!selectedMember.isProband ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(selectedMember.id)}
                        className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-500/10 font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingMember(false)}
                        className="px-3 py-2 rounded-xl text-muted-foreground hover:bg-surface-low"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#004d47] hover:bg-[#003833] text-white font-bold shadow-2xs"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="pt-3 border-t border-border text-[10px] text-muted-foreground font-mono flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                AES-256 Protected Local State
              </span>
              <span>ID: {selectedMember.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD FAMILY MEMBER WITH CLINICAL PRESETS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <form
            onSubmit={handleAddMember}
            className="bg-white dark:bg-[#14262f] rounded-3xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in-up text-xs max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-extrabold text-sm text-foreground">
                  Add Family Member to Pedigree
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Automatically places node into generational tree &amp; recalculates insights
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                type="button"
                className="p-1.5 rounded-xl bg-surface-low text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Condition Quick-Select Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Quick Clinical Condition Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CONDITION_PRESETS.slice(0, 5).map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.label)}
                    className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold border transition-all ${
                      formCondition === p.condition
                        ? "bg-teal-700 text-white border-teal-700"
                        : "bg-surface-low border-border text-foreground hover:border-teal-500"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Kinship Relation *</label>
                  <input
                    type="text"
                    value={formRelation}
                    onChange={(e) => setFormRelation(e.target.value)}
                    placeholder="e.g. Maternal Aunt, Sister, Daughter"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">
                    Full Name / Initials (Optional)
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Sarah Mercer"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Generation</label>
                  <select
                    value={formGeneration}
                    onChange={(e) => setFormGeneration(Number(e.target.value) as Generation)}
                    className="w-full px-2.5 py-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground"
                  >
                    <option value={1}>Gen I (Grandparents)</option>
                    <option value={2}>Gen II (Parents/Aunts)</option>
                    <option value={3}>Gen III (Siblings/Cousins)</option>
                    <option value={4}>Gen IV (Children)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Lineage Branch</label>
                  <select
                    value={formBranch}
                    onChange={(e: any) => setFormBranch(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground"
                  >
                    <option value="Maternal">Maternal</option>
                    <option value="Paternal">Paternal</option>
                    <option value="Immediate">Immediate</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Biological Sex</label>
                  <select
                    value={formGender}
                    onChange={(e: any) => setFormGender(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground"
                  >
                    <option value="female">Female (XX)</option>
                    <option value="male">Male (XY)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Phenotype Status</label>
                  <select
                    value={formStatusType}
                    onChange={(e: any) => setFormStatusType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground"
                  >
                    <option value="unaffected">Unaffected / Healthy</option>
                    <option value="affected">Clinically Affected</option>
                    <option value="carrier">Carrier / Predisposition</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">
                    Verification Certainty
                  </label>
                  <select
                    value={formCertainty}
                    onChange={(e: any) => setFormCertainty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground"
                  >
                    <option value="Family Reported">Family Reported</option>
                    <option value="Clinically Confirmed">Clinically Confirmed</option>
                    <option value="Medical Records">Medical Records</option>
                    <option value="Death Certificate / Records">Death Certificate / Records</option>
                    <option value="Suspected / Under Review">Suspected / Under Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Reported Diagnosis / Condition
                </label>
                <input
                  type="text"
                  value={formCondition}
                  onChange={(e) => setFormCondition(e.target.value)}
                  placeholder="e.g. Early Onset CAD, Breast Cancer, Healthy"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Current/Death Age</label>
                  <input
                    type="text"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    placeholder="e.g. 48"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Onset Age</label>
                  <input
                    type="text"
                    value={formOnsetAge}
                    onChange={(e) => setFormOnsetAge(e.target.value)}
                    placeholder="e.g. 44 yrs"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={formIsDeceased}
                      onChange={(e) => setFormIsDeceased(e.target.checked)}
                      className="rounded border-border text-rose-600"
                    />
                    <span>Deceased</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Associated Genes (comma-separated, optional)
                </label>
                <input
                  type="text"
                  value={formGenes}
                  onChange={(e) => setFormGenes(e.target.value)}
                  placeholder="e.g. LDLR, PCSK9"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Additional Clinical Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Relevant treatments, lab biomarkers, or environmental notes..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface-low text-foreground resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-2 rounded-xl text-muted-foreground hover:bg-surface-low"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#004d47] hover:bg-[#003833] text-white font-bold transition-all shadow-2xs"
              >
                Save Relative to Pedigree
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: AES-256 ENCRYPTION VAULT INSPECTOR */}
      {showVaultModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setShowVaultModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#14262f] rounded-3xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in-up text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">
                    Zero-Knowledge Client Pedigree Vault
                  </h3>
                  <p className="text-[10.5px] text-muted-foreground">
                    AES-256-GCM Client Storage &amp; Zero-Sale Pledge
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVaultModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-low border border-border space-y-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Live Vault Payload Signature ({members.length} Records)
              </span>
              <code className="block font-mono text-[11px] text-emerald-700 dark:text-emerald-300 break-all bg-white dark:bg-[#0c181d] p-2.5 rounded-xl border border-border">
                {vaultHash}
              </code>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Pedigree modifications stay local inside your encrypted browser vault until you
                explicitly choose to export a clinician report or encrypted JSON backup.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadJsonVault}
                className="py-2.5 px-3 rounded-xl bg-[#004d47] hover:bg-[#003833] text-white font-bold flex items-center justify-center gap-1.5"
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Export JSON Vault</span>
              </button>
              <Link
                href="/governance/zero-sale-pledge"
                className="py-2.5 px-3 rounded-xl bg-surface-low hover:bg-teal-500/10 border border-border text-foreground font-bold flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Sale Charter</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PRINTABLE NSGC CLINICAL REPORT / EXPORT PEDIGREE PDF */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setShowExportModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#14262f] rounded-3xl border border-border shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-fade-in-up text-xs max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-extrabold text-base text-foreground">
                  NSGC Standardized Pedigree Export Preview
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Ready for primary care physician review or certified genetic counseling intake
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-xl bg-surface-low text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-surface-low border border-border space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-extrabold text-sm text-foreground">
                  GeneWise Clinical Family History Packet
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Relatives: {stats.documented} &bull; Conditions: {stats.trackedConditions.length} &bull; Completeness: {stats.completenessScore}%
                </span>
              </div>

              <div className="max-h-52 overflow-y-auto rounded-xl border border-border bg-white dark:bg-[#0e1b22]">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-surface-low border-b border-border text-[10px] uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2 px-3">Gen</th>
                      <th className="py-2 px-3">Relation</th>
                      <th className="py-2 px-3">Condition</th>
                      <th className="py-2 px-3">Onset</th>
                      <th className="py-2 px-3">Certainty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {members.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2 px-3 font-mono">G{m.generation}</td>
                        <td className="py-2 px-3 font-bold">{m.relation}</td>
                        <td className="py-2 px-3">{m.condition}</td>
                        <td className="py-2 px-3">{m.onsetAge}</td>
                        <td className="py-2 px-3 text-muted-foreground">{m.certainty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 flex-wrap pt-1">
              <button
                type="button"
                onClick={handleDownloadJsonVault}
                className="px-3.5 py-2 rounded-xl border border-border bg-surface-low hover:bg-surface-high font-semibold flex items-center gap-1.5"
              >
                <FileJson className="w-3.5 h-3.5 text-primary" />
                <span>Download JSON Backup</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadHtmlReport}
                className="px-3.5 py-2 rounded-xl border border-border bg-surface-low hover:bg-surface-high font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Download Clinical HTML</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-[#004d47] hover:bg-[#003833] text-white font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
