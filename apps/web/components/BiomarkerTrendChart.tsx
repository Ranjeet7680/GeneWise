"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine
} from "recharts";
import { Activity, Calendar, TrendingDown, TrendingUp, AlertCircle, Info } from "lucide-react";
import { BiomarkerTrendSeries } from "@/types";
import { sound } from "@/lib/sound";

interface BiomarkerTrendChartProps {
  series: BiomarkerTrendSeries[];
  defaultSelected?: string;
}

export default function BiomarkerTrendChart({ series, defaultSelected }: BiomarkerTrendChartProps) {
  const [selectedName, setSelectedName] = useState<string>(
    defaultSelected || (series.length > 0 ? (series[0].test_name || series[0].biomarker_name || "") : "")
  );
  const [timeframe, setTimeframe] = useState<"30d" | "3m" | "6m" | "12m" | "all">("12m");

  if (!series || series.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-border bg-surface-low/30 dark:bg-[#111d24]/40 text-xs text-muted-foreground">
        <Activity className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
        <p>No historical biomarker trajectories recorded for this patient.</p>
      </div>
    );
  }

  const activeSeries = series.find(
    (s) => (s.test_name || s.biomarker_name) === selectedName
  ) || series[0];

  const points = activeSeries.points || activeSeries.data_points || [];

  // Sort and format points
  const chartData = points.map((p) => ({
    date: p.date,
    value: Number(p.value),
    flag: p.flag,
    report: p.report_title || "Diagnostic Report",
  }));

  const refLow = activeSeries.reference_low !== undefined ? activeSeries.reference_low : undefined;
  const refHigh = activeSeries.reference_high !== undefined ? activeSeries.reference_high : undefined;

  const currentVal = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const priorVal = chartData.length > 1 ? chartData[chartData.length - 2].value : currentVal;
  const deltaPct = priorVal !== 0 ? ((currentVal - priorVal) / priorVal) * 100 : 0;

  return (
    <div className="rounded-xl border border-border bg-white dark:bg-[#162732] p-5 shadow-2xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary" /> Longitudinal Biomarker Trajectory
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Reference Interval Shaded
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Evaluates velocity and drift across successive diagnostic draws.
          </p>
        </div>

        {/* Timeframe selector pills */}
        <div className="flex items-center gap-1 bg-surface-low dark:bg-[#111d24] p-1 rounded-lg border border-border/50 text-[11px]">
          {(["30d", "3m", "6m", "12m", "all"] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => {
                sound.playClick();
                setTimeframe(tf);
              }}
              className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                timeframe === tf
                  ? "bg-white dark:bg-[#1c303d] text-primary shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Biomarker Pill Selector */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-muted-foreground mr-1">Select Biomarker:</span>
        {series.map((s) => {
          const sName = s.test_name || s.biomarker_name || "Test";
          const isSelected = sName === selectedName;
          return (
            <button
              key={sName}
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedName(sName);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                  : "bg-surface-low dark:bg-[#111d24] border-border text-foreground hover:border-primary/40"
              }`}
            >
              {sName}
            </button>
          );
        })}
      </div>

      {/* Current Value & Velocity Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-surface-low/50 dark:bg-[#111d24]/50 border border-border/60">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Latest Draw</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-extrabold text-foreground">{currentVal}</span>
            <span className="text-xs font-semibold text-muted-foreground">{activeSeries.unit}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Reference Range</span>
          <div className="text-xs font-mono font-medium text-foreground mt-1">
            {refLow !== undefined && refHigh !== undefined
              ? `${refLow} - ${refHigh} ${activeSeries.unit}`
              : refHigh !== undefined
              ? `< ${refHigh} ${activeSeries.unit}`
              : "Standard Reference"}
          </div>
        </div>

        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Longitudinal Trajectory</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold ${
                Math.abs(deltaPct) < 5
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  : deltaPct > 0
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
              }`}
            >
              {deltaPct > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {deltaPct > 0 ? `+${deltaPct.toFixed(1)}%` : `${deltaPct.toFixed(1)}%`}
            </span>
            <span className="text-[10px] text-muted-foreground">vs baseline</span>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Canvas */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#888888" }}
              tickLine={false}
              axisLine={{ stroke: "#88888840" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#888888" }}
              tickLine={false}
              axisLine={{ stroke: "#88888840" }}
              domain={[
                (dataMin: number) => Math.max(0, Math.floor(dataMin * 0.8)),
                (dataMax: number) => Math.ceil(dataMax * 1.2),
              ]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-white dark:bg-[#162732] p-2.5 shadow-md text-xs space-y-1">
                    <span className="text-[10px] text-muted-foreground block font-mono">{d.date}</span>
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <span>{activeSeries.test_name || activeSeries.biomarker_name}:</span>
                      <span className="text-primary font-extrabold">{d.value}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{activeSeries.unit}</span>
                    </div>
                    {d.flag && (
                      <span className="text-[10px] uppercase font-semibold text-amber-600 block">
                        Flag: {d.flag}
                      </span>
                    )}
                  </div>
                );
              }}
            />
            {/* Shaded normal physiological reference range */}
            {refLow !== undefined && refHigh !== undefined && (
              <ReferenceArea
                y1={refLow}
                y2={refHigh}
                fill="#10b981"
                fillOpacity={0.12}
                stroke="#10b981"
                strokeOpacity={0.25}
                strokeDasharray="2 2"
              />
            )}
            {refHigh !== undefined && refLow === undefined && (
              <ReferenceLine
                y={refHigh}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{ value: `Upper Limit: ${refHigh}`, fill: "#10b981", fontSize: 10 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00837b"
              strokeWidth={3}
              dot={{ r: 4, fill: "#00837b", stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#00837b", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-primary" />
          The shaded green zone denotes the laboratory reference interval.
        </span>
        <span className="font-mono text-[10px]">Sample points: {chartData.length}</span>
      </div>
    </div>
  );
}
