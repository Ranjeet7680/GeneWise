import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import FindCounselorPage from "@/app/clinical-support/find-counselor/page";
import DoctorPrepWizardModal from "@/components/DoctorPrepWizardModal";
import CounselorDetailModal from "@/components/CounselorDetailModal";
import CounselorBookingModal from "@/components/CounselorBookingModal";
import { DEMO_COUNSELORS } from "@/lib/counselor-demo-data";
import { api } from "@/lib/api";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/clinical-support/find-counselor",
}));

// Mock sound effects
vi.mock("@/lib/sound", () => ({
  sound: {
    playClick: vi.fn(),
    playSoft: vi.fn(),
    playPop: vi.fn(),
    playSuccess: vi.fn(),
    playChime: vi.fn(),
    playAlert: vi.fn(),
    playWarning: vi.fn(),
    playEmergency: vi.fn(),
    playHeartbeat: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </AuthProvider>
  );
}

describe("Counselor Discovery & Clinical Support Network", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders counselor directory with verified demonstration specialists", async () => {
    renderWithProviders(<FindCounselorPage />);

    expect(
      screen.getByText("Find a Licensed Genetic Counselor")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Connect with verified clinical genetic counselors/i)
    ).toBeInTheDocument();

    // Check Dr. Maya Lin and Dr. Aaron Vance from screenshot
    expect(screen.getByText("Dr. Maya Lin, MS, CGC")).toBeInTheDocument();
    expect(screen.getByText("Dr. Aaron Vance, MS, CGC")).toBeInTheDocument();
  });

  it("filters counselors by specialty pills", async () => {
    renderWithProviders(<FindCounselorPage />);

    const cardioButton = screen.getByRole("button", { name: "Cardiogenetics" });
    fireEvent.click(cardioButton);

    // Dr. Maya Lin specializes in Cardiogenetics
    expect(screen.getByText("Dr. Maya Lin, MS, CGC")).toBeInTheDocument();
    // Dr. Aaron Vance is Pediatric
    expect(screen.queryByText("Dr. Aaron Vance, MS, CGC")).not.toBeInTheDocument();
  });

  it("filters counselors by target gene locus chip (e.g. BRCA1)", async () => {
    renderWithProviders(<FindCounselorPage />);

    // Get the first BRCA1 button, which is the filter chip at the top
    const brcaChips = screen.getAllByRole("button", { name: "BRCA1" });
    fireEvent.click(brcaChips[0]);

    // Elena Rostova targets BRCA1
    expect(screen.getByText("Elena Rostova, MS, CGC")).toBeInTheDocument();
    // Dr. Maya Lin targets FBN1/LDLR, not BRCA1
    expect(screen.queryByText("Dr. Maya Lin, MS, CGC")).not.toBeInTheDocument();
  });

  it("opens counselor profile modal and displays clinical sections A-E", async () => {
    const counselor = DEMO_COUNSELORS[0]; // Dr. Maya Lin
    const onClose = vi.fn();
    const onRequestBooking = vi.fn();

    renderWithProviders(
      <CounselorDetailModal
        counselor={counselor}
        isOpen={true}
        onClose={onClose}
        onRequestBooking={onRequestBooking}
      />
    );

    expect(screen.getByText("Board-Verified Counselor Profile")).toBeInTheDocument();
    expect(screen.getAllByText("Dr. Maya Lin, MS, CGC").length).toBeGreaterThan(0);

    // Section A Overview
    expect(screen.getByText("Stanford Center for Inherited Cardiovascular Disease")).toBeInTheDocument();

    // Switch to Section B Specializations
    const specTab = screen.getByRole("button", { name: "B. Specializations & Loci" });
    fireEvent.click(specTab);
    expect(screen.getByText("Target Gene Loci & Molecular Pathways")).toBeInTheDocument();
    expect(screen.getByText("FBN1")).toBeInTheDocument();

    // Switch to Section D Consultation & Fees
    const consultTab = screen.getByRole("button", { name: "D. Consultation & Fees" });
    fireEvent.click(consultTab);
    expect(screen.getByText(/Financial Transparency & Insurance Coverage/i)).toBeInTheDocument();

    // Switch to Section E Credentials & Licensing
    const credTab = screen.getByRole("button", { name: "E. Credentials & Licensing" });
    fireEvent.click(credTab);
    expect(screen.getByText("Primary Regulatory Registration")).toBeInTheDocument();
    expect(screen.getByText("CGC-49102")).toBeInTheDocument();
  });

  it("submits appointment booking request and displays confirmation with telehealth room link", async () => {
    const counselor = DEMO_COUNSELORS[0];
    const onClose = vi.fn();
    const onBookingComplete = vi.fn();

    renderWithProviders(
      <CounselorBookingModal
        counselor={counselor}
        isOpen={true}
        onClose={onClose}
        onBookingComplete={onBookingComplete}
      />
    );

    expect(screen.getByText(`Schedule with ${counselor.name}`)).toBeInTheDocument();

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /Confirm & Transmit Request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Clinical Consultation Intake Transmitted")).toBeInTheDocument();
    });

    expect(screen.getByText(/meet.genewise.ai\/telehealth\/cgc-/i)).toBeInTheDocument();
  });

  it("walks through 5-step AI Doctor Prep Wizard and generates synthesized brief", async () => {
    const onClose = vi.fn();

    renderWithProviders(
      <DoctorPrepWizardModal
        isOpen={true}
        onClose={onClose}
        initialCounselor={DEMO_COUNSELORS[0]}
      />
    );

    expect(screen.getByText("Step 1: Select Your Primary Clinical Category")).toBeInTheDocument();

    // Step 1: Click Continue
    const continueBtn = screen.getByRole("button", { name: /Continue/i });
    fireEvent.click(continueBtn);

    // Step 2: Family History
    expect(screen.getByText("Step 2: Multi-Generational Family Health Tree")).toBeInTheDocument();
    const continueBtn2 = screen.getByRole("button", { name: /Continue/i });
    fireEvent.click(continueBtn2);

    // Step 3: Biomarkers & Genes
    expect(screen.getByText("Step 3: Gene Loci & Prior Test Reports")).toBeInTheDocument();
    const generateBtn = screen.getByRole("button", { name: /Generate AI Consultation Brief/i });
    fireEvent.click(generateBtn);

    // Step 4: AI Brief Synthesis
    await waitFor(() => {
      expect(screen.getByText(/Clinical Discussion Guide/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Top 5 High-Yield Questions to Ask Your Counselor/i)).toBeInTheDocument();

    // Step 5: Follow-Up & Booking
    const followUpBtn = screen.getByRole("button", { name: /Proceed to Follow-Up & Booking/i });
    fireEvent.click(followUpBtn);

    expect(screen.getByText(/Step 5: Professional Follow-Up & Counselor Connection/i)).toBeInTheDocument();
  });
});
