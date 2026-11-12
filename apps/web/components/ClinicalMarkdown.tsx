"use client";

import React from "react";
import { Sparkles, CheckCircle, ChevronRight } from "lucide-react";

interface ClinicalMarkdownProps {
  content: string;
  className?: string;
}

export default function ClinicalMarkdown({ content, className = "" }: ClinicalMarkdownProps) {
  if (!content) return null;

  // Split into lines
  const lines = content.split("\n");

  const parseInline = (text: string): React.ReactNode[] => {
    // Regex matches **bold**, *italic*, `code`
    const tokens: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts = text.split(regex);

    parts.forEach((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        tokens.push(
          <strong key={i} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith("*") && part.endsWith("*")) {
        tokens.push(
          <em key={i} className="italic text-foreground/90">
            {part.slice(1, -1)}
          </em>
        );
      } else if (part.startsWith("`") && part.endsWith("`")) {
        tokens.push(
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-surface-low dark:bg-black/30 border border-border text-primary font-mono text-[11px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      } else if (part) {
        tokens.push(<span key={i}>{part}</span>);
      }
    });

    return tokens;
  };

  const elements: React.ReactNode[] = [];
  let currentList: { type: "bullet" | "number"; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === "bullet") {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-1.5 my-2 pl-1">
            {currentList.items.map((it, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground/90">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="flex-1">{it}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${elements.length}`} className="space-y-1.5 my-2 pl-1">
            {currentList.items.map((it, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground/90">
                <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="flex-1">{it}</span>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      elements.push(<div key={`spacer-${index}`} className="h-1.5" />);
      return;
    }

    // Header 3: ### Title
    if (trimmed.startsWith("### ")) {
      flushList();
      const title = trimmed.slice(4);
      elements.push(
        <div
          key={`h3-${index}`}
          className="mt-3.5 mb-2 pb-1 border-b border-border/50 flex items-center gap-2"
        >
          <span className="w-1.5 h-4 rounded-full bg-primary inline-block shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
            {parseInline(title)}
          </h4>
        </div>
      );
      return;
    }

    // Header 2: ## Title
    if (trimmed.startsWith("## ")) {
      flushList();
      const title = trimmed.slice(3);
      elements.push(
        <div
          key={`h2-${index}`}
          className="mt-4 mb-2 pb-1 border-b border-primary/20 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            {parseInline(title)}
          </h3>
        </div>
      );
      return;
    }

    // Header 1: # Title
    if (trimmed.startsWith("# ")) {
      flushList();
      const title = trimmed.slice(2);
      elements.push(
        <h2 key={`h1-${index}`} className="text-base font-bold text-primary mt-4 mb-2">
          {parseInline(title)}
        </h2>
      );
      return;
    }

    // Blockquote: > Quote
    if (trimmed.startsWith("> ")) {
      flushList();
      const quote = trimmed.slice(2);
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="p-3 my-2 rounded-xl bg-primary/5 dark:bg-primary/10 border-l-4 border-primary text-xs text-foreground/90 italic leading-relaxed"
        >
          {parseInline(quote)}
        </blockquote>
      );
      return;
    }

    // Bullet List: - Item or * Item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const itemText = trimmed.slice(2);
      if (!currentList || currentList.type !== "bullet") {
        flushList();
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push(parseInline(itemText));
      return;
    }

    // Numbered List: 1. Item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const itemText = numMatch[2];
      if (!currentList || currentList.type !== "number") {
        flushList();
        currentList = { type: "number", items: [] };
      }
      currentList.items.push(parseInline(itemText));
      return;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p key={`p-${index}`} className="text-xs leading-relaxed text-foreground/90 my-1">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
}
