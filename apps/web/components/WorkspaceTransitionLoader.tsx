"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Check,
  CheckCircle2,
  Cpu,
  Lock,
  PhoneCall,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import MediPredictLogo from "@/components/MediPredictLogo";
import UserAvatar from "@/components/UserAvatar";

export interface WorkspaceTransitionLoaderProps {
  isOpen: boolean;
  mode?: "phone" | "login" | "register" | "biometric";
  userName?: string | null;
  userRole?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  workspaceName?: string;
}

const STAGE_SETS: Record<
  NonNullable<WorkspaceTransitionLoaderProps["mode"]>,
  { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }[]
> = {
  phone: [
    {
      title: "Carrier SMS & 6-Digit OTP Verified",
      subtitle: "Cryptographic device challenge confirmed.",
      icon: Smartphone,
    },
    {
      title: "Issuing 256-Bit Zero-Trust Session Token",
      subtitle: "Sealing encrypted key hierarchy in local vault.",
      icon: Lock,
    },
    {
      title: "Binding Telemetry & Clinical Workspace",
      subtitle: "Hydrating personalized preferences and pedigree logs.",
      icon: Activity,
    },
    {
      title: "Launching Dashboard",
      subtitle: "Authentication complete. Entering your workspace now.",
      icon: CheckCircle2,
    },
  ],
  register: [
    {
      title: "Creating Encrypted Account Identity",
      subtitle: "Provisioning client-side genomic keypair.",
      icon: ShieldCheck,
    },
    {
      title: "Registering Consent & Privacy Charter",
      subtitle: "Recording zero-commercialization DPDP compliance.",
      icon: Lock,
    },
    {
      title: "Building Initial Family & Clinical Workspace",
      subtitle: "Connecting ClinVar and curated reference nodes.",
      icon: Cpu,
    },
    {
      title: "Entering Workspace Dashboard",
      subtitle: "Your personal account is ready.",
      icon: CheckCircle2,
    },
  ],
  biometric: [
    {
      title: "WebAuthn / Touch ID Signature Matched",
      subtitle: "Hardware enclave biometric challenge verified.",
      icon: ShieldCheck,
    },
    {
      title: "Unlocking Clinical Key Vault",
      subtitle: "Decrypting active healthcare session credentials.",
      icon: Lock,
    },
    {
      title: "Syncing Live Vital & Variant Feeds",
      subtitle: "Restoring dashboard charts and PiP overlays.",
      icon: Activity,
    },
    {
      title: "Ready for Workspace",
      subtitle: "Redirecting to clinical dashboard.",
      icon: CheckCircle2,
    },
  ],
  login: [
    {
      title: "Credentials & Session Authenticated",
      subtitle: "Identity verified with zero-trust policy engine.",
      icon: ShieldCheck,
    },
    {
      title: "Hydrating Profile & Brand Preferences",
      subtitle: "Loading workspace logo, avatar, and role permissions.",
      icon: Sparkles,
    },
    {
      title: "Initializing Telemetry & Analytics",
      subtitle: "Preparing real-time Recharts panels and ClinVar index.",
      icon: Activity,
    },
    {
      title: "Opening Dashboard",
      subtitle: "Transitioning cleanly to your workspace.",
      icon: CheckCircle2,
    },
  ],
};

export default function WorkspaceTransitionLoader({
  isOpen,
  mode = "phone",
  userName,
  userRole,
  phone,
  avatarUrl,
  avatarColor = "teal",
  workspaceName,
}: WorkspaceTransitionLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      setProgress(18);
      return;
    }

    const t1 = setTimeout(() => {
      setStepIndex(1);
      setProgress(52);
    }, 340);
    const t2 = setTimeout(() => {
      setStepIndex(2);
      setProgress(82);
    }, 760);
    const t3 = setTimeout(() => {
      setStepIndex(3);
      setProgress(100);
    }, 1160);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const stages = STAGE_SETS[mode] || STAGE_SETS.phone;
  const displayTitle = workspaceName || "GeneWise Clinical Workspace";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#eef8f6]/92 dark:bg-[#07141a]/92 backdrop-blur-2xl animate-in fade-in duration-300"
    >
      {/* Subtle Ambient Aura Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[100px] animate-pulse" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl bg-white/95 dark:bg-[#101f27]/95 border border-teal-500/25 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Orbital Animated Emblem */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative flex items-center justify-center">
            <span className="absolute -inset-3 rounded-3xl border border-teal-500/25 animate-ping [animation-duration:2.2s]" />
            <span className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-emerald-400/20 blur-sm" />
            <MediPredictLogo size="xl" showText={false} showSubtitle={false} showBadge={false} animated={true} />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Authenticated Handshake</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
              Preparing {displayTitle}
            </h2>
          </div>
        </div>

        {/* Personalized User Identity Card */}
        {(userName || phone) && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-low/90 dark:bg-[#0a161c] border border-border">
            <UserAvatar
              name={userName || "Clinical User"}
              avatarUrl={avatarUrl}
              avatarColor={avatarColor}
              size="md"
              showOnlineDot={true}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">
                {userName || "Verified Workspace User"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                {userRole && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/15 text-teal-800 dark:text-teal-300">
                    {userRole}
                  </span>
                )}
                {phone && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                    <PhoneCall className="w-3 h-3 text-emerald-600" />
                    {phone}
                  </span>
                )}
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-muted-foreground">Workspace initialization</span>
            <span className="font-mono text-teal-700 dark:text-teal-300">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#081217] overflow-hidden border border-border/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#004d47] via-[#0d9488] to-[#10b981] transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <span className="absolute inset-0 shimmer-active" />
            </div>
          </div>
        </div>

        {/* Staggered Verification Checklist */}
        <div className="space-y-2">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = idx < stepIndex || progress === 100;
            const isActive = idx === stepIndex && progress < 100;

            return (
              <div
                key={stage.title}
                className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                  isDone
                    ? "bg-emerald-500/5 border-emerald-500/25 opacity-100"
                    : isActive
                    ? "bg-teal-500/10 border-teal-500/35 shadow-xs scale-[1.01]"
                    : "bg-transparent border-transparent opacity-45"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isActive
                      ? "bg-[#004d47] text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "animate-pulse" : ""}`} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground leading-tight">{stage.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    {stage.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
