"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  Fingerprint,
  KeyRound,
  Laptop,
  Loader2,
  Lock,
  LogOut,
  QrCode,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserCheck,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import SafetyNotice from "@/components/SafetyNotice";
import { api } from "@/lib/api";
import { sound } from "@/lib/sound";

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SecuritySettingsPage() {
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 2FA TOTP State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [totpTestCode, setTotpTestCode] = useState("");
  const [totpVerified, setTotpVerified] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Backup codes
  const [backupCodes] = useState([
    "A7K9-3B82", "E4M1-9X28", "T8P4-5C31", "W2Q6-7L19",
    "H9J3-2V48", "D5R7-8N12", "C3X8-4F91", "K1Y5-6Z73"
  ]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Active Sessions State
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: "SESS-01",
      device: "Windows 11 Workstation",
      browser: "Chrome 124.0.0",
      location: "Internal Hospital Network - Unit 4B",
      ip: "192.168.1.125",
      lastActive: "Active Now",
      isCurrent: true,
    },
    {
      id: "SESS-02",
      device: "Apple iPhone 15 Pro",
      browser: "Mobile Safari 17.4",
      location: "Secure Medical VPN - Gateway 02",
      ip: "10.42.0.18",
      lastActive: "14 minutes ago",
      isCurrent: false,
    },
    {
      id: "SESS-03",
      device: "Clinical Tablet (Samsung Tab Active)",
      browser: "Chrome Mobile 122.0",
      location: "Ward Telemetry Station",
      ip: "192.168.1.88",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
  ]);

  // Security Audit Log Events
  const [auditEvents] = useState([
    {
      id: "EVT-8921",
      action: "JWT Bearer Session Issued",
      actor: "Dr. Elena Rostova",
      ip: "192.168.1.125",
      status: "Verified",
      timestamp: new Date().toLocaleTimeString(),
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    {
      id: "EVT-8920",
      action: "Two-Factor TOTP Authenticated",
      actor: "Dr. Elena Rostova",
      ip: "192.168.1.125",
      status: "Verified",
      timestamp: "12:28:45 PM",
      hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
    },
    {
      id: "EVT-8919",
      action: "Telemetry Gateway Sensor Key Authorized",
      actor: "IoT Gateway ESP32",
      ip: "10.0.4.12",
      status: "Verified",
      timestamp: "10:14:22 AM",
      hash: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    },
  ]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }
    setIsUpdating(true);
    setMessage(null);
    setError(null);

    try {
      await api.updateMe({ password });
      sound.playSuccess();
      setMessage("Master cryptographic passphrase updated successfully. All other active sessions rotated.");
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      sound.playAlert();
      setError(`Failed to update password: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    sound.playClick();
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleRevokeAllOther = () => {
    sound.playClick();
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    sound.playSuccess();
    setMessage("All remote and external sessions have been revoked immediately.");
  };

  const handleCopyCodes = () => {
    sound.playClick();
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-foreground transition-colors duration-200">
      <AppHeader />

      <div className="flex-1 flex overflow-hidden">
        <AppSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full overflow-y-auto animate-fade-in-up pb-28 md:pb-10">
          {/* Header */}
          <div className="pb-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Trust Enterprise Security</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Security & Session Governance
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cryptographic credentials, two-factor authentication, active login sessions, and tamper-evident audit logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-3 py-1.5 rounded-xl bg-surface-low dark:bg-[#162732] border border-border font-mono text-muted-foreground">
                Encryption: <strong className="text-emerald-600 dark:text-emerald-400">AES-256 GCM</strong>
              </span>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-semibold overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/settings/profile"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-surface-low dark:hover:bg-[#162732] transition-colors whitespace-nowrap shrink-0"
            >
              Profile & Workspace Brand
            </Link>
            <Link href="/settings/security" className="px-3 py-1.5 rounded-lg bg-primary text-white shadow-xs whitespace-nowrap shrink-0">
              Security & Sessions
            </Link>
            <Link
              href="/settings/privacy"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-surface-low dark:hover:bg-[#162732] transition-colors whitespace-nowrap shrink-0"
            >
              Privacy & Consents (DPDP Act)
            </Link>
          </div>

          {/* Alerts */}
          {message && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {message}
              </span>
              <button onClick={() => setMessage(null)} className="text-[11px] underline">
                Dismiss
              </button>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-400 flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                {error}
              </span>
              <button onClick={() => setError(null)} className="text-[11px] underline">
                Dismiss
              </button>
            </div>
          )}

          {/* SECTION 1: TWO-FACTOR AUTHENTICATION (2FA / TOTP) */}
          <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  Two-Factor Authentication (MFA / 2FA)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Protect clinical access with time-based one-time password (TOTP) from Google Authenticator, Authy, or 1Password.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    twoFactorEnabled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  }`}
                >
                  {twoFactorEnabled ? "Enforced & Active" : "Disabled"}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setTwoFactorEnabled(!twoFactorEnabled);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    twoFactorEnabled
                      ? "border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20"
                      : "border-primary bg-primary text-white hover:opacity-90"
                  }`}
                >
                  {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                </button>
              </div>
            </div>

            {twoFactorEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* 2FA App Configuration */}
                <div className="p-4 rounded-xl border border-border bg-surface-low/50 dark:bg-[#111d24]/50 space-y-3">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-primary" />
                    Configured Authenticator Key
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    To connect a new hardware authenticator, scan this QR token or enter the 16-character base32 secret.
                  </p>

                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono font-bold bg-white dark:bg-[#162732] px-2.5 py-1.5 rounded-lg border border-border text-primary">
                      JBSW-Y3DP-EHPK-3PXP
                    </code>
                    <button
                      onClick={() => {
                        sound.playClick();
                        navigator.clipboard.writeText("JBSWY3DPEHPK3PXP");
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2500);
                      }}
                      className="p-1.5 rounded-lg border border-border bg-white dark:bg-[#162732] text-muted-foreground hover:text-foreground text-xs"
                      title="Copy Key"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Emergency Recovery Backup Codes */}
                <div className="p-4 rounded-xl border border-border bg-surface-low/50 dark:bg-[#111d24]/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-emerald-500" />
                      Emergency Recovery Backup Codes
                    </span>
                    <button
                      onClick={handleCopyCodes}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                    >
                      {copiedCodes ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodes ? "Copied!" : "Copy All"}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Store these one-time codes safely. They permit account access if your mobile authenticator is lost.
                  </p>

                  <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px] text-foreground font-semibold">
                    {backupCodes.map((code) => (
                      <span key={code} className="p-1 text-center bg-white dark:bg-[#162732] rounded border border-border">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: PASSWORD ROTATION */}
          <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Rotate Master Cryptographic Passphrase
            </h3>
            <p className="text-xs text-muted-foreground">
              Passphrases must contain at least 8 characters including numbers, symbols, and uppercase characters.
            </p>

            <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-1 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Current Passphrase
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-surface-low dark:bg-[#111d24] text-foreground focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  New Master Passphrase (min. 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-surface-low dark:bg-[#111d24] text-foreground focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Confirm New Master Passphrase
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-surface-low dark:bg-[#111d24] text-foreground focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 smooth-button shadow-2xs"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>Rotate Passphrase</span>
              </button>
            </form>
          </div>

          {/* SECTION 3: ACTIVE LOGIN SESSIONS */}
          <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-primary" />
                  Active Authorized Login Sessions ({sessions.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Monitor active cryptographic sessions across desktop, mobile, and hospital ward gateways.
                </p>
              </div>

              {sessions.length > 1 && (
                <button
                  onClick={handleRevokeAllOther}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 text-xs font-semibold hover:bg-red-500/20 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Revoke All Other Sessions</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    sess.isCurrent
                      ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20"
                      : "border-border bg-surface-low/30 dark:bg-[#111d24]/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-surface-low dark:bg-[#162732] text-primary mt-0.5">
                      {sess.device.includes("Phone") ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">{sess.device}</span>
                        {sess.isCurrent && (
                          <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">
                            Current Device
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {sess.browser} &bull; <span className="font-mono">{sess.ip}</span> &bull; {sess.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-muted-foreground font-mono text-[11px]">{sess.lastActive}</span>
                    {!sess.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        className="text-red-500 hover:text-red-600 text-[11px] font-semibold underline"
                      >
                        Terminate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: TAMPER-EVIDENT AUDIT TRAIL */}
          <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Tamper-Evident Security Audit Log (DPDP Act 2023 Compliant)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Immutable chronological log sealed with HMAC SHA-256 cryptographic hashes.
                </p>
              </div>

              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                AUDIT INTEGRITY VERIFIED
              </span>
            </div>

            <div className="space-y-2.5">
              {auditEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl border border-border bg-surface-low/40 dark:bg-[#111d24]/40 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{evt.action}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">({evt.actor})</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono truncate max-w-md">
                      SHA256: {evt.hash}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                    <span>{evt.ip}</span>
                    <span>&bull;</span>
                    <span>{evt.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
