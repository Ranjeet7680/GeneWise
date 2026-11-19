import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import ExplainableInsightModal, {
  ExplainabilityDossier,
} from "../components/ExplainableInsightModal";
import PreconceptionWorkspace from "../app/family-genetics/components/PreconceptionWorkspace";
import SpecialistDirectoryView from "../app/family-genetics/components/SpecialistDirectoryView";
import { PreconceptionPlan, GeneticCounsellor, SpecialistReferral } from "../app/family-genetics/types";

// Mock router and sound
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/family-genetics",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/sound", () => ({
  sound: {
    playClick: vi.fn(),
    playSoft: vi.fn(),
    playPop: vi.fn(),
    playSuccess: vi.fn(),
    playWarning: vi.fn(),
    playChime: vi.fn(),
  },
}));

vi.mock("@/lib/api", () => ({
  api: {
    submitPreconceptionQuestionnaire: vi.fn().mockResolvedValue({
      status: "success",
      message: "Preconception questionnaire answers saved successfully.",
      plan_id: 1,
      completed_answers_count: 5,
    }),
    explainInsight: vi.fn().mockResolvedValue({
      topic: "Beta Thalassemia Carrier Risk",
      explanation_dimensions: {
        information_analyzed: "Pedigree records",
        relevant_family_observations: "Carrier traits observed",
        clinical_rationale: "Autosomal recessive pattern",
        supporting_evidence: "ACOG guideline",
        uncertainties_and_limitations: "Partner genotype unconfirmed",
        suggested_follow_up: "Partner HPLC test",
      },
      evidence_citations: [],
      outdated_evidence_detected: false,
      clinical_disclaimer: "Educational risk awareness only.",
    }),
  },
}));

describe("AI Intelligence Engine & Explainability Modules Suite", () => {
  const sampleDossier: ExplainabilityDossier = {
    insight_id: "XAI-TEST-001",
    insight_title: "Beta Thalassemia Carrier Trait Assessment",
    insight_type: "Autosomal Recessive Screening",
    generated_at: new Date().toISOString(),
    explainability_dimensions: {
      "1_information_analyzed": ["3-generation family tree", "Patient CBC index"],
      "2_relevant_family_history": ["Maternal aunt diagnosed with Thalassemia Minor"],
      "3_clinical_logic_rationale":
        "Autosomal recessive transmission requires two carrier parents for major disease manifestation.",
      "4_supporting_evidence_citations": [
        {
          title: "ACOG Carrier Screening Practice Bulletin 2023",
          source: "ACOG",
          publication_year: 2023,
          pmid: "28225643",
          evidence_tier: "Level 1A Guideline",
          is_outdated_warning: false,
          consensus_status: "Verified",
        },
        {
          title: "Archived 2011 Experimental Protocol",
          source: "Legacy Journal",
          publication_year: 2011,
          pmid: "21849102",
          evidence_tier: "Observational",
          is_outdated_warning: true,
          consensus_status: "Superseded",
        },
      ],
      "5_uncertainties_and_limitations": ["Partner testing results pending"],
      "6_suggested_professional_followup": [
        "CBC and Hemoglobin HPLC for partner",
        "Genetic counseling session",
      ],
    },
    statutory_disclaimer:
      "MediPredict AI provides educational genetic and family-history risk awareness. It does not diagnose genetic conditions, determine reproductive outcomes, or replace clinical genetic testing and professional genetic counselling.",
  };

  it("renders 6-dimensional Explainable AI (XAI) modal with evidence citations and outdated warning", () => {
    const handleClose = vi.fn();
    render(
      <ExplainableInsightModal
        isOpen={true}
        onClose={handleClose}
        dossier={sampleDossier}
      />
    );

    expect(screen.getByText("Explainable AI (XAI)")).toBeInTheDocument();
    expect(screen.getByText("Beta Thalassemia Carrier Trait Assessment")).toBeInTheDocument();

    // Verify all 6 dimensions are displayed
    expect(screen.getByText(/Information & Health Data Analyzed/i)).toBeInTheDocument();
    expect(screen.getByText(/Relevant Family-History Observations/i)).toBeInTheDocument();
    expect(screen.getByText(/Why This Insight Was Generated \(Clinical Logic\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Supporting Medical Evidence & Literature Grounding/i)).toBeInTheDocument();
    expect(screen.getByText(/Uncertainties, Data Gaps & Missing Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Suggested Clinical & Counseling Follow-Up/i)).toBeInTheDocument();

    // Verify outdated guideline badge
    expect(screen.getByText("Superseded")).toBeInTheDocument();

    // Verify statutory non-diagnostic disclaimer
    expect(
      screen.getByText(/MediPredict AI provides educational genetic and family-history risk awareness/i)
    ).toBeInTheDocument();
  });

  it("PreconceptionWorkspace: launches Clinical Intake Wizard, cycles steps, and updates milestones", async () => {
    const mockPlan: PreconceptionPlan = {
      id: 1,
      user_id: 1,
      partner_family_history_collected: false,
      known_conditions_reviewed: false,
      previous_genetic_tests_reviewed: false,
      carrier_screening_discussed: false,
      medications_reviewed: false,
      vaccinations_reviewed: false,
      folic_acid_initiated: false,
      clinician_questions_prepared: false,
      counsellor_consultation_scheduled: false,
      partner_notes: "",
      medication_notes: "",
      vaccination_notes: "",
      custom_questions: [],
      follow_up_checklist: [],
      checklist_state: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSave = vi.fn().mockResolvedValue(undefined);
    const mockNavigate = vi.fn();

    render(
      <PreconceptionWorkspace
        plan={mockPlan}
        onSavePlan={mockSave}
        onNavigateTab={mockNavigate}
      />
    );

    // Click Clinical Intake Wizard button
    const wizardBtn = screen.getByText("Clinical Intake Wizard");
    expect(wizardBtn).toBeInTheDocument();
    fireEvent.click(wizardBtn);

    // Wizard modal opens
    expect(screen.getByText("CLINICAL PRECONCEPTION QUESTIONNAIRE")).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 4: Ancestral Origins & Consanguinity/i)).toBeInTheDocument();

    // Answer Yes to first question
    const yesButtons = screen.getAllByRole("button", { name: "Yes" });
    fireEvent.click(yesButtons[0]);

    // Navigate to next section
    const nextBtn = screen.getByText("Next Section");
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Step 2 of 4: Personal & Partner Health Conditions/i)).toBeInTheDocument();
  });

  it("SpecialistDirectoryView: displays verified credential badge and expands referral summary preview", () => {
    const sampleCounsellor: GeneticCounsellor = {
      id: 1,
      full_name: "Dr. Ananya Sharma",
      credentials: "Board-Certified Genetic Counselor (BGCI / ABGC)",
      specialty: "Reproductive & Preconception Genetics",
      affiliation: "National Institute of Genomics & Clinical Genetics Center",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      telehealth_available: true,
      languages_spoken: ["English", "Hindi"],
      bio: "12+ years clinical experience in hemoglobinopathy carrier screening.",
      consultation_fee_inr: 1500,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const mockRequest = vi.fn().mockResolvedValue(undefined);

    render(
      <SpecialistDirectoryView
        counsellors={[sampleCounsellor]}
        referrals={[]}
        onRequestReferral={mockRequest}
      />
    );

    // Verify verified credential badge
    expect(screen.getByText(/Verified Credential: Board-Certified Genetic Counselor/i)).toBeInTheDocument();

    // Click Request Referral
    const requestBtn = screen.getByRole("button", { name: "Request Referral" });
    fireEvent.click(requestBtn);

    // Modal opens
    expect(screen.getByText("CLINICAL REFERRAL REQUEST")).toBeInTheDocument();

    // Expand preview summary drawer
    const previewBtn = screen.getByText(/Preview Referral Data Summary/i);
    expect(previewBtn).toBeInTheDocument();
    fireEvent.click(previewBtn);

    // Verify preview contents are visible
    expect(screen.getByText(/Referral Recipient:/i)).toBeInTheDocument();
    expect(screen.getByText(/Transmitted Pedigree State:/i)).toBeInTheDocument();
    expect(screen.getByText(/Explicit Consent for Clinical Data Transmission/i)).toBeInTheDocument();
  });
});
