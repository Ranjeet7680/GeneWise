import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth";
import MediPredictLogo from "@/components/MediPredictLogo";
import ProfileSettingsPage from "@/app/settings/profile/page";
import { setMockPathname } from "../vitest.setup";

function AuthStateHarness() {
  const { user, workspaceBrand, updateProfile, switchRole, verifyAndBindPhone, resetWorkspaceDefaults } =
    useAuth();

  return (
    <div>
      <span data-testid="user-name">{user?.full_name || "none"}</span>
      <span data-testid="user-role">{user?.role || "none"}</span>
      <span data-testid="user-phone">{user?.phone || "none"}</span>
      <span data-testid="brand-name">{workspaceBrand.name}</span>
      <span data-testid="brand-logo">{workspaceBrand.logoKey}</span>
      <button onClick={() => switchRole("patient")}>Switch Patient</button>
      <button
        onClick={() =>
          updateProfile({
            full_name: "Dr. Ranjeet Sharma",
            workspace_name: "HelixCare Vault",
            workspace_logo_key: "dna",
          })
        }
      >
        Customize Account
      </button>
      <button onClick={() => verifyAndBindPhone("+91 9811122334", "772419")}>Bind Verified Phone</button>
      <button onClick={() => resetWorkspaceDefaults()}>Reset Brand</button>
    </div>
  );
}

describe("Account System, Profile Settings, Avatar & Workspace Logo Brand Customization", () => {
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

  it("supports role switching, custom profile overrides, verified phone binding, and brand reset in AuthProvider", async () => {
    localStorage.setItem("medipredict_token", "demo_token");
    localStorage.setItem(
      "medipredict_user",
      JSON.stringify({
        id: 1,
        email: "demo@medipredict.ai",
        full_name: "Dr. Elena Rostova",
        role: "clinician",
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
      })
    );

    setMockPathname("/settings/profile");

    render(
      <AuthProvider>
        <AuthStateHarness />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Dr. Elena Rostova");
    });

    fireEvent.click(screen.getByText("Customize Account"));
    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Dr. Ranjeet Sharma");
      expect(screen.getByTestId("brand-name")).toHaveTextContent("HelixCare Vault");
      expect(screen.getByTestId("brand-logo")).toHaveTextContent("dna");
    });

    fireEvent.click(screen.getByText("Bind Verified Phone"));
    await waitFor(() => {
      expect(screen.getByTestId("user-phone")).toHaveTextContent("+91 9811122334");
    });

    fireEvent.click(screen.getByText("Switch Patient"));
    await waitFor(() => {
      expect(screen.getByTestId("user-role")).toHaveTextContent("patient");
      expect(screen.getByTestId("user-name")).toHaveTextContent("Alex Rivera");
    });

    fireEvent.click(screen.getByText("Reset Brand"));
    await waitFor(() => {
      expect(screen.getByTestId("brand-name")).toHaveTextContent("GeneWise");
      expect(screen.getByTestId("brand-logo")).toHaveTextContent("pulse");
    });
  });

  it("renders MediPredictLogo dynamically with custom workspace brand name, badge, subtitle, and custom logo fallback", () => {
    const { rerender } = render(
      <MediPredictLogo
        overrideBrand={{
          name: "PrecisionMed Pro",
          subtitle: "Genomic Clinical Network",
          badge: "v3.0 ENTERPRISE",
          logoKey: "shield",
        }}
      />
    );

    expect(screen.getByText("PrecisionMed Pro")).toBeInTheDocument();
    expect(screen.getByText("Genomic Clinical Network")).toBeInTheDocument();
    expect(screen.getByText("v3.0 ENTERPRISE")).toBeInTheDocument();

    rerender(
      <MediPredictLogo
        overrideBrand={{
          name: "CustomClinic",
          logoKey: "custom",
          logoUrl: "/custom-brand.png",
        }}
      />
    );
    const logoImg = screen.getByAltText("CustomClinic");
    expect(logoImg).toHaveAttribute("src", "/custom-brand.png");
  });

  it("renders Profile & Brand Identity settings page, updates identity + brand logo, and verifies SMS phone inline", async () => {
    localStorage.setItem("medipredict_token", "demo_token");
    localStorage.setItem(
      "medipredict_user",
      JSON.stringify({
        id: 1,
        email: "demo@medipredict.ai",
        full_name: "Dr. Elena Rostova",
        role: "clinician",
        phone: "+1 (555) 019-2834",
        phone_verified: true,
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
      })
    );
    setMockPathname("/settings/profile");

    render(
      <AuthProvider>
        <ProfileSettingsPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Dr. Elena Rostova")).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText("e.g., Dr. Elena Rostova");
    fireEvent.change(nameInput, { target: { value: "Dr. Ranjeet Patel" } });

    const brandInput = screen.getByPlaceholderText("GeneWise");
    fireEvent.change(brandInput, { target: { value: "Apollo Genomics Studio" } });

    fireEvent.click(screen.getByText("Genomic Helix"));

    fireEvent.click(screen.getByRole("button", { name: /Save Profile & Brand Identity/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Account identity, avatar, and workspace brand logo updated/i)
      ).toBeInTheDocument();
    });

    const savedBrand = JSON.parse(localStorage.getItem("medipredict_workspace_brand") || "{}");
    expect(savedBrand.name).toBe("Apollo Genomics Studio");
    expect(savedBrand.logoKey).toBe("dna");

    // Inline SMS verification inside profile
    fireEvent.click(screen.getByRole("button", { name: /Verify via SMS OTP/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Auto-Fill & Bind/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Auto-Fill & Bind/i }));
    await waitFor(
      () => {
        expect(screen.getByText(/Verified and bound/i)).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });
});
