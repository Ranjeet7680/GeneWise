"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  Globe2,
  GraduationCap,
  Heart,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  Phone,
  Share2,
  ShieldCheck,
  Star,
  Stethoscope,
  Video,
  X,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { GeneticCounselor } from "@/types";

interface CounselorDetailModalProps {
  counselor: GeneticCounselor | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestBooking: (counselor: GeneticCounselor) => void;
  onToggleSave?: (counselorId: string) => void;
  isSaved?: boolean;
}

export default function CounselorDetailModal({
  counselor,
  isOpen,
  onClose,
  onRequestBooking,
  onToggleSave,
  isSaved = false,
}: CounselorDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "specialties" | "services" | "consultation" | "credentials">(
    "overview"
  );
  const [sharedToast, setSharedToast] = useState(false);

  if (!isOpen || !counselor) return null;

  const handleShare = () => {
    sound.playSoft();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `https://genewise.ai/clinical-support/find-counselor?id=${counselor.id}`
      );
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    }
  };

  return typeof document !== "undefined"
    ? createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              sound.playSoft();
              onClose();
            }
          }}
          className="fixed inset-0 z-[99999] bg-slate-950/80 dark:bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-fade-in transition-all"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <div className="bg-white dark:bg-[#112128] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-teal-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] max-w-3xl w-full max-h-[90dvh] flex flex-col overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#162731] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      Board-Verified Counselor Profile
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      {counselor.verification_status.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {counselor.name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {onToggleSave && (
                  <button
                    onClick={() => {
                      sound.playSoft();
                      onToggleSave(counselor.id);
                    }}
                    className={`p-2 rounded-xl border transition-all ${
                      isSaved
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                        : "bg-white dark:bg-[#1d3340] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700"
                    }`}
                    title={isSaved ? "Saved to your list" : "Save counselor profile"}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-white dark:bg-[#1d3340] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all"
                  title="Share profile link"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    sound.playSoft();
                    onClose();
                  }}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Banner Notification */}
            {sharedToast && (
              <div className="bg-teal-600 text-white text-xs py-1 px-4 text-center font-medium animate-fade-in">
                Profile link copied to clipboard!
              </div>
            )}

            {/* Nav Tabs */}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-100/80 dark:bg-[#14242d] border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
              {[
                { id: "overview", label: "A. Overview" },
                { id: "specialties", label: "B. Specializations & Loci" },
                { id: "services", label: "C. Clinical Services" },
                { id: "consultation", label: "D. Consultation & Fees" },
                { id: "credentials", label: "E. Credentials & Licensing" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playSoft();
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    activeTab === tab.id
                      ? "bg-teal-700 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#1a2e38] border border-slate-200 dark:border-slate-700/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white dark:bg-[#112128]">
              {/* TAB A: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800">
                    <img
                      src={counselor.avatar || "/images/counselors/maya-lin.jpg"}
                      alt={counselor.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-teal-500/30 shadow-md shrink-0"
                    />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-500/30">
                          {counselor.specialty}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>4.95</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">(120+ verified visits)</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{counselor.name}</h3>
                      <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>{counselor.professional_title || counselor.title}</span>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                        {counselor.credentials}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Professional Background
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {counselor.bio}
                    </p>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Affiliated Institution
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white">{counselor.institution}</p>
                      {counselor.department && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">{counselor.department}</p>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Clinical Practice Location
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white">{counselor.location}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {counselor.city}, {counselor.state_province}, {counselor.country}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Globe2 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Consultation Languages
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white">{counselor.languages.join(", ")}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Clinical Experience &amp; Waitlist
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {counselor.experience_years}+ Years · Next Slot: ~{counselor.waitlist_days} Business Days
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB B: SPECIALIZATIONS & LOCI */}
              {activeTab === "specialties" && (
                <div className="space-y-5">
                  <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Primary Clinical Specialties
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[counselor.specialty, ...(counselor.subspecialties || [])].map((s, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-500/30"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Target Gene Loci */}
                  <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Target Gene Loci &amp; Molecular Pathways
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      This counselor specializes in the clinical interpretation of variants across the following gene panels:
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {counselor.target_loci.map((gene) => (
                        <span
                          key={gene}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white dark:bg-[#1d3340] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-2xs"
                        >
                          {gene}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Target Conditions */}
                  <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Conditions Evaluated &amp; Managed
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {counselor.target_conditions?.map((cond, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white dark:bg-[#1d3340] border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span className="font-medium text-slate-900 dark:text-slate-100">{cond}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB C: CLINICAL SERVICES */}
              {activeTab === "services" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Scope of Clinical Genetics Services
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Comprehensive clinical genetics support following NSGC &amp; ACMG practice guidelines:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {(
                      counselor.services_offered || [
                        "3-Generation Pedigree Construction and Multi-Generational Pattern Analysis",
                        "ACMG Secondary Findings Clinical Review (Tier 1 Genomic Actionability)",
                        "Pre-Test and Post-Test Diagnostic Multi-Gene Panel Counseling",
                        "Cascade Family Relative Testing Protocols & Clinical Summary Letters",
                        "Variant of Uncertain Significance (VUS) Phenotypic Correlation & Reclassification Review",
                      ]
                    ).map((service, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-teal-500/20">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{service}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                            Delivered in compliance with genetic non-discrimination guidelines and certified clinical standards.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB D: CONSULTATION & FEES */}
              {activeTab === "consultation" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 space-y-1.5">
                    <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200">
                      Financial Transparency &amp; Insurance Coverage
                    </h4>
                    <p className="text-xs text-teal-900 dark:text-teal-200 font-medium">
                      {counselor.fee}
                    </p>
                    <p className="text-[11px] text-teal-900/80 dark:text-teal-300/80 leading-relaxed">
                      Most commercial insurances cover board-certified genetic counseling for actionable family histories (e.g. HBOC, Lynch, Marfan, CFTR). Self-pay patients receive a transparent bundled rate covering pedigree analysis and follow-up consultation letter.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Available Consultation Formats
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <Video className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          <span>Telehealth Video Consultation</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                          FIPS 140-3 encrypted, HIPAA/ISO-compliant video room with live screen-sharing for pedigree review.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          <span>In-Person Hospital Clinic</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                          Face-to-face consultation at {counselor.institution} with physical exam coordination if indicated.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Estimated Next Available Appointment:</span>
                    <span className="font-bold text-slate-900 dark:text-white">~{counselor.waitlist_days} Business Days</span>
                  </div>
                </div>
              )}

              {/* TAB E: CREDENTIALS & LICENSING */}
              {activeTab === "credentials" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Primary Regulatory Registration
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        Active &amp; Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Issuing Board / Organization:</span>
                        <p className="font-bold text-slate-900 dark:text-white">{counselor.certification_org}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Registration / License Number:</span>
                        <p className="font-bold text-slate-900 dark:text-white font-mono">{counselor.registration_number}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Academic Qualification:</span>
                        <p className="font-bold text-slate-900 dark:text-white">{counselor.qualification}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Verification Source:</span>
                        <p className="font-bold text-teal-700 dark:text-teal-400">
                          {counselor.verification_source || "National Registry Verified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {counselor.credentials_list && counselor.credentials_list.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Documented Credentials ({counselor.credentials_list.length})
                      </h4>
                      <div className="space-y-1.5">
                        {counselor.credentials_list.map((cred, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{cred.credential_type}: </span>
                              <span className="text-slate-600 dark:text-slate-400">{cred.issuer_org}</span>
                              <span className="ml-2 font-mono text-[10px] text-teal-700 dark:text-teal-400">
                                ({cred.credential_id})
                              </span>
                            </div>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              {cred.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Statutory Legal Disclaimer */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#162731] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Regulatory Note:</strong> All genetic counselors listed in the GeneWise AI Clinical Support Network are verified through accredited national boards (e.g. ABGC, BGCI, GCRB, EBMG). Consultations are conducted independently between patient and provider under governing clinical licensure.
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#162731] flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  sound.playSoft();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              >
                Close
              </button>

              <button
                onClick={() => {
                  sound.playSuccess();
                  onClose();
                  onRequestBooking(counselor);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-600 text-white transition-all shadow-md flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Request Clinical Consultation</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
}
