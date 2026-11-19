import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmergencySosBanner from "@/components/EmergencySosBanner";
import SymptomCheckerWizardModal from "@/components/SymptomCheckerWizardModal";
import MedicationIntelligenceModal from "@/components/MedicationIntelligenceModal";
import AuthorizedHealthContextModal from "@/components/AuthorizedHealthContextModal";
import BiomarkerCorrectionModal from "@/components/BiomarkerCorrectionModal";
import SpecialistReferralModal from "@/components/SpecialistReferralModal";

function seedUser() {
  const user = {
    id: 1,
    email: "demo@medipredict.ai",
    full_name: "Dr. Elena Rostova",
    role: "clinician",
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem("medipredict_token", "test-token");
  localStorage.setItem("medipredict_user", JSON.stringify(user));
  localStorage.setItem("medipredict_profile_overrides", JSON.stringify(user));
}

describe("MediPredict AI — Advanced Medical Assistant Upgrade Suite", () => {
  beforeEach(() => {
    localStorage.clear();
    seedUser();
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Offline fallback")) as any;
  });

  describe("Emergency SOS Banner", () => {
    it("renders red-flag emergency alert and national hotline numbers", () => {
      const handleDismiss = vi.fn();
      render(
        <EmergencySosBanner
          customMessage="Critical acute coronary syndrome warning signs detected."
          onDismiss={handleDismiss}
        />
      );

      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText(/Critical Emergency SOS/i)).toBeDefined();
      expect(screen.getByText(/Critical acute coronary syndrome warning signs detected/i)).toBeDefined();
      expect(screen.getByText(/Call 112/i)).toBeDefined();
      expect(screen.getByText(/Call 911/i)).toBeDefined();
      expect(screen.getByText(/Call 999/i)).toBeDefined();

      const dismissBtn = screen.getByRole("button", { name: /Dismiss emergency alert/i });
      fireEvent.click(dismissBtn);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe("Symptom Checker Wizard Modal", () => {
    it("progresses through 4-step wizard and evaluates clinical triage", async () => {
      const handleSendToChat = vi.fn();
      const handleClose = vi.fn();

      render(
        <SymptomCheckerWizardModal
          isOpen={true}
          onClose={handleClose}
          onSendToChat={handleSendToChat}
          initialSymptoms="Sharp retrosternal chest tightness on exertion"
        />
      );

      expect(screen.getByText(/Clinical Symptom Checker & Triage Engine/i)).toBeDefined();
      expect(screen.getByDisplayValue(/Sharp retrosternal chest tightness/i)).toBeDefined();

      // Step 1 -> Step 2
      const nextBtn1 = screen.getByRole("button", { name: /Next: Associated Signs/i });
      fireEvent.click(nextBtn1);

      // Step 2: Associated signs
      expect(screen.getByText(/Select any associated signs/i)).toBeDefined();
      const sobChip = screen.getByRole("button", { name: /Shortness of breath/i });
      fireEvent.click(sobChip);

      // Step 2 -> Step 3
      const nextBtn2 = screen.getByRole("button", { name: /Next: History & Meds/i });
      fireEvent.click(nextBtn2);

      // Step 3: Run Triage
      expect(screen.getByText(/Known Pre-Existing Conditions/i)).toBeDefined();
      const runTriageBtn = screen.getByRole("button", { name: /Run Clinical Triage/i });
      fireEvent.click(runTriageBtn);

      // Step 4: Results
      await waitFor(() => {
        expect(screen.getByText(/Triage Urgency:/i)).toBeDefined();
      });

      expect(screen.getByText(/Educational Considerations/i)).toBeDefined();
      expect(screen.getByText(/Questions for Your Doctor:/i)).toBeDefined();

      const sendToChatBtn = screen.getByRole("button", { name: /Send to Consultation Chat/i });
      fireEvent.click(sendToChatBtn);
      expect(handleSendToChat).toHaveBeenCalledTimes(1);
    });
  });

  describe("Medication Intelligence & Pharmacology Reference Modal", () => {
    it("searches medication monograph, displays black-box warnings and non-prescribing notice", async () => {
      const handleSendToChat = vi.fn();
      render(
        <MedicationIntelligenceModal
          isOpen={true}
          onClose={() => {}}
          onSendToChat={handleSendToChat}
          patientActiveMeds={["Metformin 500mg daily", "Atorvastatin 20mg nocte"]}
        />
      );

      expect(screen.getByText(/Medication Intelligence & Pharmacology Reference/i)).toBeDefined();

      // Click Atorvastatin chip
      const atorvaChip = screen.getByRole("button", { name: /^Atorvastatin$/i });
      fireEvent.click(atorvaChip);

      await waitFor(() => {
        expect(screen.getByText(/Atorvastatin Calcium/i)).toBeDefined();
      });

      expect(screen.getByText(/HMG-CoA Reductase Inhibitor/i)).toBeDefined();
      expect(screen.getAllByText(/Rhabdomyolysis/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Statutory Non-Prescribing Notice:/i)).toBeDefined();

      const insertBtn = screen.getByRole("button", { name: /Insert into Consultation/i });
      fireEvent.click(insertBtn);
      expect(handleSendToChat).toHaveBeenCalledTimes(1);
    });
  });

  describe("Authorized Health Context Modal", () => {
    it("renders individual domain toggles and minimal necessary data scoping", async () => {
      const handleContextChanged = vi.fn();
      render(
        <AuthorizedHealthContextModal
          isOpen={true}
          onClose={() => {}}
          onContextChanged={handleContextChanged}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Authorized Health Context & Privacy Controls/i)).toBeDefined();
      });

      expect(screen.getByText(/Data Minimization Principle:/i)).toBeDefined();
      expect(screen.getByText(/Laboratory Reports & Measurements/i)).toBeDefined();
      expect(screen.getByText(/Physiological Vitals/i)).toBeDefined();
      expect(screen.getByText(/Wearable & IoT Telemetry/i)).toBeDefined();
      expect(screen.getByText(/Family Health Tree & Pedigree/i)).toBeDefined();
      expect(screen.getByText(/Genetic Variants & Predispositions/i)).toBeDefined();

      const applyBtn = screen.getByRole("button", { name: /Apply & Save Permissions/i });
      fireEvent.click(applyBtn);
    });
  });

  describe("Biomarker Correction Modal", () => {
    it("allows inspecting and editing extracted laboratory measurements with verification", async () => {
      const dummyReports = [
        {
          id: 101,
          user_id: 1,
          title: "Comprehensive Metabolic Panel (CMP-14)",
          report_type: "Biochemical Analysis",
          report_date: new Date().toISOString(),
          status: "verified",
          created_at: new Date().toISOString(),
          measurement_count: 5,
          measurements: [
            {
              id: 501,
              report_id: 101,
              test_name: "ALT (Alanine Aminotransferase)",
              category: "Hepatic",
              value: 64,
              unit: "U/L",
              flag: "high",
              user_verified: false,
            },
          ],
        },
      ];

      render(
        <BiomarkerCorrectionModal
          isOpen={true}
          onClose={() => {}}
          reports={dummyReports as any}
        />
      );

      expect(screen.getByText(/Biomarker OCR Extraction & Interactive Verification/i)).toBeDefined();
      expect(screen.getByText(/ALT \(Alanine Aminotransferase\)/i)).toBeDefined();
      expect(screen.getByText("64")).toBeDefined();

      // Click Edit
      const editBtn = screen.getByRole("button", { name: /Edit/i });
      fireEvent.click(editBtn);

      // Verify input shows value
      const valInput = screen.getByDisplayValue("64");
      expect(valInput).toBeDefined();
    });
  });

  describe("Specialist Referral & Consultation Packet Modal", () => {
    it("enforces mandatory patient consent and generates structured referral packet with audit token", async () => {
      const handleReferralCreated = vi.fn();
      render(
        <SpecialistReferralModal
          isOpen={true}
          onClose={() => {}}
          onReferralCreated={handleReferralCreated}
        />
      );

      expect(screen.getByText(/Specialist Referral & Consultation Packet/i)).toBeDefined();
      expect(screen.getByText(/Dr. Elena Rostova/i)).toBeDefined();

      const generateBtn = screen.getByRole("button", { name: /Generate Structured Referral Packet/i });
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText(/Tamper-Resistant Consent Token/i)).toBeDefined();
      });

      expect(screen.getByText(/CONSENT-E7B28FA931D5409C/i)).toBeDefined();
      expect(screen.getByText(/Prepared Specialist Discussion Points:/i)).toBeDefined();
      expect(handleReferralCreated).toHaveBeenCalledTimes(1);
    });
  });
});
