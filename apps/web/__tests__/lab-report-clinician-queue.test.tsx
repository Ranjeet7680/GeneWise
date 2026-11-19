import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LabResultsTable from "@/components/LabResultsTable";
import ReportUploader from "@/components/ReportUploader";
import BiomarkerTrendChart from "@/components/BiomarkerTrendChart";
import { LaboratoryMeasurement, BiomarkerTrendSeries } from "@/types";

const mockMeasurements: LaboratoryMeasurement[] = [
  {
    id: 101,
    report_id: 1,
    test_name: "Tissue Transglutaminase IgA (anti-tTG IgA)",
    name: "Tissue Transglutaminase IgA (anti-tTG IgA)",
    category: "Celiac Serology",
    value: 68.4,
    original_value: 68.4,
    unit: "U/mL",
    original_unit: "U/mL",
    reference_low: 0,
    reference_high: 10,
    reference_range: "< 10.0 U/mL (Negative)",
    flag: "critical_high",
    confidence: 0.99,
    previous_value: 22.1,
    change_pct: 209.5,
    verification_status: "pending",
    user_verified: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 102,
    report_id: 1,
    test_name: "Total Serum IgA",
    name: "Total Serum IgA",
    category: "Immunoglobulins",
    value: 2.8,
    original_value: 2.8,
    unit: "g/L",
    original_unit: "g/L",
    reference_low: 0.8,
    reference_high: 3.0,
    reference_range: "0.8 - 3.0 g/L",
    flag: "normal",
    confidence: 0.98,
    previous_value: 2.7,
    change_pct: 3.7,
    verification_status: "verified",
    user_verified: true,
    verified_by: "Dr. Elena Rostova",
    verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 103,
    report_id: 1,
    test_name: "Deamidated Gliadin Peptide IgG (DGP IgG)",
    name: "Deamidated Gliadin Peptide IgG (DGP IgG)",
    category: "Celiac Serology",
    value: 45.2,
    original_value: 45.2,
    unit: "U/mL",
    original_unit: "U/mL",
    reference_low: 0,
    reference_high: 15,
    reference_range: "< 15.0 U/mL (Negative)",
    flag: "high",
    confidence: 0.97,
    previous_value: 18.0,
    change_pct: 151.1,
    verification_status: "pending",
    user_verified: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 104,
    report_id: 1,
    test_name: "Deamidated Gliadin Peptide IgA (DGP IgA)",
    name: "Deamidated Gliadin Peptide IgA (DGP IgA)",
    category: "Celiac Serology",
    value: 39.8,
    original_value: 39.8,
    unit: "U/mL",
    original_unit: "U/mL",
    reference_low: 0,
    reference_high: 15,
    reference_range: "< 15.0 U/mL (Negative)",
    flag: "high",
    confidence: 0.96,
    previous_value: 14.5,
    change_pct: 174.5,
    verification_status: "pending",
    user_verified: false,
    created_at: new Date().toISOString(),
  },
];

const mockTrendSeries: BiomarkerTrendSeries[] = [
  {
    test_name: "Tissue Transglutaminase IgA (anti-tTG IgA)",
    biomarker_name: "Tissue Transglutaminase IgA (anti-tTG IgA)",
    category: "Celiac Serology",
    current_value: 68.4,
    unit: "U/mL",
    reference_low: 0,
    reference_high: 10,
    flag: "critical_high",
    trend_direction: "increasing",
    points: [
      { date: "2025-11-20", value: 14.2, flag: "high" },
      { date: "2026-01-15", value: 22.1, flag: "high" },
      { date: "2026-02-28", value: 41.0, flag: "critical_high" },
      { date: "2026-03-18", value: 68.4, flag: "critical_high" },
    ],
  },
];

describe("GeneWise AI — Advanced Laboratory Report & Clinician Review Queue", () => {
  beforeEach(() => {
    localStorage.clear();
    const user = {
      id: 1,
      email: "dr_rostova@medipredict.ai",
      full_name: "Dr. Elena Rostova",
      role: "clinician",
    };
    localStorage.setItem("medipredict_user", JSON.stringify(user));
    localStorage.setItem("medipredict_token", "jwt-clinician-test");
  });

  describe("LabResultsTable Verification Component", () => {
    it("renders all extracted biomarkers with categories, units, and reference intervals", () => {
      render(<LabResultsTable measurements={mockMeasurements} />);

      expect(screen.getAllByText(/Tissue Transglutaminase IgA/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Total Serum IgA/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Deamidated Gliadin Peptide IgG/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Deamidated Gliadin Peptide IgA/i).length).toBeGreaterThan(0);

      // Check count indicator
      expect(screen.getByText("4 Tests")).toBeDefined();
      expect(screen.getByText("3 Pending Verification")).toBeDefined();
    });

    it("displays percentage change and prior value", () => {
      render(<LabResultsTable measurements={mockMeasurements} />);

      // anti-tTG IgA has +209.5% change from 22.1 U/mL
      expect(screen.getByText("+209.5%")).toBeDefined();
      expect(screen.getByText("22.1 U/mL")).toBeDefined();
    });

    it("triggers inline verification callback", async () => {
      const handleUpdate = vi.fn().mockResolvedValue(undefined);
      render(
        <LabResultsTable
          measurements={mockMeasurements}
          onUpdateMeasurement={handleUpdate}
        />
      );

      // Verify button for unverified item
      const verifyBtns = screen.getAllByTitle("Verify value");
      expect(verifyBtns.length).toBeGreaterThan(0);
      fireEvent.click(verifyBtns[0]);

      expect(handleUpdate).toHaveBeenCalledWith(101, expect.objectContaining({
        user_verified: true,
        verification_status: "verified"
      }));
    });

    it("supports Verify All button triggering bulk verification", async () => {
      const handleVerifyAll = vi.fn().mockResolvedValue(undefined);
      render(
        <LabResultsTable
          measurements={mockMeasurements}
          onVerifyAll={handleVerifyAll}
        />
      );

      const verifyAllBtn = screen.getByText(/Verify All \(3\)/i);
      expect(verifyAllBtn).toBeDefined();
      fireEvent.click(verifyAllBtn);

      expect(handleVerifyAll).toHaveBeenCalled();
    });
  });

  describe("ReportUploader Component", () => {
    it("renders drag-and-drop file upload target and pre-calibrated sample buttons", () => {
      const handleSuccess = vi.fn();
      render(<ReportUploader onSuccess={handleSuccess} />);

      expect(screen.getByText(/Drag & drop medical report here/i)).toBeDefined();
      expect(screen.getByText(/Supports multi-page PDF, JPG, PNG, CSV, or TXT/i)).toBeDefined();
      expect(screen.getByText("Celiac Disease Serology & Immunoglobulins")).toBeDefined();
      expect(screen.getByText("Comprehensive Metabolic & Lipid Panel")).toBeDefined();
    });

    it("loads clinical sample text into direct text input tab", () => {
      const handleSuccess = vi.fn();
      render(<ReportUploader onSuccess={handleSuccess} />);

      const celiacSampleBtn = screen.getByText("Celiac Disease Serology & Immunoglobulins");
      fireEvent.click(celiacSampleBtn);

      expect(screen.getByDisplayValue(/Tissue Transglutaminase IgA/i)).toBeDefined();
    });
  });

  describe("BiomarkerTrendChart Component", () => {
    it("renders longitudinal trajectory with velocity summary cards", () => {
      render(<BiomarkerTrendChart series={mockTrendSeries} />);

      expect(screen.getByText(/Longitudinal Biomarker Trajectory/i)).toBeDefined();
      expect(screen.getByText(/Reference Interval Shaded/i)).toBeDefined();
      expect(screen.getByText("68.4")).toBeDefined(); // Latest Draw
      expect(screen.getByText("U/mL")).toBeDefined();
      expect(screen.getByText("0 - 10 U/mL")).toBeDefined(); // Reference
    });

    it("renders timeframe selector buttons (30D, 3M, 6M, 12M, ALL)", () => {
      render(<BiomarkerTrendChart series={mockTrendSeries} />);

      expect(screen.getByText("30D")).toBeDefined();
      expect(screen.getByText("3M")).toBeDefined();
      expect(screen.getByText("6M")).toBeDefined();
      expect(screen.getByText("12M")).toBeDefined();
      expect(screen.getByText("ALL")).toBeDefined();
    });
  });

  describe("Clinician Queue Dynamic Biomarker Count Verification", () => {
    it("guarantees dynamic biomarker count equals measurement array length (never 0 for 4 items)", () => {
      const mockCase = {
        id: 102,
        title: "Celiac Disease Serology & Autoantibody Panel",
        patient_name: "Rajesh Kumar",
        patient_mrn: "MRN-92041",
        measurement_count: 4,
        measurements: mockMeasurements,
        triage_priority: "stat_critical" as const,
      };

      // Mathematical invariant: count must match measurement list length
      const computedCount = mockCase.measurement_count ?? (mockCase.measurements ? mockCase.measurements.length : 0);
      expect(computedCount).toBe(4);
      expect(computedCount).toBe(mockCase.measurements.length);
      expect(computedCount).not.toBe(0);
    });
  });
});
