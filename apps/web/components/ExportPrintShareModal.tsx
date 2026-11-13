"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  BookOpen,
  Check,
  Copy,
  Download,
  FileText,
  Mail,
  MessageCircle,
  Printer,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import ClinicalMarkdown from "@/components/ClinicalMarkdown";
import {
  ExportableMessageItem,
  buildClinicalPdfBlob,
  formatClinicalExportText,
  formatWhatsAppShareText,
  getSocialShareTargets,
  stripClinicalMarkdown,
  triggerBlobDownload,
} from "@/lib/export-share";

interface ExportPrintShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  patientName?: string;
  allMessages: ExportableMessageItem[];
  focusedMessage?: ExportableMessageItem | null;
  initialScope?: "single" | "all";
}

/**
 * Portal modal + isolated #clinical-print-portal container enabling clean Message-Only printing,
 * binary PDF download, TXT download, WhatsApp sharing, and social media sharing.
 */
export default function ExportPrintShareModal({
  isOpen,
  onClose,
  title,
  patientName = "Rajesh Kumar",
  allMessages,
  focusedMessage,
  initialScope,
}: ExportPrintShareModalProps) {
  const defaultSingleMessage = useMemo(() => {
    if (focusedMessage) return focusedMessage;
    const lastAi = [...allMessages].reverse().find((m) => m.role === "assistant");
    return lastAi || allMessages[allMessages.length - 1] || null;
  }, [focusedMessage, allMessages]);

  const [scope, setScope] = useState<"single" | "all">(
    initialScope || (focusedMessage ? "single" : "single")
  );
  const [selectedMsgId, setSelectedMsgId] = useState<string | number>(
    defaultSingleMessage?.id ?? ""
  );
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [copiedMode, setCopiedMode] = useState<"text" | "whatsapp" | null>(null);
  const [statusNote, setStatusNote] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setScope(initialScope || (focusedMessage ? "single" : allMessages.length > 0 ? "single" : "all"));
    if (focusedMessage) {
      setSelectedMsgId(focusedMessage.id);
    } else if (defaultSingleMessage) {
      setSelectedMsgId(defaultSingleMessage.id);
    }
    setStatusNote("");
  }, [isOpen, initialScope, focusedMessage, defaultSingleMessage, allMessages.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const exportItems = useMemo(() => {
    if (scope === "all") return allMessages;
    const picked = allMessages.find((m) => String(m.id) === String(selectedMsgId));
    if (picked) return [picked];
    return defaultSingleMessage ? [defaultSingleMessage] : [];
  }, [scope, allMessages, selectedMsgId, defaultSingleMessage]);

  const exportOptions = useMemo(
    () => ({
      scope,
      title: title || "Clinical Consultation",
      patientName,
      includeMetadata,
      includeCitations,
    }),
    [scope, title, patientName, includeMetadata, includeCitations]
  );

  const cleanTextPreview = useMemo(
    () => formatClinicalExportText(exportItems, exportOptions),
    [exportItems, exportOptions]
  );

  const socialTargets = useMemo(() => {
    const originUrl =
      typeof window !== "undefined" && window.location.origin.startsWith("http")
        ? `${window.location.origin}/assistant`
        : "https://medipredict-ai-seven.vercel.app/assistant";
    return getSocialShareTargets(exportItems, exportOptions, originUrl);
  }, [exportItems, exportOptions]);

  const handlePrintOnly = () => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    document.body.classList.add("clinical-print-active");
    const cleanup = () => {
      document.body.classList.remove("clinical-print-active");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    setStatusNote(
      scope === "single"
        ? "Print dialog launched — isolating selected message only (no app chrome)."
        : "Print dialog launched — isolating consultation messages only."
    );
    setTimeout(() => {
      window.print();
      setTimeout(cleanup, 1200);
    }, 60);
  };

  const handleDownloadPdf = () => {
    const blob = buildClinicalPdfBlob(exportItems, exportOptions);
    const stamp = new Date().toISOString().slice(0, 10);
    const prefix = scope === "single" ? "genewise-message-only" : "genewise-consultation";
    triggerBlobDownload(blob, `${prefix}-${stamp}.pdf`);
    setStatusNote(`Downloaded ${prefix}-${stamp}.pdf cleanly.`);
  };

  const handleDownloadText = () => {
    const blob = new Blob([cleanTextPreview], { type: "text/plain;charset=utf-8" });
    const stamp = new Date().toISOString().slice(0, 10);
    const prefix = scope === "single" ? "genewise-message-only" : "genewise-consultation";
    triggerBlobDownload(blob, `${prefix}-${stamp}.txt`);
    setStatusNote(`Downloaded ${prefix}-${stamp}.txt cleanly.`);
  };

  const handleCopyText = async (mode: "text" | "whatsapp") => {
    const payload =
      mode === "whatsapp"
        ? formatWhatsAppShareText(exportItems, exportOptions)
        : cleanTextPreview;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(payload);
    }
    setCopiedMode(mode);
    setStatusNote(mode === "whatsapp" ? "WhatsApp-formatted brief copied." : "Clean message text copied.");
    setTimeout(() => setCopiedMode(null), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator === "undefined" || !("share" in navigator)) {
      await handleCopyText("whatsapp");
      return;
    }
    const shareText = formatWhatsAppShareText(exportItems, exportOptions);
    try {
      const pdfBlob = buildClinicalPdfBlob(exportItems, exportOptions);
      const pdfFile = new File([pdfBlob], "genewise-clinical-message.pdf", {
        type: "application/pdf",
      });
      if ("canShare" in navigator && (navigator as any).canShare({ files: [pdfFile] })) {
        await (navigator as any).share({
          title: `GeneWise — ${title}`,
          text: shareText,
          files: [pdfFile],
        });
      } else {
        await (navigator as any).share({
          title: `GeneWise — ${title}`,
          text: shareText,
        });
      }
      setStatusNote("Opened system share sheet.");
    } catch {
      await handleCopyText("whatsapp");
    }
  };

  if (!isOpen || !mounted) return null;

  return (
    <>
      {/* Screen Modal */}
      {createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Export, Print Only, Download PDF & Social Share"
          onClick={onClose}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-scale-in"
          >
            {/* Header */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-border bg-gradient-to-r from-teal-900/5 via-white to-indigo-50/40 dark:from-teal-950/40 dark:via-[#14262f] dark:to-indigo-950/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-teal-700 text-white shadow-xs">
                  <Printer className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    Message-Only Print, PDF Download & Social Share
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Exports strictly selected message(s) — zero app sidebar or dashboard clutter
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close export modal"
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-low hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 pb-[max(1rem,env(safe-area-inset-bottom))] overflow-y-auto space-y-4 text-xs">
              {/* Scope & Filter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/70">
                <div className="inline-flex rounded-xl bg-surface-low p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setScope("single")}
                    disabled={allMessages.length === 0}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-40 ${
                      scope === "single"
                        ? "bg-teal-700 text-white shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Message Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope("all")}
                    disabled={allMessages.length === 0}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-40 ${
                      scope === "all"
                        ? "bg-teal-700 text-white shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Messages ({allMessages.length})
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-foreground font-medium">
                    <input
                      type="checkbox"
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                      className="rounded accent-teal-700"
                    />
                    <span>Model & Time</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-foreground font-medium">
                    <input
                      type="checkbox"
                      checked={includeCitations}
                      onChange={(e) => setIncludeCitations(e.target.checked)}
                      className="rounded accent-teal-700"
                    />
                    <span>PubMed Citations</span>
                  </label>
                </div>
              </div>

              {/* Message Selector when in Message Only mode & multiple messages exist */}
              {scope === "single" && allMessages.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-muted-foreground shrink-0">
                    Selected Message:
                  </span>
                  <select
                    aria-label="Choose message to print or share"
                    value={String(
                      (allMessages.some((m) => String(m.id) === String(selectedMsgId))
                        ? selectedMsgId
                        : defaultSingleMessage?.id) ?? ""
                    )}
                    onChange={(e) => setSelectedMsgId(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface-low text-[11px] text-foreground focus:outline-none"
                  >
                    {allMessages.map((m, idx) => (
                      <option key={String(m.id)} value={String(m.id)}>
                        #{idx + 1} [{m.role === "user" ? "Query" : "GeneWise AI"}]{" "}
                        {stripClinicalMarkdown(m.content).slice(0, 68)}...
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Designed Clinical Document Preview (Message(s) Always Immediately Visible) */}
              <div
                data-testid="message-only-export-preview"
                className="rounded-xl border border-teal-600/25 bg-white dark:bg-[#0f1d24] max-h-72 overflow-y-auto shadow-inner"
              >
                {/* Compact Clinical Header Banner */}
                <div className="px-4 py-2.5 bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 text-white flex flex-wrap items-center justify-between gap-2 sticky top-0 z-10">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-teal-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      GeneWise — {scope === "single" ? "Message Only Summary" : "Consultation Messages Only"}
                    </div>
                    <div className="text-[11px] font-semibold text-white/95 truncate max-w-md">
                      Topic: {title || "Clinical Health Consultation"}
                    </div>
                  </div>
                  {includeMetadata && (
                    <div className="text-[10px] text-teal-100 text-right leading-tight">
                      {patientName && <div>Patient: {patientName}</div>}
                      <div>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  )}
                </div>

                {/* Message Cards */}
                <div className="p-3.5 space-y-3">
                  {exportItems.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground text-center py-4">
                      Start or select a conversation message to print, download as PDF, or share.
                    </p>
                  ) : (
                    exportItems.map((m, idx) => {
                      const isUser = m.role === "user";
                      return (
                        <div
                          key={`prev-${m.id}-${idx}`}
                          className={`rounded-xl border p-3 space-y-2 border-l-4 ${
                            isUser
                              ? "border-indigo-200 border-l-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-800/50"
                              : "border-teal-200/80 border-l-teal-600 bg-teal-50/25 dark:bg-[#14262f] dark:border-teal-800/50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] pb-1.5 border-b border-border/50">
                            <span
                              className={`font-extrabold uppercase tracking-wider ${
                                isUser
                                  ? "text-indigo-700 dark:text-indigo-300"
                                  : "text-teal-700 dark:text-teal-300"
                              }`}
                            >
                              {scope === "all" ? `#${idx + 1} ` : ""}
                              {isUser ? "Patient / Clinician Query" : "GeneWise AI Response"}
                            </span>
                            {includeMetadata && (
                              <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
                                {m.modelUsed && (
                                  <span className="px-1.5 py-0.5 rounded bg-surface-low border border-border font-semibold text-foreground">
                                    {m.modelUsed}
                                  </span>
                                )}
                                {typeof m.confidenceScore === "number" && (
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                                    {Math.round(m.confidenceScore * 100)}%
                                  </span>
                                )}
                                {m.timestamp && <span>{m.timestamp}</span>}
                              </div>
                            )}
                          </div>

                          <div className="text-xs leading-relaxed text-foreground">
                            {isUser ? (
                              <p className="whitespace-pre-line font-medium">{m.content}</p>
                            ) : (
                              <ClinicalMarkdown content={m.content} />
                            )}
                          </div>

                          {m.lstmForecast && (
                            <div className="p-2.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-[10px] flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                Bi-LSTM Trajectory ({m.lstmForecast.biomarkerLabel})
                              </span>
                              <span className="font-mono font-semibold text-foreground">
                                {m.lstmForecast.currentValue} {m.lstmForecast.unit} -&gt; +30d{" "}
                                {m.lstmForecast.projected30d} -&gt; +90d {m.lstmForecast.projected90d}{" "}
                                {m.lstmForecast.unit}
                              </span>
                            </div>
                          )}

                          {includeCitations && m.sources && m.sources.length > 0 && (
                            <div className="pt-1.5 border-t border-border/40 space-y-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> Peer-Reviewed Citations
                              </div>
                              <ul className="space-y-0.5 text-[10px] text-muted-foreground">
                                {m.sources.map((s, sIdx) => (
                                  <li key={sIdx}>
                                    [{sIdx + 1}] {s.title}
                                    {s.journal ? ` (${s.journal}` : ""}
                                    {s.year ? `, ${s.year}` : ""}
                                    {s.journal ? ")" : ""}
                                    {s.pmid ? ` • PMID: ${s.pmid}` : ""}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Primary Print Only & Download Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={handlePrintOnly}
                  disabled={exportItems.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-40"
                >
                  <Printer className="w-4 h-4" />
                  <span>{scope === "single" ? "Print Message Only" : "Print Messages Only"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={exportItems.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF (.pdf)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadText}
                  disabled={exportItems.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-low hover:bg-surface-container text-foreground font-bold text-xs transition-all disabled:opacity-40"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Download Brief (.txt)</span>
                </button>
              </div>

              {/* WhatsApp & Social Media Share Strip */}
              <div className="pt-3 border-t border-border space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-primary" /> Share Clean Message Directly
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyText("whatsapp")}
                      disabled={exportItems.length === 0}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] hover:bg-emerald-500/20 disabled:opacity-40"
                    >
                      {copiedMode === "whatsapp" ? (
                        <>
                          <Check className="w-3 h-3" /> Copied WA Brief
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy WhatsApp Format
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      disabled={exportItems.length === 0}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-surface-low text-foreground font-semibold text-[11px] hover:bg-surface-container disabled:opacity-40"
                    >
                      <Sparkles className="w-3 h-3 text-primary" /> System Share
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {socialTargets.map((target) => (
                    <a
                      key={target.id}
                      href={target.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border text-[11px] font-bold transition-transform hover:scale-[1.02] ${target.colorClass}`}
                    >
                      {target.id === "whatsapp" ? (
                        <MessageCircle className="w-3.5 h-3.5" />
                      ) : target.id === "email" ? (
                        <Mail className="w-3.5 h-3.5" />
                      ) : (
                        <Share2 className="w-3 h-3" />
                      )}
                      <span>{target.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {statusNote && (
                <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-3 py-1.5">
                  {statusNote}
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Isolated Message-Only Print Portal (rendered only under @media print when body.clinical-print-active) */}
      {createPortal(
        <div
          id="clinical-print-portal"
          className="hidden"
          aria-hidden="true"
        >
          <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", color: "#0f172a", padding: "24px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #064e3b 0%, #0f766e 60%, #0f172a 100%)",
                color: "#ffffff",
                borderRadius: "10px",
                padding: "16px 20px",
                marginBottom: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h1 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                  GeneWise — {scope === "single" ? "Message Only Summary" : "Consultation Messages"}
                </h1>
                <p style={{ fontSize: "11px", color: "#ccfbf1", margin: "4px 0 0 0" }}>
                  Topic: {title} {patientName ? `• Patient: ${patientName}` : ""}
                </p>
              </div>
              <span style={{ fontSize: "10px", color: "#99f6e4", fontWeight: 600 }}>
                {new Date().toLocaleString()}
              </span>
            </div>

            {exportItems.map((m, idx) => (
              <div
                key={`print-${m.id}-${idx}`}
                style={{
                  border: "1px solid #cbd5e1",
                  borderLeft: m.role === "user" ? "4px solid #4338ca" : "4px solid #0f766e",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  marginBottom: "12px",
                  backgroundColor: m.role === "user" ? "#f8fafc" : "#ffffff",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    color: m.role === "user" ? "#4338ca" : "#0f766e",
                    paddingBottom: "6px",
                    marginBottom: "8px",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {m.role === "user" ? "Patient / Clinician Question" : "GeneWise Clinical AI Response"}
                  {includeMetadata && m.modelUsed ? ` • ${m.modelUsed}` : ""}
                  {includeMetadata && typeof m.confidenceScore === "number"
                    ? ` • ${Math.round(m.confidenceScore * 100)}% Confidence`
                    : ""}
                  {includeMetadata && m.timestamp ? ` • ${m.timestamp}` : ""}
                </div>
                <div style={{ fontSize: "12px", lineHeight: 1.6 }}>
                  {m.role === "user" ? (
                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{m.content}</p>
                  ) : (
                    <ClinicalMarkdown content={m.content} />
                  )}
                </div>

                {m.lstmForecast && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "9px 12px",
                      backgroundColor: "#eef2ff",
                      borderLeft: "3px solid #4338ca",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                  >
                    <strong>Bi-LSTM Forecast ({m.lstmForecast.biomarkerLabel}):</strong> Current{" "}
                    {m.lstmForecast.currentValue} {m.lstmForecast.unit} | +30d{" "}
                    {m.lstmForecast.projected30d} {m.lstmForecast.unit} | +90d{" "}
                    {m.lstmForecast.projected90d} {m.lstmForecast.unit} (
                    {m.lstmForecast.deltaPerMonth >= 0 ? "+" : ""}
                    {m.lstmForecast.deltaPerMonth} {m.lstmForecast.unit}/mo)
                  </div>
                )}

                {includeCitations && m.sources && m.sources.length > 0 && (
                  <div
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "8px 10px",
                    }}
                  >
                    <strong style={{ fontSize: "10px", color: "#0f766e" }}>Peer-Reviewed References:</strong>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0, fontSize: "10px", color: "#475569" }}>
                      {m.sources.map((s, sIdx) => (
                        <li key={sIdx}>
                          {s.title} ({s.journal} {s.year}) {s.pmid ? `PMID: ${s.pmid}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            <div
              style={{
                fontSize: "10px",
                color: "#78350f",
                backgroundColor: "#fffbeb",
                borderLeft: "3px solid #d97706",
                borderRadius: "4px",
                padding: "8px 10px",
                marginTop: "14px",
              }}
            >
              Educational & clinical literacy summary only. Synthesized by GeneWise clinical decision-support models — not a standalone diagnostic prescription.
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
