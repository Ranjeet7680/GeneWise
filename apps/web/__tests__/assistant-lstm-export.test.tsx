import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AssistantPage from "@/app/assistant/page";
import VoiceAssistantPage from "@/app/assistant/voice/page";
import BiLstmTrajectoryCard from "@/components/BiLstmTrajectoryCard";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import {
  buildContextualClinicalReply,
  runBiLstmForecast,
} from "@/lib/clinical-lstm";
import {
  buildClinicalPdfBlob,
  formatClinicalExportText,
  getSocialShareTargets,
  normalizeMessagesForExport,
} from "@/lib/export-share";
import { setMockPathname } from "../vitest.setup";

describe("Advanced AI Engines, Bi-LSTM Sequence Model, Question Suggestions & Message-Only Export/Share", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    }
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Offline demo fallback")) as any;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.classList.remove("clinical-print-active");
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("computes valid Bi-LSTM longitudinal biomarker forecasts and normalized gate weights", () => {
    const forecast = runBiLstmForecast("hba1c", [5.4, 5.6, 5.8, 6.0, 6.3]);
    expect(forecast.biomarkerKey).toBe("hba1c");
    expect(forecast.sequence.length).toBe(7);
    expect(forecast.sequence[5].isForecast).toBe(true);
    expect(forecast.sequence[6].visitLabel).toContain("+90d");
    expect(forecast.projected90d).toBeGreaterThan(forecast.currentValue);
    expect(forecast.trend).toBe("elevating");
    const gateSum =
      forecast.gateWeights.forget +
      forecast.gateWeights.input +
      forecast.gateWeights.output;
    expect(gateSum).toBe(100);

    const reply = buildContextualClinicalReply(
      "Forecast tTG-IgA antibody trajectory with Bi-LSTM",
      "hybrid_rag_lstm"
    );
    expect(reply.model_used).toContain("Hybrid RAG + Bi-LSTM");
    expect(reply.lstm_forecast?.biomarkerKey).toBe("ttg_iga");
    expect(reply.reasoning_trace.length).toBeGreaterThanOrEqual(2);
    expect(reply.follow_up_questions.length).toBeGreaterThanOrEqual(2);
  });

  it("generates Message-Only exports, valid binary PDF blobs, and WhatsApp/social share URLs", async () => {
    const sample = normalizeMessagesForExport([
      {
        id: 10,
        conversation_id: 1,
        role: "user",
        content: "Analyze fasting glucose 118 mg/dL",
        created_at: new Date().toISOString(),
      },
      {
        id: 11,
        conversation_id: 1,
        role: "assistant",
        content: "**ADA 2024 Summary**: Fasting glucose 118 mg/dL is in prediabetes band.",
        model_used: "Bi-LSTM Engine (bilstm-biomarker-v2.4)",
        confidence_score: 0.95,
        sources: [
          {
            title: "ADA Standards of Care 2024",
            journal: "Diabetes Care",
            year: 2024,
            pmid: "38078589",
          },
        ],
        created_at: new Date().toISOString(),
      },
    ]);

    const singleMsgOnlyText = formatClinicalExportText([sample[1]], {
      scope: "single",
      title: "Glycemic Review",
      patientName: "Rajesh Kumar",
    });
    expect(singleMsgOnlyText).toContain("Message Only Summary");
    expect(singleMsgOnlyText).toContain("ADA 2024 Summary");
    expect(singleMsgOnlyText).not.toContain("Analyze fasting glucose 118 mg/dL");
    expect(singleMsgOnlyText).not.toContain("MediPredict AI");

    const pdfBlob = buildClinicalPdfBlob([sample[1]], {
      scope: "single",
      title: "Glycemic Review",
      patientName: "Rajesh Kumar",
    });
    expect(pdfBlob.type).toBe("application/pdf");
    const rawPdf = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsText(pdfBlob);
    });
    expect(rawPdf.startsWith("%PDF-1.4")).toBe(true);
    expect(rawPdf).toContain("%%EOF");
    expect(rawPdf).toContain("GeneWise");
    expect(rawPdf).toContain("ADA 2024 Summary");
    expect(rawPdf).toContain("PEER-REVIEWED PUBMED CITATIONS");
    expect(rawPdf).toContain("re f");

    const targets = getSocialShareTargets([sample[1]], {
      scope: "single",
      title: "Glycemic Review",
    });
    expect(targets.find((t) => t.id === "whatsapp")?.href).toContain("https://wa.me/?text=");
    expect(targets.find((t) => t.id === "telegram")?.href).toContain("https://t.me/share/url");
    expect(targets.find((t) => t.id === "twitter")?.href).toContain("twitter.com/intent/tweet");
    expect(targets.find((t) => t.id === "linkedin")?.href).toContain("linkedin.com/sharing");
    expect(targets.find((t) => t.id === "facebook")?.href).toContain("facebook.com/sharer");
  });

  it("renders upgraded AI Assistant with Bi-LSTM Forecaster, improved prompts, inline forecast, and Message-Only Print/PDF/Share modal", async () => {
    setMockPathname("/assistant");
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    render(
      <ThemeProvider>
        <AuthProvider>
          <AssistantPage />
        </AuthProvider>
      </ThemeProvider>
    );

    // Ensure AI engine pills and LSTM Forecasting suggestions appear cleanly
    await waitFor(() => {
      expect(screen.getByText(/SUGGESTED EDUCATIONAL INQUIRIES/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /^Bi-LSTM Engine$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Hybrid RAG\+LSTM$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^LSTM Forecasting$/i })).toBeInTheDocument();

    // Filter suggested questions cleanly
    const filterInput = screen.getByLabelText(/Filter suggested questions/i);
    fireEvent.change(filterInput, { target: { value: "HbA1c 90-Day" } });
    expect(screen.getByText(/HbA1c 90-Day Longitudinal Trajectory/i)).toBeInTheDocument();
    fireEvent.change(filterInput, { target: { value: "" } });

    // Open interactive Bi-LSTM Temporal Forecaster modal
    fireEvent.click(screen.getByRole("button", { name: /Open Bi-LSTM Forecaster/i }));
    const lstmDialog = screen.getByRole("dialog", {
      name: /Bi-LSTM Longitudinal Biomarker Sequence Forecaster/i,
    });
    expect(lstmDialog).toBeInTheDocument();
    expect(screen.getAllByTestId("lstm-trajectory-card").length).toBeGreaterThan(0);

    // Send Bi-LSTM trajectory directly into AI chat
    fireEvent.click(
      screen.getByRole("button", { name: /Send Trajectory to Hybrid RAG\+LSTM AI/i })
    );

    // Wait for AI response with typing animation, inline Bi-LSTM card, reasoning trace, follow-up chips & per-message Print/Share buttons
    await waitFor(() => {
      expect(screen.getByText(/Calibrated Confidence:/i)).toBeInTheDocument();
    });
    const showFullBtn = screen.queryByRole("button", { name: /Show Full/i });
    if (showFullBtn) {
      expect(screen.getByTestId("ai-typing-cursor")).toBeInTheDocument();
      expect(screen.getByTestId("ai-typing-inline-cursor")).toBeInTheDocument();
      fireEvent.click(showFullBtn);
    }
    expect(screen.getByTestId("lstm-trajectory-card")).toBeInTheDocument();
    expect(screen.getByText(/Suggested Follow-Up Questions/i)).toBeInTheDocument();

    // Open Message-Only Print / Download PDF / WhatsApp Share modal from message bubble
    const printMsgBtns = screen.getAllByRole("button", { name: /Print Msg Only/i });
    expect(printMsgBtns.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(printMsgBtns[printMsgBtns.length - 1]);

    const exportDialog = screen.getByRole("dialog", {
      name: /Export, Print Only, Download PDF & Social Share/i,
    });
    expect(exportDialog).toBeInTheDocument();
    expect(exportDialog.parentElement).toBe(document.body);
    expect(exportDialog).toHaveClass("z-[9999]");
    const previewEl = screen.getByTestId("message-only-export-preview");
    expect(previewEl).toHaveTextContent(/Message Only Summary/i);
    expect(previewEl).toHaveTextContent(/GeneWise AI/i);
    expect(previewEl).toHaveTextContent(/Bi-LSTM Trajectory/i);
    const selectEl = screen.getByLabelText(/Choose message to print or share/i) as HTMLSelectElement;
    expect(selectEl.options[selectEl.selectedIndex].text).toContain("[GeneWise AI]");

    // Verify WhatsApp & social share anchors are rendered cleanly
    expect(screen.getByRole("link", { name: /^WhatsApp$/i })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/?text=")
    );
    expect(screen.getByRole("link", { name: /^Telegram$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download PDF \(\.pdf\)/i })).toBeInTheDocument();

    // Verify Print Message Only activates isolated print sheet & invokes window.print()
    vi.useFakeTimers();
    try {
      fireEvent.click(screen.getByRole("button", { name: /Print Message Only/i }));
      expect(document.body.classList.contains("clinical-print-active")).toBe(true);
      vi.advanceTimersByTime(100);
      expect(printSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }

    fireEvent.click(screen.getByRole("button", { name: /Close export modal/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders Voice Assistant without cut-off dialect scrollbar and with Bi-LSTM & Print/Share controls", () => {
    setMockPathname("/assistant/voice");
    render(
      <ThemeProvider>
        <AuthProvider>
          <VoiceAssistantPage />
        </AuthProvider>
      </ThemeProvider>
    );

    expect(screen.getByText(/Dialect \(13\):/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bi-LSTM: Active/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Print \/ Share/i })).toBeInTheDocument();
    expect(screen.getByText(/Bi-LSTM 90d HbA1c Velocity/i)).toBeInTheDocument();

    // Verify Transcript drawer uses GeneWise AI instead of MediPredict AI
    fireEvent.click(screen.getByRole("button", { name: /Transcript \(1\)/i }));
    expect(screen.getAllByText(/GeneWise AI/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/मेडीप्रेडिक्ट/i)).not.toBeInTheDocument();
  });

  it("tailors clinical answers dynamically for user lab values, multi-system topics, and paired HbA1c/Glucose Bi-LSTM", () => {
    // 1. Combined HbA1c + Fasting Glucose should prioritize HbA1c forecast, embed paired Glucose, & honor user values
    const glycemicReply = buildContextualClinicalReply(
      "Run a Bi-LSTM 90-day sequence forecast for HbA1c (7.4%) and Fasting Glucose (142 mg/dL) progression.",
      "openai"
    );
    expect(glycemicReply.lstm_forecast?.biomarkerKey).toBe("hba1c");
    expect(glycemicReply.lstm_forecast?.currentValue).toBe(7.4);
    expect(glycemicReply.content).toContain("7.4%");
    expect(glycemicReply.content).toContain("142 mg/dL");
    expect(glycemicReply.content).toContain("Paired Fasting Glucose Trajectory");

    // 2. Thyroid TSH query routes to ATA Thyroid axis with extracted TSH number
    const thyroidReply = buildContextualClinicalReply(
      "My TSH is 6.8 mIU/L, what should I forecast?",
      "hybrid_rag_lstm"
    );
    expect(thyroidReply.lstm_forecast?.biomarkerKey).toBe("tsh");
    expect(thyroidReply.lstm_forecast?.currentValue).toBe(6.8);
    expect(thyroidReply.content).toContain("Thyroid Axis Evaluation");
    expect(thyroidReply.content).toContain("6.8 mIU/L");

    // 3. Kidney creatinine query routes to KDIGO 2024 eGFR & uACR guidance
    const renalReply = buildContextualClinicalReply(
      "Evaluate serum creatinine 1.65 mg/dL and eGFR",
      "clinical_evidence"
    );
    expect(renalReply.content).toContain("KDIGO 2024");
    expect(renalReply.content).toContain("1.65 mg/dL");

    // 4. Genetics BRCA1 query routes to ACMG 5-tier interpretation
    const geneticsReply = buildContextualClinicalReply(
      "Explain a VUS vs Pathogenic variant in BRCA1",
      "clinical_evidence"
    );
    expect(geneticsReply.content).toContain("ACMG/AMP");
    expect(geneticsReply.content).toContain("VUS");

    // 5. General lifestyle/wellness question must NOT wrongly fall back to Iron Overload / Ferritin 420
    const generalReply = buildContextualClinicalReply(
      "How can I prepare questions for my annual preventive checkup?",
      "clinical_evidence"
    );
    expect(generalReply.content).toContain("Clinical Synthesis:");
    expect(generalReply.content).not.toContain("Iron Overload & Ferritin");

    // 6. Bracketed 5-visit modal sequence propagates custom V0 & series into clinical reply & chart legend
    const seqReply = buildContextualClinicalReply(
      "Run a Bi-LSTM 90-day sequence forecast for HbA1c with visit sequence [5.4, 5.8, 6.2, 6.7, 7.1] and analyze progression.",
      "lstm_temporal"
    );
    expect(seqReply.lstm_forecast?.biomarkerKey).toBe("hba1c");
    expect(seqReply.lstm_forecast?.currentValue).toBe(7.1);
    expect(seqReply.lstm_forecast?.sequence.slice(0, 5).map((s) => s.value)).toEqual([
      5.4, 5.8, 6.2, 6.7, 7.1,
    ]);
    expect(seqReply.content).toContain("7.1%");
    expect(seqReply.content).toContain("Diabetes Range");

    render(<BiLstmTrajectoryCard forecast={seqReply.lstm_forecast!} />);
    expect(screen.getByText(/Observed V-4\.\.V0/i)).toBeInTheDocument();
    expect(screen.getByText(/Clinical Ref Cutoff/i)).toBeInTheDocument();

    // 7. Google Gemini 2.0 Clinical routes and injects multimodal clinical reasoning trace
    const geminiReply = buildContextualClinicalReply(
      "How to naturally optimize lifestyle, nutrition, and diet?",
      "gemini"
    );
    expect(geminiReply.model_used).toContain("Google Gemini 2.0 Clinical");
    expect(geminiReply.content).toContain("Core Metabolic & Lifestyle Principles");
    expect(geminiReply.reasoning_trace.some((t) => t.includes("Gemini multimodal"))).toBe(true);
  });
});
