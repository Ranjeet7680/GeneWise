"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Database,
  Dna,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  Microscope,
  Play,
  Printer,
  RotateCcw,
  Search,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Timer,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import SafetyNotice from "@/components/SafetyNotice";
import { sound } from "@/lib/sound";

interface ModuleCard {
  id: string;
  topic: "inheritance" | "fundamentals" | "rare-diseases" | "testing" | "counseling";
  topicLabel: string;
  topicBadgeClass: string;
  title: string;
  desc: string;
  readTime: string;
  level: string;
  progressPercent: number;
  statusText: string;
  actionText: string;
  acmgTier?: string;
  fullContent?: {
    overview: string;
    sections: { heading: string; body: string }[];
    clinicalPearls: string[];
    pmidRef?: string;
  };
}

const MODULE_CARDS: ModuleCard[] = [
  {
    id: "mod-1",
    topic: "inheritance",
    topicLabel: "Inheritance Models",
    topicBadgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    title: "Dominant vs. Recessive: How Traits Traverse Generations",
    desc: "Deconstruct Mendelian inheritance with interactive Punnett models. Learn why autosomal dominant conditions manifest differently across sexes, age cohorts, and expressivity spectrums.",
    readTime: "8 min read",
    level: "Beginner • 4 modules",
    progressPercent: 75,
    statusText: "75% completed",
    actionText: "Continue",
    acmgTier: "ACMG Level 1",
    fullContent: {
      overview:
        "Mendelian inheritance forms the foundational bedrock of medical clinical genetics. Understanding the probabilistic transmission of autosomal dominant, autosomal recessive, and X-linked traits allows accurate counseling and recurrence risk forecasting.",
      sections: [
        {
          heading: "1. Autosomal Dominant Transmission Dynamics",
          body: "In autosomal dominant traits, an affected individual typically has a 50% chance of passing the variant allele to each child, regardless of sex. Notable examples include Marfan syndrome (FBN1) and Huntington disease (HTT). Variable expressivity and reduced penetrance can lead to varying phenotypic severity within the same lineage.",
        },
        {
          heading: "2. Autosomal Recessive Carrier Genetics",
          body: "Recessive conditions require homozygous or compound heterozygous pathogenic variants (one from each parent). Unaffected carriers possess one normal allele that provides sufficient functional enzyme or protein. When two carrier parents conceive, each pregnancy carries a 25% risk of affected offspring, a 50% carrier probability, and a 25% chance of non-carrier wild-type status.",
        },
        {
          heading: "3. Punnett Calculations and Clinical Pedigree Tracing",
          body: "Using standardized NSGC pedigree symbols (squares for males, circles for females, filled symbols for affected individuals), clinicians calculate transmission probabilities across three generations.",
        },
      ],
      clinicalPearls: [
        "Incomplete penetrance means carrying the genotype does not guarantee disease onset.",
        "Compound heterozygosity involves two distinct pathogenic variants in the same gene.",
        "Gonadal mosaicism should be considered when healthy parents have multiple affected children with a dominant trait.",
      ],
      pmidRef: "PMID: 25741868 (ACMG Standards & Guidelines)",
    },
  },
  {
    id: "mod-2",
    topic: "fundamentals",
    topicLabel: "Fundamentals",
    topicBadgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20",
    title: "Understanding Variants of Uncertain Significance (VUS)",
    desc: "The grey zone of medical genetics: what does it mean when a variant lacks sufficient population or functional evidence, and how continuous global databases reclassify them over time.",
    readTime: "10 min read",
    level: "Intermediate • Case studies",
    progressPercent: 0,
    statusText: "Not started",
    actionText: "Start Guide",
    acmgTier: "ACMG Tier 3",
    fullContent: {
      overview:
        "Variants of Uncertain Significance (VUS) represent nucleotide alterations where current clinical evidence is insufficient to decisively assign a pathogenic or benign role. Over 80% of VUS are eventually downgraded to benign as population databases expand.",
      sections: [
        {
          heading: "1. The 5-Tier ACMG Classification Matrix",
          body: "ACMG/AMP guidelines establish five standard tiers: Pathogenic (Class 5), Likely Pathogenic (Class 4), VUS (Class 3), Likely Benign (Class 2), and Benign (Class 1). Class 3 variants lack definitive in silico, segregation, or functional assay concordance.",
        },
        {
          heading: "2. The Golden Rule of Clinical Practice",
          body: "A VUS must NEVER be used to dictate irreversible clinical decisions (e.g., prophylactic mastectomy, termination of pregnancy, or intensive organ-system resection). Medical management should follow personal and family history, not an uncertain genetic read.",
        },
        {
          heading: "3. Periodic Reclassification in ClinVar",
          body: "Laboratories continually re-evaluate VUS against expanded cohorts (gnomAD, ClinVar). When new literature or familial segregation data emerges, labs issue updated clinical amendments to attending physicians.",
        },
      ],
      clinicalPearls: [
        "Never perform surgical interventions solely based on a Class 3 VUS.",
        "Encourage cascade testing of affected relatives to determine if the VUS segregates with the disease.",
        "Request laboratory re-evaluation every 12 to 24 months for actionable genes.",
      ],
      pmidRef: "PMID: 25741868",
    },
  },
  {
    id: "mod-3",
    topic: "fundamentals",
    topicLabel: "Fundamentals",
    topicBadgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20",
    title: "The Science of Epigenetics: How Gene Expression is Regulated",
    desc: "Explore DNA methylation and histone modifications. Understand how environmental inputs turn genetic switches on and off without modifying the underlying nucleotide sequence.",
    readTime: "15 min read",
    level: "Advanced • Visual diagrams",
    progressPercent: 25,
    statusText: "25% completed",
    actionText: "Continue",
    acmgTier: "Molecular Epigenomics",
    fullContent: {
      overview:
        "Epigenetics explores heritable changes in gene expression that occur without altering the underlying DNA sequence. These biochemical modifications determine whether a specific gene is transcribed into mRNA or silenced.",
      sections: [
        {
          heading: "1. DNA Methylation at CpG Islands",
          body: "Addition of methyl groups (-CH3) to cytosine bases in CpG islands near gene promoter regions typically leads to transcriptional repression and gene silencing. Aberrant hypermethylation of tumor suppressor genes is a hallmark of oncogenesis.",
        },
        {
          heading: "2. Histone Acetylation and Chromatin Remodeling",
          body: "Histone acetyltransferases (HATs) add acetyl groups, neutralizing positive lysine charges and loosening chromatin structure (euchromatin) to allow RNA polymerase binding. Histone deacetylases (HDACs) condense chromatin (heterochromatin), silencing transcription.",
        },
        {
          heading: "3. Environmental Plasticity and Multi-Generational Impact",
          body: "Nutrition, psychological stress, exercise, and chemical exposures can modify epigenetic tags, occasionally escaping global zygotic reprogramming to influence subsequent generations.",
        },
      ],
      clinicalPearls: [
        "Epigenetic marks are dynamic and reversible, providing therapeutic targets (HDAC inhibitors, DNMT inhibitors).",
        "Genomic imprinting explains why Prader-Willi and Angelman syndromes result from identical 15q11-q13 deletions depending on parental origin.",
      ],
      pmidRef: "PMID: 31086050 (Cellular Epigenetics Review)",
    },
  },
  {
    id: "mod-4",
    topic: "rare-diseases",
    topicLabel: "Applied Genomics",
    topicBadgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20",
    title: "How Kaggle & Open Compendia Accelerate Rare Disease Research",
    desc: "A review of open science pipelines: how distributed data competitions identify novel candidate genes for orphan diseases at scale using ClinVar and NCBI datasets.",
    readTime: "9 min read",
    level: "Applied • Data pipelines",
    progressPercent: 100,
    statusText: "Completed",
    actionText: "Review",
    acmgTier: "Open Science Hub",
    fullContent: {
      overview:
        "Orphan conditions affect fewer than 200,000 individuals nationally, leading to fragmented clinical datasets. Open genomic competitions on Kaggle and NCBI repositories bridge this diagnostic gap by crowdsourcing machine learning algorithms.",
      sections: [
        {
          heading: "1. Multi-Omic Feature Extraction",
          body: "Modern algorithms extract phenotypic terms (Human Phenotype Ontology - HPO), splice site disruption scores (SpliceAI), and amino acid conservation metrics (PhyloP) to prioritize non-synonymous variants in exome data.",
        },
        {
          heading: "2. Benchmarking ROC-AUC on Kaggle Cohorts",
          body: "Kaggle genomic competitions benchmark gradient-boosted trees and neural architectures against ClinVar ground-truth data, achieving >93% ROC-AUC in classifying pathogenicity without human review bottlenecks.",
        },
        {
          heading: "3. Patient Data Sovereignty and Privacy",
          body: "Kaggle pipelines employ synthetic genomic datasets and differential privacy transforms to safeguard patient anonymity while advancing open-source medical discoveries.",
        },
      ],
      clinicalPearls: [
        "Crowdsourced bioinformatics accelerates candidate gene discovery by orders of magnitude.",
        "Always cross-reference in silico algorithmic predictions with functional laboratory assays.",
      ],
      pmidRef: "PMID: 32661502 (Open Genomic AI Compendia)",
    },
  },
  {
    id: "mod-5",
    topic: "inheritance",
    topicLabel: "Inheritance Models",
    topicBadgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    title: "X-Linked Transmission in Hemophilia and Muscular Dystrophy",
    desc: "Clear pedigree illustrations showing maternal carrier lineages, male hemizygosity, and why Lyonization causes variable symptoms in female carriers.",
    readTime: "11 min read",
    level: "Intermediate • Pedigree Charts",
    progressPercent: 0,
    statusText: "Not started",
    actionText: "Start Guide",
    acmgTier: "X-Linked Genetics",
    fullContent: {
      overview:
        "X-linked disorders result from variants located on the X chromosome. Because biological males have one X and one Y chromosome (hemizygous), inheriting a single pathogenic variant causes full clinical manifestation.",
      sections: [
        {
          heading: "1. Hemizygosity and Transmission Rules",
          body: "Affected fathers NEVER transmit an X-linked condition to their sons (since sons inherit their Y chromosome), but 100% of their daughters inherit the altered X chromosome and become obligate carriers.",
        },
        {
          heading: "2. Skewed X-Inactivation (Lyonization)",
          body: "Early in female embryonic development, one X chromosome is randomly inactivated in each cell. If random inactivation is significantly skewed, female carriers of hemophilia (F8/F9) or Duchenne muscular dystrophy (DMD) can manifest moderate-to-severe symptoms.",
        },
        {
          heading: "3. Recurrence Calculations",
          body: "Carrier mothers have a 50% probability with each pregnancy of having an affected son and a 50% chance of having a carrier daughter.",
        },
      ],
      clinicalPearls: [
        "Absence of male-to-male transmission is the cardinal hallmark of X-linked inheritance.",
        "Factor VIII activity assays should be obtained in female carriers prior to invasive surgical procedures.",
      ],
      pmidRef: "PMID: 30128456 (Hemophilia X-Linked Genetics)",
    },
  },
  {
    id: "mod-6",
    topic: "counseling",
    topicLabel: "Counseling & Ethics",
    topicBadgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    title: "Preparing for Your First Genetics Consultation: A Step-by-Step Checklist",
    desc: "How to gather a 3-generation family history, obtain relevant hospital records, and set realistic expectations for genetic counseling appointments.",
    readTime: "6 min read",
    level: "Practical • Downloadable PDF",
    progressPercent: 100,
    statusText: "Completed",
    actionText: "Review",
    acmgTier: "Clinical Prep Tool",
    fullContent: {
      overview:
        "Preparing effectively for a genetic consultation maximizes the diagnostic yield of your appointment. Having organized family records ensures accurate pedigree charting and targeted test selection.",
      sections: [
        {
          heading: "1. Gathering 3-Generation Medical Records",
          body: "Document biological parents, grandparents, siblings, aunts, uncles, and cousins. Record exact ages of primary diagnosis (especially early-onset cancers before age 50 or sudden cardiac events before age 55).",
        },
        {
          heading: "2. Pathology Reports & Autopsy Summaries",
          body: "When available, pathology reports (immunohistochemistry, tumor somatic sequencing) and official death certificates provide invaluable molecular context.",
        },
        {
          heading: "3. Legal Protections: The GINA Act",
          body: "The Genetic Information Nondiscrimination Act (GINA) protects individuals from genetic discrimination in health insurance and employment, though it does not cover life, disability, or long-term care insurance.",
        },
      ],
      clinicalPearls: [
        "Knowing the precise tumor histology (e.g., triple-negative breast vs. ER+) dramatically clarifies gene panel selection.",
        "Always inquire about testing living affected relatives first, as testing unaffected individuals can yield uninformative normal results.",
      ],
      pmidRef: "PMID: 32042150 (NSGC Practice Guideline)",
    },
  },
];

const GLOSSARY_ITEMS: Record<
  string,
  { title: string; tag: string; definition: string; context: string }
> = {
  Proband: {
    title: "Proband [PRO-band]",
    tag: "n. Clinical",
    definition:
      "The primary family member through whom a family's medical or genetic history first comes to medical attention. Often indicated in a pedigree tree with a small diagonal arrow.",
    context: "Context: Used in pedigree construction to anchor familial risk estimations.",
  },
  Allele: {
    title: "Allele [uh-LEEL]",
    tag: "n. Molecular",
    definition:
      "One of two or more alternative forms of a gene that arise by mutation and are found at the exact same place on a chromosome.",
    context: "Context: You inherit one allele from each biological parent for every autosomal gene.",
  },
  Heterozygous: {
    title: "Heterozygous [het-er-oh-ZY-gus]",
    tag: "adj. Genetics",
    definition:
      "Having inherited different forms of a particular gene from each biological parent (e.g. one wild-type and one variant allele).",
    context: "Context: In recessive disorders, heterozygous carriers generally show no clinical symptoms.",
  },
  Phenotype: {
    title: "Phenotype [FEE-noh-type]",
    tag: "n. Clinical",
    definition:
      "The observable physical, physiological, or biochemical traits of an individual, determined by genetic makeup and environmental interactions.",
    context: "Context: While genotype is the DNA code, phenotype is how it actually presents clinically.",
  },
  Penetrance: {
    title: "Penetrance [PEN-ih-truns]",
    tag: "n. Statistical",
    definition:
      "The proportion of individuals carrying a particular genetic variant who actually exhibit the associated clinical symptoms or disease.",
    context: "Context: Reduced or incomplete penetrance explains why some gene carriers never develop disease.",
  },
  Epigenetics: {
    title: "Epigenetics [ep-ih-jeh-NET-iks]",
    tag: "n. Molecular",
    definition:
      "Heritable molecular modifications (such as DNA methylation and histone acetylation) that alter gene activity without altering the DNA sequence.",
    context: "Context: Explains how environmental factors influence disease susceptibility.",
  },
  Pathogenic: {
    title: "Pathogenic [path-oh-JEN-ik]",
    tag: "adj. ACMG Class 5",
    definition:
      "A genetic variant that has definitive clinical evidence establishing it as disease-causing under standardized ACMG/AMP criteria (>99% certainty).",
    context: "Context: Actionable for medical surveillance, surgical risk reduction, or targeted therapy.",
  },
  VUS: {
    title: "VUS [Variant of Uncertain Significance]",
    tag: "n. ACMG Class 3",
    definition:
      "A genetic change whose clinical significance cannot be confirmed or ruled out based on current medical evidence.",
    context: "Context: Should not be used to direct clinical management or prophylactic interventions.",
  },
};

const CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "fundamentals", label: "Fundamentals" },
  { id: "inheritance", label: "Inheritance Models" },
  { id: "rare-diseases", label: "Rare Diseases" },
  { id: "testing", label: "Testing & Panels" },
  { id: "counseling", label: "Counseling & Ethics" },
];

export default function MedicalResearchLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState("Proband");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(["mod-1", "mod-6", "featured"]);
  const [selectedModule, setSelectedModule] = useState<ModuleCard | null>(null);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklistItems, setChecklistItems] = useState([
    { id: "c1", text: "Obtain documented pathology reports & tumor histology for affected relatives", done: true },
    { id: "c2", text: "Record exact age at diagnosis for all 1st and 2nd degree relatives", done: true },
    { id: "c3", text: "Document premature cardiovascular events (<55y in males, <65y in females)", done: true },
    { id: "c4", text: "Collect previous genetic testing lab reports from affected family members", done: false },
    { id: "c5", text: "Formulate list of 3-5 specific reproductive or surveillance questions", done: false },
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleBookmark = (id: string, title: string) => {
    sound.playPop();
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((b) => b !== id) : [...prev, id];
      setToastMessage(exists ? `Removed "${title}" from saved guides` : `Saved "${title}" to your library`);
      setTimeout(() => setToastMessage(null), 2500);
      return next;
    });
  };

  const toggleChecklistItem = (id: string) => {
    sound.playClick();
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const filteredModules = useMemo(() => {
    return MODULE_CARDS.filter((mod) => {
      if (selectedCategory !== "all" && mod.topic !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          mod.title.toLowerCase().includes(q) ||
          mod.desc.toLowerCase().includes(q) ||
          mod.topicLabel.toLowerCase().includes(q) ||
          (mod.acmgTier && mod.acmgTier.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const activeGlossaryData = GLOSSARY_ITEMS[activeGlossaryTerm] || GLOSSARY_ITEMS.Proband;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4faff] dark:bg-[#0a161d] text-foreground">
      <AppHeader />

      <div className="flex-1 flex overflow-hidden">
        <AppSidebar />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto overflow-y-auto animate-fade-in-up pb-24 md:pb-8">
          {/* Top Header & Search Bar matching Stitch Design */}
          <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-border/80">
            <div className="flex flex-col max-w-3xl">
              <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>Open Curriculum & Educational Guides</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Genomics Learning Centre
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1.5 leading-relaxed">
                Bite-sized, clinically verified guides designed to demystify hereditary health, molecular diagnostics, and pedigree literacy.
              </p>
            </div>

            {/* Quick Search Widget */}
            <div className="w-full lg:w-96 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between" htmlFor="learning-search">
                <span>Search Library</span>
                <span className="text-primary font-mono text-[11px] font-bold">INDEX: v4.2 ACMG</span>
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 text-primary w-4 h-4 pointer-events-none" />
                <input
                  id="learning-search"
                  type="text"
                  placeholder="Search articles, topics, terms (e.g. allele, penetrance)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-9 rounded-xl bg-white dark:bg-[#162730] border border-border text-foreground placeholder:text-muted-foreground/70 text-xs sm:text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 p-1 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Filter Category Pills matching Stitch Design */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white dark:bg-[#162730] text-muted-foreground hover:text-foreground border border-border hover:bg-surface-low"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* FEATURED DEEP-DIVE GUIDE (HERO CARD matching Stitch Design) */}
          {/* ========================================================================= */}
          <section className="relative w-full rounded-2xl bg-white dark:bg-[#162730] border border-border/80 shadow-md overflow-hidden flex flex-col lg:flex-row">
            <div className="relative w-full lg:w-5/12 h-64 lg:h-auto overflow-hidden bg-emerald-950/20">
              {/* High-Tech Genetic Laboratory Photo */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmSTDhW_8_1gZI-cugqPjhCLvp8sml3IR_iWiDp7ceJVBp1WVWPXiUm1IAjpJ6PzXXeXUT97CshR1LYwiYUyeCg_zqqjULIpT9urwtZuxQ0kLN42jJvHnWqt2XzXL4XYPQM9TnmaZ2scBxlJka7LIcTu_5f-xbdxHZuvni-yxTtrOa41w5JeSJu4b8c9wvPPorEkwsYFy6HGDHclK6SvgcmiA4CLhybhBAYRPiLI-ZBuZV3o_fP0vY"
                alt="A modern, high-tech genetic laboratory visual featuring translucent double helix crystalline structures hovering over a pristine clinical workstation"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white/90 lg:from-transparent via-transparent to-white/90 lg:to-white dark:from-[#162730]/90 dark:to-[#162730] pointer-events-none" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary text-white text-[11px] font-bold tracking-wide flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  FEATURED GUIDE
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-7 lg:p-8 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs font-semibold mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" /> 12 min read
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="px-2 py-0.5 rounded bg-surface-low border border-border text-foreground font-bold">
                    Intermediate
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <BookOpen className="w-3.5 h-3.5" /> ClinVar & ACMG Guidelines Referenced
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Deciphering Your Clinical Genetic Report: A Patient-Centered Guide
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">
                  A comprehensive, compassionate walkthrough detailing how molecular genetics laboratories structure their findings. Learn how pathogenic variants, benign polymorphisms, and inconclusive reads are categorized under modern ACMG standards.
                </p>

                {/* Key Learning Objectives Box */}
                <div className="mt-4 p-4 rounded-xl bg-surface-low/80 dark:bg-black/20 border border-border/80 space-y-2">
                  <span className="text-xs uppercase tracking-wider text-primary font-bold block">
                    Key Learning Objectives
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>The 5 ACMG classification tiers for genomic variants</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Differentiating carrier states from primary clinical phenotypes</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Interpreting exon positions and nucleotide nomenclature</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Formulating specific questions for your genetic counselor</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Author & Action CTA */}
              <div className="pt-3 border-t border-border/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shadow-xs">
                    AC
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">By Dr. Alicia Chen, FACMG</span>
                    <span className="text-[10px] text-muted-foreground">Reviewed by Clinical Advisory Board</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      toggleBookmark("featured", "Deciphering Your Clinical Genetic Report")
                    }
                    className="p-2.5 rounded-xl border border-border bg-white dark:bg-[#162730] hover:text-primary transition-all shadow-2xs cursor-pointer"
                    title="Bookmark Guide"
                  >
                    {bookmarkedIds.includes("featured") ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      sound.playPop();
                      setSelectedModule({
                        id: "featured",
                        topic: "fundamentals",
                        topicLabel: "Variant Interpretation",
                        topicBadgeClass: "bg-primary text-white",
                        title: "Deciphering Your Clinical Genetic Report: A Patient-Centered Guide",
                        desc: "A comprehensive walkthrough detailing how molecular genetics laboratories structure their findings under modern ACMG standards.",
                        readTime: "12 min read",
                        level: "Intermediate • ACMG Framework",
                        progressPercent: 60,
                        statusText: "60% completed",
                        actionText: "Resume",
                        acmgTier: "ACMG Standards",
                        fullContent: {
                          overview:
                            "Molecular genetic reports contain complex nomenclature governed by the Human Genome Variation Society (HGVS) and ACMG/AMP clinical consensus criteria. This guide translates those technical tables into actionable clinical insights.",
                          sections: [
                            {
                              heading: "1. The 5-Tier Classification Ladder",
                              body: "Variants are categorized into five distinct buckets: Pathogenic (Class 5), Likely Pathogenic (Class 4), Variant of Uncertain Significance (VUS, Class 3), Likely Benign (Class 2), and Benign (Class 1). Only Class 4 and 5 variants warrant definitive clinical disease management.",
                            },
                            {
                              heading: "2. Decoding cDNA and Protein Nomenclature",
                              body: "For example, 'c.1521_1523delCTT (p.Phe508del)' indicates that at complementary DNA position 1521-1523, a 3-base deletion occurred, resulting in the loss of a phenylalanine residue at codon 508 of the CFTR protein.",
                            },
                            {
                              heading: "3. Carrier Status vs. Affected Status",
                              body: "Identifying a single pathogenic variant in an autosomal recessive gene (such as CFTR or HBB) denotes carrier status. Carriers generally do not manifest symptoms, but have reproductive recurrence considerations.",
                            },
                          ],
                          clinicalPearls: [
                            "Always verify whether the tested panel was Next-Generation Sequencing (NGS), Sanger confirmation, or MLPA copy-number analysis.",
                            "Negative genetic reports do not rule out hereditary conditions if regulatory or deep intronic regions were unsequenced.",
                          ],
                          pmidRef: "PMID: 25741868 (Richards et al. ACMG/AMP)",
                        },
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all cursor-pointer"
                  >
                    <span>Start Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* MAIN GRID: 2/3 Content Cards + 1/3 Interactive Toolkit / Sidebar */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* 2x3 Modular Articles Section (8 cols) */}
            <div className="xl:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Curated Learning Modules</h3>
                  <p className="text-xs text-muted-foreground">
                    Evidence-based coursework created with certified clinical geneticists.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  SHOWING {filteredModules.length} OF {MODULE_CARDS.length} MODULES
                </span>
              </div>

              {/* 2x3 Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredModules.map((card) => {
                  const isBookmarked = bookmarkedIds.includes(card.id);

                  return (
                    <article
                      key={card.id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#162730] border border-border/80 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${card.topicBadgeClass}`}>
                            {card.topicLabel}
                          </span>
                          <button
                            onClick={() => toggleBookmark(card.id, card.title)}
                            className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            title={isBookmarked ? "Remove bookmark" : "Bookmark module"}
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {card.title}
                        </h4>

                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/60 space-y-2">
                        <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-primary" /> {card.readTime}
                          </span>
                          <span className="text-primary font-bold text-[11px]">{card.level}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-surface-low dark:bg-black/30 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${card.progressPercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                            {card.progressPercent === 100 && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            {card.statusText}
                          </span>

                          {card.id === "mod-6" ? (
                            <button
                              onClick={() => {
                                sound.playPop();
                                setShowChecklistModal(true);
                              }}
                              className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Checklist PDF <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                sound.playPop();
                                setSelectedModule(card);
                              }}
                              className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {card.actionText} <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Curriculum Pathway Banner matching Stitch screen */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-white to-primary/10 dark:from-[#162730] dark:via-[#111e25] dark:to-[#162730] border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-foreground">
                      Earn Your Family Health Advocate Credential
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Complete all 12 core modules to unlock verified pedigree construction tools and clinical report exports.
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shrink-0 hover:opacity-90 transition-all shadow-xs"
                >
                  View Curriculum
                </Link>
              </div>
            </div>

            {/* Right Column: Learning Tracker & Widgets (4 cols matching Stitch) */}
            <aside className="xl:col-span-4 flex flex-col gap-5">
              {/* 1. Mastery Tracker Panel */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#162730] border border-border shadow-xs flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Topic Mastery Tracker</h3>
                    <p className="text-[11px] text-muted-foreground">Continuous clinical literacy progress</p>
                  </div>
                  <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </span>
                </div>

                {/* Progress Ring & Summary */}
                <div className="p-3.5 rounded-xl bg-surface-low dark:bg-black/20 border border-border flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="stroke-border"
                        strokeWidth="3.5"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="stroke-primary"
                        strokeWidth="3.5"
                        strokeDasharray="33.3, 100"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-foreground">33%</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-base font-extrabold text-foreground">4 of 12</span>
                    <span className="text-xs text-muted-foreground">Core modules completed</span>
                  </div>
                </div>

                {/* Topic Breakdown Bars */}
                <div className="flex flex-col gap-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span>Inheritance Patterns</span>
                    </span>
                    <span className="font-mono text-muted-foreground font-semibold">2/3 Done</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span>Laboratory Classifications</span>
                    </span>
                    <span className="font-mono text-muted-foreground font-semibold">1/3 Done</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                      <span>Pedigree Literacy</span>
                    </span>
                    <span className="font-mono text-muted-foreground font-semibold">1/2 Done</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-border" />
                      <span>Ethical & Insurance Rights</span>
                    </span>
                    <span className="font-mono text-muted-foreground font-semibold">0/4 Done</span>
                  </div>
                </div>
              </div>

              {/* 2. Saved Guides Panel matching Stitch */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#162730] border border-border shadow-xs flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Your Saved Guides</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {bookmarkedIds.length}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Bookmarked for clinical reference and genetic counselor consultations.
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      const mod = MODULE_CARDS.find((m) => m.id === "mod-1");
                      if (mod) setSelectedModule(mod);
                    }}
                    className="p-3 rounded-xl bg-surface-low dark:bg-black/20 hover:bg-surface-container transition-all flex items-start justify-between text-left group"
                  >
                    <div className="flex flex-col pr-2">
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        Dominant vs. Recessive: How Traits Traverse
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">8 min • 4 modules</span>
                    </div>
                    <BookmarkCheck className="w-4 h-4 text-primary shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowChecklistModal(true);
                    }}
                    className="p-3 rounded-xl bg-surface-low dark:bg-black/20 hover:bg-surface-container transition-all flex items-start justify-between text-left group"
                  >
                    <div className="flex flex-col pr-2">
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        Preparing for Your First Genetics Consultation
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">6 min • Checklist PDF</span>
                    </div>
                    <BookmarkCheck className="w-4 h-4 text-primary shrink-0" />
                  </button>
                </div>
              </div>

              {/* 3. Quick Glossary Lookup Widget (Interactive matching Stitch script) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#162730] border border-border shadow-xs flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Quick Glossary Lookup</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-primary uppercase">Instant</span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Tap any genetic term for an instant, plain-English clinical definition.
                </p>

                {/* Term Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Object.keys(GLOSSARY_ITEMS).map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        sound.playPop();
                        setActiveGlossaryTerm(term);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeGlossaryTerm === term
                          ? "bg-primary text-white shadow-xs"
                          : "bg-surface-low dark:bg-black/20 text-foreground hover:bg-surface-container"
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>

                {/* Dynamic Term Definition Box */}
                <div className="p-3.5 rounded-xl bg-surface-low dark:bg-black/20 border border-border space-y-1 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary font-mono">
                      {activeGlossaryData.title}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                      {activeGlossaryData.tag}
                    </span>
                  </div>
                  <p className="text-xs text-foreground mt-1 leading-relaxed">
                    {activeGlossaryData.definition}
                  </p>
                  <p className="text-[10px] text-muted-foreground italic mt-1">
                    {activeGlossaryData.context}
                  </p>
                </div>
              </div>
            </aside>
          </div>

          {/* ========================================================================= */}
          {/* EDITORIAL SPOTLIGHT BANNER / RESEARCH COMPENDIA (matching Stitch Design) */}
          {/* ========================================================================= */}
          <section className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-[#162730] border border-border shadow-xs flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/3 h-52 rounded-xl overflow-hidden shrink-0 bg-emerald-950/20">
              {/* Pipette & Biochip Photo */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3M3-bsJuRnc6yBVmb2dQJP-nWJbsKFOmCmrN2mSL4BQiqf03FfZLyLhZS8325h8msfE57iJV7jn7ROxHjcZfNs5GpXTRWY5Fm42V8jpojQOeJQ-71qx0vOJGHPZiZH7aXzzyNT4aLxnrSPpICWUs6guSRnVggqamUmuzuQlaRwlSXd3g8wpZQqr3RbaVuxWY6iluqVZkZSqZAF_PqxIjEEULxL43HPYASymbJZToTsSPftQ_61lbH"
                alt="Close up photographic view of an illuminated medical laboratory pipette dispensing a DNA sequence solution onto a microfluidic biochip"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col flex-1 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider self-start">
                <Lightbulb className="w-3.5 h-3.5" />
                Evidence-Based Literacy
              </div>

              <h3 className="text-base sm:text-xl font-bold text-foreground">
                Empowering Informed Genomic Decision-Making
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Genomic information holds immense power, but raw variant codes often create unnecessary uncertainty. GeneWise curriculums translate peer-reviewed scientific literature into actionable understanding, helping you navigate discussions with geneticists, oncologists, and primary physicians with calm confidence.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <Link
                  href="/diseases"
                  className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
                >
                  <span>Explore Clinical Practice Guidelines</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  Validated against HGVS and ACMG standards
                </span>
              </div>
            </div>
          </section>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-20 sm:bottom-8 right-6 z-50 p-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODULE DETAIL READER MODAL */}
      {/* ========================================================================= */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#162732] border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary font-mono">
                  {selectedModule.acmgTier || selectedModule.topicLabel} · {selectedModule.readTime}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mt-1">
                  {selectedModule.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              <p className="text-foreground font-medium text-xs sm:text-sm">
                {selectedModule.fullContent?.overview || selectedModule.desc}
              </p>

              {selectedModule.fullContent?.sections.map((sec, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-surface-low dark:bg-black/20 border border-border space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">{sec.heading}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{sec.body}</p>
                </div>
              ))}

              {selectedModule.fullContent?.clinicalPearls && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Clinical Pearls for Patients & Providers
                  </span>
                  <ul className="space-y-1.5 text-xs text-foreground">
                    {selectedModule.fullContent.clinicalPearls.map((pearl, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{pearl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedModule.fullContent?.pmidRef && (
                <p className="text-[11px] font-mono text-muted-foreground">
                  Reference: {selectedModule.fullContent.pmidRef}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <button
                onClick={() => toggleBookmark(selectedModule.id, selectedModule.title)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold flex items-center gap-1.5"
              >
                {bookmarkedIds.includes(selectedModule.id) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-emerald-500" /> Saved to Library
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" /> Save for Review
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  sound.playSuccess();
                  setSelectedModule(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold"
              >
                Mark Module Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHECKLIST MODAL (Preparing for Genetics Consultation) */}
      {/* ========================================================================= */}
      {showChecklistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#162732] border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  Practical Intake Checklist
                </span>
                <h3 className="text-base sm:text-lg font-bold text-foreground mt-1">
                  Preparing for Your First Genetics Consultation
                </h3>
              </div>
              <button
                onClick={() => setShowChecklistModal(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Complete these preparation steps to optimize the diagnostic yield and insurance pre-authorization during your intake session:
            </p>

            <div className="space-y-2 text-xs">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    item.done
                      ? "bg-surface-low border-border/80 text-foreground"
                      : "bg-white dark:bg-black/20 border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        item.done ? "bg-primary text-white" : "border border-muted-foreground/40"
                      }`}
                    >
                      {item.done && <Check className="w-3 h-3" />}
                    </div>
                    <span className={`text-xs ${item.done ? "font-semibold" : "line-through opacity-70"}`}>
                      {item.text}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                      item.done
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-surface-low text-muted-foreground"
                    }`}
                  >
                    {item.done ? "Done" : "Pending"}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  sound.playSuccess();
                  window.print();
                }}
                className="px-3.5 py-2 rounded-xl border border-border hover:bg-surface-low text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Checklist
              </button>

              <button
                onClick={() => setShowChecklistModal(false)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
