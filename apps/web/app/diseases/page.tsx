"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  Dna,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  HeartPulse,
  HelpCircle,
  Info,
  Layers,
  Lightbulb,
  Lock,
  Microscope,
  RotateCcw,
  Search,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Tag,
  User,
  Users,
  X,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import SafetyNotice from "@/components/SafetyNotice";
import { sound } from "@/lib/sound";

interface DiseaseCard {
  id: string;
  title: string;
  gene: string;
  locus: string;
  inheritance: "Autosomal Dominant" | "Autosomal Recessive" | "X-Linked" | "Mitochondrial" | "Multifactorial/Complex";
  category: "Inherited Metabolic" | "Cardiovascular" | "Neurological" | "Connective Tissue" | "Hereditary Cancer";
  verificationBadge: string;
  description: string;
  evidenceStatus: "Expert Panel Reviewed" | "Clinically Characterized" | "Extensively Documented" | "Multi-Panel Concordant";
  referenceCount: number;
  omimId: string;
  orphaId?: string;
  geneId?: string;
  sourceDataset: "Kaggle Rare Disease v2.4" | "Orphanet Database" | "ClinVar Archive" | "NCBI Gene / OMIM";
  clinicalGuideline: string;
  molecularMechanism: string;
  prevalence: string;
  svgColor: string;
}

const DISEASE_ITEMS: DiseaseCard[] = [
  {
    id: "dis-cftr",
    title: "Cystic Fibrosis",
    gene: "CFTR",
    locus: "7q31.2",
    inheritance: "Autosomal Recessive",
    category: "Inherited Metabolic",
    verificationBadge: "ClinVar & Orphanet Verified (ORPHA:586)",
    description:
      "Multisystem condition primarily affecting lungs and digestive system via chloride ion channel disruption. Results in viscous secretions, recurrent pulmonary infections, and pancreatic insufficiency.",
    evidenceStatus: "Expert Panel Reviewed",
    referenceCount: 32,
    omimId: "219700",
    orphaId: "586",
    geneId: "1080",
    sourceDataset: "ClinVar Archive",
    clinicalGuideline: "Sweat chloride testing (>60 mmol/L) followed by CFTR 27-exon targeted sequencing and newborn IRT triage.",
    molecularMechanism: "Defective ATP-binding cassette transporter disrupting transepithelial chloride and thiocyanate flux, causing dehydrated apical secretions.",
    prevalence: "1 in 3,000 live births in Northern European populations",
    svgColor: "from-teal-500/20 to-emerald-500/10",
  },
  {
    id: "dis-fbn1",
    title: "Marfan Syndrome",
    gene: "FBN1",
    locus: "15q21.1",
    inheritance: "Autosomal Dominant",
    category: "Connective Tissue",
    verificationBadge: "Kaggle Dataset v2.4 • OMIM #154700",
    description:
      "Connective tissue disorder characterized by ocular, skeletal, and cardiovascular manifestations. Pathogenic variants impair fibrillin-1 glycoprotein polymerization and microfibril assembly.",
    evidenceStatus: "Clinically Characterized",
    referenceCount: 24,
    omimId: "154700",
    orphaId: "558",
    geneId: "2200",
    sourceDataset: "Kaggle Rare Disease v2.4",
    clinicalGuideline: "Revised Ghent nosology criteria; baseline echocardiography with annual aortic root diameter z-score surveillance.",
    molecularMechanism: "Haploinsufficiency of fibrillin-1 leads to dysregulated TGF-β signaling and structural degradation of elastic lamellae.",
    prevalence: "1 in 5,000 to 1 in 10,000 individuals worldwide",
    svgColor: "from-cyan-500/20 to-blue-500/10",
  },
  {
    id: "dis-htt",
    title: "Huntington Disease",
    gene: "HTT",
    locus: "4p16.3",
    inheritance: "Autosomal Dominant",
    category: "Neurological",
    verificationBadge: "NCBI Gene Verified (Gene ID: 3064)",
    description:
      "Neurodegenerative disorder caused by expanded CAG trinucleotide repeat in HTT gene. Characterized by choreiform involuntary movements, progressive cognitive decline, and psychiatric disturbances.",
    evidenceStatus: "Extensively Documented",
    referenceCount: 48,
    omimId: "143100",
    geneId: "3064",
    sourceDataset: "NCBI Gene / OMIM",
    clinicalGuideline: "Molecular genetic testing measuring CAG repeat length (>36 repeats diagnostic). Comprehensive pre-test predictive counseling mandatory.",
    molecularMechanism: "Polyglutamine tract expansion triggers toxic mutant huntingtin protein aggregation, inducing striatal medium spiny neuron loss.",
    prevalence: "5 to 10 per 100,000 in European populations",
    svgColor: "from-purple-500/20 to-indigo-500/10",
  },
  {
    id: "dis-hbb",
    title: "Sickle Cell Anemia",
    gene: "HBB",
    locus: "11p15.4",
    inheritance: "Autosomal Recessive",
    category: "Cardiovascular",
    verificationBadge: "Orphanet Verified (ORPHA:232)",
    description:
      "Hemoglobinopathy resulting from a point mutation in beta-globin leading to hemoglobin S polymer formation. Leads to erythrocyte deformation, vaso-occlusive episodes, and systemic hemolysis.",
    evidenceStatus: "Expert Panel Reviewed",
    referenceCount: 51,
    omimId: "603903",
    orphaId: "232",
    geneId: "3043",
    sourceDataset: "Orphanet Database",
    clinicalGuideline: "High-performance liquid chromatography (HPLC) or isoelectric focusing of hemoglobin; hydroxyurea therapy and penicillin prophylaxis.",
    molecularMechanism: "Glutamic acid to valine substitution at position 6 (p.Glu6Val) triggers HbS hydrophobic fiber polymerization under deoxygenation.",
    prevalence: "1 in 365 African-American births; high carrier rates in malaria-endemic regions",
    svgColor: "from-rose-500/20 to-amber-500/10",
  },
  {
    id: "dis-ldlr",
    title: "Familial Hypercholesterolemia",
    gene: "LDLR",
    locus: "19p13.2",
    inheritance: "Autosomal Dominant",
    category: "Cardiovascular",
    verificationBadge: "ClinVar & OMIM #143890",
    description:
      "Metabolic disorder caused by defects in LDL receptor clearance. Severely elevated circulating plasma LDL cholesterol leads to premature atherosclerosis and coronary artery calcification.",
    evidenceStatus: "Expert Panel Reviewed",
    referenceCount: 39,
    omimId: "143890",
    geneId: "3949",
    sourceDataset: "ClinVar Archive",
    clinicalGuideline: "Dutch Lipid Clinic Network diagnostic criteria; early intensive statin ± ezetimibe therapy; cascade screening of first-degree kin.",
    molecularMechanism: "Impaired cell-surface low-density lipoprotein receptor synthesis or endocytosis, preventing hepatic hepatic LDL clearance.",
    prevalence: "1 in 250 individuals (Heterozygous); 1 in 300,000 (Homozygous)",
    svgColor: "from-amber-500/20 to-orange-500/10",
  },
  {
    id: "dis-brca1",
    title: "Hereditary Breast-Ovarian Cancer",
    gene: "BRCA1",
    locus: "17q21.31",
    inheritance: "Autosomal Dominant",
    category: "Hereditary Cancer",
    verificationBadge: "NCCN & ClinVar Curated",
    description:
      "Cancer predisposition syndrome characterized by germline mutations hindering DNA double-strand break repair via homologous recombination. Significantly increases lifetime organ malignancy risk.",
    evidenceStatus: "Multi-Panel Concordant",
    referenceCount: 64,
    omimId: "113705",
    geneId: "672",
    sourceDataset: "Kaggle Rare Disease v2.4",
    clinicalGuideline: "NCCN high-risk screening: Annual contrast-enhanced breast MRI starting at age 25, alternating with mammography; risk-reducing BSO discussion.",
    molecularMechanism: "Defective homologous recombination DNA repair creates genomic instability, sensitizing tumor cells to PARP inhibitor synthetic lethality.",
    prevalence: "1 in 400 to 1 in 800 in general population; 1 in 40 in Ashkenazi Jewish ancestry",
    svgColor: "from-emerald-500/20 to-teal-500/10",
  },
];

const CATEGORY_STATS = [
  { name: "All Categories", count: "1,428", id: "all" },
  { name: "Inherited Metabolic", count: "320", id: "Inherited Metabolic" },
  { name: "Cardiovascular", count: "214", id: "Cardiovascular" },
  { name: "Neurological", count: "288", id: "Neurological" },
  { name: "Connective Tissue", count: "189", id: "Connective Tissue" },
  { name: "Hereditary Cancer", count: "417", id: "Hereditary Cancer" },
];

const INHERITANCE_OPTIONS = [
  { label: "Autosomal Dominant", count: 412 },
  { label: "Autosomal Recessive", count: 680 },
  { label: "X-Linked", count: 145 },
  { label: "Mitochondrial", count: 38 },
  { label: "Multifactorial/Complex", count: 153 },
];

const POPULAR_GENES = ["CFTR", "FBN1", "HTT", "HBB", "LDLR", "BRCA1", "KCNQ1", "APOE"];

export default function DiseaseExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedInheritances, setSelectedInheritances] = useState<string[]>([
    "Autosomal Dominant",
    "Autosomal Recessive",
  ]);
  const [selectedGenePills, setSelectedGenePills] = useState<string[]>(["CFTR", "FBN1"]);
  const [selectedSource, setSelectedSource] = useState<string>("Kaggle Rare Disease v2.4");
  const [selectedEvidence, setSelectedEvidence] = useState<string>("Peer-Reviewed / Expert Panel");
  const [sortBy, setSortBy] = useState<"relevance" | "references" | "gene" | "title">("relevance");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(["dis-cftr", "dis-fbn1"]);
  const [selectedDiseaseModal, setSelectedDiseaseModal] = useState<DiseaseCard | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [geneSearchInput, setGeneSearchInput] = useState<string>("");

  // Toggle bookmark with sound
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle inheritance filter
  const toggleInheritance = (label: string) => {
    sound.playClick();
    setSelectedInheritances((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  // Toggle gene pill
  const toggleGenePill = (gene: string) => {
    sound.playClick();
    setSelectedGenePills((prev) =>
      prev.includes(gene) ? prev.filter((g) => g !== gene) : [...prev, gene]
    );
  };

  // Reset all filters
  const resetAllFilters = () => {
    sound.playClick();
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedInheritances(["Autosomal Dominant", "Autosomal Recessive"]);
    setSelectedGenePills([]);
    setSelectedSource("Kaggle Rare Disease v2.4");
    setSelectedEvidence("Peer-Reviewed / Expert Panel");
    setSortBy("relevance");
    setCurrentPage(1);
  };

  // Clear active filter badges
  const clearActiveFilters = () => {
    sound.playClick();
    setSelectedInheritances([]);
    setSelectedGenePills([]);
    setSelectedCategory("all");
    setSearchQuery("");
  };

  // Filtered diseases logic
  const filteredDiseases = useMemo(() => {
    return DISEASE_ITEMS.filter((item) => {
      // Search matching (title, gene, description, locus)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.gene.toLowerCase().includes(q) ||
        item.locus.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      // Category matching
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      // Inheritance matching (if any selected)
      const matchesInheritance =
        selectedInheritances.length === 0 || selectedInheritances.includes(item.inheritance);

      // Gene filter pills (if any active)
      const matchesGenePills =
        selectedGenePills.length === 0 || selectedGenePills.includes(item.gene);

      return matchesSearch && matchesCategory && matchesInheritance && matchesGenePills;
    }).sort((a, b) => {
      if (sortBy === "references") return b.referenceCount - a.referenceCount;
      if (sortBy === "gene") return a.gene.localeCompare(b.gene);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0; // relevance
    });
  }, [searchQuery, selectedCategory, selectedInheritances, selectedGenePills, sortBy]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AppHeader />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Tag and Title Block with Registry Counter */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border/60 pb-5">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/20">
                <Microscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                CURATED CLINICAL KNOWLEDGEBASE
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                Disease & Genetics Explorer
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Learn about inherited conditions, documented inheritance patterns, associated genes, and scientific references curated from open scientific databases and peer-reviewed genetic compendiums.
              </p>
            </div>

            {/* Top Right Registry & Loci Stat Box */}
            <div className="flex items-center gap-3 shrink-0 bg-surface-lowest dark:bg-slate-900/60 p-3 rounded-2xl border border-border shadow-2xs">
              <div className="text-center px-3 border-r border-border/60">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  VERIFIED REGISTRY
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-foreground">1,428</span>
              </div>
              <div className="text-center px-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  ACTIVE LOCI
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-teal-700 dark:text-teal-400">2,109</span>
              </div>
            </div>
          </div>

          {/* Search, Status & Sort Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-lowest dark:bg-slate-900/60 p-3 rounded-2xl border border-border shadow-2xs">
            {/* Search Input with Clear Button */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="CFTR, Marfan, BRCA1, Sickle..."
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Middle: Showing Counter */}
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 px-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Showing <strong className="text-foreground">{filteredDiseases.length}</strong> of 1,428 verified entries</span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden md:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  sound.playClick();
                  setSortBy(e.target.value as any);
                }}
                className="text-xs px-3 py-2 bg-background border border-border rounded-xl text-foreground font-semibold focus:outline-none"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="references">Most References</option>
                <option value="gene">Gene Symbol (A-Z)</option>
                <option value="title">Condition Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Main 2-Column Layout (Left Filters + Right Cards Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: REFINE CATALOG FILTER PANEL (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-surface-lowest dark:bg-slate-900/60 p-5 rounded-3xl border border-border shadow-2xs space-y-6">
                {/* Header with Reset All */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-foreground">
                    <Filter className="w-4 h-4 text-teal-600" />
                    <span>REFINE CATALOG</span>
                  </div>
                  <button
                    onClick={resetAllFilters}
                    className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline"
                  >
                    Reset All
                  </button>
                </div>

                {/* DISEASE CATEGORY */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    DISEASE CATEGORY
                  </span>
                  <div className="space-y-1">
                    {CATEGORY_STATS.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            sound.playClick();
                            setSelectedCategory(cat.id);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-teal-500/15 text-teal-900 dark:text-teal-200 font-bold border border-teal-500/30 shadow-2xs"
                              : "text-muted-foreground hover:bg-surface-container-low dark:hover:bg-slate-800 hover:text-foreground"
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? "bg-teal-600 text-white" : "bg-muted"}`}>
                            {cat.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* INHERITANCE PATTERN */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    INHERITANCE PATTERN
                  </span>
                  <div className="space-y-1.5">
                    {INHERITANCE_OPTIONS.map((inh) => {
                      const checked = selectedInheritances.includes(inh.label);
                      return (
                        <label
                          key={inh.label}
                          onClick={() => toggleInheritance(inh.label)}
                          className="flex items-center justify-between text-xs cursor-pointer py-1 px-1 rounded-lg hover:bg-surface-container-low/50"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {}}
                              className="rounded border-border text-teal-700 focus:ring-teal-700 w-3.5 h-3.5"
                            />
                            <span className={checked ? "font-semibold text-foreground" : "text-muted-foreground"}>
                              {inh.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">{inh.count}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* ASSOCIATED GENE SYMBOLS */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    ASSOCIATED GENE SYMBOLS
                  </span>
                  <div className="relative">
                    <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={geneSearchInput}
                      onChange={(e) => setGeneSearchInput(e.target.value)}
                      placeholder="Find gene (e.g. BRCA1)"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none"
                    />
                  </div>

                  {/* Gene Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {POPULAR_GENES.filter(
                      (g) => geneSearchInput === "" || g.toLowerCase().includes(geneSearchInput.toLowerCase())
                    ).map((gene) => {
                      const isActive = selectedGenePills.includes(gene);
                      return (
                        <button
                          key={gene}
                          onClick={() => toggleGenePill(gene)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all flex items-center gap-1 ${
                            isActive
                              ? "bg-teal-700 text-white shadow-2xs"
                              : "bg-surface-container-low dark:bg-slate-800 text-muted-foreground hover:text-foreground border border-border/60"
                          }`}
                        >
                          <span>{gene}</span>
                          {isActive && <X className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* REFERENCE DATA SOURCES */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    REFERENCE DATA SOURCES
                  </span>
                  <div className="space-y-2 text-xs">
                    {[
                      { name: "Kaggle Rare Disease", badge: "v2.4" },
                      { name: "Orphanet Database", badge: "ORPHA" },
                      { name: "ClinVar Archive", badge: "NCBI" },
                      { name: "NCBI Gene / OMIM", badge: "NIH" },
                    ].map((src) => {
                      const isSelected = selectedSource.includes(src.name);
                      return (
                        <button
                          key={src.name}
                          onClick={() => {
                            sound.playClick();
                            setSelectedSource(src.name);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-teal-500/10 border-teal-500/30 text-teal-900 dark:text-teal-200 font-semibold"
                              : "bg-background border-border text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? "border-teal-600 bg-teal-600" : "border-border"}`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="text-xs">{src.name}</span>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {src.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CLINICAL EVIDENCE STATUS */}
                <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    CLINICAL EVIDENCE STATUS
                  </span>
                  <div className="space-y-1.5">
                    {[
                      "Peer-Reviewed / Expert Panel",
                      "Literature Referenced",
                      "Preliminary Findings",
                    ].map((status) => {
                      const isSelected = selectedEvidence === status;
                      return (
                        <button
                          key={status}
                          onClick={() => {
                            sound.playClick();
                            setSelectedEvidence(status);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                            isSelected
                              ? "bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold border border-teal-500/30"
                              : "text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          <span className="text-xs">• {status}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reset All Filters Button */}
                <button
                  onClick={resetAllFilters}
                  className="w-full py-2.5 rounded-xl text-xs font-bold border border-border hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>

              {/* Bottom Callout: Genomic Tip */}
              <div className="bg-surface-lowest dark:bg-slate-900/60 p-4 rounded-3xl border border-border/80 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-teal-700 dark:text-teal-400">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Genomic Tip</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Autosomal Recessive traits require variants in both alleles. When reviewing reports, carrier states represent a single altered allele with typically no phenotypic symptoms.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: ACTIVE FILTERS BAR + 2-COLUMN DISEASE CARDS GRID (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Active Filter Pills Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-lowest dark:bg-slate-900/60 p-3 rounded-2xl border border-border shadow-2xs text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground font-semibold mr-1">Active Filters:</span>

                  {selectedInheritances.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-800 dark:text-teal-300 font-semibold border border-teal-500/20 text-[11px]">
                      <span>{selectedInheritances.join(" & ")}</span>
                      <button onClick={() => setSelectedInheritances([])} className="hover:text-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedGenePills.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-800 dark:text-teal-300 font-semibold border border-teal-500/20 text-[11px]">
                      <span>Genes: {selectedGenePills.join(", ")}</span>
                      <button onClick={() => setSelectedGenePills([])} className="hover:text-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-800 dark:text-teal-300 font-semibold border border-teal-500/20 text-[11px]">
                    <span>Source: {selectedSource}</span>
                  </span>
                </div>

                <button
                  onClick={clearActiveFilters}
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold underline shrink-0"
                >
                  Clear Active
                </button>
              </div>

              {/* 2-Column Disease Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredDiseases.map((item) => {
                  const isBookmarked = bookmarkedIds.includes(item.id);
                  const isRecessive = item.inheritance === "Autosomal Recessive";
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        sound.playPop();
                        setSelectedDiseaseModal(item);
                      }}
                      className="apple-sheen-box bg-surface-lowest dark:bg-slate-900/70 rounded-3xl border border-border/80 shadow-2xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between space-y-4 cursor-pointer group hover:border-teal-500/40 relative overflow-hidden"
                    >
                      {/* Subtle Ambient Background Gradient */}
                      <div className={`absolute top-0 right-0 w-44 h-44 rounded-full bg-gradient-to-br ${item.svgColor} blur-2xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />

                      {/* Card Content Top */}
                      <div className="space-y-3 relative z-10">
                        {/* Top Badges & Bookmark */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isRecessive
                                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                                  : "bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30"
                              }`}
                            >
                              {item.inheritance}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-surface-container-low dark:bg-slate-800 text-teal-800 dark:text-teal-300 text-[11px] font-mono font-bold border border-border/60">
                              {item.gene} ({item.locus})
                            </span>
                          </div>

                          <button
                            onClick={(e) => toggleBookmark(item.id, e)}
                            title={isBookmarked ? "Remove Bookmark" : "Save Condition"}
                            className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                          >
                            <Bookmark
                              className={`w-4 h-4 ${
                                isBookmarked ? "fill-teal-600 text-teal-600" : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Title & Verification Tag */}
                        <div>
                          <h3 className="text-xl font-extrabold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                            {item.title}
                          </h3>
                          <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            {item.verificationBadge}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      {/* Card Content Bottom: Evidence Status & Button */}
                      <div className="space-y-3 pt-3 border-t border-border/60 relative z-10 text-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5 text-foreground font-semibold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {item.evidenceStatus}
                          </span>
                          <span className="font-mono text-[11px]">
                            {item.referenceCount} References
                          </span>
                        </div>

                        <button
                          type="button"
                          className="w-full py-2.5 rounded-xl bg-surface-container-low dark:bg-slate-800/80 group-hover:bg-[#00635e] group-hover:text-white text-foreground font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <span>View Disease Details</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-lowest dark:bg-slate-900/60 p-4 rounded-2xl border border-border shadow-2xs text-xs">
                <span className="text-muted-foreground">
                  Showing 1-{filteredDiseases.length} of 1,428 entries
                </span>

                <div className="flex items-center gap-1 font-mono">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      sound.playClick();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        sound.playClick();
                        setCurrentPage(page);
                      }}
                      className={`w-7 h-7 rounded-lg font-bold text-xs transition-all ${
                        currentPage === page
                          ? "bg-[#00635e] text-white shadow-2xs"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <span className="px-1 text-muted-foreground">...</span>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setCurrentPage(238);
                    }}
                    className={`w-9 h-7 rounded-lg font-bold text-xs transition-all ${
                      currentPage === 238
                        ? "bg-[#00635e] text-white shadow-2xs"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    238
                  </button>

                  <button
                    disabled={currentPage === 238}
                    onClick={() => {
                      sound.playClick();
                      setCurrentPage((p) => Math.min(238, p + 1));
                    }}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Educational Disclaimer & Non-Diagnostic Purpose Banner */}
          <div className="p-5 rounded-3xl bg-teal-500/5 border border-teal-500/20 shadow-2xs space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-bold text-foreground uppercase tracking-wider text-[11px]">
              <Info className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>EDUCATIONAL DISCLAIMER & NON-DIAGNOSTIC PURPOSE</span>
            </div>
            <p className="leading-relaxed">
              The genomic data and disease classifications indexed in this explorer are compiled for educational and academic discovery only. They do not constitute a clinical diagnosis, prognostic determination, or therapeutic prescription. Always consult a board-certified medical geneticist, genetic counselor, or primary physician for clinical diagnostic evaluation and interpretation of genetic variants.
            </p>
          </div>
        </main>

        <SafetyNotice />
      </div>

      {/* Disease Details Modal */}
      {selectedDiseaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-background rounded-3xl border border-border shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-800 dark:text-teal-300 font-bold text-xs border border-teal-500/20">
                    {selectedDiseaseModal.inheritance}
                  </span>
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {selectedDiseaseModal.gene} • {selectedDiseaseModal.locus}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">
                  {selectedDiseaseModal.title}
                </h3>
                <span className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                  {selectedDiseaseModal.verificationBadge}
                </span>
              </div>

              <button
                onClick={() => setSelectedDiseaseModal(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-surface-container-low dark:bg-slate-800 text-center text-xs">
              <div>
                <span className="text-muted-foreground block">OMIM Catalog</span>
                <span className="font-bold text-foreground font-mono">#{selectedDiseaseModal.omimId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Citations</span>
                <span className="font-bold text-foreground">{selectedDiseaseModal.referenceCount} Papers</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Prevalence</span>
                <span className="font-bold text-foreground text-[11px] truncate block">
                  {selectedDiseaseModal.prevalence.slice(0, 16)}...
                </span>
              </div>
            </div>

            {/* Clinical Overview */}
            <div className="space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">Clinical Pathophysiology</span>
              <p className="text-foreground/90 leading-relaxed bg-surface-lowest dark:bg-slate-900 p-3.5 rounded-xl border border-border">
                {selectedDiseaseModal.description}
              </p>
            </div>

            {/* Molecular Mechanism */}
            <div className="space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">Molecular Biology & Genetics</span>
              <p className="text-foreground/90 leading-relaxed bg-surface-lowest dark:bg-slate-900 p-3.5 rounded-xl border border-border">
                {selectedDiseaseModal.molecularMechanism}
              </p>
            </div>

            {/* Clinical Evaluation Guideline */}
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/20 text-xs space-y-1">
              <span className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                ACMG / ClinGen Standard Evaluation:
              </span>
              <p className="text-teal-800 dark:text-teal-300 leading-relaxed">
                {selectedDiseaseModal.clinicalGuideline}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
              <Link
                href={`/genetics`}
                onClick={() => sound.playClick()}
                className="text-teal-700 dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
              >
                Inspect Gene {selectedDiseaseModal.gene} in Genetics Explorer &rarr;
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    window.open(`https://www.ncbi.nlm.nih.gov/clinvar/?term=${selectedDiseaseModal.gene}`, "_blank");
                  }}
                  className="px-3.5 py-2 rounded-xl border border-border font-semibold hover:bg-muted flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  ClinVar
                </button>
                <button
                  onClick={() => setSelectedDiseaseModal(null)}
                  className="px-5 py-2 rounded-xl bg-[#00635e] text-white font-bold hover:bg-[#00504c]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
