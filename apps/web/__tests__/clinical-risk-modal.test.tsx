import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClinicalRiskModal } from '../components/ClinicalRiskModal';
import { AuthProvider } from '../lib/auth';
import { ThemeProvider } from '../lib/theme';

// Mock window.print
beforeEach(() => {
  window.print = vi.fn();
});

const renderModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (text: string) => void;
}) => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <ClinicalRiskModal {...props} />
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('ClinicalRiskModal — Advanced Clinical Risk Stratification Model Suite', () => {
  it('renders modal header, model provenance badges, and statutory investigational notice', () => {
    const onClose = vi.fn();
    renderModal({ isOpen: true, onClose });

    expect(screen.getByText(/Celiac Disease Risk Stratification Model/i)).toBeInTheDocument();
    expect(screen.getByText(/GradientBoosting v1.0.4/i)).toBeInTheDocument();
    expect(screen.getByText(/ROC-AUC: 0.9424/i)).toBeInTheDocument();
    expect(screen.getByText(/Investigational Clinical Decision Support Tool/i)).toBeInTheDocument();
    expect(screen.getByText(/does NOT replace duodenal mucosal biopsy/i)).toBeInTheDocument();
  });

  it('renders all 4 clinical input sections and default patient values from screenshot', () => {
    const onClose = vi.fn();
    renderModal({ isOpen: true, onClose });

    // Section headers
    expect(screen.getByText(/Patient Demographic & Chronic History/i)).toBeInTheDocument();
    expect(screen.getByText(/Immunoglobulin Serology Markers/i)).toBeInTheDocument();
    expect(screen.getByText(/Gastrointestinal & Systemic Manifestations/i)).toBeInTheDocument();
    expect(screen.getByText(/Family Health Pedigree & Genetic Susceptibility/i)).toBeInTheDocument();

    // Inputs from screenshot
    expect(screen.getByDisplayValue('26')).toBeInTheDocument(); // Age
    expect(screen.getAllByDisplayValue('2.8').length).toBeGreaterThanOrEqual(1); // Serum IgA & Total IgA
    expect(screen.getByDisplayValue('13.9')).toBeInTheDocument(); // IgG
    expect(screen.getByDisplayValue('1.1')).toBeInTheDocument(); // IgM
  });

  it('calculates risk score and displays dynamic risk gauge, confidence interval, and biomarker table', async () => {
    const onClose = vi.fn();
    renderModal({ isOpen: true, onClose });

    const calcButton = screen.getByRole('button', { name: /Calculate Clinical Risk Score/i });
    fireEvent.click(calcButton);

    await waitFor(() => {
      expect(screen.getByText(/2. Risk Output & Gauge/i)).toBeInTheDocument();
    });

    // Check risk output and CI
    expect(screen.getByText(/Model Estimation Classification/i)).toBeInTheDocument();
    expect(screen.getByText(/95% Confidence Interval/i)).toBeInTheDocument();
    expect(screen.getByText(/Patient Biomarker Reference Table/i)).toBeInTheDocument();
    expect(screen.getByText(/Educational Clinical Recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/gluten-containing diet/i)).toBeInTheDocument();
  });

  it('navigates to Explain Prediction (SHAP) and renders direction, magnitude, and clinical causation warning', async () => {
    const onClose = vi.fn();
    renderModal({ isOpen: true, onClose });

    // Calculate first to generate SHAP
    fireEvent.click(screen.getByRole('button', { name: /Calculate Clinical Risk Score/i }));
    await waitFor(() => {
      expect(screen.getByText(/2. Risk Output & Gauge/i)).toBeInTheDocument();
    });

    // Switch to SHAP tab
    const shapTab = screen.getByRole('button', { name: /3. Explain Prediction \(SHAP\)/i });
    fireEvent.click(shapTab);

    expect(screen.getByText(/Explainable AI: TreeSHAP Feature Attribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Feature attribution reflects statistical weight/i)).toBeInTheDocument();
    expect(screen.getByText(/Absence of Diabetes Mellitus/i)).toBeInTheDocument();
  });

  it('navigates to Model Transparency tab and displays actual N=2,206 and ACG 2023 guideline', () => {
    const onClose = vi.fn();
    renderModal({ isOpen: true, onClose });

    const transTab = screen.getByRole('button', { name: /4. Model Transparency/i });
    fireEvent.click(transTab);

    expect(screen.getByText(/Model Provenance & Cross-Validation Metrics/i)).toBeInTheDocument();
    expect(screen.getByText('N = 2,206')).toBeInTheDocument();
    expect(screen.getByText('99.7%')).toBeInTheDocument(); // Sensitivity
    expect(screen.getByText(/ACG Clinical Guidelines: Diagnosis and Management of Celiac Disease \(2023\)/i)).toBeInTheDocument();
    expect(screen.getByText(/PMID: 36637387/i)).toBeInTheDocument();
  });

  it('completes clinician review workflow and displays HMAC audit token', async () => {
    const onClose = vi.fn();
    renderModal({ isOpen: true, onClose });

    const reviewTab = screen.getByRole('button', { name: /5. Clinician Review/i });
    fireEvent.click(reviewTab);

    expect(screen.getByText(/Attending Clinician Review & Electronic Sign-Off/i)).toBeInTheDocument();
    expect(screen.getByText(/Approve AI Summary/i)).toBeInTheDocument();

    const submitReviewBtn = screen.getByRole('button', { name: /Seal Clinical Review in Audit Ledger/i });
    fireEvent.click(submitReviewBtn);

    await waitFor(() => {
      expect(screen.getByText(/Clinical Sign-Off Successfully Sealed in Audit Ledger/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/AUDIT-REV-/i)).toBeInTheDocument();
  });

  it('renders Exportable Clinical Summary and triggers window.print on print button', () => {
    const onClose = vi.fn();
    renderModal({ isOpen: true, onClose });

    const summaryTab = screen.getByRole('button', { name: /6. Clinical Summary \/ PDF/i });
    fireEvent.click(summaryTab);

    expect(screen.getByText(/GeneWise Clinical Decision Support Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Physician Signature & Timestamp/i)).toBeInTheDocument();

    const printBtn = screen.getByRole('button', { name: /Print Clinical Summary \/ PDF/i });
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});
