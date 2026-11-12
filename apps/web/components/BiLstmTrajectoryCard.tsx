"use client";

import React from "react";
import { Activity, BrainCircuit, TrendingDown, TrendingUp } from "lucide-react";
import { LstmBiomarkerForecast } from "@/types";

interface BiLstmTrajectoryCardProps {
  forecast: LstmBiomarkerForecast;
  compact?: boolean;
}

/**
 * Renders the 2-layer Bi-LSTM longitudinal biomarker trajectory SVG plot (historical visits,
 * +30d/+90d forecast horizon with 95% CI band, and Forget/Input/Output gate attributions).
 */
export default function BiLstmTrajectoryCard({
  forecast,
  compact = false,
}: BiLstmTrajectoryCardProps) {
  const pts = forecast.sequence;
  const allVals = pts.flatMap((p) => [
    p.value,
    p.lowerBound ?? p.value,
    p.upperBound ?? p.value,
  ]);
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const pad = Math.max(0.5, (rawMax - rawMin) * 0.22);
  const yMin = rawMin - pad;
  const yMax = rawMax + pad;

  const w = 440;
  const h = compact ? 112 : 148;
  const padX = 28;
  const padY = 16;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const toX = (idx: number) =>
    pts.length <= 1 ? padX + innerW / 2 : padX + (idx / (pts.length - 1)) * innerW;
  const toY = (val: number) =>
    yMax === yMin ? padY + innerH / 2 : padY + ((yMax - val) / (yMax - yMin)) * innerH;

  const historyPts = pts.filter((p) => !p.isForecast);
  const lastHistIndex = Math.max(0, historyPts.length - 1);

  const histPath = historyPts
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${toX(idx).toFixed(1)} ${toY(p.value).toFixed(1)}`)
    .join(" ");

  const forecastPts = pts.slice(lastHistIndex);
  const forecastPath = forecastPts
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${toX(lastHistIndex + idx).toFixed(1)} ${toY(p.value).toFixed(1)}`)
    .join(" ");

  // Shaded 95% uncertainty polygon across the forecast horizon
  const upperBand = forecastPts
    .map((p, idx) => `${toX(lastHistIndex + idx).toFixed(1)},${toY(p.upperBound ?? p.value).toFixed(1)}`)
    .join(" ");
  const lowerBand = [...forecastPts]
    .reverse()
    .map((p, revIdx) => {
      const origIdx = forecastPts.length - 1 - revIdx;
      return `${toX(lastHistIndex + origIdx).toFixed(1)},${toY(p.lowerBound ?? p.value).toFixed(1)}`;
    })
    .join(" ");

  const TrendIcon = forecast.trend === "improving" ? TrendingDown : forecast.trend === "elevating" ? TrendingUp : Activity;
  const trendTone =
    forecast.trend === "elevating"
      ? "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30"
      : forecast.trend === "improving"
      ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
      : "text-teal-700 dark:text-teal-300 bg-teal-500/10 border-teal-500/30";

  return (
    <div
      data-testid="lstm-trajectory-card"
      className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/60 via-white to-teal-50/50 dark:from-indigo-950/30 dark:via-[#14262f] dark:to-teal-950/20 p-3 space-y-2.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-600/15 text-indigo-700 dark:text-indigo-300">
            <BrainCircuit className="w-4 h-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold text-foreground leading-tight">
              Bi-LSTM Sequence Forecast: {forecast.biomarkerLabel}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Ref: {forecast.referenceRange} • Attention Peak: {forecast.attentionPeakVisit}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${trendTone}`}
          >
            <TrendIcon className="w-3 h-3" />
            {forecast.deltaPerMonth >= 0 ? "+" : ""}
            {forecast.deltaPerMonth} {forecast.unit}/mo
          </span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold font-mono">
            {Math.round(forecast.confidence * 100)}% Conf
          </span>
        </div>
      </div>

      {/* SVG Sequence Trajectory */}
      <div className="w-full overflow-hidden rounded-lg bg-white/80 dark:bg-[#0f1d24]/80 border border-border/60 px-2 py-1.5">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-auto"
          role="img"
          aria-label={`Bi-LSTM trajectory chart for ${forecast.biomarkerLabel}`}
        >
          {/* Baseline horizontal guides */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padX}
              y1={padY + innerH * ratio}
              x2={w - padX}
              y2={padY + innerH * ratio}
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeDasharray="3 3"
            />
          ))}

          {/* 95% confidence band */}
          {forecastPts.length > 1 && (
            <polygon
              points={`${upperBand} ${lowerBand}`}
              fill="#6366f1"
              fillOpacity="0.14"
            />
          )}

          {/* Observed longitudinal line */}
          {histPath && (
            <path
              d={histPath}
              fill="none"
              stroke="#0f766e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* LSTM predicted trajectory line */}
          {forecastPath && (
            <path
              d={forecastPath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Visit nodes & value labels */}
          {pts.map((p, idx) => {
            const cx = toX(idx);
            const cy = toY(p.value);
            return (
              <g key={`${p.visitLabel}-${idx}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={p.isForecast ? 4.5 : 3.5}
                  fill={p.isForecast ? "#6366f1" : "#0f766e"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={cx}
                  y={Math.max(10, cy - 8)}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill={p.isForecast ? "#4f46e5" : "#0f172a"}
                >
                  {p.value}
                </text>
                <text
                  x={cx}
                  y={h - 2}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill="#64748b"
                >
                  {p.visitLabel.replace(/\s*\([^)]*\)/, "")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Key Metrics + Gate Weights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-[#1a2e38]/80 border border-border/60">
          <div>
            <span className="text-muted-foreground block">Current V0</span>
            <span className="font-bold text-foreground text-xs">
              {forecast.currentValue} {forecast.unit}
            </span>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground block">+30d LSTM</span>
            <span className="font-bold text-indigo-700 dark:text-indigo-300 text-xs">
              {forecast.projected30d} {forecast.unit}
            </span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground block">+90d LSTM</span>
            <span className="font-bold text-indigo-700 dark:text-indigo-300 text-xs">
              {forecast.projected90d} {forecast.unit}
            </span>
          </div>
        </div>

        <div className="px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-[#1a2e38]/80 border border-border/60 space-y-1">
          <div className="flex items-center justify-between font-semibold text-muted-foreground">
            <span>LSTM Cell Gate Weights</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">
              F {forecast.gateWeights.forget}% / I {forecast.gateWeights.input}% / O {forecast.gateWeights.output}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
            <div style={{ width: `${forecast.gateWeights.forget}%` }} className="bg-amber-500" />
            <div style={{ width: `${forecast.gateWeights.input}%` }} className="bg-teal-600" />
            <div style={{ width: `${forecast.gateWeights.output}%` }} className="bg-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
