"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import MediPredictLogo from "@/components/MediPredictLogo";
import UserAvatar from "@/components/UserAvatar";
import { NAV_GROUPS } from "@/components/AppSidebar";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle,
  Clock,
  Cpu,
  HeartPulse,
  LogOut,
  Menu,
  Moon,
  PhoneCall,
  Radio,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  User as UserIcon,
  Volume2,
  VolumeX,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { sound } from "@/lib/sound";
import { useTheme } from "@/lib/theme";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  severity: "critical" | "warning" | "success";
  link: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Critical Telemetry Alert Normalized",
    desc: "ICU Node #409 SpO2 normalized to 98.4% after O2 flow titration.",
    time: "2m ago",
    severity: "critical",
    link: "/analytics",
  },
  {
    id: "notif-2",
    title: "Clinician Sign-Off Required",
    desc: "Rajesh Kumar celiac anti-tTG panel requires MD validation.",
    time: "14m ago",
    severity: "warning",
    link: "/clinician",
  },
  {
    id: "notif-3",
    title: "Model Calibration Complete",
    desc: "Random Forest Celiac Classifier v2.4 validated at 93.9% ROC-AUC.",
    time: "1h ago",
    severity: "success",
    link: "/ml-lab",
  },
];

export default function AppHeader() {
  const { user, logout, isAuthenticated, switchRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Header Dropdown & Modal States
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationFlyout, setShowNotificationFlyout] = useState(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [soundToast, setSoundToast] = useState<string | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(2);

  // Telemetry Modal State
  const [telemetrySimSpike, setTelemetrySimSpike] = useState(false);
  const [heartRate, setHeartRate] = useState(72);
  const [spo2, setSpo2] = useState(98.4);

  // Emergency Modal State
  const [isDispatchingBeacon, setIsDispatchingBeacon] = useState(false);
  const [beaconDispatched, setBeaconDispatched] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState(0);

  useEffect(() => {
    setIsAudioMuted(sound.muted);
  }, []);

  // Keyboard shortcut Alt + N for Night Mode toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "n" || e.key === "N" || e.key === "d" || e.key === "D")) {
        e.preventDefault();
        sound.playClick();
        toggleTheme();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTheme]);

  const handleToggleTheme = () => {
    sound.playClick();
    toggleTheme();
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsAudioMuted(muted);
    if (!muted) {
      sound.playSuccess();
      setSoundToast("Sound FX Enabled");
    } else {
      setSoundToast("Sound FX Muted");
    }
    setTimeout(() => setSoundToast(null), 2200);
  };

  const handleMarkAllNotificationsRead = () => {
    sound.playSuccess();
    setUnreadCount(0);
  };

  const handleOpenTelemetryModal = () => {
    sound.playPop();
    setShowTelemetryModal(true);
    setShowNotificationFlyout(false);
    setShowProfileMenu(false);
  };

  const handleOpenEmergencyModal = () => {
    sound.playEmergency();
    setShowEmergencyModal(true);
    setShowNotificationFlyout(false);
    setShowProfileMenu(false);
  };

  const handleSimulateSpike = () => {
    sound.playAlert();
    setTelemetrySimSpike(true);
    setHeartRate(118);
    setSpo2(91.2);

    setTimeout(() => {
      sound.playChime();
      setHeartRate(74);
      setSpo2(98.2);
      setTelemetrySimSpike(false);
    }, 4500);
  };

  const handleDispatchEmergencyBeacon = () => {
    sound.playEmergency();
    setIsDispatchingBeacon(true);
    setDispatchProgress(15);

    const interval = setInterval(() => {
      setDispatchProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setIsDispatchingBeacon(false);
          setBeaconDispatched(true);
          sound.playSuccess();
          return 100;
        }
        return prev + 25;
      });
    }, 280);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full shrink-0 bg-white/90 dark:bg-[#111d24]/90 backdrop-blur-md border-b border-border shadow-xs transition-colors duration-200 print:hidden">
        <div className="flex h-16 items-center justify-between px-3 sm:px-6 gap-2">
          {/* Left: Mobile Drawer Trigger + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowMobileNav(true);
                setShowNotificationFlyout(false);
                setShowProfileMenu(false);
              }}
              aria-label="Open navigation menu"
              className="md:hidden p-2 -ml-1 rounded-xl text-foreground hover:bg-surface-low dark:hover:bg-[#1a2c38] active:scale-95 transition-all shrink-0 border border-border/60"
            >
              <Menu className="w-5 h-5" />
            </button>
            <MediPredictLogo
              href={isAuthenticated ? "/dashboard" : "/"}
              size="md"
              animated={true}
              showText={true}
              showSubtitle={true}
              showBadge={true}
            />
          </div>

          {/* Center: Live Clinical Telemetry Status Badge (Interactive Click Trigger) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleOpenTelemetryModal}
              title="Click to view Live ICU Telemetry Node #409 waveform stream"
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-98 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-medium shadow-2xs transition-all cursor-pointer group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold tracking-wide group-hover:underline">
                ICU Telemetry Node #409: ACTIVE
              </span>
              <span className="text-emerald-500/40">·</span>
              <span className="text-muted-foreground text-[11px] font-mono">FIPS 140-3 Zero-Trust</span>
              <span className="text-emerald-500/40">·</span>
              <span className="text-primary font-semibold text-[11px] font-mono flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                93.9% ROC-AUC
              </span>
            </button>
          </div>

          {/* Right: Controls, Emergency SOS & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile backdrop for notification flyout and profile menu */}
            {(showNotificationFlyout || showProfileMenu) && (
              <div
                onClick={() => {
                  setShowNotificationFlyout(false);
                  setShowProfileMenu(false);
                }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:hidden animate-in fade-in"
                aria-hidden="true"
              />
            )}

            {/* Notifications Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowNotificationFlyout(!showNotificationFlyout);
                  setShowProfileMenu(false);
                }}
                title="Clinical Notification Center"
                className="relative p-2 rounded-lg text-muted-foreground hover:bg-surface-low dark:hover:bg-[#1a2c38] hover:text-foreground transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none animate-pulse shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Flyout */}
              {showNotificationFlyout && (
                <div
                  className="fixed left-3 right-3 top-[4.25rem] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-96 rounded-xl bg-white dark:bg-[#162732] shadow-2xl border border-border p-3 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setShowNotificationFlyout(false)}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">Clinical Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllNotificationsRead}
                        className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.link}
                        onClick={() => setShowNotificationFlyout(false)}
                        className="block p-2.5 rounded-lg border border-border/80 hover:border-primary/40 bg-surface-low/50 dark:bg-black/20 hover:bg-primary/5 transition-all text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                n.severity === "critical"
                                  ? "bg-red-500"
                                  : n.severity === "warning"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                            />
                            {n.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {n.desc}
                        </p>
                      </Link>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                    <Link
                      href="/notifications"
                      onClick={() => setShowNotificationFlyout(false)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 w-full justify-center py-1"
                    >
                      View All in Notification Center <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sound FX Toggle with Audio Synthesizer (desktop quick icon; moved into drawer on < sm) */}
            <div className="relative hidden sm:block">
              <button
                onClick={handleToggleSound}
                title={isAudioMuted ? "Enable Sound FX" : "Mute Sound FX"}
                className="p-2 rounded-lg text-muted-foreground hover:bg-surface-low dark:hover:bg-[#1a2c38] hover:text-foreground transition-colors cursor-pointer"
              >
                {isAudioMuted ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground/60" />
                ) : (
                  <Volume2 className="w-4 h-4 text-primary" />
                )}
              </button>
              {soundToast && (
                <div className="absolute right-0 top-10 px-2 py-1 rounded bg-black text-white text-[10px] font-semibold whitespace-nowrap shadow-md z-50 animate-in fade-in">
                  {soundToast}
                </div>
              )}
            </div>

            {/* Theme Switcher (Night / Clinical Calm) */}
            <button
              onClick={handleToggleTheme}
              title={isDark ? "Switch to Clinical Calm (Light) [Alt+N]" : "Switch to Night Mode (Dark) [Alt+N]"}
              className="p-2 rounded-lg text-muted-foreground hover:bg-surface-low dark:hover:bg-[#1a2c38] hover:text-foreground transition-all group relative cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200 group-hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Interactive Emergency Helpline Pill Button */}
            <button
              onClick={handleOpenEmergencyModal}
              title="Click to activate Rapid Emergency SOS & Crash Cart Telemetry Dispatch"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-600 dark:text-red-400 border border-red-500/25 text-[11px] font-semibold cursor-pointer transition-all shadow-2xs group"
            >
              <ShieldAlert className="w-3.5 h-3.5 group-hover:animate-bounce text-red-500" />
              <span className="hidden sm:inline">Emergency: 112 / 911</span>
              <span className="sm:hidden">112 / 911</span>
            </button>

            {/* Authenticated User Menu with Persona Quick Switcher */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotificationFlyout(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-low dark:hover:bg-[#1a2c38] transition-colors cursor-pointer"
                >
                  <UserAvatar
                    name={user.full_name}
                    avatarUrl={user.avatar_url}
                    avatarColor={user.avatar_color}
                    size="sm"
                    showOnlineDot={true}
                  />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[130px]">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize leading-tight">
                      {user.specialty ? user.specialty.split(" ").slice(0, 2).join(" ") : user.role}
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div
                    className="fixed left-3 right-3 top-[4.25rem] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-72 rounded-xl bg-white dark:bg-[#162732] shadow-2xl border border-border py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-border flex items-start gap-2.5">
                      <UserAvatar
                        name={user.full_name}
                        avatarUrl={user.avatar_url}
                        avatarColor={user.avatar_color}
                        size="md"
                        verified={Boolean(user.phone_verified)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">{user.full_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        {user.phone && (
                          <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 truncate mt-0.5">
                            {user.phone}
                          </p>
                        )}
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wide">
                          {user.role} Access
                        </span>
                      </div>
                    </div>

                    {/* Quick Persona Switcher */}
                    <div className="px-4 py-2 border-b border-border bg-surface-low/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        Switch Clinical Persona
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => {
                            sound.playPop();
                            switchRole("clinician");
                            setShowProfileMenu(false);
                          }}
                          className={`px-1.5 py-1 text-[10px] font-semibold rounded transition-all ${
                            user.role === "clinician"
                              ? "bg-primary text-white shadow-xs"
                              : "bg-white dark:bg-black/30 border border-border text-foreground hover:bg-primary/10"
                          }`}
                        >
                          Clinician
                        </button>
                        <button
                          onClick={() => {
                            sound.playPop();
                            switchRole("patient");
                            setShowProfileMenu(false);
                          }}
                          className={`px-1.5 py-1 text-[10px] font-semibold rounded transition-all ${
                            user.role === "patient"
                              ? "bg-primary text-white shadow-xs"
                              : "bg-white dark:bg-black/30 border border-border text-foreground hover:bg-primary/10"
                          }`}
                        >
                          Patient
                        </button>
                        <button
                          onClick={() => {
                            sound.playPop();
                            switchRole("admin");
                            setShowProfileMenu(false);
                          }}
                          className={`px-1.5 py-1 text-[10px] font-semibold rounded transition-all ${
                            user.role === "admin"
                              ? "bg-primary text-white shadow-xs"
                              : "bg-white dark:bg-black/30 border border-border text-foreground hover:bg-primary/10"
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>

                    <Link
                      href="/settings/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-surface-low dark:hover:bg-surface-high/30 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      Profile & Account
                    </Link>
                    <Link
                      href="/settings/security"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-surface-low dark:hover:bg-surface-high/30 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                      Security & Passkeys
                    </Link>
                    <Link
                      href="/settings/privacy"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-surface-low dark:hover:bg-surface-high/30 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-muted-foreground" />
                      Privacy & Consents (DPDP)
                    </Link>
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-primary font-semibold hover:bg-surface-low dark:hover:bg-surface-high/30 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      Platform Admin Portal
                    </Link>

                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => {
                        sound.playClick();
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 0. MOBILE FULL-WORKSPACE NAVIGATION DRAWER (< md) */}
      {/* ========================================================================= */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setShowMobileNav(false)}
            className="fixed inset-0 bg-slate-950/75 dark:bg-black/85 backdrop-blur-xl animate-in fade-in transition-all"
            aria-hidden="true"
          />
          <aside
            aria-label="Mobile workspace navigation"
            className="relative z-10 w-[88vw] max-w-[320px] h-[100dvh] bg-white/95 dark:bg-[#0c181f]/95 backdrop-blur-2xl border-r border-teal-500/20 dark:border-teal-500/30 shadow-2xl flex flex-col overflow-hidden rounded-r-3xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-surface-low/50 dark:bg-black/20 shrink-0">
              <MediPredictLogo
                href={isAuthenticated ? "/dashboard" : "/"}
                size="sm"
                animated={false}
                showText={true}
                showSubtitle={false}
                showBadge={true}
              />
              <button
                type="button"
                onClick={() => setShowMobileNav(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-container active:scale-95 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Authenticated Clinician / User Profile Card */}
            {isAuthenticated && user && (
              <div className="p-3 mx-3 mt-3 rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/25 space-y-2.5 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar
                    name={user.full_name}
                    avatarUrl={user.avatar_url}
                    avatarColor={user.avatar_color}
                    size="md"
                    showOnlineDot={true}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-foreground truncate leading-tight">
                      {user.full_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                      {user.specialty || user.role.toUpperCase()} • {user.organization || "GeneWise Health"}
                    </p>
                  </div>
                </div>

                {/* Quick Persona Switcher in Mobile Drawer */}
                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-teal-500/20">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      switchRole("clinician");
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all text-center ${
                      user.role === "clinician"
                        ? "bg-teal-700 text-white shadow-2xs"
                        : "bg-surface-low/80 dark:bg-black/30 text-foreground hover:bg-teal-500/10"
                    }`}
                  >
                    MD
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      switchRole("patient");
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all text-center ${
                      user.role === "patient"
                        ? "bg-teal-700 text-white shadow-2xs"
                        : "bg-surface-low/80 dark:bg-black/30 text-foreground hover:bg-teal-500/10"
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      switchRole("admin");
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all text-center ${
                      user.role === "admin"
                        ? "bg-teal-700 text-white shadow-2xs"
                        : "bg-surface-low/80 dark:bg-black/30 text-foreground hover:bg-teal-500/10"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}

            {/* Live Telemetry Quick Card */}
            <div className="px-3 pt-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowMobileNav(false);
                  handleOpenTelemetryModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-semibold active:scale-98 transition-transform"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ICU Node #409: ACTIVE</span>
                </span>
                <span className="font-mono text-[10px]">93.9% AUC</span>
              </button>
            </div>

            {/* Scrollable Route List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.id} className="space-y-1">
                  <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const baseHref = item.href.split("?")[0];
                      const active =
                        pathname === baseHref ||
                        (baseHref !== "/dashboard" && pathname.startsWith(`${baseHref}/`));
                      return (
                        <Link
                          key={`${group.id}-${item.href}`}
                          href={item.href}
                          onClick={() => {
                            sound.playClick();
                            setShowMobileNav(false);
                          }}
                          className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all touch-manipulation ${
                            active
                              ? "bg-teal-700 text-white font-bold shadow-2xs"
                              : "text-foreground/85 hover:bg-surface-low dark:hover:bg-[#1a2c38]"
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                active ? "text-white" : "text-muted-foreground"
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </span>
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                                active
                                  ? "bg-white/20 text-white"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Quick Controls Footer */}
            <div className="shrink-0 p-3 border-t border-border bg-surface-low/50 dark:bg-black/20 space-y-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white dark:bg-[#162732] text-xs font-semibold text-foreground active:scale-98 transition-transform"
                >
                  {isAudioMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-primary" />
                  )}
                  <span>{isAudioMuted ? "Unmute FX" : "Sound On"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleTheme}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white dark:bg-[#162732] text-xs font-semibold text-foreground active:scale-98 transition-transform"
                >
                  {isDark ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                  )}
                  <span>{isDark ? "Light Mode" : "Night Mode"}</span>
                </button>
              </div>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowMobileNav(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-600 dark:text-red-400 active:scale-98 transition-transform"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of GeneWise</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. LIVE ICU TELEMETRY NODE #409 MONITOR MODAL */}
      {/* ========================================================================= */}
      {showTelemetryModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#12222b] border border-border shadow-2xl p-4 sm:p-6 space-y-4 max-h-[90dvh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  <Radio className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      ICU Telemetry Node #409 — Transducer Feed
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
                      LIVE STREAM
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cardiac ICU Ward 4B · FIPS 140-3 Hardware Encrypted · 14ms Latency
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTelemetryModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-low"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vital Metrics Readout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-surface-low dark:bg-black/30 border border-border">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Heart Rate (Lead II)
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className={`text-2xl font-bold font-mono ${
                      telemetrySimSpike ? "text-red-500 animate-pulse" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {heartRate}
                  </span>
                  <span className="text-xs text-muted-foreground">bpm</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Normal Sinus Rhythm</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-low dark:bg-black/30 border border-border">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Pulse Oximetry
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className={`text-2xl font-bold font-mono ${
                      telemetrySimSpike ? "text-amber-500" : "text-primary"
                    }`}
                  >
                    {spo2}%
                  </span>
                  <span className="text-xs text-muted-foreground">SpO2</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Optical Plethysmogram</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-low dark:bg-black/30 border border-border">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Arterial Pressure
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono text-foreground">
                    122/78
                  </span>
                  <span className="text-xs text-muted-foreground">mmHg</span>
                </div>
                <span className="text-[10px] text-muted-foreground">MAP: 92.7 mmHg</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-low dark:bg-black/30 border border-border">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Risk Validation
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono text-secondary">
                    93.9%
                  </span>
                  <span className="text-xs text-muted-foreground">AUC</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Celiac ML Stratifier</span>
              </div>
            </div>

            {/* Continuous SVG ECG Waveform Canvas */}
            <div className="p-4 rounded-xl bg-black/90 dark:bg-black/80 border border-emerald-900/60 relative overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40 text-[11px] font-mono text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LEAD-II CONTINUOUS TELEMETRY STREAM
                </span>
                <span>25 mm/s · 10 mm/mV</span>
              </div>

              <div className="py-4 relative">
                {/* SVG ECG Oscilloscope Line */}
                <svg
                  viewBox="0 0 600 80"
                  className="w-full h-24 stroke-emerald-400 fill-none"
                  style={{ filter: "drop-shadow(0 0 4px rgba(52, 211, 153, 0.6))" }}
                >
                  <path
                    d={
                      telemetrySimSpike
                        ? "M0,40 L30,40 L45,30 L60,40 L80,40 L90,10 L100,70 L115,40 L130,40 L160,20 L180,65 L195,40 L240,40 L250,5 L260,75 L275,40 L310,40 L325,32 L340,40 L380,40 L390,8 L400,74 L415,40 L460,40 L475,30 L490,40 L530,40 L540,12 L550,70 L565,40 L600,40"
                        : "M0,40 L40,40 L55,34 L70,40 L100,40 L110,12 L120,68 L135,40 L165,40 L180,32 L195,40 L240,40 L250,12 L260,68 L275,40 L305,40 L320,32 L335,40 L380,40 L390,12 L400,68 L415,40 L445,40 L460,32 L475,40 L520,40 L530,12 L540,68 L555,40 L600,40"
                    }
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {telemetrySimSpike && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold animate-pulse">
                    ⚠️ ARRHYTHMIA ANOMALY INJECTED
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400/70 pt-2 border-t border-emerald-900/40">
                <span>QRS Duration: 86 ms</span>
                <span>QT Interval: 390 ms</span>
                <span>PR Interval: 142 ms</span>
                <span>Signal SNR: 38 dB</span>
              </div>
            </div>

            {/* Interactive Control Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                onClick={handleSimulateSpike}
                disabled={telemetrySimSpike}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                {telemetrySimSpike ? "Normalizing..." : "Simulate Cardiac Spike"}
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href="/analytics"
                  onClick={() => setShowTelemetryModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-surface-low text-foreground flex items-center gap-1"
                >
                  Analytics Engine <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/devices/sensors"
                  onClick={() => setShowTelemetryModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:opacity-90 flex items-center gap-1 shadow-sm"
                >
                  Sensor Gateways <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STAT EMERGENCY SOS & RAPID RESPONSE DIALOG */}
      {/* ========================================================================= */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-red-950/70 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#1a1215] border-2 border-red-500 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[90dvh] overflow-y-auto">
            {/* Alert Header */}
            <div className="flex items-start justify-between pb-3 border-b border-red-500/30">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-red-500 text-white shadow-lg animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                    STAT Emergency Clinical Dispatch
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Critical Healthcare Helpline & Telemetry Broadcast
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-red-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed">
              If the patient is experiencing chest pain, acute shortness of breath, loss of consciousness, or anaphylaxis, initiate emergency triage immediately:
            </p>

            {/* Direct Telephone Helplines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href="tel:112"
                onClick={() => sound.playAlert()}
                className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-between shadow-md transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  <div>
                    <p className="leading-tight">Dial 112</p>
                    <p className="text-[10px] font-normal opacity-90">National Emergency (India / EU)</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="tel:911"
                onClick={() => sound.playAlert()}
                className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-between shadow-md transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  <div>
                    <p className="leading-tight">Dial 911</p>
                    <p className="text-[10px] font-normal opacity-90">US / Canada Emergency</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="tel:18002221222"
                className="p-2.5 rounded-xl border border-border bg-surface-low dark:bg-black/30 hover:border-red-500/50 text-foreground text-xs flex items-center justify-between transition-all"
              >
                <div>
                  <p className="font-semibold text-xs">Poison Control</p>
                  <p className="text-[10px] text-muted-foreground">1-800-222-1222</p>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-muted-foreground" />
              </a>

              <a
                href="tel:18005550199"
                className="p-2.5 rounded-xl border border-border bg-surface-low dark:bg-black/30 hover:border-red-500/50 text-foreground text-xs flex items-center justify-between transition-all"
              >
                <div>
                  <p className="font-semibold text-xs">Hospital Crash Cart Unit</p>
                  <p className="text-[10px] text-muted-foreground">Direct Telemetry Line</p>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            </div>

            {/* Automated STAT Crash Cart Telemetry Dispatch */}
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/5 dark:bg-red-950/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4" />
                  One-Click Hospital Telemetry Dispatch
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Node #409 · Ward 4B
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Broadcasts patient vitals (Lead-II ECG 72 bpm, SpO2 98.4%, BP 122/78), blood type A+, and allergy history to the on-call medical response team with HMAC-SHA256 audit seal.
              </p>

              {beaconDispatched ? (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    STAT Emergency Beacon Dispatched! Rapid Response Team ETA: 5 mins. Attending MD Dr. Elena Rostova notified.
                  </span>
                </div>
              ) : isDispatchingBeacon ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-red-600 dark:text-red-400">
                    <span>Broadcasting Telemetry Stream...</span>
                    <span>{dispatchProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-red-200 dark:bg-red-950 overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${dispatchProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleDispatchEmergencyBeacon}
                  className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Broadcast STAT Telemetry Beacon to Crash Team
                </button>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-surface-low text-muted-foreground hover:text-foreground"
              >
                Close Emergency Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
