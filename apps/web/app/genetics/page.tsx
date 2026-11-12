"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bookmark,
  CheckCircle2,
  Copy,
  Database,
  Dna,
  Download,
  ExternalLink,
  Eye,
  FlaskConical,
  Info,
  Layers,
  Microscope,
  RotateCw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import ClinicalChartTooltip, { CLINICAL_TOOLTIP_CURSOR } from "@/components/ClinicalChartTooltip";
import SafetyNotice from "@/components/SafetyNotice";
import { sound } from "@/lib/sound";
import {
  Gene,
  VariantEvidence,
  GENES_CATALOG,
  VARIANTS_EVIDENCE,
  getExonDomainDetails,
} from "@/lib/genomics-data";

export default function GeneticsExplorerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedInheritance, setSelectedInheritance] = useState("All");
  const [selectedChr, setSelectedChr] = useState("All");
  const [sortBy, setSortBy] = useState<"variants" | "exons" | "alpha">("variants");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  // Watchlist & Compare state
  const [bookmarkedSymbols, setBookmarkedSymbols] = useState<string[]>(["CFTR", "BRCA1"]);
  const [compareSymbols, setCompareSymbols] = useState<string[]>(["CFTR", "BRCA1", "TP53"]);

  // Dynamic Spotlight Focus state
  const [spotlightSymbol, setSpotlightSymbol] = useState<string>("CFTR");
  const [activeExon, setActiveExon] = useState<number>(10);
  const [structureMode, setStructureMode] = useState<"surface" | "wireframe" | "domain">("surface");
  const [autoRotate3D, setAutoRotate3D] = useState(false);

  // ClinVar Table filters
  const [variantSearch, setVariantSearch] = useState("");
  const [variantSigFilter, setVariantSigFilter] = useState<string>("All");
  const [variantGeneFilter, setVariantGeneFilter] = useState<string>("All");

  // Modals & UI feedback toast
  const [selectedGeneModal, setSelectedGeneModal] = useState<Gene | null>(null);
  const [geneModalTab, setGeneModalTab] = useState<"overview" | "variants" | "pgx">("overview");
  const [inspectedVariantModal, setInspectedVariantModal] = useState<VariantEvidence | null>(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryVariant, setInquiryVariant] = useState<string>("VCV000007105 (CFTR ΔF508)");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [syncLogOpen, setSyncLogOpen] = useState(false);
  const [genomicsToast, setGenomicsToast] = useState<string | null>(null);

  const variantTableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("medipredict_gene_watchlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setBookmarkedSymbols(parsed);
      }
    } catch {
      // safe no-op
    }
  }, []);

  const showToast = (msg: string) => {
    setGenomicsToast(msg);
    setTimeout(() => setGenomicsToast((cur) => (cur === msg ? null : cur)), 3800);
  };

  const toggleBookmark = (symbol: string) => {
    sound.playClick();
    setBookmarkedSymbols((prev) => {
      const next = prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      try {
        localStorage.setItem("medipredict_gene_watchlist", JSON.stringify(next));
      } catch {}
      showToast(
        next.includes(symbol)
          ? `Added ${symbol} to your Genomic Watchlist.`
          : `Removed ${symbol} from your Genomic Watchlist.`
      );
      return next;
    });
  };

  const toggleCompare = (symbol: string) => {
    sound.playClick();
    setCompareSymbols((prev) => {
      if (prev.includes(symbol)) return prev.filter((s) => s !== symbol);
      if (prev.length >= 3) return [...prev.slice(1), symbol];
      return [...prev, symbol];
    });
  };

  const selectSpotlightGene = (gene: Gene) => {
    sound.playClick();
    setSpotlightSymbol(gene.symbol);
    setActiveExon(gene.hotspotExon);
    showToast(`Spotlight focused on ${gene.symbol} (${gene.locus}) — PDB ${gene.pdbId}`);
  };

  const spotlightGene = useMemo(
    () => GENES_CATALOG.find((g) => g.symbol === spotlightSymbol) || GENES_CATALOG[0],
    [spotlightSymbol]
  );

  // Filtered & sorted genes
  const filteredGenes = useMemo(() => {
    const filtered = GENES_CATALOG.filter((gene) => {
      const matchSearch =
        searchTerm === "" ||
        gene.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gene.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gene.locus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gene.associatedConditions.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchClass = selectedClass === "All" || gene.functionalClass === selectedClass;
      const matchInheritance =
        selectedInheritance === "All" || gene.inheritance === selectedInheritance;
      const matchChr = selectedChr === "All" || gene.chromosome === selectedChr;
      const matchBookmark = !onlyBookmarked || bookmarkedSymbols.includes(gene.symbol);

      return matchSearch && matchClass && matchInheritance && matchChr && matchBookmark;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "alpha") return a.symbol.localeCompare(b.symbol);
      if (sortBy === "exons") return b.exons - a.exons;
      return b.clinVarVariants - a.clinVarVariants;
    });
  }, [searchTerm, selectedClass, selectedInheritance, selectedChr, sortBy, onlyBookmarked, bookmarkedSymbols]);

  // Filtered ClinVar Variant table rows
  const filteredVariants = useMemo(() => {
    return VARIANTS_EVIDENCE.filter((v) => {
      if (variantGeneFilter !== "All" && v.gene !== variantGeneFilter) return false;
      if (variantSigFilter !== "All" && !v.significance.includes(variantSigFilter)) return false;
      if (variantSearch.trim()) {
        const q = variantSearch.toLowerCase();
        return (
          v.id.toLowerCase().includes(q) ||
          v.gene.toLowerCase().includes(q) ||
          v.hgvsCoding.toLowerCase().includes(q) ||
          v.hgvsProtein.toLowerCase().includes(q) ||
          v.condition.toLowerCase().includes(q) ||
          (v.commonAlias || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [variantGeneFilter, variantSigFilter, variantSearch]);

  // Dynamic exon buttons for spotlight gene (for genes > 28 exons, render clickable domain segments across exons)
  const exonButtons = useMemo(() => {
    const total = spotlightGene.exons;
    if (total <= 28) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const count = 24;
    const set = new Set<number>();
    set.add(spotlightGene.hotspotExon);
    for (let i = 0; i < count; i++) {
      const mapped = Math.max(1, Math.min(total, Math.round((i / (count - 1)) * (total - 1)) + 1));
      set.add(mapped);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [spotlightGene]);

  const activeExonDetails = useMemo(
    () => getExonDomainDetails(spotlightGene, activeExon),
    [spotlightGene, activeExon]
  );

  const spotlightPathPct = Math.round((spotlightGene.pathogenicCount / spotlightGene.clinVarVariants) * 100);
  const spotlightVusPct = Math.round((spotlightGene.vusCount / spotlightGene.clinVarVariants) * 100);
  const spotlightBenignPct = Math.max(1, 100 - spotlightPathPct - spotlightVusPct);

  const comparisonGenes = useMemo(
    () =>
      compareSymbols
        .map((sym) => GENES_CATALOG.find((g) => g.symbol === sym))
        .filter((g): g is Gene => Boolean(g)),
    [compareSymbols]
  );

  const resetFilters = () => {
    sound.playClick();
    setSearchTerm("");
    setSelectedClass("All");
    setSelectedInheritance("All");
    setSelectedChr("All");
    setOnlyBookmarked(false);
    setSortBy("variants");
  };

  const handleExportTSV = () => {
    sound.playSuccess();
    const headers = [
      "VariantID",
      "Gene",
      "dbSNP",
      "HGVSc",
      "HGVSp",
      "Alias",
      "Significance",
      "gnomAD_AF",
      "CADD_Phred",
      "ReviewPanel",
      "Condition",
      "CuratedDate",
    ];
    const rows = filteredVariants.map((v) =>
      [
        v.id,
        v.gene,
        v.dbSnp,
        v.hgvsCoding,
        v.hgvsProtein,
        v.commonAlias || "",
        v.significance,
        v.gnomadAf,
        v.caddPhred,
        v.reviewPanel,
        `"${v.condition}"`,
        v.curatedDate,
      ].join("\t")
    );
    const tsvContent = [headers.join("\t"), ...rows].join("\n");
    try {
      const blob = new Blob([tsvContent], { type: "text/tab-separated-values" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ClinVar_Curated_Variants_${new Date().toISOString().split("T")[0]}.tsv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
    showToast(`Exported ${filteredVariants.length} curated ClinVar records to TSV.`);
  };

  const handleExportGeneJson = () => {
    sound.playSuccess();
    const payload = {
      exported_at: new Date().toISOString(),
      spotlight: spotlightGene,
      curated_loci: filteredGenes,
      variants: filteredVariants,
    };
    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `genewise-genomics-snapshot.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    showToast("Downloaded full genomic cohort & ClinVar JSON snapshot.");
  };

  const handleOpenInquiry = (variantLabel: string) => {
    sound.playPop();
    setInquiryVariant(variantLabel);
    setInquirySubmitted(false);
    setInquiryModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 md:pb-10 max-w-7xl mx-auto w-full space-y-7">
          {/* Top Metadata / Sync Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-semibold border border-teal-500/20">
                <Dna className="w-3.5 h-3.5" />
                Curated Gene &amp; Variant Composition
              </span>
              <span>&bull;</span>
              <span className="font-mono">GRCh38.p14 Release 110</span>
              <span>&bull;</span>
              <span className="text-muted-foreground">NCBI RefSeq 224 &bull; ClinVar 2024-03 &bull; gnomAD v4.1</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Database Sync: Active
              </span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSyncLogOpen((o) => !o);
                }}
                className="hover:text-foreground inline-flex items-center gap-1 transition-colors underline font-medium"
              >
                <RotateCw className={`w-3 h-3 ${syncLogOpen ? "animate-spin" : ""}`} />
                Re-index Log
              </button>
            </div>
          </div>

          {/* Live Index Synchronization Log Panel (Replaces browser alert) */}
          <AnimatePresence>
            {syncLogOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-2xl border border-teal-500/30 bg-teal-500/5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Genomic Index Pipeline Synchronized (GRCh38.p14)</span>
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground flex flex-wrap gap-3">
                      <span>NCBI RefSeq: 224 (OK)</span>
                      <span>ClinVar VCEP XML: 2,410,214 alleles</span>
                      <span>AlphaFoldDB v4: 12 structural models verified</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSyncLogOpen(false)}
                    className="px-3 py-1 rounded-lg border border-border bg-background hover:bg-muted font-semibold self-start sm:self-center"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast Notification */}
          <AnimatePresence>
            {genomicsToast && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between"
              >
                <span className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {genomicsToast}
                </span>
                <button type="button" onClick={() => setGenomicsToast(null)} className="text-[11px] underline font-semibold">
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page Headline & Quick Actions */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                Genomic Catalog &amp; Architecture
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                Genes &amp; Genetics Explorer
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
                Explore human genes, exon domain architectures, 3D Cryo-EM structural models, and expert-panel ClinVar variant evidence curated from NCBI Gene, ClinGen, and gnomAD.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportGeneJson}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface-lowest hover:bg-muted text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>Export Cohort JSON</span>
              </button>
              <Link
                href="/ml-lab"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00635e] text-white hover:bg-[#00504c] text-xs font-bold shadow-xs"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Score in ML Lab</span>
              </Link>
            </div>
          </div>

          {/* 4 Stat Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Curated Human Loci",
                value: "20,442",
                sub: `${GENES_CATALOG.length} Spotlight & High-Penetrance`,
                icon: CheckCircle2,
                tone: "text-teal-600 dark:text-teal-400",
              },
              {
                label: "ClinVar Variants",
                value: "2.41M",
                sub: "Weekly delta +1,420",
                icon: Sparkles,
                tone: "text-teal-600 dark:text-teal-400",
              },
              {
                label: "Pathogenic Records",
                value: "218,940",
                sub: "ACMG criteria aligned",
                icon: ShieldCheck,
                tone: "text-teal-600 dark:text-teal-400",
              },
              {
                label: "Expert Panel Citations",
                value: "64,210",
                sub: "3 & 4-star gold status",
                icon: Star,
                tone: "text-amber-600 dark:text-amber-400",
              },
            ].map((tile, i) => {
              const Icon = tile.icon;
              return (
                <motion.div
                  key={tile.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                  className="bg-surface-lowest dark:bg-slate-900/60 p-4 rounded-2xl border border-border/80 shadow-2xs space-y-1 smooth-card"
                >
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    {tile.label}
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground">{tile.value}</div>
                  <div className={`text-xs flex items-center gap-1 font-medium ${tile.tone}`}>
                    <Icon className="w-3 h-3 shrink-0" />
                    <span>{tile.sub}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Search, Filter & Watchlist Bar */}
          <div className="bg-surface-lowest dark:bg-slate-900/60 p-4 rounded-2xl border border-border/80 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by gene symbol, locus, or condition (e.g. BRCA1, TP53, LDLR, CFTR)..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filter by Functional Class"
                  value={selectedClass}
                  onChange={(e) => {
                    sound.playClick();
                    setSelectedClass(e.target.value);
                  }}
                  className="text-xs px-3 py-2 bg-background border border-border rounded-xl text-foreground font-medium focus:outline-none"
                >
                  <option value="All">All Functional Classes</option>
                  <option value="Ion Channel">Ion Channels</option>
                  <option value="DNA Repair">DNA Repair</option>
                  <option value="Metabolic Enzyme">Metabolic Enzymes</option>
                  <option value="Structural Protein">Structural Proteins</option>
                  <option value="Tumor Suppressor">Tumor Suppressors</option>
                  <option value="Receptor & Transport">Receptors &amp; Transport</option>
                </select>

                <select
                  aria-label="Filter by Inheritance Pattern"
                  value={selectedInheritance}
                  onChange={(e) => {
                    sound.playClick();
                    setSelectedInheritance(e.target.value);
                  }}
                  className="text-xs px-3 py-2 bg-background border border-border rounded-xl text-foreground font-medium focus:outline-none"
                >
                  <option value="All">All Inheritances</option>
                  <option value="Autosomal Dominant">Autosomal Dominant</option>
                  <option value="Autosomal Recessive">Autosomal Recessive</option>
                  <option value="Multifactorial">Multifactorial</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setOnlyBookmarked((v) => !v);
                  }}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-2 border rounded-xl font-semibold transition-all ${
                    onlyBookmarked
                      ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : "border-border hover:bg-muted text-foreground"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
                  <span>Watchlist ({bookmarkedSymbols.length})</span>
                </button>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs px-3 py-2 border border-border rounded-xl hover:bg-muted font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Chromosome Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-muted-foreground mr-1 uppercase tracking-wider text-[11px] font-semibold">
                  CHROMOSOME:
                </span>
                {["All", "Chr 1", "Chr 3", "Chr 4", "Chr 7", "Chr 11", "Chr 12", "Chr 15", "Chr 17", "Chr 19"].map(
                  (chr) => (
                    <button
                      key={chr}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedChr(chr);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        selectedChr === chr
                          ? "bg-[#00635e] text-white shadow-xs"
                          : "bg-surface-container-low dark:bg-slate-800 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {chr}
                    </button>
                  )
                )}
              </div>
              <span className="text-muted-foreground font-medium">
                Showing {filteredGenes.length} Curated Loci
              </span>
            </div>
          </div>

          {/* Dynamic Spotlight Feature Section */}
          <div className="bg-surface-lowest dark:bg-slate-900/60 rounded-3xl border border-border/80 shadow-md p-6 lg:p-8 space-y-5">
            {/* Quick Spotlight Gene Selector Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                  Quick Spotlight:
                </span>
                {["CFTR", "BRCA1", "TP53", "LDLR", "SCN5A", "FBN1", "PAH"].map((sym) => {
                  const g = GENES_CATALOG.find((x) => x.symbol === sym);
                  if (!g) return null;
                  const active = spotlightGene.symbol === sym;
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => selectSpotlightGene(g)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                        active
                          ? "bg-teal-600 text-white shadow-xs"
                          : "bg-surface-container-low dark:bg-slate-800 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                OMIM #{spotlightGene.omimId} &bull; AlphaFold pLDDT: {spotlightGene.plddtScore}
              </span>
            </div>

            <motion.div
              key={spotlightGene.symbol}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
                {/* Left Column (8 cols): Gene Details & Dynamic Exon Domain Map */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                        Spotlight Focus
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[11px] font-medium border border-teal-500/20">
                        {spotlightGene.functionalClass} Architecture
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        NCBI Gene ID: {spotlightGene.ncbiGeneId}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-3">
                      <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                        {spotlightGene.symbol}{" "}
                        <span className="text-lg font-semibold text-muted-foreground">
                          ({spotlightGene.locus})
                        </span>
                      </h2>
                      <span className="text-xs font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
                        {spotlightGene.genomicCoordinates}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-foreground/90">{spotlightGene.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{spotlightGene.description}</p>
                  </div>

                  {/* Interactive Exon & Domain Map */}
                  <div className="bg-surface-container-lowest dark:bg-slate-950/50 p-5 rounded-2xl border border-border/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-foreground uppercase tracking-wider">
                        Locus Architecture &amp; Exon Domain Map
                      </span>
                      <span className="text-muted-foreground font-mono">
                        {spotlightGene.exons} Exons &bull; {spotlightGene.proteinLengthAA} AA synthetic model
                      </span>
                    </div>

                    <div className="relative pt-2 pb-2 overflow-x-auto">
                      <div className="flex items-center gap-1.5 min-w-[540px] py-2">
                        {exonButtons.map((exonNum) => {
                          const isHotspot = exonNum === spotlightGene.hotspotExon;
                          const isSelected = activeExon === exonNum;
                          return (
                            <button
                              key={exonNum}
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                setActiveExon(exonNum);
                              }}
                              title={`Exon ${exonNum} ${isHotspot ? `(${spotlightGene.hotspotLabel})` : ""}`}
                              className={`relative flex-1 h-8 rounded-md flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                                isSelected
                                  ? "bg-[#00635e] text-white ring-2 ring-teal-400 shadow-md scale-105"
                                  : isHotspot
                                  ? "bg-amber-500 text-slate-950 font-extrabold hover:bg-amber-400"
                                  : "bg-teal-500/20 text-teal-900 dark:text-teal-200 hover:bg-teal-500/30"
                              }`}
                            >
                              {exonNum}
                              {isHotspot && (
                                <span className="absolute -top-2.5 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-teal-50 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-teal-900 dark:text-teal-200">
                          Exon {activeExon} ({activeExonDetails.domain}):
                        </span>{" "}
                        <span className="text-teal-800 dark:text-teal-300">{activeExonDetails.summary}</span>
                      </div>
                      {activeExonDetails.isHotspot && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950 shrink-0">
                          {spotlightGene.hotspotLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary Associated Conditions & Pharmacogenomics Actionability */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Primary Associated Conditions &amp; Therapeutic Relevance:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {spotlightGene.associatedConditions.map((cond, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-surface-container-low dark:bg-slate-800/60 border border-border/60 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                          <span className="font-semibold text-foreground">{cond}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-muted-foreground flex items-start gap-2">
                      <Microscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-foreground">Pharmacogenomic Actionability: </strong>
                        {spotlightGene.pharmacogenomicsNote}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <div>
                        <span className="font-bold text-foreground text-sm">
                          {spotlightGene.clinVarVariants.toLocaleString()}
                        </span>{" "}
                        recorded variants
                      </div>
                      <div>
                        Functional Class: <span className="font-bold text-foreground">{spotlightGene.functionalClass}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setGeneModalTab("overview");
                        setSelectedGeneModal(spotlightGene);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00635e] text-white hover:bg-[#00504c] text-xs font-bold shadow-sm transition-all"
                    >
                      View Gene Details &amp; Variants
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Column (4 cols): 3D Protein Preview + Pathogenicity */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-950 p-4 shadow-sm group">
                    <div className="relative h-48 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                      <img
                        src="/images/dna-protein.jpg"
                        alt={`${spotlightGene.symbol} 3D Protein Structure`}
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          autoRotate3D ? "scale-110 rotate-6" : ""
                        } ${
                          structureMode === "wireframe"
                            ? "filter invert contrast-200 hue-rotate-90 opacity-80"
                            : structureMode === "domain"
                            ? "filter saturate-200 hue-rotate-180 contrast-125"
                            : "opacity-90"
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                      <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs px-2 py-1 rounded-md text-[10px] font-mono text-teal-300 border border-teal-500/30">
                        PDB: {spotlightGene.pdbId}
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setStructureMode((m) =>
                              m === "surface" ? "wireframe" : m === "wireframe" ? "domain" : "surface"
                            );
                          }}
                          className="bg-slate-900/85 backdrop-blur-xs px-2 py-1 rounded-md text-[10px] font-semibold text-slate-200 hover:text-white border border-slate-700 transition-colors capitalize"
                        >
                          {structureMode}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setAutoRotate3D((v) => !v);
                          }}
                          title="Toggle 3D rotation simulation"
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors ${
                            autoRotate3D
                              ? "bg-teal-600 text-white border-teal-500"
                              : "bg-slate-900/85 text-slate-200 border-slate-700"
                          }`}
                        >
                          Spin
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                          3D PROTEIN STRUCTURE &bull; pLDDT {spotlightGene.plddtScore}
                        </span>
                        <span className="text-xs font-semibold">{spotlightGene.cryoResolution}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Pathogenicity Overview Card */}
                  <div className="bg-surface-lowest dark:bg-slate-900/90 p-5 rounded-2xl border border-border/80 shadow-2xs space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                        VARIANT SPECTRUM DISTRIBUTION
                      </span>
                      <h4 className="text-sm font-bold text-foreground">
                        {spotlightGene.symbol} Pathogenicity Overview
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Distribution of ClinVar germline &amp; somatic alleles mapped across {spotlightGene.exons} coding exons.
                      </p>
                    </div>

                    <div className="space-y-2 pt-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          Pathogenic / Likely Pathogenic
                        </span>
                        <span className="font-bold font-mono">
                          {spotlightGene.pathogenicCount.toLocaleString()} ({spotlightPathPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${spotlightPathPct}%` }} />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Variants of Uncertain Sig (VUS)
                        </span>
                        <span className="font-bold font-mono">
                          {spotlightGene.vusCount.toLocaleString()} ({spotlightVusPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${spotlightVusPct}%` }} />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          Benign / Likely Benign
                        </span>
                        <span className="font-bold font-mono">
                          {spotlightGene.benignCount.toLocaleString()} ({spotlightBenignPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${spotlightBenignPct}%` }} />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Evidence Source: ClinVar API</span>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setVariantGeneFilter(spotlightGene.symbol);
                          variantTableRef.current?.scrollIntoView({ behavior: "smooth" });
                          showToast(`Filtered ClinVar table below to ${spotlightGene.symbol} alleles.`);
                        }}
                        className="text-teal-700 dark:text-teal-400 hover:underline font-semibold"
                      >
                        Inspect Raw Records &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
          </div>

          {/* Side-by-Side Gene Comparison Matrix + Recharts Chart */}
          {comparisonGenes.length >= 2 && (
            <div className="bg-surface-lowest dark:bg-slate-900/60 rounded-3xl border border-teal-500/30 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Scale className="w-4 h-4 text-teal-600" />
                    <span>Multi-Locus Comparison Matrix ({comparisonGenes.map((g) => g.symbol).join(" vs ")})</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Side-by-side comparison of variant burden, coding exons, protein scale, and pathogenicity ratios
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Toggle &ldquo;Compare&rdquo; on any card below (max 3)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div className="lg:col-span-5 h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonGenes.map((g) => ({
                        gene: g.symbol,
                        Pathogenic: g.pathogenicCount,
                        VUS: g.vusCount,
                        Benign: g.benignCount,
                      }))}
                      margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                      <XAxis dataKey="gene" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip cursor={CLINICAL_TOOLTIP_CURSOR} content={<ClinicalChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                      <Bar dataKey="Pathogenic" stackId="a" fill="#f43f5e" />
                      <Bar dataKey="VUS" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="Benign" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="lg:col-span-7 overflow-x-auto border border-border rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container-low dark:bg-slate-800/70 border-b border-border">
                      <tr>
                        <th className="p-2.5 text-muted-foreground">Genomic Metric</th>
                        {comparisonGenes.map((g) => (
                          <th key={g.symbol} className="p-2.5 font-extrabold text-foreground">
                            {g.symbol} ({g.locus})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      <tr>
                        <td className="p-2.5 text-muted-foreground font-medium">Exons / Protein</td>
                        {comparisonGenes.map((g) => (
                          <td key={g.symbol} className="p-2.5 font-mono">
                            {g.exons} ex / {g.proteinLengthAA} AA
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-2.5 text-muted-foreground font-medium">ClinVar Variants</td>
                        {comparisonGenes.map((g) => (
                          <td key={g.symbol} className="p-2.5 font-mono font-bold">
                            {g.clinVarVariants.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-2.5 text-muted-foreground font-medium">Pathogenic Share</td>
                        {comparisonGenes.map((g) => (
                          <td key={g.symbol} className="p-2.5 font-mono text-rose-600 dark:text-rose-400 font-bold">
                            {Math.round((g.pathogenicCount / g.clinVarVariants) * 100)}%
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-2.5 text-muted-foreground font-medium">Inheritance</td>
                        {comparisonGenes.map((g) => (
                          <td key={g.symbol} className="p-2.5 text-[11px]">
                            {g.inheritance}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Curated Gene Cohort Grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-foreground">Curated Gene Cohort</h3>
                <p className="text-xs text-muted-foreground">
                  Validated clinical high-penetrance and high-utility loci under review ({filteredGenes.length} displayed).
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Sort by:</span>
                <select
                  aria-label="Sort curated genes"
                  value={sortBy}
                  onChange={(e) => {
                    sound.playClick();
                    setSortBy(e.target.value as any);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-surface-lowest font-semibold text-foreground text-xs"
                >
                  <option value="variants">Variants (High to Low)</option>
                  <option value="exons">Exon Count (High to Low)</option>
                  <option value="alpha">Alphabetical (A - Z)</option>
                </select>
              </div>
            </div>

            {filteredGenes.length === 0 ? (
              <div className="p-10 rounded-2xl border border-dashed border-border text-center space-y-2">
                <p className="text-sm font-semibold text-foreground">No loci match your active filter criteria</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-1.5 rounded-lg bg-[#00635e] text-white text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGenes.map((gene, idx) => {
                  const isBookmarked = bookmarkedSymbols.includes(gene.symbol);
                  const isCompared = compareSymbols.includes(gene.symbol);
                  const isSpotlit = spotlightSymbol === gene.symbol;
                  return (
                    <motion.div
                      key={gene.symbol}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.25), duration: 0.2 }}
                      className={`bg-surface-lowest dark:bg-slate-900/60 rounded-2xl border shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group ${
                        isSpotlit ? "border-teal-500/60 ring-1 ring-teal-500/20" : "border-border/80"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xl font-extrabold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                                {gene.symbol}
                              </h4>
                              <span className="text-xs font-mono bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded">
                                {gene.locus}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground line-clamp-1">{gene.name}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              aria-label={`Bookmark ${gene.symbol}`}
                              onClick={() => toggleBookmark(gene.symbol)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                            >
                              <Bookmark
                                className={`w-3.5 h-3.5 ${
                                  isBookmarked ? "fill-amber-500 text-amber-500" : ""
                                }`}
                              />
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-low dark:bg-slate-800 text-muted-foreground">
                              {gene.functionalClass}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-surface-container-low/60 dark:bg-slate-800/40 text-center text-xs">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Chromosome</span>
                            <span className="font-bold text-foreground">{gene.chromosome}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Exons</span>
                            <span className="font-bold text-foreground">{gene.exons}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block">ClinVar</span>
                            <span className="font-bold text-foreground font-mono">{gene.clinVarVariants}</span>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {gene.description}
                        </p>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            PRIMARY ASSOCIATED CONDITIONS:
                          </span>
                          <ul className="text-xs space-y-0.5 text-foreground/90">
                            {gene.associatedConditions.map((cond, i) => (
                              <li key={i} className="flex items-center gap-1.5 line-clamp-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                                {cond}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => selectSpotlightGene(gene)}
                            className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                              isSpotlit
                                ? "border-teal-600 bg-teal-600 text-white"
                                : "border-border bg-background hover:bg-muted text-foreground"
                            }`}
                          >
                            {isSpotlit ? "Spotlit" : "Spotlight"}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleCompare(gene.symbol)}
                            className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                              isCompared
                                ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300"
                                : "border-border bg-background hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            {isCompared ? "Comparing" : "Compare"}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            sound.playPop();
                            setGeneModalTab("overview");
                            setSelectedGeneModal(gene);
                          }}
                          className="text-teal-700 dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
                        >
                          View Gene Details &amp; Variants &rarr;
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ClinVar Curated Variant Evidence Table */}
          <div
            ref={variantTableRef}
            className="bg-surface-lowest dark:bg-slate-900/60 rounded-3xl border border-border/80 shadow-2xs p-6 space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">ClinVar Curated Variant Evidence</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    {filteredVariants.length} / {VARIANTS_EVIDENCE.length} Alleles
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click any allele row to open gnomAD ancestry frequencies, CADD/AlphaMissense pathogenicity scores, and ACMG criteria breakdown.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportTSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export TSV
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenInquiry("General Variant Query")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00635e] text-white text-xs font-semibold hover:bg-[#00504c] shadow-2xs transition-colors"
                >
                  Submit Variant Inquiry
                </button>
              </div>
            </div>

            {/* Variant Filters Toolbar */}
            <div className="flex flex-col md:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={variantSearch}
                  onChange={(e) => setVariantSearch(e.target.value)}
                  placeholder="Filter ClinVar by VCV ID, HGVS c./p., gene, or condition..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  aria-label="Filter variants by gene"
                  value={variantGeneFilter}
                  onChange={(e) => setVariantGeneFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-border bg-background font-semibold"
                >
                  <option value="All">All Genes</option>
                  {Array.from(new Set(VARIANTS_EVIDENCE.map((v) => v.gene))).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filter variants by significance"
                  value={variantSigFilter}
                  onChange={(e) => setVariantSigFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-border bg-background font-semibold"
                >
                  <option value="All">All Significances</option>
                  <option value="Pathogenic">Pathogenic</option>
                  <option value="Likely Pathogenic">Likely Pathogenic</option>
                  <option value="VUS">VUS (Uncertain)</option>
                  <option value="Benign">Benign / Polymorphism</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-border rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low dark:bg-slate-800/80 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">VARIANT ID / GENE</th>
                    <th className="p-3.5">HGVS NOTATION (CODING &amp; PROTEIN)</th>
                    <th className="p-3.5">CLINICAL SIGNIFICANCE</th>
                    <th className="p-3.5">gnomAD AF / CADD</th>
                    <th className="p-3.5">REVIEW STATUS &amp; PANEL</th>
                    <th className="p-3.5">CONDITION</th>
                    <th className="p-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredVariants.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-muted/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        sound.playClick();
                        setInspectedVariantModal(v);
                      }}
                    >
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400">
                          {v.id}
                        </div>
                        <span className="text-[11px] text-teal-700 dark:text-teal-300 font-sans font-semibold">
                          {v.gene} &bull; {v.dbSnp}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono space-y-0.5">
                        <div className="text-foreground">{v.hgvsCoding}</div>
                        <div className="text-muted-foreground">
                          {v.hgvsProtein}{" "}
                          {v.commonAlias && <span className="font-bold text-teal-600">({v.commonAlias})</span>}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            v.significance === "Pathogenic"
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                              : v.significance === "Likely Pathogenic"
                              ? "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20"
                              : v.significance === "VUS (Uncertain)"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              v.significance === "Pathogenic"
                                ? "bg-rose-500"
                                : v.significance === "Likely Pathogenic"
                                ? "bg-orange-500"
                                : v.significance === "VUS (Uncertain)"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          {v.significance}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-[11px]">
                        <div className="text-foreground font-semibold">{v.gnomadAf}</div>
                        <div className="text-muted-foreground">CADD {v.caddPhred} &bull; AM {v.alphaMissense}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-0.5 text-amber-500 mb-0.5">
                          {Array.from({ length: 4 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3 h-3 ${
                                idx < v.stars ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-muted-foreground block">{v.reviewPanel}</span>
                      </td>

                      <td className="p-3.5 font-medium text-foreground">{v.condition}</td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playClick();
                            setInspectedVariantModal(v);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-semibold"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 flex items-start gap-3 text-xs text-muted-foreground">
              <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Clinical Interpretive Guardrail:</strong> Gene variant presence does not dictate clinical outcomes; expressivity and penetrance vary. Variants should always be evaluated alongside clinical diagnostic workups, family pedigree segregation, and accredited clinical genetics consultation.
              </div>
            </div>
          </div>

          <SafetyNotice />
        </main>
      </div>

      {/* Multi-Tab Gene Details Modal */}
      {selectedGeneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-background rounded-3xl border border-border shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-teal-600 dark:text-teal-400 uppercase font-semibold">
                  NCBI GENE {selectedGeneModal.ncbiGeneId} &bull; HGNC {selectedGeneModal.hgncId} &bull; OMIM{" "}
                  {selectedGeneModal.omimId}
                </span>
                <h3 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                  {selectedGeneModal.symbol}
                  <span className="text-sm font-normal text-muted-foreground">({selectedGeneModal.locus})</span>
                </h3>
                <p className="text-sm text-foreground/90 font-medium">{selectedGeneModal.name}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setSelectedGeneModal(null);
                }}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex items-center gap-1.5 border-b border-border pb-2 text-xs">
              {[
                { key: "overview", label: "Overview & Domains" },
                {
                  key: "variants",
                  label: `ClinVar Variants (${
                    VARIANTS_EVIDENCE.filter((v) => v.gene === selectedGeneModal.symbol).length
                  })`,
                },
                { key: "pgx", label: "Pharmacogenomics & ML" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setGeneModalTab(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    geneModalTab === tab.key
                      ? "bg-[#00635e] text-white"
                      : "bg-surface-container-low dark:bg-slate-800 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {geneModalTab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-surface-container-low dark:bg-slate-800 text-center text-xs">
                  <div>
                    <span className="text-muted-foreground block">Chromosome</span>
                    <span className="font-bold text-foreground text-sm">{selectedGeneModal.chromosome}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Exons / Protein</span>
                    <span className="font-bold text-foreground text-sm">
                      {selectedGeneModal.exons} ex ({selectedGeneModal.proteinLengthAA} AA)
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">ClinVar Count</span>
                    <span className="font-bold text-foreground text-sm font-mono">
                      {selectedGeneModal.clinVarVariants}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-bold uppercase tracking-wider text-muted-foreground">
                    Biological Function &amp; Pathophysiology:
                  </span>
                  <p className="text-foreground/90 leading-relaxed bg-surface-lowest dark:bg-slate-900 p-3.5 rounded-xl border border-border">
                    {selectedGeneModal.description}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-bold uppercase tracking-wider text-muted-foreground">
                    Protein Domain Spans:
                  </span>
                  <div className="space-y-1.5">
                    {selectedGeneModal.exonDomains.map((dom, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-surface-container-low dark:bg-slate-800 border border-border text-xs"
                      >
                        <div className="font-bold text-foreground">
                          Exons {dom.startExon}-{dom.endExon}: {dom.domain}
                        </div>
                        <div className="text-muted-foreground mt-0.5">{dom.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {geneModalTab === "variants" && (
              <div className="space-y-2.5 text-xs">
                {VARIANTS_EVIDENCE.filter((v) => v.gene === selectedGeneModal.symbol).length === 0 ? (
                  <p className="text-muted-foreground p-4 rounded-xl border border-dashed border-border text-center">
                    All curated summary counts loaded ({selectedGeneModal.clinVarVariants.toLocaleString()} total in ClinVar). Query live ClinVar API for full pagination.
                  </p>
                ) : (
                  VARIANTS_EVIDENCE.filter((v) => v.gene === selectedGeneModal.symbol).map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-xl border border-border bg-surface-container-low dark:bg-slate-800/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-foreground">
                          {v.id} &bull; {v.hgvsCoding} ({v.hgvsProtein})
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          {v.significance}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {v.condition} &bull; gnomAD AF: <span className="font-mono">{v.gnomadAf}</span> &bull; CADD{" "}
                        <span className="font-mono">{v.caddPhred}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {v.acmgCriteria.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {geneModalTab === "pgx" && (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300">
                    Pharmacogenomics &amp; Precision Therapy Actionability
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{selectedGeneModal.pharmacogenomicsNote}</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-800 border border-border flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-foreground">Evaluate in Polygenic Variant Pathogenicity ML Model</div>
                    <div className="text-muted-foreground">
                      Score germline risk interactions and SHAP attribution weights in the ML Research Lab.
                    </div>
                  </div>
                  <Link
                    href="/ml-lab"
                    className="px-3.5 py-2 rounded-xl bg-[#00635e] text-white font-bold shrink-0 hover:bg-[#00504c]"
                  >
                    Open ML Lab
                  </Link>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  selectSpotlightGene(selectedGeneModal);
                  setSelectedGeneModal(null);
                }}
                className="px-3.5 py-2 rounded-xl border border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold"
              >
                Set as Page Spotlight
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  window.open(`https://www.ncbi.nlm.nih.gov/clinvar/?term=${selectedGeneModal.symbol}`, "_blank");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in ClinVar
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setSelectedGeneModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#00635e] text-white text-xs font-bold hover:bg-[#00504c]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ClinVar Variant Inspector Modal (gnomAD Population Frequency Chart + ACMG Criteria) */}
      {inspectedVariantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-background rounded-3xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
              <div>
                <div className="font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400">
                  {inspectedVariantModal.id} &bull; {inspectedVariantModal.dbSnp}
                </div>
                <h3 className="text-lg font-extrabold text-foreground">
                  {inspectedVariantModal.gene} {inspectedVariantModal.hgvsCoding}
                </h3>
                <p className="text-muted-foreground font-mono">
                  {inspectedVariantModal.hgvsProtein}{" "}
                  {inspectedVariantModal.commonAlias ? `(${inspectedVariantModal.commonAlias})` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedVariantModal(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-surface-container-low dark:bg-slate-800 border border-border">
                <div className="text-[10px] text-muted-foreground">CADD Phred</div>
                <div className="text-base font-bold font-mono text-foreground">{inspectedVariantModal.caddPhred}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low dark:bg-slate-800 border border-border">
                <div className="text-[10px] text-muted-foreground">AlphaMissense</div>
                <div className="text-base font-bold font-mono text-rose-500">
                  {inspectedVariantModal.alphaMissense}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low dark:bg-slate-800 border border-border">
                <div className="text-[10px] text-muted-foreground">gnomAD Global AF</div>
                <div className="text-xs font-bold font-mono text-foreground mt-1">{inspectedVariantModal.gnomadAf}</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-foreground">ACMG / AMP Classification Evidence Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {inspectedVariantModal.acmgCriteria.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-mono font-bold text-[11px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-border bg-surface-lowest dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
                  <span>gnomAD Population Ancestry Allele Frequency (%)</span>
                </span>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inspectedVariantModal.ancestryFreq} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="population" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip cursor={CLINICAL_TOOLTIP_CURSOR} content={<ClinicalChartTooltip />} />
                    <Bar dataKey="freqPct" name="Carrier Allele Freq %" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard
                      .writeText(
                        `${inspectedVariantModal.id} | ${inspectedVariantModal.gene} ${inspectedVariantModal.hgvsCoding} ${inspectedVariantModal.hgvsProtein}`
                      )
                      .catch(() => {});
                  }
                  showToast(`Copied HGVS identifier for ${inspectedVariantModal.id}.`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy HGVS</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const targetLabel = `${inspectedVariantModal.id} (${inspectedVariantModal.gene} ${
                      inspectedVariantModal.commonAlias || inspectedVariantModal.hgvsProtein
                    })`;
                    setInspectedVariantModal(null);
                    handleOpenInquiry(targetLabel);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#00635e] text-white font-bold hover:bg-[#00504c]"
                >
                  Open Curation Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Variant Inquiry Modal */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-background rounded-3xl border border-border shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  CLINICAL CURATION DESK
                </span>
                <h3 className="text-xl font-extrabold text-foreground">Submit Variant Inquiry</h3>
              </div>
              <button
                type="button"
                onClick={() => setInquiryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inquirySubmitted ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-foreground">Inquiry Queued for Curation Review</h4>
                <p className="text-xs text-muted-foreground">
                  Your question regarding <strong className="text-foreground">{inquiryVariant}</strong> has been logged to the clinician curation panel.
                </p>
                <button
                  type="button"
                  onClick={() => setInquiryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Target Variant / Locus</label>
                  <input
                    type="text"
                    value={inquiryVariant}
                    onChange={(e) => setInquiryVariant(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low dark:bg-slate-800 border border-border rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Inquiry Type</label>
                  <select className="w-full px-3 py-2 bg-surface-container-low dark:bg-slate-800 border border-border rounded-xl">
                    <option>Re-evaluation of VUS Classification</option>
                    <option>Conflicting Submissions Clarification</option>
                    <option>Population Allele Frequency Query (gnomAD)</option>
                    <option>ACMG PP3 / BS2 Computational Evidence Request</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Clinician / Researcher Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter case observations, pedigree segregation findings, or references..."
                    className="w-full px-3 py-2 bg-surface-container-low dark:bg-slate-800 border border-border rounded-xl resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInquiryModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border hover:bg-muted font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSuccess();
                      setInquirySubmitted(true);
                    }}
                    className="px-5 py-2 rounded-xl bg-[#00635e] text-white font-bold hover:bg-[#00504c] shadow-xs"
                  >
                    Submit Inquiry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
