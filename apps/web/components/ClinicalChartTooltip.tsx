"use client";

import React from "react";

export interface ChartTooltipItem {
  name?: string;
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  fill?: string;
  stroke?: string;
  payload?: Record<string, unknown> & { color?: string; fill?: string };
}

interface ClinicalChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipItem[];
  label?: string | number;
  unit?: string;
  compact?: boolean;
  labelFormatter?: (item: ChartTooltipItem) => string;
}

const BRIGHT_ACCENT_MAP: Record<string, string> = {
  "#00635e": "#2dd4bf",
  "#005a53": "#2dd4bf",
  "#004d47": "#2dd4bf",
  "#0f766e": "#2dd4bf",
  "#0d9488": "#2dd4bf",
  "#0284c7": "#38bdf8",
  "#0ea5e9": "#38bdf8",
  "#7c3aed": "#a78bfa",
  "#6366f1": "#818cf8",
  "#e11d48": "#fb7185",
  "#f43f5e": "#fb7185",
  "#d97706": "#fbbf24",
  "#059669": "#34d399",
  "#64748b": "#94a3b8",
};

/**
 * Brightens dark chart line/fill hex values so tooltip swatch dots remain
 * luminous and high-contrast against dark slate glass backgrounds.
 */
export function toBrightTooltipAccent(rawColor?: string): string {
  if (!rawColor) return "#2dd4bf";
  const normalized = rawColor.trim().toLowerCase();
  return BRIGHT_ACCENT_MAP[normalized] || rawColor;
}

export const CLINICAL_TOOLTIP_CURSOR = {
  fill: "rgba(20, 184, 166, 0.08)",
  stroke: "#14b8a6",
  strokeWidth: 1.5,
  strokeDasharray: "4 4",
};

/**
 * Shared high-contrast custom Recharts tooltip component so labels, swatch
 * dots, and numeric readings remain sharply legible on all charts.
 */
export default function ClinicalChartTooltip({
  active,
  payload,
  label,
  unit,
  compact = false,
  labelFormatter,
}: ClinicalChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const headerText =
    label !== undefined && label !== null && String(label).trim().length > 0
      ? String(label)
      : payload[0]?.name
      ? String(payload[0].name)
      : "";

  return (
    <div
      className={`rounded-2xl bg-[#0b1920]/95 border border-teal-400/35 shadow-2xl backdrop-blur-md text-white ${
        compact ? "px-2.5 py-2 text-[10px] min-w-[140px]" : "px-3.5 py-2.5 text-xs min-w-[190px]"
      }`}
    >
      {headerText && (
        <div
          className={`font-extrabold text-teal-200 border-b border-white/10 flex items-center gap-1.5 ${
            compact ? "pb-1 mb-1 text-[10px]" : "pb-1.5 mb-2 text-[11px]"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
          <span className="truncate">{headerText}</span>
        </div>
      )}

      <div className={compact ? "space-y-1" : "space-y-1.5"}>
        {payload.map((entry, idx) => {
          const rawColor =
            entry.color ||
            entry.stroke ||
            entry.fill ||
            entry.payload?.color ||
            entry.payload?.fill;
          const swatchColor = toBrightTooltipAccent(rawColor);
          const itemLabel = labelFormatter
            ? labelFormatter(entry)
            : String(entry.name || entry.dataKey || "Metric");
          const formattedVal =
            entry.value !== undefined && entry.value !== null ? String(entry.value) : "-";

          return (
            <div
              key={`${String(entry.dataKey || entry.name || idx)}-${idx}`}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white/20"
                  style={{ backgroundColor: swatchColor }}
                />
                <span className="text-slate-200 font-medium truncate">
                  {itemLabel}
                </span>
              </div>
              <span className="font-mono font-extrabold text-white shrink-0 tabular-nums">
                {formattedVal}
                {unit ? ` ${unit}` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
