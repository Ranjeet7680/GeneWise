import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { ThemeProvider, useTheme } from "@/lib/theme";
import ClinicalChartTooltip, { toBrightTooltipAccent } from "@/components/ClinicalChartTooltip";
import UserAvatar, {
  AVATAR_COLOR_PRESETS,
  CLINICAL_AVATAR_PRESETS,
  getInitials,
} from "@/components/UserAvatar";

function ThemeHarness() {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-name">{theme}</span>
      <span data-testid="theme-dark">{String(isDark)}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme("dark")}>Force Dark</button>
    </div>
  );
}

describe("Core Utilities, Theme, Sound Engine & UserAvatar", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  describe("lib/utils.ts", () => {
    it("merges tailwind and conditional classes cleanly with cn()", () => {
      expect(cn("px-2 py-1", "px-4", false && "hidden", "text-sm")).toBe("py-1 px-4 text-sm");
    });

    it("formats ISO dates and handles missing inputs gracefully", () => {
      expect(formatDate(undefined)).toBe("N/A");
      expect(formatDate("2026-11-11T10:00:00.000Z")).toContain("Nov");
      expect(formatDateTime(undefined)).toBe("N/A");
      expect(formatDateTime("2026-11-11T10:30:00.000Z")).toContain("Nov");
    });
  });

  describe("lib/sound.ts", () => {
    it("toggles mute preference cleanly and plays clinical sound feedback without errors", () => {
      const initial = sound.muted;
      const toggled = sound.toggleMute();
      expect(toggled).toBe(!initial);
      expect(localStorage.getItem("mp_audio_muted")).toBe(toggled ? "true" : "false");

      if (toggled) {
        sound.toggleMute();
      }
      expect(() => {
        sound.playClick();
        sound.playSoft();
        sound.playPop();
        sound.playSuccess();
        sound.playChime();
        sound.playAlert();
        sound.playWarning();
        sound.playEmergency();
      }).not.toThrow();
    });
  });

  describe("lib/theme.tsx", () => {
    it("resolves theme, toggles dark class on documentElement, and persists preference", () => {
      render(
        <ThemeProvider>
          <ThemeHarness />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme-dark")).toHaveTextContent("false");
      fireEvent.click(screen.getByText("Toggle Theme"));

      expect(screen.getByTestId("theme-name")).toHaveTextContent("dark");
      expect(screen.getByTestId("theme-dark")).toHaveTextContent("true");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(localStorage.getItem("theme")).toBe("dark");
    });
  });

  describe("components/UserAvatar.tsx", () => {
    it("computes initials across single, double, multi-word, and empty names", () => {
      expect(getInitials("Dr. Elena Rostova")).toBe("DR");
      expect(getInitials("Maya Patel")).toBe("MP");
      expect(getInitials("GeneWise")).toBe("GE");
      expect(getInitials(undefined)).toBe("GW");
    });

    it("provides preset clinical avatars and color palettes", () => {
      expect(CLINICAL_AVATAR_PRESETS.length).toBeGreaterThanOrEqual(4);
      expect(Object.keys(AVATAR_COLOR_PRESETS)).toEqual(
        expect.arrayContaining(["teal", "emerald", "indigo", "sky", "slate"])
      );
    });

    it("renders monogram when avatarUrl is empty and falls back cleanly on image error", () => {
      const { rerender } = render(<UserAvatar name="Ranjeet Kumar" avatarColor="indigo" size="lg" />);
      expect(screen.getByText("RK")).toBeInTheDocument();

      rerender(<UserAvatar name="Ranjeet Kumar" avatarUrl="/broken-path.png" size="md" verified={true} />);
      const img = screen.getByAltText("Ranjeet Kumar");
      fireEvent.error(img);
      expect(screen.getByText("RK")).toBeInTheDocument();
    });
  });

  describe("components/ClinicalChartTooltip.tsx", () => {
    it("brightens dark hex series colors and renders high-contrast labels and readings", () => {
      expect(toBrightTooltipAccent("#00635e")).toBe("#2dd4bf");
      expect(toBrightTooltipAccent("#7c3aed")).toBe("#a78bfa");

      const { container } = render(
        <ClinicalChartTooltip
          active={true}
          label="Thu"
          payload={[
            {
              dataKey: "systolic",
              name: "Systolic BP (mmHg)",
              value: 126,
              color: "#00635e",
            },
            {
              dataKey: "diastolic",
              name: "Diastolic BP (mmHg)",
              value: 81,
              color: "#38bdf8",
            },
          ]}
        />
      );

      expect(screen.getByText("Thu")).toBeInTheDocument();
      expect(screen.getByText("Systolic BP (mmHg)")).toBeInTheDocument();
      expect(screen.getByText("126")).toBeInTheDocument();
      expect(screen.getByText("Diastolic BP (mmHg)")).toBeInTheDocument();
      expect(screen.getByText("81")).toBeInTheDocument();

      // Label uses bright slate-200 instead of low-contrast dark teal ink
      expect(screen.getByText("Systolic BP (mmHg)")).toHaveClass("text-slate-200");
      expect(screen.getByText("126")).toHaveClass("text-white");
      expect(container.querySelector('[style*="rgb(45, 212, 191)"]')).toBeTruthy();
    });
  });
});
