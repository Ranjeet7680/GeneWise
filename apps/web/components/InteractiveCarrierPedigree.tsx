"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Dna,
  Info,
  Layers,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { sound } from "@/lib/sound";

export type InheritanceMode =
  | "autosomal_recessive"
  | "autosomal_dominant"
  | "x_linked_recessive"
  | "x_linked_dominant";

export interface PunnettCell {
  genotype: string;
  phenotype: string;
  percent: number;
  highlightClass: string;
}

export default function InteractiveCarrierPedigree() {
  const [inheritanceMode, setInheritanceMode] = useState<InheritanceMode>("autosomal_recessive");
  const [maternalAllele, setMaternalAllele] = useState<string>("Aa");
  const [paternalAllele, setPaternalAllele] = useState<string>("Aa");

  const handleModeChange = (mode: InheritanceMode) => {
    sound.playSoft();
    setInheritanceMode(mode);
    if (mode === "autosomal_recessive") {
      setMaternalAllele("Aa");
      setPaternalAllele("Aa");
    } else if (mode === "autosomal_dominant") {
      setMaternalAllele("Aa");
      setPaternalAllele("aa");
    } else if (mode === "x_linked_recessive") {
      setMaternalAllele("XAXa");
      setPaternalAllele("XAY");
    } else if (mode === "x_linked_dominant") {
      setMaternalAllele("XAXa");
      setPaternalAllele("XaY");
    }
  };

  const calculateSquare = () => {
    if (inheritanceMode === "autosomal_recessive") {
      // Parents: Aa x Aa
      const mat = maternalAllele.split("");
      const pat = paternalAllele.split("");
      const m1 = mat[0] || "A";
      const m2 = mat[1] || "a";
      const p1 = pat[0] || "A";
      const p2 = pat[1] || "a";

      const c11 = `${p1}${m1}`; // e.g. AA
      const c12 = `${p1}${m2}`; // e.g. Aa
      const c21 = `${p2}${m1}`; // e.g. aA -> Aa
      const c22 = `${p2}${m2}`; // e.g. aa

      return {
        rowHeaders: [p1, p2],
        colHeaders: [m1, m2],
        cells: [
          {
            genotype: c11,
            label: "25% Unaff.",
            isAffected: c11 === "aa",
            isCarrier: c11 === "Aa" || c11 === "aA",
          },
          {
            genotype: c12,
            label: c12 === "aa" ? "25% Affect." : "Carrier",
            isAffected: c12 === "aa",
            isCarrier: c12 === "Aa" || c12 === "aA",
          },
          {
            genotype: c21,
            label: c21 === "aa" ? "25% Affect." : "Carrier",
            isAffected: c21 === "aa",
            isCarrier: c21 === "Aa" || c21 === "aA",
          },
          {
            genotype: c22,
            label: c22 === "aa" ? "25% Affect." : "Carrier",
            isAffected: c22 === "aa",
            isCarrier: c22 === "Aa" || c22 === "aA",
          },
        ],
        explanation:
          "Only homozygous recessive (aa) manifests disease. Heterozygous carriers (Aa) remain clinically unaffected in classic recessive inheritance.",
      };
    } else if (inheritanceMode === "autosomal_dominant") {
      return {
        rowHeaders: ["A", "a"],
        colHeaders: ["a", "a"],
        cells: [
          { genotype: "Aa", label: "50% Affect.", isAffected: true, isCarrier: false },
          { genotype: "Aa", label: "50% Affect.", isAffected: true, isCarrier: false },
          { genotype: "aa", label: "50% Unaff.", isAffected: false, isCarrier: false },
          { genotype: "aa", label: "50% Unaff.", isAffected: false, isCarrier: false },
        ],
        explanation:
          "In autosomal dominant inheritance, carrying a single pathogenic allele (A) causes phenotypic disease expression. Each pregnancy has an independent 50% probability of inheritance.",
      };
    } else if (inheritanceMode === "x_linked_recessive") {
      return {
        rowHeaders: ["XA", "Y"],
        colHeaders: ["XA", "Xa"],
        cells: [
          { genotype: "XAXA", label: "Female Unaff.", isAffected: false, isCarrier: false },
          { genotype: "XAXa", label: "Female Carrier", isAffected: false, isCarrier: true },
          { genotype: "XAY", label: "Male Unaff.", isAffected: false, isCarrier: false },
          { genotype: "XaY", label: "Male Affected", isAffected: true, isCarrier: false },
        ],
        explanation:
          "Males inheriting mutant allele (XaY) manifest disease due to hemizygosity. Female carriers (XAXa) generally remain unaffected or mildly manifesting depending on lyonization.",
      };
    } else {
      return {
        rowHeaders: ["Xa", "Y"],
        colHeaders: ["XA", "Xa"],
        cells: [
          { genotype: "XAXa", label: "Female Affect.", isAffected: true, isCarrier: false },
          { genotype: "XaXa", label: "Female Unaff.", isAffected: false, isCarrier: false },
          { genotype: "XAY", label: "Male Affect.", isAffected: true, isCarrier: false },
          { genotype: "XaY", label: "Male Unaff.", isAffected: false, isCarrier: false },
        ],
        explanation:
          "In X-linked dominant inheritance, both males (XAY) and females (XAXa) manifest disease when carrying the pathogenic allele.",
      };
    }
  };

  const sim = calculateSquare();

  return (
    <div className="bg-surface-lowest dark:bg-slate-900/60 rounded-3xl border border-border/80 shadow-2xs p-6 sm:p-8 space-y-5 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
              CARRIER PEDIGREE MODEL
            </span>
            <span className="text-[11px] text-muted-foreground">
              Interactive Punnett Square &amp; Transmission Simulator
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={inheritanceMode}
              onChange={(e) => handleModeChange(e.target.value as InheritanceMode)}
              className="text-xs bg-surface-low border border-border rounded-xl px-2.5 py-1 text-foreground font-medium outline-hidden focus:ring-1 focus:ring-teal-500"
            >
              <option value="autosomal_recessive">Autosomal Recessive (Aa × Aa)</option>
              <option value="autosomal_dominant">Autosomal Dominant (Aa × aa)</option>
              <option value="x_linked_recessive">X-Linked Recessive (Carrier Mother)</option>
              <option value="x_linked_dominant">X-Linked Dominant</option>
            </select>
          </div>
        </div>

        {/* Transmission Description */}
        <p className="text-xs text-muted-foreground">
          Mode: <strong className="text-foreground capitalize">{inheritanceMode.replace(/_/g, " ")}</strong> transmission breakdown:
        </p>

        {/* Punnett Square Diagram */}
        <div className="bg-surface-container-low/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-border/80">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
            {/* Row 1 Header */}
            <div className="p-2" />
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300">
              {sim.colHeaders[0]}
            </div>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300">
              {sim.colHeaders[1]}
            </div>

            {/* Row 2 */}
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300 flex items-center justify-center">
              {sim.rowHeaders[0]}
            </div>
            {/* Cell 1,1 */}
            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-0.5 ${
                sim.cells[0].isAffected
                  ? "bg-teal-600 text-white shadow-sm border-teal-600"
                  : sim.cells[0].isCarrier
                  ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500/20"
                  : "bg-surface-lowest dark:bg-slate-900 border-border"
              }`}
            >
              <span className={`text-sm font-extrabold ${sim.cells[0].isAffected ? "text-white" : "text-foreground"}`}>
                {sim.cells[0].genotype}
              </span>
              <span
                className={`text-[10px] font-sans ${
                  sim.cells[0].isAffected
                    ? "text-teal-100"
                    : sim.cells[0].isCarrier
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-muted-foreground"
                }`}
              >
                {sim.cells[0].label}
              </span>
            </div>

            {/* Cell 1,2 */}
            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-0.5 ${
                sim.cells[1].isAffected
                  ? "bg-teal-600 text-white shadow-sm border-teal-600"
                  : sim.cells[1].isCarrier
                  ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500/20"
                  : "bg-surface-lowest dark:bg-slate-900 border-border"
              }`}
            >
              <span className={`text-sm font-extrabold ${sim.cells[1].isAffected ? "text-white" : "text-foreground"}`}>
                {sim.cells[1].genotype}
              </span>
              <span
                className={`text-[10px] font-sans ${
                  sim.cells[1].isAffected
                    ? "text-teal-100"
                    : sim.cells[1].isCarrier
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-muted-foreground"
                }`}
              >
                {sim.cells[1].label}
              </span>
            </div>

            {/* Row 3 */}
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300 flex items-center justify-center">
              {sim.rowHeaders[1]}
            </div>
            {/* Cell 2,1 */}
            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-0.5 ${
                sim.cells[2].isAffected
                  ? "bg-teal-600 text-white shadow-sm border-teal-600"
                  : sim.cells[2].isCarrier
                  ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500/20"
                  : "bg-surface-lowest dark:bg-slate-900 border-border"
              }`}
            >
              <span className={`text-sm font-extrabold ${sim.cells[2].isAffected ? "text-white" : "text-foreground"}`}>
                {sim.cells[2].genotype}
              </span>
              <span
                className={`text-[10px] font-sans ${
                  sim.cells[2].isAffected
                    ? "text-teal-100"
                    : sim.cells[2].isCarrier
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-muted-foreground"
                }`}
              >
                {sim.cells[2].label}
              </span>
            </div>

            {/* Cell 2,2 */}
            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-0.5 ${
                sim.cells[3].isAffected
                  ? "bg-teal-600 text-white shadow-sm border-teal-600"
                  : sim.cells[3].isCarrier
                  ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500/20"
                  : "bg-surface-lowest dark:bg-slate-900 border-border"
              }`}
            >
              <span className={`text-sm font-extrabold ${sim.cells[3].isAffected ? "text-white" : "text-foreground"}`}>
                {sim.cells[3].genotype}
              </span>
              <span
                className={`text-[10px] font-sans ${
                  sim.cells[3].isAffected
                    ? "text-teal-100"
                    : sim.cells[3].isCarrier
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-muted-foreground"
                }`}
              >
                {sim.cells[3].label}
              </span>
            </div>
          </div>
        </div>

        {/* Scientific Explanation Note */}
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          {sim.explanation}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-surface-low border border-border/80 text-[10px] text-muted-foreground font-mono">
        Scientific Guideline: Mendelian probabilities apply independently to each conception (e.g., 25% risk per pregnancy does not mean 1 in 4 children will be affected).
      </div>
    </div>
  );
}
