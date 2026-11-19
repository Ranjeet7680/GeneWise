"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Dna,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Compass,
  Check,
  Sliders,
  Calculator,
  Eye,
  FileCheck,
  GitBranch,
  Activity,
  AlertTriangle,
  Info,
  Lock,
  Search,
  Users,
  Award,
} from "lucide-react";
import { api } from "@/lib/api";
import { VirtualLab } from "@/types/academy";
import { sound } from "@/lib/sound";

export default function VirtualLabsPage() {
  const [labs, setLabs] = useState<VirtualLab[]>([]);
  const [activeLabId, setActiveLabId] = useState<string>("lab-01-dna-base-pairing");
  const [loading, setLoading] = useState<boolean>(true);
  const [completedLabs, setCompletedLabs] = useState<Set<string>>(new Set(["lab-01-dna-base-pairing"]));

  // Simulation state for Lab 01: DNA Base Pairing
  const [userBases, setUserBases] = useState<string[]>(["T", "A", "C", "G", "G", "C", "T", "A"]);
  const templateStrand = "ATGCCGAT";
  const complementaryMap: Record<string, string> = { A: "T", T: "A", G: "C", C: "G" };

  // Simulation state for Lab 02: Punnett Square
  const [parent1, setParent1] = useState<string>("Aa");
  const [parent2, setParent2] = useState<string>("Aa");
  const [simulatedTrials, setSimulatedTrials] = useState<number>(0);
  const [offspringCounts, setOffspringCounts] = useState<{ AA: number; Aa: number; aa: number }>({
    AA: 0,
    Aa: 0,
    aa: 0,
  });

  // Simulation state for Lab 03: Clinical Pedigree
  const [pedigreeModel, setPedigreeModel] = useState<"autosomal_dominant" | "autosomal_recessive" | "x_linked">("autosomal_dominant");
  const [affectedMembers, setAffectedMembers] = useState<Set<string>>(new Set(["I-1", "II-2", "III-2"]));

  // Simulation state for Lab 04: Karyotype Explorer
  const [selectedKaryotypeCase, setSelectedKaryotypeCase] = useState<string>("47,XX,+21");

  // Simulation state for Lab 05: ACMG Variant Classification
  const [activeAcmgCodes, setActiveAcmgCodes] = useState<string[]>(["PVS1", "PM2"]);

  // Simulation state for Lab 06: Testing Triage
  const [selectedVignetteIdx, setSelectedVignetteIdx] = useState<number>(0);
  const [selectedModality, setSelectedModality] = useState<string | null>(null);

  // Simulation state for Lab 07: Family Risk Mapper
  const [selectedRiskSyndrome, setSelectedRiskSyndrome] = useState<string>("HBOC");
  const [youngestOnsetAge, setYoungestOnsetAge] = useState<number>(42);

  // Simulation state for Lab 08: Bayesian Carrier Calculator
  const [priorCarrierOneInX, setPriorCarrierOneInX] = useState<number>(25);
  const [testDetectionRate, setTestDetectionRate] = useState<number>(90);

  // Simulation state for Lab 09: Prenatal NIPT PPV slider
  const [maternalAge, setMaternalAge] = useState<number>(35);

  // Simulation state for Lab 10: Privacy & Sovereignty Audit
  const [consentScenario, setConsentScenario] = useState<"dtc" | "academic" | "pharma">("dtc");
  const [checkedAuditItems, setCheckedAuditItems] = useState<Set<string>>(new Set(["gina_health", "hipaa_safe"]));

  useEffect(() => {
    async function loadLabs() {
      setLoading(true);
      try {
        const data = await api.getAcademyLabs();
        setLabs(data);
      } catch (err) {
        console.error("Failed to load virtual labs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLabs();
  }, []);

  const activeLab = useMemo(() => {
    return labs.find((l) => l.id === activeLabId) || labs[0];
  }, [labs, activeLabId]);

  // Lab 01 DNA Base pairing logic
  const handleToggleBase = (index: number) => {
    const bases = ["A", "T", "G", "C"];
    const current = userBases[index] || "A";
    const next = bases[(bases.indexOf(current) + 1) % bases.length];
    const updated = [...userBases];
    updated[index] = next;
    setUserBases(updated);
    sound.playPop();
  };

  const isDnaPairingCorrect = useMemo(() => {
    return templateStrand.split("").every((b, i) => userBases[i] === complementaryMap[b]);
  }, [userBases]);

  // Lab 02 Punnett Square logic
  const handleRunPunnettSimulation = () => {
    sound.playClick();
    let aa = 0,
      Aa = 0,
      AA = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      const p1Allele = Math.random() < 0.5 ? parent1[0] : parent1[1];
      const p2Allele = Math.random() < 0.5 ? parent2[0] : parent2[1];
      const genotype = [p1Allele, p2Allele].sort().join("");
      if (genotype === "AA") AA++;
      else if (genotype === "Aa" || genotype === "aA") Aa++;
      else aa++;
    }
    setOffspringCounts({ AA, Aa, aa });
    setSimulatedTrials(trials);
    sound.playSuccess();
  };

  // Lab 03 Pedigree member toggle
  const togglePedigreeMember = (id: string) => {
    sound.playPop();
    setAffectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Lab 05 ACMG Tier calculation
  const calculatedAcmgTier = useMemo(() => {
    const hasPVS1 = activeAcmgCodes.includes("PVS1");
    const hasBA1 = activeAcmgCodes.includes("BA1");
    const hasPM2 = activeAcmgCodes.includes("PM2");
    const hasPP3 = activeAcmgCodes.includes("PP3");

    if (hasBA1) {
      return { tier: "Benign (Class 1)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    }
    if (hasPVS1 && (hasPM2 || hasPP3)) {
      return { tier: "Pathogenic (Class 5)", color: "text-rose-700 bg-rose-50 border-rose-200" };
    }
    if (hasPVS1 || (hasPM2 && hasPP3)) {
      return { tier: "Likely Pathogenic (Class 4)", color: "text-amber-800 bg-amber-50 border-amber-200" };
    }
    if (activeAcmgCodes.length === 0) {
      return { tier: "Unclassified", color: "text-gray-600 bg-gray-50 border-gray-200" };
    }
    return { tier: "Variant of Uncertain Significance (Class 3 VUS)", color: "text-blue-800 bg-blue-50 border-blue-200" };
  }, [activeAcmgCodes]);

  // Lab 06 Testing Triage data
  const triageVignettes = [
    {
      title: "Patient 1: 34yo with Unexplained Left Ventricular Hypertrophy (LVH 22mm) & Syncope",
      indication: "Hypertrophic Cardiomyopathy (HCM)",
      correctModality: "Targeted Gene Panel",
      options: [
        { name: "Single-Gene Sanger (MYH7 only)", yield: "15%", fit: "suboptimal", reason: "Misses MYBPC3, TNNT2 and 30 other established sarcomeric genes." },
        { name: "Targeted Gene Panel (Cardiomyopathy Panel, 50-80 genes)", yield: "50-60%", fit: "best", reason: "Standard of care: high depth of coverage (>100x), comprehensive sarcomere coverage, cost-effective." },
        { name: "Chromosomal Microarray (CMA)", yield: "<2%", fit: "suboptimal", reason: "HCM is predominantly caused by point mutations/indels, not large copy number variations." },
        { name: "Rapid Whole Genome Sequencing", yield: "55%", fit: "costly", reason: "High clinical utility but expensive first-tier; panel is first-line." },
      ],
    },
    {
      title: "Patient 2: 3yo with Global Developmental Delay, Dysmorphic Facies & Microcephaly",
      indication: "Syndromic Neurodevelopmental Delay",
      correctModality: "Chromosomal Microarray (CMA)",
      options: [
        { name: "Chromosomal Microarray (CMA)", yield: "15-20%", fit: "best", reason: "First-tier clinical recommendation (ACMG/AAP) for unexplained developmental delay/autism with dysmorphisms." },
        { name: "Single-Gene FMR1 Repeat Analysis", yield: "2%", fit: "suboptimal", reason: "Fragile X is important but CMA captures genome-wide CNVs first." },
        { name: "Targeted Epilepsy Panel", yield: "<5%", fit: "suboptimal", reason: "Too narrow for non-seizure syndromic presentation." },
        { name: "Standard 550-Band Karyotype", yield: "3%", fit: "suboptimal", reason: "Lacks submicroscopic copy number resolution (resolves only >5-10 Mb)." },
      ],
    },
    {
      title: "Patient 3: Couple with 3 Recurrent First-Trimester Pregnancy Losses",
      indication: "Recurrent Pregnancy Loss (RPL)",
      correctModality: "Parental Peripheral Blood Karyotype",
      options: [
        { name: "Parental Peripheral Blood Karyotyping (Both Partners)", yield: "4-5%", fit: "best", reason: "Detects balanced reciprocal or Robertsonian translocations responsible for recurrent unbalanced gametes." },
        { name: "Whole Exome Sequencing (WES) of Parents", yield: "<1%", fit: "suboptimal", reason: "Balanced structural rearrangements are invisible to standard short-read WES." },
        { name: "Expanded Carrier Screening (250 conditions)", yield: "Variable", fit: "suboptimal", reason: "Does not explain recurrent miscarriages unless specific lethal recessive pair identified." },
        { name: "MTHFR Mutation Testing", yield: "0%", fit: "not_indicated", reason: "ACMG/ACOG explicitly advise AGAINST MTHFR testing for recurrent pregnancy loss." },
      ],
    },
  ];

  // Lab 08 Bayesian residual risk calculation
  const bayesianCalculation = useMemo(() => {
    const priorCarrier = 1 / priorCarrierOneInX; // e.g. 1/25 = 0.04
    const priorNonCarrier = 1 - priorCarrier; // 0.96
    const detectionRate = testDetectionRate / 100; // e.g. 0.90
    // Conditional probability of negative test:
    // If Carrier: 1 - detectionRate (e.g. 0.10)
    // If Non-Carrier: 1.0 (assuming 100% specificity for carrier variant absence)
    const condCarrier = 1 - detectionRate;
    const condNonCarrier = 1.0;
    const jointCarrier = priorCarrier * condCarrier;
    const jointNonCarrier = priorNonCarrier * condNonCarrier;
    const totalJoint = jointCarrier + jointNonCarrier;
    const posteriorCarrierRisk = jointCarrier / totalJoint;
    const oneInX = Math.round(1 / posteriorCarrierRisk);
    return {
      priorCarrierPct: (priorCarrier * 100).toFixed(2),
      posteriorCarrierPct: (posteriorCarrierRisk * 100).toFixed(3),
      oneInX,
    };
  }, [priorCarrierOneInX, testDetectionRate]);

  // Lab 09 Prenatal NIPT PPV calculation
  const calculatedPpv = useMemo(() => {
    const age = maternalAge;
    const prevalence = 1 / (1400 - (age - 20) * 60);
    const sensitivity = 0.99;
    const falsePositiveRate = 0.001;
    const truePos = prevalence * sensitivity;
    const falsePos = (1 - prevalence) * falsePositiveRate;
    const ppv = (truePos / (truePos + falsePos)) * 100;
    return Math.min(96, Math.max(35, ppv)).toFixed(1);
  }, [maternalAge]);

  const handleMarkLabCompleted = async (labId: string) => {
    sound.playSuccess();
    setCompletedLabs((prev) => new Set([...Array.from(prev), labId]));
    try {
      await api.submitAcademyLab(labId, { completed: true, timestamp: new Date().toISOString() });
    } catch {
      // offline fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4fbfa] flex items-center justify-center">
        <FlaskConical className="w-10 h-10 text-[#00837b] animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-[#112128] pb-24">
      {/* Top Navbar */}
      <div className="border-b border-[#00837b]/10 bg-white/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/academy" className="hover:text-[#00837b]">
              Academy Hub
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#00837b] font-medium">10 Virtual Genetics Laboratories</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{completedLabs.size} of 10 Labs Completed</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Interactive Virtual Genetics Laboratories
          </h1>
          <p className="text-xs md:text-sm text-gray-600 max-w-3xl mt-1 leading-relaxed">
            Ten browser-executable scientific simulations covering molecular base pairing, Mendelian inheritance, cytogenetics, ACMG classification, testing triage, and Bayesian recurrence risk modeling.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Lab Selector Column */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block px-1">
              Select Virtual Laboratory
            </span>
            <div className="space-y-1.5">
              {labs.map((lab) => {
                const isSelected = lab.id === activeLabId;
                const isCompleted = completedLabs.has(lab.id);
                return (
                  <button
                    key={lab.id}
                    onClick={() => {
                      setActiveLabId(lab.id);
                      sound.playClick();
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? "bg-white border-[#00837b] shadow-sm ring-1 ring-[#00837b]/30"
                        : "bg-white/80 border-gray-200/80 hover:bg-white text-gray-700"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          {lab.code}
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold">{lab.category}</span>
                      </div>
                      <p className={`text-xs font-bold leading-tight truncate ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                        {lab.title}
                      </p>
                    </div>

                    {isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Simulation Stage Column */}
          <div className="lg:col-span-8 bg-white border border-[#00837b]/15 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            {activeLab && (
              <div className="space-y-6">
                {/* Lab Header */}
                <div className="space-y-2 border-b border-gray-100 pb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                      {activeLab.code}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">{activeLab.category}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
                    {activeLab.title}
                  </h2>
                  <p className="text-xs text-gray-600 leading-relaxed">{activeLab.description}</p>
                </div>

                {/* Instructions Ribbon */}
                <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-4 text-xs text-teal-950 space-y-1">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-[#00837b] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Simulation Instructions
                  </span>
                  <p className="text-gray-700">{activeLab.instructions}</p>
                </div>

                {/* SIMULATION 1: DNA Double-Helix Base Pairing */}
                {activeLab.simulation_type === "dna_pairing" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700">Template Strand (5&apos; → 3&apos;):</p>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {templateStrand.split("").map((base, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-xl bg-[#112128] text-teal-300 font-mono font-bold text-sm flex items-center justify-center shadow"
                          >
                            {base}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hydrogen Bond Visual Connector */}
                    <div className="flex items-center gap-2 overflow-x-auto px-1 py-1 text-gray-400">
                      {templateStrand.split("").map((base, idx) => (
                        <div key={idx} className="w-10 text-center text-[10px] font-mono font-bold">
                          {["A", "T"].includes(base) ? "|| (2H)" : "||| (3H)"}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700">
                        Synthesize Complementary Strand (3&apos; → 5&apos;): (Click to cycle A, T, G, C)
                      </p>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {userBases.map((base, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleToggleBase(idx)}
                            className={`w-10 h-10 rounded-xl font-mono font-bold text-sm flex items-center justify-center border-2 transition-all hover:scale-105 ${
                              base === complementaryMap[templateStrand[idx]]
                                ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                                : "bg-white border-amber-400 text-amber-800"
                            }`}
                          >
                            {base}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-t border-gray-200">
                      <span className="font-semibold text-gray-600">
                        {isDnaPairingCorrect
                          ? "✓ Complementary Watson-Crick Pairing Achieved!"
                          : "Pairing mismatch present (A-T: 2 H-bonds, G-C: 3 H-bonds)."}
                      </span>
                      <button
                        onClick={() => handleMarkLabCompleted(activeLab.id)}
                        disabled={!isDnaPairingCorrect}
                        className="bg-[#00837b] hover:bg-[#006e67] text-white px-5 py-2.5 rounded-xl font-bold shadow disabled:opacity-50 transition-all"
                      >
                        Submit Completed Lab
                      </button>
                    </div>
                  </div>
                )}

                {/* SIMULATION 2: Punnett Square & Mendelian Probability with Visual 2x2 Grid */}
                {activeLab.simulation_type === "punnett" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Maternal Genotype (Parent 1)</label>
                        <select
                          value={parent1}
                          onChange={(e) => setParent1(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white"
                        >
                          <option value="AA">AA (Unaffected Homozygote)</option>
                          <option value="Aa">Aa (Carrier Heterozygote)</option>
                          <option value="aa">aa (Affected Homozygote)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Paternal Genotype (Parent 2)</label>
                        <select
                          value={parent2}
                          onChange={(e) => setParent2(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white"
                        >
                          <option value="AA">AA (Unaffected Homozygote)</option>
                          <option value="Aa">Aa (Carrier Heterozygote)</option>
                          <option value="aa">aa (Affected Homozygote)</option>
                        </select>
                      </div>
                    </div>

                    {/* Interactive 2x2 Punnett Square Grid Diagram */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
                      <span className="text-xs font-bold text-gray-700 block">
                        Visual 2×2 Punnett Square Diagram:
                      </span>
                      <div className="max-w-xs mx-auto">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                          <div className="p-2 text-gray-400 font-serif italic flex items-center justify-center">
                            ♀ \ ♂
                          </div>
                          <div className="bg-teal-50 text-[#00837b] p-2.5 rounded-xl border border-teal-200 font-mono text-sm">
                            {parent2[0]}
                          </div>
                          <div className="bg-teal-50 text-[#00837b] p-2.5 rounded-xl border border-teal-200 font-mono text-sm">
                            {parent2[1]}
                          </div>

                          {/* Row 1 */}
                          <div className="bg-teal-50 text-[#00837b] p-2.5 rounded-xl border border-teal-200 font-mono text-sm flex items-center justify-center">
                            {parent1[0]}
                          </div>
                          {(() => {
                            const g1 = [parent1[0], parent2[0]].sort().join("");
                            const isAff = g1 === "aa";
                            const isCar = g1 === "Aa";
                            return (
                              <div className={`p-3 rounded-xl border font-mono text-sm shadow-xs ${isAff ? "bg-rose-50 border-rose-300 text-rose-900 font-extrabold" : isCar ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-emerald-50 border-emerald-300 text-emerald-900"}`}>
                                {g1}
                                <span className="block text-[9px] font-sans font-normal mt-0.5">
                                  {isAff ? "Affected" : isCar ? "Carrier" : "Normal"}
                                </span>
                              </div>
                            );
                          })()}
                          {(() => {
                            const g2 = [parent1[0], parent2[1]].sort().join("");
                            const isAff = g2 === "aa";
                            const isCar = g2 === "Aa";
                            return (
                              <div className={`p-3 rounded-xl border font-mono text-sm shadow-xs ${isAff ? "bg-rose-50 border-rose-300 text-rose-900 font-extrabold" : isCar ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-emerald-50 border-emerald-300 text-emerald-900"}`}>
                                {g2}
                                <span className="block text-[9px] font-sans font-normal mt-0.5">
                                  {isAff ? "Affected" : isCar ? "Carrier" : "Normal"}
                                </span>
                              </div>
                            );
                          })()}

                          {/* Row 2 */}
                          <div className="bg-teal-50 text-[#00837b] p-2.5 rounded-xl border border-teal-200 font-mono text-sm flex items-center justify-center">
                            {parent1[1]}
                          </div>
                          {(() => {
                            const g3 = [parent1[1], parent2[0]].sort().join("");
                            const isAff = g3 === "aa";
                            const isCar = g3 === "Aa";
                            return (
                              <div className={`p-3 rounded-xl border font-mono text-sm shadow-xs ${isAff ? "bg-rose-50 border-rose-300 text-rose-900 font-extrabold" : isCar ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-emerald-50 border-emerald-300 text-emerald-900"}`}>
                                {g3}
                                <span className="block text-[9px] font-sans font-normal mt-0.5">
                                  {isAff ? "Affected" : isCar ? "Carrier" : "Normal"}
                                </span>
                              </div>
                            );
                          })()}
                          {(() => {
                            const g4 = [parent1[1], parent2[1]].sort().join("");
                            const isAff = g4 === "aa";
                            const isCar = g4 === "Aa";
                            return (
                              <div className={`p-3 rounded-xl border font-mono text-sm shadow-xs ${isAff ? "bg-rose-50 border-rose-300 text-rose-900 font-extrabold" : isCar ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-emerald-50 border-emerald-300 text-emerald-900"}`}>
                                {g4}
                                <span className="block text-[9px] font-sans font-normal mt-0.5">
                                  {isAff ? "Affected" : isCar ? "Carrier" : "Normal"}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        onClick={handleRunPunnettSimulation}
                        className="inline-flex items-center gap-2 bg-[#00837b] hover:bg-[#006e67] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-all"
                      >
                        <Calculator className="w-4 h-4" />
                        Run 1,000 Offspring Monte-Carlo Trials
                      </button>

                      <button
                        onClick={() => handleMarkLabCompleted(activeLab.id)}
                        className="text-xs font-bold text-[#00837b] hover:underline"
                      >
                        Mark Lab Completed
                      </button>
                    </div>

                    {simulatedTrials > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3 animate-fadeIn">
                        <p className="text-xs font-bold text-gray-800">
                          Observed Trial Distributions (n = 1,000 empirical runs):
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                            <span className="font-bold text-emerald-900">AA (Unaffected)</span>
                            <p className="text-sm font-extrabold text-emerald-800 mt-1">
                              {((offspringCounts.AA / simulatedTrials) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                            <span className="font-bold text-amber-900">Aa (Carrier)</span>
                            <p className="text-sm font-extrabold text-amber-800 mt-1">
                              {((offspringCounts.Aa / simulatedTrials) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                            <span className="font-bold text-rose-900">aa (Affected)</span>
                            <p className="text-sm font-extrabold text-rose-800 mt-1">
                              {((offspringCounts.aa / simulatedTrials) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SIMULATION 3: Clinical Pedigree Construction & Pattern Tracing Lab */}
                {activeLab.simulation_type === "pedigree" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-gray-700 block">Inheritance Pattern Hypotheses:</span>
                        <div className="flex items-center gap-2 mt-1">
                          {[
                            { key: "autosomal_dominant", label: "Autosomal Dominant" },
                            { key: "autosomal_recessive", label: "Autosomal Recessive" },
                            { key: "x_linked", label: "X-Linked Recessive" },
                          ].map((pat) => (
                            <button
                              key={pat.key}
                              onClick={() => setPedigreeModel(pat.key as any)}
                              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                                pedigreeModel === pat.key
                                  ? "bg-[#00837b] text-white border-[#00837b] font-bold"
                                  : "bg-white text-gray-700 border-gray-200"
                              }`}
                            >
                              {pat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <span className="text-[11px] text-gray-500 font-medium">Click symbols to toggle affected state</span>
                    </div>

                    {/* Interactive 3-Generation Pedigree SVG Diagram */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-6">
                      <div className="space-y-4">
                        {/* Gen I */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-mono font-bold text-gray-400 mb-1">GENERATION I (Grandparents)</span>
                          <div className="flex items-center gap-8">
                            <button
                              onClick={() => togglePedigreeMember("I-1")}
                              className={`w-10 h-10 border-2 rounded-xs flex items-center justify-center font-mono text-xs transition-all ${
                                affectedMembers.has("I-1") ? "bg-rose-600 border-rose-800 text-white font-bold" : "bg-white border-gray-800 text-gray-900"
                              }`}
                              title="I-1: Male Grandfather"
                            >
                              I-1
                            </button>
                            <div className="w-10 h-0.5 bg-gray-800" />
                            <button
                              onClick={() => togglePedigreeMember("I-2")}
                              className={`w-10 h-10 border-2 rounded-full flex items-center justify-center font-mono text-xs transition-all ${
                                affectedMembers.has("I-2") ? "bg-rose-600 border-rose-800 text-white font-bold" : "bg-white border-gray-800 text-gray-900"
                              }`}
                              title="I-2: Female Grandmother"
                            >
                              I-2
                            </button>
                          </div>
                        </div>

                        {/* Branching Line */}
                        <div className="w-0.5 h-6 bg-gray-800 mx-auto" />
                        <div className="w-64 h-0.5 bg-gray-800 mx-auto" />

                        {/* Gen II */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-mono font-bold text-gray-400 mb-1">GENERATION II (Parents & Aunts)</span>
                          <div className="flex items-center justify-around w-80">
                            <button
                              onClick={() => togglePedigreeMember("II-1")}
                              className={`w-9 h-9 border-2 rounded-full flex items-center justify-center font-mono text-xs ${
                                affectedMembers.has("II-1") ? "bg-rose-600 border-rose-800 text-white font-bold" : "bg-white border-gray-800 text-gray-900"
                              }`}
                              title="II-1: Maternal Aunt"
                            >
                              II-1
                            </button>
                            <button
                              onClick={() => togglePedigreeMember("II-2")}
                              className={`w-9 h-9 border-2 rounded-xs flex items-center justify-center font-mono text-xs ${
                                affectedMembers.has("II-2") ? "bg-rose-600 border-rose-800 text-white font-bold" : "bg-white border-gray-800 text-gray-900"
                              }`}
                              title="II-2: Father (Obligate Carrier/Affected)"
                            >
                              II-2
                            </button>
                            <button
                              onClick={() => togglePedigreeMember("II-3")}
                              className={`w-9 h-9 border-2 rounded-full flex items-center justify-center font-mono text-xs ${
                                affectedMembers.has("II-3") ? "bg-rose-600 border-rose-800 text-white font-bold" : "bg-white border-gray-800 text-gray-900"
                              }`}
                              title="II-3: Mother"
                            >
                              II-3
                            </button>
                          </div>
                        </div>

                        {/* Branching Line */}
                        <div className="w-0.5 h-6 bg-gray-800 mx-auto" />

                        {/* Gen III Proband */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-mono font-bold text-[#00837b] mb-1">GENERATION III (Proband & Siblings)</span>
                          <div className="flex items-center gap-6">
                            <button
                              onClick={() => togglePedigreeMember("III-1")}
                              className={`w-9 h-9 border-2 rounded-xs flex items-center justify-center font-mono text-xs ${
                                affectedMembers.has("III-1") ? "bg-rose-600 border-rose-800 text-white font-bold" : "bg-white border-gray-800 text-gray-900"
                              }`}
                              title="III-1: Brother"
                            >
                              III-1
                            </button>
                            {/* Proband with Arrow */}
                            <div className="relative">
                              <span className="absolute -left-5 top-2.5 text-xs font-bold text-teal-700">↗</span>
                              <button
                                onClick={() => togglePedigreeMember("III-2")}
                                className={`w-9 h-9 border-2 rounded-full flex items-center justify-center font-mono text-xs ${
                                  affectedMembers.has("III-2") ? "bg-rose-600 border-rose-800 text-white font-bold ring-2 ring-[#00837b]" : "bg-white border-gray-800 text-gray-900 ring-2 ring-[#00837b]"
                                }`}
                                title="III-2: Female Proband (Consultand)"
                              >
                                III-2
                              </button>
                            </div>
                            <button
                              onClick={() => togglePedigreeMember("III-3")}
                              className={`w-9 h-9 border-2 rounded-xs flex items-center justify-center font-mono text-xs ${
                                affectedMembers.has("III-3") ? "bg-rose-600 border-rose-800 text-white font-bold" : "bg-white border-gray-800 text-gray-900"
                              }`}
                              title="III-3: Younger Brother"
                            >
                              III-3
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Pedigree Legend */}
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 border border-gray-800 bg-white inline-block" /> Male Unaffected</span>
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 border border-gray-800 rounded-full bg-white inline-block" /> Female Unaffected</span>
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 border border-rose-800 bg-rose-600 inline-block" /> Affected Individual</span>
                        <span className="flex items-center gap-1.5 text-teal-800 font-bold">↗ Proband (Consultand)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkLabCompleted(activeLab.id)}
                      className="bg-[#00837b] hover:bg-[#006e67] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow transition-all"
                    >
                      Record Pedigree Construction Attempt
                    </button>
                  </div>
                )}

                {/* SIMULATION 4: Chromosome Architecture & Karyotype Explorer */}
                {activeLab.simulation_type === "karyotype" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div>
                      <span className="text-xs font-bold text-gray-700 block mb-1.5">Select Clinical Karyotype Case:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "46,XX", label: "46,XX (Normal Female)" },
                          { id: "46,XY", label: "46,XY (Normal Male)" },
                          { id: "47,XX,+21", label: "Trisomy 21 (Down Syndrome)" },
                          { id: "45,X", label: "45,X (Turner Syndrome)" },
                        ].map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedKaryotypeCase(c.id);
                              sound.playPop();
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              selectedKaryotypeCase === c.id
                                ? "bg-[#00837b] text-white border-[#00837b] font-bold shadow-xs"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <span className="text-[10px] font-mono block opacity-90">{c.id}</span>
                            <span className="text-xs font-bold truncate block">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Visual 23 Chromosome Pairs Karyogram Diagram */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800">Metaphase G-Banded Cytogenetic Spread (550-Band Resolution):</span>
                        <span className="font-mono text-[#00837b] font-bold">{selectedKaryotypeCase}</span>
                      </div>

                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 text-center text-[10px] font-mono">
                        {Array.from({ length: 22 }, (_, i) => i + 1).map((chrNum) => {
                          const isTrisomy21 = selectedKaryotypeCase === "47,XX,+21" && chrNum === 21;
                          return (
                            <div
                              key={chrNum}
                              className={`p-2 rounded-xl border flex flex-col items-center justify-between h-20 transition-all ${
                                isTrisomy21
                                  ? "bg-amber-100 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-400"
                                  : "bg-gray-50 border-gray-200 text-gray-700"
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-10 bg-gray-700 rounded-full" />
                                <div className="w-1.5 h-10 bg-gray-700 rounded-full" />
                                {isTrisomy21 && (
                                  <div className="w-1.5 h-10 bg-amber-600 rounded-full animate-pulse" title="Extra Chromosome 21" />
                                )}
                              </div>
                              <span className="font-bold">Chr {chrNum}</span>
                            </div>
                          );
                        })}

                        {/* Sex Chromosome Pair */}
                        <div
                          className={`col-span-2 p-2 rounded-xl border flex flex-col items-center justify-between h-20 ${
                            selectedKaryotypeCase === "45,X"
                              ? "bg-rose-50 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-400"
                              : "bg-teal-50 border-teal-200 text-teal-950"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-10 bg-[#00837b] rounded-full" title="X Chromosome" />
                            {selectedKaryotypeCase === "46,XX" || selectedKaryotypeCase === "47,XX,+21" ? (
                              <div className="w-2 h-10 bg-[#00837b] rounded-full" title="Second X Chromosome" />
                            ) : selectedKaryotypeCase === "46,XY" ? (
                              <div className="w-1.5 h-5 bg-teal-800 rounded-full" title="Y Chromosome" />
                            ) : null}
                          </div>
                          <span className="font-bold">
                            {selectedKaryotypeCase === "45,X" ? "Sex: Monosomy X (45,X)" : selectedKaryotypeCase === "46,XY" ? "Sex: XY" : "Sex: XX"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkLabCompleted(activeLab.id)}
                      className="bg-[#00837b] hover:bg-[#006e67] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow"
                    >
                      Record Karyotype Analysis Complete
                    </button>
                  </div>
                )}

                {/* SIMULATION 5: ACMG Sequence Variant Classification */}
                {activeLab.simulation_type === "variant" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div>
                      <p className="text-xs font-bold text-gray-700">Target Variant:</p>
                      <p className="text-xs font-mono text-teal-900 bg-teal-50 p-2.5 rounded-lg border border-teal-200 mt-1">
                        BRCA1 c.5266dupC (p.Gln1756ProfsTer74)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700">Toggle Active ACMG/AMP Evidence Codes:</p>
                      <div className="flex flex-wrap gap-2">
                        {["PVS1 (Very Strong Pathogenic)", "PM2 (Moderate Frequency Absent)", "PP3 (Supporting In Silico)", "BA1 (Stand-Alone Benign >5%)"].map(
                          (codeItem) => {
                            const code = codeItem.split(" ")[0];
                            const isSelected = activeAcmgCodes.includes(code);
                            return (
                              <button
                                key={code}
                                onClick={() => {
                                  setActiveAcmgCodes((prev) =>
                                    isSelected ? prev.filter((c) => c !== code) : [...prev, code]
                                  );
                                  sound.playPop();
                                }}
                                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                                  isSelected
                                    ? "bg-[#00837b] text-white border-[#00837b] font-semibold shadow-sm"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {codeItem}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${calculatedAcmgTier.color} space-y-1`}>
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        Decisive ACMG Tier Classification
                      </span>
                      <p className="text-base font-extrabold">{calculatedAcmgTier.tier}</p>
                    </div>

                    <button
                      onClick={() => handleMarkLabCompleted(activeLab.id)}
                      className="bg-[#00837b] hover:bg-[#006e67] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow"
                    >
                      Record ACMG Classification Attempt
                    </button>
                  </div>
                )}

                {/* SIMULATION 6: Genetic Testing Modality Comparison & Triage Lab */}
                {activeLab.simulation_type === "testing_triage" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div>
                      <span className="text-xs font-bold text-gray-700 block mb-2">Select Clinical Vignette:</span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {triageVignettes.map((v, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedVignetteIdx(idx);
                              setSelectedModality(null);
                              sound.playClick();
                            }}
                            className={`text-xs px-3.5 py-2 rounded-xl border whitespace-nowrap transition-all ${
                              selectedVignetteIdx === idx
                                ? "bg-[#00837b] text-white border-[#00837b] font-bold shadow-xs"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            Case {idx + 1}: {v.indication}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
                      <p className="text-sm font-bold text-gray-900 leading-snug">
                        {triageVignettes[selectedVignetteIdx].title}
                      </p>

                      <span className="text-xs font-bold text-gray-700 block">
                        Select Diagnostic First-Tier Modality Order:
                      </span>
                      <div className="space-y-2">
                        {triageVignettes[selectedVignetteIdx].options.map((opt) => (
                          <button
                            key={opt.name}
                            onClick={() => {
                              setSelectedModality(opt.name);
                              sound.playPop();
                            }}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                              selectedModality === opt.name
                                ? opt.fit === "best"
                                  ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-400"
                                  : "bg-amber-50 border-amber-500 ring-1 ring-amber-400"
                                : "bg-gray-50/50 border-gray-200 hover:bg-white"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold text-gray-900">{opt.name}</p>
                              {selectedModality === opt.name && (
                                <p className="text-[11px] text-gray-600 mt-1">{opt.reason}</p>
                              )}
                            </div>
                            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-gray-200 flex-shrink-0">
                              Yield: {opt.yield}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkLabCompleted(activeLab.id)}
                      className="bg-[#00837b] hover:bg-[#006e67] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow"
                    >
                      Submit Diagnostic Triage Order
                    </button>
                  </div>
                )}

                {/* SIMULATION 7: Multi-Generational Family Health Risk Mapper */}
                {activeLab.simulation_type === "risk_mapper" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Target Hereditary Syndrome:</label>
                        <select
                          value={selectedRiskSyndrome}
                          onChange={(e) => setSelectedRiskSyndrome(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white"
                        >
                          <option value="HBOC">HBOC (BRCA1/BRCA2 Hereditary Breast/Ovarian)</option>
                          <option value="Lynch">Lynch Syndrome (MLH1/MSH2/MSH6 Colorectal)</option>
                          <option value="FH">Familial Hypercholesterolemia (LDLR early CAD)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Youngest Affected 1st-Degree Relative Diagnosis Age: {youngestOnsetAge} yo
                        </label>
                        <input
                          type="range"
                          min="28"
                          max="65"
                          value={youngestOnsetAge}
                          onChange={(e) => setYoungestOnsetAge(Number(e.target.value))}
                          className="w-full accent-[#00837b] mt-2"
                        />
                      </div>
                    </div>

                    {/* Risk Diagram & Screening Milestone Card */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">NCCN Surveillance Recommendation:</span>
                        <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                          High Risk Cluster Detected
                        </span>
                      </div>

                      <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 text-xs space-y-1.5 text-teal-950">
                        <p className="font-bold">
                          Empirical Screening Start Age:{" "}
                          <span className="text-emerald-800 font-extrabold text-sm underline">
                            Age {Math.max(25, youngestOnsetAge - 10)}
                          </span>{" "}
                          (10 years prior to youngest relative)
                        </p>
                        <p className="text-[11px] text-gray-600">
                          {selectedRiskSyndrome === "Lynch"
                            ? "Recommend high-definition colonoscopy every 1-2 years beginning at age " + Math.max(25, youngestOnsetAge - 10) + "."
                            : selectedRiskSyndrome === "HBOC"
                            ? "Recommend annual breast MRI with contrast starting at age 25, followed by alternating mammogram/MRI every 6 months at age 30."
                            : "Recommend early lipid panel profiling and high-intensity statin initiation."}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkLabCompleted(activeLab.id)}
                      className="bg-[#00837b] hover:bg-[#006e67] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow"
                    >
                      Record Family Risk Stratification
                    </button>
                  </div>
                )}

                {/* SIMULATION 8: Bayesian Carrier Screening & Residual Risk Calculator */}
                {activeLab.simulation_type === "bayesian" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Prior Carrier Frequency: 1 in {priorCarrierOneInX} ({bayesianCalculation.priorCarrierPct}%)
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={priorCarrierOneInX}
                          onChange={(e) => setPriorCarrierOneInX(Number(e.target.value))}
                          className="w-full accent-[#00837b] mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Test Detection Rate / Sensitivity: {testDetectionRate}%
                        </label>
                        <input
                          type="range"
                          min="70"
                          max="99"
                          value={testDetectionRate}
                          onChange={(e) => setTestDetectionRate(Number(e.target.value))}
                          className="w-full accent-[#00837b] mt-1"
                        />
                      </div>
                    </div>

                    {/* Visual Bayesian Table Diagram */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
                      <span className="text-xs font-bold text-gray-800 block">
                        Bayesian Updating Table (Following Negative Carrier Screen):
                      </span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className="border-b border-gray-200 text-gray-500 text-[10px]">
                              <th className="py-1.5">Hypothesis</th>
                              <th className="py-1.5">Prior</th>
                              <th className="py-1.5">Conditional</th>
                              <th className="py-1.5">Posterior Risk</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            <tr>
                              <td className="py-2 font-bold text-teal-900">Carrier (C)</td>
                              <td className="py-2">1/{priorCarrierOneInX}</td>
                              <td className="py-2">1 - {testDetectionRate / 100}</td>
                              <td className="py-2 font-bold text-rose-700">1 in {bayesianCalculation.oneInX} ({bayesianCalculation.posteriorCarrierPct}%)</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-bold text-teal-900">Non-Carrier (NC)</td>
                              <td className="py-2">1 - (1/{priorCarrierOneInX})</td>
                              <td className="py-2">1.0</td>
                              <td className="py-2 font-bold text-emerald-700">{(100 - Number(bayesianCalculation.posteriorCarrierPct)).toFixed(2)}%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                        <span className="font-bold">Clinical Pearl:</span> Negative screening substantially reduces carrier risk from 1 in {priorCarrierOneInX} to <strong>1 in {bayesianCalculation.oneInX}</strong>, but residual risk is never zero because uncommon mutations are not captured by the panel.
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkLabCompleted(activeLab.id)}
                      className="bg-[#00837b] hover:bg-[#006e67] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow"
                    >
                      Record Bayesian Calculation
                    </button>
                  </div>
                )}

                {/* SIMULATION 9: Prenatal NIPT PPV vs Maternal Age */}
                {activeLab.simulation_type === "prenatal" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                        <span>Maternal Age: {maternalAge} years old</span>
                        <span className="text-[#00837b] text-sm">Trisomy 21 PPV: {calculatedPpv}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="42"
                        value={maternalAge}
                        onChange={(e) => setMaternalAge(Number(e.target.value))}
                        className="w-full accent-[#00837b]"
                      />
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 text-xs space-y-2">
                      <p className="font-bold text-gray-900">Clinical Takeaway:</p>
                      <p className="text-gray-600 leading-relaxed">
                        At age 20, Trisomy 21 prevalence is low (~1 in 1,400), resulting in an NIPT positive predictive value of ~41% (more than half of positive NIPT results are false positives). At age 40 (~1 in 100 prevalence), PPV climbs to ~91%. Diagnostic amniocentesis or CVS is required for confirmation.
                      </p>
                    </div>

                    <button
                      onClick={() => handleMarkLabCompleted(activeLab.id)}
                      className="bg-[#00837b] hover:bg-[#006e67] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow"
                    >
                      Record Prenatal Lab Exercise
                    </button>
                  </div>
                )}

                {/* SIMULATION 10: Genomic Data Sovereignty & Privacy Risk Audit */}
                {activeLab.simulation_type === "privacy_audit" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div>
                      <span className="text-xs font-bold text-gray-700 block mb-1.5">Select Consent Protocol Scenario:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: "dtc", label: "Direct-to-Consumer (DTC)" },
                          { id: "academic", label: "Academic Medical Biobank" },
                          { id: "pharma", label: "Commercial Pharma Consortium" },
                        ].map((sc) => (
                          <button
                            key={sc.id}
                            onClick={() => setConsentScenario(sc.id as any)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                              consentScenario === sc.id
                                ? "bg-[#00837b] text-white border-[#00837b] shadow-xs"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {sc.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
                      <span className="text-xs font-bold text-gray-800 block">
                        Statutory Compliance & Privacy Safeguards Checklist:
                      </span>
                      <div className="space-y-2 text-xs">
                        {[
                          { id: "gina_health", label: "GINA (2008): Health insurance underwriting discrimination prohibited" },
                          { id: "gina_employ", label: "GINA Title II: Employment decisions based on genetic data prohibited" },
                          { id: "gina_life_gap", label: "GINA Exemption Awareness: Life, disability & long-term care insurance NOT protected" },
                          { id: "hipaa_safe", label: "HIPAA Safe Harbor 18 Identifiers stripped from genomic VCF files" },
                        ].map((chk) => {
                          const isChecked = checkedAuditItems.has(chk.id);
                          return (
                            <button
                              key={chk.id}
                              onClick={() => {
                                sound.playPop();
                                setCheckedAuditItems((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(chk.id)) next.delete(chk.id);
                                  else next.add(chk.id);
                                  return next;
                                });
                              }}
                              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                                isChecked ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold" : "bg-gray-50 border-gray-200 text-gray-600"
                              }`}
                            >
                              <span>{chk.label}</span>
                              <span className={`w-4 h-4 rounded-md flex items-center justify-center border ${isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-gray-400 bg-white"}`}>
                                {isChecked && <Check className="w-3 h-3" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkLabCompleted(activeLab.id)}
                      className="bg-[#00837b] hover:bg-[#006e67] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow"
                    >
                      Submit Privacy Sovereignty Audit
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
