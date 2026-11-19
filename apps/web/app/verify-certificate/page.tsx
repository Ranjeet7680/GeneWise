"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  ExternalLink,
  GraduationCap,
  Award,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { CertificateVerificationResult } from "@/types/academy";
import { sound } from "@/lib/sound";

function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [certIdInput, setCertIdInput] = useState<string>(initialId);
  const [verificationResult, setVerificationResult] = useState<CertificateVerificationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    if (initialId) {
      verifyId(initialId);
    }
  }, [initialId]);

  const verifyId = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setHasSearched(true);
    sound.playClick();
    try {
      const res = await api.verifyAcademyCertificate(id.trim());
      setVerificationResult(res);
      if (res.verified) {
        sound.playSuccess();
      } else {
        sound.playWarning();
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setVerificationResult({
        certificate_id: id,
        status: "invalid",
        verified: false,
        message: "Network or registry validation error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyId(certIdInput);
  };

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-[#112128] pb-24">
      {/* Top Breadcrumb */}
      <div className="border-b border-[#00837b]/10 bg-white/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/academy" className="hover:text-[#00837b]">
              Academy Hub
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#00837b] font-medium">Public Certificate Verification</span>
          </div>

          <span className="text-[11px] font-mono text-gray-500">
            Zero-PII Public Validation Engine
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#00837b]/10 text-[#00837b] flex items-center justify-center mx-auto border border-[#00837b]/20 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Verify GeneWise AI Certificate
          </h1>
          <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
            Verify the authenticity of an official GeneWise AI Certificate of Completion. Enter the unique identifier printed on the credential or scanned from its QR code.
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSearchSubmit} className="bg-white border border-[#00837b]/15 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. GW-CERT-2026-MENDEL02"
                value={certIdInput}
                onChange={(e) => setCertIdInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00837b] font-mono bg-gray-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !certIdInput.trim()}
              className="w-full sm:w-auto bg-[#00837b] hover:bg-[#006e67] text-white font-bold px-6 py-3 rounded-2xl text-sm shadow transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "Verifying..." : "Verify Certificate"}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span>Example: GW-CERT-2026-MENDEL02</span>
            <span>Cryptographic Registry Lookup</span>
          </div>
        </form>

        {/* Verification Result Card */}
        {hasSearched && verificationResult && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {verificationResult.status === "valid" ? (
              <div className="bg-white border-2 border-emerald-500 rounded-3xl p-8 shadow-md space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                      Status: Valid & Authentic
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">Certificate Verified Authentic</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400">Learner Name</span>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{verificationResult.learner_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Course Title</span>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{verificationResult.course_title}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Completion Date</span>
                    <p className="font-bold text-gray-900 mt-0.5">{verificationResult.completion_date}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Issuing Authority</span>
                    <p className="font-bold text-gray-900 mt-0.5">{verificationResult.issuer_name}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {verificationResult.certificate_id}
                  </span>
                  <Link
                    href={`/academy/certificates/${verificationResult.certificate_id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00837b] hover:underline"
                  >
                    View Official Certificate View <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : verificationResult.status === "revoked" ? (
              <div className="bg-white border-2 border-amber-500 rounded-3xl p-8 shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                      Status: Revoked
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">Certificate Has Been Revoked</h3>
                  </div>
                </div>
                <p className="text-xs text-amber-800 bg-amber-50 p-4 rounded-xl border border-amber-200">
                  {verificationResult.message}
                </p>
              </div>
            ) : (
              <div className="bg-white border-2 border-rose-300 rounded-3xl p-8 shadow-md space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                  <XCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Certificate Not Found</h3>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  {verificationResult.message || "No record matching this certificate ID was found in the GeneWise AI registry."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Educational Privacy Charter Banner */}
        <div className="rounded-2xl bg-white border border-gray-200/80 p-5 text-xs text-gray-600 space-y-1.5">
          <p className="font-bold text-gray-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00837b]" />
            Privacy-Preserving Public Registry
          </p>
          <p className="leading-relaxed">
            Public verification displays only the recipient&apos;s name, course completion, and date. Learner email addresses, exam answer logs, medical records, and genetic telemetry are never exposed in public lookups.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-xs text-gray-500">
          Loading Verification Portal...
        </div>
      }
    >
      <VerifyCertificateContent />
    </Suspense>
  );
}
