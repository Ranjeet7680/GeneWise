import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "@/lib/api";

describe("GeneWise API Client & Clinical Fallback Engine", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    api.clearToken();
    // Simulate cloud static preview where live backend host is unreachable -> verifies clinical fallback engine
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network unreachable")) as any;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("handles account registration, login, phone OTP send/verify, and PATCH /users/me profile updates", async () => {
    const regUser = await api.register({
      email: "ranjeet@medipredict.ai",
      password: "MedicalAI2026!",
      full_name: "Dr. Ranjeet Kumar",
      phone: "+91 9876543210",
      role: "clinician",
    });
    expect(regUser.full_name).toBe("Dr. Ranjeet Kumar");
    expect(regUser.phone_verified).toBe(true);

    const otpReq = await api.sendPhoneOTP({ phone: "+91 9876543210", country_code: "+91" });
    expect(otpReq.otp_preview).toMatch(/^\d{6}$/);
    expect(otpReq.expires_in).toBe(300);

    const verified = await api.verifyPhoneOTP({
      phone: "+91 9876543210",
      otp: otpReq.otp_preview,
      full_name: "Dr. Ranjeet Kumar",
      role: "clinician",
    });
    expect(verified.access_token).toBeTruthy();
    expect(verified.user.phone).toBe("+91 9876543210");
    expect(verified.user.phone_verified).toBe(true);

    const patched = await api.updateMe({
      full_name: "Dr. Ranjeet Vance",
      specialty: "Precision Genomic Lead",
      organization: "Apollo Genetics Center",
    });
    expect(patched.full_name).toBe("Dr. Ranjeet Vance");
    expect(patched.specialty).toBe("Precision Genomic Lead");

    const stored = JSON.parse(localStorage.getItem("medipredict_user") || "{}");
    expect(stored.full_name).toBe("Dr. Ranjeet Vance");

    await api.logout();
    expect(localStorage.getItem("medipredict_token")).toBeNull();
  });

  it("covers assistant, lab reports, health metrics, analytics, devices, ML risk, research, and admin endpoints", async () => {
    const providers = await api.getProviders();
    expect(providers.current_provider).toBe("clinical_evidence");

    const conversations = await api.listConversations();
    expect(conversations.length).toBeGreaterThan(0);

    const reports = await api.listReports();
    expect(Array.isArray(reports)).toBe(true);
    expect(reports.length).toBeGreaterThan(0);

    const metricsSummary = await api.getMetricsSummary();
    expect(Array.isArray(metricsSummary)).toBe(true);

    const overview = await api.getAnalyticsOverview();
    expect(overview.total_measurements).toBeGreaterThan(0);

    const devices = await api.listDevices();
    expect(devices.length).toBeGreaterThan(0);

    const agentRun = await api.runAgent("clinical_reasoning", "Evaluate BRCA1 family pedigree");
    expect(agentRun.status).toBe("completed");

    const risk = await api.predictRisk({
      age: 32,
      gender: "Female",
      diabetes: "Yes",
      diabetes_type: "Type 1",
      diarrhoea: "Yes",
      abdominal_pain: "Yes",
      short_stature: "No",
      sticky_stool: "No",
      weight_loss: "No",
      iga: 1.8,
      igg: 11.2,
      igm: 0.9,
    });
    expect(typeof risk.estimated_risk_probability).toBe("number");
    expect(risk.risk_level).toBeTruthy();
    expect(Array.isArray(risk.recommended_clinical_followup)).toBe(true);

    const models = await api.listMLModels();
    expect(models.length).toBeGreaterThan(0);

    const papers = await api.searchResearch("Celiac");
    expect(papers.length).toBeGreaterThan(0);
    expect(papers[0].title).toContain("Celiac");

    const adminStats = await api.getAdminStats();
    expect(adminStats.total_users).toBeGreaterThan(0);
  });

  it("attaches bearer Authorization headers and parses live HTTP 200 responses cleanly", async () => {
    api.setToken("live_test_token_999");
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ id: 10, gene_symbol: "BRCA1" }],
    }) as any;

    const genes = await api.listGenes("BRCA1");
    expect(genes).toEqual([{ id: 10, gene_symbol: "BRCA1" }]);

    const fetchCall = (globalThis.fetch as any).mock.calls[0];
    expect(fetchCall[0]).toContain("/genes?symbol=BRCA1");
    const headers: Headers = fetchCall[1].headers;
    expect(headers.get("Authorization")).toBe("Bearer live_test_token_999");
  });
});
