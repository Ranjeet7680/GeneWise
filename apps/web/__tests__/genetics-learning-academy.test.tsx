import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import AcademyHubPage from "@/app/academy/page";
import CourseOverviewPage from "@/app/academy/course/[courseId]/page";
import LessonPlayerPage from "@/app/academy/course/[courseId]/lesson/[lessonId]/page";
import VirtualLabsPage from "@/app/academy/labs/page";
import CertificatePage from "@/app/academy/certificates/[certificateId]/page";
import VerifyCertificatePage from "@/app/verify-certificate/page";
import MyCoursesAndCertificatesPage from "@/app/academy/my-courses/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/academy",
  useParams: () => ({
    courseId: "course-01-genetics-fundamentals",
    lessonId: "c1-ch1-l1",
    certificateId: "GW-CERT-2026-MENDEL02",
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "id" ? "GW-CERT-2026-MENDEL02" : null),
  }),
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

describe("Genetics Learning Academy & Certificate System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders Academy Hub with curriculum catalog, metrics and statutory disclaimer", async () => {
    renderWithProviders(<AcademyHubPage />);

    // Check title & branding
    expect(
      screen.getByText(/Master Human Genomics, Pedigree Analysis & Clinical Classification/i)
    ).toBeInTheDocument();

    // Check statutory notice
    expect(
      screen.getByText(/Statutory Clinical & Educational Transparency/i)
    ).toBeInTheDocument();

    // Wait for courses to load
    await waitFor(() => {
      expect(
        screen.getAllByText("Genetics Fundamentals: DNA, Genes & Chromosomes").length
      ).toBeGreaterThan(0);
      expect(screen.getAllByText("GEN-101").length).toBeGreaterThan(0);
    });
  });

  it("filters courses when clicking category tabs", async () => {
    renderWithProviders(<AcademyHubPage />);

    await waitFor(() => {
      expect(screen.getAllByText("GEN-101").length).toBeGreaterThan(0);
    });

    // Click "Inheritance Models" tab
    const inheritanceTab = screen.getByRole("button", { name: "Inheritance Models" });
    fireEvent.click(inheritanceTab);

    await waitFor(() => {
      expect(
        screen.getAllByText("Dominant vs. Recessive: How Traits Traverse Generations").length
      ).toBeGreaterThan(0);
      expect(screen.getAllByText("GEN-102").length).toBeGreaterThan(0);
    });
  });

  it("renders Course Overview Syllabus with chapters and lessons", async () => {
    renderWithProviders(<CourseOverviewPage />);

    await waitFor(() => {
      expect(
        screen.getAllByText("Genetics Fundamentals: DNA, Genes & Chromosomes").length
      ).toBeGreaterThan(0);
      expect(screen.getByText(/Detailed Course Syllabus & Curriculum/i)).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive Course Final Examination/i)).toBeInTheDocument();
    });
  });

  it("renders Multimedia Course Player with written lesson content, objectives, and clinical pearls", async () => {
    renderWithProviders(<LessonPlayerPage />);

    await waitFor(() => {
      expect(
        screen.getAllByText("The Genetic Architecture of the Human Body").length
      ).toBeGreaterThan(0);
      expect(screen.getByText(/Learning Objectives/i)).toBeInTheDocument();
      expect(screen.getByText(/Key Scientific Takeaways/i)).toBeInTheDocument();
      expect(screen.getByText(/Clinical Practice Pearls/i)).toBeInTheDocument();
    });

    // Check tabs
    expect(screen.getByText("Video Lecture")).toBeInTheDocument();
    expect(screen.getByText("3D Animation")).toBeInTheDocument();
    expect(screen.getByText("Audio Lecture")).toBeInTheDocument();
  });

  it("renders 10 Virtual Genetics Laboratories and runs interactive DNA simulation", async () => {
    renderWithProviders(<VirtualLabsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/10 Virtual Genetics Laboratories/i)
      ).toBeInTheDocument();
      expect(screen.getAllByText("LAB-DNA-01").length).toBeGreaterThan(0);
      expect(screen.getAllByText("LAB-PUN-02").length).toBeGreaterThan(0);
      expect(screen.getAllByText("LAB-VAR-05").length).toBeGreaterThan(0);
    });
  });

  it("renders official Certificate of Completion with required statutory notice and verification", async () => {
    renderWithProviders(<CertificatePage />);

    await waitFor(() => {
      expect(screen.getByText("Certificate of Completion")).toBeInTheDocument();
      expect(screen.getByText(/Priya Sharma/i)).toBeInTheDocument();
      expect(
        screen.getAllByText("Dominant vs. Recessive: How Traits Traverse Generations").length
      ).toBeGreaterThan(0);
      expect(screen.getAllByText(/GW-CERT-2026-MENDEL02/i).length).toBeGreaterThan(0);
      expect(
        screen.getByText(/not a medical license, professional genetic counselling qualification/i)
      ).toBeInTheDocument();
    });
  });

  it("validates certificate on Public Verification Portal", async () => {
    renderWithProviders(<VerifyCertificatePage />);

    await waitFor(() => {
      expect(
        screen.getByText("Verify GeneWise AI Certificate")
      ).toBeInTheDocument();
      expect(screen.getByText(/Certificate Verified Authentic/i)).toBeInTheDocument();
      expect(screen.getByText("Priya Sharma")).toBeInTheDocument();
    });
  });

  it("renders My Courses and Certificates Learner Dashboard", async () => {
    renderWithProviders(<MyCoursesAndCertificatesPage />);

    await waitFor(() => {
      expect(
        screen.getByText("My Genetics Learning Dashboard")
      ).toBeInTheDocument();
      expect(screen.getByText(/Enrolled Courses/i)).toBeInTheDocument();
      expect(screen.getByText(/Learning Streak/i)).toBeInTheDocument();
      expect(
        screen.getAllByText("Dominant vs. Recessive: How Traits Traverse Generations").length
      ).toBeGreaterThan(0);
    });
  });
});
