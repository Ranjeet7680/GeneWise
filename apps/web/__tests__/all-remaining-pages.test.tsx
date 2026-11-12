import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import LandingPage from "@/app/page";
import AdminPage from "@/app/admin/page";
import AssistantPage from "@/app/assistant/page";
import VoiceAssistantPage from "@/app/assistant/voice/page";
import ClinicianPage from "@/app/clinician/page";
import MLLabPage from "@/app/ml-lab/page";
import HealthMetricsPage from "@/app/health-metrics/page";
import RiskEducationPage from "@/app/risk-education/page";
import ReportsPage from "@/app/reports/page";
import RecordsPage from "@/app/records/page";
import NotificationsPage from "@/app/notifications/page";
import DevicesIotPage from "@/app/devices/iot/page";
import DevicesSensorsPage from "@/app/devices/sensors/page";
import DevicesWearablesPage from "@/app/devices/wearables/page";
import ForgotPasswordPage from "@/app/forgot-password/page";
import ResetPasswordPage from "@/app/reset-password/page";
import { setMockPathname } from "../vitest.setup";

function seedAdminAndClinician() {
  localStorage.setItem("medipredict_token", "demo_clinical_jwt_token_2026");
  const user = {
    id: 1,
    email: "admin@medipredict.ai",
    full_name: "Dr. Ranjeet Kumar",
    role: "admin",
    phone: "+91 9876543210",
    phone_verified: true,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem("medipredict_user", JSON.stringify(user));
  localStorage.setItem("medipredict_profile_overrides", JSON.stringify(user));
}

describe("Full Route & Interactive Feature Smoke Suite Across Remaining Platform Screens", () => {
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
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("renders Landing Page with Apple-style pedigree model switcher, synced user workspace CTA, Research & Our Team section, and removed Hero secondary buttons", () => {
    setMockPathname("/");
    seedAdminAndClinician();

    render(
      <ThemeProvider>
        <AuthProvider>
          <LandingPage />
        </AuthProvider>
      </ThemeProvider>
    );

    expect(screen.getByText(/Understand Your Family/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Started Free/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Open Workspace|Launch App/i).length).toBeGreaterThan(0);

    // Ensure removed Hero secondary buttons are absent
    expect(screen.queryByText(/Explore Disease Library/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Open Pedigree Tree/i)).not.toBeInTheDocument();

    // Verify Research & Our Team section, real team members, and category filter interaction
    expect(screen.getByText(/Clinical Research & Innovation Team/i)).toBeInTheDocument();
    expect(screen.getByText(/Meet Our Team Members/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sheet Access Restricted/i)).not.toBeInTheDocument();

    // Single-member spotlight showcase without the removed right-side vertical scroll roster
    expect(screen.getByTestId("team-spotlight-card")).toBeInTheDocument();
    expect(screen.getByTestId("team-cycle-timer")).toHaveTextContent(/10s Cycle/i);
    expect(screen.queryByTestId("team-right-scroll-rail")).not.toBeInTheDocument();
    expect(screen.queryByText(/Scroll Team Roster/i)).not.toBeInTheDocument();

    // 01 / 05 — Ranjeet Kumar
    expect(screen.getByText(/^01 \/ 05$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ranjeet Kumar/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Indian Institute of Technology, Roorkee/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("img", { name: /^Ranjeet Kumar$/i })).toHaveAttribute(
      "src",
      "/images/team/ranjeet.jpg"
    );

    const copyBtn = screen.getByRole("button", { name: /Copy email for Ranjeet Kumar/i });
    fireEvent.click(copyBtn);
    expect(screen.getByText(/^Copied$/i)).toBeInTheDocument();

    // 02 / 05 — Reetesh V portrait
    fireEvent.click(screen.getByRole("button", { name: /Next team member/i }));
    expect(screen.getByText(/^02 \/ 05$/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Reetesh V/i })).toHaveAttribute(
      "src",
      "/images/team/reetesh.jpg"
    );

    // 03 / 05 — Varunika B portrait & fallback gradient container
    fireEvent.click(screen.getByRole("button", { name: /Next team member/i }));
    expect(screen.getByText(/^03 \/ 05$/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Varunika B/i })).toHaveAttribute(
      "src",
      "/images/team/varunika.jpg"
    );
    const varunikaMonogram = screen.getByText(/^VB$/i);
    expect(varunikaMonogram.parentElement).toHaveStyle({
      background: "linear-gradient(135deg, #005a53 0%, #10b981 100%)",
    });

    // 04 / 05 — Andalamala Sumanth portrait
    fireEvent.click(screen.getByRole("button", { name: /Next team member/i }));
    expect(screen.getByText(/^04 \/ 05$/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Andalamala Sumanth/i })).toHaveAttribute(
      "src",
      "/images/team/sumanth.jpg"
    );

    // 05 / 05 — Select Shreya Kapoor directly from 01..05 sequence strip
    fireEvent.click(screen.getByRole("button", { name: /Select Shreya Kapoor/i }));
    expect(screen.getByText(/^05 \/ 05$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Indian Institute of Information Technology, Design and Manufacturing, Jabalpur/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^Shreya Kapoor$/i })).toHaveAttribute(
      "src",
      "/images/team/shreya.jpg"
    );

    // Open Shreya Kapoor's Team Member Pop Screen via Pop View button and close
    fireEvent.click(screen.getByRole("button", { name: /Pop View/i }));
    const dialogEl = screen.getByRole("dialog");
    expect(dialogEl).toBeInTheDocument();
    expect(dialogEl.parentElement).toBe(document.body);
    expect(dialogEl).toHaveClass("z-[9999]");
    expect(screen.getByRole("button", { name: /^Done$/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Done$/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Wraps cleanly from mem 5 back to mem 1 on Next team member
    fireEvent.click(screen.getByRole("button", { name: /Next team member/i }));
    expect(screen.getByText(/^01 \/ 05$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Engineering$/i }));
    expect(screen.getByRole("button", { name: /Select Varunika B/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Select Andalamala Sumanth/i })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /^All$/i })[1]);

    const sheetLink = screen.getByRole("link", { name: /Team Sheet/i });
    expect(sheetLink).toHaveAttribute(
      "href",
      expect.stringContaining("1IoJKBg_Okgdcn7B8LNajnW5CqoubK2oLOPiTZGZ4R94")
    );

    fireEvent.click(screen.getByRole("button", { name: /^Endocrinology$/i }));
    expect(screen.getAllByText(/Standards of Care in Diabetes/i).length).toBeGreaterThan(0);

    // Open Workstream Pop Screen, step to Track 02, and close
    const popBtns = screen.getAllByRole("button", { name: /Pop Screen/i });
    expect(popBtns.length).toBe(4);
    fireEvent.click(popBtns[0]);
    const workstreamDialog = screen.getByRole("dialog");
    expect(workstreamDialog).toBeInTheDocument();
    expect(workstreamDialog.parentElement).toBe(document.body);
    expect(workstreamDialog).toHaveClass("z-[9999]");
    expect(screen.getByText(/Verified System Capabilities/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Next Track/i }));
    expect(screen.getByText(/Routing Latency/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Close pop-up screen/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Switch pedigree model tabs on interactive hero widget if present
    const autosomalBtn = screen.queryByRole("button", { name: /Autosomal Dominant/i });
    if (autosomalBtn) {
      fireEvent.click(autosomalBtn);
    }
  });

  it("auto-cycles team spotlight every 10 seconds across mem 1 -> mem 2 -> ... -> mem 5 -> mem 1", () => {
    setMockPathname("/");
    vi.useFakeTimers();
    try {
      render(
        <ThemeProvider>
          <AuthProvider>
            <LandingPage />
          </AuthProvider>
        </ThemeProvider>
      );

      expect(screen.getByText(/^01 \/ 05$/i)).toBeInTheDocument();
      expect(screen.getByTestId("team-cycle-timer")).toHaveTextContent(/10s Cycle/i);
      expect(screen.getByTestId("team-cycle-timer")).toHaveTextContent(/Next in 10s/i);

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(screen.getByText(/^02 \/ 05$/i)).toBeInTheDocument();
      expect(screen.getByRole("img", { name: /Reetesh V/i })).toHaveAttribute(
        "src",
        "/images/team/reetesh.jpg"
      );

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(screen.getByText(/^03 \/ 05$/i)).toBeInTheDocument();
      expect(screen.getByRole("img", { name: /Varunika B/i })).toHaveAttribute(
        "src",
        "/images/team/varunika.jpg"
      );

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(screen.getByText(/^04 \/ 05$/i)).toBeInTheDocument();
      expect(screen.getByRole("img", { name: /Andalamala Sumanth/i })).toHaveAttribute(
        "src",
        "/images/team/sumanth.jpg"
      );

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(screen.getByText(/^05 \/ 05$/i)).toBeInTheDocument();
      expect(screen.getByRole("img", { name: /^Shreya Kapoor$/i })).toHaveAttribute(
        "src",
        "/images/team/shreya.jpg"
      );

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(screen.getByText(/^01 \/ 05$/i)).toBeInTheDocument();
      expect(screen.getByRole("img", { name: /^Ranjeet Kumar$/i })).toHaveAttribute(
        "src",
        "/images/team/ranjeet.jpg"
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("renders AI Assistant, Voice Assistant, Clinician Queue, Admin Portal, ML Lab, Health Metrics & Risk Education cleanly", () => {
    seedAdminAndClinician();

    const routes = [
      <AssistantPage key="assistant" />,
      <VoiceAssistantPage key="voice" />,
      <ClinicianPage key="clinician" />,
      <AdminPage key="admin" />,
      <MLLabPage key="ml-lab" />,
      <HealthMetricsPage key="health-metrics" />,
      <RiskEducationPage key="risk-education" />,
    ];

    routes.forEach((el) => {
      const { unmount } = render(
        <ThemeProvider>
          <AuthProvider>{el}</AuthProvider>
        </ThemeProvider>
      );
      unmount();
    });
  });

  it("renders Reports, Records, Notifications, IoT/Sensor/Wearable Devices & Password Recovery pages cleanly", () => {
    seedAdminAndClinician();

    const routes = [
      <ReportsPage key="reports" />,
      <RecordsPage key="records" />,
      <NotificationsPage key="notifications" />,
      <DevicesIotPage key="iot" />,
      <DevicesSensorsPage key="sensors" />,
      <DevicesWearablesPage key="wearables" />,
      <ForgotPasswordPage key="forgot" />,
      <ResetPasswordPage key="reset" />,
    ];

    routes.forEach((el) => {
      const { unmount } = render(
        <ThemeProvider>
          <AuthProvider>{el}</AuthProvider>
        </ThemeProvider>
      );
      unmount();
    });
  });
});
