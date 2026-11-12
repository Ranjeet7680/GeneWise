import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import MLLabPage from "@/app/ml-lab/page";
import { setMockPathname } from "../vitest.setup";

function seedUser() {
  localStorage.setItem("medipredict_token", "demo_clinical_jwt_token_2026");
  const user = {
    id: 1,
    email: "clinician@medipredict.ai",
    full_name: "Dr. Ranjeet Kumar",
    role: "clinician",
    phone: "+91 9876543210",
    phone_verified: true,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem("medipredict_user", JSON.stringify(user));
  localStorage.setItem("medipredict_profile_overrides", JSON.stringify(user));
}

function renderMLLab() {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MLLabPage />
      </AuthProvider>
    </ThemeProvider>
  );
}

describe("ML Research Laboratory & Feature Engineering Studio Suite", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    seedUser();
    setMockPathname("/ml-lab");
    window.history.replaceState({}, "", "/ml-lab");
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    }
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Offline demo fallback")) as any;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("executes Live Inference presets, multi-model selection, and 50-patient batch stress simulation", async () => {
    renderMLLab();

    expect(screen.getByText(/ML Research Laboratory & Model Registry/i)).toBeInTheDocument();

    // Wait for initial API models/experiments fallback load (4 production + 1 staging including Bi-LSTM)
    await waitFor(() => {
      expect(screen.getByText(/4 Production/i)).toBeInTheDocument();
      expect(screen.getByText(/5 Runs/i)).toBeInTheDocument();
    });

    // Apply Healthy Control Baseline preset
    fireEvent.click(screen.getByRole("button", { name: /Healthy Control Baseline/i }));
    await waitFor(() => {
      expect(screen.getByText(/Low Risk Category/i)).toBeInTheDocument();
    });

    // Switch Active Inference Model dropdown
    const modelSelect = screen.getByLabelText("Active Inference Model");
    fireEvent.change(modelSelect, { target: { value: "prs_genomic_v3" } });
    await waitFor(() => {
      expect(screen.getAllByText(/Polygenic Variant Pathogenicity Scorer/i).length).toBeGreaterThanOrEqual(2);
    });

    // Run 50-Patient Cohort Stress Test
    fireEvent.click(screen.getByRole("button", { name: /Simulate 50-Patient Cohort/i }));
    expect(screen.getByText(/50-Patient Synthetic Cohort Stress Test Summary/i)).toBeInTheDocument();
  });

  it("renders Feature Engineering Studio without blank space and supports presets, auto-synthesis, custom features & charts", async () => {
    renderMLLab();

    fireEvent.click(screen.getByRole("button", { name: /Feature Engineering/i }));

    // Confirm studio actually renders instead of empty container
    expect(await screen.findByText(/Clinical Feature Engineering Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/1-Click Clinical Domain Pipeline Presets/i)).toBeInTheDocument();

    // Apply Cardiometabolic preset
    fireEvent.click(screen.getByRole("button", { name: /Cardiometabolic Bundle/i }));
    expect(screen.getByText(/Applied "Cardiometabolic Bundle"/i)).toBeInTheDocument();

    // Auto-Synthesize feature (appears in both catalog card and feedback toast)
    fireEvent.click(screen.getByRole("button", { name: /Auto-Synthesize Feature/i }));
    expect(screen.getAllByText(/HOMA_IR_Glycemic_Proxy/i).length).toBeGreaterThanOrEqual(2);

    // Switch to Custom Feature Builder and engineer custom feature
    fireEvent.click(screen.getByRole("button", { name: /Custom Feature Builder/i }));
    const nameInput = screen.getByPlaceholderText(/e\.g\. IgA_to_IgG_Index/i);
    fireEvent.change(nameInput, { target: { value: "Celiac_Ratio_V9" } });
    fireEvent.click(screen.getByRole("button", { name: /Engineer & Deploy Feature/i }));
    expect(screen.getByText(/Successfully engineered & deployed feature: "Celiac_Ratio_V9"/i)).toBeInTheDocument();

    // Visit analytics sub-tabs cleanly
    fireEvent.click(screen.getByRole("button", { name: /SHAP & Importance Ranking/i }));
    expect(screen.getByText(/Feature Predictive Importance & TreeSHAP Ranking/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Model Lift Benchmark/i }));
    expect(screen.getByText(/Cross-Validation Learning Curve Trajectory/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Skewness & Distribution/i }));
    expect(screen.getByText(/Biomarker Skewness Reduction Inspector/i)).toBeInTheDocument();
  });

  it("supports Model Cards filtering, side-by-side comparison matrix, staging toggle, and Run in Inference", async () => {
    renderMLLab();

    await waitFor(() => {
      expect(screen.getByText(/4 Production/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Model Cards/i }));
    expect(screen.getByText(/Deployed Model Cards & Biomedical Provenance/i)).toBeInTheDocument();
    expect(screen.getByText(/Side-by-Side Model Governance Comparison Matrix/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Bi-LSTM Longitudinal Biomarker Forecaster/i).length).toBeGreaterThan(0);

    // Promote Polygenic staging candidate to Production -> updates KPI count to 5 Production
    const promoteBtns = screen.getAllByRole("button", { name: /Promote to Prod/i });
    fireEvent.click(promoteBtns[0]);
    await waitFor(() => {
      expect(screen.getByText(/5 Production/i)).toBeInTheDocument();
    });

    // Launch a model card directly into Live Inference tab
    const runInferenceBtns = screen.getAllByRole("button", { name: /Run in Inference/i });
    fireEvent.click(runInferenceBtns[1]);
    await waitFor(() => {
      expect(screen.getByText(/Model Prediction & TreeSHAP Provenance/i)).toBeInTheDocument();
    });
  });

  it("supports Experiment Registry search, modal inspection, manual logging, and live HyperOpt training sweep", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderMLLab();

    await waitFor(() => {
      expect(screen.getByText(/5 Runs/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Experiment Registry/i }));
    expect(screen.getByText(/Experiment Leaderboard Accuracy & ROC-AUC/i)).toBeInTheDocument();

    // Inspect an experiment's hyperparameters and artifact path
    const inspectBtns = screen.getAllByRole("button", { name: /^Inspect$/i });
    fireEvent.click(inspectBtns[0]);
    expect(screen.getByText(/Model Hyperparameters & Training Configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/Logged Hyperparameters & Artifact Path/i)).toBeInTheDocument();
    expect(screen.getAllByText(/learning_rate/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Promote to Deployed/i }));

    // Re-inspect the deployed experiment -> displays Active in Production instead of Promote button
    const updatedInspectBtns = screen.getAllByRole("button", { name: /^Inspect$/i });
    fireEvent.click(updatedInspectBtns[0]);
    expect(screen.getByText(/Active in Production/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Promote to Deployed/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Close experiment inspector/i }));

    // Log a manual experiment run
    fireEvent.click(screen.getByRole("button", { name: /Log New Experiment/i }));
    fireEvent.click(screen.getByRole("button", { name: /Record Run/i }));
    await waitFor(() => {
      expect(screen.getByText(/6 Runs/i)).toBeInTheDocument();
    });

    // Run live HyperOpt training sweep to convergence
    fireEvent.click(screen.getByRole("button", { name: /Run Live HyperOpt Sweep/i }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });

    expect(screen.getByText(/live_bayesian_sweep_opt/i)).toBeInTheDocument();
    expect(screen.getByText(/7 Runs/i)).toBeInTheDocument();
  });
});
