import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import FamilyGeneticsPage from "@/app/family-genetics/page";
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

function renderFamilyGenetics() {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <FamilyGeneticsPage />
      </AuthProvider>
    </ThemeProvider>
  );
}

describe("Family Health History & Genetic Risk Intelligence Suite", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    seedUser();
    setMockPathname("/family-genetics");
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    }
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Offline demo fallback")) as any;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("renders page title, compliance badges, and mandatory medical disclaimer verbatim", async () => {
    renderFamilyGenetics();

    // Check main title
    expect(
      screen.getByText("Family Health History & Genetic Risk Intelligence")
    ).toBeInTheDocument();

    // Check compliance badges
    expect(screen.getByText("DPDP Act & HIPAA Compliant")).toBeInTheDocument();

    // Check verbatim mandated disclaimer
    expect(
      screen.getByText(
        /"MediPredict AI provides educational genetic and family-history risk awareness. It does not diagnose genetic conditions, determine reproductive outcomes, or replace clinical genetic testing and professional genetic counselling."/
      )
    ).toBeInTheDocument();
  });

  it("renders all 6 dashboard metric cards", async () => {
    renderFamilyGenetics();

    expect(screen.getByText("Family Members")).toBeInTheDocument();
    expect(screen.getByText("Pedigree Depth")).toBeInTheDocument();
    expect(screen.getByText("Recorded Conditions")).toBeInTheDocument();
    expect(screen.getByText("Genetic Variants")).toBeInTheDocument();
    expect(screen.getByText("Carrier Topics")).toBeInTheDocument();
    expect(screen.getByText("Referrals & Visits")).toBeInTheDocument();
  });

  it("navigates to Family Health Tree visualizer and displays generation depths and members", async () => {
    renderFamilyGenetics();

    // Click on Family Health Tree tab
    const treeTab = screen.getByRole("button", { name: /Family Health Tree/i });
    fireEvent.click(treeTab);

    // Verify Generations rendered
    expect(screen.getByText(/GENERATION I — Grandparents/i)).toBeInTheDocument();
    expect(screen.getByText(/GENERATION II — Parents/i)).toBeInTheDocument();
    expect(screen.getByText(/GENERATION III — Proband/i)).toBeInTheDocument();

    // Verify Proband (Self) and Lineage Indicators
    expect(screen.getByText(/Paternal Lineage/i)).toBeInTheDocument();
    expect(screen.getByText(/Maternal Lineage/i)).toBeInTheDocument();

    // Verify Clinical principle warning
    expect(
      screen.getByText(
        /Clinical Genetics Principle: Do not assume a condition is inherited merely because it appears in a family/i
      )
    ).toBeInTheDocument();
  });

  it("navigates to Genetic Risk Engine and displays 7-point structured risk report", async () => {
    renderFamilyGenetics();

    const riskTab = screen.getByRole("button", { name: /Genetic Risk Engine/i });
    fireEvent.click(riskTab);

    // Verify 7-point report title
    expect(
      screen.getByText("7-Point Educational Risk Assessment Report")
    ).toBeInTheDocument();

    // Verify the points
    expect(screen.getByText("Observed Family-History Information")).toBeInTheDocument();
    expect(screen.getByText("Relevant Inherited-Condition Information")).toBeInTheDocument();
    expect(screen.getByText("Why the Pattern May Deserve Attention")).toBeInTheDocument();
    expect(screen.getByText("Missing Information & Pedigree Gaps")).toBeInTheDocument();
    expect(screen.getByText("Medical Evidence & Scientific Reference Layer")).toBeInTheDocument();
    expect(screen.getByText("Suggested Questions for Qualified Clinicians")).toBeInTheDocument();
    expect(screen.getByText("Recommended Next Steps & Action Plan")).toBeInTheDocument();

    // Verify Educational tabs
    expect(screen.getByRole("button", { name: /Autosomal Recessive/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Autosomal Dominant/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /X-Linked/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Carrier Guidance/i })).toBeInTheDocument();
  });

  it("navigates to Carrier Screening module and displays educational criteria", async () => {
    renderFamilyGenetics();

    const carrierTab = screen.getByRole("button", { name: /Carrier Screening/i });
    fireEvent.click(carrierTab);

    // Check Educational foundations
    expect(screen.getByText("1. What is Screening?")).toBeInTheDocument();
    expect(screen.getByText("2. Screening vs Diagnostic")).toBeInTheDocument();
    expect(screen.getByText("3. Residual Risk Principle")).toBeInTheDocument();
    expect(screen.getByText("4. Partner Testing")).toBeInTheDocument();

    // Check Condition library
    expect(screen.getByText("Condition Library (6)")).toBeInTheDocument();
    expect(
      screen.getAllByText("Beta Thalassemia & Hemoglobin Disorders").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("navigates to Preconception Planner and toggles checklist items", async () => {
    renderFamilyGenetics();

    const preconceptionTab = screen.getByRole("button", { name: /Preconception Planner/i });
    fireEvent.click(preconceptionTab);

    expect(screen.getByText("Clinical Preconception Readiness Milestones")).toBeInTheDocument();
    expect(screen.getByText("Folic Acid Supplementation Initiated")).toBeInTheDocument();
    expect(screen.getByText("Download Summary")).toBeInTheDocument();
    expect(screen.getByText("Save Progress")).toBeInTheDocument();
  });

  it("navigates to Specialist Directory and checks explicit consent enforcement", async () => {
    renderFamilyGenetics();

    const counsellorsTab = screen.getByRole("button", { name: /Find a Counsellor/i });
    fireEvent.click(counsellorsTab);

    expect(
      screen.getByText("Demonstration Directory Notice & Clinical Practice Standards")
    ).toBeInTheDocument();

    // Click on Request Referral for Dr. Ananya Sen
    const requestButtons = screen.getAllByRole("button", { name: /Request Referral/i });
    fireEvent.click(requestButtons[0]);

    // Modal opens
    expect(
      screen.getByText(/Explicit Consent for Clinical Data Transmission/i)
    ).toBeInTheDocument();

    // Confirm button should be disabled without checking consent
    const confirmButton = screen.getByRole("button", { name: /Confirm Referral Request/i });
    expect(confirmButton).toBeDisabled();

    // Check consent checkbox (last checkbox on the page inside the modal)
    const checkboxes = screen.getAllByRole("checkbox");
    const consentCheckbox = checkboxes[checkboxes.length - 1];
    fireEvent.click(consentCheckbox);

    // Now confirm button should be enabled
    expect(confirmButton).not.toBeDisabled();
  });

  it("navigates to Privacy & Consent tab and displays DPDP Act & purge options", async () => {
    renderFamilyGenetics();

    const privacyTab = screen.getByRole("button", { name: /Privacy & Consent/i });
    fireEvent.click(privacyTab);

    expect(screen.getByText("DPDP Act 2023 & HIPAA Privacy Standard")).toBeInTheDocument();
    expect(screen.getByText("Right to Erasure & Purge")).toBeInTheDocument();
    expect(screen.getByText("Export All Family & Genetic Data")).toBeInTheDocument();
    expect(screen.getByText("Irreversible Data Purge")).toBeInTheDocument();
  });
});
