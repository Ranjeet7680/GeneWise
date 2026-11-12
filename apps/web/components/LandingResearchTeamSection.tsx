"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  BookOpenCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  Crown,
  Dna,
  ExternalLink,
  FileSpreadsheet,
  Github,
  GraduationCap,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  Maximize2,
  Microscope,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import {
  CURATED_RESEARCH_STUDIES,
  RESEARCH_BENCHMARKS,
  TEAM_GOOGLE_SHEET_URL,
  TEAM_MEMBERS,
  TEAM_WORKSTREAMS,
  type ResearchStudy,
  type TeamMember,
  type TeamWorkstream,
} from "@/lib/research-team-data";
import { sound } from "@/lib/sound";

type StudyCategory = "All" | ResearchStudy["category"];
type TeamTrackFilter = "All" | TeamMember["track"];

const CATEGORIES: StudyCategory[] = [
  "All",
  "Gastroenterology",
  "Endocrinology",
  "Hepatology",
  "Cardiology",
];

const TEAM_FILTERS: TeamTrackFilter[] = [
  "All",
  "Leadership",
  "Engineering",
  "Research & Design",
];

const WORKSTREAM_ICONS = [Dna, BookOpenCheck, Cpu, ShieldCheck];

function MemberAvatar({
  member,
  size = "md",
}: {
  member: TeamMember;
  size?: "md" | "lg";
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const dimClass =
    size === "lg" ? "w-20 h-20 text-xl" : "w-14 h-14 text-base";

  return (
    <div className="relative shrink-0 group-hover:scale-[1.03] transition-transform duration-300">
      <div
        className={`${dimClass} relative rounded-2xl overflow-hidden flex items-center justify-center font-extrabold tracking-tight text-white shadow-md ring-2 ring-teal-500/25 border border-white/30 select-none`}
        style={{ background: member.avatarGradientCss }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 64 64"
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        >
          <circle cx="52" cy="12" r="20" fill="white" />
          <circle cx="10" cy="58" r="14" fill="white" />
        </svg>

        <span className="relative z-10 drop-shadow-xs">{member.initials}</span>

        {member.avatarUrl && !imgFailed && (
          <img
            src={member.avatarUrl}
            alt={member.name}
            loading="eager"
            decoding="async"
            onError={() => setImgFailed(true)}
            style={{ objectPosition: member.avatarObjectPosition || "50% 25%" }}
            className="absolute inset-0 z-20 w-full h-full object-cover"
          />
        )}
      </div>

      <span
        title={member.isLeader ? "Team Leader" : "Verified Member"}
        className={`absolute -bottom-1 -right-1 z-30 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0d1c22] shadow-sm ${
          member.isLeader ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
        }`}
      >
        {member.isLeader ? (
          <Crown className="w-2.5 h-2.5" />
        ) : (
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        )}
      </span>
    </div>
  );
}

function PopupModalShell({
  titleId,
  onClose,
  children,
}: {
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="landing-popup-overlay"
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0d1c22] border border-teal-500/30 shadow-2xl p-6 sm:p-8 text-foreground animate-fade-in-up"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

const TEAM_CYCLE_SECONDS = 10;

export default function LandingResearchTeamSection() {
  const [selectedCategory, setSelectedCategory] = useState<StudyCategory>("All");
  const [selectedStudyId, setSelectedStudyId] = useState<string>(
    CURATED_RESEARCH_STUDIES[0].id
  );
  const [teamFilter, setTeamFilter] = useState<TeamTrackFilter>("All");
  const [activeMemberId, setActiveMemberId] = useState<string>(
    TEAM_MEMBERS[0]?.id || ""
  );
  const [isTeamAutoPlay, setIsTeamAutoPlay] = useState<boolean>(true);
  const [countdownSec, setCountdownSec] = useState<number>(TEAM_CYCLE_SECONDS);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  // Interactive Pop-up Screen States
  const [modalWorkstreamId, setModalWorkstreamId] = useState<string | null>(null);
  const [modalMemberId, setModalMemberId] = useState<string | null>(null);
  const [modalStudyId, setModalStudyId] = useState<string | null>(null);

  const hasOpenPopup = Boolean(modalWorkstreamId || modalMemberId || modalStudyId);

  useEffect(() => {
    if (!hasOpenPopup) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalWorkstreamId(null);
        setModalMemberId(null);
        setModalStudyId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hasOpenPopup]);

  const filteredStudies = useMemo(() => {
    if (selectedCategory === "All") return CURATED_RESEARCH_STUDIES;
    return CURATED_RESEARCH_STUDIES.filter(
      (study) => study.category === selectedCategory
    );
  }, [selectedCategory]);

  const activeStudy =
    filteredStudies.find((s) => s.id === selectedStudyId) ||
    filteredStudies[0] ||
    CURATED_RESEARCH_STUDIES[0];

  const filteredTeam = useMemo(() => {
    if (teamFilter === "All") return TEAM_MEMBERS;
    return TEAM_MEMBERS.filter((m) => m.track === teamFilter);
  }, [teamFilter]);

  const activeRosterMember =
    filteredTeam.find((m) => m.id === activeMemberId) ||
    filteredTeam[0] ||
    TEAM_MEMBERS[0];

  const activeRosterIndex = Math.max(
    0,
    filteredTeam.findIndex((m) => m.id === activeRosterMember?.id)
  );

  useEffect(() => {
    setCountdownSec(TEAM_CYCLE_SECONDS);
    if (!isTeamAutoPlay || hasOpenPopup || filteredTeam.length <= 1) return;

    let remaining = TEAM_CYCLE_SECONDS;
    const ticker = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        remaining = TEAM_CYCLE_SECONDS;
        setActiveMemberId((curr) => {
          const idx = filteredTeam.findIndex((m) => m.id === curr);
          const nextIdx = idx >= 0 ? (idx + 1) % filteredTeam.length : 0;
          return filteredTeam[nextIdx]?.id || curr;
        });
      }
      setCountdownSec(remaining);
    }, 1000);

    return () => clearInterval(ticker);
  }, [isTeamAutoPlay, hasOpenPopup, filteredTeam, activeRosterMember?.id]);

  const stepRosterMember = (delta: number) => {
    if (filteredTeam.length === 0) return;
    sound.playSoft();
    const nextIdx =
      (activeRosterIndex + delta + filteredTeam.length) % filteredTeam.length;
    const nextMember = filteredTeam[nextIdx];
    if (nextMember) {
      setActiveMemberId(nextMember.id);
    }
  };

  const modalWorkstreamIndex = TEAM_WORKSTREAMS.findIndex(
    (w) => w.id === modalWorkstreamId
  );
  const modalWorkstream: TeamWorkstream | null =
    modalWorkstreamIndex >= 0 ? TEAM_WORKSTREAMS[modalWorkstreamIndex] : null;

  const modalMemberIndex = TEAM_MEMBERS.findIndex((m) => m.id === modalMemberId);
  const modalMember: TeamMember | null =
    modalMemberIndex >= 0 ? TEAM_MEMBERS[modalMemberIndex] : null;

  const modalStudyIndex = CURATED_RESEARCH_STUDIES.findIndex(
    (s) => s.id === modalStudyId
  );
  const modalStudy: ResearchStudy | null =
    modalStudyIndex >= 0 ? CURATED_RESEARCH_STUDIES[modalStudyIndex] : null;

  const handleCopyEmail = (member: TeamMember, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setCopiedEmailId(member.id);
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(member.email).catch(() => {
        // Ignore clipboard errors in restricted contexts
      });
    }
    setTimeout(() => {
      setCopiedEmailId((curr) => (curr === member.id ? null : curr));
    }, 1800);
  };

  const stepWorkstreamModal = (delta: number) => {
    if (modalWorkstreamIndex < 0) return;
    sound.playSoft();
    const nextIdx =
      (modalWorkstreamIndex + delta + TEAM_WORKSTREAMS.length) %
      TEAM_WORKSTREAMS.length;
    setModalWorkstreamId(TEAM_WORKSTREAMS[nextIdx].id);
  };

  const stepMemberModal = (delta: number) => {
    if (modalMemberIndex < 0) return;
    sound.playSoft();
    const nextIdx =
      (modalMemberIndex + delta + TEAM_MEMBERS.length) % TEAM_MEMBERS.length;
    setModalMemberId(TEAM_MEMBERS[nextIdx].id);
    setActiveMemberId(TEAM_MEMBERS[nextIdx].id);
  };

  const stepStudyModal = (delta: number) => {
    if (modalStudyIndex < 0) return;
    sound.playSoft();
    const nextIdx =
      (modalStudyIndex + delta + CURATED_RESEARCH_STUDIES.length) %
      CURATED_RESEARCH_STUDIES.length;
    setModalStudyId(CURATED_RESEARCH_STUDIES[nextIdx].id);
    setSelectedStudyId(CURATED_RESEARCH_STUDIES[nextIdx].id);
  };

  return (
    <section
      id="research"
      className="relative z-10 scroll-mt-24 py-16 border-t border-border/60 bg-gradient-to-b from-surface-low/50 via-transparent to-surface-low/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Header */}
        <div className="reveal-section flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full apple-glass border border-teal-500/25 shadow-xs">
              <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white font-mono text-[9px] font-extrabold tracking-tight">
                05
              </span>
              <Microscope className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-teal-800 dark:text-teal-300">
                RESEARCH &amp; OUR TEAM
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 pl-2 ml-0.5 border-l border-teal-500/25 text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                PEER-REVIEWED EVIDENCE
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Clinical Research &amp; Innovation Team
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every educational summary, biomarker range, and inheritance model in GeneWise is grounded in peer-reviewed clinical guidelines and built by our Future Health Digital Innovation Challenge team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/research"
              onClick={() => sound.playSoft()}
              className="apple-sheen-box inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#004d47] to-[#00635e] hover:from-[#003833] hover:to-[#004d47] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>Open Research &amp; Learning Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/ml-lab"
              onClick={() => sound.playSoft()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl apple-glass border border-border hover:border-teal-500/40 text-xs font-bold text-foreground transition-all hover:scale-105"
            >
              <Cpu className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />
              <span>Inspect ML Lab</span>
            </Link>
          </div>
        </div>

        {/* PART A: Interactive Research Studies Showcase + Benchmark Strip */}
        <div className="reveal-section space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      sound.playSoft();
                      setSelectedCategory(category);
                      const firstMatch =
                        category === "All"
                          ? CURATED_RESEARCH_STUDIES[0]
                          : CURATED_RESEARCH_STUDIES.find((s) => s.category === category);
                      if (firstMatch) setSelectedStudyId(firstMatch.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      active
                        ? "bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white shadow-sm"
                        : "apple-glass border border-border text-muted-foreground hover:text-foreground hover:border-teal-500/35"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {filteredStudies.length} Curated Guideline{filteredStudies.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 space-y-3">
              {filteredStudies.map((study) => {
                const isSelected = activeStudy.id === study.id;
                return (
                  <button
                    key={study.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedStudyId(study.id);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? "apple-glass border-teal-500/60 shadow-lg ring-1 ring-teal-500/20 translate-x-1"
                        : "bg-white/70 dark:bg-[#112128]/70 border-border hover:border-teal-500/35 hover:bg-white dark:hover:bg-[#112128]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-emerald-500 animate-pulse" : "bg-teal-500/50"
                          }`}
                        />
                        {study.category} • {study.year}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[9px] font-mono font-bold text-teal-800 dark:text-teal-300">
                        PMID {study.pmid}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2">
                      {study.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">
                      {study.journal} • {study.evidenceLevel}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 apple-glass rounded-3xl p-6 sm:p-7 border border-teal-500/25 shadow-xl flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {activeStudy.evidenceLevel}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-surface-low border border-border text-[10px] font-mono font-semibold text-foreground">
                      {activeStudy.journal} ({activeStudy.year})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    DOI: {activeStudy.doi}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-foreground leading-snug">
                    {activeStudy.title}
                  </h3>
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-300">
                    {activeStudy.authors}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {activeStudy.abstract}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-teal-500/8 dark:bg-teal-500/12 border border-teal-500/25 space-y-1.5">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Key Clinical Evidence Summary
                  </p>
                  <p className="text-xs text-foreground leading-relaxed font-medium">
                    {activeStudy.keyFinding}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                <a
                  href={activeStudy.pubmedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline"
                >
                  <span>Verify Citation on PubMed (PMID {activeStudy.pmid})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setModalStudyId(activeStudy.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/25 hover:border-teal-500/50 text-xs font-bold text-teal-800 dark:text-teal-200 transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Pop-up Dossier</span>
                  </button>
                  <Link
                    href="/research"
                    onClick={() => sound.playSoft()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-low border border-border hover:border-teal-500/40 text-xs font-semibold text-foreground transition-colors"
                  >
                    <span>Browse All Guidelines</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {RESEARCH_BENCHMARKS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => sound.playSoft()}
                className="group p-4 rounded-2xl apple-glass border border-border hover:border-teal-500/40 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-gradient-medical">
                    {item.metric}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-teal-600 transition-colors" />
                </div>
                <p className="text-xs font-bold text-foreground mt-1">{item.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {item.sublabel}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* PART B: Our Team Members & Interdisciplinary Workstreams */}
        <div
          id="team"
          className="reveal-section scroll-mt-24 pt-10 border-t border-border/60 space-y-8"
        >
          {/* Team Section Heading & Filter Strip */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  <Users className="w-3.5 h-3.5" />
                  Our Team • Future Health Digital Innovation Challenge
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  {TEAM_MEMBERS.length} Verified Members • 5 Institutions
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Meet Our Team Members
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Engineers, AI specialists, and biomedical researchers collaborating across premier Indian and international universities to build transparent genetic literacy and healthcare decision-support tools. Click any card for quick pop-up details.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl apple-glass border border-border">
                {TEAM_FILTERS.map((track) => {
                  const active = teamFilter === track;
                  return (
                    <button
                      key={track}
                      type="button"
                      onClick={() => {
                        sound.playSoft();
                        setTeamFilter(track);
                        const firstMatch =
                          track === "All"
                            ? TEAM_MEMBERS[0]
                            : TEAM_MEMBERS.find((m) => m.track === track);
                        if (firstMatch) setActiveMemberId(firstMatch.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        active
                          ? "bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {track}
                    </button>
                  );
                })}
              </div>

              <a
                href={TEAM_GOOGLE_SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playSoft()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl apple-glass border border-teal-500/30 hover:border-teal-500/60 text-xs font-bold text-teal-800 dark:text-teal-200 transition-all hover:scale-[1.02]"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Team Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Full-Width Single-Member 10s Animated Showcase (No Right-Side Scroll Box) */}
          {activeRosterMember && (
            <div
              data-testid="team-spotlight-card"
              className="apple-sheen-box rounded-3xl apple-glass border border-teal-500/35 shadow-xl overflow-hidden flex flex-col justify-between"
            >
              {/* Animated 10-Second Auto-Transition Progress Strip */}
              <div className="h-1.5 w-full bg-teal-500/15 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#005a53] via-[#0d9488] to-[#10b981] transition-all duration-700 ease-linear"
                  style={{
                    width: isTeamAutoPlay
                      ? `${Math.max(10, Math.round(((TEAM_CYCLE_SECONDS - countdownSec + 1) / TEAM_CYCLE_SECONDS) * 100))}%`
                      : "100%",
                  }}
                />
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Top Meta, 10s Live Countdown & Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-border/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
                      {activeRosterMember.isLeader ? (
                        <Crown className="w-3 h-3 text-amber-300" />
                      ) : (
                        <Users className="w-3 h-3 text-emerald-200" />
                      )}
                      {activeRosterMember.role}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-mono font-bold text-teal-800 dark:text-teal-300">
                      {String(activeRosterIndex + 1).padStart(2, "0")} /{" "}
                      {String(filteredTeam.length).padStart(2, "0")}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-low border border-border text-[10px] font-mono text-muted-foreground">
                      <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      {activeRosterMember.country}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {filteredTeam.length > 1 && (
                      <span
                        data-testid="team-cycle-timer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-low border border-border text-[10px] font-mono font-semibold text-muted-foreground"
                      >
                        <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        <span>
                          {isTeamAutoPlay
                            ? `10s Cycle • Next in ${countdownSec}s`
                            : "Cycle Paused"}
                        </span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsTeamAutoPlay((prev) => !prev);
                      }}
                      aria-label={isTeamAutoPlay ? "Pause auto-cycle" : "Start auto-cycle"}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        isTeamAutoPlay
                          ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-700 dark:text-emerald-300"
                          : "bg-surface-low border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isTeamAutoPlay ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>10s Auto On</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          <span>Auto 10s</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setModalMemberId(activeRosterMember.id);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 hover:border-teal-500/50 text-[10px] font-bold text-teal-800 dark:text-teal-200 transition-colors"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Pop View</span>
                    </button>
                  </div>
                </div>

                {/* Keyed Animated Member Spotlight Content (Mem 1 -> Mem 5 Loop) */}
                <div
                  key={activeRosterMember.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-fade-in-up"
                >
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div className="group">
                        <MemberAvatar member={activeRosterMember} size="lg" />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                            {activeRosterMember.name}
                          </h4>
                          {activeRosterMember.githubHandle && (
                            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-mono font-bold text-teal-800 dark:text-teal-300">
                              @{activeRosterMember.githubHandle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-300 flex items-start gap-1.5 leading-snug">
                          <GraduationCap className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{activeRosterMember.university}</span>
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                          Track: <strong className="text-foreground">{activeRosterMember.track}</strong>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                      {activeRosterMember.focus}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {activeRosterMember.highlights.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-white/85 dark:bg-[#13262e] border border-teal-500/20 text-[11px] font-semibold text-teal-800 dark:text-teal-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact & Social Actions Side Box */}
                  <div className="lg:col-span-4 rounded-2xl bg-white/70 dark:bg-[#0e1e25]/70 border border-border/80 p-4 space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                      Contributor Contact &amp; Profiles
                    </span>

                    <a
                      href={`mailto:${activeRosterMember.email}`}
                      className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-low border border-border hover:border-teal-500/40 text-xs font-semibold text-foreground transition-colors truncate"
                    >
                      <Mail className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300 shrink-0" />
                      <span className="truncate">{activeRosterMember.email}</span>
                    </a>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleCopyEmail(activeRosterMember, e)}
                        aria-label={`Copy email for ${activeRosterMember.name}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl apple-glass border border-border hover:border-teal-500/40 text-[11px] font-bold text-foreground transition-colors"
                      >
                        {copiedEmailId === activeRosterMember.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 dark:text-emerald-300">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {activeRosterMember.githubUrl && (
                        <a
                          href={activeRosterMember.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 text-xs font-bold shadow-xs transition-all"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {activeRosterMember.linkedinUrl && (
                        <a
                          href={activeRosterMember.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a66c2]/10 border border-[#0a66c2]/25 text-[#0a66c2] dark:text-sky-300 hover:bg-[#0a66c2]/20 text-xs font-bold transition-all"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compact Horizontal 01 -> 05 Step Sequence Bar (No Cluttered List) */}
                <div className="pt-4 border-t border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {filteredTeam.map((m, idx) => {
                      const isCurr = m.id === activeRosterMember.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          aria-label={`Select ${m.name}`}
                          onClick={() => {
                            sound.playSoft();
                            setActiveMemberId(m.id);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-300 ${
                            isCurr
                              ? "bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white shadow-sm scale-[1.03]"
                              : "bg-surface-low border border-border text-muted-foreground hover:text-foreground hover:border-teal-500/40"
                          }`}
                        >
                          <span className="font-mono text-[10px] opacity-80">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span>{m.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => stepRosterMember(-1)}
                      aria-label="Previous team member"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-low border border-border hover:border-teal-500/40 text-xs font-bold text-foreground transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => stepRosterMember(1)}
                      aria-label="Next team member"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
                    >
                      <span>Next Member</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4 Core Platform Research & Engineering Workstreams (Clickable for Pop Screen!) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Core Engineering &amp; Research Workstreams Built by the Team
              </p>
              <span className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Click any track card to open architecture pop-up</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEAM_WORKSTREAMS.map((track, index) => {
                const Icon = WORKSTREAM_ICONS[index] || Microscope;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      sound.playClick();
                      setModalWorkstreamId(track.id);
                    }}
                    className="group cursor-pointer apple-glass rounded-2xl p-5 border border-border hover:border-teal-500/45 transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="w-9 h-9 rounded-xl bg-teal-500/12 border border-teal-500/25 flex items-center justify-center text-teal-700 dark:text-teal-300 group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-low border border-border font-mono text-[9px] font-bold text-muted-foreground">
                          {track.badge}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                          {track.focus}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {track.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                      <Link
                        href={track.href}
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playSoft();
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline"
                      >
                        <span>{track.hrefLabel}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          setModalWorkstreamId(track.id);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-500/10 border border-teal-500/25 text-[10px] font-bold text-teal-800 dark:text-teal-200 hover:bg-teal-500/20 transition-colors"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Pop Screen</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* POP SCREEN 1: Workstream Architecture Modal */}
      {modalWorkstream && (
        <PopupModalShell
          titleId="workstream-modal-title"
          onClose={() => setModalWorkstreamId(null)}
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white font-mono text-[10px] font-bold">
                    {modalWorkstream.badge}
                  </span>
                  <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                    {modalWorkstream.focus}
                  </span>
                </div>
                <h3
                  id="workstream-modal-title"
                  className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight"
                >
                  {modalWorkstream.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close pop-up screen"
                onClick={() => setModalWorkstreamId(null)}
                className="w-9 h-9 rounded-full bg-surface-low border border-border hover:border-teal-500/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {modalWorkstream.architectureSummary}
            </p>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-3 gap-3">
              {modalWorkstream.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="p-3.5 rounded-2xl bg-surface-low border border-border text-center"
                >
                  <p className="text-lg sm:text-xl font-extrabold font-mono text-gradient-medical">
                    {metric.value}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Key Capabilities List */}
            <div className="p-4 sm:p-5 rounded-2xl bg-teal-500/8 dark:bg-teal-500/12 border border-teal-500/25 space-y-2.5">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Verified System Capabilities
              </p>
              <ul className="space-y-2">
                {modalWorkstream.capabilities.map((cap) => (
                  <li
                    key={cap}
                    className="flex items-start gap-2 text-xs text-foreground leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Controls & Route Launchers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => stepWorkstreamModal(-1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-low border border-border hover:border-teal-500/40 text-xs font-bold text-foreground transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev Track</span>
                </button>
                <button
                  type="button"
                  onClick={() => stepWorkstreamModal(1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-low border border-border hover:border-teal-500/40 text-xs font-bold text-foreground transition-colors"
                >
                  <span>Next Track</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={modalWorkstream.secondaryHref}
                  onClick={() => sound.playSoft()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border hover:border-teal-500/40 text-xs font-bold text-foreground transition-colors"
                >
                  <span>{modalWorkstream.secondaryLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={modalWorkstream.href}
                  onClick={() => sound.playSuccess()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#004d47] to-[#00635e] text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
                >
                  <span>{modalWorkstream.hrefLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </PopupModalShell>
      )}

      {/* POP SCREEN 2: Contributor Profile Modal */}
      {modalMember && (
        <PopupModalShell
          titleId="member-modal-title"
          onClose={() => setModalMemberId(null)}
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
              <div className="flex items-center gap-4">
                <MemberAvatar member={modalMember} size="lg" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#005a53] to-[#0d9488] text-white text-[10px] font-bold">
                      {modalMember.role}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-low border border-border text-[10px] font-mono text-muted-foreground">
                      {modalMember.track}
                    </span>
                  </div>
                  <h3
                    id="member-modal-title"
                    className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight"
                  >
                    {modalMember.name}
                  </h3>
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {modalMember.university} • {modalMember.country}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close pop-up screen"
                onClick={() => setModalMemberId(null)}
                className="w-9 h-9 rounded-full bg-surface-low border border-border hover:border-teal-500/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {modalMember.focus}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {modalMember.highlights.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-800 dark:text-teal-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-surface-low border border-border flex flex-wrap items-center justify-between gap-3">
              <a
                href={`mailto:${modalMember.email}`}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground hover:text-teal-700 dark:hover:text-teal-300"
              >
                <Mail className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{modalMember.email}</span>
              </a>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleCopyEmail(modalMember, e)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#112128] border border-border hover:border-teal-500/40 text-xs font-bold text-foreground"
                >
                  {copiedEmailId === modalMember.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Email</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
                {modalMember.githubUrl && (
                  <a
                    href={modalMember.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>@{modalMember.githubHandle}</span>
                  </a>
                )}
                {modalMember.linkedinUrl && (
                  <a
                    href={modalMember.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a66c2]/10 border border-[#0a66c2]/25 text-[#0a66c2] dark:text-sky-300 text-xs font-bold"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => stepMemberModal(-1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-low border border-border hover:border-teal-500/40 text-xs font-bold text-foreground transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev Member</span>
                </button>
                <button
                  type="button"
                  onClick={() => stepMemberModal(1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-low border border-border hover:border-teal-500/40 text-xs font-bold text-foreground transition-colors"
                >
                  <span>Next Member</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setModalMemberId(null)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#004d47] to-[#00635e] text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </PopupModalShell>
      )}

      {/* POP SCREEN 3: Expanded Clinical Research Study Modal */}
      {modalStudy && (
        <PopupModalShell
          titleId="study-modal-title"
          onClose={() => setModalStudyId(null)}
        >
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    {modalStudy.evidenceLevel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-low border border-border text-[10px] font-mono font-semibold text-foreground">
                    PMID {modalStudy.pmid} • {modalStudy.journal} ({modalStudy.year})
                  </span>
                </div>
                <h3
                  id="study-modal-title"
                  className="text-lg sm:text-2xl font-extrabold text-foreground leading-snug"
                >
                  {modalStudy.title}
                </h3>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-300">
                  {modalStudy.authors}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close pop-up screen"
                onClick={() => setModalStudyId(null)}
                className="w-9 h-9 rounded-full bg-surface-low border border-border hover:border-teal-500/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Clinical Abstract &amp; Scope
              </p>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                {modalStudy.abstract}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-500/8 dark:bg-teal-500/12 border border-teal-500/25 space-y-1.5">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Key Clinical Evidence Summary
              </p>
              <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                {modalStudy.keyFinding}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground pt-1">
                DOI: {modalStudy.doi}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => stepStudyModal(-1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-low border border-border hover:border-teal-500/40 text-xs font-bold text-foreground transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev Study</span>
                </button>
                <button
                  type="button"
                  onClick={() => stepStudyModal(1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-low border border-border hover:border-teal-500/40 text-xs font-bold text-foreground transition-colors"
                >
                  <span>Next Study</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <a
                href={modalStudy.pubmedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#004d47] to-[#00635e] text-white text-xs font-bold shadow-md"
              >
                <span>Open on PubMed</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </PopupModalShell>
      )}
    </section>
  );
}
