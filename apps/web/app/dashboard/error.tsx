"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import MediPredictLogo from "@/components/MediPredictLogo";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("Dashboard caught error boundary:", error);
  }, [error]);

  const handleSelfHeal = () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
    } catch {}
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface text-foreground text-center">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-[#162732] border border-border shadow-xl space-y-4">
        <div className="mx-auto flex justify-center mb-1">
          <MediPredictLogo size="sm" showSubtitle={false} showBadge={false} />
        </div>

        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold">Clinical Workspace Session Refresh Required</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The medical intelligence engine encountered an unexpected runtime state. You can safely refresh the current view or return to the main clinical workspace safely.
        </p>

        {error?.message && (
          <div className="text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-[10px] text-muted-foreground hover:text-foreground underline block mx-auto mb-1"
            >
              {showDetails ? "Hide Diagnostic Details" : "Show Diagnostic Details"}
            </button>
            {showDetails && (
              <pre className="text-[10px] p-2.5 rounded-lg bg-surface-low dark:bg-[#111d24] border border-border text-foreground font-mono overflow-x-auto max-h-32">
                {error.message}
                {error.digest ? `\nDigest: ${error.digest}` : ""}
              </pre>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleSelfHeal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again & Recover</span>
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-surface-low dark:hover:bg-[#111d24]"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
