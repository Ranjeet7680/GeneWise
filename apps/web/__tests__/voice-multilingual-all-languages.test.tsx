import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VoiceAssistantPage from "@/app/assistant/voice/page";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { api } from "@/lib/api";
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

describe("Voice Assistant — All 13 Indian Languages End-to-End Test Suite", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    seedUser();
    setMockPathname("/assistant/voice");
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    }
    // Mock speechSynthesis
    const mockSpeech = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn().mockReturnValue([
        { lang: "hi-IN", name: "Hindi Neural" },
        { lang: "ta-IN", name: "Tamil Neural" },
        { lang: "bn-IN", name: "Bengali Neural" },
        { lang: "te-IN", name: "Telugu Neural" },
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

    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Offline demo fallback")) as any;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("renders all 13 official Indian languages in the dialect ribbon", () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <VoiceAssistantPage />
        </ThemeProvider>
      </AuthProvider>
    );

    // Verify all 13 languages exist in dialect ribbon
    const expectedLanguages = [
      "हिन्दी", "বাংলা", "தமிழ்", "తెలుగు", "ಕನ್ನಡ", "മലയാളം",
      "मराठी", "ગુજરાતી", "ਪੰਜਾਬੀ", "ଓଡ଼ିଆ", "অসমীয়া", "اردو", "English"
    ];

    expectedLanguages.forEach((nativeName) => {
      expect(screen.getAllByText(nativeName).length).toBeGreaterThan(0);
    });
  });

  it("switches dialects across regional languages and updates subtitles and speech", async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <VoiceAssistantPage />
        </ThemeProvider>
      </AuthProvider>
    );

    // 1. Switch to Tamil (தமிழ்)
    const tamilBtn = screen.getByRole("button", { name: /தமிழ்/i });
    fireEvent.click(tamilBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/வணக்கம்! நான் உங்கள் GeneWise AI குரல் உதவியாளர்/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Tamil/i).length).toBeGreaterThan(0);
    });

    // 2. Switch to Bengali (বাংলা)
    const bengaliBtn = screen.getByRole("button", { name: /বাংলা/i });
    fireEvent.click(bengaliBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/নমস্কার! আমি আপনার GeneWise AI ভয়েস সহকারী/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Bengali/i).length).toBeGreaterThan(0);
    });

    // 3. Switch to Telugu (తెలుగు)
    const teluguBtn = screen.getByRole("button", { name: /తెలుగు/i });
    fireEvent.click(teluguBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/నమస్కారం! నేను మీ GeneWise AI వాయిస్ అసిస్టెంట్‌ని/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Telugu/i).length).toBeGreaterThan(0);
    });

    // 4. Switch to Kannada (ಕನ್ನಡ)
    const kannadaBtn = screen.getByRole("button", { name: /ಕನ್ನಡ/i });
    fireEvent.click(kannadaBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ GeneWise AI ಧ್ವನಿ ಸಹಾಯಕ/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Kannada/i).length).toBeGreaterThan(0);
    });
  });

  it("processes voice query and returns full native responses across different languages", async () => {
    // Test api fallback directly for Tamil
    const taRes = await api.processVoiceQuery("Check my blood pressure and vitals", "ta-IN");
    expect(taRes.detected_language).toBe("ta-IN");
    expect(taRes.subtitles.native).toContain("இரத்த அழுத்தம்");
    expect(taRes.subtitles.english).toContain("122/78 mmHg");
    expect(taRes.lstm_biomarker).toBe("systolic_bp");

    // Test api fallback directly for Bengali
    const bnRes = await api.processVoiceQuery("Explain my blood report and cbc", "bn-IN");
    expect(bnRes.detected_language).toBe("bn-IN");
    expect(bnRes.subtitles.native).toContain("রক্তের রিপোর্ট");
    expect(bnRes.subtitles.english).toContain("Hemoglobin is 14.2 g/dL");

    // Test Emergency query in Telugu
    const teEmerg = await api.processVoiceQuery("Chest pain and severe breathless", "te-IN");
    expect(teEmerg.is_emergency).toBe(true);
    expect(teEmerg.subtitles.native).toContain("అత్యవసర పరిస్థితి");
    expect(teEmerg.tools_executed).toContain("STAT Emergency Dispatch Protocol (112/108)");

    // Test Bi-LSTM velocity query in Marathi
    const mrLstm = await api.processVoiceQuery("Show Bi-LSTM 90d forecast velocity", "mr-IN");
    expect(mrLstm.lstm_biomarker).toBe("hba1c");
    expect(mrLstm.subtitles.native).toContain("Bi-LSTM");
    expect(mrLstm.subtitles.native).toContain("90 दिवसांत");
  });

  it("renders Bi-LSTM trajectory and gate weights seamlessly when inquiring in regional dialect", async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <VoiceAssistantPage />
        </ThemeProvider>
      </AuthProvider>
    );

    // Switch to Tamil
    fireEvent.click(screen.getByText("தமிழ்"));

    // Trigger Bi-LSTM HbA1c scenario
    const lstmBtn = screen.getByText(/Bi-LSTM 90d HbA1c Velocity/i);
    fireEvent.click(lstmBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Bi-LSTM Sequence Forecast/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/90-Day Projection/i)).toBeInTheDocument();
      expect(screen.getByText(/Velocity Rate/i)).toBeInTheDocument();
    });
  });
});
