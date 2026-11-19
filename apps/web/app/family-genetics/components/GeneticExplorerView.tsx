"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Dna,
  ExternalLink,
  Filter,
  HelpCircle,
  Info,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface GeneItem {
  symbol: string;
  name: string;
  chromosome: string;
  conditions: string[];
  inheritance: string;
  acmgTier: string;
  clinvarEvidence: string;
  description: string;
  curatedLinks: { title: string; url: string }[];
}

const CURATED_GENES: GeneItem[] = [
  {
    symbol: "HBB",
    name: "Hemoglobin Subunit Beta",
    chromosome: "11p15.4",
    conditions: ["Beta Thalassemia", "Sickle Cell Disease", "HbE Disease"],
    inheritance: "Autosomal Recessive",
    acmgTier: "Tier 1 Recommended",
    clinvarEvidence: "High (Pathogenic variants cataloged)",
    description:
      "Encodes the beta-globin chain of adult hemoglobin (HbA). Alterations can cause quantitative reduction (Beta Thalassemia) or structural anomalies (Sickle Cell HbS, HbE).",
    curatedLinks: [
      { title: "MedlinePlus: HBB Gene", url: "https://medlineplus.gov/genetics/gene/hbb/" },
      { title: "GeneReviews: Beta-Hemoglobinopathies", url: "https://www.ncbi.nlm.nih.gov/books/NBK1426/" },
    ],
  },
  {
    symbol: "CFTR",
    name: "CF Transmembrane Conductance Regulator",
    chromosome: "7q31.2",
    conditions: ["Cystic Fibrosis", "Congenital Bilateral Absence of Vas Deferens (CBAVD)"],
    inheritance: "Autosomal Recessive",
    acmgTier: "Tier 1 Recommended",
    clinvarEvidence: "High (ACMG 23+ common panel)",
    description:
      "Functions as an ATP-gated chloride and bicarbonate channel across epithelial cells. DeltaF508 is the most frequent pathogenic mutation in European ancestries.",
    curatedLinks: [
      { title: "MedlinePlus: CFTR Gene", url: "https://medlineplus.gov/genetics/gene/cftr/" },
      { title: "ACMG CFTR Guidelines", url: "https://www.acmg.net" },
    ],
  },
  {
    symbol: "SMN1",
    name: "Survival of Motor Neuron 1",
    chromosome: "5q13.2",
    conditions: ["Spinal Muscular Atrophy (SMA Types 1-4)"],
    inheritance: "Autosomal Recessive",
    acmgTier: "Tier 1 Recommended",
    clinvarEvidence: "High (Exon 7/8 dosage)",
    description:
      "Critical for motor neuron maintenance and RNA splicing. Carrier screening evaluates copy number. SMN2 gene copy number modifies clinical phenotypic severity.",
    curatedLinks: [
      { title: "GeneReviews: Spinal Muscular Atrophy", url: "https://www.ncbi.nlm.nih.gov/books/NBK1352/" },
      { title: "Cure SMA Genetics Overview", url: "https://www.curesma.org" },
    ],
  },
  {
    symbol: "LDLR",
    name: "Low Density Lipoprotein Receptor",
    chromosome: "19p13.2",
    conditions: ["Familial Hypercholesterolemia (FH)"],
    inheritance: "Autosomal Dominant",
    acmgTier: "ACMG Actionable (Secondary Findings v3.2)",
    clinvarEvidence: "High (Loss-of-function)",
    description:
      "Clears circulating LDL particles from plasma. Mutations cause severely elevated LDL cholesterol levels from childhood, leading to early premature coronary artery disease.",
    curatedLinks: [
      { title: "MedlinePlus: LDLR Gene", url: "https://medlineplus.gov/genetics/gene/ldlr/" },
      { title: "Family Heart Foundation FH Guide", url: "https://familyheart.org" },
    ],
  },
  {
    symbol: "BRCA1 & BRCA2",
    name: "BRCA DNA Repair Associated 1 and 2",
    chromosome: "17q21.31 / 13q13.1",
    conditions: ["Hereditary Breast and Ovarian Cancer Syndrome (HBOC)", "Prostate / Pancreatic Cancer"],
    inheritance: "Autosomal Dominant",
    acmgTier: "ACMG Actionable (Secondary Findings v3.2)",
    clinvarEvidence: "High (Homologous recombination repair)",
    description:
      "Tumor suppressor genes involved in double-strand DNA repair via homologous recombination. Pathogenic variants confer marked elevated lifetime risks of breast and ovarian malignancies.",
    curatedLinks: [
      { title: "NCI: BRCA Gene Mutations", url: "https://www.cancer.gov/about-cancer/causes-prevention/genetics/brca-fact-sheet" },
      { title: "GeneReviews: HBOC", url: "https://www.ncbi.nlm.nih.gov/books/NBK1247/" },
    ],
  },
  {
    symbol: "F8 & F9",
    name: "Coagulation Factors VIII and IX",
    chromosome: "Xq28 / Xq27.1",
    conditions: ["Hemophilia A (F8)", "Hemophilia B (F9)"],
    inheritance: "X-Linked Recessive",
    acmgTier: "Tier 2 Recommended",
    clinvarEvidence: "High (Bleeding diathesis)",
    description:
      "Key clotting cascade proteins. Transmitted through carrier females to 50% of sons who present with clinical bleeding diathesis. Intron 22 inversion accounts for 45% of severe Hemophilia A.",
    curatedLinks: [
      { title: "World Federation of Hemophilia", url: "https://wfh.org" },
      { title: "MedlinePlus: Hemophilia", url: "https://medlineplus.gov/genetics/condition/hemophilia/" },
    ],
  },
];

export default function GeneticExplorerView() {
  const [search, setSearch] = useState("");
  const [filterInheritance, setFilterInheritance] = useState("all");

  const filteredGenes = CURATED_GENES.filter((g) => {
    if (filterInheritance !== "all" && !g.inheritance.toLowerCase().includes(filterInheritance.toLowerCase())) {
      return false;
    }
    if (
      search &&
      !g.symbol.toLowerCase().includes(search.toLowerCase()) &&
      !g.name.toLowerCase().includes(search.toLowerCase()) &&
      !g.conditions.some((c) => c.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* High-Visibility Clinical Warning Banner */}
      <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold">
            Clinical Safety Rule: Variants of Uncertain Significance (VUS)
          </p>
          <p className="text-muted-foreground dark:text-rose-300/80 leading-relaxed">
            Variants of Uncertain Significance (VUS) must never be used for independent clinical decision-making. Genetic variant pathogenicity classification follows ACMG/AMP clinical standards and must be interpreted solely by a board-certified clinical geneticist or certified genetic counsellor.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-xl border border-border bg-white dark:bg-[#162732] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by gene symbol (e.g. HBB), name, or condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-[#1c303d] text-foreground outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground">Inheritance:</span>
          <select
            value={filterInheritance}
            onChange={(e) => setFilterInheritance(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-[#1c303d] text-foreground outline-none"
          >
            <option value="all">All Modes</option>
            <option value="recessive">Autosomal Recessive</option>
            <option value="dominant">Autosomal Dominant</option>
            <option value="x-linked">X-Linked</option>
          </select>
        </div>
      </div>

      {/* Gene Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGenes.map((gene, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-teal-600 dark:text-teal-400">
                      {gene.symbol}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                      {gene.inheritance}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground mt-0.5">{gene.name}</h4>
                  <span className="text-[10px] font-mono text-muted-foreground">Locus: {gene.chromosome}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {gene.acmgTier}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{gene.description}</p>

              {/* Conditions linked */}
              <div className="pt-2 border-t border-border/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Associated Conditions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {gene.conditions.map((cond, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-low dark:bg-[#1a2d39] text-foreground border border-border"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Curated references */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-[10px] text-muted-foreground">Evidence: {gene.clinvarEvidence}</span>
              <div className="flex items-center gap-2">
                {gene.curatedLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    <span>{link.title.split(":")[0]}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
