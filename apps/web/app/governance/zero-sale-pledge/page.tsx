"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Ban,
  Check,
  CheckCircle,
  Copy,
  ExternalLink,
  EyeOff,
  FileCheck,
  FileText,
  Key,
  Lock,
  RotateCcw,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import PublicDocShell from "@/components/PublicDocShell";
import SafetyNotice from "@/components/SafetyNotice";
import { sound } from "@/lib/sound";

export default function ZeroSalePledgePage() {
  const [copied, setCopied] = useState(false);

  const copyPledgeCertificate = () => {
    sound.playSuccess();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        "GENEWISE ZERO-SALE PLEDGE CERTIFICATE (ID: GW-ZSP-2025)\n" +
        "We hereby certify that GeneWise operates under a legally binding zero-commercialization charter.\n" +
        "1. Zero raw DNA storage (FASTQ/BAM/VCF never accepted).\n" +
        "2. Zero pharma or insurance brokerage agreements.\n" +
        "3. Zero tracking pixels or commercial ad networks.\n" +
        "4. 1-Click sovereign cryptographic purge.\n" +
        "Governed under ISO 27701, HIPAA & GDPR Article 9."
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <PublicDocShell
      sectionLabel="GOVERNANCE"
      pageTitle="Zero-Sale Pledge"
      activeHref="/governance/zero-sale-pledge"
    >
      <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                <Ban className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Constitutional Covenant · Zero Commercialization Guarantee
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  Zero-Sale Biological Data Pledge
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Our irrevocable institutional covenant: GeneWise will never sell, lease, license, or monetize your hereditary health records, family pedigree data, or consultation notes to any pharmaceutical, insurance, or advertising syndicate.
            </p>
          </div>

          {/* Golden Seal Certificate Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/30 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-emerald-400" />
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-300">
                    Sovereign Patient Guarantee
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  REF: GW-ZSP-2025 · ACTIVE
                </span>
              </div>

              <blockquote className="text-sm sm:text-base font-semibold leading-relaxed text-emerald-50/95 italic border-l-2 border-emerald-400 pl-4 py-1">
                &ldquo;Your family history and genetic questions belong exclusively to you. We reject the extractive commercial genetics model. We do not sell data because our platform is engineered so that we cannot access your unencrypted personal narratives.&rdquo;
              </blockquote>

              <div className="flex items-center justify-between flex-wrap gap-3 pt-2 text-xs">
                <div className="flex items-center gap-4 text-[11px] text-emerald-200/80">
                  <span>Signed: Clinical Governance Board</span>
                  <span>•</span>
                  <span>Ratified: January 2025</span>
                </div>

                <button
                  onClick={copyPledgeCertificate}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Certificate Copied" : "Copy Legal Citation"}
                </button>
              </div>
            </div>
          </div>

          {/* Comparison Matrix: GeneWise vs Commercial Genetics */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">
              Institutional Comparison: GeneWise vs. Commercial DTC Genetics
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-border bg-white dark:bg-[#14262f] shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-low text-muted-foreground font-semibold">
                    <th className="p-3 pl-4">Governance Pillar</th>
                    <th className="p-3 text-teal-800 dark:text-teal-300 font-bold bg-teal-50/60 dark:bg-teal-950/30">GeneWise Platform</th>
                    <th className="p-3 text-muted-foreground">Traditional DTC Vendors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 pl-4 font-medium text-foreground">Raw DNA Sequence Ingestion</td>
                    <td className="p-3 font-semibold text-emerald-800 dark:text-emerald-300 bg-teal-50/30 dark:bg-teal-950/15 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Never accepted or processed
                    </td>
                    <td className="p-3 text-muted-foreground flex items-center gap-1.5">
                      <X className="w-4 h-4 text-red-500 shrink-0" /> Full VCF/BAM stored on servers
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 pl-4 font-medium text-foreground">Pharmaceutical Licensing Agreements</td>
                    <td className="p-3 font-semibold text-emerald-800 dark:text-emerald-300 bg-teal-50/30 dark:bg-teal-950/15">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Prohibited by corporate charter
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <X className="w-4 h-4 text-red-500 shrink-0" /> Bulk licenses sold to pharma
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 pl-4 font-medium text-foreground">Commercial Ad & Tracker Networks</td>
                    <td className="p-3 font-semibold text-emerald-800 dark:text-emerald-300 bg-teal-50/30 dark:bg-teal-950/15">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> 0 pixels, 0 behavioral trackers
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <X className="w-4 h-4 text-red-500 shrink-0" /> Meta, Google & TikTok tracking
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 pl-4 font-medium text-foreground">Data Storage Architecture</td>
                    <td className="p-3 font-semibold text-emerald-800 dark:text-emerald-300 bg-teal-50/30 dark:bg-teal-950/15">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Client-side AES-256-GCM memory
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <X className="w-4 h-4 text-red-500 shrink-0" /> Centralized cloud databases
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 pl-4 font-medium text-foreground">Sovereign Purge Capability</td>
                    <td className="p-3 font-semibold text-emerald-800 dark:text-emerald-300 bg-teal-50/30 dark:bg-teal-950/15">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> 1-Click irrevocable local wiping
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <X className="w-4 h-4 text-red-500 shrink-0" /> 30-day queue or &quot;anonymized&quot; retention
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Three Enforced Technical Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-[#162730] border border-border shadow-2xs space-y-1.5">
              <span className="p-2 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 inline-block">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-foreground">GINA Compliant</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Full alignment with the Genetic Information Nondiscrimination Act, protecting users from commercial employment or health insurance bias.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#162730] border border-border shadow-2xs space-y-1.5">
              <span className="p-2 rounded-lg bg-primary/10 text-primary inline-block">
                <Lock className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-foreground">Zero-Trust Architecture</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Even our system administrators cannot access unencrypted pedigree trees or patient question logs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#162730] border border-border shadow-2xs space-y-1.5">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-block">
                <Trash2 className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-foreground">Irrevocable Purge</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Users retain the absolute right to destroy all cached session records, leaving no orphaned genetic footprints.
              </p>
            </div>
          </div>

          {/* Footer Quick Links */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <Link href="/governance/privacy-charter" className="text-primary hover:underline">
                Privacy Charter
              </Link>
              <span>•</span>
              <Link href="/governance/terms" className="text-primary hover:underline">
                Terms of Educational Use
              </Link>
              <span>•</span>
              <Link href="/clinical-support/find-counselor" className="text-primary hover:underline">
                Find a Genetic Counselor
              </Link>
            </div>
            <p className="text-[10px]">Covenant Ref: GW-ZSP-2025.1</p>
          </div>

          <SafetyNotice />
      </div>
    </PublicDocShell>
  );
}
