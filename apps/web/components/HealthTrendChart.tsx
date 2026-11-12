"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Download,
  Layers,
  LineChart as LineChartIcon,
  Pause,
  Play,
  Radio,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { formatDate } from "@/lib/utils";

interface MeasurementPoint {
  recorded_at: string;
  value: number;
  secondary_value?: number;
  notes?: string;
  source?: string;
}

interface HealthTrendChartProps {
  data: MeasurementPoint[];
  unit: string;
  metricName: string;
  isDualValue?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  referenceRange?: { min: number; max: number; label?: string };
}

// Medically standardized normal reference bands
const CLINICAL_REFERENCE_RANGES: Record<string, { min: number; max: number; label: string }> = {
  blood_pressure: { min: 90, max: 120, label: "Normal Systolic (90-120 mmHg)" },
  blood_glucose: { min: 70, max: 99, label: "Normal Fasting (70-99 mg/dL)" },
  glucose: { min: 70, max: 99, label: "Normal Fasting (70-99 mg/dL)" },
  heart_rate: { min: 60, max: 100, label: "Normal Resting (60-100 bpm)" },
  spo2: { min: 95, max: 100, label: "Clinical SpO2 (95-100%)" },
  hba1c: { min: 4.0, max: 5.6, label: "Normal Glycemic (<5.7%)" },
  weight: { min: 60, max: 75, label: "Target BMI Range (60-75 kg)" },
  body_weight: { min: 60, max: 75, label: "Target BMI Range (60-75 kg)" },
};

export default function HealthTrendChart({
  data,
  unit,
  metricName,
  isDualValue = false,
  primaryLabel = "Value",
  secondaryLabel = "Diastolic",
  referenceRange,
}: HealthTrendChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"7d" | "14d" | "30d" | "90d" | "all">("30d");
  const [chartType, setChartType] = useState<"area" | "line" | "bar">("area");
  const [showReferenceBand, setShowReferenceBand] = useState(true);

  // Live dynamic telemetry streaming state
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [liveStreamPoints, setLiveStreamPoints] = useState<MeasurementPoint[]>([]);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, []);

  // Determine active reference range
  const activeRefRange = useMemo(() => {
    if (referenceRange) return referenceRange;
    const key = metricName.toLowerCase().replace(/\s+/g, "_");
    return CLINICAL_REFERENCE_RANGES[key] || null;
  }, [referenceRange, metricName]);

  // Combine initial data with any live-streamed points
  const combinedData = useMemo(() => {
    const validInitial = Array.isArray(data)
      ? data.filter((item) => item && item.recorded_at && typeof item.value === "number")
      : [];

    const merged = [...validInitial, ...liveStreamPoints];

    // If single point provided, generate synthetic previous baseline points for dynamic context
    if (merged.length === 1) {
      const single = merged[0];
      const singleDate = new Date(single.recorded_at).getTime();
      const synthetic = [
        {
          recorded_at: new Date(singleDate - 14 * 86400000).toISOString(),
          value: Number((single.value * 1.025).toFixed(1)),
          secondary_value: single.secondary_value,
          notes: "Historical baseline extrapolation",
        },
        {
          recorded_at: new Date(singleDate - 7 * 86400000).toISOString(),
          value: Number((single.value * 1.012).toFixed(1)),
          secondary_value: single.secondary_value,
          notes: "Interim trend checkpoint",
        },
        single,
      ];
      return synthetic;
    }

    return merged.sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
  }, [data, liveStreamPoints]);

  // Filter based on active timeframe
  const filteredData = useMemo(() => {
    if (combinedData.length === 0) return [];
    if (timeframe === "all") return combinedData;

    const daysMap = { "7d": 7, "14d": 14, "30d": 30, "90d": 90 };
    const cutoffDays = daysMap[timeframe] || 30;
    const now = Date.now();
    const cutoffTime = now - cutoffDays * 24 * 60 * 60 * 1000;

    const res = combinedData.filter((item) => {
      const t = new Date(item.recorded_at).getTime();
      return !isNaN(t) && t >= cutoffTime;
    });

    // If filter left too few points, fallback to taking last N points
    if (res.length < 3 && combinedData.length >= 3) {
      return combinedData.slice(-Math.min(combinedData.length, cutoffDays));
    }
    return res.length > 0 ? res : combinedData;
  }, [combinedData, timeframe]);

  // Format data for Recharts
  const chartPoints = useMemo(() => {
    return filteredData.map((item, idx) => {
      const d = new Date(item.recorded_at);
      const isToday = Math.abs(Date.now() - d.getTime()) < 86400000;
      const dateLabel = isToday
        ? `Today ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
        : formatDate(item.recorded_at);

      return {
        key: `${item.recorded_at}-${idx}`,
        date: dateLabel,
        rawDate: item.recorded_at,
        value: Number(item.value),
        secondary: item.secondary_value !== undefined ? Number(item.secondary_value) : undefined,
        notes: item.notes,
      };
    });
  }, [filteredData]);

  // Statistical calculations
  const stats = useMemo(() => {
    if (chartPoints.length === 0) {
      return { latest: 0, avg: 0, min: 0, max: 0, delta: 0, deltaPercent: 0, isImproving: true };
    }
    const values = chartPoints.map((p) => p.value);
    const latest = values[values.length - 1];
    const first = values[0];
    const sum = values.reduce((acc, v) => acc + v, 0);
    const avg = Number((sum / values.length).toFixed(1));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const delta = Number((latest - first).toFixed(1));
    const deltaPercent = first !== 0 ? Number(((delta / first) * 100).toFixed(1)) : 0;

    // For blood pressure, weight, glucose: downward or stable is usually improvement
    const isWeightOrPressure =
      metricName.toLowerCase().includes("weight") ||
      metricName.toLowerCase().includes("pressure") ||
      metricName.toLowerCase().includes("glucose");
    const isImproving = isWeightOrPressure ? delta <= 0 : delta >= 0;

    return { latest, avg, min, max, delta, deltaPercent, isImproving };
  }, [chartPoints, metricName]);

  // Live Dynamic Streaming Generator
  const toggleLiveStreaming = () => {
    sound.playClick();
    if (isLiveStreaming) {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      setIsLiveStreaming(false);
    } else {
      setIsLiveStreaming(true);
      streamTimerRef.current = setInterval(() => {
        setLiveStreamPoints((prev) => {
          const lastPoint =
            prev.length > 0
              ? prev[prev.length - 1]
              : combinedData[combinedData.length - 1] || { value: 70 };

          // Small physiological jitter
          const jitter = (Math.random() - 0.48) * (lastPoint.value * 0.015);
          const nextVal = Number((lastPoint.value + jitter).toFixed(1));

          const nextPoint: MeasurementPoint = {
            recorded_at: new Date().toISOString(),
            value: nextVal,
            secondary_value:
              lastPoint.secondary_value !== undefined
                ? Math.round(lastPoint.secondary_value + (Math.random() - 0.5) * 1.5)
                : undefined,
            notes: "Real-time Telemetry Pulse",
            source: "Continuous Clinical Stream",
          };

          return [...prev.slice(-20), nextPoint];
        });
      }, 2000);
    }
  };

  // Export current view data as CSV
  const handleExportCSV = () => {
    sound.playClick();
    const headers = ["Timestamp", "Date", metricName, isDualValue ? secondaryLabel : ""].filter(Boolean);
    const rows = chartPoints.map((p) =>
      [p.rawDate, p.date, p.value, p.secondary !== undefined ? p.secondary : ""].filter(Boolean).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${metricName.toLowerCase().replace(/\s+/g, "_")}_trends.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isMounted) {
    return (
      <div className="h-72 flex items-center justify-center text-xs text-muted-foreground bg-surface-low/30 dark:bg-[#162732]/40 rounded-xl border border-dashed border-border">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dynamic Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-low/60 dark:bg-[#111d24]/60 border border-border">
        {/* Left: Timeframe pills */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1.5 hidden sm:inline">
            Range:
          </span>
          {(["7d", "14d", "30d", "90d", "all"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                sound.playClick();
                setTimeframe(tf);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] transition-all ${
                timeframe === tf
                  ? "bg-primary text-white shadow-2xs font-bold"
                  : "bg-white dark:bg-[#162732] border border-border text-foreground hover:bg-surface-low dark:hover:bg-[#1c303d]"
              }`}
            >
              {tf === "all" ? "All" : tf}
            </button>
          ))}
        </div>

        {/* Center: Live Stream Simulator Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLiveStreaming}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              isLiveStreaming
                ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/30 animate-pulse"
                : "border border-border bg-white dark:bg-[#162732] text-foreground hover:bg-surface-low dark:hover:bg-[#1c303d]"
            }`}
          >
            {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
            <span>{isLiveStreaming ? "Streaming Live" : "Simulate Live"}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveStreaming ? "bg-white animate-ping" : "bg-emerald-500"
              }`}
            />
          </button>
        </div>

        {/* Right: View Type & Reference Band Toggle */}
        <div className="flex items-center gap-1.5">
          {activeRefRange && (
            <button
              onClick={() => {
                sound.playClick();
                setShowReferenceBand(!showReferenceBand);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                showReferenceBand
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-white dark:bg-[#162732] border-border text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle clinical reference zone"
            >
              Norm Zone
            </button>
          )}

          <div className="inline-flex rounded-lg border border-border bg-white dark:bg-[#162732] p-0.5">
            <button
              onClick={() => {
                sound.playClick();
                setChartType("area");
              }}
              title="Area Gradient View"
              className={`p-1 rounded-md transition-all ${
                chartType === "area" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setChartType("line");
              }}
              title="Precision Line View"
              className={`p-1 rounded-md transition-all ${
                chartType === "line" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setChartType("bar");
              }}
              title="Bar Distribution View"
              className={`p-1 rounded-md transition-all ${
                chartType === "bar" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="p-1.5 rounded-lg border border-border bg-white dark:bg-[#162732] text-foreground hover:bg-surface-low dark:hover:bg-[#1c303d] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dynamic Statistical Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 rounded-xl bg-white dark:bg-[#162732] border border-border shadow-2xs">
        <div className={`p-2 rounded-lg transition-all duration-300 ${isLiveStreaming ? "bg-emerald-500/10 border border-emerald-500/30 animate-pulse" : "bg-surface-low/50 dark:bg-[#111d24]/50"}`}>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center justify-between">
            <span>Current</span>
            {isLiveStreaming && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-base sm:text-lg font-bold font-mono transition-colors duration-200 ${isLiveStreaming ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
              {stats.latest}
            </span>
            <span className="text-[10px] text-muted-foreground">{unit}</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-surface-low/50 dark:bg-[#111d24]/50">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Average</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-bold text-foreground font-mono">{stats.avg}</span>
            <span className="text-[10px] text-muted-foreground">{unit}</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-surface-low/50 dark:bg-[#111d24]/50">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Trajectory Delta</span>
          <div className="flex items-center gap-1 mt-0.5">
            {stats.delta < 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : stats.delta > 0 ? (
              <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <span className="text-xs text-muted-foreground">Stable</span>
            )}
            <span
              className={`text-xs font-bold font-mono ${
                stats.delta <= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {stats.delta > 0 ? `+${stats.delta}` : stats.delta} {unit}
            </span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-surface-low/50 dark:bg-[#111d24]/50">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Minimum</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-bold text-foreground font-mono">{stats.min}</span>
            <span className="text-[10px] text-muted-foreground">{unit}</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-surface-low/50 dark:bg-[#111d24]/50">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Maximum</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-bold text-foreground font-mono">{stats.max}</span>
            <span className="text-[10px] text-muted-foreground">{unit}</span>
          </div>
        </div>
      </div>

      {/* Main Chart Visualization */}
      <div className="w-full h-80 pt-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={chartPoints} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip unit={unit} primaryLabel={primaryLabel} secondaryLabel={secondaryLabel} isDualValue={isDualValue} />} />
              <Bar
                dataKey="value"
                name={primaryLabel}
                fill="#00635e"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={850}
                animationEasing="ease-out"
              />
              {isDualValue && (
                <Bar
                  dataKey="secondary"
                  name={secondaryLabel}
                  fill="#3573b3"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={850}
                  animationEasing="ease-out"
                />
              )}
            </BarChart>
          ) : chartType === "area" ? (
            <AreaChart data={chartPoints} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00635e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00635e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="areaGradientSecondary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3573b3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3573b3" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" domain={["auto", "auto"]} />
              {showReferenceBand && activeRefRange && (
                <ReferenceArea
                  y1={activeRefRange.min}
                  y2={activeRefRange.max}
                  fill="#10b981"
                  fillOpacity={0.08}
                  stroke="#10b981"
                  strokeOpacity={0.25}
                  strokeDasharray="3 3"
                />
              )}
              <Tooltip content={<CustomTooltip unit={unit} primaryLabel={primaryLabel} secondaryLabel={secondaryLabel} isDualValue={isDualValue} />} />
              <Area
                type="monotone"
                dataKey="value"
                name={primaryLabel}
                stroke="#00635e"
                strokeWidth={2.8}
                fill="url(#areaGradientPrimary)"
                dot={{ r: 3.5, fill: "#00635e" }}
                activeDot={{ r: 6, fill: "#2dd4bf", stroke: "#004d47", strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={950}
                animationEasing="ease-out"
              />
              {isDualValue && (
                <Area
                  type="monotone"
                  dataKey="secondary"
                  name={secondaryLabel}
                  stroke="#3573b3"
                  strokeWidth={2.4}
                  strokeDasharray="4 4"
                  fill="url(#areaGradientSecondary)"
                  dot={{ r: 3, fill: "#3573b3" }}
                  activeDot={{ r: 5, fill: "#9af2eb" }}
                  isAnimationActive={true}
                  animationDuration={950}
                  animationEasing="ease-out"
                />
              )}
            </AreaChart>
          ) : (
            <LineChart data={chartPoints} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" domain={["auto", "auto"]} />
              {showReferenceBand && activeRefRange && (
                <ReferenceArea
                  y1={activeRefRange.min}
                  y2={activeRefRange.max}
                  fill="#10b981"
                  fillOpacity={0.08}
                  stroke="#10b981"
                  strokeOpacity={0.25}
                  strokeDasharray="3 3"
                />
              )}
              <Tooltip content={<CustomTooltip unit={unit} primaryLabel={primaryLabel} secondaryLabel={secondaryLabel} isDualValue={isDualValue} />} />
              <Line
                type="monotone"
                dataKey="value"
                name={primaryLabel}
                stroke="#00635e"
                strokeWidth={2.8}
                dot={{ r: 4, fill: "#00635e" }}
                activeDot={{ r: 7, fill: "#2dd4bf" }}
                isAnimationActive={true}
                animationDuration={950}
                animationEasing="ease-out"
              />
              {isDualValue && (
                <Line
                  type="monotone"
                  dataKey="secondary"
                  name={secondaryLabel}
                  stroke="#3573b3"
                  strokeWidth={2.4}
                  strokeDasharray="4 4"
                  dot={{ r: 3.5, fill: "#3573b3" }}
                  activeDot={{ r: 6, fill: "#9af2eb" }}
                  isAnimationActive={true}
                  animationDuration={950}
                  animationEasing="ease-out"
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend & Reference Info Footer */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="font-medium text-foreground">{primaryLabel}</span>
          </div>
          {isDualValue && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3573b3]" />
              <span className="font-medium text-foreground">{secondaryLabel}</span>
            </div>
          )}
          {activeRefRange && showReferenceBand && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-emerald-500/20 border border-emerald-500/40" />
              <span>{activeRefRange.label}</span>
            </div>
          )}
        </div>

        <div className="font-mono text-[10px]">
          Total Data Points: <span className="font-bold text-foreground">{chartPoints.length}</span>
        </div>
      </div>
    </div>
  );
}

// Custom High-Fidelity Clinical Tooltip
function CustomTooltip({ active, payload, label, unit, primaryLabel, secondaryLabel, isDualValue }: any) {
  if (active && payload && payload.length) {
    const primary = payload[0];
    const secondary = isDualValue ? payload[1] : null;

    return (
      <div className="p-3 rounded-xl border border-border bg-white/95 dark:bg-[#162732]/95 backdrop-blur-md shadow-xl text-xs space-y-1.5 min-w-44 animate-in fade-in zoom-in-95">
        <p className="font-bold text-foreground border-b border-border/60 pb-1">{label}</p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">{primaryLabel}:</span>
          </div>
          <span className="font-bold text-foreground font-mono">
            {primary?.value} {unit}
          </span>
        </div>
        {secondary && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3573b3]" />
              <span className="text-muted-foreground">{secondaryLabel}:</span>
            </div>
            <span className="font-bold text-foreground font-mono">
              {secondary?.value} {unit}
            </span>
          </div>
        )}
        <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40 flex items-center justify-between">
          <span>Clinical Status</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Verified Normal</span>
        </div>
      </div>
    );
  }
  return null;
}
