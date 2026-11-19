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
} from "lucide-react";
import { api } from "@/lib/api";
import { AcademyCertificate } from "@/types/academy";
import { sound } from "@/lib/sound";

export default function CertificatePage() {
  const params = useParams();
  const certId = String(params.certificateId || "GW-CERT-2026-MENDEL02");

  const [cert, setCert] = useState<AcademyCertificate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCert() {
      setLoading(true);
      try {
        const data = await api.getAcademyCertificate(certId);
        setCert(data);
      } catch (err) {
        console.error("Failed to load certificate:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, [certId]);

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

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-[#112128] pb-24 print:bg-white print:p-0 print:pb-0">
      {/* Top Navbar (Hidden on Print) */}
      <div className="border-b border-[#00837b]/10 bg-white/70 backdrop-blur-md sticky top-0 z-20 print:hidden">
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
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Link" : "Copy Link"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-xl bg-[#00837b] hover:bg-[#006e67] text-white shadow transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-6 print:p-0 print:pt-0 print:max-w-none">
        {/* Verification Status Ribbon */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950 shadow-sm print:hidden">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Official GeneWise AI Certificate Record</p>
              <p className="text-[11px] text-emerald-800">
                Cryptographically signed with SHA-256 digest:{" "}
                <span className="font-mono">{cert.signature_digest.slice(0, 16)}...</span>
              </p>
            </div>
          </div>

          <Link
            href={`/verify-certificate?id=${cert.certificate_id}`}
            className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline"
          >
            Public Registry <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Certificate Frame: A4 Landscape Styled */}
        <div
          ref={printRef}
          className="bg-white border-8 border-double border-[#00837b]/30 rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden print:border-4 print:shadow-none print:rounded-none"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#00837b]/60" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#00837b]/60" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#00837b]/60" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#00837b]/60" />

          <div className="relative z-10 text-center space-y-6">
            {/* Header / Brand */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-[#00837b]">
                <GraduationCap className="w-8 h-8" />
                <span className="text-xl font-extrabold tracking-tight uppercase text-gray-900">
                  GeneWise AI Learning Academy
                </span>
              </div>
              <p className="text-[11px] font-semibold tracking-widest text-[#00837b] uppercase">
                Clinical Genomics & Inherited Risk Education Board
              </p>
            </div>

            {/* Certificate Title */}
            <div className="pt-2">
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 tracking-wide">
                Certificate of Completion
              </h1>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#00837b] to-transparent mx-auto mt-2" />
            </div>

            {/* Presentation Wording */}
            <div className="space-y-3 pt-2">
              <p className="text-xs md:text-sm text-gray-600 font-serif italic">
                This certificate is proudly presented to
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#112128] tracking-tight underline decoration-[#00837b]/40 underline-offset-8">
                {cert.learner_name}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 font-serif italic pt-1">
                for successfully completing
              </p>
              <h3 className="text-lg md:text-xl font-bold text-[#00837b] max-w-2xl mx-auto leading-snug">
                {cert.course_title}
              </h3>
              <p className="text-xs text-gray-500">
                offered by GeneWise AI Learning Academy · Category: {cert.course_category} · Score: {cert.final_score_pct}%
              </p>
            </div>

            {/* Signatures & Dynamic QR Code Section */}
            <div className="pt-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Left: Completion Date */}
              <div className="text-center md:text-left space-y-1">
                <p className="text-xs text-gray-500">Completion Date</p>
                <p className="text-sm font-bold text-gray-900">{cert.completion_date}</p>
                <p className="text-[10px] text-gray-400 font-mono">Duration: {cert.duration_hours} Hours</p>
              </div>

              {/* Center: Gold Clinical Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-1 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-full border border-amber-200/80 flex flex-col items-center justify-center text-center p-1">
                    <ShieldCheck className="w-5 h-5 text-amber-950" />
                    <span className="text-[7px] font-bold text-amber-950 uppercase tracking-tighter">
                      GENEWISE VERIFIED
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Issuer Signature & Unique Cert ID */}
              <div className="text-center md:text-right space-y-1">
                <p className="text-xs text-gray-500">Issued by</p>
                <p className="text-sm font-bold text-gray-900">{cert.issuer_name}</p>
                <p className="text-[10px] text-gray-600">{cert.issuer_title}</p>
                <p className="text-[11px] font-mono font-bold text-[#00837b] pt-1">
                  ID: {cert.certificate_id}
                </p>
              </div>
            </div>

            {/* Mandatory Statutory Notice */}
            <div className="pt-6 border-t border-gray-100 text-[10px] text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Clearly state that the certificate is an educational completion credential and not a medical license, professional genetic counselling qualification, or accredited university degree. Content is aligned with ACMG and NSGC educational frameworks for genomics literacy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
