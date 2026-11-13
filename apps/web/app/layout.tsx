import "./globals.css";
import React from "react";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import MobileBottomNav from "@/components/MobileBottomNav";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#00635e",
};

export const metadata: Metadata = {
  title: "GeneWise · Genomic Health & Clinical Pedigree Literacy",
  description:
    "Curated clinical summaries, personalized heredity tracking, and evidence-grounded genetic education grounded in ClinVar and Kaggle open genomics.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#00635e" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground transition-colors duration-200 overflow-x-clip">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <MobileBottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
