import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import SecuritySettingsPage from "../app/settings/security/page";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

// Mock router and sound
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/settings/security",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/sound", () => ({
  sound: {
    playClick: vi.fn(),
    playSoft: vi.fn(),
    playPop: vi.fn(),
    playSuccess: vi.fn(),
    playWarning: vi.fn(),
    playAlert: vi.fn(),
    playChime: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  localStorage.setItem("medipredict_token", "demo_clinical_jwt_token_2026");
  const user = {
    id: 1,
    email: "demo@medipredict.ai",
    full_name: "Dr. Elena Rostova",
    role: "clinician",
    is_active: true,
    is_verified: true,
    mfa_enabled: true,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem("medipredict_user", JSON.stringify(user));
  localStorage.setItem("medipredict_profile_overrides", JSON.stringify(user));

  return render(
    <ThemeProvider>
      <AuthProvider>{ui}</AuthProvider>
    </ThemeProvider>
  );
}

describe("Security Architecture v2.0 — Settings & Sessions Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Security Governance page with compliance badges and statutory disclaimer", async () => {
    renderWithProviders(<SecuritySettingsPage />);

    expect(screen.getByText(/Zero-Trust Enterprise Security/i)).toBeInTheDocument();
    expect(screen.getByText(/Security & Session Governance/i)).toBeInTheDocument();
    expect(screen.getByText(/AES-256 GCM/i)).toBeInTheDocument();

    // Verbatim statutory disclaimer check
    expect(
      screen.getByText(/MediPredict AI provides educational genetic and family-history risk awareness/i)
    ).toBeInTheDocument();
  });

  it("renders Two-Factor Authentication (MFA / 2FA - RFC 6238 TOTP) section with interactive controls", async () => {
    renderWithProviders(<SecuritySettingsPage />);

    expect(screen.getByText(/Two-Factor Authentication \(MFA \/ 2FA - RFC 6238 TOTP\)/i)).toBeInTheDocument();
    const mfaToggle = screen.getByRole("button", { name: /Enable 2FA|Disable 2FA/i });
    expect(mfaToggle).toBeInTheDocument();
  });

  it("renders Active Authorized Login Sessions and allows termination", async () => {
    renderWithProviders(<SecuritySettingsPage />);

    expect(screen.getByText(/Active Authorized Login Sessions/i)).toBeInTheDocument();
    expect(screen.getByText(/Windows 11 Workstation/i)).toBeInTheDocument();

    // Check terminate button on non-current session
    const terminateBtn = screen.getByRole("button", { name: /Terminate/i });
    expect(terminateBtn).toBeInTheDocument();
    fireEvent.click(terminateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Session terminated immediately/i)).toBeInTheDocument();
    });
  });

  it("displays Tamper-Evident Security Audit Log sealed with HMAC SHA-256", () => {
    renderWithProviders(<SecuritySettingsPage />);

    expect(screen.getByText(/Tamper-Evident Security Audit Log/i)).toBeInTheDocument();
    expect(screen.getByText(/AUDIT INTEGRITY VERIFIED/i)).toBeInTheDocument();
    expect(screen.getByText(/JWT Bearer Session Issued/i)).toBeInTheDocument();
  });
});
