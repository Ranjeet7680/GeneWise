"use client";

import React from "react";
import { Sparkles, CheckCircle, ChevronRight } from "lucide-react";

interface ClinicalMarkdownProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

export default function ClinicalMarkdown({
  content,
  className = "",
  isStreaming = false,
}: ClinicalMarkdownProps) {
  if (!content) return null;

  // Split into lines
  const lines = content.split("\n");

  const parseInline = (text: string): React.ReactNode[] => {
    // Regex matches **bold**, *italic*, `code`, and [markdown](links)
    const tokens: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
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
      } else if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          tokens.push(
            <a
              key={i}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              <span>{linkMatch[1]}</span>
            </a>
          );
        } else {
          tokens.push(<span key={i}>{part}</span>);
        }
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
              <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground/90 animate-in fade-in duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(20,184,166,0.5)]" />
                <span className="flex-1">{it}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${elements.length}`} className="space-y-1.5 my-2 pl-1">
            {currentList.items.map((it, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground/90 animate-in fade-in duration-200">
                <span className="w-4 h-4 rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-200 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/25 shadow-2xs">
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

  // Find the last non-empty line index so inline streaming cursor anchors to active text
  let lastNonEmptyIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim()) {
      lastNonEmptyIdx = i;
      break;
    }
  }

  const renderCaret = (show: boolean) =>
    show ? (
      <span
        data-testid="ai-typing-inline-cursor"
        aria-hidden="true"
        className="inline-flex items-center ml-1.5 -mb-0.5 align-baseline select-none"
      >
        <span className="inline-block w-2 h-4 rounded-[2px] bg-gradient-to-b from-teal-400 via-teal-500 to-emerald-600 dark:from-teal-300 dark:via-teal-400 dark:to-emerald-400 shadow-[0_0_10px_rgba(20,184,166,0.9)] typewriter-caret" />
      </span>
    ) : null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const showCaret = isStreaming && index === lastNonEmptyIdx;

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
          className={`mt-3.5 mb-2 pb-1 border-b border-border/50 flex items-center gap-2 ${
            showCaret ? "writing-ink-fade" : ""
          }`}
        >
          <span className="w-1.5 h-4 rounded-full bg-primary inline-block shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
            {parseInline(title)}
            {renderCaret(showCaret)}
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
          className={`mt-4 mb-2 pb-1 border-b border-primary/20 flex items-center gap-2 ${
            showCaret ? "writing-ink-fade" : ""
          }`}
        >
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            {parseInline(title)}
            {renderCaret(showCaret)}
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
        <h2
          key={`h1-${index}`}
          className={`text-base font-bold text-primary mt-4 mb-2 ${
            showCaret ? "writing-ink-fade" : ""
          }`}
        >
          {parseInline(title)}
          {renderCaret(showCaret)}
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
          className={`p-3 my-2 rounded-xl bg-primary/5 dark:bg-primary/10 border-l-4 border-primary text-xs text-foreground/90 italic leading-relaxed ${
            showCaret ? "writing-ink-fade" : ""
          }`}
        >
          {parseInline(quote)}
          {renderCaret(showCaret)}
        </blockquote>
      );
      return;
    }

    // Bullet List: - Item, * Item, • Item, + Item
    if (
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ") ||
      trimmed.startsWith("• ") ||
      trimmed.startsWith("+ ")
    ) {
      const itemText = trimmed.replace(/^[-*•+]\s+/, "");
      if (!currentList || currentList.type !== "bullet") {
        flushList();
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push(
        <span className={showCaret ? "writing-ink-fade" : ""}>
          {parseInline(itemText)}
          {renderCaret(showCaret)}
        </span>
      );
      return;
    }

    // Numbered List: 1. Item, 1) Item, or 1 Item
    const numMatch = trimmed.match(/^(\d+)[.)]?\s+(.*)/);
    if (numMatch) {
      const itemText = numMatch[2];
      if (!currentList || currentList.type !== "number") {
        flushList();
        currentList = { type: "number", items: [] };
      }
      currentList.items.push(
        <span className={showCaret ? "writing-ink-fade" : ""}>
          {parseInline(itemText)}
          {renderCaret(showCaret)}
        </span>
      );
      return;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p
        key={`p-${index}`}
        className={`text-xs leading-relaxed text-foreground/90 my-1 ${
          showCaret ? "writing-ink-fade" : ""
        }`}
      >
        {parseInline(trimmed)}
        {renderCaret(showCaret)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
}
