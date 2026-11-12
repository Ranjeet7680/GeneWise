"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export const CLINICAL_AVATAR_PRESETS = [
  {
    id: "doctor-geneticist",
    label: "Clinical Geneticist",
    url: "/images/doctor-geneticist.jpg",
  },
  {
    id: "clinical-research",
    label: "Research Investigator",
    url: "/images/clinical-research.jpg",
  },
  {
    id: "dna-protein",
    label: "Molecular Helix",
    url: "/images/dna-protein.jpg",
  },
  {
    id: "family-wellness",
    label: "Patient & Family",
    url: "/images/family-wellness.jpg",
  },
];

export const AVATAR_COLOR_PRESETS: Record<string, { label: string; gradient: string; swatch: string }> = {
  teal: {
    label: "Clinical Teal",
    gradient: "from-[#004d47] to-[#0d9488]",
    swatch: "bg-[#0d9488]",
  },
  emerald: {
    label: "Genomic Emerald",
    gradient: "from-[#065f46] to-[#10b981]",
    swatch: "bg-[#10b981]",
  },
  indigo: {
    label: "Biomedical Indigo",
    gradient: "from-[#312e81] to-[#6366f1]",
    swatch: "bg-[#6366f1]",
  },
  sky: {
    label: "Telemetry Sky",
    gradient: "from-[#075985] to-[#0ea5e9]",
    swatch: "bg-[#0ea5e9]",
  },
  slate: {
    label: "Obsidian Vault",
    gradient: "from-[#0f172a] to-[#475569]",
    swatch: "bg-[#475569]",
  },
};

export function getInitials(name?: string | null): string {
  if (!name?.trim()) return "GW";
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showOnlineDot?: boolean;
  verified?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<UserAvatarProps["size"]>, { box: string; text: string; dot: string }> = {
  xs: { box: "w-6 h-6 text-[10px]", text: "text-[10px]", dot: "w-2 h-2" },
  sm: { box: "w-8 h-8 text-xs", text: "text-xs", dot: "w-2.5 h-2.5" },
  md: { box: "w-10 h-10 text-sm", text: "text-sm", dot: "w-3 h-3" },
  lg: { box: "w-14 h-14 text-base", text: "text-base", dot: "w-3.5 h-3.5" },
  xl: { box: "w-20 h-20 text-xl", text: "text-xl", dot: "w-4 h-4" },
};

export default function UserAvatar({
  name,
  avatarUrl,
  avatarColor = "teal",
  size = "sm",
  showOnlineDot = false,
  verified = false,
  className = "",
}: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [avatarUrl]);

  const sizeCfg = SIZE_CLASSES[size];
  const colorCfg = AVATAR_COLOR_PRESETS[avatarColor || "teal"] || AVATAR_COLOR_PRESETS.teal;
  const initials = getInitials(name);
  const shouldShowImage = Boolean(avatarUrl && avatarUrl.trim() && !imgFailed);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${sizeCfg.box} rounded-full overflow-hidden flex items-center justify-center font-bold border border-primary/30 shadow-xs transition-transform ${
          shouldShowImage ? "bg-surface-low" : `bg-gradient-to-br ${colorCfg.gradient} text-white`
        }`}
      >
        {shouldShowImage ? (
          <img
            src={avatarUrl || ""}
            alt={name || "User avatar"}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`${sizeCfg.text} tracking-tight font-bold select-none`}>{initials}</span>
        )}
      </div>

      {showOnlineDot && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${sizeCfg.dot} rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111f26]`}
        />
      )}

      {verified && !showOnlineDot && (
        <span
          title="Verified Clinical Account"
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white dark:bg-[#111f26] p-0.5 shadow-xs"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        </span>
      )}
    </div>
  );
}
