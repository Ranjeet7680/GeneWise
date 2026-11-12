"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Dna, Microscope, ShieldCheck } from "lucide-react";
import { useOptionalAuth, DEFAULT_WORKSPACE_BRAND } from "@/lib/auth";
import { WorkspaceBrandConfig, WorkspaceLogoKey } from "@/types";

interface MediPredictLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSubtitle?: boolean;
  showBadge?: boolean;
  animated?: boolean;
  variant?: "default" | "light";
  brand?: "medipredict" | "genewise";
  brandName?: string;
  subtitleText?: string;
  badgeText?: string;
  logoKey?: WorkspaceLogoKey;
  logoUrl?: string;
  overrideBrand?: Partial<WorkspaceBrandConfig>;
  href?: string;
  className?: string;
}

export default function MediPredictLogo({
  size = "md",
  showText = true,
  showSubtitle = true,
  showBadge = true,
  animated = true,
  variant = "default",
  brand = "genewise",
  brandName,
  subtitleText,
  badgeText,
  logoKey,
  logoUrl,
  overrideBrand,
  href,
  className = "",
}: MediPredictLogoProps) {
  const auth = useOptionalAuth();
  const activeBrand = auth?.workspaceBrand || DEFAULT_WORKSPACE_BRAND;

  const resolvedName =
    overrideBrand?.name ??
    brandName ??
    (brand === "medipredict" && activeBrand.name === DEFAULT_WORKSPACE_BRAND.name
      ? "GeneWise"
      : activeBrand.name);

  const resolvedSubtitle =
    overrideBrand?.subtitle ??
    subtitleText ??
    (brand === "medipredict" && activeBrand.subtitle === DEFAULT_WORKSPACE_BRAND.subtitle
      ? "Clinical-grade genetics literacy"
      : activeBrand.subtitle);

  const resolvedBadge =
    overrideBrand?.badge ??
    badgeText ??
    (brand === "medipredict" && activeBrand.badge === DEFAULT_WORKSPACE_BRAND.badge
      ? "v2.4 CLINVAR"
      : activeBrand.badge);

  const resolvedLogoKey: WorkspaceLogoKey =
    overrideBrand?.logoKey ?? logoKey ?? activeBrand.logoKey ?? "pulse";

  const resolvedLogoUrl = overrideBrand?.logoUrl ?? logoUrl ?? activeBrand.logoUrl;

  const [customImgError, setCustomImgError] = useState(false);

  useEffect(() => {
    setCustomImgError(false);
  }, [resolvedLogoUrl]);

  const dimensions = {
    sm: { icon: 28, innerIcon: "w-4 h-4", text: "text-sm", sub: "text-[10px]", badge: "text-[8px] px-1" },
    md: { icon: 36, innerIcon: "w-5 h-5", text: "text-base", sub: "text-[11px]", badge: "text-[9px] px-1.5" },
    lg: { icon: 44, innerIcon: "w-6 h-6", text: "text-lg", sub: "text-xs", badge: "text-[10px] px-2" },
    xl: { icon: 56, innerIcon: "w-7 h-7", text: "text-2xl", sub: "text-sm", badge: "text-xs px-2.5 py-0.5" },
  }[size];

  const renderGraphic = () => {
    if (resolvedLogoKey === "custom" && resolvedLogoUrl && !customImgError) {
      return (
        <img
          src={resolvedLogoUrl}
          alt={resolvedName}
          onError={() => setCustomImgError(true)}
          className="w-full h-full object-cover"
        />
      );
    }

    if (resolvedLogoKey === "dna") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#004d47] via-[#0d9488] to-[#10b981] flex items-center justify-center text-white relative">
          <Dna className={`${dimensions.innerIcon} ${animated ? "animate-pulse" : ""}`} />
        </div>
      );
    }

    if (resolvedLogoKey === "shield") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#0f172a] via-[#004d47] to-[#0284c7] flex items-center justify-center text-emerald-300 relative">
          <ShieldCheck className={`${dimensions.innerIcon} ${animated ? "animate-pulse" : ""}`} />
        </div>
      );
    }

    if (resolvedLogoKey === "microscope") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#312e81] via-[#00635e] to-[#0f766e] flex items-center justify-center text-teal-200 relative">
          <Microscope className={`${dimensions.innerIcon} ${animated ? "animate-pulse" : ""}`} />
        </div>
      );
    }

    return (
      <svg
        viewBox="0 0 48 48"
        width={dimensions.icon}
        height={dimensions.icon}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="mpBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#004d47" />
            <stop offset="50%" stopColor="#00635e" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id="mpPulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="mpGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
          <filter id="mpDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#002b28" floodOpacity="0.3" />
          </filter>

          <style>{`
            @keyframes ecgLoop {
              0% { stroke-dashoffset: 140; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes beaconPulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.4); opacity: 0.6; }
            }
            @keyframes nodeBlink {
              0%, 100% { opacity: 0.4; transform: scale(0.9); }
              50% { opacity: 1; transform: scale(1.2); }
            }
            .ecg-anim-path {
              stroke-dasharray: 140;
              animation: ecgLoop 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            .beacon-anim {
              transform-origin: 24px 13px;
              animation: beaconPulse 2s ease-in-out infinite;
            }
            .node-1 { transform-origin: 24px 11px; animation: nodeBlink 2.4s ease-in-out infinite 0.2s; }
            .node-2 { transform-origin: 13px 20px; animation: nodeBlink 2.4s ease-in-out infinite 0.6s; }
            .node-3 { transform-origin: 35px 20px; animation: nodeBlink 2.4s ease-in-out infinite 1.0s; }
            .node-4 { transform-origin: 15px 35px; animation: nodeBlink 2.4s ease-in-out infinite 1.4s; }
            .node-5 { transform-origin: 33px 35px; animation: nodeBlink 2.4s ease-in-out infinite 1.8s; }
          `}</style>
        </defs>

        <rect width="48" height="48" rx="12" fill="url(#mpBgGradient)" />

        <path
          d="M24 6L39 15V33L24 42L9 33V15L24 6Z"
          stroke="url(#mpGlow)"
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.35"
        />

        <circle cx="24" cy="11" r="2" fill="#2dd4bf" className={animated ? "node-1" : ""} />
        <circle cx="13" cy="20" r="1.75" fill="#2dd4bf" className={animated ? "node-2" : ""} />
        <circle cx="35" cy="20" r="1.75" fill="#2dd4bf" className={animated ? "node-3" : ""} />
        <circle cx="15" cy="35" r="1.75" fill="#2dd4bf" className={animated ? "node-4" : ""} />
        <circle cx="33" cy="35" r="1.75" fill="#2dd4bf" className={animated ? "node-5" : ""} />

        <line x1="24" y1="11" x2="13" y2="20" stroke="#2dd4bf" strokeWidth="0.8" opacity="0.3" />
        <line x1="24" y1="11" x2="35" y2="20" stroke="#2dd4bf" strokeWidth="0.8" opacity="0.3" />
        <line x1="13" y1="20" x2="15" y2="35" stroke="#2dd4bf" strokeWidth="0.8" opacity="0.25" />
        <line x1="35" y1="20" x2="33" y2="35" stroke="#2dd4bf" strokeWidth="0.8" opacity="0.25" />

        <path
          d="M8 25.5H16L18.5 21L21 28.5L24 13L27.5 35L30.5 23L33 27H40"
          stroke="url(#mpPulseGradient)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#mpDropShadow)"
          className={animated ? "ecg-anim-path" : ""}
        />

        <circle
          cx="24"
          cy="13"
          r="2.5"
          fill="#ffffff"
          className={animated ? "beacon-anim" : ""}
        />
        <circle cx="24" cy="13" r="1.6" fill="#2dd4bf" />

        <path
          d="M38 23L41 25.5L38 28"
          stroke="#34d399"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const iconElement = (
    <div
      className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
      style={{ width: dimensions.icon, height: dimensions.icon }}
    >
      {renderGraphic()}
      {animated && (
        <span className="absolute -inset-0.5 rounded-xl bg-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </div>
  );

  const isLight = variant === "light";

  const textElement = showText ? (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center gap-1.5 leading-tight">
        <span
          className={`font-bold tracking-tight transition-colors truncate max-w-[140px] sm:max-w-[200px] ${
            isLight
              ? "text-white group-hover:text-emerald-300"
              : "text-foreground group-hover:text-primary"
          } ${dimensions.text}`}
        >
          {resolvedName}
        </span>
        {showBadge && resolvedBadge && (
          <span
            className={`${dimensions.badge} py-0.2 rounded-full font-mono font-semibold tracking-wide transition-transform group-hover:scale-105 hidden sm:inline-block shrink-0 ${
              isLight
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-primary/10 text-primary border border-primary/20"
            }`}
          >
            {resolvedBadge}
          </span>
        )}
      </div>
      {showSubtitle && resolvedSubtitle && (
        <span
          className={`${dimensions.sub} leading-none hidden sm:inline transition-opacity group-hover:opacity-90 truncate max-w-[180px] sm:max-w-[240px] ${
            isLight ? "text-emerald-100/70" : "text-muted-foreground"
          }`}
        >
          {resolvedSubtitle}
        </span>
      )}
    </div>
  ) : null;

  const content = (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {iconElement}
      {textElement}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block min-w-0">
        {content}
      </Link>
    );
  }

  return content;
}
