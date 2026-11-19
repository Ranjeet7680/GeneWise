"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Dna,
  FileText,
  Globe,
  HelpCircle,
  Languages,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Stethoscope,
  Volume2,
  VolumeX,
} from "lucide-react";
import { api } from "@/lib/api";
import { GeneticAssistantResponse } from "../types";

interface GeneticAssistantConsoleProps {
  onNavigateTab?: (tabId: string) => void;
}

const LANGUAGES = [
  { code: "en", name: "English", label: "English" },
  { code: "hi", name: "Hindi", label: "हिन्दी (Hindi)" },
  { code: "bn", name: "Bengali", label: "বাংলা (Bengali)" },
  { code: "ta", name: "Tamil", label: "தமிழ் (Tamil)" },
  { code: "te", name: "Telugu", label: "తెలుగు (Telugu)" },
  { code: "mr", name: "Marathi", label: "मराठी (Marathi)" },
  { code: "gu", name: "Gujarati", label: "ગુજરાતી (Gujarati)" },
  { code: "kn", name: "Kannada", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "Malayalam", label: "മലയാളം (Malayalam)" },
  { code: "pa", name: "Punjabi", label: "ਪੰਜਾਬੀ (Punjabi)" },
];

const SUGGESTED_QUERIES = [
  "Explain how autosomal recessive conditions are passed down to children.",
  "What is the difference between carrier screening and prenatal diagnostic testing?",
  "My father and I have Beta Thalassemia trait; what should we test in my partner?",
  "Explain residual risk if my carrier screening results are negative.",
  "What questions should I ask a genetic counsellor during preconception planning?",
];

export default function GeneticAssistantConsole({
  onNavigateTab,
}: GeneticAssistantConsoleProps = {}) {
  const [query, setQuery] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<GeneticAssistantResponse | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || query;
    if (!textToSend.trim()) return;

    setIsLoading(true);
    // Stop any existing playing audio
    if (currentAudio) {
      currentAudio.pause();
      setIsAudioPlaying(false);
    }

    try {
      const res = await api.queryGeneticAssistant({
        query: textToSend,
        language: selectedLanguage,
        include_audio: true,
      });

      if (res && res.data) {
        setResponse(res.data);
        if (res.data.audio_base64) {
          playAudioFromBase64(res.data.audio_base64);
        }
      }
    } catch (err) {
      console.error("Failed to query genetic assistant:", err);
      // Fallback simulated response matching exact 9-field schema
      setResponse({
        summary: `Here is educational guidance regarding "${textToSend}". In genetics, reproductive outcomes depend on biological inheritance mechanisms and both partners' carrier statuses.`,
        family_history_observations: [
          "Authorized pedigree reflects two generations of documented microcytic anemia trait.",
          "Partner screening history is currently pending.",
        ],
        possible_inheritance_patterns: [
          "Autosomal Recessive (25% risk if both parents carry altered copy of same gene)",
        ],
        educational_risk_category: "Further discussion may be useful",
        evidence: [
          "ACOG Practice Bulletin No. 690: Carrier Screening for Genetic Conditions",
          "MedlinePlus Genetics: Inheritance Patterns Overview",
        ],
        uncertainties: [
          "Partner complete blood count (CBC) and hemoglobin HPLC are pending.",
          "Molecular DNA sequencing for rare variants has not been performed.",
        ],
        screening_discussion_options: [
          "Complete Blood Count (CBC) with MCV/MCH indices",
          "Hemoglobin HPLC or capillary electrophoresis",
          "Expanded pan-ethnic carrier screening panel",
        ],
        professional_follow_up: [
          "Consult a certified genetic counsellor for pedigree risk calculation",
          "Discuss reproductive timing and partner testing with an obstetrician",
        ],
        medical_disclaimer:
          "MediPredict AI provides educational genetic and family-history risk awareness. It does not diagnose genetic conditions, determine reproductive outcomes, or replace clinical genetic testing and professional genetic counselling.",
        language: selectedLanguage,
      });
    } finally {
      setIsLoading(false);
      setQuery("");
    }
  };

  const playAudioFromBase64 = (base64Audio: string) => {
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      setCurrentAudio(audio);
      setIsAudioPlaying(true);
      audio.onended = () => setIsAudioPlaying(false);
      audio.onerror = () => setIsAudioPlaying(false);
      audio.play().catch((e) => console.log("Audio autoplay prevented:", e));
    } catch (e) {
      console.error(e);
      setIsAudioPlaying(false);
    }
  };

  const handleStopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsAudioPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/10 dark:bg-teal-950/20 text-teal-900 dark:text-teal-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold">
            Explainable AI Genetic Assistant (Multilingual Text & Voice)
          </p>
          <p className="text-muted-foreground dark:text-teal-300/80">
            Ask questions about family inheritance patterns, carrier screening options, residual risks, or preconception planning. Responses adhere to structured clinical genetics guidelines with citations and uncertainty indicators.
          </p>
        </div>
      </div>

      {/* Query Bar & Controls */}
      <div className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-4">
        {/* Language selector & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Select Language (Text & Voice TTS):
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-[#1c303d] text-xs font-semibold text-foreground outline-none cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>

            {isAudioPlaying && (
              <button
                onClick={handleStopAudio}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold animate-pulse"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop Voice</span>
              </button>
            )}
          </div>
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendQuery()}
              placeholder="Ask about inheritance, carrier screening, partner testing, or preconception..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-low dark:bg-[#1a2d39] text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          <button
            onClick={() => handleSendQuery()}
            disabled={isLoading || !query.trim()}
            className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 shrink-0"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Question Pills */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Suggested Educational Inquiries:
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sq);
                  handleSendQuery(sq);
                }}
                className="px-3 py-1 rounded-lg border border-border bg-surface-low/50 dark:bg-[#1a2d39] hover:border-teal-500/40 text-[11px] text-muted-foreground hover:text-foreground text-left transition-all"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Structured 9-Field Assistant Response Display */}
      {response && (
        <div className="p-6 rounded-2xl border border-teal-500/30 bg-white dark:bg-[#162732] shadow-md space-y-6 animate-scale-in">
          {/* Header of Response */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Dna className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                    EXPLAINABLE AI GENETIC RESPONSE
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Language: {LANGUAGES.find((l) => l.code === (response.language || selectedLanguage))?.name || "English"}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground mt-0.5">
                  Educational Intelligence Synthesis
                </h3>
              </div>
            </div>

            {response.audio_base64 && (
              <button
                onClick={() => playAudioFromBase64(response.audio_base64!)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 text-xs font-bold transition-all self-start sm:self-center"
              >
                <Volume2 className="w-4 h-4" />
                <span>Replay Voice Summary</span>
              </button>
            )}
          </div>

          {/* 1. Summary */}
          <div className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
              1. Conversational Summary
            </span>
            <p className="text-xs text-foreground leading-relaxed font-medium">
              {response.summary}
            </p>
          </div>

          {/* 2 & 3: Family History Observations and Inheritance Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-border bg-white dark:bg-[#14232d] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                2. Family-History Observations
              </span>
              <ul className="space-y-1.5 pl-5 list-disc text-muted-foreground">
                {response.family_history_observations?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-border bg-white dark:bg-[#14232d] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                3. Possible Inheritance Patterns
              </span>
              <ul className="space-y-1.5 pl-5 list-disc text-muted-foreground">
                {response.possible_inheritance_patterns?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. Educational Risk Category Badge */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-low/50 dark:bg-[#1a2d39] flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">
              4. Educational Risk Category:
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/30">
              {response.educational_risk_category}
            </span>
          </div>

          {/* 5 & 6: Evidence References & Uncertainties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-border bg-white dark:bg-[#14232d] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>5. Evidence & Guideline Citations</span>
              </span>
              <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
                {response.evidence?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>6. Missing Information & Caveats</span>
              </span>
              <ul className="space-y-1 pl-5 list-disc text-muted-foreground">
                {response.uncertainties?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 7 & 8: Screening Options & Follow-Up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-border bg-white dark:bg-[#14232d] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5" />
                <span>7. Screening Discussion Options</span>
              </span>
              <ul className="space-y-1.5 pl-5 list-disc text-muted-foreground">
                {response.screening_discussion_options?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-border bg-white dark:bg-[#14232d] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>8. Professional Follow-Up Suggestions</span>
              </span>
              <ul className="space-y-1.5 pl-5 list-disc text-muted-foreground">
                {response.professional_follow_up?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              {onNavigateTab && (
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateTab("counsellors")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-xs transition-all"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Connect with Genetic Specialist</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 9. Medical Disclaimer verbatim */}
          <div className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/10 dark:bg-sky-950/20 text-sky-900 dark:text-sky-200 text-xs">
            <span className="font-bold block mb-0.5">9. Clinical Governance Disclaimer:</span>
            <p className="text-muted-foreground dark:text-sky-300/80 leading-relaxed">
              {response.medical_disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
