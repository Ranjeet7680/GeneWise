import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import GeneticsExplorerPage from "@/app/genetics/page";
import { setMockPathname } from "../vitest.setup";

function seedUser() {
  localStorage.setItem("medipredict_token", "demo_clinical_jwt_token_2026");
  const user = {
    id: 1,
    email: "clinician@medipredict.ai",
    full_name: "Dr. Ranjeet Kumar",
    role: "clinician",
    phone: "+91 9876543210",
    phone_verified: true,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem("medipredict_user", JSON.stringify(user));
  localStorage.setItem("medipredict_profile_overrides", JSON.stringify(user));
}

function renderGenetics() {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <GeneticsExplorerPage />
      </AuthProvider>
    </ThemeProvider>
  );
}

describe("Genes & Genetics Explorer Interactive Suite", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    seedUser();
    setMockPathname("/genetics");
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

  it("renders dynamic Spotlight, Re-index Log panel, 3D protein viewer modes & switches locus to TP53", async () => {
    renderGenetics();

    expect(screen.getByText(/Genes & Genetics Explorer/i)).toBeInTheDocument();
    expect(screen.getByText(/Showing 12 Curated Loci/i)).toBeInTheDocument();

    // Open Re-index Log inline panel (without browser alert)
    fireEvent.click(screen.getByRole("button", { name: /Re-index Log/i }));
    expect(await screen.findByText(/Genomic Index Pipeline Synchronized/i)).toBeInTheDocument();

    // Cycle 3D Protein Viewer mode Surface -> Wireframe -> Domain
    const surfaceBtn = screen.getByRole("button", { name: /^surface$/i });
    fireEvent.click(surfaceBtn);
    expect(screen.getByRole("button", { name: /^wireframe$/i })).toBeInTheDocument();

    // Switch Spotlight dynamically to TP53
    fireEvent.click(screen.getByRole("button", { name: "TP53" }));
    expect(await screen.findByText(/TP53 Pathogenicity Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/PDB: 2OCJ/i)).toBeInTheDocument();
  });

  it("supports search, chromosome pills, watchlist bookmarking, and multi-tab Gene Details modal", () => {
    renderGenetics();

    // Search for LDLR
    const searchInput = screen.getByPlaceholderText(/Search by gene symbol, locus, or condition/i);
    fireEvent.change(searchInput, { target: { value: "LDLR" } });
    expect(screen.getByText(/Showing 1 Curated Loci/i)).toBeInTheDocument();

    // Reset filter and open watchlist toggle
    fireEvent.click(screen.getByRole("button", { name: /^Reset$/i }));
    expect(screen.getByText(/Showing 12 Curated Loci/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Watchlist/i }));
    expect(screen.getByText(/Showing 2 Curated Loci/i)).toBeInTheDocument();

    // Toggle Watchlist off and inspect Gene Details Modal tabs
    fireEvent.click(screen.getByRole("button", { name: /Watchlist/i }));
    const detailButtons = screen.getAllByRole("button", { name: /View Gene Details & Variants/i });
    fireEvent.click(detailButtons[0]);

    expect(screen.getByRole("button", { name: /Pharmacogenomics & ML/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Pharmacogenomics & ML/i }));
    expect(screen.getByText(/Pharmacogenomics & Precision Therapy Actionability/i)).toBeInTheDocument();
  });

  it("filters ClinVar Curated Variant Evidence and opens Variant Inspector modal with ACMG & gnomAD data", () => {
    renderGenetics();

    // Filter ClinVar table to TP53
    const geneFilter = screen.getByLabelText("Filter variants by gene");
    fireEvent.change(geneFilter, { target: { value: "TP53" } });
    expect(screen.getByText(/1 \/ 10 Alleles/i)).toBeInTheDocument();

    // Inspect variant row
    fireEvent.click(screen.getByRole("button", { name: /^Inspect$/i }));
    expect(screen.getByText(/ACMG \/ AMP Classification Evidence Tags/i)).toBeInTheDocument();
    expect(screen.getByText(/gnomAD Population Ancestry Allele Frequency/i)).toBeInTheDocument();
    expect(screen.getByText(/CADD Phred/i)).toBeInTheDocument();
  });
});
