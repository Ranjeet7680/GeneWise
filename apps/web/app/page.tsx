"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MediPredictLogo from "@/components/MediPredictLogo";
import UserAvatar from "@/components/UserAvatar";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronRight,
  Database,
  Dna,
  HelpCircle,
  Info,
  Layers,
  Lock,
  MessageSquare,
  Microscope,
  Network,
  Pause,
  Play,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Stethoscope,
  Trash2,
  Users,
  X,
} from "lucide-react";
import LandingResearchTeamSection from "@/components/LandingResearchTeamSection";
import { useAuth } from "@/lib/auth";
import { sound } from "@/lib/sound";

type InheritanceKey = "recessive" | "dominant" | "xlinked";

interface PedigreePreviewNode {
  id: string;
  label: string;
  role: string;
  genotype: string;
  shape: "square" | "circle";
  status: "affected" | "carrier" | "unaffected";
  note: string;
}

interface InheritanceModelConfig {
  key: InheritanceKey;
  shortLabel: string;
  title: string;
  locus: string;
  ratio: string;
  matchScore: string;
  defaultPenetrance: number;
  parents: [PedigreePreviewNode, PedigreePreviewNode];
  offspring: PedigreePreviewNode[];
}

const INHERITANCE_MODELS: Record<InheritanceKey, InheritanceModelConfig> = {
  recessive: {
    key: "recessive",
    shortLabel: "Recessive",
    title: "Autosomal Recessive",
    locus: "CFTR (7q31.2)",
    ratio: "25% Affected • 50% Carrier",
    matchScore: "99.2% MATCH",
    defaultPenetrance: 58,
    parents: [
      {
        id: "I-1",
        label: "I-1",
        role: "Carrier Father",
        genotype: "Aa",
        shape: "square",
        status: "carrier",
        note: "Heterozygous carrier • Asymptomatic baseline with one variant allele",
      },
      {
        id: "I-2",
        label: "I-2",
        role: "Carrier Mother",
        genotype: "Aa",
        shape: "circle",
        status: "carrier",
        note: "Heterozygous carrier • 50% probability of transmitting variant allele",
      },
    ],
    offspring: [
      {
        id: "II-1",
        label: "II-1",
        role: "Carrier",
        genotype: "Aa",
        shape: "circle",
        status: "carrier",
        note: "Inherits single altered allele from I-1 or I-2 • Carrier status",
      },
      {
        id: "II-2",
        label: "II-2",
        role: "Affected",
        genotype: "aa",
        shape: "square",
        status: "affected",
        note: "Homozygous recessive (aa) • ClinVar pathogenic variant segregation",
      },
      {
        id: "II-3",
        label: "II-3",
        role: "Carrier",
        genotype: "Aa",
        shape: "circle",
        status: "carrier",
        note: "Heterozygous carrier • Important for family genetic counseling discussion",
      },
      {
        id: "II-4",
        label: "II-4",
        role: "Unaffected",
        genotype: "AA",
        shape: "square",
        status: "unaffected",
        note: "Biallelic reference sequence • Neither carrier nor phenotypically affected",
      },
    ],
  },
  dominant: {
    key: "dominant",
    shortLabel: "Dominant",
    title: "Autosomal Dominant",
    locus: "LDLR (19p13.2)",
    ratio: "50% Affected • 0% Silent Carrier",
    matchScore: "98.7% MATCH",
    defaultPenetrance: 76,
    parents: [
      {
        id: "I-1",
        label: "I-1",
        role: "Affected Father",
        genotype: "Aa",
        shape: "square",
        status: "affected",
        note: "Single altered dominant allele expresses phenotype across generations",
      },
      {
        id: "I-2",
        label: "I-2",
        role: "Unaffected Mother",
        genotype: "aa",
        shape: "circle",
        status: "unaffected",
        note: "Reference alleles • Baseline negative family locus baseline",
      },
    ],
    offspring: [
      {
        id: "II-1",
        label: "II-1",
        role: "Affected",
        genotype: "Aa",
        shape: "circle",
        status: "affected",
        note: "50% transmission probability • Expressivity varies by penetrance modifiers",
      },
      {
        id: "II-2",
        label: "II-2",
        role: "Unaffected",
        genotype: "aa",
        shape: "square",
        status: "unaffected",
        note: "Inherits reference alleles from both parents • Trait not passed onward",
      },
      {
        id: "II-3",
        label: "II-3",
        role: "Affected",
        genotype: "Aa",
        shape: "square",
        status: "affected",
        note: "Exhibits vertical generation-to-generation autosomal dominant pattern",
      },
      {
        id: "II-4",
        label: "II-4",
        role: "Unaffected",
        genotype: "aa",
        shape: "circle",
        status: "unaffected",
        note: "Reference genotype • Zero Mendelian inheritance likelihood for offspring",
      },
    ],
  },
  xlinked: {
    key: "xlinked",
    shortLabel: "X-Linked",
    title: "X-Linked Recessive",
    locus: "F8 (Xq28)",
    ratio: "50% Sons Affected • 50% Carrier Daughters",
    matchScore: "99.5% MATCH",
    defaultPenetrance: 46,
    parents: [
      {
        id: "I-1",
        label: "I-1",
        role: "Unaffected Father",
        genotype: "XAY",
        shape: "square",
        status: "unaffected",
        note: "Passes Y chromosome to sons and unaffected X chromosome to daughters",
      },
      {
        id: "I-2",
        label: "I-2",
        role: "Carrier Mother",
        genotype: "XAXa",
        shape: "circle",
        status: "carrier",
        note: "Maternal carrier at Xq28 • 50% chance of transmitting altered X allele",
      },
    ],
    offspring: [
      {
        id: "II-1",
        label: "II-1",
        role: "Carrier",
        genotype: "XAXa",
        shape: "circle",
        status: "carrier",
        note: "Carrier daughter • Typically unaffected due to X-chromosome inactivation",
      },
      {
        id: "II-2",
        label: "II-2",
        role: "Affected",
        genotype: "XaY",
        shape: "square",
        status: "affected",
        note: "Hemizygous son inherits maternal Xa allele • Full expression on single X",
      },
      {
        id: "II-3",
        label: "II-3",
        role: "Unaffected",
        genotype: "XAXA",
        shape: "circle",
        status: "unaffected",
        note: "Inherits reference X from both parents • Non-carrier daughter",
      },
      {
        id: "II-4",
        label: "II-4",
        role: "Unaffected",
        genotype: "XAY",
        shape: "square",
        status: "unaffected",
        note: "Inherits reference maternal XA and paternal Y • Unaffected son",
      },
    ],
  },
};

const NAV_SECTION_TAGS = [
  { id: "overview", label: "Platform Overview", href: "#pillars", targetId: "pillars", icon: Layers },
  { id: "journey", label: "How It Works", href: "#journey", targetId: "journey", icon: Sparkles },
  { id: "privacy", label: "Genomic Ethics", href: "#privacy", targetId: "privacy", icon: ShieldCheck },
  { id: "faq", label: "Help & FAQ", href: "#faq", targetId: "faq", icon: HelpCircle },
  { id: "research", label: "Research & Team", href: "#research", targetId: "research", icon: Microscope },
];

const CURATED_LOCI_TICKER = [
  { gene: "CFTR", locus: "7q31.2", condition: "Cystic Fibrosis", href: "/genetics" },
  { gene: "BRCA1", locus: "17q21.31", condition: "HBOC Predisposition", href: "/genetics" },
  { gene: "FBN1", locus: "15q21.1", condition: "Marfan Syndrome", href: "/diseases" },
  { gene: "MTHFR", locus: "1p36.22", condition: "Folate Metabolism", href: "/genetics" },
  { gene: "LDLR", locus: "19p13.2", condition: "Familial Hypercholesterolemia", href: "/diseases" },
  { gene: "HTT", locus: "4p16.3", condition: "Huntington CAG Locus", href: "/diseases" },
  { gene: "F8", locus: "Xq28", condition: "Hemophilia A", href: "/genetics" },
  { gene: "KCNQ1", locus: "11p15.5", condition: "Long QT Syndrome", href: "/diseases" },
  { gene: "ClinVar", locus: "v2.4", condition: "2.4M+ Variant Citations", href: "/data-lineage?source=clinvar" },
  { gene: "Orphanet", locus: "OMIM", condition: "1,428 Curated Disorders", href: "/data-lineage?source=orphanet" },
];

function SectionTagPill({
  index,
  label,
  badge,
  icon: Icon,
  centered = false,
}: {
  index: string;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  centered?: boolean;
}) {
  return (
    <div className={`flex ${centered ? "justify-center" : "justify-start"} mb-3`}>
      <div className="section-tag-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full apple-glass border border-teal-500/25 shadow-xs hover:scale-[1.03] hover:border-teal-500/50 cursor-default group">
        <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white font-mono text-[9px] font-extrabold tracking-tight shadow-2xs">
          {index}
        </span>
        <Icon className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300 transition-transform duration-300 group-hover:rotate-12" />
        <span className="text-[11px] font-extrabold tracking-wider uppercase text-teal-800 dark:text-teal-300">
          {label}
        </span>
        {badge && (
          <span className="hidden sm:inline-flex items-center gap-1 pl-2 ml-0.5 border-l border-teal-500/25 text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function CountUpMetric({
  target,
  decimals = 0,
  prefix = "",
  suffix = "",
  start,
}: {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  start: boolean;
}) {
  const [display, setDisplay] = useState<number>(target);

  useEffect(() => {
    if (!start) return;
    let rafId = 0;
    const duration = 1100;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplay(target * eased);
      if (elapsed < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplay(target);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [start, target]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString("en-US");

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [purgeToast, setPurgeToast] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeSection, setActiveSection] = useState<string>("pillars");
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Interactive Hero Pedigree Simulator
  const [inheritanceMode, setInheritanceMode] = useState<InheritanceKey>("recessive");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("II-2");
  const [penetranceValue, setPenetranceValue] = useState<number>(58);
  const [cardTilt, setCardTilt] = useState<{ rx: number; ry: number; active: boolean }>({
    rx: 0,
    ry: 0,
    active: false,
  });

  // Apple-style Interactive Step Walkthrough
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);
  const [metricsVisible, setMetricsVisible] = useState<boolean>(false);
  const metricsRef = useRef<HTMLDivElement | null>(null);

  const activeModel = INHERITANCE_MODELS[inheritanceMode];
  const allNodes = [...activeModel.parents, ...activeModel.offspring];
  const selectedNode = allNodes.find((n) => n.id === selectedNodeId) || activeModel.offspring[1];

  // Auto-advance step preview like Apple Keynote showcase
  useEffect(() => {
    if (!isAutoCycling) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 5500);
    return () => clearInterval(timer);
  }, [isAutoCycling]);

  // Top scroll progress indicator & scroll-reveal observer
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const sectionIds = ["pillars", "journey", "privacy", "faq", "research"];
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: 0.05 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    const revealElements = Array.from(document.querySelectorAll(".reveal-section"));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealElements.forEach((el) => revealObserver.observe(el));

    const metricsEl = metricsRef.current;
    let metricsObserver: IntersectionObserver | null = null;
    if (metricsEl) {
      metricsObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setMetricsVisible(true);
            metricsObserver?.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      metricsObserver.observe(metricsEl);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      sectionObserver.disconnect();
      revealObserver.disconnect();
      metricsObserver?.disconnect();
    };
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    sound.playSoft();
    setActiveSection(targetId);
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleModeSwitch = (mode: InheritanceKey) => {
    sound.playSoft();
    setInheritanceMode(mode);
    setPenetranceValue(INHERITANCE_MODELS[mode].defaultPenetrance);
    setSelectedNodeId("II-2");
  };

  const handleHeroCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCardTilt({
      rx: Number((-y * 5.5).toFixed(2)),
      ry: Number((x * 6.5).toFixed(2)),
      active: true,
    });
  };

  const handleFastPurge = () => {
    sound.playSuccess();
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      setPurgeToast(true);
      setTimeout(() => setPurgeToast(false), 4500);
    }
  };

  const getPenetranceLabel = (val: number) => {
    if (val < 35) return { text: "Minimal Baseline (~" + val + "%)", color: "text-emerald-600 dark:text-emerald-400" };
    if (val < 70) return { text: "Moderate / Controlled (" + val + "%)", color: "text-teal-700 dark:text-teal-300" };
    return { text: "Elevated Penetrance (" + val + "%)", color: "text-rose-600 dark:text-rose-400" };
  };

  const currentPenetrance = getPenetranceLabel(penetranceValue);

  const renderPedigreeSymbol = (node: PedigreePreviewNode, compact = false) => {
    const size = compact ? "w-7 h-7" : "w-9 h-9";
    const textSize = compact ? "text-[8px]" : "text-[9px]";
    const isCircle = node.shape === "circle";
    const isSelected = selectedNodeId === node.id;

    return (
      <button
        key={node.id}
        type="button"
        onClick={() => {
          sound.playSoft();
          setSelectedNodeId(node.id);
        }}
        className="flex flex-col items-center group focus:outline-none"
      >
        <div
          className={`${size} ${
            isCircle ? "rounded-full" : "rounded-md"
          } border-2 transition-all duration-300 flex items-center justify-center relative overflow-hidden ${
            node.status === "affected"
              ? "border-teal-900 dark:border-teal-300 bg-gradient-to-br from-teal-700 to-teal-900 dark:from-teal-400 dark:to-teal-600 text-white shadow-md"
              : "border-teal-800 dark:border-teal-400 bg-white dark:bg-[#14262f] text-foreground shadow-xs"
          } ${
            isSelected
              ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-[#0c181d] scale-110 shadow-lg"
              : "group-hover:scale-[1.08] group-hover:border-emerald-500"
          }`}
        >
          {node.status === "carrier" && (
            <div
              className={`h-full w-1/2 bg-gradient-to-b from-teal-600/75 to-emerald-600/75 absolute left-0 top-0`}
            />
          )}
          <span className={`${textSize} font-mono font-bold z-10`}>{node.label}</span>
        </div>
        <span
          className={`${
            compact ? "text-[8px]" : "text-[9px]"
          } font-mono mt-1 transition-colors ${
            isSelected
              ? "text-teal-800 dark:text-teal-300 font-extrabold"
              : node.status === "affected"
              ? "text-teal-700 dark:text-teal-300 font-bold"
              : "text-muted-foreground"
          }`}
        >
          {node.role}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4fbf9] dark:bg-[#091419] text-foreground font-sans antialiased selection:bg-teal-500/25 selection:text-teal-900 dark:selection:text-teal-200 relative overflow-x-clip">
      {/* Ambient Atmospheric Aurora Layer (Properly Visible Above Base Canvas) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 left-[18%] w-[560px] h-[560px] bg-gradient-to-tr from-teal-400/25 via-emerald-300/20 to-cyan-200/15 rounded-full blur-[120px] animate-apple-orb-1" />
        <div className="absolute top-32 -right-12 w-[520px] h-[520px] bg-gradient-to-bl from-cyan-400/20 via-teal-500/15 to-transparent rounded-full blur-[130px] animate-apple-orb-2" />
        <div className="absolute top-[740px] left-[28%] w-[640px] h-[640px] bg-gradient-to-tr from-emerald-400/15 via-teal-400/10 to-transparent rounded-full blur-[150px] animate-orb-drift" />
        <div className="absolute inset-0 hero-grid-pattern opacity-80" />
      </div>

      {/* Top Header / Apple-style Frosted Glass Navigation Bar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-white/80 dark:bg-[#0c181d]/85 border-b border-teal-500/10 dark:border-white/[0.08] transition-all shadow-[0_4px_20px_rgba(0,99,94,0.04)]">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand */}
          <MediPredictLogo
            href="/"
            size="md"
            brand="genewise"
            showSubtitle={true}
          />

          {/* Center: Animated Frosted Section Tag Capsule Dock */}
          <nav
            aria-label="Landing sections"
            className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-slate-100/85 dark:bg-[#13252d]/85 border border-teal-500/15 backdrop-blur-xl shadow-inner text-xs font-semibold"
          >
            {NAV_SECTION_TAGS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.targetId;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.targetId)}
                  className={`section-tag-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white font-bold shadow-md scale-[1.03]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/90 dark:hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-200" : "text-teal-600 dark:text-teal-400"}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse ml-0.5" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right: User / Launch App Button */}
          <div className="flex items-center gap-3">
            <Link
              href={isAuthenticated ? "/settings/profile" : "/login"}
              title={user ? `${user.full_name} · Profile & Brand Settings` : "Sign In"}
              className="hidden sm:flex items-center gap-2 group"
            >
              <UserAvatar
                name={user?.full_name || "Dr. E. Vance"}
                avatarUrl={user?.avatar_url || "/images/doctor-geneticist.jpg"}
                avatarColor={user?.avatar_color}
                size="sm"
                showOnlineDot={true}
              />
            </Link>

            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              onClick={() => sound.playClick()}
              className="apple-sheen-box group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#004d47] to-[#00635e] hover:from-[#003833] hover:to-[#004d47] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <span>{isAuthenticated ? "Open Workspace" : "Launch App"}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Tablet / Mobile Compact Section Tag Switcher Strip */}
        <div className="lg:hidden border-t border-teal-500/10 bg-white/70 dark:bg-[#0c181d]/75 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_SECTION_TAGS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.targetId;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.targetId)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white shadow-xs"
                      : "bg-surface-low/80 text-muted-foreground border border-border"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Scroll Progress Track */}
        <div className="h-[2px] w-full bg-transparent overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-600 via-emerald-400 to-cyan-500 transition-[width] duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </header>

      {/* Hero Section with Apple Cinematic Atmosphere */}
      <section className="relative z-10 overflow-hidden pt-12 pb-16 lg:py-22 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              {/* Upgraded Interactive Hero Section Tag */}
              <div className="animate-fade-in-up stagger-1 flex flex-wrap items-center gap-2">
                <a
                  href="#privacy"
                  onClick={(e) => scrollToSection(e, "privacy")}
                  className="section-tag-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full apple-glass text-[11px] font-bold tracking-wide uppercase shadow-xs border border-teal-500/30 hover:scale-[1.03] hover:border-teal-500/60"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
                  </span>
                  <span className="bg-gradient-to-r from-teal-800 via-emerald-700 to-teal-700 dark:from-teal-300 dark:to-emerald-300 bg-clip-text text-transparent">
                    EDUCATIONAL PLATFORM • PRIVACY-PRESERVING HEALTH TECH
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono font-extrabold">
                    <Lock className="w-2.5 h-2.5" /> AES-256
                  </span>
                </a>
              </div>

              {/* Cinematic Apple-Style Animated Gradient Headline */}
              <h1 className="animate-fade-in-up stagger-2 text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-[#0a2729] dark:text-[#e4f7f5] leading-[1.08]">
                Understand Your Family&apos;s{" "}
                <span className="bg-gradient-to-r from-[#005a53] via-[#0d9488] via-[#10b981] to-[#005a53] dark:from-[#2dd4bf] dark:via-[#6ee7b7] dark:to-[#2dd4bf] animate-gradient-text bg-clip-text text-transparent">
                  Genetic Health Story.
                </span>
              </h1>

              <p className="animate-fade-in-up stagger-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl font-normal">
                Explore inherited conditions, learn how genetic inheritance works, and organize family health history using peer-reviewed scientific references and curated open Kaggle datasets.
              </p>

              {/* CTAs */}
              <div className="animate-fade-in-up stagger-4 flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/register"
                  onClick={() => sound.playSuccess()}
                  className="apple-sheen-box group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#004d47] to-[#00635e] hover:from-[#003833] hover:to-[#004d47] text-white font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Disclaimer + Quick Verification Micro-Tags */}
              <div className="animate-fade-in-up stagger-5 space-y-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>For education and awareness — not a clinical diagnostic or medical substitute.</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { icon: Dna, text: "Mendelian & X-Linked Models" },
                    { icon: Database, text: "NCBI ClinVar + OMIM" },
                    { icon: Stethoscope, text: "Genetic Counselor Prep" },
                  ].map((chip) => {
                    const ChipIcon = chip.icon;
                    return (
                      <span
                        key={chip.text}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/75 dark:bg-[#13252d]/75 border border-teal-500/15 text-[10px] font-semibold text-muted-foreground shadow-2xs"
                      >
                        <ChipIcon className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        {chip.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Apple-Grade Interactive 3D Glass Pedigree Card */}
            <div className="lg:col-span-5 relative animate-fade-in-up stagger-3">
              {/* Floating Desktop Ambient Micro-Chips */}
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full apple-glass border border-teal-500/25 shadow-lg text-[10px] font-mono font-bold text-teal-800 dark:text-teal-200 absolute -top-4 -left-6 z-20 animate-gentle-float">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span>{activeModel.locus}</span>
              </div>
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full apple-glass border border-emerald-500/25 shadow-lg text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 absolute -bottom-3 -right-4 z-20 animate-gentle-float">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Client-Only Storage</span>
              </div>

              <div
                onMouseMove={handleHeroCardMove}
                onMouseLeave={() => setCardTilt({ rx: 0, ry: 0, active: false })}
                style={{
                  transform: cardTilt.active
                    ? `perspective(1000px) rotateX(${cardTilt.rx}deg) rotateY(${cardTilt.ry}deg) translateY(-4px)`
                    : undefined,
                }}
                className="rounded-3xl apple-glass p-5 sm:p-6 shadow-2xl animate-apple-border space-y-3.5 relative z-10 transition-transform duration-300 ease-out"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <span className="telemetry-beacon">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 block" />
                    </span>
                    <span className="font-extrabold text-xs text-foreground tracking-tight">
                      Pedigree & Variant Trace
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                    42 DISORDERS INDEXED
                  </span>
                </div>

                {/* Interactive Inheritance Model Switcher Tag Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Interactive Model:
                  </span>
                  <div className="inline-flex items-center p-0.5 rounded-full bg-surface-low/90 border border-border/80">
                    {(["recessive", "dominant", "xlinked"] as InheritanceKey[]).map((key) => {
                      const active = inheritanceMode === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleModeSwitch(key)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                            active
                              ? "bg-teal-700 text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {INHERITANCE_MODELS[key].shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive SVG Pedigree Diagram with Animated Signal Connectors */}
                <div className="w-full rounded-2xl bg-white/75 dark:bg-[#0c181d]/75 border border-teal-200/60 dark:border-teal-900/50 p-3.5 flex flex-col justify-between relative overflow-hidden shadow-inner">
                  {/* Animated SVG Pedigree Flow Lines */}
                  <svg
                    aria-hidden="true"
                    className="w-full h-24 absolute inset-x-0 top-6 pointer-events-none"
                    viewBox="0 0 320 96"
                    preserveAspectRatio="none"
                  >
                    {/* Parental Marriage Line */}
                    <line
                      x1="112"
                      y1="14"
                      x2="208"
                      y2="14"
                      stroke="#0f766e"
                      strokeWidth="1.5"
                      strokeOpacity="0.35"
                    />
                    <line
                      x1="112"
                      y1="14"
                      x2="208"
                      y2="14"
                      stroke="#14b8a6"
                      strokeWidth="2"
                      className="animate-pedigree-flow"
                    />
                    {/* Central Descent Stem */}
                    <line
                      x1="160"
                      y1="14"
                      x2="160"
                      y2="54"
                      stroke="#0f766e"
                      strokeWidth="1.5"
                      strokeOpacity="0.35"
                    />
                    <line
                      x1="160"
                      y1="14"
                      x2="160"
                      y2="54"
                      stroke="#14b8a6"
                      strokeWidth="2"
                      className="animate-pedigree-flow"
                    />
                    {/* Sibship Horizontal Bar */}
                    <line
                      x1="40"
                      y1="54"
                      x2="280"
                      y2="54"
                      stroke="#0f766e"
                      strokeWidth="1.5"
                      strokeOpacity="0.35"
                    />
                    <line
                      x1="40"
                      y1="54"
                      x2="280"
                      y2="54"
                      stroke="#10b981"
                      strokeWidth="1.8"
                      className="animate-pedigree-flow"
                    />
                    {/* Offspring Drops */}
                    {[40, 120, 200, 280].map((x) => (
                      <line
                        key={x}
                        x1={x}
                        y1="54"
                        x2={x}
                        y2="72"
                        stroke="#0f766e"
                        strokeWidth="1.5"
                        strokeOpacity="0.55"
                      />
                    ))}
                  </svg>

                  {/* Generation 1 (Parents) */}
                  <div className="flex items-center justify-center gap-16 pt-1 relative z-10">
                    {activeModel.parents.map((p) => renderPedigreeSymbol(p))}
                  </div>

                  <div className="h-5" />

                  {/* Generation 2 (Offspring) */}
                  <div className="grid grid-cols-4 gap-1 relative z-10 pt-1">
                    {activeModel.offspring.map((child) => renderPedigreeSymbol(child, true))}
                  </div>

                  {/* Clickable Node Genotype Readout Tag */}
                  <div className="mt-3 pt-2.5 border-t border-teal-500/15 flex items-center justify-between gap-2 text-[10px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-1.5 py-0.5 rounded bg-teal-600 text-white font-mono font-bold shrink-0">
                        {selectedNode.label} ({selectedNode.genotype})
                      </span>
                      <span className="text-muted-foreground truncate">
                        {selectedNode.note}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Segregation Tag Strip */}
                <div className="flex items-center justify-between text-[10px] px-2.5 py-1.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-500/15">
                  <span className="font-semibold text-teal-900 dark:text-teal-200">
                    {activeModel.title}
                  </span>
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-300">
                    {activeModel.ratio}
                  </span>
                </div>

                {/* Interactive Penetrance Scrubber Slider */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-teal-600" />
                      Phenotypic Penetrance Estimate:
                    </span>
                    <span className={`text-[11px] font-extrabold ${currentPenetrance.color}`}>
                      {currentPenetrance.text}
                    </span>
                  </div>

                  <div className="relative py-1">
                    <input
                      type="range"
                      aria-label="Phenotypic Penetrance Estimate"
                      min={5}
                      max={98}
                      value={penetranceValue}
                      onChange={(e) => {
                        sound.playSoft();
                        setPenetranceValue(Number(e.target.value));
                      }}
                      className="w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-rose-500 rounded-lg appearance-none cursor-pointer accent-teal-800 dark:accent-teal-300"
                    />
                  </div>

                  <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                    <span>Minimal Baseline</span>
                    <span>Elevation of Risk</span>
                    <span>Higher Trait</span>
                  </div>
                </div>

                {/* Card Footer Lineage Tag */}
                <div className="pt-2 border-t border-border/70 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    ClinVar 2024 & Kaggle Genomics Hub
                  </span>
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-300">
                    {activeModel.matchScore}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Kinetic Count-Up Metric Ribbon + Curated Loci Marquee */}
      <section className="relative z-10 py-6 border-b border-border/60 bg-white/60 dark:bg-[#111f26]/60 backdrop-blur-md space-y-5">
        <div ref={metricsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="smooth-card p-4 rounded-2xl apple-glass space-y-1 border-b-2 border-b-teal-500/40">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight block">
                <CountUpMetric target={1428} start={metricsVisible} />
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Mendelian Conditions Curated
              </span>
            </div>

            <div className="smooth-card p-4 rounded-2xl apple-glass space-y-1 border-b-2 border-b-emerald-500/40">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-300 tracking-tight block">
                <CountUpMetric target={2.4} decimals={1} suffix="M+" start={metricsVisible} />
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                ClinVar Variant Interpretations
              </span>
            </div>

            <div className="smooth-card p-4 rounded-2xl apple-glass space-y-1 border-b-2 border-b-cyan-500/40">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight block">
                <CountUpMetric target={93.9} decimals={1} suffix="%" start={metricsVisible} />
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                ROC-AUC Model Validation
              </span>
            </div>

            <div className="smooth-card p-4 rounded-2xl apple-glass space-y-1 border-b-2 border-b-teal-700/40">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight block">
                0 Bytes
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Raw DNA Files Retained
              </span>
            </div>
          </div>
        </div>

        {/* Continuous Kinetic Genomic Loci Tag Marquee */}
        <div className="marquee-wrapper overflow-hidden border-t border-teal-500/10 pt-4">
          <div className="animate-marquee gap-3 px-4">
            {[...CURATED_LOCI_TICKER, ...CURATED_LOCI_TICKER].map((item, idx) => (
              <Link
                key={`${item.gene}-${idx}`}
                href={item.href}
                onClick={() => sound.playSoft()}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full apple-glass border border-teal-500/20 hover:border-teal-500/50 hover:scale-105 transition-all text-xs shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span className="font-mono font-extrabold text-teal-800 dark:text-teal-300">
                  {item.gene}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-[10px] font-mono text-teal-700 dark:text-teal-300">
                  {item.locus}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {item.condition}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: 3 Editorial Feature Photo Cards Ribbon */}
      <section className="relative z-10 py-10 bg-surface-low/60 border-b border-border/60">
        <div className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <Link
              href="/my-family-history"
              onClick={() => sound.playSoft()}
              className="apple-sheen-box relative rounded-3xl overflow-hidden group border border-border/80 shadow-lg h-64 sm:h-72 flex flex-col justify-between p-5 sm:p-6 bg-slate-950 transition-all hover:shadow-2xl hover:scale-[1.02]"
            >
              <img
                src="/images/family-wellness.jpg"
                alt="Multi-generational family wellness"
                className="absolute inset-0 w-full h-full object-cover object-center z-0 transition-transform duration-700 group-hover:scale-[1.08]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent z-10 pointer-events-none" />
              <div className="relative z-20 flex justify-end">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] font-bold text-white transition-transform group-hover:translate-x-0.5">
                  <span>Open Workspace</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <div className="relative z-20 space-y-1 p-3.5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/15 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 drop-shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  MULTI-GENERATIONAL HEALTH
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-sm">
                  Preserving family wellness for tomorrow
                </h3>
              </div>
            </Link>

            {/* Card 2 */}
            <Link
              href="/data-lineage"
              onClick={() => sound.playSoft()}
              className="apple-sheen-box relative rounded-3xl overflow-hidden group border border-border/80 shadow-lg h-64 sm:h-72 flex flex-col justify-between p-5 sm:p-6 bg-slate-950 transition-all hover:shadow-2xl hover:scale-[1.02]"
            >
              <img
                src="/images/clinical-research.jpg"
                alt="Genomics research and clinical data curation"
                className="absolute inset-0 w-full h-full object-cover object-center z-0 transition-transform duration-700 group-hover:scale-[1.08]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent z-10 pointer-events-none" />
              <div className="relative z-20 flex justify-end">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] font-bold text-white transition-transform group-hover:translate-x-0.5">
                  <span>Inspect Sources</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <div className="relative z-20 space-y-1 p-3.5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/15 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 drop-shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  PEER-REVIEWED RIGOR
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-sm">
                  Curated with Kaggle & ClinVar data
                </h3>
              </div>
            </Link>

            {/* Card 3 */}
            <Link
              href="/assistant"
              onClick={() => sound.playSoft()}
              className="apple-sheen-box relative rounded-3xl overflow-hidden group border border-border/80 shadow-lg h-64 sm:h-72 flex flex-col justify-between p-5 sm:p-6 bg-slate-950 transition-all hover:shadow-2xl hover:scale-[1.02]"
            >
              <img
                src="/images/doctor-geneticist.jpg"
                alt="Doctor-reviewed clinical genetics insights"
                className="absolute inset-0 w-full h-full object-cover object-center z-0 transition-transform duration-700 group-hover:scale-[1.08]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent z-10 pointer-events-none" />
              <div className="relative z-20 flex justify-end">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] font-bold text-white transition-transform group-hover:translate-x-0.5">
                  <span>Consult Prep AI</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <div className="relative z-20 space-y-1 p-3.5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/15 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 drop-shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  BOARD-CERTIFIED CLINICAL GENETICIST GUIDANCE
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-sm">
                  Dr. A. Sharma + Doctor-Reviewed Insights
                </h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 01: Core Knowledge Pillars */}
      <section
        id="pillars"
        className="relative z-10 scroll-mt-24 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10"
      >
        <div className="reveal-section">
          <SectionTagPill
            index="01"
            label="CORE KNOWLEDGE PILLARS"
            badge="CLINVAR & OMIM"
            icon={Layers}
          />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Designed for clarity, built on open genetics.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
              Demystifying complex hereditary biology into transparent, empathetic, and verifiable educational insights.
            </p>
          </div>
        </div>

        <div className="reveal-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Dna,
              title: "Explore Inherited Conditions",
              desc: "Browse conditions, gene loci, and inheritance patterns (Autosomal Dominant, Recessive, X-linked) cross-referenced with ClinVar records.",
              tags: ["Autosomal Dominant", "X-Linked"],
              href: "/diseases",
              cta: "Browse Explorer",
            },
            {
              icon: Users,
              title: "Organize Family History",
              desc: "Securely document relatives, generational patterns, and verified health milestones to prepare for productive physician consultations.",
              tags: ["Pedigree Generator", "Encryption: Local"],
              href: "/my-family-history",
              cta: "Open Pedigree",
            },
            {
              icon: Microscope,
              title: "Understand Genetic Concepts",
              desc: "Interactive, bite-sized visual explainers covering alleles, pathogenic variants, incomplete penetrance, and epigenetics.",
              tags: ["Visual Pedigrees", "Penetrance"],
              href: "/risk-education",
              cta: "Open Syllabus",
            },
            {
              icon: Network,
              title: "Kaggle & Scientific Data Explorer",
              desc: "Full transparency into open-source genomic datasets, NCBI databases, ClinVar repositories, and Orphanet rare disease registries.",
              tags: ["Open Source", "NCBI / Kaggle"],
              href: "/data-lineage",
              cta: "Inspect Lineage",
            },
          ].map((card) => {
            const CardIcon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                onClick={() => sound.playSoft()}
                className="apple-glass smooth-card group p-6 rounded-3xl flex flex-col justify-between space-y-4 relative overflow-hidden hover:border-teal-500/45"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/0 via-teal-500/70 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <CardIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {card.tags.map((t, i) => (
                      <span
                        key={t}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                          i === 0
                            ? "bg-teal-50/80 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200/70 dark:border-teal-800/50"
                            : "bg-surface-low text-muted-foreground border-border"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 opacity-80 group-hover:opacity-100">
                    <span>{card.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 02: Apple Keynote Style Methodical Walkthrough */}
      <section
        id="journey"
        className="relative z-10 scroll-mt-24 py-16 sm:py-24 bg-[#e9f5f2]/80 dark:bg-[#0e2128]/85 border-y border-border/70 backdrop-blur-md"
      >
        <div className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <SectionTagPill
              index="02"
              label="METHODICAL JOURNEY"
              badge={`STEP ${activeStep}/4 ACTIVE`}
              icon={Sparkles}
              centered
            />
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              How GeneWise Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Empowering genetic literacy through private, stepped exploration and clinician-ready takeaways.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sound.playSoft();
                  setIsAutoCycling((v) => !v);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full apple-glass border border-teal-500/25 text-[10px] font-mono font-bold text-teal-800 dark:text-teal-300 hover:scale-105 transition-all"
              >
                {isAutoCycling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isAutoCycling ? "Auto-Showcase Active" : "Showcase Paused"}</span>
              </button>
            </div>
          </div>

          {/* Apple-Style Interactive 4-Step Scrubber */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                num: 1,
                tag: "ONBOARDING",
                title: "Create Private Account",
                desc: "Initialize your client-encrypted vault. No national ID, insurance numbers, or raw genetic sequence files required.",
                href: "/register",
                cta: "Initialize Vault",
              },
              {
                num: 2,
                tag: "MAPPING",
                title: "Document History",
                desc: "Optionally log known conditions across first- and second-degree relatives using guided, empathetic question flows.",
                href: "/my-family-history",
                cta: "Map Family Tree",
              },
              {
                num: 3,
                tag: "LEARNING",
                title: "Learn Concepts",
                desc: "Understand relevant inheritance pathways and scientific literature mapped against your selected areas of inquiry.",
                href: "/risk-education",
                cta: "Start Learning",
              },
              {
                num: 4,
                tag: "ACTION ORIENTATION",
                title: "Generate Clinical Checklist",
                desc: "Export a structured, non-diagnostic question portfolio to guide conversations with your licensed genetic counselor.",
                href: "/clinical-support/discussion-prep",
                cta: "Prepare Questions",
              },
            ].map((step) => {
              const isActive = activeStep === step.num;
              return (
                <div
                  key={step.num}
                  onClick={() => {
                    sound.playSoft();
                    setActiveStep(step.num);
                  }}
                  className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 space-y-3 relative overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? "apple-glass border-teal-500 shadow-xl scale-[1.02]"
                      : "bg-white/70 dark:bg-[#14262f]/65 border border-border/80 hover:bg-white dark:hover:bg-[#14262f]"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500 animate-pulse" />
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-teal-700 to-emerald-600 text-white shadow-sm scale-105"
                            : "bg-surface-low border border-border text-foreground"
                        }`}
                      >
                        {step.num}
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-800 dark:text-teal-300">
                        {step.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <Link
                      href={step.href}
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                      }}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold transition-colors ${
                        isActive ? "text-teal-700 dark:text-teal-300" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{step.cta}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 03: Zero-Knowledge Paradigm & Privacy-First Architecture Bento Grid */}
      <section
        id="privacy"
        className="relative z-10 scroll-mt-24 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8"
      >
        <div className="reveal-section p-8 sm:p-12 rounded-3xl apple-glass space-y-8 shadow-2xl border border-teal-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
            <div className="space-y-1.5">
              <SectionTagPill
                index="03"
                label="ZERO-KNOWLEDGE PARADIGM"
                badge="CLIENT-ENCRYPTED"
                icon={Lock}
              />
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Privacy-First Architecture
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                Your family health data belongs exclusively to you. We maintain an institutional privacy standard designed to resist commercial exploration.
              </p>
            </div>

            {/* 1-Click Data Purge Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-left sm:text-right">
                <span className="text-xs font-bold text-foreground block">One-Click Data Purge</span>
                <span className="text-[11px] text-muted-foreground">Instantly wipe local and cloud sessions</span>
              </div>
              <button
                type="button"
                onClick={handleFastPurge}
                className="apple-sheen-box px-5 py-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 text-xs font-bold transition-all inline-flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Fast Purge</span>
              </button>
            </div>
          </div>

          {purgeToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between animate-fade-in-up shadow-xs">
              <span className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                Session and cache memory wiped securely. Zero persistent identifiers retained.
              </span>
              <button type="button" onClick={() => setPurgeToast(false)} className="text-[11px] font-bold underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Two Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Left: What GeneWise Holds */}
            <div className="smooth-card p-6 sm:p-7 rounded-3xl bg-[#f0faf7] dark:bg-[#0c1e23] border border-teal-200/70 dark:border-teal-900/40 space-y-4">
              <h3 className="font-bold text-sm text-teal-900 dark:text-teal-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                What GeneWise Holds
              </h3>
              <ul className="space-y-3 text-xs text-foreground/80">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Locally encrypted family relationship trees (anonymized tags like &quot;Relative A&quot;)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Self-reported general health conditions for educational matching</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Saved educational topic bookmarks and clinical discussion checklists</span>
                </li>
              </ul>
            </div>

            {/* Card Right: What We NEVER Collect or Sell */}
            <div className="smooth-card p-6 sm:p-7 rounded-3xl bg-[#faf3f3] dark:bg-[#231215] border border-rose-200/70 dark:border-rose-900/40 space-y-4">
              <h3 className="font-bold text-sm text-rose-900 dark:text-rose-300 flex items-center gap-2">
                <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                What We NEVER Collect or Sell
              </h3>
              <ul className="space-y-3 text-xs text-foreground/80">
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>Raw biological samples, genomic raw FASTQ/BAM files, or direct biometric data</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>Government identity numbers, insurance company affiliations, or employer records</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>Zero advertising telemetry, third-party behavioral trackers, or data broker syndication</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mandatory Non-Diagnostic Disclaimer Box */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Mandatory Non-Diagnostic Disclaimer</span>
              <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/80">
                GeneWise is an educational literacy resource designed for proactive health discovery. Algorithms, probabilistic inheritance models, and scientific citations provided do not constitute medical advice, clinical genetic counseling, or formal differential diagnosis. Always discuss hereditary concerns with a certified genetic counselor or board-certified healthcare practitioner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 04: FAQ */}
      <section
        id="faq"
        className="relative z-10 scroll-mt-24 py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6"
      >
        <div className="reveal-section text-center space-y-1">
          <SectionTagPill
            index="04"
            label="TRANSPARENCY & INQUIRIES"
            badge="SCIENTIFIC FAQ"
            icon={HelpCircle}
            centered
          />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="reveal-section space-y-3">
          {[
            {
              q: "Does GeneWise require my 23andMe or AncestryDNA raw data file?",
              a: "No. GeneWise does not accept or store raw genetic sequencing files (FASTQ/BAM/VCF). You explore established disease loci, ClinVar classifications, and family inheritance patterns through self-guided educational questionnaires.",
            },
            {
              q: "How does the Pedigree & Variant Trace model calculate risk?",
              a: "The tool evaluates Mendelian segregation frequencies (autosomal dominant, autosomal recessive, and X-linked models) alongside curated ClinVar pathogenic allele frequencies to estimate phenotypic penetrance.",
            },
            {
              q: "Can I bring my exported checklist to my genetic counselor or physician?",
              a: "Yes. GeneWise generates a structured PDF and print-ready question portfolio that highlights key questions regarding family history milestones to streamline your clinical consultation.",
            },
          ].map((item, idx) => {
            const open = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`border rounded-2xl apple-glass overflow-hidden transition-all duration-300 ${
                  open
                    ? "border-teal-500/45 shadow-lg"
                    : "border-border hover:border-teal-500/25"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    sound.playSoft();
                    setActiveFaq(open ? null : idx);
                  }}
                  className="w-full p-4 sm:p-5 text-left font-semibold text-xs sm:text-sm text-foreground flex items-center justify-between gap-4"
                >
                  <span>{item.q}</span>
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      open
                        ? "bg-teal-700 text-white rotate-45"
                        : "bg-surface-low text-muted-foreground"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>
                {open && (
                  <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3 animate-fade-in-up">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 05: RESEARCH & OUR TEAM */}
      <LandingResearchTeamSection />

      {/* Pre-Footer Cinematic Call-To-Action Strip */}
      <section className="relative z-10 pb-16 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="reveal-section apple-sheen-box rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#062d2a] via-[#0a4a44] to-[#0f645c] text-white shadow-2xl border border-teal-400/25 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider text-teal-200">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              Ready for Your Next Consultation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Start mapping your family&apos;s genetic health story today.
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/85 leading-relaxed">
              Build an encrypted 3-generation pedigree chart, review peer-reviewed ClinVar evidence, or practice questions with our multilingual Voice & AI Assistant.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/my-family-history"
              onClick={() => sound.playSuccess()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#004d47] hover:bg-teal-50 font-bold text-xs sm:text-sm shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span>Open Pedigree Workspace</span>
            </Link>
            <Link
              href="/assistant"
              onClick={() => sound.playSoft()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Assistant</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Institutional Multi-Column Footer */}
      <footer className="relative z-10 mt-auto border-t border-border bg-white/95 dark:bg-[#111f26]/95 backdrop-blur-md text-muted-foreground text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Column 1: Governance */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-foreground text-[11px]">
                GOVERNANCE
              </p>
              <ul className="space-y-2 text-xs">
                <li><Link href="/governance/privacy-charter" className="hover:text-foreground transition-colors">Privacy Charter</Link></li>
                <li><Link href="/governance/terms" className="hover:text-foreground transition-colors">Terms of Educational Use</Link></li>
                <li><Link href="/governance/zero-sale-pledge" className="hover:text-foreground transition-colors">Zero-Sale Pledge</Link></li>
              </ul>
            </div>

            {/* Column 2: Data Lineage */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-foreground text-[11px]">
                DATA LINEAGE
              </p>
              <ul className="space-y-2 text-xs">
                <li><Link href="/data-lineage?source=kaggle" className="hover:text-foreground transition-colors">Kaggle Genomic Hub</Link></li>
                <li><Link href="/data-lineage?source=clinvar" className="hover:text-foreground transition-colors">NCBI ClinVar Citations</Link></li>
                <li><Link href="/data-lineage?source=orphanet" className="hover:text-foreground transition-colors">Orphanet Database</Link></li>
              </ul>
            </div>

            {/* Column 3: Clinical Support */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-foreground text-[11px]">
                CLINICAL SUPPORT
              </p>
              <ul className="space-y-2 text-xs">
                <li><Link href="/clinical-support/find-counselor" className="hover:text-foreground transition-colors">Find a Genetic Counselor</Link></li>
                <li><Link href="/clinical-support/discussion-prep" className="hover:text-foreground transition-colors">Doctor Discussion Prep</Link></li>
                <li><Link href="/clinical-support/scientific-faq" className="hover:text-foreground transition-colors">Scientific FAQ</Link></li>
              </ul>
            </div>

            {/* Column 4: Emergency Care */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-red-600 dark:text-red-400 text-[11px] flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> EMERGENCY CARE
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                In case of acute symptoms or sudden clinical crisis, do not consult this portal. Contact local emergency services (e.g. 911 or local healthcare dispatcher) immediately.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 mt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div className="flex flex-wrap items-center gap-3">
              <p>
                <strong className="text-foreground">GeneWise</strong> • Clinical-grade genetics literacy
              </p>
              <span className="text-border">•</span>
              <Link
                href="/documentation"
                className="font-bold text-teal-700 dark:text-teal-300 hover:underline inline-flex items-center gap-1"
              >
                <span>Open Public Documentary Library</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p>
              © 2025 GeneWise. HIPAA &amp; GDPR Aligned
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
