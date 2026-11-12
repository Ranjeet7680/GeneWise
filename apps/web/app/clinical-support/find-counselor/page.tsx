"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  GraduationCap,
  HeartHandshake,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
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
  credentials: string;
  institution: string;
  location: string;
  specialty: "Cardiogenetics" | "Oncogenetics" | "Neurogenetics" | "Pediatric & Rare Diseases" | "Prenatal";
  telehealth: boolean;
  languages: string[];
  bio: string;
  fee: string;
  waitlistDays: number;
}

const COUNSELORS: Counselor[] = [
  {
    id: "c1",
    name: "Dr. Maya Lin, MS, CGC",
    credentials: "ABGC Board Certified Genetic Counselor · Lic #GC-49102",
    institution: "Stanford Center for Inherited Cardiovascular Disease",
    location: "Palo Alto, CA (Licensed in CA, NY, TX, FL)",
    specialty: "Cardiogenetics",
    telehealth: true,
    languages: ["English", "Mandarin"],
    bio: "Specializing in hereditary thoracic aortic aneurysms (Marfan / FBN1, Loeys-Dietz), hypertrophic cardiomyopathy, and familial hypercholesterolemia.",
    fee: "Accepts Most Major Insurances · Self-Pay $150",
    waitlistDays: 4,
  },
  {
    id: "c2",
    name: "Dr. Aaron Vance, MS, CGC",
    credentials: "ABGC Board Certified Genetic Counselor · Lic #GC-38291",
    institution: "Johns Hopkins McKusick-Nathans Institute of Genetic Medicine",
    location: "Baltimore, MD (Multi-State Telehealth Compact)",
    specialty: "Pediatric & Rare Diseases",
    telehealth: true,
    languages: ["English", "Spanish"],
    bio: "Focuses on Mendelian inborn errors of metabolism, cystic fibrosis CFTR panel interpretation, and multi-generational pedigree tracing.",
    fee: "Insurance In-Network · Self-Pay $140",
    waitlistDays: 6,
  },
  {
    id: "c3",
    name: "Dr. Sarah Al-Mansoor, PhD, CGC",
    credentials: "ACMG Fellow · ABGC Board Certified · Lic #GC-52019",
    institution: "Cleveland Clinic Genomic Medicine Institute",
    location: "Cleveland, OH (Licensed across 14 States)",
    specialty: "Neurogenetics",
    telehealth: true,
    languages: ["English", "Arabic", "French"],
    bio: "Expertise in adult-onset neurodegenerative conditions including Huntington Disease (HTT CAG repeats), hereditary ataxias, and familial ALS.",
    fee: "Insurance In-Network · Self-Pay $165",
    waitlistDays: 7,
  },
  {
    id: "c4",
    name: "Elena Rostova, MS, CGC",
    credentials: "ABGC Board Certified · NSGC Member · Lic #GC-61104",
    institution: "Memorial Sloan Kettering Cancer Center",
    location: "New York, NY (NY, NJ, CT Licensed)",
    specialty: "Oncogenetics",
    telehealth: true,
    languages: ["English", "Russian"],
    bio: "Dedicated to hereditary breast and ovarian cancer syndromes (BRCA1/2), Lynch syndrome mismatch repair screening, and cascade family testing.",
    fee: "Insurance In-Network · Self-Pay $175",
    waitlistDays: 3,
  },
];

export default function FindCounselorPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [telehealthOnly, setTelehealthOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

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
    const matchesQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bio.toLowerCase().includes(searchQuery.toLowerCase());
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
                    Clinical Support Network · NSGC & ABGC Board-Certified
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Find a Licensed Genetic Counselor
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Connect with certified genetic counselors to translate family pedigree patterns, evaluate reproductive options, and order targeted clinical genetic testing with pre-test counseling.
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
                  placeholder="Search by counselor name, hospital, or disease specialty (e.g. Marfan, HTT, CFTR)..."
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

          {/* Counselor Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCounselors.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground">{c.name}</h3>
                        {c.telehealth && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200">
                            Telehealth
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-primary font-medium">{c.credentials}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-low border border-border text-muted-foreground">
                      {c.specialty}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {c.bio}
                  </p>

                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{c.institution}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{c.location}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>Next opening: ~{c.waitlistDays} business days</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground">{c.fee}</span>
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
            ))}
          </div>

          {/* Educational Explainer Banner */}
          <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 space-y-2">
            <h3 className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              What to Expect During Your Genetic Counseling Consultation
            </h3>
            <p className="text-xs text-teal-900/80 dark:text-teal-300/80 leading-relaxed">
              Genetic counselors are master&apos;s-trained healthcare professionals specializing in medical genetics and psychosocial counseling. They construct detailed 3-generation pedigrees, help navigate health insurance coverage, and ensure you make fully voluntary, informed healthcare choices without coercion.
            </p>
          </div>

          {/* Interactive Intake Request Modal */}
          {selectedCounselor && (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#14262f] rounded-2xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-in">
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
                  <div className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">
                      Intake Packet Prepared & Dispatched
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      Your referral request and anonymized GeneWise pedigree packet have been prepared. The clinical scheduling coordinator at {selectedCounselor.institution} will reach out within 1 business day.
                    </p>
                    <button
                      onClick={() => setSelectedCounselor(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-surface-low border border-border space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Clinical Focus</span>
                      <p className="font-semibold text-foreground">{selectedCounselor.specialty}</p>
                      <p className="text-[11px] text-muted-foreground">{selectedCounselor.bio}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground">Your Primary Inquiry</label>
                      <select className="w-full p-2 text-xs rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground">
                        <option>Review multi-generational family disease patterns</option>
                        <option>Follow up on a ClinVar variant classification</option>
                        <option>Discuss reproductive carrier screening</option>
                        <option>General hereditary cancer risk evaluation</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="text-[11px] text-teal-900 dark:text-teal-200">
                        GeneWise will automatically attach your encrypted Pedigree Checklist (Zero raw DNA files attached).
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
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-2xs"
                      >
                        Confirm & Transmit Packet
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
