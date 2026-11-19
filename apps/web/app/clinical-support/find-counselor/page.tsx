"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Globe2,
  GraduationCap,
  Heart,
  HelpCircle,
  Info,
  MapPin,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserCheck,
  Video,
  X,
} from "lucide-react";
import PublicDocShell from "@/components/PublicDocShell";
import SafetyNotice from "@/components/SafetyNotice";
import DoctorPrepWizardModal from "@/components/DoctorPrepWizardModal";
import CounselorDetailModal from "@/components/CounselorDetailModal";
import CounselorBookingModal from "@/components/CounselorBookingModal";
import { api } from "@/lib/api";
import { DEMO_COUNSELORS } from "@/lib/counselor-demo-data";
import { sound } from "@/lib/sound";
import { GeneticCounselor, AppointmentBookingRecord } from "@/types";

const SUGGESTED_LOCI = [
  "BRCA1",
  "BRCA2",
  "CFTR",
  "LDLR",
  "FBN1",
  "HFE",
  "GAA",
  "G6PD",
  "HTT",
  "SMN1",
  "DPYD",
];

const SPECIALTY_OPTIONS = [
  "All",
  "Cardiogenetics",
  "Oncogenetics",
  "Neurogenetics",
  "Pediatric & Rare Diseases",
  "Prenatal",
  "Pharmacogenetics",
];

const COUNTRY_OPTIONS = [
  "All Countries",
  "United States",
  "India",
  "United Kingdom",
];

export default function FindCounselorPage() {
  const [counselors, setCounselors] = useState<GeneticCounselor[]>(DEMO_COUNSELORS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [selectedCountry, setSelectedCountry] = useState<string>("All Countries");
  const [telehealthOnly, setTelehealthOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLocusChip, setSelectedLocusChip] = useState<string | null>(null);

  // Saved Bookmarks
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);

  // Modals state
  const [isPrepWizardOpen, setIsPrepWizardOpen] = useState<boolean>(false);
  const [detailCounselor, setDetailCounselor] = useState<GeneticCounselor | null>(null);
  const [bookingCounselor, setBookingCounselor] = useState<GeneticCounselor | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch counselors from live backend API on mount or parameter changes
  useEffect(() => {
    let isCancelled = false;

    async function loadDirectory() {
      setIsLoading(true);
      try {
        const data = await api.getCounselorDirectory({
          query: searchQuery,
          specialty: selectedSpecialty,
          country: selectedCountry,
          telehealth: telehealthOnly ? true : undefined,
        });

        if (!isCancelled && data && data.length > 0) {
          setCounselors(data);
        }
      } catch (err) {
        console.warn("Failed to load counselors from backend, preserving local cache:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    const timer = setTimeout(loadDirectory, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedSpecialty, selectedCountry, telehealthOnly]);

  // Load saved bookmarks from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("saved_counselors_list");
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const toggleSaveCounselor = (id: string) => {
    sound.playSoft();
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("saved_counselors_list", JSON.stringify(next));
      } catch {
        // ignore
      }
      showToast(next.includes(id) ? "Counselor saved to your bookmarks" : "Counselor removed from saved list");
      return next;
    });

    api.toggleSaveCounselor(id).catch(() => {});
  };

  const handleShareProfile = (counselor: GeneticCounselor) => {
    sound.playSoft();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `https://genewise.ai/clinical-support/find-counselor?id=${counselor.id}`
      );
      showToast(`Link for ${counselor.name} copied!`);
    }
  };

  // Filtered counselors list based on active filters and loci chips
  const filteredCounselors = useMemo(() => {
    return counselors.filter((c) => {
      // Saved only filter
      if (showSavedOnly && !savedIds.includes(c.id)) {
        return false;
      }

      // Locus chip filter
      if (selectedLocusChip) {
        const hasLocus = c.target_loci?.some(
          (l) => l.toLowerCase() === selectedLocusChip.toLowerCase()
        );
        if (!hasLocus) return false;
      }

      // Specialty filter
      if (selectedSpecialty !== "All") {
        const sLower = selectedSpecialty.toLowerCase();
        const matchesSpec =
          c.specialty.toLowerCase().includes(sLower) ||
          c.subspecialties?.some((sub) => sub.toLowerCase().includes(sLower));
        if (!matchesSpec) return false;
      }

      // Country filter
      if (selectedCountry !== "All Countries") {
        if (!c.country.toLowerCase().includes(selectedCountry.toLowerCase())) {
          return false;
        }
      }

      // Telehealth
      if (telehealthOnly && !c.telehealth) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.institution.toLowerCase().includes(q) ||
          c.bio.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.specialty.toLowerCase().includes(q) ||
          c.registration_number.toLowerCase().includes(q) ||
          c.target_loci?.some((l) => l.toLowerCase().includes(q)) ||
          c.target_conditions?.some((tc) => tc.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [
    counselors,
    searchQuery,
    selectedSpecialty,
    selectedCountry,
    telehealthOnly,
    selectedLocusChip,
    showSavedOnly,
    savedIds,
  ]);

  return (
    <PublicDocShell
      sectionLabel="CLINICAL SUPPORT"
      pageTitle="Find a Genetic Counselor"
      activeHref="/clinical-support/find-counselor"
    >
      <div className="space-y-6">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[999999] bg-teal-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25">
                <UserCheck className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Clinical Support Network · NSGC &amp; ABGC Board-Certified
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  Find a Licensed Genetic Counselor
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Connect with verified clinical genetic counselors to interpret multi-generational pedigree patterns, evaluate reproductive risks, and prepare targeted ACMG diagnostic panels with pre-test counseling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {savedIds.length > 0 && (
              <button
                onClick={() => {
                  sound.playSoft();
                  setShowSavedOnly(!showSavedOnly);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-2xs ${
                  showSavedOnly
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/30 font-extrabold"
                    : "bg-white dark:bg-[#14262f] border-border text-foreground hover:bg-surface-low"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showSavedOnly ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>Saved ({savedIds.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playSoft();
                setIsPrepWizardOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#14262f] border border-border text-foreground hover:bg-surface-low transition-all flex items-center gap-2 shadow-2xs hover:border-teal-500/60"
            >
              <Stethoscope className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>Doctor Prep Wizard</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by counselor name, hospital, or gene loci (e.g. BRCA1, CFTR, LDLR, Marfan)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-border bg-surface-low text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Country Selector */}
            <select
              value={selectedCountry}
              onChange={(e) => {
                sound.playSoft();
                setSelectedCountry(e.target.value);
              }}
              className="p-2 text-xs rounded-xl border border-border bg-surface-low text-foreground focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Telehealth Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-foreground whitespace-nowrap">
              <input
                type="checkbox"
                checked={telehealthOnly}
                onChange={(e) => setTelehealthOnly(e.target.checked)}
                className="rounded border-border text-teal-700 focus:ring-teal-700"
              />
              <span className="flex items-center gap-1 font-medium">
                <Video className="w-3.5 h-3.5 text-teal-600" /> Telehealth Available
              </span>
            </label>
          </div>

          {/* Subspecialty Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap pt-1 border-t border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
              Subspecialty:
            </span>
            {SPECIALTY_OPTIONS.map((spec) => {
              const isSelected = selectedSpecialty === spec;
              return (
                <button
                  key={spec}
                  onClick={() => {
                    sound.playSoft();
                    setSelectedSpecialty(spec);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                    isSelected
                      ? "bg-teal-700 text-white shadow-2xs font-semibold"
                      : "bg-surface-low text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {spec}
                </button>
              );
            })}
          </div>

          {/* Gene Loci Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] whitespace-nowrap pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
              Filter by Gene Locus:
            </span>
            {SUGGESTED_LOCI.map((locus) => {
              const isSelected = selectedLocusChip === locus;
              return (
                <button
                  key={locus}
                  onClick={() => {
                    sound.playSoft();
                    setSelectedLocusChip(isSelected ? null : locus);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all shrink-0 ${
                    isSelected
                      ? "bg-teal-700 text-white shadow-2xs"
                      : "bg-surface-low text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {isSelected ? `✓ ${locus}` : locus}
                </button>
              );
            })}
            {selectedLocusChip && (
              <button
                onClick={() => setSelectedLocusChip(null)}
                className="text-[10px] text-teal-700 dark:text-teal-400 font-bold hover:underline ml-1"
              >
                Clear Locus
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing <strong className="text-foreground">{filteredCounselors.length}</strong> licensed counselors
            {selectedSpecialty !== "All" && ` in ${selectedSpecialty}`}
            {selectedLocusChip && ` matching locus ${selectedLocusChip}`}
            {selectedCountry !== "All Countries" && ` in ${selectedCountry}`}
          </span>
          <div className="flex items-center gap-3">
            {isLoading && (
              <span className="flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-400">
                <RefreshCw className="w-3 h-3 animate-spin" /> Updating...
              </span>
            )}
            <span className="text-[11px] font-mono">Open Access · No Login Required</span>
          </div>
        </div>

        {/* Counselors Grid */}
        {filteredCounselors.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#14262f] border border-border text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-foreground">
              No genetic counselors matched your criteria
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your subspecialty, clearing the gene locus chip, or switching to &quot;All Countries&quot; to see available telehealth providers.
            </p>
            <button
              onClick={() => {
                sound.playSoft();
                setSelectedSpecialty("All");
                setSelectedCountry("All Countries");
                setSelectedLocusChip(null);
                setSearchQuery("");
                setTelehealthOnly(false);
                setShowSavedOnly(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 transition-all shadow-2xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCounselors.map((c) => {
              const isSaved = savedIds.includes(c.id);
              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3.5">
                    {/* Header with Portrait & Credentials */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={c.avatar || "/images/counselors/maya-lin.jpg"}
                          alt={c.name}
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (!target.src.includes("maya-lin.jpg")) {
                              target.src = "/images/counselors/maya-lin.jpg";
                            }
                          }}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-teal-500/30 shadow-md group-hover:scale-102 transition-transform duration-300 bg-slate-100 dark:bg-slate-800"
                        />
                        {c.telehealth && (
                          <span
                            title="Telehealth Clinic Online"
                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#14262f] rounded-full flex items-center justify-center shadow-xs"
                          >
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-500/20">
                            {c.specialty}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>4.95</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              ({c.experience_years * 12 + 10})
                            </span>
                          </div>
                        </div>

                        <h3 className="font-extrabold text-base text-foreground leading-snug">
                          {c.name}
                        </h3>
                        <p className="text-[11px] font-medium text-teal-700 dark:text-teal-400 flex items-center gap-1">
                          <Award className="w-3 h-3 shrink-0" />
                          <span className="truncate">{c.professional_title || c.title}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          {c.credentials}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {c.bio}
                    </p>

                    {/* Key Target Loci Pills */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] font-mono text-muted-foreground mr-1">
                        Target Loci:
                      </span>
                      {c.target_loci.map((gene) => (
                        <button
                          key={gene}
                          onClick={() => {
                            sound.playSoft();
                            setSelectedLocusChip(selectedLocusChip === gene ? null : gene);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                            selectedLocusChip === gene
                              ? "bg-teal-700 text-white"
                              : "bg-surface-low border border-border text-foreground hover:border-teal-500"
                          }`}
                        >
                          {gene}
                        </button>
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-auto font-medium">
                        {c.experience_years}+ yrs experience
                      </span>
                    </div>

                    {/* Institution & Metadata */}
                    <div className="space-y-1 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                      <p className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{c.institution}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{c.location}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>Languages: {c.languages.join(", ")}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-medium text-foreground">
                          Next available: ~{c.waitlist_days} business days
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="text-[10px] text-muted-foreground font-medium truncate max-w-[180px]">
                      {c.fee}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Save Heart Button */}
                      <button
                        onClick={() => toggleSaveCounselor(c.id)}
                        className={`p-1.5 rounded-xl border transition-all ${
                          isSaved
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            : "bg-surface-low text-muted-foreground hover:text-foreground border-border"
                        }`}
                        title={isSaved ? "Saved" : "Save counselor"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>

                      {/* View Profile */}
                      <button
                        onClick={() => {
                          sound.playSoft();
                          setDetailCounselor(c);
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-surface-low hover:bg-border text-foreground transition-all border border-border"
                      >
                        Profile
                      </button>

                      {/* Request Intake */}
                      <button
                        onClick={() => {
                          sound.playSuccess();
                          setBookingCounselor(c);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-2xs flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Request Intake</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Educational Explainer Banner matching Screenshot 2 */}
        <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 space-y-2">
          <h3 className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            What to Expect During Your Genetic Counseling Consultation
          </h3>
          <p className="text-xs text-teal-900/80 dark:text-teal-300/80 leading-relaxed">
            Board-certified genetic counselors (CGC) are master&apos;s or doctoral healthcare clinicians specializing in clinical genetics and risk communication. They construct detailed 3-generation pedigrees, assess pre-test diagnostic utility, explain ACMG variant pathogenicity classifications, and navigate insurance prior authorizations under GINA federal protections.
          </p>
        </div>

        {/* Medical Disclaimer Banner matching Screenshot 2 */}
        <div className="p-4 rounded-2xl bg-surface-low border border-border text-xs text-muted-foreground flex items-start gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">Medical Disclaimer:</strong> GeneWise is an intelligent decision-support and health education platform. Content is grounded in peer-reviewed medical evidence and structured laboratory reference intervals. It does not substitute for professional clinical diagnosis or consultation with a qualified doctor.
          </div>
        </div>

        {/* Safety Notice Component */}
        <SafetyNotice />

        {/* Modals */}
        <DoctorPrepWizardModal
          isOpen={isPrepWizardOpen}
          onClose={() => setIsPrepWizardOpen(false)}
          onSelectCounselorForBooking={(c) => {
            setBookingCounselor(c);
          }}
        />

        <CounselorDetailModal
          isOpen={Boolean(detailCounselor)}
          counselor={detailCounselor}
          onClose={() => setDetailCounselor(null)}
          isSaved={detailCounselor ? savedIds.includes(detailCounselor.id) : false}
          onToggleSave={(id) => toggleSaveCounselor(id)}
          onRequestBooking={(c) => {
            setDetailCounselor(null);
            setBookingCounselor(c);
          }}
        />

        <CounselorBookingModal
          isOpen={Boolean(bookingCounselor)}
          counselor={bookingCounselor}
          onClose={() => setBookingCounselor(null)}
          onBookingComplete={(record) => {
            showToast(`Intake packet transmitted to ${bookingCounselor?.name}!`);
          }}
        />
      </div>
    </PublicDocShell>
  );
}
