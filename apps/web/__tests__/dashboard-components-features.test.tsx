import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Activity } from "lucide-react";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import AppHeader from "@/components/AppHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import ClinicalMarkdown from "@/components/ClinicalMarkdown";
import EmptyState from "@/components/EmptyState";
import MedicalStatusBadge from "@/components/MedicalStatusBadge";
import MetricCard from "@/components/MetricCard";
import PipTelemetryWidget from "@/components/PipTelemetryWidget";
import SafetyNotice from "@/components/SafetyNotice";
import GeneWiseDashboardPage from "@/app/dashboard/page";
import DocumentationPortalPage from "@/app/documentation/page";
import PrivacyCharterPage from "@/app/governance/privacy-charter/page";
import TermsPage from "@/app/governance/terms/page";
import ZeroSalePledgePage from "@/app/governance/zero-sale-pledge/page";
import FindCounselorPage from "@/app/clinical-support/find-counselor/page";
import DiscussionPrepPage from "@/app/clinical-support/discussion-prep/page";
import ScientificFaqPage from "@/app/clinical-support/scientific-faq/page";
import DataLineagePage from "@/app/data-lineage/page";
import SecuritySettingsPage from "@/app/settings/security/page";
import PrivacySettingsPage from "@/app/settings/privacy/page";
import AnalyticsEnginePage from "@/app/analytics/page";
import GeneticsPage from "@/app/genetics/page";
import DiseasesPage from "@/app/diseases/page";
import FamilyHistoryPage from "@/app/my-family-history/page";
import ResearchPage from "@/app/research/page";
import { setMockPathname } from "../vitest.setup";

function seedAuthenticatedUser(overrides: Record<string, any> = {}) {
  localStorage.setItem("medipredict_token", "demo_clinical_jwt_token_2026");
  const user = {
    id: 1,
    email: "ranjeet@medipredict.ai",
    full_name: "Dr. Ranjeet Kumar",
    role: "clinician",
    phone: "+91 9876543210",
    phone_verified: true,
    specialty: "Clinical Genetics Director",
    organization: "GeneWise Precision Institute",
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    ...overrides,
  };
  localStorage.setItem("medipredict_user", JSON.stringify(user));
  localStorage.setItem("medipredict_profile_overrides", JSON.stringify(user));
}

describe("Dashboard Synchronization, Reusable Clinical Components & Core Pages", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Offline demo fallback")) as any;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("renders Dashboard with dynamic user greeting, analytics controls, checklist toggle, Add Member modal & PiP toggle", async () => {
    seedAuthenticatedUser({ full_name: "Dr. Ranjeet Kumar" });
    localStorage.setItem(
      "medipredict_workspace_brand",
      JSON.stringify({
        name: "GeneWise Pro",
        subtitle: "Clinical genetics workspace",
        badge: "v2.5",
        logoKey: "pulse",
      })
    );
    setMockPathname("/dashboard");

    render(
      <ThemeProvider>
        <AuthProvider>
          <GeneWiseDashboardPage />
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome back, Dr. Ranjeet Kumar")).toBeInTheDocument();
    });
    expect(screen.getByText(/GeneWise Pro Analytics Workspace/i)).toBeInTheDocument();
    expect(screen.getByText("+91 9876543210")).toBeInTheDocument();

    // Launch PiP overlay widget
    fireEvent.click(screen.getByRole("button", { name: /Launch PiP Graph/i }));
    expect(screen.getByRole("button", { name: /Hide PiP Graph/i })).toBeInTheDocument();

    // Open Add Family Member modal and submit new member
    fireEvent.click(screen.getByRole("button", { name: /Add Family Member/i }));
    const memberInput = screen.getByPlaceholderText(/Relative D or Maternal Aunt/i);
    fireEvent.change(memberInput, { target: { value: "Aunt Priya" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Encrypted Relative/i }));

    await waitFor(() => {
      expect(screen.getByText(/Encrypted Aunt Priya/i)).toBeInTheDocument();
    });
  });

  it("renders AppHeader with authenticated user profile menu, emergency modal & notification flyout", async () => {
    seedAuthenticatedUser({ full_name: "Dr. Ranjeet Kumar", role: "clinician" });
    setMockPathname("/dashboard");

    render(
      <ThemeProvider>
        <AuthProvider>
          <AppHeader />
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Dr. Ranjeet Kumar")).toBeInTheDocument();
    });

    // Open Emergency 112 / 911 modal
    fireEvent.click(screen.getByTitle(/Rapid Emergency SOS/i));
    expect(screen.getByText(/STAT Emergency Clinical Dispatch/i)).toBeInTheDocument();

    // Open & close Mobile Navigation Drawer
    fireEvent.click(screen.getByRole("button", { name: /Open navigation menu/i }));
    expect(screen.getByLabelText(/Mobile workspace navigation/i)).toBeInTheDocument();
    expect(screen.getByText(/ICU Node #409: ACTIVE/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Close navigation menu/i }));
    expect(screen.queryByLabelText(/Mobile workspace navigation/i)).not.toBeInTheDocument();
  });

  it("renders unified MobileBottomNav on standard pages and hides it on /assistant", () => {
    setMockPathname("/dashboard");
    const { rerender } = render(<MobileBottomNav />);
    expect(screen.getByLabelText(/Mobile quick navigation/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /AI Chat/i })).toHaveAttribute("href", "/assistant");

    setMockPathname("/assistant");
    rerender(<MobileBottomNav />);
    expect(screen.queryByLabelText(/Mobile quick navigation/i)).not.toBeInTheDocument();
  });

  it("renders MedicalStatusBadge, MetricCard, ClinicalMarkdown, SafetyNotice, EmptyState & PipTelemetryWidget cleanly", () => {
    const onClose = vi.fn();
    const onToggle = vi.fn();
    const onAction = vi.fn();

    render(
      <div>
        <MedicalStatusBadge flag="critical" />
        <MedicalStatusBadge flag="high" />
        <MedicalStatusBadge flag="low" />
        <MedicalStatusBadge flag="normal" />
        <MetricCard title="Heart Rate" value={72} unit="BPM" status="normal" icon={Activity} />
        <ClinicalMarkdown content={"### Summary\n**BRCA1** and *CFTR* via `ClinVar`."} />
        <SafetyNotice type="emergency" />
        <SafetyNotice type="clinical_disclaimer" />
        <EmptyState title="No Reports" description="Upload a lab PDF." icon={Activity} actionText="Upload" onAction={onAction} />
        <PipTelemetryWidget
          isOpen={true}
          onClose={onClose}
          isStreaming={true}
          onToggleStream={onToggle}
          heartRate={72}
          spo2={98.7}
          bpSystolic={121}
          bpDiastolic={77}
          series={[{ label: "Now", hr: 72, spo2: 98.7, systolic: 121, diastolic: 77 }]}
        />
      </div>
    );

    expect(screen.getByText("Critical Alert")).toBeInTheDocument();
    expect(screen.getByText("Elevated")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getAllByText("Normal").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Heart Rate")).toBeInTheDocument();
    expect(screen.getByText("BRCA1")).toBeInTheDocument();
    expect(screen.getByText(/Critical Emergency Guidance/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Upload"));
    expect(onAction).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle("Close PiP window"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders Governance, Clinical Support, Data Lineage, Analytics, Genetics, Diseases, Family Pedigree, Research & Settings pages", () => {
    seedAuthenticatedUser();

    const pages = [
      <PrivacyCharterPage key="privacy-charter" />,
      <TermsPage key="terms" />,
      <ZeroSalePledgePage key="zero-sale" />,
      <FindCounselorPage key="counselor" />,
      <DiscussionPrepPage key="prep" />,
      <ScientificFaqPage key="faq" />,
      <DataLineagePage key="lineage" />,
      <SecuritySettingsPage key="security-settings" />,
      <PrivacySettingsPage key="privacy-settings" />,
      <AnalyticsEnginePage key="analytics" />,
      <GeneticsPage key="genetics" />,
      <DiseasesPage key="diseases" />,
      <FamilyHistoryPage key="family-history" />,
      <ResearchPage key="research" />,
    ];

    pages.forEach((node) => {
      const { unmount } = render(
        <ThemeProvider>
          <AuthProvider>{node}</AuthProvider>
        </ThemeProvider>
      );
      unmount();
    });
  });

  it("renders Governance, Data Lineage & Clinical Support documentary pages cleanly OUTSIDE the dashboard", () => {
    const publicDocs = [
      <DocumentationPortalPage key="docs-hub" />,
      <PrivacyCharterPage key="privacy-charter" />,
      <TermsPage key="terms" />,
      <ZeroSalePledgePage key="zero-sale" />,
      <DataLineagePage key="lineage" />,
      <FindCounselorPage key="counselor" />,
      <DiscussionPrepPage key="prep" />,
      <ScientificFaqPage key="faq" />,
    ];

    publicDocs.forEach((node) => {
      const { unmount } = render(
        <ThemeProvider>
          <AuthProvider>{node}</AuthProvider>
        </ThemeProvider>
      );
      expect(screen.getByTestId("public-doc-shell")).toBeInTheDocument();
      expect(screen.queryByText(/^CLINICAL WORKSPACE$/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/^CONNECTED HEALTHCARE$/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/ICU Telemetry Node/i)).not.toBeInTheDocument();
      unmount();
    });

    // Verify Documentation Hub filtering across Governance, Data Lineage, Clinical Support
    render(
      <ThemeProvider>
        <AuthProvider>
          <DocumentationPortalPage />
        </AuthProvider>
      </ThemeProvider>
    );
    expect(screen.getAllByText(/Privacy Charter/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Kaggle Genomic Hub/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/NCBI ClinVar Citations/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Orphanet Database/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Find a Genetic Counselor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Doctor Discussion Prep/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Scientific FAQ/i).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText(/Search charters, ClinVar, FAQ/i), {
      target: { value: "Orphanet" },
    });
    expect(screen.getAllByText(/Orphanet Database/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Read Documentary/i)).toBeInTheDocument();
  });
});
