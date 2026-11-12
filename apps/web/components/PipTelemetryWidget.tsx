"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  HeartPulse,
  Maximize2,
  Minimize2,
  Move,
  Pause,
  Play,
  Radio,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ClinicalChartTooltip, { CLINICAL_TOOLTIP_CURSOR } from "@/components/ClinicalChartTooltip";
import { sound } from "@/lib/sound";

export interface PipTelemetryPoint {
  label: string;
  hr: number;
  spo2: number;
  systolic: number;
  diastolic?: number;
}

interface PipTelemetryWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  isStreaming: boolean;
  onToggleStream: () => void;
  heartRate: number;
  spo2: number;
  bpSystolic: number;
  bpDiastolic: number;
  series: PipTelemetryPoint[];
  analyticsHref?: string;
}

type PipChannel = "hr" | "spo2" | "systolic";
type PipCorner = "br" | "bl" | "tr";

export default function PipTelemetryWidget({
  isOpen,
  onClose,
  isStreaming,
  onToggleStream,
  heartRate,
  spo2,
  bpSystolic,
  bpDiastolic,
  series,
  analyticsHref = "/analytics",
}: PipTelemetryWidgetProps) {
  const [channel, setChannel] = useState<PipChannel>("hr");
  const [minimized, setMinimized] = useState(false);
  const [corner, setCorner] = useState<PipCorner>("br");

  if (!isOpen) return null;

  const cornerClass =
    corner === "br"
      ? "bottom-20 md:bottom-5 right-4"
      : corner === "bl"
      ? "bottom-20 md:bottom-5 left-4 md:left-72"
      : "top-20 right-4";

  const strokeColor =
    channel === "hr" ? "#0d9488" : channel === "spo2" ? "#0284c7" : "#e11d48";

  const unitLabel = channel === "hr" ? "BPM" : channel === "spo2" ? "%" : "mmHg";

  const cycleCorner = () => {
    sound.playSoft();
    setCorner((prev) => (prev === "br" ? "bl" : prev === "bl" ? "tr" : "br"));
  };

  return (
    <aside
      aria-label="Picture-in-Picture Telemetry Monitor"
      className={`fixed ${cornerClass} z-50 w-[310px] sm:w-[340px] rounded-2xl bg-white/92 dark:bg-[#0d1d24]/95 backdrop-blur-2xl border border-teal-500/35 shadow-[0_24px_48px_-12px_rgba(0,65,60,0.35)] overflow-hidden transition-all duration-300 animate-fade-in-up`}
    >
      {/* PiP Title Bar */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#063b36] via-[#0b564f] to-[#0f766e] text-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            {isStreaming && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isStreaming ? "bg-emerald-400" : "bg-amber-300"
              }`}
            />
          </span>
          <span className="text-[11px] font-bold tracking-tight truncate">
            PiP Telemetry Graph
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white/15 font-mono text-[9px] font-bold uppercase">
            {isStreaming ? "Live" : "Paused"}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={cycleCorner}
            title="Move PiP corner"
            className="p-1 rounded-md hover:bg-white/15 transition-colors"
          >
            <Move className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playSoft();
              onToggleStream();
            }}
            title={isStreaming ? "Pause live stream" : "Resume live stream"}
            className="p-1 rounded-md hover:bg-white/15 transition-colors"
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playSoft();
              setMinimized((v) => !v);
            }}
            title={minimized ? "Expand PiP graph" : "Minimize PiP graph"}
            className="p-1 rounded-md hover:bg-white/15 transition-colors"
          >
            {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playSoft();
              onClose();
            }}
            title="Close PiP window"
            className="p-1 rounded-md hover:bg-rose-500/40 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Vitals Strip */}
      <div className="grid grid-cols-3 divide-x divide-border/70 border-b border-border/70 bg-surface-low/60 text-center py-2">
        <div>
          <div className="text-[9px] font-bold uppercase text-muted-foreground flex items-center justify-center gap-1">
            <HeartPulse className="w-2.5 h-2.5 text-teal-600" /> HR
          </div>
          <div className="text-xs font-extrabold font-mono text-foreground">{Math.round(heartRate)} bpm</div>
        </div>
        <div>
          <div className="text-[9px] font-bold uppercase text-muted-foreground flex items-center justify-center gap-1">
            <Radio className="w-2.5 h-2.5 text-sky-600" /> SpO2
          </div>
          <div className="text-xs font-extrabold font-mono text-sky-700 dark:text-sky-300">{spo2.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-[9px] font-bold uppercase text-muted-foreground flex items-center justify-center gap-1">
            <Activity className="w-2.5 h-2.5 text-rose-600" /> BP
          </div>
          <div className="text-xs font-extrabold font-mono text-rose-600 dark:text-rose-400">
            {bpSystolic}/{bpDiastolic}
          </div>
        </div>
      </div>

      {!minimized && (
        <div className="p-3 space-y-2.5">
          {/* Signal Channel Switcher */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="inline-flex rounded-lg bg-surface-low border border-border p-0.5 text-[10px] font-semibold">
              {[
                { key: "hr" as const, label: "HR" },
                { key: "spo2" as const, label: "SpO2" },
                { key: "systolic" as const, label: "BP" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    sound.playSoft();
                    setChannel(item.key);
                  }}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    channel === item.key
                      ? "bg-teal-700 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <Link
              href={analyticsHref}
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-300 hover:underline"
            >
              <span>Full Engine</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Mini Dynamic Recharts Spark Area */}
          <div className="h-28 w-full rounded-xl bg-surface-low/80 border border-border/70 px-1.5 pt-2 pb-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series.slice(-12)} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="pipGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.38} />
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={CLINICAL_TOOLTIP_CURSOR}
                  content={
                    <ClinicalChartTooltip
                      compact={true}
                      unit={unitLabel}
                      labelFormatter={() => channel.toUpperCase()}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey={channel}
                  stroke={strokeColor}
                  strokeWidth={2}
                  fill="url(#pipGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </aside>
  );
}
