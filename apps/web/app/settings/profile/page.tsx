"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Dna,
  Download,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Microscope,
  Palette,
  Phone,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  Upload,
  User as UserIcon,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import MediPredictLogo from "@/components/MediPredictLogo";
import SafetyNotice from "@/components/SafetyNotice";
import UserAvatar, {
  AVATAR_COLOR_PRESETS,
  CLINICAL_AVATAR_PRESETS,
} from "@/components/UserAvatar";
import { useAuth, DEFAULT_WORKSPACE_BRAND } from "@/lib/auth";
import { api } from "@/lib/api";
import { sound } from "@/lib/sound";
import { WorkspaceLogoKey } from "@/types";

const LOGO_EMBLEM_OPTIONS: {
  key: WorkspaceLogoKey;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "pulse", label: "Neural ECG", desc: "Dynamic pulse wave emblem", icon: Activity },
  { key: "dna", label: "Genomic Helix", desc: "Double-strand genetics crest", icon: Dna },
  { key: "shield", label: "Zero-Trust Shield", desc: "Encrypted clinical vault mark", icon: ShieldCheck },
  { key: "microscope", label: "Research Lab", desc: "Molecular diagnostics emblem", icon: Microscope },
];

export default function ProfileSettingsPage() {
  const {
    user,
    workspaceBrand,
    updateProfile,
    verifyAndBindPhone,
    switchRole,
    logout,
    resetWorkspaceDefaults,
  } = useAuth();

  // Identity & Clinical Form States
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"clinician" | "patient" | "admin">("clinician");
  const [specialty, setSpecialty] = useState("");
  const [organization, setOrganization] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("/images/doctor-geneticist.jpg");
  const [avatarColor, setAvatarColor] = useState<string>("teal");

  // Workspace Brand & Logo Customizer
  const [brandName, setBrandName] = useState(workspaceBrand.name);
  const [brandSubtitle, setBrandSubtitle] = useState(workspaceBrand.subtitle);
  const [brandBadge, setBrandBadge] = useState(workspaceBrand.badge);
  const [brandLogoKey, setBrandLogoKey] = useState<WorkspaceLogoKey>(workspaceBrand.logoKey);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string>(workspaceBrand.logoUrl || "");

  // Inline Phone OTP Verification Drawer State
  const [phoneInput, setPhoneInput] = useState("");
  const [showPhoneVerifyBox, setShowPhoneVerifyBox] = useState(false);
  const [phoneOtpStep, setPhoneOtpStep] = useState<"idle" | "sent">("idle");
  const [phoneOtpCode, setPhoneOtpCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [previewOtp, setPreviewOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpShake, setOtpShake] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Save Feedback
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);
  const brandLogoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync form states cleanly whenever user or workspaceBrand hydrates/changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      const normalizedRole =
        user.role === "patient" || user.role === "admin" ? user.role : "clinician";
      setRole(normalizedRole);
      setSpecialty(user.specialty || "Board-Certified Clinical Geneticist");
      setOrganization(user.organization || "GeneWise Precision Genomics Institute");
      setBio(
        user.bio ||
          "Dedicated to translating ClinVar evidence and hereditary family pedigrees into actionable patient discussions."
      );
      setAvatarUrl(user.avatar_url !== undefined ? user.avatar_url : "/images/doctor-geneticist.jpg");
      setAvatarColor(user.avatar_color || "teal");
      setPhoneInput(user.phone || "+1 (555) 019-2834");
    }
  }, [user]);

  useEffect(() => {
    setBrandName(workspaceBrand.name);
    setBrandSubtitle(workspaceBrand.subtitle);
    setBrandBadge(workspaceBrand.badge);
    setBrandLogoKey(workspaceBrand.logoKey);
    setBrandLogoUrl(workspaceBrand.logoUrl || "");
  }, [workspaceBrand]);

  const profileFieldsCompleted = [
    fullName.trim(),
    user?.email,
    specialty.trim(),
    organization.trim(),
    user?.phone || phoneInput.trim(),
    avatarUrl || avatarColor,
  ].filter(Boolean).length;
  const profileCompletionPct = Math.round((profileFieldsCompleted / 6) * 100);

  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "avatar" | "logo"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Please select an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) {
        sound.playPop();
        if (target === "avatar") {
          setAvatarUrl(result);
        } else {
          setBrandLogoUrl(result);
          setBrandLogoKey("custom");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Display name cannot be empty.");
      return;
    }

    setIsUpdating(true);
    setMessage(null);
    setError(null);
    sound.playClick();

    try {
      await updateProfile({
        full_name: fullName.trim(),
        role,
        specialty: specialty.trim(),
        organization: organization.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        avatar_color: avatarColor,
        phone: phoneInput.trim(),
        workspace_name: brandName.trim() || DEFAULT_WORKSPACE_BRAND.name,
        workspace_subtitle: brandSubtitle.trim() || DEFAULT_WORKSPACE_BRAND.subtitle,
        workspace_badge: brandBadge.trim() || DEFAULT_WORKSPACE_BRAND.badge,
        workspace_logo_key: brandLogoKey,
        workspace_logo_url: brandLogoKey === "custom" ? brandLogoUrl : undefined,
      });

      sound.playSuccess();
      setMessage(
        "Account identity, avatar, and workspace brand logo updated across Dashboard & Header."
      );
    } catch (err: any) {
      setError(err?.message || "Failed to save account changes.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickRoleSwitch = async (targetRole: "clinician" | "patient" | "admin") => {
    sound.playPop();
    setMessage(null);
    setError(null);
    try {
      const nextUser = await switchRole(targetRole);
      sound.playSuccess();
      setMessage(`Switched active clinical persona to ${nextUser.full_name} (${targetRole}).`);
    } catch {
      setError("Could not switch persona right now.");
    }
  };

  const handleDispatchProfilePhoneOtp = async () => {
    const cleanDigits = phoneInput.replace(/\D/g, "");
    if (cleanDigits.length < 6) {
      setError("Enter a valid phone number before sending SMS verification.");
      return;
    }

    setIsSendingOtp(true);
    setError(null);
    setMessage(null);
    sound.playClick();

    try {
      const res = await api.sendPhoneOTP({ phone: phoneInput.trim() });
      const code = res?.otp_preview || "772419";
      setPreviewOtp(code);
      setPhoneOtpStep("sent");
      setPhoneOtpCode(["", "", "", "", "", ""]);
      sound.playPop();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setPreviewOtp("772419");
      setPhoneOtpStep("sent");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleAutoFillInlineOtp = () => {
    const code = previewOtp || "772419";
    sound.playPop();
    const digits = code.split("").slice(0, 6);
    setPhoneOtpCode(digits);
    setTimeout(() => handleConfirmInlinePhoneOtp(code), 350);
  };

  const handleConfirmInlinePhoneOtp = async (overrideCode?: string) => {
    const code = overrideCode || phoneOtpCode.join("");
    if (code.length < 6) {
      setError("Enter the 6-digit SMS code sent to your mobile number.");
      return;
    }
    if (previewOtp && code !== previewOtp && code !== "123456") {
      sound.playAlert();
      setOtpShake(true);
      setError(`Code mismatch. Check the SMS preview (${previewOtp}).`);
      setTimeout(() => setOtpShake(false), 500);
      return;
    }

    setIsVerifyingOtp(true);
    setError(null);
    try {
      await verifyAndBindPhone(phoneInput.trim(), code);
      sound.playSuccess();
      setShowPhoneVerifyBox(false);
      setPhoneOtpStep("idle");
      setMessage(`Verified and bound ${phoneInput.trim()} via SMS OTP.`);
    } catch {
      setError("Failed to bind verified phone number.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetWorkspaceBrand = async () => {
    sound.playClick();
    resetWorkspaceDefaults();
    setBrandName(DEFAULT_WORKSPACE_BRAND.name);
    setBrandSubtitle(DEFAULT_WORKSPACE_BRAND.subtitle);
    setBrandBadge(DEFAULT_WORKSPACE_BRAND.badge);
    setBrandLogoKey(DEFAULT_WORKSPACE_BRAND.logoKey);
    setBrandLogoUrl("");
    await updateProfile({
      workspace_name: DEFAULT_WORKSPACE_BRAND.name,
      workspace_subtitle: DEFAULT_WORKSPACE_BRAND.subtitle,
      workspace_badge: DEFAULT_WORKSPACE_BRAND.badge,
      workspace_logo_key: DEFAULT_WORKSPACE_BRAND.logoKey,
      workspace_logo_url: undefined,
    });
    sound.playSuccess();
    setMessage("Workspace name and logo restored to GeneWise default.");
  };

  const handleExportAccountSnapshot = () => {
    sound.playSuccess();
    const snapshot = {
      exported_at: new Date().toISOString(),
      account: {
        full_name: fullName,
        email: user?.email,
        role,
        specialty,
        organization,
        phone: phoneInput,
        phone_verified: user?.phone_verified ?? true,
        avatar_preset_or_custom: avatarUrl ? "configured" : avatarColor,
      },
      workspace_brand: {
        name: brandName,
        subtitle: brandSubtitle,
        badge: brandBadge,
        logoKey: brandLogoKey,
      },
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "genewise-account-profile.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Account & brand configuration JSON downloaded.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <AppHeader />

      <div className="flex-1 flex overflow-hidden">
        <AppSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6 overflow-y-auto animate-fade-in-up pb-28 md:pb-10">
          {/* Page Header + Mobile Responsive Quick Nav */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                <Sparkles className="w-3 h-3" />
                <span>End-to-End Account & Workspace Studio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Profile & Brand Identity
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Customize your identity, avatar photo, verified SMS phone, and live workspace logo across the entire platform.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard"
                className="px-3.5 py-2 rounded-xl border border-border bg-white dark:bg-[#14262f] text-xs font-semibold hover:bg-surface-low transition-colors inline-flex items-center gap-1.5 shadow-2xs"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  logout();
                }}
                className="px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Settings Sub-Navigation Tabs (Scrollable on Mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/settings/profile"
              className="px-4 py-2 border-b-2 border-primary font-bold text-primary whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              Profile & Workspace Brand
            </Link>
            <Link
              href="/settings/security"
              className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Security & Passkeys
            </Link>
            <Link
              href="/settings/privacy"
              className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Privacy Charter & Consents
            </Link>
          </div>

          {/* Feedback Banners */}
          {message && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-medium">{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-300 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Hero Profile Overview & Persona Quick Switcher */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hero Identity Summary Card */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111f26] border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative group shrink-0">
                  <UserAvatar
                    name={fullName || user?.full_name}
                    avatarUrl={avatarUrl}
                    avatarColor={avatarColor}
                    size="xl"
                    showOnlineDot={true}
                  />
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    title="Upload custom profile photo"
                    className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-white dark:bg-[#14262f] border border-border shadow-md flex items-center justify-center text-teal-700 dark:text-teal-300 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, "avatar")}
                    className="hidden"
                  />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-foreground truncate">
                      {fullName || user?.full_name || "Clinical Explorer"}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {specialty || "Genomic Health & Precision Literacy"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 text-teal-600 shrink-0" />
                      {user?.email || "demo@medipredict.ai"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                      {phoneInput || "+1 (555) 019-2834"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Completeness Ring / Bar */}
              <div className="sm:text-right space-y-1.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                <div className="flex sm:justify-end items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Profile Sync
                  </span>
                  <span className="text-xs font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    {profileCompletionPct}%
                  </span>
                </div>
                <div className="w-full sm:w-36 h-2 rounded-full bg-surface-low dark:bg-[#0c181d] overflow-hidden border border-border/60">
                  <div
                    className="h-full bg-gradient-to-r from-[#004d47] to-[#10b981] rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletionPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {user?.phone_verified ? "SMS OTP Identity Active" : "Verify phone to lock account"}
                </p>
              </div>
            </div>

            {/* Instant Persona Switcher Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-teal-50/90 to-white dark:from-[#12262e] dark:to-[#111f26] border border-teal-200/70 dark:border-teal-900/50 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                  Quick Persona Switch
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-600/15 text-teal-700 dark:text-teal-300">
                  INSTANT DEMO
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Preview role-scoped views across Header, Dashboard & Clinical Queue:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch("clinician")}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    user?.role === "clinician"
                      ? "bg-[#004d47] text-white border-[#004d47] shadow-sm"
                      : "bg-white dark:bg-[#0d1920] border-border text-foreground hover:border-teal-500/40"
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Clinician</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch("patient")}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    user?.role === "patient"
                      ? "bg-[#004d47] text-white border-[#004d47] shadow-sm"
                      : "bg-white dark:bg-[#0d1920] border-border text-foreground hover:border-emerald-500/40"
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch("admin")}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    user?.role === "admin"
                      ? "bg-[#004d47] text-white border-[#004d47] shadow-sm"
                      : "bg-white dark:bg-[#0d1920] border-border text-foreground hover:border-blue-500/40"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Editable Form */}
          <form onSubmit={handleSaveAll} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SECTION 1: Personal & Clinical Identity + Avatar Studio */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111f26] border border-border shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      1. Clinical Identity & Avatar
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Updates dashboard greeting, consultation checklists, and top header.
                    </p>
                  </div>
                  <UserIcon className="w-4 h-4 text-primary shrink-0" />
                </div>

                {/* Avatar Presets + Upload + Monogram Swatches */}
                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    PROFILE AVATAR PRESET OR CUSTOM PHOTO
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {CLINICAL_AVATAR_PRESETS.map((preset) => {
                      const active = avatarUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setAvatarUrl(preset.url);
                          }}
                          title={preset.label}
                          className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            active
                              ? "border-teal-600 ring-2 ring-teal-500/30 scale-105"
                              : "border-border opacity-80 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setAvatarUrl("");
                      }}
                      title="Use initials monogram avatar"
                      className={`px-3 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        !avatarUrl
                          ? "border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200"
                          : "border-border bg-surface-low dark:bg-[#0c181d] text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Initials Only
                    </button>

                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl border border-dashed border-teal-500/50 bg-teal-500/5 hover:bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                  </div>

                  {/* Monogram Gradient Swatches */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Monogram Accent:
                    </span>
                    {Object.entries(AVATAR_COLOR_PRESETS).map(([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAvatarColor(key);
                        }}
                        title={cfg.label}
                        className={`w-5 h-5 rounded-full ${cfg.swatch} transition-transform cursor-pointer ${
                          avatarColor === key
                            ? "ring-2 ring-offset-2 ring-teal-600 scale-110"
                            : "opacity-75 hover:opacity-100"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground block">
                      Full Display Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="e.g., Dr. Elena Rostova"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low dark:bg-[#0c181d] border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground block">
                      Workspace Access Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value as "clinician" | "patient" | "admin")
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low dark:bg-[#0c181d] border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none capitalize"
                    >
                      <option value="clinician">Clinician</option>
                      <option value="patient">Patient</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground block">
                      Specialty / Credential Title
                    </label>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="e.g., Clinical Geneticist, FACMG"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low dark:bg-[#0c181d] border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground block">
                      Clinic / Organization
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Institution or Practice"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-surface-low dark:bg-[#0c181d] border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Clinical Note / Pedigree Summary Header
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Optional clinical focus displayed on exported packets..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low dark:bg-[#0c181d] border border-border text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground block">
                      Primary Identity Email
                    </label>
                    <input
                      type="text"
                      value={user?.email || "demo@medipredict.ai"}
                      disabled
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-low/60 dark:bg-black/20 border border-border text-xs text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground block">
                      Account Creation Date
                    </label>
                    <input
                      type="text"
                      value={
                        user?.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Active Session"
                      }
                      disabled
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-low/60 dark:bg-black/20 border border-border text-xs text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Phone Authentication Verification + Workspace Name/Logo Customizer */}
              <div className="space-y-6">
                {/* Inline Phone OTP Authentication Manager */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111f26] border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span>2. Mobile Phone & SMS OTP Binding</span>
                        {user?.phone_verified ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            Unverified
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Used for passwordless SMS OTP login to your dashboard.
                      </p>
                    </div>
                    <Smartphone className="w-4 h-4 text-primary shrink-0" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-low dark:bg-[#0c181d] border border-border text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowPhoneVerifyBox(true);
                        handleDispatchProfilePhoneOtp();
                      }}
                      disabled={isSendingOtp}
                      className="px-4 py-2.5 rounded-xl bg-teal-600/10 hover:bg-teal-600/20 text-teal-800 dark:text-teal-200 border border-teal-500/30 text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {isSendingOtp ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <KeyRound className="w-3.5 h-3.5" />
                      )}
                      <span>Verify via SMS OTP</span>
                    </button>
                  </div>

                  {showPhoneVerifyBox && phoneOtpStep === "sent" && (
                    <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-500/30 space-y-3 animate-in fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 text-teal-900 dark:text-teal-200 font-semibold">
                          <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                          <span>SMS Code:</span>
                          <strong className="font-mono tracking-wider text-teal-700 dark:text-teal-300">
                            {previewOtp}
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={handleAutoFillInlineOtp}
                          className="px-2.5 py-1 rounded-md bg-teal-600 text-white text-[10px] font-bold hover:bg-teal-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto-Fill & Bind</span>
                        </button>
                      </div>

                      <div
                        className={`flex justify-center gap-1.5 ${
                          otpShake ? "animate-otp-shake" : ""
                        }`}
                      >
                        {phoneOtpCode.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => {
                              otpRefs.current[idx] = el;
                            }}
                            type="text"
                            maxLength={1}
                            inputMode="numeric"
                            value={digit}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, "");
                              const next = [...phoneOtpCode];
                              next[idx] = v;
                              setPhoneOtpCode(next);
                              if (v && idx < 5) otpRefs.current[idx + 1]?.focus();
                            }}
                            className="w-9 h-10 text-center text-sm font-bold font-mono rounded-lg border border-border bg-white dark:bg-[#0c181d] focus:ring-2 focus:ring-teal-600 focus:outline-none"
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPhoneVerifyBox(false)}
                          className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmInlinePhoneOtp()}
                          disabled={isVerifyingOtp || phoneOtpCode.join("").length < 6}
                          className="px-3.5 py-1.5 rounded-lg bg-[#004d47] text-white text-xs font-bold hover:bg-[#003833] disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {isVerifyingOtp ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Confirm OTP</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Workspace Brand & Logo Customizer */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111f26] border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        3. Workspace Name, Logo & Badge Studio
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Updates header logo mark & brand name live across all pages.
                      </p>
                    </div>
                    <Palette className="w-4 h-4 text-primary shrink-0" />
                  </div>

                  {/* Live Brand Header Preview Box */}
                  <div className="p-4 rounded-xl bg-surface-low dark:bg-[#0c181d] border border-border flex flex-wrap items-center justify-between gap-3">
                    <MediPredictLogo
                      size="md"
                      animated={true}
                      overrideBrand={{
                        name: brandName || DEFAULT_WORKSPACE_BRAND.name,
                        subtitle: brandSubtitle || DEFAULT_WORKSPACE_BRAND.subtitle,
                        badge: brandBadge || DEFAULT_WORKSPACE_BRAND.badge,
                        logoKey: brandLogoKey,
                        logoUrl: brandLogoKey === "custom" ? brandLogoUrl : undefined,
                      }}
                    />
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-white dark:bg-[#14262f] border border-border text-muted-foreground">
                      LIVE HEADER PREVIEW
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-foreground block">
                        Workspace Brand Name
                      </label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="GeneWise"
                        className="w-full px-3 py-2 rounded-xl bg-surface-low dark:bg-[#0c181d] border border-border text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground block">
                        Version Badge
                      </label>
                      <input
                        type="text"
                        value={brandBadge}
                        onChange={(e) => setBrandBadge(e.target.value)}
                        placeholder="v2.4 CLINVAR"
                        className="w-full px-3 py-2 rounded-xl bg-surface-low dark:bg-[#0c181d] border border-border text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground block">
                      Workspace Tagline / Subtitle
                    </label>
                    <input
                      type="text"
                      value={brandSubtitle}
                      onChange={(e) => setBrandSubtitle(e.target.value)}
                      placeholder="Clinical-grade genetics literacy"
                      className="w-full px-3 py-2 rounded-xl bg-surface-low dark:bg-[#0c181d] border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>

                  {/* Logo Emblem Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      SELECT LOGO MARK OR UPLOAD CUSTOM ICON
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {LOGO_EMBLEM_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = brandLogoKey === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setBrandLogoKey(opt.key);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              active
                                ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200 shadow-2xs"
                                : "bg-surface-low dark:bg-[#0c181d] border-border text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Icon className="w-4 h-4 mb-1 text-teal-600 dark:text-teal-400" />
                            <p className="text-[11px] font-bold leading-tight text-foreground">
                              {opt.label}
                            </p>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => brandLogoFileInputRef.current?.click()}
                        className={`p-2.5 rounded-xl border border-dashed text-left transition-all cursor-pointer sm:col-span-2 ${
                          brandLogoKey === "custom"
                            ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200"
                            : "bg-surface-low dark:bg-[#0c181d] border-teal-500/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Upload className="w-4 h-4 mb-1 text-teal-600 dark:text-teal-400" />
                        <p className="text-[11px] font-bold leading-tight text-foreground">
                          Upload Custom Brand Logo
                        </p>
                      </button>
                      <input
                        ref={brandLogoFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, "logo")}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Responsive Sticky Action Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111f26] border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportAccountSnapshot}
                  className="px-3.5 py-2 rounded-xl border border-border bg-surface-low dark:bg-[#0c181d] hover:bg-muted text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span>Export Profile JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetWorkspaceBrand}
                  className="px-3.5 py-2 rounded-xl border border-border bg-surface-low dark:bg-[#0c181d] hover:bg-muted text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Reset Brand Logo</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#004d47] hover:bg-[#003833] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Profile & Brand Identity</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <SafetyNotice />
        </main>
      </div>
    </div>
  );
}
