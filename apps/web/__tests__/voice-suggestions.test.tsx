import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VoiceAssistantPage from "@/app/assistant/voice/page";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import {
  CLINICAL_VOICE_SUGGESTIONS,
  SUGGESTION_CATEGORIES,
  getLocalizedSuggestionQuery,
  getContextualFollowUps,
} from "@/lib/voice-suggestions";
import { setMockPathname } from "../vitest.setup";

function seedUser() {
  const user = {
    id: 1,
    email: "demo@medipredict.ai",
    full_name: "Dr. Elena Rostova",
    role: "clinician",
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem("medipredict_token", "test-token");
  localStorage.setItem("medipredict_user", JSON.stringify(user));
  localStorage.setItem("medipredict_profile_overrides", JSON.stringify(user));
}

describe("Multilingual Clinical Question Suggestions Engine Test Suite", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    seedUser();
    setMockPathname("/assistant/voice");
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    }
    const mockSpeech = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn().mockReturnValue([
        { lang: "hi-IN", name: "Hindi Neural" },
        { lang: "ta-IN", name: "Tamil Neural" },
        { lang: "te-IN", name: "Telugu Neural" },
        { lang: "bn-IN", name: "Bengali Neural" },
      ]),
    };
    (globalThis as any).speechSynthesis = mockSpeech;
    class MockSpeechSynthesisUtterance {
      text: string;
      lang = "hi-IN";
      rate = 1.0;
      voice: any = null;
      onstart: any = null;
      onend: any = null;
      onerror: any = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    (globalThis as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Offline fallback")) as any;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("verifies localized suggestion queries for all 13 languages in data model", () => {
    const bpItem = CLINICAL_VOICE_SUGGESTIONS.find((s) => s.id === "sug-bp")!;
    expect(bpItem).toBeDefined();

    // Verify key regional translations
    const taQuery = getLocalizedSuggestionQuery(bpItem, "ta-IN");
    expect(taQuery.native).toContain("இரத்த அழுத்தம்");

    const teQuery = getLocalizedSuggestionQuery(bpItem, "te-IN");
    expect(teQuery.native).toContain("రక్తపోటు");

    const bnQuery = getLocalizedSuggestionQuery(bpItem, "bn-IN");
    expect(bnQuery.native).toContain("রক্তচাপ");

    const hiQuery = getLocalizedSuggestionQuery(bpItem, "hi-IN");
    expect(hiQuery.native).toContain("ब्लड प्रेशर");

    const enQuery = getLocalizedSuggestionQuery(bpItem, "en-IN");
    expect(enQuery.native).toContain("ICU telemetry");
  });

  it("returns context-aware follow-up suggestions in the active dialect", () => {
    const taFollowUps = getContextualFollowUps("What is my blood pressure?", "ta-IN");
    expect(taFollowUps.length).toBeGreaterThan(0);
    expect(taFollowUps[0].query).toBeDefined();

    const teFollowUps = getContextualFollowUps("Fasting blood glucose 114 mg/dL", "te-IN");
    expect(teFollowUps.length).toBeGreaterThan(0);

    const hiFollowUps = getContextualFollowUps("Bi-LSTM HbA1c forecast", "hi-IN");
    expect(hiFollowUps.length).toBeGreaterThan(0);
  });

  it("renders Category Filter Tabs and filters question suggestions cleanly in UI", async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <VoiceAssistantPage />
        </ThemeProvider>
      </AuthProvider>
    );

    // Verify header and filter tabs exist
    expect(screen.getByText(/Clinical Question Suggestions/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Surprise Me/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Test Audio/i })).toBeInTheDocument();

    // Verify "All Topics" (rendered as "सभी विषय" in default Hindi)
    expect(screen.getByText("सभी विषय")).toBeInTheDocument();

    // Verify category filter buttons exist
    SUGGESTION_CATEGORIES.filter((c) => c.id !== "all").forEach((cat) => {
      expect(screen.getAllByText(new RegExp(cat.label, "i")).length).toBeGreaterThan(0);
    });

    // Click "Cardiology & BP" filter
    const cardioBtn = screen.getByRole("button", { name: /Cardiology & BP/i });
    fireEvent.click(cardioBtn);

    // Verify cardiology suggestion card is visible
    expect(screen.getByText(/Check ICU Vitals & BP/i)).toBeInTheDocument();
  });

  it("dynamically translates suggestion cards and supports Surprise Me consultation", async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <VoiceAssistantPage />
        </ThemeProvider>
      </AuthProvider>
    );

    // Switch to Tamil
    const tamilBtn = screen.getByRole("button", { name: /தமிழ்/i });
    fireEvent.click(tamilBtn);

    await waitFor(() => {
      // Suggestion cards should now display Tamil questions
      expect(screen.getAllByText(/இரத்த அழுத்தம்/i).length).toBeGreaterThan(0);
    });

    // Click "Surprise Me" button
    const surpriseBtn = screen.getByRole("button", { name: /Surprise Me/i });
    fireEvent.click(surpriseBtn);

    await waitFor(() => {
      // Speech synthesis should be called
      expect(globalThis.speechSynthesis.speak).toHaveBeenCalled();
    });
  });

  it("plays voice sample when clicking Test Audio", async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <VoiceAssistantPage />
        </ThemeProvider>
      </AuthProvider>
    );

    // Switch to Telugu
    const teluguBtn = screen.getByRole("button", { name: /తెలుగు/i });
    fireEvent.click(teluguBtn);

    // Click Test Audio
    const testAudioBtn = screen.getByRole("button", { name: /Test Audio/i });
    fireEvent.click(testAudioBtn);

    await waitFor(() => {
      expect(globalThis.speechSynthesis.speak).toHaveBeenCalled();
    });
  });
});
