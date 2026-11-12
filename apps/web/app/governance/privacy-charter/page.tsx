"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Database,
  Download,
  EyeOff,
  FileText,
  Key,
  Lock,
  RotateCcw,
  Scale,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import PublicDocShell from "@/components/PublicDocShell";
import SafetyNotice from "@/components/SafetyNotice";
import { sound } from "@/lib/sound";

export default function PrivacyCharterPage() {
  return (
    <PublicDocShell
      sectionLabel="GOVERNANCE"
      pageTitle="Privacy Charter"
      activeHref="/governance/privacy-charter"
    >
      <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Governance Protocol · ISO 27701 & HIPAA Aligned
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  GeneWise Privacy Charter
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Our sovereign constitutional charter guaranteeing client-side encryption, zero biological data commercialization, and complete user autonomy over genomic records.
            </p>
          </div>

          {/* Core Guarantees Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-[#162730] border border-border shadow-2xs space-y-1.5">
              <span className="p-2 rounded-lg bg-primary/10 text-primary inline-block">
                <Lock className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-foreground">Client-Side E2EE</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Family relationships and personal health notes are encrypted in-memory before leaving your browser using AES-256-GCM.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#162730] border border-border shadow-2xs space-y-1.5">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-block">
                <EyeOff className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-foreground">Zero 3rd-Party Tracking</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Zero tracking pixels, ad networks, behavioral analytic trackers, or commercial data broker syndicates.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#162730] border border-border shadow-2xs space-y-1.5">
              <span className="p-2 rounded-lg bg-secondary/10 text-secondary inline-block">
                <Trash2 className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold text-foreground">1-Click Fast Purge</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Sovereign right to trigger irrevocable cryptographic deletion of all local and session-stored health trees with a single click.
              </p>
            </div>
          </div>

          {/* Charter Articles */}
          <div className="space-y-4">
            <section className="p-5 rounded-2xl bg-white dark:bg-[#162730] border border-border space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">
                  01
                </span>
                Article I: Data Minimization & Pseudonymity
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                GeneWise requires no government identification, national insurance numbers, physical home addresses, or credit cards. You may construct pedigrees using arbitrary pseudonyms (e.g. &ldquo;Relative A1&rdquo; or &ldquo;HelixExplorer42&rdquo;). We deliberately discard raw genomic FASTQ/BAM binary files after client-side parsing.
              </p>
            </section>

            <section className="p-5 rounded-2xl bg-white dark:bg-[#162730] border border-border space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">
                  02
                </span>
                Article II: Zero-Commercialization Pledge
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We assert as an institutional principle that human heredity data is not a commodity. GeneWise does not sell, license, lease, barter, or transfer user-entered pedigree details, disease bookmarks, or symptom logs to pharmaceutical corporations, health insurance underwriters, employers, or data brokers.
              </p>
            </section>

            <section className="p-5 rounded-2xl bg-white dark:bg-[#162730] border border-border space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">
                  03
                </span>
                Article III: GINA Act & Sovereign Portability
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Under the Genetic Information Nondiscrimination Act (GINA) and international privacy statutes (GDPR Art. 9), genetic data constitutes special category biometric information. GeneWise provides full data portability via standardized HL7 FHIR and JSON formats, allowing you to export your pedigree directly to your attending medical geneticist.
              </p>
            </section>

            <section className="p-5 rounded-2xl bg-white dark:bg-[#162730] border border-border space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">
                  04
                </span>
                Article IV: The Fast Purge Mechanism
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every user retains irreversible deletion rights. Triggering Fast Purge unmounts the cryptographic vault, overrides all IndexedDB stores with cryptographic entropy, and invalidates session authentication tokens. Once purged, data cannot be recovered by GeneWise administrators.
              </p>
            </section>
          </div>

          {/* Quick Actions */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-primary">
              Need to manage your current data consents?
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/settings/privacy"
                className="px-3.5 py-1.5 rounded-lg bg-primary text-white font-bold hover:opacity-90"
              >
                Open Privacy Settings
              </Link>
            </div>
          </div>
          <SafetyNotice />
      </div>
    </PublicDocShell>
  );
}
