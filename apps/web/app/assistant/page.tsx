"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  FastForward,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  Microscope,
  Paperclip,
  PanelLeft,
  PanelLeftClose,
  Pause,
  PenTool,
  Play,
  Plus,
  Printer,
  Radio,
  Search,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  User as UserIcon,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import SafetyNotice from "@/components/SafetyNotice";
import ClinicalMarkdown from "@/components/ClinicalMarkdown";
import BiLstmTrajectoryCard from "@/components/BiLstmTrajectoryCard";
import ExportPrintShareModal from "@/components/ExportPrintShareModal";
import AiModelArchitectureModal from "@/components/AiModelArchitectureModal";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  AI_ENGINE_PROFILES,
  BIOMARKER_LSTM_PRESETS,
  getEngineProfile,
  runBiLstmForecast,
} from "@/lib/clinical-lstm";
import { ExportableMessageItem, normalizeMessagesForExport } from "@/lib/export-share";
import { sound } from "@/lib/sound";
import {
  CeliacRiskResponse,
  Conversation,
  MedicalReport,
  Message,
  ProviderStatus,
} from "@/types";

function stabilizeStreamingMarkdown(partial: string): string {
  if (!partial) return "";
  // Avoid flashing an empty heading/list row at the slice boundary before text arrives
  let clean = partial.replace(/(?:^|\n)(?:#{1,3}|[-*•+]|\d+[.)]?)\s*$/, "");
  const boldCount = (clean.match(/\*\*/g) || []).length;
  if (boldCount % 2 === 1) {
    clean += "**";
  } else {
    // If not in bold, check if single asterisk (italic) is dangling
    const loneAsterisks = clean.replace(/\*\*/g, "").match(/\*/g) || [];
    if (loneAsterisks.length % 2 === 1) {
      clean += "*";
    }
  }
  const tickCount = (clean.match(/`/g) || []).length;
  if (tickCount % 2 === 1) {
    clean += "`";
  }
  return clean;
}

interface CategorizedPrompt {
  category: string;
  badge: string;
  title: string;
  prompt: string;
  recommendedEngine?: string;
  biomarkerFocus?: string;
}

const CATEGORIZED_PROMPTS: CategorizedPrompt[] = [
  {
    category: "LSTM Forecasting",
    badge: "Bi-LSTM 90d Sequence",
    title: "HbA1c 90-Day Longitudinal Trajectory",
    prompt: "Run a Bi-LSTM 90-day sequence forecast for HbA1c (6.2%) and Fasting Glucose (118 mg/dL) progression.",
    recommendedEngine: "lstm_temporal",
    biomarkerFocus: "hba1c",
  },
  {
    category: "LSTM Forecasting",
    badge: "Bi-LSTM Antibody Kinetic",
    title: "Anti-tTG IgA Serology Velocity Prediction",
    prompt: "Predict the 90-day Anti-tTG IgA antibody trajectory using Bi-LSTM and explain pre-biopsy thresholds.",
    recommendedEngine: "hybrid_rag_lstm",
    biomarkerFocus: "ttg_iga",
  },
  {
    category: "Gastroenterology",
    badge: "ACG 2023 Grade 1A",
    title: "Celiac Disease Serology & Biopsy Protocol",
    prompt: "Explain celiac disease serology (tTG-IgA, total IgA, and Marsh stages).",
    recommendedEngine: "clinical_evidence",
  },
  {
    category: "Endocrinology",
    badge: "ADA 2024 Standards",
    title: "Glycemic Targets & HbA1c Discordance",
    prompt: "Explain the difference between Fasting Glucose and HbA1c in diabetes.",
    recommendedEngine: "hybrid_rag_lstm",
  },
  {
    category: "Cardiology",
    badge: "AHA/ACC 2023",
    title: "ApoB & Atherosclerotic Plaque Progression",
    prompt: "What do elevated ApoB and LDL-P indicate in cardiovascular risk?",
    recommendedEngine: "hybrid_rag_lstm",
    biomarkerFocus: "apob",
  },
  {
    category: "Medical Genetics",
    badge: "ACMG Curated",
    title: "HFE Gene Variants & Hemochromatosis",
    prompt: "What is the clinical significance of HFE gene variants (C282Y / H63D)?",
    recommendedEngine: "clinical_evidence",
  },
  {
    category: "Biomarker Triaging",
    badge: "Hematology Guidelines",
    title: "Ferritin & Transferrin Saturation",
    prompt: "What do elevated transferrin saturation and ferritin indicate?",
    recommendedEngine: "lstm_temporal",
    biomarkerFocus: "ferritin",
  },
  {
    category: "Hepatology",
    badge: "AASLD 2023",
    title: "MASLD / MASH Non-Invasive Staging",
    prompt: "How does the FIB-4 index calculate advanced liver fibrosis risk?",
    recommendedEngine: "clinical_evidence",
  },
  {
    category: "Endocrinology",
    badge: "Prediabetes Protocol",
    title: "Metformin Thresholds in Impaired Fasting Glucose",
    prompt: "Analyze Fasting Glucose 118 mg/dL and HbA1c 6.2%: when does ADA 2024 advise lifestyle vs Metformin?",
    recommendedEngine: "hybrid_rag_lstm",
  },
  {
    category: "Cardiology",
    badge: "Lipidomics + Bi-LSTM",
    title: "Lp(a) & ApoB Discordant Risk Stratification",
    prompt: "Forecast ApoB 112 mg/dL trend over 90 days and explain when to test Lipoprotein(a).",
    recommendedEngine: "lstm_temporal",
    biomarkerFocus: "apob",
  },
  {
    category: "Gastroenterology",
    badge: "Genetics + HLA-DQ",
    title: "HLA-DQ2 / DQ8 Rule-Out Negative Predictive Value",
    prompt: "When does HLA-DQ2 and HLA-DQ8 genetic testing help rule out celiac disease?",
    recommendedEngine: "clinical_evidence",
  },
  {
    category: "Biomarker Triaging",
    badge: "Telemetry + LSTM",
    title: "Ambulatory Systolic BP Drift & Variability",
    prompt: "Evaluate nocturnal heart rate 72 bpm and systolic BP 122 mmHg trajectory with Bi-LSTM.",
    recommendedEngine: "lstm_temporal",
    biomarkerFocus: "systolic_bp",
  },
  {
    category: "Endocrinology",
    badge: "ATA Thyroid + LSTM",
    title: "Subclinical TSH Elevation & Biotin Interference",
    prompt: "Interpret TSH 4.9 mIU/L trend with Bi-LSTM and explain when Free T4 or Anti-TPO is needed.",
    recommendedEngine: "hybrid_rag_lstm",
    biomarkerFocus: "tsh",
  },
  {
    category: "Biomarker Triaging",
    badge: "KDIGO 2024 CKD-EPI",
    title: "Serum Creatinine, eGFR & uACR Kidney Workup",
    prompt: "Evaluate serum creatinine 1.14 mg/dL, eGFR calculation, and urine uACR thresholds.",
    recommendedEngine: "hybrid_rag_lstm",
    biomarkerFocus: "creatinine",
  },
  {
    category: "Medical Genetics",
    badge: "ACMG 5-Tier Rules",
    title: "BRCA1/2 Pathogenic vs VUS Interpretation",
    prompt: "Explain how ACMG classifies a Variant of Uncertain Significance (VUS) vs Pathogenic variant in BRCA1.",
    recommendedEngine: "clinical_evidence",
  },
];

const PROMPT_CATEGORIES = [
  "All",
  "LSTM Forecasting",
  "Gastroenterology",
  "Endocrinology",
  "Cardiology",
  "Medical Genetics",
  "Biomarker Triaging",
  "Hepatology",
];

export default function AssistantPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | undefined>(undefined);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>("clinical_evidence");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activePromptCategory, setActivePromptCategory] = useState<string>("All");
  const [promptQuery, setPromptQuery] = useState<string>("");
  const [promptRotationSeed, setPromptRotationSeed] = useState<number>(0);
  const [convSearch, setConvSearch] = useState<string>("");
  const [showMobileThreads, setShowMobileThreads] = useState<boolean>(false);
  const [showPatientDossier, setShowPatientDossier] = useState<boolean>(false);
  const [expandedTraces, setExpandedTraces] = useState<Record<number, boolean>>({});
  const [isConsultationsCollapsed, setIsConsultationsCollapsed] = useState<boolean>(false);

  // Export, Print Only & Social Share Modal
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFocusMsg, setExportFocusMsg] = useState<ExportableMessageItem | null>(null);
  const [exportScope, setExportScope] = useState<"single" | "all">("single");

  // Interactive Bi-LSTM Temporal Biomarker Forecaster Modal
  const [showLstmModal, setShowLstmModal] = useState<boolean>(false);
  const [selectedBiomarkerKey, setSelectedBiomarkerKey] = useState<string>("hba1c");
  const [customLstmSeries, setCustomLstmSeries] = useState<number[]>(
    BIOMARKER_LSTM_PRESETS.hba1c.history
  );

  // AI Model Architecture & Blueprint Inspector Modal
  const [showModelModal, setShowModelModal] = useState<boolean>(false);
  const latestTelemetry = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].neural_telemetry) return messages[i].neural_telemetry;
    }
    return undefined;
  }, [messages]);

  // ML Risk Tool Modal
  const [showMlModal, setShowMlModal] = useState(false);
  const [mlData, setMlData] = useState({
    age: 26,
    gender: "Female",
    diabetes: "No",
    diabetes_type: "None",
    diarrhoea: "inflammatory",
    abdominal_pain: "yes",
    short_stature: "no",
    sticky_stool: "yes",
    weight_loss: "yes",
    iga: 2.8,
    igg: 13.9,
    igm: 1.1,
  });
  const [mlResult, setMlResult] = useState<CeliacRiskResponse | null>(null);
  const [mlLoading, setMlLoading] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const [typedLength, setTypedLength] = useState<number>(0);
  const [thinkingStage, setThinkingStage] = useState<number>(0);
  const [typingSpeed, setTypingSpeed] = useState<number>(1);
  const [isTypingPaused, setIsTypingPaused] = useState<boolean>(false);
  const [typewriterSoundEnabled, setTypewriterSoundEnabled] = useState<boolean>(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingRafRef = useRef<number | null>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const isAutoScrollPinnedRef = useRef<boolean>(true);
  const typingSpeedRef = useRef<number>(1);
  const isTypingPausedRef = useRef<boolean>(false);
  const typewriterSoundRef = useRef<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    typingSpeedRef.current = typingSpeed;
  }, [typingSpeed]);

  useEffect(() => {
    isTypingPausedRef.current = isTypingPaused;
  }, [isTypingPaused]);

  useEffect(() => {
    typewriterSoundRef.current = typewriterSoundEnabled;
  }, [typewriterSoundEnabled]);

  const playTypewriterClick = (char: string) => {
    if (!typewriterSoundRef.current || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      const isPunctuation = /[.,:;!?\n]/.test(char);
      osc.type = "sine";
      osc.frequency.setValueAtTime(isPunctuation ? 360 : 540 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.022);
      gain.gain.setValueAtTime(isPunctuation ? 0.02 : 0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Audio fallback
    }
  };

  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAutoScrollPinnedRef.current = distanceFromBottom < 140;
  };

  const scrollChatToBottom = (force = false) => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (force) {
      isAutoScrollPinnedRef.current = true;
    }
    if (force || isAutoScrollPinnedRef.current) {
      if (typeof el.scrollTo === "function") {
        try {
          el.scrollTo({ top: el.scrollHeight, behavior: force ? "auto" : "smooth" });
        } catch {
          el.scrollTop = el.scrollHeight;
        }
      } else {
        el.scrollTop = el.scrollHeight;
      }
    }
    prevScrollHeightRef.current = el.scrollHeight;
  };

  const stopTypingAnimation = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (typingRafRef.current !== null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(typingRafRef.current);
      typingRafRef.current = null;
    }
    setIsTypingPaused(false);
    setTypingMessageId(null);
  };

  const startTypingAnimation = (msg: Message) => {
    stopTypingAnimation();
    const fullText = msg.content || "";
    if (!fullText) return;

    const totalLen = fullText.length;
    // Reveal initial comfortable token so user sees text flowing immediately
    const firstSpace = fullText.indexOf(" ", 10);
    const initialChars = Math.min(totalLen, firstSpace !== -1 ? firstSpace + 1 : 14);
    setTypingMessageId(msg.id);
    setTypedLength(initialChars);
    if (initialChars >= totalLen) {
      setTypingMessageId(null);
      return;
    }

    let cursor = initialChars;
    let nextEligibleTs = 0;

    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      const step = (ts: number) => {
        if (isTypingPausedRef.current) {
          typingRafRef.current = requestAnimationFrame(step);
          return;
        }

        if (ts < nextEligibleTs) {
          typingRafRef.current = requestAnimationFrame(step);
          return;
        }

        const mult = typingSpeedRef.current || 1;
        // Dynamic chunk sizing for natural organic typing cadence
        const baseChunk =
          mult === 3
            ? 12
            : mult === 2
            ? 6
            : Math.max(2, Math.min(5, Math.ceil(totalLen / 350)));
        let nextCursor = Math.min(totalLen, cursor + baseChunk);

        // Word snap for clean token appearance
        if (nextCursor < totalLen) {
          const nextSpace = fullText.indexOf(" ", nextCursor);
          const nextNewline = fullText.indexOf("\n", nextCursor);
          const boundary =
            nextNewline !== -1 && (nextSpace === -1 || nextNewline < nextSpace)
              ? nextNewline
              : nextSpace;
          if (boundary !== -1 && boundary - nextCursor <= 4) {
            nextCursor = boundary + 1;
          }
        }

        // Punctuation and cadence rhythm: natural pauses at sentences, breaks, clauses
        const latestSlice = fullText.slice(cursor, nextCursor);
        let pauseDuration = 22 / mult;

        if (/[.!?]\s*$/.test(latestSlice)) {
          pauseDuration = 120 / mult; // sentence end pause
        } else if (/[\n]/.test(latestSlice)) {
          pauseDuration = 100 / mult; // newline pause
        } else if (/[:,;—–]\s*$/.test(latestSlice)) {
          pauseDuration = 55 / mult; // clause separator pause
        }

        nextEligibleTs = ts + pauseDuration;
        cursor = nextCursor;
        setTypedLength(cursor);
        playTypewriterClick(latestSlice.slice(-1));

        if (cursor >= totalLen) {
          setTypedLength(totalLen);
          stopTypingAnimation();
          return;
        }

        typingRafRef.current = requestAnimationFrame(step);
      };

      typingRafRef.current = requestAnimationFrame(step);
      return;
    }

    // Fallback interval if requestAnimationFrame is unavailable
    const stepSize = Math.max(4, Math.min(14, Math.ceil(totalLen / 60)));
    typingTimerRef.current = setInterval(() => {
      if (isTypingPausedRef.current) return;
      const mult = typingSpeedRef.current || 1;
      cursor = Math.min(totalLen, cursor + stepSize * mult);
      if (cursor < totalLen) {
        const nextSpace = fullText.indexOf(" ", cursor);
        if (nextSpace !== -1 && nextSpace - cursor <= 4) {
          cursor = nextSpace + 1;
        }
      }
      setTypedLength(cursor);
      playTypewriterClick(fullText[cursor - 1] || "");
      if (cursor >= totalLen) {
        stopTypingAnimation();
      }
    }, 24);
  };

  // Scroll only the inner message pane when content height actually grows (prevents screen vibration)
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (el.scrollHeight !== prevScrollHeightRef.current) {
      scrollChatToBottom(false);
    }
  }, [typedLength, typingMessageId, messages.length, isSending]);

  useEffect(() => {
    if (!isSending) {
      setThinkingStage(0);
      return;
    }
    const phaseTimer = setInterval(() => {
      setThinkingStage((prev) => (prev + 1) % 3);
    }, 550);
    return () => clearInterval(phaseTimer);
  }, [isSending]);

  useEffect(() => {
    return () => {
      stopTypingAnimation();
    };
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [convs, provs, reps] = await Promise.all([
        api.listConversations(),
        api.getProviders(),
        api.listReports(),
      ]);
      setConversations(convs);
      setProviderStatus(provs);
      setReports(reps);

      if (convs.length > 0) {
        selectConversation(convs[0].id);
      } else {
        await startNewConversation();
      }
    } catch (err) {
      console.error("Assistant init error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = async (id: number) => {
    stopTypingAnimation();
    setActiveConvId(id);
    try {
      const detail = await api.getConversation(id);
      const msgs = detail.messages || [];
      setMessages(msgs);
    } catch (err) {
      console.error("Load conversation error:", err);
    }
  };

  const startNewConversation = async () => {
    stopTypingAnimation();
    try {
      const newConv = await api.createConversation("New Consultation");
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      const detail = await api.getConversation(newConv.id);
      setMessages(detail.messages || []);
      setIsConsultationsCollapsed(false);
    } catch (err) {
      console.error("Create conversation error:", err);
    }
  };

  const handleDeleteConversation = async (id: number) => {
    try {
      await api.deleteConversation(id);
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (activeConvId === id) {
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          startNewConversation();
        }
      }
    } catch (err) {
      console.error("Delete conversation error:", err);
    }
  };

  const handleSendMessage = async (textToSend?: string, overrideProvider?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    const engineToUse = overrideProvider || selectedProvider;
    if (overrideProvider && overrideProvider !== selectedProvider) {
      setSelectedProvider(overrideProvider);
    }

    sound.playClick();
    let currentId = activeConvId;
    if (!currentId) {
      try {
        const newConv = await api.createConversation("Clinical Consultation");
        setConversations((prev) => [newConv, ...prev]);
        setActiveConvId(newConv.id);
        currentId = newConv.id;
      } catch {
        currentId = 1;
        setActiveConvId(1);
      }
    }

    setInputText("");
    setIsSending(true);

    const tempUserMsg: Message = {
      id: Date.now(),
      conversation_id: currentId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    isAutoScrollPinnedRef.current = true;
    requestAnimationFrame(() => scrollChatToBottom(true));

    try {
      const responseMsg = await api.sendMessage(
        currentId,
        text,
        engineToUse,
        selectedReportId
      );
      setMessages((prev) => [...prev, responseMsg]);
      startTypingAnimation(responseMsg);
      api.listConversations().then(setConversations);
    } catch (err: any) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        conversation_id: currentId,
        role: "assistant",
        content: `Error generating response: ${err.message || "Failed to communicate with provider."}`,
        safety_alerts: ["Provider communication error."],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const toggleSpeakMessage = (id: number, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`\[\]()]/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const openExportModal = (scope: "single" | "all", focusMsg?: Message) => {
    sound.playClick();
    setExportScope(scope);
    if (focusMsg) {
      const [normalized] = normalizeMessagesForExport([focusMsg]);
      setExportFocusMsg(normalized);
    } else {
      setExportFocusMsg(null);
    }
    setShowExportModal(true);
  };

  const handleRunMlPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setMlLoading(true);
    try {
      const res = await api.predictRisk(mlData);
      setMlResult(res);
    } catch (err) {
      console.error("ML error:", err);
    } finally {
      setMlLoading(false);
    }
  };

  const handleSelectBiomarkerPreset = (key: string) => {
    const preset = BIOMARKER_LSTM_PRESETS[key] || BIOMARKER_LSTM_PRESETS.hba1c;
    setSelectedBiomarkerKey(preset.key);
    setCustomLstmSeries([...preset.history]);
  };

  const activeEngine = getEngineProfile(selectedProvider);
  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const normalizedAllMessages = useMemo(
    () => normalizeMessagesForExport(messages),
    [messages]
  );

  const liveLstmForecast = useMemo(
    () => runBiLstmForecast(selectedBiomarkerKey, customLstmSeries),
    [selectedBiomarkerKey, customLstmSeries]
  );

  const filteredConversations = useMemo(() => {
    const q = convSearch.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, convSearch]);

  const filteredPrompts = useMemo(() => {
    const q = promptQuery.trim().toLowerCase();
    const list = CATEGORIZED_PROMPTS.filter((item) => {
      const catOk = activePromptCategory === "All" || item.category === activePromptCategory;
      const textOk =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q);
      return catOk && textOk;
    });
    if (promptRotationSeed === 0 || list.length <= 1) return list;
    const shift = promptRotationSeed % list.length;
    return [...list.slice(shift), ...list.slice(0, shift)];
  }, [activePromptCategory, promptQuery, promptRotationSeed]);

  const latestFollowUps = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant?.follow_up_questions && lastAssistant.follow_up_questions.length > 0) {
      return lastAssistant.follow_up_questions;
    }
    return [
      "Run Bi-LSTM 90-day HbA1c forecast",
      "Explain tTG-IgA 48.2 U/mL vs Total IgA",
      "Prepare doctor visit questions from labs",
    ];
  }, [messages]);

  return (
    <div className="fixed inset-0 flex flex-col bg-surface text-foreground overflow-hidden h-screen max-h-screen">
      <AppHeader />

      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        <AppSidebar />

        {/* Mobile / Tablet Threads Backdrop */}
        {showMobileThreads && (
          <div
            onClick={() => setShowMobileThreads(false)}
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
            aria-hidden="true"
          />
        )}

        {/* Consultations & AI Model Sidebar */}
        <aside
          className={`border-r border-border bg-white dark:bg-[#1a2e38] flex-col shrink-0 h-full min-h-0 max-h-full overflow-hidden transition-all duration-300 ease-in-out ${
            isConsultationsCollapsed
              ? "w-0 p-0 border-none opacity-0 pointer-events-none hidden"
              : "w-72 lg:w-64 xl:w-72 flex"
          } ${
            showMobileThreads
              ? "fixed inset-y-16 left-0 z-40 shadow-2xl !flex !w-72 !opacity-100 !pointer-events-auto"
              : ""
          }`}
        >
          <div className="p-3 border-b border-border space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-foreground">Consultations</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={startNewConversation}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsConsultationsCollapsed(true)}
                  title="Collapse Consultations (Expand GeneWise Clinical Intelligence)"
                  className="hidden lg:inline-flex p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-low transition-colors"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowMobileThreads(false)}
                  aria-label="Close consultations drawer"
                  className="lg:hidden p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-low"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
                placeholder="Search threads..."
                aria-label="Search consultations"
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-border bg-surface-low text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
            {filteredConversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  selectConversation(c.id);
                  setShowMobileThreads(false);
                }}
                className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                  activeConvId === c.id
                    ? "bg-surface-low dark:bg-surface-variant/30 text-primary font-semibold border border-primary/20 shadow-2xs"
                    : "text-foreground hover:bg-surface-low/50"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{c.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-600 transition-opacity"
                  title="Delete consultation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Compact Clinical Dossier Summary inside sidebar to avoid empty void */}
            <div className="mt-2 p-2.5 rounded-xl border border-border/80 bg-surface-low/60 dark:bg-surface-variant/15 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  Active Patient Panel
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                  CMP-14
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Rajesh Kumar (MRN #92041)
              </p>
              <div className="grid grid-cols-3 gap-1 pt-0.5 text-center">
                <div className="rounded-lg bg-white dark:bg-[#1a2e38] px-1.5 py-1 border border-border/60">
                  <span className="block text-[8px] uppercase text-muted-foreground">HbA1c</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-[10px]">6.2%</span>
                </div>
                <div className="rounded-lg bg-white dark:bg-[#1a2e38] px-1.5 py-1 border border-border/60">
                  <span className="block text-[8px] uppercase text-muted-foreground">FPG</span>
                  <span className="font-bold text-foreground text-[10px]">118</span>
                </div>
                <div className="rounded-lg bg-white dark:bg-[#1a2e38] px-1.5 py-1 border border-border/60">
                  <span className="block text-[8px] uppercase text-muted-foreground">tTG-IgA</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-[10px]">48.2</span>
                </div>
              </div>
            </div>

            {/* Interactive Bi-LSTM Temporal Forecaster Card */}
            <div className="px-3 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 to-teal-50/40 dark:from-indigo-950/30 dark:to-teal-950/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1 truncate">
                  <BrainCircuit className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  Bi-LSTM Sequence
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold shrink-0">
                  AUC 0.958
                </span>
              </div>
              <p className="text-[10px] text-indigo-900/80 dark:text-indigo-300/90 leading-snug">
                2-Layer LSTM 90-day biomarker forecasting & attention gates.
              </p>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowLstmModal(true);
                  setShowMobileThreads(false);
                }}
                className="w-full py-1.5 text-center font-semibold text-[11px] rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 transition-colors"
              >
                Open Bi-LSTM Forecaster
              </button>
            </div>

            {/* ML Risk Research Tool Banner */}
            <div className="p-3 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50 dark:bg-teal-950/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1 truncate">
                  <Microscope className="w-3.5 h-3.5 shrink-0 text-primary" /> ML Risk Model
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 font-bold shrink-0">
                  AUC 0.94
                </span>
              </div>
              <p className="text-[10px] text-teal-800/80 dark:text-teal-400 leading-snug">
                Interactive Celiac risk stratification calculator.
              </p>
              <button
                onClick={() => {
                  setShowMlModal(true);
                  setShowMobileThreads(false);
                }}
                className="w-full py-1.5 text-center font-semibold text-[11px] rounded-lg bg-primary text-white hover:bg-primary-container transition-colors"
              >
                Open Research Model
              </button>
            </div>
          </div>
        </aside>

        {/* Main Chat Workspace */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col bg-surface-low/20 overflow-hidden">
          {/* Top Assistant Status & AI Engine Switcher Bar */}
          <div className="shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 border-b border-border bg-white/95 dark:bg-[#1a2e38]/95 backdrop-blur-sm space-y-1.5 sm:space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowMobileThreads(true)}
                  aria-label="Open consultations and clinical models"
                  className="lg:hidden p-2 rounded-xl border border-border bg-surface-low text-foreground hover:bg-surface-container shrink-0 active:scale-95 transition-transform"
                >
                  <PanelLeft className="w-4 h-4" />
                </button>

                {/* Desktop Consultations / Expand Workspace Toggle */}
                <button
                  type="button"
                  onClick={() => setIsConsultationsCollapsed(!isConsultationsCollapsed)}
                  className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-surface-low hover:bg-surface-container text-foreground transition-all text-xs font-semibold shrink-0 cursor-pointer"
                  title={
                    isConsultationsCollapsed
                      ? "Show Consultations sidebar"
                      : "Hide Consultations sidebar (Expand GeneWise Clinical Intelligence)"
                  }
                >
                  {isConsultationsCollapsed ? (
                    <>
                      <PanelLeft className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px]">Consultations</span>
                      <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-full font-bold">
                        {conversations.length}
                      </span>
                    </>
                  ) : (
                    <>
                      <PanelLeftClose className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">Expand View</span>
                    </>
                  )}
                </button>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-teal-700 to-teal-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground leading-tight truncate text-xs sm:text-sm">
                      GeneWise Clinical Intelligence
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSoft();
                        setShowModelModal(true);
                      }}
                      className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25 shrink-0 hover:bg-indigo-500/20 transition-all cursor-pointer"
                      title="Inspect neural architecture, gate activations, and live hyperparameters"
                    >
                      <BrainCircuit className="w-3 h-3" /> {activeEngine.aucLabel}
                      <span className="text-[9px] opacity-75 underline ml-0.5">Blueprint</span>
                    </button>
                  </div>
                  <p className="hidden sm:block text-[10px] text-muted-foreground leading-tight truncate">
                    {activeEngine.architecture} • {activeEngine.latencyLabel} • Evidence-Grounded
                  </p>
                </div>
              </div>

              {/* Provider, Voice, Lab Report & Print/Share Controls */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Link
                  href="/assistant/voice"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white text-[11px] font-semibold hover:opacity-90 shadow-2xs transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <Radio className="w-3.5 h-3.5" />
                  <span className="sm:hidden">Voice Mode</span>
                  <span className="hidden sm:inline">Real-Time Voice Mode</span>
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full hidden xl:inline">
                    13 Indian Languages
                  </span>
                </Link>

                {reports.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-surface-low px-2.5 py-1.5 rounded-lg border border-border">
                    <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />
                    <select
                      aria-label="Attach medical lab report"
                      value={selectedReportId || ""}
                      onChange={(e) =>
                        setSelectedReportId(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="bg-transparent text-[11px] font-medium text-foreground focus:outline-none max-w-[165px] sm:max-w-none"
                    >
                      <option value="">Attach Lab Report (Optional)</option>
                      {reports.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.measurement_count} tests)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-1.5 bg-surface-low px-2.5 py-1.5 rounded-lg border border-border">
                  <Sparkles className="w-3 h-3 text-primary shrink-0" />
                  <select
                    aria-label="Select AI Model Engine"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="bg-transparent text-[11px] font-semibold text-foreground focus:outline-none max-w-[175px] sm:max-w-none"
                  >
                    {AI_ENGINE_PROFILES.map((eng) => (
                      <option key={eng.id} value={eng.id}>
                        {eng.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Export / Print Only / Share */}
                <button
                  type="button"
                  onClick={() => openExportModal(messages.length === 1 ? "single" : "all")}
                  title="Print Message Only, Download PDF, or Share via WhatsApp"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-teal-600/30 bg-teal-50 dark:bg-teal-950/30 text-[11px] font-bold text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-950/50 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Share / PDF</span>
                </button>
              </div>
            </div>

            {/* Interactive Quick AI Engine Pills Strip */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 mr-1">
                AI Model:
              </span>
              {AI_ENGINE_PROFILES.map((eng) => {
                const isSelected = selectedProvider === eng.id;
                const isConfigured =
                  !providerStatus?.providers ||
                  providerStatus.providers[eng.id]?.configured !== false;
                return (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => {
                      sound.playSoft();
                      setSelectedProvider(eng.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 border transition-all ${
                      isSelected
                        ? "bg-teal-700 text-white border-teal-700 shadow-2xs scale-[1.02]"
                        : "bg-surface-low/80 border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                    }`}
                  >
                    {eng.isLstm ? (
                      <BrainCircuit className="w-3 h-3" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>{eng.shortName}</span>
                    {!isConfigured && (
                      <span className="text-[9px] opacity-75">(Local)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Messages Stream or Enhanced Discovery Hero */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4"
            style={{ overflowAnchor: "none" }}
          >
            {isLoading && messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="max-w-5xl w-full mx-auto space-y-5 py-2 animate-fade-in-up">
                {/* Hero Card */}
                <div className="rounded-2xl border border-border bg-gradient-to-br from-white via-teal-50/40 to-indigo-50/40 dark:from-[#1a2e38] dark:via-[#14262f] dark:to-[#182338] p-5 sm:p-6 shadow-xs text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-700 to-indigo-600 text-white flex items-center justify-center shadow-sm mx-auto">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                      GeneWise AI Medical Assistant
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                      Ask questions about medical terms, lab measurements, or launch a{" "}
                      <strong className="text-indigo-700 dark:text-indigo-300">
                        Bi-LSTM longitudinal sequence forecast
                      </strong>{" "}
                      backed by PubMed clinical evidence.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setShowPatientDossier(true);
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs group"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Patient: Rajesh Kumar • Comprehensive Metabolic Panel Loaded</span>
                      <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-200 group-hover:scale-105 transition-transform">
                        View EMR Panel -&gt;
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setShowLstmModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-800 dark:text-indigo-300 text-[11px] font-bold transition-all"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>Interactive Bi-LSTM Lab Forecaster</span>
                    </button>
                  </div>

                  {/* Patient-Matched Personalized Question Shortcuts */}
                  <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-center gap-1.5 text-[10px]">
                    <span className="font-bold uppercase tracking-wider text-muted-foreground mr-1">
                      Patient Priority Prompts:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendMessage(
                          "Forecast Rajesh Kumar's HbA1c (6.2%) and Glucose (118 mg/dL) with Bi-LSTM over 90 days.",
                          "hybrid_rag_lstm"
                        )
                      }
                      className="px-2.5 py-1 rounded-full bg-white dark:bg-[#14262f] border border-amber-400/50 text-amber-800 dark:text-amber-200 font-semibold hover:border-teal-600 transition-colors"
                    >
                      Bi-LSTM: HbA1c 6.2% + Glucose 118
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendMessage(
                          "Patient has tTG-IgA 48.2 U/mL with normal Total IgA (210 mg/dL). Evaluate biopsy need & Bi-LSTM trend.",
                          "hybrid_rag_lstm"
                        )
                      }
                      className="px-2.5 py-1 rounded-full bg-white dark:bg-[#14262f] border border-rose-400/50 text-rose-800 dark:text-rose-200 font-semibold hover:border-teal-600 transition-colors"
                    >
                      Bi-LSTM: tTG-IgA 48.2 U/mL
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendMessage(
                          "Forecast ApoB 112 mg/dL trajectory with Bi-LSTM and check AHA prevention threshold.",
                          "lstm_temporal"
                        )
                      }
                      className="px-2.5 py-1 rounded-full bg-white dark:bg-[#14262f] border border-indigo-400/50 text-indigo-800 dark:text-indigo-200 font-semibold hover:border-teal-600 transition-colors"
                    >
                      Bi-LSTM: ApoB 112 mg/dL
                    </button>
                  </div>
                </div>

                {/* Categorized & Searchable Educational Inquiries */}
                <div className="w-full space-y-3 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        SUGGESTED EDUCATIONAL INQUIRIES
                      </span>
                      <span className="text-[11px] text-primary font-semibold">
                        Click any prompt to launch consult • Auto-selects optimal AI/Bi-LSTM engine
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={promptQuery}
                          onChange={(e) => setPromptQuery(e.target.value)}
                          placeholder="Filter questions..."
                          aria-label="Filter suggested questions"
                          className="pl-8 pr-3 py-1.5 rounded-full border border-border bg-white dark:bg-[#1a2e38] text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-44 sm:w-52"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playSoft();
                          setPromptRotationSeed((s) => s + 2);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-border bg-white dark:bg-[#1a2e38] text-[11px] font-semibold text-foreground hover:border-primary/50 transition-colors"
                        title="Rotate suggested questions"
                      >
                        <Shuffle className="w-3 h-3 text-primary" />
                        <span>Shuffle</span>
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap py-0.5">
                    {PROMPT_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          sound.playSoft();
                          setActivePromptCategory(cat);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all ${
                          activePromptCategory === cat
                            ? "bg-teal-700 text-white shadow-2xs scale-[1.03]"
                            : "bg-white dark:bg-[#1a2e38] border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {filteredPrompts.map((item) => {
                      const usesLstm =
                        item.recommendedEngine === "lstm_temporal" ||
                        item.recommendedEngine === "hybrid_rag_lstm";
                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() =>
                            handleSendMessage(item.prompt, item.recommendedEngine)
                          }
                          className="p-3.5 text-xs text-left rounded-xl border border-border bg-white dark:bg-[#1a2e38] hover:bg-surface-low hover:border-primary/50 transition-all duration-200 text-foreground flex flex-col justify-between group shadow-2xs hover:shadow-sm space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              {item.category}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                                usesLstm
                                  ? "bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
                                  : "bg-primary/10 text-primary border-primary/20"
                              }`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-xs group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-snug">
                              {item.prompt}
                            </p>
                          </div>
                          <div className="flex items-center justify-between w-full text-[10px] text-primary font-semibold pt-1 border-t border-border/40">
                            <span className="text-muted-foreground">
                              {usesLstm ? "Activates Bi-LSTM" : "PubMed Verified"}
                            </span>
                            <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              Consult <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === "user";
                const traceOpen = Boolean(expandedTraces[m.id]);
                const isTypingThisMsg = !isUser && typingMessageId === m.id;
                const displayContent = isTypingThisMsg
                  ? stabilizeStreamingMarkdown(m.content.slice(0, Math.max(1, typedLength)))
                  : m.content;
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2 sm:gap-3 w-full max-w-5xl mx-auto ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-teal-700 to-teal-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    )}

                    <div
                      className={`relative rounded-2xl p-3 sm:p-4 text-xs space-y-2.5 sm:space-y-3 shadow-xs transition-all duration-300 ${
                        isUser
                          ? "bg-primary text-white rounded-tr-none max-w-[88%] sm:max-w-[72%]"
                          : isTypingThisMsg
                          ? "flex-1 min-w-0 max-w-full sm:max-w-[90%] bg-white dark:bg-[#1a2e38] border border-teal-500 text-foreground rounded-tl-none shadow-lg shadow-teal-500/10 writing-active-border"
                          : "flex-1 min-w-0 max-w-full sm:max-w-[90%] bg-white dark:bg-[#1a2e38] border border-border text-foreground rounded-tl-none"
                      }`}
                    >
                      {/* Top Animated Writing Scanner Bar */}
                      {isTypingThisMsg && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl overflow-hidden pointer-events-none">
                          <div className="w-full h-full writing-scan-line" />
                        </div>
                      )}

                      {/* Model Telemetry Header for Assistant Reply */}
                      {!isUser && (m.model_used || m.confidence_score || isTypingThisMsg) && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50 text-[10px]">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                sound.playSoft();
                                setShowModelModal(true);
                              }}
                              className="inline-flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-500/20 transition-colors cursor-pointer"
                              title="Click to inspect model architecture and gate attributions"
                            >
                              <BrainCircuit className="w-3 h-3" />
                              {m.model_used || activeEngine.name}
                            </button>
                            {m.neural_telemetry && (
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playSoft();
                                  setShowModelModal(true);
                                }}
                                className="hidden sm:inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground hover:text-foreground bg-surface-low border border-border/80 px-1.5 py-0.5 rounded-md cursor-pointer transition-colors"
                                title="Click to view full neural telemetry"
                              >
                                <Zap className="w-2.5 h-2.5 text-amber-500" />
                                <span>{m.neural_telemetry.latency_ms}ms</span>
                                <span>•</span>
                                <span>{m.neural_telemetry.tokens_per_second} t/s</span>
                              </button>
                            )}
                            {isTypingThisMsg && (
                              <div className="inline-flex items-center gap-1 bg-surface-low dark:bg-surface-variant/30 border border-teal-500/30 rounded-full px-2 py-0.5 shadow-2xs">
                                <span className="inline-flex items-center gap-1 font-mono font-bold text-teal-700 dark:text-teal-300">
                                  <PenTool className="w-3 h-3 text-teal-600 dark:text-teal-400 animate-bounce" />
                                  Writing{" "}
                                  {String(
                                    Math.min(
                                      99,
                                      Math.round((typedLength / Math.max(1, m.content.length)) * 100)
                                    )
                                  ).padStart(2, "0")}
                                  %
                                </span>
                                <span className="text-border">|</span>
                                <button
                                  type="button"
                                  onClick={() => setTypingSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1))}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded hover:bg-surface-container font-mono font-bold text-teal-800 dark:text-teal-200 transition-colors"
                                  title="Change typing speed: 1x (Natural), 2x (Fast), 3x (Hyper)"
                                >
                                  <Zap className="w-2.5 h-2.5 text-amber-500" />
                                  <span>{typingSpeed}x</span>
                                </button>
                                <span className="text-border">|</span>
                                <button
                                  type="button"
                                  onClick={() => setIsTypingPaused((prev) => !prev)}
                                  className="p-0.5 rounded hover:bg-surface-container text-muted-foreground hover:text-foreground transition-colors"
                                  title={isTypingPaused ? "Resume writing" : "Pause writing"}
                                >
                                  {isTypingPaused ? (
                                    <Play className="w-2.5 h-2.5 text-teal-600" />
                                  ) : (
                                    <Pause className="w-2.5 h-2.5" />
                                  )}
                                </button>
                                <span className="text-border">|</span>
                                <button
                                  type="button"
                                  onClick={() => setTypewriterSoundEnabled((prev) => !prev)}
                                  className="p-0.5 rounded hover:bg-surface-container text-muted-foreground hover:text-foreground transition-colors"
                                  title={typewriterSoundEnabled ? "Mute typewriter sound" : "Enable tactile typewriter keystroke clicks"}
                                >
                                  {typewriterSoundEnabled ? (
                                    <Volume2 className="w-2.5 h-2.5 text-teal-600 animate-pulse" />
                                  ) : (
                                    <VolumeX className="w-2.5 h-2.5" />
                                  )}
                                </button>
                                <span className="text-border">|</span>
                                <button
                                  type="button"
                                  onClick={stopTypingAnimation}
                                  className="inline-flex items-center gap-1 font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
                                  title="Skip writing animation and show full message immediately"
                                >
                                  <FastForward className="w-2.5 h-2.5" />
                                  <span>Show Full</span>
                                </button>
                              </div>
                            )}
                          </div>
                          {typeof m.confidence_score === "number" && (
                            <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              Calibrated Confidence: {Math.round(m.confidence_score * 100)}%
                            </span>
                          )}
                        </div>
                      )}

                      {/* Safety Alerts */}
                      {m.safety_alerts && m.safety_alerts.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-900 dark:text-red-200 flex items-start gap-2 font-medium">
                          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <span>{m.safety_alerts.join(" • ")}</span>
                        </div>
                      )}

                      {/* Body */}
                      {isUser ? (
                        <div className="whitespace-pre-line leading-relaxed font-medium">{m.content}</div>
                      ) : (
                        <div className="relative">
                          <ClinicalMarkdown content={displayContent} isStreaming={isTypingThisMsg} />
                          {isTypingThisMsg && (
                            <div
                              data-testid="ai-typing-cursor"
                              className="mt-3 pt-2 border-t border-teal-500/20 flex flex-wrap items-center justify-between gap-2 text-[10px]"
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                                  <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                                </div>
                                <span className="font-semibold text-teal-800 dark:text-teal-200">
                                  GeneWise AI composing clinical answer...
                                </span>
                                <span className="font-mono text-muted-foreground text-[9px]">
                                  (~{Math.max(1, displayContent.split(/\s+/).filter(Boolean).length)} words drafted)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={stopTypingAnimation}
                                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                                >
                                  <span>Instant Reveal</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Inline Bi-LSTM Sequence Trajectory Card (reveals smoothly on stream completion) */}
                      {!isUser && !isTypingThisMsg && m.lstm_forecast && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <BiLstmTrajectoryCard forecast={m.lstm_forecast} compact />
                        </div>
                      )}

                      {/* Collapsible Clinical Reasoning Trace */}
                      {!isUser && !isTypingThisMsg && m.reasoning_trace && m.reasoning_trace.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl border border-border/70 bg-surface-low/60 dark:bg-surface-variant/15 overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTraces((prev) => ({ ...prev, [m.id]: !traceOpen }))
                            }
                            className="w-full px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-foreground hover:bg-surface-low transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <SlidersHorizontal className="w-3 h-3 text-primary" />
                              AI Reasoning & Verification Trace ({m.reasoning_trace.length} steps)
                            </span>
                            {traceOpen ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {traceOpen && (
                            <ul className="px-3 pb-2.5 pt-1 space-y-1 text-[10px] text-muted-foreground border-t border-border/50">
                              {m.reasoning_trace.map((step, i) => (
                                <li key={i} className="leading-snug">
                                  {step}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Cited Sources Grounding */}
                      {!isTypingThisMsg && m.sources && m.sources.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2 border-t border-border/60 space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Peer-Reviewed Citations & Evidence
                          </p>
                          <div className="space-y-1">
                            {m.sources.map((src, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-lg bg-surface-low/50 dark:bg-surface-variant/20 border border-border/50 text-[11px] flex items-center justify-between gap-2"
                              >
                                <div>
                                  <p className="font-semibold text-foreground">{src.title}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {src.journal && `${src.journal} • `}
                                    {src.year && `${src.year} • `}
                                    {src.pmid && `PMID: ${src.pmid}`}
                                  </p>
                                </div>
                                {src.url && (
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 text-primary hover:underline flex items-center gap-1 text-[10px] shrink-0"
                                  >
                                    <span>PubMed</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Follow-up Question Suggestions on Assistant Reply */}
                      {!isUser && !isTypingThisMsg && m.follow_up_questions && m.follow_up_questions.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2 border-t border-border/40 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Suggested Follow-Up Questions
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {m.follow_up_questions.map((fq) => (
                              <button
                                key={fq}
                                type="button"
                                onClick={() =>
                                  handleSendMessage(
                                    fq,
                                    fq.toLowerCase().includes("lstm") ? "hybrid_rag_lstm" : undefined
                                  )
                                }
                                className="text-left px-2.5 py-1 rounded-full bg-surface-low hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-border hover:border-teal-600/40 text-[10px] font-semibold text-foreground transition-colors"
                              >
                                + {fq}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Per-Message Action Bar: Print Only, Download PDF, WhatsApp/Social Share, Copy & Listen */}
                      <div
                        className={`flex flex-wrap items-center justify-between gap-2 pt-2 text-[10px] border-t ${
                          isUser
                            ? "border-white/20 text-white/90"
                            : "border-border/50 text-muted-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {isUser ? "Query Message" : "Grounded Evidence"}
                        </span>

                        <div className="flex flex-wrap items-center gap-2.5">
                          {!isUser && (
                            <button
                              type="button"
                              onClick={() => toggleSpeakMessage(m.id, m.content)}
                              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                              title="Text-to-speech audio readout"
                            >
                              {speakingId === m.id ? (
                                <>
                                  <VolumeX className="w-3 h-3 text-primary animate-pulse" />
                                  <span className="text-primary font-bold">Stop Audio</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3" />
                                  <span>Listen</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => copyToClipboard(m.content, m.id)}
                            className={`inline-flex items-center gap-1 transition-colors ${
                              isUser ? "hover:text-white" : "hover:text-foreground"
                            }`}
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => openExportModal("single", m)}
                            className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                              isUser
                                ? "hover:text-white"
                                : "text-teal-700 dark:text-teal-300 hover:underline"
                            }`}
                            title="Print this single message only, download PDF, or share on WhatsApp/Social"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print Msg Only</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openExportModal("single", m)}
                            className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                              isUser
                                ? "hover:text-white"
                                : "text-indigo-700 dark:text-indigo-300 hover:underline"
                            }`}
                            title="Download single message PDF or share to WhatsApp & social media"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>PDF & Share</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-secondary text-white flex items-center justify-center shrink-0 mt-0.5">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {isSending && (
              <div
                data-testid="assistant-thinking-indicator"
                className="flex items-start gap-3 w-full max-w-5xl mx-auto"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-700 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a2e38] border border-teal-500/30 shadow-xs space-y-2 min-w-[260px]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0" />
                    <span>
                      {[
                        activeEngine.isLstm
                          ? `${activeEngine.shortName} encoding 5-visit biomarker sequence...`
                          : "GeneWise Supervisor routing query & checking reference ranges...",
                        "Retrieving peer-reviewed PubMed & ClinVar evidence...",
                        "Generating structured clinical literacy response...",
                      ][thinkingStage]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5 h-4">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      GeneWise AI typing...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="shrink-0 p-2.5 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-border bg-white dark:bg-[#1a2e38] space-y-1.5 sm:space-y-2">
            {/* Active Follow-Up Prompt Strip (when conversation is underway) */}
            {messages.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 w-full max-w-5xl mx-auto max-h-[4.25rem] overflow-y-auto sm:max-h-none sm:overflow-visible">
                <span className="text-[10px] font-bold text-primary shrink-0 uppercase tracking-wider">
                  Quick Ask:
                </span>
                {latestFollowUps.map((qText) => (
                  <button
                    key={qText}
                    type="button"
                    onClick={() =>
                      handleSendMessage(
                        qText,
                        qText.toLowerCase().includes("lstm") ? "hybrid_rag_lstm" : undefined
                      )
                    }
                    className="px-2.5 py-1 rounded-full bg-surface-low hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-border text-[10px] font-semibold text-foreground max-w-[260px] sm:max-w-xs truncate transition-colors"
                    title={qText}
                  >
                    {qText}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Action Clinical Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-0.5 text-[11px] w-full max-w-5xl mx-auto">
              {reports.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedReportId(reports[0]?.id)}
                  className={`px-2.5 py-1 rounded-full border transition-all inline-flex items-center gap-1.5 shrink-0 ${
                    selectedReportId
                      ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                      : "bg-surface-low border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Paperclip className="w-3 h-3" />
                  <span>
                    {selectedReportId
                      ? `Attached: ${reports.find((r) => r.id === selectedReportId)?.title.slice(0, 18)}...`
                      : "Attach Rajesh Kumar CMP"}
                  </span>
                </button>
              )}
              <Link
                href="/assistant/voice"
                className="px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-500/20 transition-all inline-flex items-center gap-1.5 shrink-0"
              >
                <Radio className="w-3 h-3 animate-pulse" />
                <span>13 Indian Languages Voice Mode</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowLstmModal(true);
                }}
                className="px-2.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-500/20 transition-all inline-flex items-center gap-1.5 shrink-0"
              >
                <BrainCircuit className="w-3 h-3" />
                <span>Bi-LSTM Forecaster (AUC 0.958)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMlModal(true)}
                className="px-2.5 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-medium hover:bg-teal-500/20 transition-all inline-flex items-center gap-1.5 shrink-0"
              >
                <Microscope className="w-3 h-3 text-primary" />
                <span>ML Celiac Risk Model (AUC 0.94)</span>
              </button>
              <button
                type="button"
                onClick={() => openExportModal("single")}
                className="px-2.5 py-1 rounded-full border border-border bg-surface-low text-foreground font-semibold hover:border-teal-600/40 transition-all inline-flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3 h-3 text-primary" />
                <span>Export PDF / Share</span>
              </button>
            </div>

            {isListening && (
              <div className="flex items-center justify-center gap-1 py-1.5 px-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-500 font-semibold w-full max-w-5xl mx-auto">
                <span>Listening to your medical question...</span>
                <div className="flex items-center gap-0.5 ml-2 h-4">
                  <div className="w-1 bg-red-500 rounded-full animate-wave [animation-delay:0ms]"></div>
                  <div className="w-1 bg-red-500 rounded-full animate-wave [animation-delay:150ms]"></div>
                  <div className="w-1 bg-red-500 rounded-full animate-wave [animation-delay:300ms]"></div>
                  <div className="w-1 bg-red-500 rounded-full animate-wave [animation-delay:450ms]"></div>
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 w-full max-w-5xl mx-auto"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about laboratory findings, symptoms, or medical literature..."
                className="flex-1 min-w-0 px-3.5 sm:px-4 py-2.5 text-[15px] sm:text-xs rounded-xl border border-border bg-surface-low dark:bg-surface-variant/20 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />

              <button
                type="button"
                onClick={toggleVoiceInput}
                title={
                  isListening
                    ? "Listening... click to stop recording"
                    : "Voice dictation (Speech-to-Text)"
                }
                className={`smooth-button p-3 sm:p-2.5 rounded-xl border transition-all shrink-0 ${
                  isListening
                    ? "bg-red-500 text-white border-red-600 animate-pulse shadow-sm"
                    : "bg-surface-low border-border text-muted-foreground hover:text-foreground hover:bg-surface-container"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="smooth-button p-3 sm:p-2.5 rounded-xl bg-primary text-white hover:bg-primary-container transition-all shadow-xs disabled:opacity-50 shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* Message-Only Print, PDF Download & Social Media Share Modal */}
      <ExportPrintShareModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={activeConversation?.title || "Clinical Health Consultation"}
        patientName="Rajesh Kumar (MRN #92041)"
        allMessages={normalizedAllMessages}
        focusedMessage={exportFocusMsg}
        initialScope={exportScope}
      />

      {/* Interactive Bi-LSTM Longitudinal Sequence Forecaster Modal */}
      {showLstmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bi-LSTM Longitudinal Biomarker Sequence Forecaster"
          onClick={() => setShowLstmModal(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#14262f] p-6 border border-border shadow-2xl space-y-4 my-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-600 text-white">
                  <BrainCircuit className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Bi-LSTM Temporal Biomarker Forecaster
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    2-Layer Bidirectional LSTM (128 hidden units) • Conformal 95% horizon intervals
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLstmModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-low"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Select Biomarker Trajectory Sequence
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(BIOMARKER_LSTM_PRESETS).map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => handleSelectBiomarkerPreset(preset.key)}
                      className={`px-3 py-1 rounded-full border text-[11px] font-semibold transition-all ${
                        selectedBiomarkerKey === preset.key
                          ? "bg-indigo-700 text-white border-indigo-700 shadow-2xs"
                          : "bg-surface-low border-border text-foreground hover:border-indigo-500/50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable 5-Visit Sequence Strip */}
              <div className="p-3 rounded-xl bg-surface-low/60 border border-border space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  5-Visit Input Sequence ({BIOMARKER_LSTM_PRESETS[selectedBiomarkerKey]?.unit})
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {customLstmSeries.map((val, idx) => (
                    <div key={idx}>
                      <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                        {BIOMARKER_LSTM_PRESETS[selectedBiomarkerKey]?.visitLabels[idx]?.replace(
                          /\s*\([^)]*\)/,
                          ""
                        ) || `V${idx + 1}`}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={val}
                        onChange={(e) => {
                          const parsed = parseFloat(e.target.value);
                          setCustomLstmSeries((prev) =>
                            prev.map((oldVal, i) =>
                              i === idx ? (Number.isFinite(parsed) ? parsed : 0) : oldVal
                            )
                          );
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-border bg-white dark:bg-[#1a2e38] text-xs font-mono font-bold text-foreground"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <BiLstmTrajectoryCard forecast={liveLstmForecast} />

              <p className="text-[11px] text-muted-foreground leading-relaxed bg-surface-low/50 p-2.5 rounded-xl border border-border">
                {liveLstmForecast.clinicalSummary}
              </p>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowLstmModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-surface-low"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const summaryPrompt = `Analyze Bi-LSTM trajectory for ${liveLstmForecast.biomarkerLabel}: sequence [${customLstmSeries.join(", ")}] ${liveLstmForecast.unit}, projected +30d ${liveLstmForecast.projected30d} and +90d ${liveLstmForecast.projected90d} ${liveLstmForecast.unit}.`;
                    setShowLstmModal(false);
                    handleSendMessage(summaryPrompt, "hybrid_rag_lstm");
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Trajectory to Hybrid RAG+LSTM AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ML Risk Model Calculator Modal */}
      {showMlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1a2e38] p-6 border border-border shadow-2xl space-y-4 my-8 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-primary" /> Celiac Disease Risk Stratification Model
                </h3>
                <p className="text-xs text-muted-foreground">
                  GradientBoostingClassifier trained on 2,206 clinical & serology records (ROC-AUC: 0.9424)
                </p>
              </div>
              <button
                onClick={() => setShowMlModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            <SafetyNotice
              type="research_warning"
              message="This mathematical model provides statistical risk estimation based on training cohort distributions. It is NOT an endoscopic diagnosis."
            />

            <form onSubmit={handleRunMlPrediction} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={mlData.age}
                    onChange={(e) => setMlData({ ...mlData, age: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20"
                  />
                </div>
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Gender</label>
                  <select
                    value={mlData.gender}
                    onChange={(e) => setMlData({ ...mlData, gender: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Diabetes Mellitus</label>
                  <select
                    value={mlData.diabetes}
                    onChange={(e) => setMlData({ ...mlData, diabetes: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes (Type 1 or 2)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-low/50 dark:bg-surface-variant/20 border border-border space-y-2">
                <span className="font-bold text-[11px] text-primary uppercase">
                  Immunoglobulin Serology Markers (g/L)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Serum IgA (Ref: 0.8 - 3.0 g/L)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={mlData.iga}
                      onChange={(e) => setMlData({ ...mlData, iga: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-[#1a2e38]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Serum IgG (Ref: 7.0 - 16.0 g/L)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={mlData.igg}
                      onChange={(e) => setMlData({ ...mlData, igg: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-[#1a2e38]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Serum IgM (Ref: 0.4 - 2.3 g/L)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={mlData.igm}
                      onChange={(e) => setMlData({ ...mlData, igm: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-[#1a2e38]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Diarrhea</label>
                  <select
                    value={mlData.diarrhoea}
                    onChange={(e) => setMlData({ ...mlData, diarrhoea: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20"
                  >
                    <option value="no">None</option>
                    <option value="inflammatory">Inflammatory</option>
                    <option value="fatty">Fatty / Steatorrhea</option>
                    <option value="watery">Watery</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Abdominal Pain</label>
                  <select
                    value={mlData.abdominal_pain}
                    onChange={(e) => setMlData({ ...mlData, abdominal_pain: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Weight Loss</label>
                  <select
                    value={mlData.weight_loss}
                    onChange={(e) => setMlData({ ...mlData, weight_loss: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Sticky Stool</label>
                  <select
                    value={mlData.sticky_stool}
                    onChange={(e) => setMlData({ ...mlData, sticky_stool: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-surface-variant/20"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={mlLoading}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container transition-all flex items-center gap-2"
                >
                  {mlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Microscope className="w-4 h-4" />}
                  <span>Calculate Risk Score</span>
                </button>
              </div>
            </form>

            {mlResult && (
              <div className="p-4 rounded-xl border border-border bg-surface-low/50 dark:bg-surface-variant/20 space-y-3 animate-in fade-in text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Model Estimation Result
                    </span>
                    <h4 className="text-base font-bold text-foreground">
                      {mlResult.risk_level} ({(mlResult.estimated_risk_probability * 100).toFixed(1)}%)
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground">95% Confidence Interval:</span>
                    <p className="font-mono font-bold text-primary">
                      [{(mlResult.confidence_interval[0] * 100).toFixed(1)}% -{" "}
                      {(mlResult.confidence_interval[1] * 100).toFixed(1)}%]
                    </p>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-foreground">Key Contributing Factors:</span>
                  <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-0.5">
                    {mlResult.contributing_factors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-semibold text-foreground">Clinical Recommendations:</span>
                  <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-0.5">
                    {mlResult.recommended_clinical_followup.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Patient Dossier Modal: Rajesh Kumar */}
      {showPatientDossier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#14262f] rounded-2xl border border-border shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <Activity className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">
                    Patient Dossier: Rajesh Kumar (MRN #92041)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    48Y Male • BMI 27.4 • Vitals: BP 122/78 mmHg • HR 72 bpm • SpO2 98.4%
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPatientDossier(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-surface-low"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Active Laboratory Serum & Antibody Readings
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] text-muted-foreground font-semibold block">Fasting Glucose</span>
                  <span className="text-sm font-extrabold text-amber-900 dark:text-amber-200">118 mg/dL</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-0.5">Elevated (Pre-DM)</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] text-muted-foreground font-semibold block">HbA1c Glycated</span>
                  <span className="text-sm font-extrabold text-amber-900 dark:text-amber-200">6.2%</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-0.5">Impaired Glucose</span>
                </div>

                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <span className="text-[10px] text-muted-foreground font-semibold block">tTG-IgA Antibody</span>
                  <span className="text-sm font-extrabold text-red-900 dark:text-red-200">48.2 U/mL</span>
                  <span className="text-[10px] text-red-700 dark:text-red-400 block mt-0.5">Positive (Ref: &lt;10)</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-muted-foreground font-semibold block">Total Serum IgA</span>
                  <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">210 mg/dL</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">Normal (Deficiency Ruled Out)</span>
                </div>

                <div className="p-3 rounded-xl bg-surface-low border border-border">
                  <span className="text-[10px] text-muted-foreground font-semibold block">ApoB (Cardio)</span>
                  <span className="text-sm font-extrabold text-foreground">112 mg/dL</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">Borderline High</span>
                </div>

                <div className="p-3 rounded-xl bg-surface-low border border-border">
                  <span className="text-[10px] text-muted-foreground font-semibold block">eGFR Renal</span>
                  <span className="text-sm font-extrabold text-foreground">88 mL/min</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Preserved Stage 1</span>
                </div>

                <div className="p-3 rounded-xl bg-surface-low border border-border">
                  <span className="text-[10px] text-muted-foreground font-semibold block">ALT Transaminase</span>
                  <span className="text-sm font-extrabold text-foreground">34 U/L</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">Normal</span>
                </div>

                <div className="p-3 rounded-xl bg-surface-low border border-border">
                  <span className="text-[10px] text-muted-foreground font-semibold block">AST Transaminase</span>
                  <span className="text-sm font-extrabold text-foreground">28 U/L</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">Normal</span>
                </div>
              </div>

              <div className="pt-2 space-y-2 border-t border-border">
                <span className="text-[11px] font-bold text-foreground block">
                  One-Tap Clinical Consultations for Rajesh Kumar:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setShowPatientDossier(false);
                      handleSendMessage(
                        "Analyze Rajesh Kumar's Fasting Glucose (118 mg/dL) and HbA1c (6.2%) with Bi-LSTM forecast. Does he require Metformin intervention per ADA 2024?",
                        "hybrid_rag_lstm"
                      );
                    }}
                    className="p-2.5 rounded-xl border border-border bg-surface-low hover:border-teal-600 text-left transition-all text-xs font-semibold text-foreground flex items-center justify-between"
                  >
                    <span>Analyze Glucose & HbA1c Discordance</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary" />
                  </button>

                  <button
                    onClick={() => {
                      setShowPatientDossier(false);
                      handleSendMessage(
                        "Patient has tTG-IgA 48.2 U/mL with normal Total IgA (210 mg/dL). Does this warrant an immediate endoscopy and duodenal biopsy per ACG guidelines?",
                        "hybrid_rag_lstm"
                      );
                    }}
                    className="p-2.5 rounded-xl border border-border bg-surface-low hover:border-teal-600 text-left transition-all text-xs font-semibold text-foreground flex items-center justify-between"
                  >
                    <span>Evaluate Elevated Celiac tTG-IgA</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPatientDossier(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-2xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Model Architecture & Blueprint Inspector Modal */}
      {showModelModal && (
        <AiModelArchitectureModal
          isOpen={showModelModal}
          onClose={() => setShowModelModal(false)}
          activeProfile={activeEngine}
          telemetry={latestTelemetry}
          onSelectEngine={(id) => {
            setSelectedProvider(id);
            setShowModelModal(false);
          }}
        />
      )}
    </div>
  );
}
