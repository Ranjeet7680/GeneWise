import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/lib/auth";
import AuthPortal from "@/components/AuthPortal";
import WorkspaceTransitionLoader from "@/components/WorkspaceTransitionLoader";
import { mockPush, setMockPathname } from "../vitest.setup";

describe("Phone Authentication -> SMS OTP -> Animated Loading -> Dashboard Flow", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    setMockPathname("/login");
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Offline demo fallback")) as any;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("renders WorkspaceTransitionLoader stages smoothly for phone login and updates progress", async () => {
    render(
      <WorkspaceTransitionLoader
        isOpen={true}
        mode="phone"
        userName="Dr. Ranjeet Kumar"
        userRole="clinician"
        phone="+1 (555) 019-2834"
        workspaceName="GeneWise"
      />
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/Preparing GeneWise/i)).toBeInTheDocument();
    expect(screen.getByText("Dr. Ranjeet Kumar")).toBeInTheDocument();
    expect(screen.getByText("+1 (555) 019-2834")).toBeInTheDocument();
    expect(screen.getByText("Carrier SMS & 6-Digit OTP Verified")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText("100%")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("completes manual OTP validation error shake then verifies OTP -> animated loading overlay -> redirects to /dashboard", async () => {
    render(
      <AuthProvider>
        <AuthPortal initialTab="login" />
      </AuthProvider>
    );

    // Quick switch to Patient, then customize display name
    fireEvent.click(screen.getByRole("button", { name: /Patient/i }));
    const phoneInput = screen.getByPlaceholderText("(555) 019-2834") as HTMLInputElement;
    expect(phoneInput.value).toContain("8822");

    // Set custom dashboard greeting name
    const nameOverride = screen.getByPlaceholderText(/Leave blank for/i);
    fireEvent.change(nameOverride, { target: { value: "Ranjeet Test User" } });

    // Disable auto-fill briefly so we can assert manual wrong OTP validation + SMS Auto-Fill
    const autoFillToggle = screen.getByRole("checkbox");
    fireEvent.click(autoFillToggle);
    expect(autoFillToggle).not.toBeChecked();

    // Send 6-Digit OTP
    fireEvent.click(screen.getByRole("button", { name: /Send 6-Digit OTP Code/i }));

    await waitFor(() => {
      expect(screen.getByText("Enter 6-Digit Verification Code")).toBeInTheDocument();
    });

    // Type an incorrect 6-digit code ("000000") and verify shake / mismatch feedback
    for (let i = 1; i <= 6; i++) {
      const box = screen.getByLabelText(`OTP digit ${i}`);
      fireEvent.change(box, { target: { value: "0" } });
    }

    await waitFor(() => {
      expect(screen.getByText(/Verification code mismatch/i)).toBeInTheDocument();
    });

    // Now click 1-tap Auto-Fill -> plays OTP pop -> triggers WorkspaceTransitionLoader -> redirects to /dashboard
    fireEvent.click(screen.getByRole("button", { name: /Auto-Fill/i }));

    await waitFor(
      () => {
        expect(screen.getByRole("status")).toBeInTheDocument();
        expect(screen.getByText("Carrier SMS & 6-Digit OTP Verified")).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      },
      { timeout: 4000 }
    );

    const savedUser = JSON.parse(localStorage.getItem("medipredict_user") || "{}");
    expect(savedUser.full_name).toBe("Ranjeet Test User");
    expect(savedUser.phone_verified).toBe(true);
  });

  it("validates mandatory ethical checkboxes on Create Account and allows full signup to /dashboard", async () => {
    setMockPathname("/register");

    render(
      <AuthProvider>
        <AuthPortal initialTab="register" />
      </AuthProvider>
    );

    // Attempt submit without consents
    fireEvent.click(screen.getByRole("button", { name: /Create Account & Open Dashboard/i }));
    expect(
      screen.getByText(/Please confirm both mandatory ethical and non-diagnostic acknowledgements/i)
    ).toBeInTheDocument();

    // Fill Display Name, confirm password, tick mandatory checkboxes
    fireEvent.change(screen.getByPlaceholderText(/HelixExplorer|Dr\. Ranjeet Kumar/i), {
      target: { value: "Maya Clinical" },
    });
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    fireEvent.click(screen.getByRole("button", { name: /Create Account & Open Dashboard/i }));

    await waitFor(
      () => {
        expect(screen.getByText(/Creating Encrypted Account Identity/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      },
      { timeout: 4000 }
    );
  });
});
