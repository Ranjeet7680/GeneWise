"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Award,
  Download,
  Printer,
  Copy,
  Check,
  Share2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Pencil,
  UserCheck,
  User,
  RotateCcw,
  QrCode,
  FileCheck,
  BadgeCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { AcademyCertificate } from "@/types/academy";
import { sound } from "@/lib/sound";
import { useOptionalAuth } from "@/lib/auth";

export default function CertificatePage() {
  const params = useParams();
  const certId = String(params.certificateId || "GW-CERT-2026-MENDEL02");
  const auth = useOptionalAuth();

  const [cert, setCert] = useState<AcademyCertificate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCert() {
      setLoading(true);
      try {
        const data = await api.getAcademyCertificate(certId);
        let resolvedName = data.learner_name;

        if (typeof window !== "undefined") {
          const certSpecific = localStorage.getItem(`academy_custom_learner_name_${certId}`);
          const globalCustom = localStorage.getItem("academy_custom_learner_name");
          if (certSpecific && certSpecific.trim()) {
            resolvedName = certSpecific.trim();
          } else if (globalCustom && globalCustom.trim()) {
            resolvedName = globalCustom.trim();
          } else if (auth?.user?.full_name && auth.user.full_name.trim()) {
            resolvedName = auth.user.full_name.trim();
          }
        } else if (auth?.user?.full_name && auth.user.full_name.trim()) {
          resolvedName = auth.user.full_name.trim();
        }

        setCert({ ...data, learner_name: resolvedName });
        setNameInput(resolvedName);
      } catch (err) {
        console.error("Failed to load certificate:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, [certId, auth?.user?.full_name]);

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    setCopied(true);
    sound.playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    sound.playClick();
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleSaveName = (targetName?: string) => {
    const chosenName = (targetName !== undefined ? targetName : nameInput).trim();
    if (!chosenName || !cert) return;

    if (typeof window !== "undefined") {
      localStorage.setItem(`academy_custom_learner_name_${certId}`, chosenName);
      localStorage.setItem("academy_custom_learner_name", chosenName);
    }

    setCert((prev) => (prev ? { ...prev, learner_name: chosenName } : prev));
    setNameInput(chosenName);
    setIsEditingName(false);
    sound.playSuccess();
  };

  const handleResetToDefault = () => {
    if (!cert) return;
    const defaultName = "Priya Sharma";
    if (typeof window !== "undefined") {
      localStorage.removeItem(`academy_custom_learner_name_${certId}`);
      localStorage.removeItem("academy_custom_learner_name");
    }
    const target = auth?.user?.full_name?.trim() || defaultName;
    setCert((prev) => (prev ? { ...prev, learner_name: target } : prev));
    setNameInput(target);
    setIsEditingName(false);
    sound.playClick();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4fbfa] flex items-center justify-center">
        <Award className="w-10 h-10 text-amber-500 animate-bounce" />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-[#f4fbfa] p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Certificate Not Found</h2>
        <Link href="/academy" className="text-sm text-[#00837b] underline">
          Return to Academy Hub
        </Link>
      </div>
    );
  }

  const authUserName = auth?.user?.full_name?.trim();
  const showApplyAuthBanner =
    authUserName &&
    cert.learner_name.toLowerCase() !== authUserName.toLowerCase() &&
    !isEditingName;

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-[#112128] pb-24 print:bg-white print:p-0 print:pb-0 print:m-0">
      {/* Precision PDF & Landscape Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 landscape;
          margin: 0mm;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            font-size: 12pt;
          }
          .print-certificate-container {
            width: 297mm !important;
            height: 210mm !important;
            max-width: 297mm !important;
            max-height: 210mm !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 10mm 14mm !important;
            box-shadow: none !important;
            border: 6px double #00837b !important;
            border-radius: 0 !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .print-hide {
            display: none !important;
          }
        }
      `}} />

      {/* Top Navbar (Hidden on Print) */}
      <div className="border-b border-[#00837b]/10 bg-white/70 backdrop-blur-md sticky top-0 z-20 print:hidden print-hide">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/academy" className="hover:text-[#00837b]">
              Academy
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/academy/my-courses" className="hover:text-[#00837b]">
              My Certificates
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-mono text-[#00837b] font-semibold">{cert.certificate_id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNameInput(cert.learner_name);
                setIsEditingName((prev) => !prev);
                sound.playClick();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs"
              title="Add or edit user name on certificate"
            >
              <Pencil className="w-3.5 h-3.5 text-[#00837b]" />
              <span>{isEditingName ? "Close Editor" : "Edit Name"}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Link" : "Copy Link"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-xl bg-[#00837b] hover:bg-[#006e67] text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Download as PDF or Print in Landscape"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-4 print:p-0 print:pt-0 print:max-w-none print:m-0">
        {/* Verification Status Ribbon */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950 shadow-sm print:hidden print-hide">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold flex items-center gap-1.5">
                Official GeneWise AI Certificate Record
                <span className="text-[10px] font-mono font-normal bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                  ACMG / NSGC Aligned
                </span>
              </p>
              <p className="text-[11px] text-emerald-800 font-mono">
                SHA-256 Digest: {cert.signature_digest.slice(0, 24)}...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-emerald-700 hidden sm:inline">
              Landscape A4 PDF Ready
            </span>
            <Link
              href={`/verify-certificate?id=${cert.certificate_id}`}
              className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline"
            >
              Public Registry <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Suggest applying user's account name banner */}
        {showApplyAuthBanner && (
          <div className="bg-teal-50/90 border border-teal-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-teal-950 shadow-2xs print:hidden print-hide animate-fadeIn">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#00837b] flex-shrink-0" />
              <span>
                Signed in as <strong>{authUserName}</strong>. Would you like your profile name displayed on this credential?
              </span>
            </div>
            <button
              onClick={() => handleSaveName(authUserName)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#00837b] hover:bg-[#006e67] px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex-shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Apply &quot;{authUserName}&quot;
            </button>
          </div>
        )}

        {/* Certificate Frame: A4 Landscape Styled */}
        <div
          ref={printRef}
          className="print-certificate-container bg-white border-8 border-double border-[#00837b]/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden print:border-4 print:shadow-none print:rounded-none"
        >
          {/* Subtle Security Guilloche Watermark Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center overflow-hidden">
            <svg width="800" height="600" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="400" cy="300" r="280" stroke="#00837b" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx="400" cy="300" r="230" stroke="#00837b" strokeWidth="1.5" />
              <circle cx="400" cy="300" r="180" stroke="#00837b" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="400" cy="300" r="130" stroke="#00837b" strokeWidth="1" />
              <path d="M100 300 Q400 100 700 300 T100 300" stroke="#00837b" strokeWidth="1" />
              <path d="M100 300 Q400 500 700 300 T100 300" stroke="#00837b" strokeWidth="1" />
            </svg>
          </div>

          {/* Decorative Corner Ornaments */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#00837b]/60" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#00837b]/60" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#00837b]/60" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#00837b]/60" />

          {/* Inner hairline border */}
          <div className="absolute inset-2 md:inset-3 border border-[#00837b]/15 pointer-events-none" />

          <div className="relative z-10 text-center space-y-5 md:space-y-6">
            {/* Header / Brand */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2.5 text-[#00837b]">
                <GraduationCap className="w-8 h-8 text-[#00837b]" />
                <span className="text-xl md:text-2xl font-extrabold tracking-tight uppercase text-gray-900 font-serif">
                  GeneWise AI Learning Academy
                </span>
              </div>
              <p className="text-[10px] md:text-[11px] font-bold tracking-widest text-[#00837b] uppercase">
                Clinical Genomics & Inherited Risk Education Board
              </p>
              <div className="flex items-center gap-2 text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                <span>ACMG Standards Aligned</span>
                <span>•</span>
                <span>NSGC Genomics Framework</span>
                <span>•</span>
                <span>Credential Directorate</span>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="pt-1">
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 tracking-wide">
                Certificate of Completion
              </h1>
              <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-[#00837b] to-transparent mx-auto mt-2" />
            </div>

            {/* Presentation Wording & Recipient Name */}
            <div className="space-y-2.5 pt-1">
              <p className="text-xs md:text-sm text-gray-600 font-serif italic">
                This certificate is proudly conferred upon
              </p>

              {/* Inline Editor or Displayed Name */}
              {isEditingName ? (
                <div className="max-w-lg mx-auto p-4 bg-teal-50/80 border-2 border-dashed border-[#00837b]/40 rounded-2xl space-y-3 print:hidden print-hide shadow-xs">
                  <div className="text-center space-y-1">
                    <span className="text-[11px] font-bold text-[#00837b] uppercase tracking-wider block">
                      Add / Edit User Name on Certificate
                    </span>
                    <p className="text-xs text-gray-500">
                      Enter your full name as it should appear on your verified credential and PDF export.
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Dr. Priya Sharma or Vikram Patel"
                      className="w-full px-4 py-2.5 border-2 border-[#00837b] rounded-xl text-center text-xl font-bold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00837b]/30 shadow-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") setIsEditingName(false);
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      {authUserName && authUserName !== nameInput && (
                        <button
                          type="button"
                          onClick={() => setNameInput(authUserName)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-teal-200 hover:bg-teal-50 text-[#00837b] font-medium transition-colors flex items-center gap-1 text-[11px]"
                        >
                          <UserCheck className="w-3 h-3" />
                          Use profile name
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="px-2 py-1 rounded-lg text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 text-[11px]"
                        title="Reset to default certificate name"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveName()}
                        className="px-4 py-1.5 bg-[#00837b] hover:bg-[#006e67] text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1 text-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Save Name
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(cert.learner_name);
                          setIsEditingName(false);
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="group relative inline-flex items-center justify-center gap-2.5 pt-1">
                  <h2 className="text-3xl md:text-5xl font-serif font-black text-[#112128] tracking-tight underline decoration-[#00837b]/40 underline-offset-8">
                    {cert.learner_name}
                  </h2>
                  <button
                    onClick={() => {
                      setNameInput(cert.learner_name);
                      setIsEditingName(true);
                      sound.playClick();
                    }}
                    title="Change / Add user name on certificate"
                    className="p-1.5 rounded-xl bg-teal-50 hover:bg-[#00837b] hover:text-white text-[#00837b] border border-teal-200/60 shadow-2xs transition-all print:hidden print-hide"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p className="text-xs md:text-sm text-gray-600 font-serif italic pt-1">
                for successfully completing the curriculum and demonstrating clinical competency in
              </p>
              <h3 className="text-lg md:text-2xl font-bold text-[#00837b] max-w-2xl mx-auto leading-snug">
                {cert.course_title}
              </h3>
              <p className="text-xs text-gray-500">
                Category: <span className="font-semibold text-gray-700">{cert.course_category}</span> · Examination Score:{" "}
                <span className="font-semibold text-gray-700">{cert.final_score_pct}%</span> · Credential Standard: Level II
              </p>
            </div>

            {/* Signatures & Dynamic QR Code Section */}
            <div className="pt-6 md:pt-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Left: Completion Date & Scannable QR Code */}
              <div className="text-center md:text-left flex items-center justify-center md:justify-start gap-3">
                {/* SVG QR Code */}
                <div className="p-1.5 bg-white border border-gray-200 rounded-xl shadow-xs">
                  <svg width="54" height="54" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="33" height="33" fill="#ffffff" />
                    {/* Top-Left Finder */}
                    <rect x="2" y="2" width="7" height="7" fill="#00837b" />
                    <rect x="3" y="3" width="5" height="5" fill="#ffffff" />
                    <rect x="4" y="4" width="3" height="3" fill="#00837b" />
                    {/* Top-Right Finder */}
                    <rect x="24" y="2" width="7" height="7" fill="#00837b" />
                    <rect x="25" y="3" width="5" height="5" fill="#ffffff" />
                    <rect x="26" y="4" width="3" height="3" fill="#00837b" />
                    {/* Bottom-Left Finder */}
                    <rect x="2" y="24" width="7" height="7" fill="#00837b" />
                    <rect x="3" y="25" width="5" height="5" fill="#ffffff" />
                    <rect x="4" y="26" width="3" height="3" fill="#00837b" />
                    {/* Pattern Matrix Bits */}
                    <rect x="11" y="2" width="2" height="2" fill="#00837b" />
                    <rect x="15" y="2" width="2" height="2" fill="#00837b" />
                    <rect x="19" y="2" width="2" height="2" fill="#00837b" />
                    <rect x="11" y="6" width="2" height="2" fill="#00837b" />
                    <rect x="15" y="6" width="2" height="2" fill="#00837b" />
                    <rect x="11" y="10" width="2" height="2" fill="#00837b" />
                    <rect x="13" y="12" width="2" height="2" fill="#00837b" />
                    <rect x="17" y="12" width="2" height="2" fill="#00837b" />
                    <rect x="2" y="12" width="2" height="2" fill="#00837b" />
                    <rect x="6" y="12" width="2" height="2" fill="#00837b" />
                    <rect x="2" y="16" width="2" height="2" fill="#00837b" />
                    <rect x="6" y="16" width="2" height="2" fill="#00837b" />
                    <rect x="11" y="16" width="2" height="2" fill="#00837b" />
                    <rect x="15" y="16" width="2" height="2" fill="#00837b" />
                    <rect x="19" y="16" width="2" height="2" fill="#00837b" />
                    <rect x="23" y="16" width="2" height="2" fill="#00837b" />
                    <rect x="27" y="16" width="2" height="2" fill="#00837b" />
                    <rect x="13" y="20" width="2" height="2" fill="#00837b" />
                    <rect x="17" y="20" width="2" height="2" fill="#00837b" />
                    <rect x="21" y="20" width="2" height="2" fill="#00837b" />
                    <rect x="11" y="24" width="2" height="2" fill="#00837b" />
                    <rect x="15" y="24" width="2" height="2" fill="#00837b" />
                    <rect x="19" y="24" width="2" height="2" fill="#00837b" />
                    <rect x="25" y="24" width="2" height="2" fill="#00837b" />
                    <rect x="11" y="28" width="2" height="2" fill="#00837b" />
                    <rect x="17" y="28" width="2" height="2" fill="#00837b" />
                    <rect x="21" y="28" width="2" height="2" fill="#00837b" />
                    <rect x="27" y="28" width="2" height="2" fill="#00837b" />
                  </svg>
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    Completion Date
                  </p>
                  <p className="text-xs md:text-sm font-bold text-gray-900">{cert.completion_date}</p>
                  <p className="text-[10px] text-gray-500 font-mono">Duration: {cert.duration_hours} Hours (0.4 CEU)</p>
                  <p className="text-[9px] text-[#00837b] font-semibold">Scan QR to verify</p>
                </div>
              </div>

              {/* Center: Enhanced Gold Clinical Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-1.5 shadow-lg flex items-center justify-center ring-4 ring-amber-100/80">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-amber-900/40 flex flex-col items-center justify-center text-center p-1 bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500">
                    <ShieldCheck className="w-6 h-6 text-amber-950 stroke-[2.2]" />
                    <span className="text-[7.5px] font-black text-amber-950 uppercase tracking-tighter leading-none mt-0.5">
                      GENEWISE VERIFIED
                    </span>
                    <span className="text-[6px] font-bold text-amber-900 tracking-widest mt-0.5">
                      ★★★★★
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-gray-400 mt-1 uppercase tracking-wider">
                  Official Seal
                </span>
              </div>

              {/* Right: Realistic Executive Signature & Directorate */}
              <div className="text-center md:text-right space-y-1">
                {/* Executive Signature Flourish */}
                <div className="h-9 flex items-center justify-center md:justify-end">
                  <svg width="140" height="36" viewBox="0 0 140 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6 24 C20 8, 30 28, 45 14 C55 4, 60 26, 75 16 C85 10, 92 28, 105 18 C115 12, 125 22, 134 16"
                      stroke="#00837b"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M25 30 Q70 12 120 28"
                      stroke="#00837b"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                  </svg>
                </div>
                <div className="w-36 h-0.5 bg-gray-300 mx-auto md:ml-auto md:mr-0" />
                <p className="text-xs font-bold text-gray-900">{cert.issuer_name}</p>
                <p className="text-[10px] text-gray-600">{cert.issuer_title}</p>
                <p className="text-[11px] font-mono font-bold text-[#00837b] pt-0.5">
                  ID: {cert.certificate_id}
                </p>
              </div>
            </div>

            {/* Mandatory Statutory Notice */}
            <div className="pt-4 border-t border-gray-100 text-[9px] text-gray-400 leading-relaxed max-w-3xl mx-auto">
              This credential certifies successful educational assessment aligned with American College of Medical Genetics and Genomics (ACMG) and National Society of Genetic Counselors (NSGC) core genomic competency frameworks. It constitutes an educational completion credential, authenticated via cryptographic record digest {cert.signature_digest.slice(0, 16)}...
            </div>
          </div>
        </div>

        {/* PDF Export Best Practices & Printing Help Tip */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 text-xs text-gray-600 space-y-1 print:hidden print-hide">
          <p className="font-bold text-gray-900 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-[#00837b]" />
            PDF & Printing Instructions:
          </p>
          <p className="text-gray-500 text-[11px]">
            When the browser print dialog opens, choose <strong>Save as PDF</strong> as the destination. The certificate has been calibrated for <strong>A4 Landscape</strong> orientation with exact color calibration, so your name, gold seal, and cryptographic markers print cleanly on a single page.
          </p>
        </div>
      </div>
    </div>
  );
}
