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
} from "lucide-react";
import { api } from "@/lib/api";
import { VirtualLab } from "@/types/academy";
import { sound } from "@/lib/sound";

export default function VirtualLabsPage() {
  const [labs, setLabs] = useState<VirtualLab[]>([]);
  const [activeLabId, setActiveLabId] = useState<string>("lab-01-dna-base-pairing");
  const [loading, setLoading] = useState<boolean>(true);
  const [completedLabs, setCompletedLabs] = useState<Set<string>>(new Set(["lab-01-dna-base-pairing"]));

  // Simulation interactive state for Lab 01: DNA Base Pairing
  const [userBases, setUserBases] = useState<string[]>(["T", "A", "C", "G", "G", "C", "T", "A"]);
  const templateStrand = "ATGCCGAT";
  const complementaryMap: Record<string, string> = { A: "T", T: "A", G: "C", C: "G" };

  // Simulation interactive state for Lab 02: Punnett Square
  const [parent1, setParent1] = useState<string>("Aa");
  const [parent2, setParent2] = useState<string>("Aa");
  const [simulatedTrials, setSimulatedTrials] = useState<number>(0);
  const [offspringCounts, setOffspringCounts] = useState<{ AA: number; Aa: number; aa: number }>({
    AA: 0,
    Aa: 0,
    aa: 0,
  });

  // Simulation interactive state for Lab 05: ACMG Variant Classification
  const [activeAcmgCodes, setActiveAcmgCodes] = useState<string[]>(["PVS1", "PM2"]);

  // Simulation interactive state for Lab 09: Prenatal NIPT PPV slider
  const [maternalAge, setMaternalAge] = useState<number>(35);

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
      else if (genotype === "aa") aa++;
    }
    setOffspringCounts({ AA, Aa, aa });
    setSimulatedTrials(trials);
    sound.playSuccess();
  };

  // Lab 05 ACMG Tier calculation
  const calculatedAcmgTier = useMemo(() => {
    const hasPvs1 = activeAcmgCodes.includes("PVS1");
    const hasPm2 = activeAcmgCodes.includes("PM2");
    const hasPp3 = activeAcmgCodes.includes("PP3");
    const hasBa1 = activeAcmgCodes.includes("BA1");

    if (hasBa1) return { tier: "Benign (Class 1)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (hasPvs1 && (hasPm2 || hasPp3)) {
      return { tier: "Pathogenic (Class 5)", color: "text-rose-700 bg-rose-50 border-rose-200" };
    }
    if (hasPvs1 || (hasPm2 && hasPp3)) {
      return { tier: "Likely Pathogenic (Class 4)", color: "text-amber-700 bg-amber-50 border-amber-200" };
    }
    return { tier: "Variant of Uncertain Significance (Class 3)", color: "text-purple-700 bg-purple-50 border-purple-200" };
  }, [activeAcmgCodes]);

  // Lab 09 PPV calculation based on maternal age
  const calculatedPpv = useMemo(() => {
    // Approximation curve for Trisomy 21 PPV
    if (maternalAge <= 20) return 41.5;
    if (maternalAge <= 25) return 48.0;
    if (maternalAge <= 30) return 58.5;
    if (maternalAge <= 35) return 73.8;
    if (maternalAge <= 40) return 90.9;
    return 94.5;
  }, [maternalAge]);

  const handleMarkLabCompleted = async (labId: string) => {
    sound.playSuccess();
    setCompletedLabs((prev) => new Set([...Array.from(prev), labId]));
    try {
      await api.submitAcademyLab(labId, { completed: true, timestamp: Date.now() });
    } catch (err) {
      console.error("Failed to record lab completion:", err);
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

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{completedLabs.size} of 10 Labs Completed</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-white border border-[#00837b]/15 rounded-3xl p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#00837b]/10 text-[#00837b] text-xs font-bold px-3 py-1 rounded-full uppercase">
              Interactive In Silico Workbench
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900">
            Interactive Virtual Genetics Laboratories
          </h1>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed max-w-3xl">
            Ten browser-executable scientific simulations covering molecular base pairing, Mendelian inheritance, cytogenetics, ACMG classification, testing triage, and Bayesian recurrence risk modeling.
          </p>
        </div>

        {/* Labs Grid / Selector & Active Lab Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: 10 Labs Selection List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Select Virtual Laboratory
            </h3>

            <div className="space-y-2">
              {labs.map((lab) => (
                <button
                  key={lab.id}
                  onClick={() => {
                    setActiveLabId(lab.id);
                    sound.playClick();
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    activeLabId === lab.id
                      ? "bg-white border-[#00837b] shadow-md ring-2 ring-[#00837b]/10"
                      : "bg-white/80 border-gray-200/80 hover:bg-white text-gray-700"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                        {lab.code}
                      </span>
                      <span className="text-[10px] text-gray-500">{lab.category}</span>
                    </div>
                    <h4 className="text-xs md:text-sm font-bold text-gray-900 leading-snug">
                      {lab.title}
                    </h4>
                  </div>

                  {completedLabs.has(lab.id) && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Active Simulation Workbench */}
          <div className="lg:col-span-8 space-y-6">
            {activeLab && (
              <div className="bg-white border border-[#00837b]/15 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                {/* Active Lab Header */}
                <div className="space-y-2 border-b border-gray-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                      {activeLab.code}
                    </span>
                    <span className="text-xs text-gray-500">{activeLab.category}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">{activeLab.title}</h2>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{activeLab.description}</p>
                </div>

                {/* Instructions */}
                <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-4 text-xs text-teal-950 space-y-1">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-[#00837b]">
                    Simulation Instructions
                  </span>
                  <p>{activeLab.instructions}</p>
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

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-600">
                        {isDnaPairingCorrect
                          ? "✓ Complementary Watson-Crick Pairing Achieved!"
                          : "Pairing mismatch present (A-T: 2 H-bonds, G-C: 3 H-bonds)."}
                      </span>
                      <button
                        onClick={() => handleMarkLabCompleted(activeLab.id)}
                        disabled={!isDnaPairingCorrect}
                        className="bg-[#00837b] hover:bg-[#006e67] text-white px-4 py-2 rounded-xl font-semibold shadow disabled:opacity-50"
                      >
                        Submit Completed Lab
                      </button>
                    </div>
                  </div>
                )}

                {/* SIMULATION 2: Punnett Square & Mendelian Probability */}
                {activeLab.simulation_type === "punnett" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Maternal Genotype</label>
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
                        <label className="text-xs font-bold text-gray-700 block mb-1">Paternal Genotype</label>
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

                    <button
                      onClick={handleRunPunnettSimulation}
                      className="inline-flex items-center gap-2 bg-[#00837b] hover:bg-[#006e67] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow"
                    >
                      <Calculator className="w-4 h-4" />
                      Run 1,000 Offspring Monte-Carlo Trials
                    </button>

                    {simulatedTrials > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                        <p className="text-xs font-bold text-gray-800">
                          Observed Trial Distributions (n = 1,000):
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                            <span className="font-bold text-emerald-900">AA (Unaffected)</span>
                            <p className="text-sm font-extrabold text-emerald-800 mt-1">
                              {((offspringCounts.AA / simulatedTrials) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-teal-50 p-2.5 rounded-lg border border-teal-200">
                            <span className="font-bold text-teal-900">Aa (Carrier)</span>
                            <p className="text-sm font-extrabold text-teal-800 mt-1">
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

                        <button
                          onClick={() => handleMarkLabCompleted(activeLab.id)}
                          className="w-full bg-[#00837b] hover:bg-[#006e67] text-white text-xs font-semibold py-2 rounded-lg mt-2"
                        >
                          Record Simulation Results
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* SIMULATION 5: ACMG Sequence Variant Classification */}
                {activeLab.simulation_type === "variant" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div>
                      <p className="text-xs font-bold text-gray-700">Target Variant:</p>
                      <p className="text-xs font-mono text-teal-900 bg-teal-50 p-2 rounded-lg border border-teal-200 mt-1">
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

                {/* SIMULATION 9: Prenatal NIPT PPV vs Maternal Age */}
                {activeLab.simulation_type === "prenatal" && (
                  <div className="space-y-6 bg-gray-50/80 rounded-2xl p-6 border border-gray-200/80">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                        <span>Maternal Age: {maternalAge} years old</span>
                        <span>Trisomy 21 PPV: {calculatedPpv}%</span>
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

                {/* Default placeholder for other labs */}
                {!["dna_pairing", "punnett", "variant", "prenatal"].includes(activeLab.simulation_type) && (
                  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center space-y-3">
                    <FlaskConical className="w-10 h-10 text-[#00837b] mx-auto opacity-70" />
                    <h4 className="text-base font-bold text-gray-800">{activeLab.title}</h4>
                    <p className="text-xs text-gray-600 max-w-md mx-auto">
                      Interactive sandbox pre-configured with clinical vignette and reference test parameters.
                    </p>
                    <button
                      onClick={() => handleMarkLabCompleted(activeLab.id)}
                      className="inline-flex items-center gap-1.5 bg-[#00837b] hover:bg-[#006e67] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Mark Lab Attempt Complete
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
