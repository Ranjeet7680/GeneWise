"use client";

import React, { useState } from "react";
import { AlertTriangle, PhoneCall, ShieldAlert, X, ExternalLink } from "lucide-react";

interface EmergencySosBannerProps {
  onDismiss?: () => void;
  customMessage?: string;
}

export default function EmergencySosBanner({ onDismiss, customMessage }: EmergencySosBannerProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="relative overflow-hidden rounded-2xl border-2 border-red-500/80 bg-linear-to-r from-red-600/15 via-rose-600/10 to-red-600/15 p-4 sm:p-5 shadow-xl shadow-red-500/10 my-3 animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2 sm:p-2.5 rounded-xl bg-red-600 text-white shrink-0 shadow-md animate-pulse">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                Critical Emergency SOS
              </span>
              <span className="text-xs font-bold text-red-600 dark:text-red-400">
                Potential Acute Medical Emergency
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed max-w-2xl">
              {customMessage ||
                "Your inquiry or reported symptoms indicate potential red-flag warning signs (e.g., acute chest pain, stroke symptoms, acute respiratory distress, or severe hemorrhage). Online tools cannot provide emergency medical care."}
            </p>
            <p className="text-[11px] text-red-600/90 dark:text-red-400/90 font-semibold">
              Please do NOT wait for an online reply. Immediately call your local emergency medical services or go to the nearest emergency department.
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss emergency alert"
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-low transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Emergency Hotlines Grid */}
      <div className="mt-4 pt-3 border-t border-red-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <a
          href="tel:112"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 112 (India / EU)</span>
        </a>
        <a
          href="tel:911"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 911 (US / Canada)</span>
        </a>
        <a
          href="tel:999"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 999 (United Kingdom)</span>
        </a>
        <a
          href="tel:108"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 108 (Ambulance)</span>
        </a>
      </div>
    </div>
  );
}
