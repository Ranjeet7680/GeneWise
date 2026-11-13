"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
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
import { sound } from "@/lib/sound";

interface Counselor {
  id: string;
  name: string;
  title: string;
  credentials: string;
  institution: string;
  location: string;
  specialty: "Cardiogenetics" | "Oncogenetics" | "Neurogenetics" | "Pediatric & Rare Diseases" | "Prenatal";
  telehealth: boolean;
  languages: string[];
  bio: string;
  fee: string;
  waitlistDays: number;
  avatar: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  npiNumber: string;
  abgcId: string;
  keyLoci: string[];
}

const COUNSELORS: Counselor[] = [
  {
    id: "c1",
    name: "Dr. Maya Lin, MS, CGC",
    title: "Senior Cardiovascular Genetic Counselor",
    credentials: "ABGC Board Certified Genetic Counselor · Lic #GC-49102",
    institution: "Stanford Center for Inherited Cardiovascular Disease",
    location: "Palo Alto, CA (Licensed in CA, NY, TX, FL)",
    specialty: "Cardiogenetics",
    telehealth: true,
    languages: ["English", "Mandarin"],
    bio: "Specializing in hereditary thoracic aortic aneurysms (Marfan / FBN1, Loeys-Dietz), hypertrophic cardiomyopathy, and familial hypercholesterolemia cascade testing.",
    fee: "Accepts Most Major Insurances · Self-Pay $150",
    waitlistDays: 4,
    avatar: "/images/counselors/maya-lin.jpg",
    rating: 4.96,
    reviewsCount: 142,
    experienceYears: 11,
    npiNumber: "1841295830",
    abgcId: "CGC-49102",
    keyLoci: ["FBN1", "TGFBR1", "LDLR", "APOB", "PCSK9"],
  },
  {
    id: "c2",
    name: "Dr. Aaron Vance, MS, CGC",
    title: "Director of Pediatric Genomics & Inborn Errors",
    credentials: "ABGC Board Certified Genetic Counselor · Lic #GC-38291",
    institution: "Johns Hopkins McKusick-Nathans Institute of Genetic Medicine",
    location: "Baltimore, MD (Multi-State Telehealth Compact)",
    specialty: "Pediatric & Rare Diseases",
    telehealth: true,
    languages: ["English", "Spanish"],
    bio: "Focuses on Mendelian inborn errors of metabolism, cystic fibrosis CFTR panel interpretation, carrier trios, and multi-generational pedigree tracing.",
    fee: "Insurance In-Network · Self-Pay $140",
    waitlistDays: 6,
    avatar: "/images/counselors/aaron-vance.jpg",
    rating: 4.93,
    reviewsCount: 98,
    experienceYears: 14,
    npiNumber: "1679541203",
    abgcId: "CGC-38291",
    keyLoci: ["CFTR", "GAA", "PAH", "G6PD", "SMN1"],
  },
  {
    id: "c3",
    name: "Dr. Sarah Al-Mansoor, PhD, CGC",
    title: "Lead Neurogenomics Specialist & ACMG Fellow",
    credentials: "ACMG Fellow · ABGC Board Certified · Lic #GC-52019",
    institution: "Cleveland Clinic Genomic Medicine Institute",
    location: "Cleveland, OH (Licensed across 14 States)",
    specialty: "Neurogenetics",
    telehealth: true,
    languages: ["English", "Arabic", "French"],
    bio: "Expertise in adult-onset neurodegenerative conditions including Huntington Disease (HTT CAG repeats), hereditary ataxias, and familial ALS surveillance.",
    fee: "Insurance In-Network · Self-Pay $165",
    waitlistDays: 7,
    avatar: "/images/counselors/sarah-al-mansoor.jpg",
    rating: 4.98,
    reviewsCount: 167,
    experienceYears: 16,
    npiNumber: "1922384751",
    abgcId: "CGC-52019",
    keyLoci: ["HTT", "ATXN1", "SOD1", "C9orf72"],
  },
  {
    id: "c4",
    name: "Elena Rostova, MS, CGC",
    title: "Hereditary Oncology Lead Clinical Geneticist",
    credentials: "ABGC Board Certified · NSGC Member · Lic #GC-61104",
    institution: "Memorial Sloan Kettering Cancer Center",
    location: "New York, NY (NY, NJ, CT Licensed)",
    specialty: "Oncogenetics",
    telehealth: true,
    languages: ["English", "Russian"],
    bio: "Dedicated to hereditary breast and ovarian cancer syndromes (BRCA1/2), Lynch syndrome mismatch repair screening, and cascade family testing.",
    fee: "Insurance In-Network · Self-Pay $175",
    waitlistDays: 3,
    avatar: "/images/counselors/elena-rostova.jpg",
    rating: 4.95,
    reviewsCount: 112,
    experienceYears: 9,
    npiNumber: "1487263910",
    abgcId: "CGC-61104",
    keyLoci: ["BRCA1", "BRCA2", "MLH1", "MSH2", "TP53"],
  },
];

export default function FindCounselorPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [telehealthOnly, setTelehealthOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [intakeInquiry, setIntakeInquiry] = useState<string>(
    "Review multi-generational family disease patterns"
  );
  const [intakeNotes, setIntakeNotes] = useState<string>("");

  const specialties = [
    "All",
    "Cardiogenetics",
    "Oncogenetics",
    "Neurogenetics",
    "Pediatric & Rare Diseases",
    "Prenatal",
  ];

  const filteredCounselors = COUNSELORS.filter((c) => {
    const matchesSpecialty =
      selectedSpecialty === "All" || c.specialty === selectedSpecialty;
    const matchesTelehealth = !telehealthOnly || c.telehealth;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      c.name.toLowerCase().includes(query) ||
      c.institution.toLowerCase().includes(query) ||
      c.bio.toLowerCase().includes(query) ||
      c.keyLoci.some((l) => l.toLowerCase().includes(query));
    return matchesSpecialty && matchesTelehealth && matchesQuery;
  });

  return (
    <PublicDocShell
      sectionLabel="CLINICAL SUPPORT"
      pageTitle="Find a Genetic Counselor"
      activeHref="/clinical-support/find-counselor"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25">
                <UserCheck className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
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
            <Link
              href="/clinical-support/discussion-prep"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#14262f] border border-border text-foreground hover:bg-surface-low transition-all flex items-center gap-2 shadow-2xs"
            >
              <Stethoscope className="w-4 h-4 text-primary" />
              <span>Doctor Prep Wizard</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by counselor name, hospital, or gene loci (e.g. BRCA1, CFTR, LDLR, Marfan)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-surface-low text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-foreground whitespace-nowrap">
              <input
                type="checkbox"
                checked={telehealthOnly}
                onChange={(e) => setTelehealthOnly(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="flex items-center gap-1 font-medium">
                <Video className="w-3.5 h-3.5 text-teal-600" /> Telehealth Available
              </span>
            </label>
          </div>

          {/* Specialty Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
              Subspecialty:
            </span>
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => {
                  sound.playSoft();
                  setSelectedSpecialty(spec);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedSpecialty === spec
                    ? "bg-teal-700 text-white shadow-2xs font-semibold"
                    : "bg-surface-low text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Counselor Directory Grid with AI-Generated Portraits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCounselors.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3.5">
                {/* Counselor Profile Header with High-Resolution Portrait */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-teal-500/30 shadow-md group-hover:scale-102 transition-transform duration-300"
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
                        <span>{c.rating}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          ({c.reviewsCount})
                        </span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-base text-foreground leading-snug">
                      {c.name}
                    </h3>
                    <p className="text-[11px] font-medium text-teal-700 dark:text-teal-400 flex items-center gap-1">
                      <Award className="w-3 h-3 shrink-0" />
                      <span className="truncate">{c.title}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {c.credentials}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {c.bio}
                </p>

                {/* Key Target Loci Pills */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-mono text-muted-foreground mr-1">Target Loci:</span>
                  {c.keyLoci.map((gene) => (
                    <span
                      key={gene}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-low border border-border text-foreground"
                    >
                      {gene}
                    </span>
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-auto font-medium">
                    {c.experienceYears}+ yrs experience
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
                      Next available: ~{c.waitlistDays} business days
                    </span>
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <div className="text-[10px] text-muted-foreground font-medium">
                  {c.fee}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playSuccess();
                      setSelectedCounselor(c);
                      setBookingSuccess(false);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Request Intake</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Educational Explainer Banner */}
        <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 space-y-2">
          <h3 className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            What to Expect During Your Genetic Counseling Consultation
          </h3>
          <p className="text-xs text-teal-900/80 dark:text-teal-300/80 leading-relaxed">
            Board-certified genetic counselors (CGC) are master&apos;s or doctoral healthcare clinicians specializing in clinical genetics and risk communication. They construct detailed 3-generation pedigrees, assess pre-test diagnostic utility, explain ACMG variant pathogenicity classifications, and navigate insurance prior authorizations under GINA federal protections.
          </p>
        </div>

        {/* Interactive Intake Request Modal with Deep Frosted Glass Background Blur */}
        {selectedCounselor && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedCounselor(null);
            }}
            className="fixed inset-0 z-[100] bg-slate-950/75 dark:bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in transition-all"
            style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
          >
            <div className="bg-white/95 dark:bg-[#112128]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 dark:border-teal-500/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] max-w-lg w-full p-6 space-y-4 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Consultation Intake Request
                  </span>
                  <h3 className="font-bold text-sm text-foreground">
                    Connect with {selectedCounselor.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCounselor(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-surface-low"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-base text-foreground">
                    Clinical Intake Packet Transmitted
                  </h4>
                  <div className="p-3 rounded-xl bg-surface-low border border-border text-left space-y-1 text-[11px]">
                    <div className="flex justify-between text-muted-foreground font-mono">
                      <span>Routing Node:</span>
                      <span className="text-foreground font-bold">HL7-FHIR-GATEWAY-2026</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-mono">
                      <span>Attending Counselor:</span>
                      <span className="text-foreground">{selectedCounselor.name}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-mono">
                      <span>Institution:</span>
                      <span className="text-foreground truncate max-w-[240px]">{selectedCounselor.institution}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-mono">
                      <span>FIPS Hash:</span>
                      <span className="text-teal-700 dark:text-teal-400">0x7F9B...4E12 (Verified)</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Your referral request and anonymized GeneWise pedigree packet have been prepared. The clinical scheduling coordinator at {selectedCounselor.institution} will reach out within 1 business day.
                  </p>
                  <button
                    onClick={() => setSelectedCounselor(null)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 transition-all shadow-xs"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Counselor Mini Header */}
                  <div className="p-3.5 rounded-xl bg-surface-low border border-border flex items-center gap-3">
                    <img
                      src={selectedCounselor.avatar}
                      alt={selectedCounselor.name}
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-teal-500/30 shrink-0"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground text-xs">
                          {selectedCounselor.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                          {selectedCounselor.specialty}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {selectedCounselor.institution}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {selectedCounselor.credentials} · NPI #{selectedCounselor.npiNumber}
                      </p>
                    </div>
                  </div>

                  {/* Primary Inquiry Selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground">
                      Your Primary Consultation Inquiry
                    </label>
                    <select
                      value={intakeInquiry}
                      onChange={(e) => setIntakeInquiry(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground focus:ring-1 focus:ring-teal-700"
                    >
                      <option>Review multi-generational family disease patterns</option>
                      <option>Follow up on a ClinVar variant classification</option>
                      <option>Discuss reproductive carrier screening (CFTR, SMN1)</option>
                      <option>Hereditary cardiovascular early-onset surveillance</option>
                      <option>General hereditary cancer risk evaluation (BRCA1/2)</option>
                    </select>
                  </div>

                  {/* Optional Notes */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground">
                      Clinical Context / Specific Symptoms (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={intakeNotes}
                      onChange={(e) => setIntakeNotes(e.target.value)}
                      placeholder="e.g., Paternal grandfather diagnosed with CAD at 58, father diagnosed with hypertension at 45..."
                      className="w-full p-2.5 text-xs rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground focus:ring-1 focus:ring-teal-700 resize-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="text-[11px] text-teal-900 dark:text-teal-200">
                      GeneWise will automatically attach your encrypted Pedigree Checklist (Zero raw DNA files attached, FIPS 140-3 protected).
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedCounselor(null)}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-surface-low"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        sound.playSuccess();
                        setBookingSuccess(true);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-2xs flex items-center gap-1.5"
                    >
                      <span>Confirm &amp; Transmit Packet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <SafetyNotice />
      </div>
    </PublicDocShell>
  );
}
