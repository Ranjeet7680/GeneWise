"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  Check,
  ChevronDown,
  Copy,
  Download,
  Globe,
  Headphones,
  HeartPulse,
  HelpCircle,
  History,
  Languages,
  Loader2,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  Printer,
  Radio,
  RotateCcw,
  Settings2,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Waves,
  X,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import ExportPrintShareModal from "@/components/ExportPrintShareModal";
import { runBiLstmForecast } from "@/lib/clinical-lstm";
import { ExportableMessageItem, normalizeMessagesForExport } from "@/lib/export-share";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { sound } from "@/lib/sound";

interface LanguageItem {
  code: string;
  name: string;
  native: string;
  script: string;
  greeting: string;
}

const INDIAN_LANGUAGES: LanguageItem[] = [
  { code: "hi-IN", name: "Hindi", native: "हिन्दी", script: "Devanagari", greeting: "नमस्ते! मैं आपका GeneWise AI वॉयस असिस्टेंट हूँ।" },
  { code: "bn-IN", name: "Bengali", native: "বাংলা", script: "Bengali", greeting: "নমস্কার! আমি আপনার GeneWise AI ভয়েস সহকারী।" },
  { code: "ta-IN", name: "Tamil", native: "தமிழ்", script: "Tamil", greeting: "வணக்கம்! நான் உங்கள் GeneWise AI குரல் உதவியாளர்." },
  { code: "te-IN", name: "Telugu", native: "తెలుగు", script: "Telugu", greeting: "నమస్కారం! నేను మీ GeneWise AI వాయిస్ అసిస్టెంట్‌ని." },
  { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ", script: "Kannada", greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ GeneWise AI ಧ್ವನಿ ಸಹಾಯಕ." },
  { code: "ml-IN", name: "Malayalam", native: "മലയാളം", script: "Malayalam", greeting: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ GeneWise AI വോയ്സ് അസിസ്റ്റന്റാണ്." },
  { code: "mr-IN", name: "Marathi", native: "मराठी", script: "Devanagari", greeting: "नमस्कार! मी तुमचा GeneWise AI व्हॉईस असिस्टंट आहे." },
  { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી", script: "Gujarati", greeting: "નમસ્તે! હું તમારો GeneWise AI વોઇસ સહાયક છું." },
  { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ", script: "Gurmukhi", greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ GeneWise AI ਵਾਇਸ ਅਸਿਸਟੈਂਟ ਹਾਂ।" },
  { code: "od-IN", name: "Odia", native: "ଓଡ଼ିଆ", script: "Odia", greeting: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ GeneWise AI ଭଏସ୍ ସହାୟକ।" },
  { code: "as-IN", name: "Assamese", native: "অসমীয়া", script: "Bengali", greeting: "নমস্কাৰ! মই আপোনাৰ GeneWise AI কণ্ঠ সহায়ক।" },
  { code: "ur-IN", name: "Urdu", native: "اردو", script: "Arabic", greeting: "ہیلو! میں آپ کا GeneWise AI وائس اسسٹنٹ ہوں۔" },
  { code: "en-IN", name: "English (India)", native: "English", script: "Latin", greeting: "Hello! I am your GeneWise clinical voice assistant." },
];

const CLINICAL_VOICE_SCENARIOS = [
  {
    title: "Explain My Blood Report",
    native: "कृपया मेरी ब्लड रिपोर्ट समझाएं (CBC और लिपिड प्रोफाइल)",
    lang: "hi-IN",
    badge: "Hindi • Lab Panel",
  },
  {
    title: "Check ICU Vitals & BP",
    native: "Mera blood pressure aur heart rate kaisa hai?",
    lang: "hi-IN",
    badge: "Hinglish • Telemetry",
  },
  {
    title: "Pre-Diabetes Glucose Range",
    native: "Is Fasting Blood Glucose of 114 mg/dL pre-diabetic?",
    lang: "en-IN",
    badge: "English • ADA 2024",
  },
  {
    title: "Celiac Serology & tTG-IgA",
    native: "What does tTG-IgA antibody 48 U/mL indicate?",
    lang: "en-IN",
    badge: "English • ACG 1A",
  },
  {
    title: "Marfan Syndrome FBN1 Inheritance",
    native: "Explain Marfan Syndrome FBN1 autosomal dominant pattern",
    lang: "en-IN",
    badge: "Genetics • ClinVar",
  },
  {
    title: "Bi-LSTM 90d HbA1c Velocity",
    native: "HbA1c aur blood glucose ka Bi-LSTM 90-day forecast bataiye",
    lang: "hi-IN",
    badge: "Bi-LSTM • Sequence",
  },
  {
    title: "Thyroid TSH Axis & Free T4",
    native: "What does elevated TSH (4.9 mIU/L) indicate for subclinical thyroid?",
    lang: "en-IN",
    badge: "Thyroid • ATA 2024",
  },
  {
    title: "Renal Creatinine & eGFR",
    native: "Explain Serum Creatinine 1.14 mg/dL and race-free eGFR staging",
    lang: "en-IN",
    badge: "Renal • KDIGO 2024",
  },
  {
    title: "Emergency Red-Flag Sim",
    native: "Mujhe chhati me tej dard aur saans lene me takleef hai",
    lang: "hi-IN",
    badge: "Emergency • 112 Protocol",
  },
];

interface ChatRecord {
  id: string;
  sender: "user" | "assistant";
  text: string;
  time: string;
  lang?: string;
  isEmergency?: boolean;
}

export default function VoiceAssistantPage() {
  const { user } = useAuth();
  const [selectedLang, setSelectedLang] = useState<string>("hi-IN");
  const [autoDetect, setAutoDetect] = useState<boolean>(true);
  const [voiceLstmEnabled, setVoiceLstmEnabled] = useState<boolean>(true);
  const [continuousMode, setContinuousMode] = useState<boolean>(false);
  const continuousModeRef = useRef<boolean>(false);
  useEffect(() => {
    continuousModeRef.current = continuousMode;
  }, [continuousMode]);

  const [visualizerMode, setVisualizerMode] = useState<"waves" | "spectrum" | "ecg">("waves");
  const [currentLstmResult, setCurrentLstmResult] = useState<any>(null);

  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [interimText, setInterimText] = useState<string>("");
  const [subtitles, setSubtitles] = useState<{ native: string; romanized?: string; english?: string }>({
    native: "नमस्ते! बोलने के लिए नीचे दिए गए बटन पर टैप करें। (Tap below to start speaking)",
    romanized: "Namaste! Bolne ke liye neeche diye gaye button par tap karein.",
    english: "Hello! Tap the microphone or orb below to start talking.",
  });
  const [detectedBadge, setDetectedBadge] = useState<string>("हिन्दी (Hindi) • Auto-Detect Active");
  const [activeTools, setActiveTools] = useState<string[]>([
    "PubMed Clinical Grounding",
    "Bi-LSTM Sequence Engine",
    "Telemetry Node #409",
  ]);
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [audioVolume, setAudioVolume] = useState<number>(15);
  const [copiedSubtitle, setCopiedSubtitle] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFocusMsg, setExportFocusMsg] = useState<ExportableMessageItem | null>(null);
  const [exportScope, setExportScope] = useState<"single" | "all">("single");
  const [chatHistory, setChatHistory] = useState<ChatRecord[]>([
    {
      id: "m0",
      sender: "assistant",
      text: "नमस्ते! मैं आपका GeneWise AI (जीनवाइज एआई) स्वास्थ्य सहायक हूँ। आप मुझसे किसी भी भाषा में पूछ सकते हैं।",
      time: "Just now",
      lang: "hi-IN",
    },
  ]);

  // Audio Context & Canvas visualizer references
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [typingVoiceMsgId, setTypingVoiceMsgId] = useState<string | null>(null);
  const [typedVoiceLength, setTypedVoiceLength] = useState<number>(0);
  const voiceTypingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopVoiceTyping = () => {
    if (voiceTypingTimerRef.current) {
      clearInterval(voiceTypingTimerRef.current);
      voiceTypingTimerRef.current = null;
    }
    setTypingVoiceMsgId(null);
  };

  const startVoiceTyping = (msgId: string, fullText: string) => {
    stopVoiceTyping();
    if (!fullText) return;
    const total = fullText.length;
    let pos = Math.min(total, 4);
    setTypingVoiceMsgId(msgId);
    setTypedVoiceLength(pos);
    if (pos >= total) {
      setTypingVoiceMsgId(null);
      return;
    }
    const step = Math.max(3, Math.min(8, Math.ceil(total / 48)));
    voiceTypingTimerRef.current = setInterval(() => {
      pos = Math.min(total, pos + step);
      if (pos < total) {
        const nextSpace = fullText.indexOf(" ", pos);
        if (nextSpace !== -1 && nextSpace - pos <= 6) {
          pos = nextSpace + 1;
        }
      }
      setTypedVoiceLength(pos);
      if (pos >= total) {
        stopVoiceTyping();
      }
    }, 20);
  };

  useEffect(() => {
    return () => stopVoiceTyping();
  }, []);

  // Initialize Canvas Visualizer Loop with Multi-Mode rendering (Waves, Spectrum, ECG)
  useEffect(() => {
    let phase = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      phase += 0.04;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Color scheme based on voice state
      let strokeColor1 = "rgba(0, 99, 94, 0.4)";
      let strokeColor2 = "rgba(22, 125, 120, 0.25)";
      let strokeColor3 = "rgba(125, 213, 207, 0.15)";
      let amplitude = 12;

      if (voiceState === "listening") {
        strokeColor1 = "rgba(16, 185, 129, 0.75)";
        strokeColor2 = "rgba(5, 150, 105, 0.5)";
        strokeColor3 = "rgba(52, 211, 153, 0.3)";
        amplitude = 28 + (audioVolume / 3.5);
      } else if (voiceState === "speaking") {
        strokeColor1 = "rgba(14, 165, 233, 0.85)";
        strokeColor2 = "rgba(2, 132, 199, 0.55)";
        strokeColor3 = "rgba(56, 189, 248, 0.35)";
        amplitude = 26 + Math.sin(phase * 2) * 12;
      } else if (voiceState === "thinking") {
        strokeColor1 = "rgba(139, 92, 246, 0.75)";
        strokeColor2 = "rgba(168, 85, 247, 0.45)";
        strokeColor3 = "rgba(192, 132, 252, 0.25)";
        amplitude = 18 + Math.cos(phase * 3) * 8;
      }

      if (visualizerMode === "spectrum") {
        // Frequency Bar Spectrum Analyzer
        const numBars = 48;
        const barWidth = width / numBars - 3;
        for (let i = 0; i < numBars; i++) {
          const norm = i / numBars;
          const barHeight =
            Math.sin(norm * Math.PI) *
            (amplitude * (0.8 + 0.4 * Math.sin(phase * 3 + i * 0.4))) *
            1.8;
          const x = i * (barWidth + 3);
          const y = height / 2 - barHeight / 2;

          ctx.fillStyle =
            voiceState === "listening"
              ? `rgba(16, 185, 129, ${0.4 + 0.5 * Math.sin(norm * Math.PI)})`
              : voiceState === "speaking"
              ? `rgba(14, 165, 233, ${0.4 + 0.5 * Math.sin(norm * Math.PI)})`
              : `rgba(99, 102, 241, ${0.4 + 0.5 * Math.sin(norm * Math.PI)})`;

          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(x, y, barWidth, Math.max(4, barHeight), 2) : ctx.rect(x, y, barWidth, Math.max(4, barHeight));
          ctx.fill();
        }
      } else if (visualizerMode === "ecg") {
        // Clinical ICU ECG P-Q-R-S-T Rhythmic Trace
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = strokeColor1;
        const speed = (phase * 180) % width;

        for (let x = 0; x < width; x += 3) {
          const relX = (x + speed) % 200;
          let yOffset = 0;
          if (relX > 40 && relX < 60) {
            // P Wave
            yOffset = -Math.sin(((relX - 40) / 20) * Math.PI) * 10;
          } else if (relX >= 60 && relX < 66) {
            // Q Dip
            yOffset = 6;
          } else if (relX >= 66 && relX < 76) {
            // R Spike
            yOffset = -amplitude * 1.7;
          } else if (relX >= 76 && relX < 84) {
            // S Dip
            yOffset = 12;
          } else if (relX > 100 && relX < 140) {
            // T Wave
            yOffset = -Math.sin(((relX - 100) / 40) * Math.PI) * 14;
          }

          const y = height / 2 + yOffset;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // 3 Layered Harmonic Sine Waves (Default)
        const drawWave = (color: string, freq: number, amp: number, phaseShift: number) => {
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = color;

          for (let x = 0; x < width; x += 4) {
            const y = height / 2 + Math.sin(x * freq + phase + phaseShift) * amp * Math.sin((x / width) * Math.PI);
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        };

        drawWave(strokeColor3, 0.012, amplitude * 0.6, 0);
        drawWave(strokeColor2, 0.018, amplitude * 0.85, 1.2);
        drawWave(strokeColor1, 0.024, amplitude, 2.4);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [voiceState, audioVolume, visualizerMode]);

  // Barge-In: Interrupt speech
  const handleInterrupt = () => {
    sound.playClick();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setVoiceState("idle");
  };

  // Start Speech Recognition
  const startListening = () => {
    sound.playClick();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const SpeechRec = (typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
    if (!SpeechRec) {
      // Fallback if browser doesn't expose Web Speech API
      setVoiceState("listening");
      setTimeout(() => {
        const fallbackText = "Explain my blood report and recent glucose test";
        setTranscript(fallbackText);
        handleProcessVoiceQuery(fallbackText);
      }, 2000);
      return;
    }

    const recognition = new SpeechRec();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = autoDetect ? "hi-IN" : selectedLang;

    recognition.onstart = () => {
      setVoiceState("listening");
      setInterimText("");
      setIsEmergency(false);
      setAudioVolume(35);
    };

    recognition.onresult = (event: any) => {
      let currentInterim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i][0];
        if (event.results[i].isFinal) {
          setTranscript(item.transcript);
          handleProcessVoiceQuery(item.transcript);
        } else {
          currentInterim += item.transcript;
        }
      }
      setInterimText(currentInterim);
    };

    recognition.onerror = (e: any) => {
      console.warn("Speech recognition warning/fallback:", e);
      setVoiceState("idle");
    };

    recognition.onend = () => {
      if (voiceState === "listening") {
        setVoiceState("idle");
      }
    };

    try {
      recognition.start();
    } catch {
      setVoiceState("idle");
    }
  };

  // Send to GeneWise Voice Backend
  const handleProcessVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setVoiceState("thinking");

    // Add user message to history
    const userMsg: ChatRecord = {
      id: "u-" + Date.now(),
      sender: "user",
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      lang: selectedLang,
    };
    setChatHistory((prev) => [...prev, userMsg]);

    try {
      const response = await api.processVoiceQuery(
        queryText,
        autoDetect ? undefined : selectedLang
      );

      const qLower = queryText.toLowerCase();
      const forecastKey =
        response.lstm_biomarker ||
        (qLower.includes("celiac") || qLower.includes("ttg")
          ? "ttg_iga"
          : qLower.includes("bp") || qLower.includes("pressure")
          ? "systolic_bp"
          : qLower.includes("apob")
          ? "apob"
          : "hba1c");
      const lstmNote = voiceLstmEnabled ? runBiLstmForecast(forecastKey) : null;
      setCurrentLstmResult(lstmNote);

      setTranscript(response.transcript || queryText);
      setDetectedBadge(
        `${response.language_name || "Indian Regional"} • ${Math.round(
          (response.detected_confidence || 0.98) * 100
        )}% Confidence${lstmNote ? ` • Bi-LSTM ${lstmNote.projected90d}${lstmNote.unit} (90d)` : ""}`
      );
      const baseTools = response.tools_executed || ["PubMed Clinical Grounding"];
      setActiveTools(
        lstmNote && !baseTools.some((t: string) => t.toLowerCase().includes("lstm"))
          ? [...baseTools, `Bi-LSTM Sequence (${lstmNote.biomarkerLabel})`]
          : baseTools
      );
      setIsEmergency(response.is_emergency || false);
      const nextSubtitles = response.subtitles || { native: response.speech_response };
      setSubtitles(nextSubtitles);

      // Add assistant message to history and stream progressive subtitle typing animation
      const assistantId = "a-" + Date.now();
      const assistantText = response.speech_response || response.response_text || "Clinical telemetry inquiry verified.";
      const assistantMsg: ChatRecord = {
        id: assistantId,
        sender: "assistant",
        text: assistantText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEmergency: response.is_emergency,
      };
      setChatHistory((prev) => [...prev, assistantMsg]);
      startVoiceTyping(assistantId, nextSubtitles.native || assistantText);

      if (response.is_emergency) {
        sound.playEmergency();
      } else {
        sound.playSuccess();
      }

      // Multilingual speech synthesis
      speakText(response.speech_response, response.detected_language || selectedLang);
    } catch (err) {
      console.error("Voice process error:", err);
      setVoiceState("idle");
    }
  };

  // Multilingual Speech Synthesis (TTS)
  const speakText = (text: string, langCode: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setVoiceState("idle");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode || "hi-IN";
    utterance.rate = speechRate;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.startsWith(langCode.slice(0, 2)));
    if (match) {
      utterance.voice = match;
    }

    utterance.onstart = () => {
      setVoiceState("speaking");
    };

    utterance.onend = () => {
      setVoiceState("idle");
      // Hands-free continuous auto-listening
      if (continuousModeRef.current) {
        setTimeout(() => {
          if (continuousModeRef.current) {
            startListening();
          }
        }, 900);
      }
    };

    utterance.onerror = () => {
      setVoiceState("idle");
    };

    window.speechSynthesis.speak(utterance);
  };

  const currentLang =
    INDIAN_LANGUAGES.find((l) => l.code === selectedLang) || INDIAN_LANGUAGES[0];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#f4faff] dark:bg-[#0a161d] text-foreground">
      <AppHeader />

      <div className="flex-1 flex overflow-hidden">
        <AppSidebar />

        <main className="flex-1 flex flex-col justify-between p-3 sm:p-5 lg:p-8 max-w-5xl mx-auto w-full relative overflow-y-auto pb-24 md:pb-8 touch-pan-y">
          {/* Top Bar: Back to Chat + AI Engine + Export/Share + Language Controls + Rate */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-border">
            <Link
              href="/assistant"
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-surface-low"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Text Assistant</span>
            </Link>

            <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 max-w-full">
              {/* Bi-LSTM Temporal Toggle Pill */}
              <button
                type="button"
                onClick={() => {
                  sound.playSoft();
                  setVoiceLstmEnabled((v) => !v);
                }}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  voiceLstmEnabled
                    ? "bg-indigo-600/10 border-indigo-500/35 text-indigo-800 dark:text-indigo-200"
                    : "bg-white dark:bg-[#14262f] border-border text-muted-foreground"
                }`}
                title="Toggle 2-Layer Bi-LSTM longitudinal forecasting during voice consults"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Bi-LSTM: {voiceLstmEnabled ? "Active" : "Off"}</span>
              </button>

              {/* Hands-Free Auto-Listen Toggle Pill */}
              <button
                type="button"
                onClick={() => {
                  sound.playSoft();
                  setContinuousMode((c) => !c);
                }}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  continuousMode
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                    : "bg-white dark:bg-[#14262f] border-border text-muted-foreground hover:text-foreground"
                }`}
                title="Continuous conversation: voice assistant automatically listens after answering"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    continuousMode ? "bg-emerald-500 animate-ping" : "bg-muted-foreground"
                  }`}
                />
                <span>Hands-Free: {continuousMode ? "On" : "Off"}</span>
              </button>

              {/* Visualizer Mode Switcher */}
              <div className="flex items-center gap-0.5 bg-white dark:bg-[#14262f] p-1 rounded-xl border border-border text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setVisualizerMode("waves")}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    visualizerMode === "waves"
                      ? "bg-teal-700 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="3-Harmonic Sine Wave Visualizer"
                >
                  Waves
                </button>
                <button
                  type="button"
                  onClick={() => setVisualizerMode("spectrum")}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    visualizerMode === "spectrum"
                      ? "bg-teal-700 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Frequency Spectrum Bars"
                >
                  Spectrum
                </button>
                <button
                  type="button"
                  onClick={() => setVisualizerMode("ecg")}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    visualizerMode === "ecg"
                      ? "bg-teal-700 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Clinical ICU ECG Heartbeat Trace"
                >
                  ECG
                </button>
              </div>

              {/* Language Active Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#14262f] border border-border text-xs font-medium shadow-2xs">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span className="font-bold text-foreground">{currentLang.native}</span>
                <span className="text-[10px] text-muted-foreground">({currentLang.name})</span>
              </div>

              {/* Message-Only Print, Download PDF & Social Share */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setExportScope(chatHistory.length <= 1 ? "single" : "all");
                  setExportFocusMsg(null);
                  setShowExportModal(true);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-teal-600/30 bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-200 text-xs font-bold flex items-center gap-1.5 hover:bg-teal-100 dark:hover:bg-teal-950/50 transition-all"
                title="Print Message Only, Download PDF, or Share on WhatsApp"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Print / Share</span>
              </button>

              {/* History Toggle Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  setShowHistory(!showHistory);
                }}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  showHistory
                    ? "bg-teal-700 text-white border-teal-700 shadow-2xs"
                    : "bg-white dark:bg-[#14262f] border-border text-foreground hover:bg-surface-low"
                }`}
                title="Toggle Conversation Transcript"
              >
                <History className="w-4 h-4" />
                <span className="hidden md:inline">Transcript ({chatHistory.length})</span>
              </button>

              {/* Speed Toggles */}
              <div className="flex items-center gap-1 bg-white dark:bg-[#14262f] p-1 rounded-xl border border-border text-[11px] font-mono">
                {[0.8, 1.0, 1.2].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      sound.playClick();
                      setSpeechRate(r);
                    }}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                      speechRate === r
                        ? "bg-teal-700 text-white shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 13 Indian Languages Clean Wrapping Ribbon (touch snapping with zero clipped pills) */}
          <div className="py-2 sm:py-2.5 flex items-center gap-1.5 border-b border-border/60 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap touch-pan-x">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 mr-1 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-teal-600" /> Dialect (13):
            </span>
            {INDIAN_LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  sound.playClick();
                  setSelectedLang(l.code);
                  speakText(l.greeting, l.code);
                }}
                className={`px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium shrink-0 transition-all touch-manipulation active:scale-95 ${
                  selectedLang === l.code
                    ? "bg-teal-700 text-white font-bold shadow-2xs scale-[1.03]"
                    : "bg-white dark:bg-[#14262f] text-muted-foreground hover:text-foreground hover:border-teal-600/40 border border-border"
                }`}
              >
                <span>{l.native}</span>
                <span className="text-[9px] opacity-75 ml-1">({l.name.slice(0, 3)})</span>
              </button>
            ))}
          </div>

          {/* Emergency Alert Banner */}
          {isEmergency && (
            <div className="p-4 my-2 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-600 dark:text-red-400 text-xs flex items-start gap-3 animate-pulse shadow-md">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm uppercase tracking-wide">
                  Emergency Clinical Red-Flag Detected
                </p>
                <p className="leading-relaxed">
                  The symptoms reported require immediate medical evaluation. Call national emergency dispatch immediately:
                  <strong className="font-bold ml-1 text-red-700 dark:text-red-300">112 / 108 / 911</strong> or report to the nearest hospital triage department.
                </p>
              </div>
            </div>
          )}

          {/* Main Visualizer Area */}
          <div className="relative flex flex-col items-center justify-center my-auto py-6 space-y-6">
            {/* Background Sine Wave Canvas */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 z-0">
              <canvas
                ref={canvasRef}
                width={800}
                height={280}
                className="w-full max-w-3xl h-56"
              />
            </div>

            {/* Voice Status Pill */}
            <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#14262f] border border-border text-xs font-medium shadow-2xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  voiceState === "listening"
                    ? "bg-emerald-500 animate-ping"
                    : voiceState === "speaking"
                    ? "bg-teal-500 animate-pulse"
                    : voiceState === "thinking"
                    ? "bg-amber-500 animate-spin"
                    : "bg-primary"
                }`}
              />
              <span className="font-bold text-foreground">
                {voiceState === "listening"
                  ? "Listening (Speak in any of 13 Indian languages)..."
                  : voiceState === "speaking"
                  ? "Speaking (Tap Orb to Barge-In / Interrupt)"
                  : voiceState === "thinking"
                  ? "Consulting ACMG & ClinVar Evidence..."
                  : "Ready to Listen"}
              </span>
            </div>

            {/* Concentric Ambient Audio Rings & Central Glowing Orb */}
            <div className="relative z-10 flex items-center justify-center py-2 sm:py-4">
              {/* Outer Energy Pulse Ring 1 */}
              <div
                className={`absolute w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full transition-all duration-700 pointer-events-none ${
                  voiceState === "listening"
                    ? "bg-emerald-500/20 animate-voice-orb-listen scale-110"
                    : voiceState === "speaking"
                    ? "bg-teal-400/20 animate-voice-orb-speak scale-105"
                    : voiceState === "thinking"
                    ? "bg-purple-500/20 animate-pulse scale-100"
                    : "bg-teal-500/10 animate-voice-ring-slow scale-95 opacity-50"
                }`}
              />

              {/* Mid Energy Pulse Ring 2 */}
              <div
                className={`absolute w-44 h-44 sm:w-56 sm:h-56 md:w-68 md:h-68 rounded-full border transition-all duration-500 pointer-events-none ${
                  voiceState === "listening"
                    ? "border-emerald-500/40 animate-pulse scale-105"
                    : voiceState === "speaking"
                    ? "border-teal-400/50 animate-pulse scale-100"
                    : "border-teal-500/20 scale-90 opacity-40"
                }`}
              />

              {/* Inner Orb Interactive Button */}
              <div
                onClick={() => {
                  if (voiceState === "speaking") {
                    handleInterrupt();
                  } else if (voiceState === "listening") {
                    setVoiceState("idle");
                  } else {
                    startListening();
                  }
                }}
                className={`relative cursor-pointer group flex flex-col items-center justify-center w-36 h-36 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-full text-white shadow-2xl transition-all duration-300 transform select-none touch-manipulation active:scale-95 ${
                  voiceState === "listening"
                    ? "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-[0_0_60px_rgba(16,185,129,0.5)] animate-voice-orb-listen scale-105"
                    : voiceState === "speaking"
                    ? "bg-gradient-to-tr from-teal-600 to-cyan-500 shadow-[0_0_60px_rgba(20,184,166,0.5)] animate-voice-orb-speak scale-105"
                    : voiceState === "thinking"
                    ? "bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-[0_0_50px_rgba(124,58,237,0.4)] animate-pulse"
                    : "bg-gradient-to-tr from-teal-800 to-teal-600 hover:scale-105 shadow-xl animate-voice-orb-breathe"
                }`}
              >
                {voiceState === "speaking" ? (
                  <div className="flex items-center gap-1.5 h-10 mb-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 rounded-full bg-white transition-all duration-200"
                        style={{
                          height: `${12 + (i % 4) * 8}px`,
                          animation: `wave-bar 0.8s ease-in-out infinite alternate`,
                          animationDelay: `${i * 120}ms`,
                        }}
                      />
                    ))}
                  </div>
                ) : voiceState === "thinking" ? (
                  <Loader2 className="w-12 h-12 animate-spin text-white mb-1" />
                ) : (
                  <Mic className={`w-12 h-12 transition-transform duration-200 ${voiceState === "listening" ? "scale-110 text-white" : "group-hover:scale-110"}`} />
                )}

                <span className="text-xs font-extrabold uppercase tracking-wider text-white/95 mt-1">
                  {voiceState === "speaking"
                    ? "Barge-In"
                    : voiceState === "listening"
                    ? "Listening..."
                    : voiceState === "thinking"
                    ? "Thinking..."
                    : "Tap to Speak"}
                </span>

                <span className="text-[10px] text-white/80 font-medium">
                  {voiceState === "speaking" ? "Tap to interrupt" : currentLang.native}
                </span>
              </div>
            </div>

            {/* Language & Voice Confidence Badge */}
            <div className="relative z-10 text-center space-y-1">
              <span className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 inline-block font-mono">
                {detectedBadge}
              </span>
              {interimText && (
                <p className="text-xs text-muted-foreground animate-pulse max-w-md mx-auto truncate">
                  &ldquo;{interimText}...&rdquo;
                </p>
              )}
            </div>

            {/* Subtitles & Multilingual Translation Card */}
            <div className="relative z-10 w-full max-w-2xl p-4 sm:p-5 rounded-2xl border border-border bg-white/95 dark:bg-[#14262f]/95 backdrop-blur-md shadow-xs space-y-2 text-center transition-all">
              <div className="flex items-center justify-between gap-1.5 text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Live Multilingual Subtitles & Transliteration</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (subtitles.native) {
                        sound.playClick();
                        speakText(subtitles.native, selectedLang);
                      }
                    }}
                    className="p-1.5 rounded-lg border border-border hover:bg-surface-low text-muted-foreground hover:text-foreground transition-all touch-manipulation active:scale-95"
                    title="Listen again"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (subtitles.native) {
                        navigator.clipboard.writeText(subtitles.native);
                        setCopiedSubtitle(true);
                        sound.playSuccess();
                        setTimeout(() => setCopiedSubtitle(false), 2000);
                      }
                    }}
                    className="p-1.5 rounded-lg border border-border hover:bg-surface-low text-muted-foreground hover:text-foreground transition-all touch-manipulation active:scale-95"
                    title="Copy subtitles"
                  >
                    {copiedSubtitle ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Native Script */}
              <p className="text-base sm:text-lg font-extrabold text-foreground leading-relaxed">
                {typingVoiceMsgId && typedVoiceLength < (subtitles.native?.length ?? 0)
                  ? subtitles.native.slice(0, typedVoiceLength)
                  : subtitles.native}
                {typingVoiceMsgId && (
                  <span
                    data-testid="voice-typing-cursor"
                    className="inline-block w-0.5 h-4 ml-1 align-middle bg-teal-600 animate-pulse"
                  />
                )}
              </p>

              {/* Romanized */}
              {subtitles.romanized && (
                <p className="text-xs sm:text-sm text-teal-700 dark:text-teal-300 font-medium italic">
                  {subtitles.romanized}
                </p>
              )}

              {/* English */}
              {subtitles.english && subtitles.english !== subtitles.native && (
                <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span className="font-semibold text-foreground">English:</span> {subtitles.english}
                </p>
              )}
            </div>

            {/* Inline Dynamic Bi-LSTM Forecast Card */}
            {voiceLstmEnabled && currentLstmResult && (
              <div className="relative z-10 w-full max-w-2xl p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/90 via-teal-50/50 to-white dark:from-indigo-950/40 dark:via-[#14262f] dark:to-[#1a2e38] shadow-xs space-y-2.5 animate-in fade-in-up duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
                      <BrainCircuit className="w-4 h-4" />
                    </span>
                    <div className="text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                        Bi-LSTM Sequence Forecast
                      </span>
                      <h4 className="text-xs font-bold text-foreground">
                        {currentLstmResult.biomarkerLabel}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-600/15 text-indigo-800 dark:text-indigo-200 border border-indigo-500/30">
                      AUC {currentLstmResult.auc}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-[#14262f] border border-border/60">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Baseline</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {currentLstmResult.baseline} {currentLstmResult.unit}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-[#14262f] border border-indigo-500/30">
                    <span className="text-[9px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block font-bold">90-Day Projection</span>
                    <span className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300">
                      {currentLstmResult.projected90d} {currentLstmResult.unit}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-[#14262f] border border-border/60">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Velocity Rate</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {currentLstmResult.velocityPerMonth > 0 ? "+" : ""}{currentLstmResult.velocityPerMonth} {currentLstmResult.unit}/mo
                    </span>
                  </div>
                </div>

                {/* Trajectory Timeline Bar Visual */}
                <div className="pt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                  {currentLstmResult.trajectory.map((step: any, idx: number) => (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="font-mono text-[9px] text-muted-foreground">{step.day}d</span>
                      <div className="w-10 sm:w-16 h-1.5 rounded-full bg-indigo-500/20 my-1 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(25, (step.value / (currentLstmResult.baseline * 1.3)) * 100))}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono font-bold text-foreground text-[10px]">{step.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Medical Tools Badges */}
            {activeTools.length > 0 && (
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-[11px] font-semibold text-muted-foreground">Executed Clinical Engines:</span>
                {activeTools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 font-medium text-[11px] flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{tool}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Patient Context & One-Tap Indian-Language Inquiries */}
          <div className="pt-4 border-t border-border space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Patient Context: Rajesh Kumar (MRN #92041)
              </span>
              <span className="text-[10px] text-muted-foreground font-mono bg-surface-low dark:bg-[#14262f] px-2 py-0.5 rounded-md border border-border">
                CMP: FPG 118 mg/dL • HbA1c 6.2% • tTG 48.2 U/mL
              </span>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block text-center">
              One-Tap Clinical Voice Scenarios
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
              {CLINICAL_VOICE_SCENARIOS.map((sc) => (
                <button
                  key={sc.title}
                  onClick={() => {
                    sound.playClick();
                    setSelectedLang(sc.lang);
                    setTranscript(sc.native);
                    handleProcessVoiceQuery(sc.native);
                  }}
                  className="p-3 rounded-2xl border border-border bg-white dark:bg-[#14262f] hover:border-teal-600 text-left transition-all shadow-2xs hover:shadow-xs group space-y-1.5 touch-manipulation active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400">
                      {sc.badge}
                    </span>
                    <Mic className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-xs font-bold text-foreground truncate">{sc.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{sc.native}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation History Drawer Modal */}
          {showHistory && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <div
                onClick={() => setShowHistory(false)}
                className="fixed inset-0 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md animate-fade-in"
                aria-hidden="true"
              />
              <div className="relative z-10 w-full max-w-md h-full bg-white dark:bg-[#14262f] border-l border-border shadow-2xl p-4 sm:p-6 flex flex-col justify-between animate-sheet-slide-up sm:animate-slide-in">
              <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-bold text-sm text-foreground">Voice Consultation Transcript</h3>
                      <p className="text-[10px] text-muted-foreground">{chatHistory.length} messages in session</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1 rounded-lg text-muted-foreground hover:bg-surface-low"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {chatHistory.map((m) => {
                    const isUser = m.sender === "user";
                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          isUser
                            ? "bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900 ml-6"
                            : m.isEmergency
                            ? "bg-red-500/10 border-red-500/30 mr-6"
                            : "bg-surface-low border-border mr-6"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="font-bold uppercase tracking-wider">
                            {isUser ? "You (Voice)" : "GeneWise Assistant"}
                          </span>
                          <span>{m.time}</span>
                        </div>
                        <p className="text-foreground leading-relaxed font-medium">
                        {m.sender === "assistant" && m.id === typingVoiceMsgId && typedVoiceLength < m.text.length
                          ? m.text.slice(0, typedVoiceLength)
                          : m.text}
                        {m.sender === "assistant" && m.id === typingVoiceMsgId && (
                          <span className="inline-block w-0.5 h-3.5 ml-1 align-middle bg-teal-600 animate-pulse" />
                        )}
                      </p>
                        <div className="pt-1.5 flex flex-wrap items-center justify-end gap-3 border-t border-border/40">
                          {!isUser && (
                            <button
                              type="button"
                              onClick={() => speakText(m.text, selectedLang)}
                              className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                            >
                              <Volume2 className="w-3 h-3" /> Replay Voice
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const [singleNorm] = normalizeMessagesForExport([m]);
                              setExportFocusMsg(singleNorm);
                              setExportScope("single");
                              setShowExportModal(true);
                            }}
                            className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" /> Print / PDF / Share
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setChatHistory([]);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-surface-low"
                >
                  Clear Session
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExportFocusMsg(null);
                      setExportScope("all");
                      setShowExportModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>PDF & Share</span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playSuccess();
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        const text = chatHistory
                          .map((c) => `[${c.time}] ${c.sender === "user" ? "Patient" : "AI Clinician"}: ${c.text}`)
                          .join("\n\n");
                        navigator.clipboard.writeText(text);
                        alert("Transcript copied to clipboard!");
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Transcript</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Message-Only Print, PDF Download & WhatsApp / Social Share Modal */}
          <ExportPrintShareModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            title={`Voice Consultation (${currentLang.name})`}
            patientName={user?.full_name || "Rajesh Kumar"}
            allMessages={normalizeMessagesForExport(chatHistory)}
            focusedMessage={exportFocusMsg}
            initialScope={exportScope}
          />
        </main>
      </div>
    </div>
  );
}
