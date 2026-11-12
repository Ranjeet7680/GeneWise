import React from "react";
import { LucideIcon } from "lucide-react";
import MedicalStatusBadge from "@/components/MedicalStatusBadge";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  secondaryValue?: string | number;
  secondaryUnit?: string;
  status?: string;
  icon: LucideIcon;
  subtitle?: string;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  unit,
  secondaryValue,
  secondaryUnit,
  status,
  icon: Icon,
  subtitle,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border bg-white dark:bg-[#162732] shadow-2xs smooth-card relative overflow-hidden group transition-all duration-300 hover:border-primary/50 hover:shadow-md cursor-pointer",
        className
      )}
    >
      {/* Dynamic top ambient glow gradient on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Subtle background radar scan glow on hover */}
      <div className="absolute -inset-1 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-surface-low dark:bg-[#1c303d] text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 group-hover:bg-primary/10">
          <Icon className="w-4 h-4 transition-transform duration-300" />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-1 relative z-10">
        <span className="text-2xl font-bold tracking-tight text-foreground transition-transform group-hover:scale-[1.02] inline-block font-mono">
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-muted-foreground">{unit}</span>}
        {secondaryValue !== undefined && (
          <span className="text-base font-semibold text-muted-foreground ml-1">
            / {secondaryValue} {secondaryUnit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50 text-[11px] relative z-10">
        {subtitle && (
          <span className="text-muted-foreground truncate max-w-[160px] group-hover:text-foreground/80 transition-colors">
            {subtitle}
          </span>
        )}
        {status && <MedicalStatusBadge flag={status} />}
      </div>
    </div>
  );
}
