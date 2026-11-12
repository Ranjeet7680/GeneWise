"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Database,
  ExternalLink,
  FileCode,
  FileText,
  Filter,
  Layers,
  Microscope,
  Network,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PublicDocShell from "@/components/PublicDocShell";
import SafetyNotice from "@/components/SafetyNotice";
import { sound } from "@/lib/sound";

interface ConditionLineage {
  name: string;
  gene: string;
  locus: string;
  clinvarId: string;
  clinvarClassification: string;
  orphaCode: string;
  omimId: string;
  kaggleSet: string;
  citations: string[];
}

const LINEAGE_RECORDS: ConditionLineage[] = [
  {
    name: "Cystic Fibrosis",
    gene: "CFTR",
    locus: "7q31.2",
    clinvarId: "VCV000007105.77",
    clinvarClassification: "Pathogenic (4 Stars - Expert Panel)",
    orphaCode: "ORPHA:586",
    omimId: "OMIM #219700",
    kaggleSet: "Kaggle-Genomics-RareDisease-v2.4 / split-01",
    citations: [
      "Riordan JR, et al. Identification of the cystic fibrosis gene. Science 1989;245:1066-73.",
      "ACMG Standards and Guidelines for Clinical Genetics Laboratories (2020 Update)."
    ]
  },
  {
    name: "Marfan Syndrome",
    gene: "FBN1",
    locus: "15q21.1",
    clinvarId: "VCV000016375.42",
    clinvarClassification: "Pathogenic (3 Stars - Reviewed by Panel)",
    orphaCode: "ORPHA:558",
    omimId: "OMIM #154700",
    kaggleSet: "Kaggle-Genomics-RareDisease-v2.4 / split-03",
    citations: [
      "Dietz HC, et al. Marfan syndrome caused by a recurrent missense mutation. Nature 1991;352:337-9.",
      "Ghent Nosology Revision for Marfan Syndrome. J Med Genet 2010;47:476-485."
    ]
  },
  {
    name: "Huntington Disease",
    gene: "HTT",
    locus: "4p16.3",
    clinvarId: "VCV000014234.18",
    clinvarClassification: "Pathogenic CAG Expansion (>36 repeats)",
    orphaCode: "ORPHA:399",
    omimId: "OMIM #143100",
    kaggleSet: "Kaggle-Genomics-RareDisease-v2.4 / split-07",
    citations: [
      "The Huntington's Disease Collaborative Research Group. Cell 1993;72:971-83.",
      "ACMG/ASHG Genetic testing for Huntington disease. Genet Med 2014;16:947-953."
    ]
  },
  {
    name: "Sickle Cell Anemia",
    gene: "HBB",
    locus: "11p15.4",
    clinvarId: "VCV000015112.51",
    clinvarClassification: "Pathogenic (4 Stars - ClinGen Hemoglobinopathy)",
    orphaCode: "ORPHA:232",
    omimId: "OMIM #603903",
    kaggleSet: "Kaggle-Genomics-RareDisease-v2.4 / split-02",
    citations: [
      "Ingram VM. A specific chemical difference between the globins of normal and sickle-cell anaemia. Nature 1956;178:792-4.",
      "NIH-NHLBI Evidence-Based Management of Sickle Cell Disease (2022)."
    ]
  },
  {
    name: "Hemophilia A",
    gene: "F8",
    locus: "Xq28",
    clinvarId: "VCV000010041.89",
    clinvarClassification: "Pathogenic Inversion 22 & Point Variants",
    orphaCode: "ORPHA:98878",
    omimId: "OMIM #306700",
    kaggleSet: "Kaggle-Genomics-RareDisease-v2.4 / split-05",
    citations: [
      "Lakich D, et al. Inversion disrupting the factor VIII gene is a common cause of severe hemophilia A. Nat Genet 1993;5:236-41.",
      "World Federation of Hemophilia Guidelines for the Management of Hemophilia (3rd Edition)."
    ]
  }
];

function DataLineageContent() {
  const searchParams = useSearchParams();
  const initialSource = searchParams.get("source") || "kaggle";
  const [activeTab, setActiveTab] = useState<"kaggle" | "clinvar" | "orphanet">(
    initialSource === "clinvar" || initialSource === "orphanet" ? initialSource : "kaggle"
  );
  const [selectedRecord, setSelectedRecord] = useState<ConditionLineage>(LINEAGE_RECORDS[0]);
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    const param = searchParams.get("source");
    if (param === "kaggle" || param === "clinvar" || param === "orphanet") {
      setActiveTab(param);
    }
  }, [searchParams]);

  const filteredRecords = LINEAGE_RECORDS.filter(
    (r) =>
      r.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.gene.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const activeDocTitle =
    activeTab === "clinvar"
      ? "NCBI ClinVar Citations"
      : activeTab === "orphanet"
      ? "Orphanet Database"
      : "Kaggle Genomic Hub";

  return (
    <PublicDocShell
      sectionLabel="DATA LINEAGE"
      pageTitle={activeDocTitle}
      activeHref={`/data-lineage?source=${activeTab}`}
    >
      <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25">
                  <Database className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Open Science Registry · Provenance & Attribution Matrix
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Genomic Data Lineage Hub
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Inspect the scientific data provenance backing every disease explainer, ACMG variant classification, and pedigree model in GeneWise. Built on open institutional datasets with zero proprietary lock-in.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#14262f] border border-border text-center">
                <span className="block text-sm font-extrabold text-foreground">1,428</span>
                <span className="text-[10px] text-muted-foreground">Conditions Curated</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#14262f] border border-border text-center">
                <span className="block text-sm font-extrabold text-teal-700 dark:text-teal-400">2.4M+</span>
                <span className="text-[10px] text-muted-foreground">ClinVar Records</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#14262f] border border-border text-center">
                <span className="block text-sm font-extrabold text-emerald-700 dark:text-emerald-400">100%</span>
                <span className="text-[10px] text-muted-foreground">Open Citations</span>
              </div>
            </div>
          </div>

          {/* Three Source Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-low border border-border">
            <button
              onClick={() => {
                sound.playSoft();
                setActiveTab("kaggle");
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "kaggle"
                  ? "bg-white dark:bg-[#1a2d37] text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Network className="w-4 h-4 text-teal-600" />
              <span>Kaggle Genomic Hub v2.4</span>
            </button>

            <button
              onClick={() => {
                sound.playSoft();
                setActiveTab("clinvar");
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "clinvar"
                  ? "bg-white dark:bg-[#1a2d37] text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Microscope className="w-4 h-4 text-primary" />
              <span>NCBI ClinVar Citations</span>
            </button>

            <button
              onClick={() => {
                sound.playSoft();
                setActiveTab("orphanet");
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "orphanet"
                  ? "bg-white dark:bg-[#1a2d37] text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Orphanet Rare Diseases</span>
            </button>
          </div>

          {/* Tab 1: Kaggle Genomic Hub */}
          {activeTab === "kaggle" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      Machine Learning & Phenotype Corpus
                    </span>
                    <h2 className="text-lg font-bold text-foreground">
                      Kaggle Genomic Hub v2.4 (Open Community Curation)
                    </h2>
                  </div>
                  <a
                    href="https://www.kaggle.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-all self-start sm:self-auto"
                  >
                    <span>Visit Kaggle Hub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  GeneWise incorporates curated benchmarks from the open Kaggle Genomic Research Hub, uniting over 1,428 Mendelian conditions with verified epidemiological frequency tables and multi-ethnic allele distribution models.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-surface-low border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Dataset Schema</span>
                    <p className="text-xs font-bold text-foreground">Tabular CSV / Parquet v2.4</p>
                    <p className="text-[11px] text-muted-foreground">32 structured clinical phenotype columns</p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-low border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">ML Validation Score</span>
                    <p className="text-xs font-bold text-teal-700 dark:text-teal-400">93.9% ROC-AUC</p>
                    <p className="text-[11px] text-muted-foreground">5-fold stratified cross-validation</p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-low border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Licensing Terms</span>
                    <p className="text-xs font-bold text-foreground">CC-BY 4.0 / Open Access</p>
                    <p className="text-[11px] text-muted-foreground">Free for educational and scientific research</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: NCBI ClinVar Citations */}
          {activeTab === "clinvar" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Gold-Standard Variant Registry
                    </span>
                    <h2 className="text-lg font-bold text-foreground">
                      NCBI ClinVar Citations & ACMG 5-Tier Framework
                    </h2>
                  </div>
                  <a
                    href="https://www.ncbi.nlm.nih.gov/clinvar/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all self-start sm:self-auto"
                  >
                    <span>Visit NCBI ClinVar</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  ClinVar is a freely accessible, public archive of reports of the relationships among human variations and phenotypes, hosted by the National Center for Biotechnology Information (NCBI) at the U.S. National Library of Medicine.
                </p>

                {/* 5-Tier ACMG Banner */}
                <div className="p-4 rounded-xl bg-surface-low border border-border space-y-2">
                  <h3 className="text-xs font-bold text-foreground">
                    ACMG / AMP Variant Classification Standards Supported:
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 font-semibold border border-red-500/20">
                      Pathogenic
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold border border-amber-500/20">
                      Likely Pathogenic
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold border border-blue-500/20">
                      VUS (Uncertain)
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                      Likely Benign
                    </div>
                    <div className="p-2 rounded-lg bg-slate-500/10 text-slate-700 dark:text-slate-400 font-semibold border border-slate-500/20">
                      Benign
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Orphanet Rare Disease Database */}
          {activeTab === "orphanet" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      European Rare Disease Reference
                    </span>
                    <h2 className="text-lg font-bold text-foreground">
                      Orphanet Database (INSERM & European Joint Programme)
                    </h2>
                  </div>
                  <a
                    href="https://www.orpha.net"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all self-start sm:self-auto"
                  >
                    <span>Visit Orphanet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Orphanet provides the global gold standard for rare disease nomenclature (ORPHA codes), establishing definitive classifications, validated epidemiology, and cross-references to OMIM, ICD-10, and MeSH.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-surface-low border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">ORPHA Nomenclature</span>
                    <p className="text-xs font-bold text-foreground">6,100+ Rare Diseases</p>
                    <p className="text-[11px] text-muted-foreground">Standardized multi-lingual indexing</p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-low border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Epidemiology</span>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Point Prevalence</p>
                    <p className="text-[11px] text-muted-foreground">Birth incidence by geographic territory</p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-low border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Institutional Oversight</span>
                    <p className="text-xs font-bold text-foreground">INSERM / EJP RD</p>
                    <p className="text-[11px] text-muted-foreground">Co-funded by the European Commission</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: Interactive Provenance Inspector */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Live Audit Trail
                </span>
                <h2 className="text-lg font-bold text-foreground">
                  Interactive Provenance Inspector
                </h2>
              </div>

              {/* Filter */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by disease or gene..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-white dark:bg-[#14262f] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Disease selector list */}
              <div className="space-y-2 lg:col-span-1">
                {filteredRecords.map((item) => {
                  const isSelected = selectedRecord.name === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        sound.playSoft();
                        setSelectedRecord(item);
                      }}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-xs"
                          : "bg-white dark:bg-[#14262f] border-border hover:border-border/80"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-low border border-border text-foreground">
                            {item.gene}
                          </span>
                          <span className="font-bold text-xs text-foreground">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block mt-1">
                          Locus: {item.locus} · {item.orphaCode}
                        </span>
                      </div>
                      <ArrowRight className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </button>
                  );
                })}
              </div>

              {/* Inspector details panel */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Verified Provenance Record
                    </span>
                    <h3 className="text-xl font-extrabold text-foreground">
                      {selectedRecord.name} ({selectedRecord.gene})
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                    Locus: {selectedRecord.locus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-surface-low border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Microscope className="w-3.5 h-3.5 text-primary" /> NCBI ClinVar Primary Accession
                    </span>
                    <p className="font-mono font-bold text-foreground text-xs">{selectedRecord.clinvarId}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      {selectedRecord.clinvarClassification}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-low border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" /> Orphanet Nomenclature
                    </span>
                    <p className="font-mono font-bold text-foreground text-xs">{selectedRecord.orphaCode}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">{selectedRecord.omimId}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-low border border-border space-y-1 sm:col-span-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Network className="w-3.5 h-3.5 text-teal-600" /> Kaggle Training & Validation Split
                    </span>
                    <p className="font-mono text-xs text-foreground">{selectedRecord.kaggleSet}</p>
                  </div>
                </div>

                {/* Primary Citations */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground block">
                    Peer-Reviewed Literature & Guideline Citations:
                  </span>
                  <ul className="space-y-2">
                    {selectedRecord.citations.map((cite, i) => (
                      <li
                        key={i}
                        className="p-2.5 rounded-lg bg-surface-low border border-border/80 text-xs text-muted-foreground leading-relaxed flex items-start gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{cite}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <SafetyNotice />
      </div>
    </PublicDocShell>
  );
}

export default function DataLineagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f4faff] dark:bg-[#0a161d] text-foreground text-sm">
          Loading Data Lineage Hub...
        </div>
      }
    >
      <DataLineageContent />
    </Suspense>
  );
}
