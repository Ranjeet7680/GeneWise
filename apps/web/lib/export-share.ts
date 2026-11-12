import { LstmBiomarkerForecast, Message, MessageSource } from "@/types";

export interface ExportableMessageItem {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  modelUsed?: string;
  confidenceScore?: number;
  sources?: MessageSource[];
  lstmForecast?: LstmBiomarkerForecast;
}

export interface ExportDocumentOptions {
  scope: "single" | "all";
  title: string;
  patientName?: string;
  includeMetadata?: boolean;
  includeCitations?: boolean;
}

/** Converts clinical markdown formatting into clean, readable plain text for PDF, print, and messaging apps. */
export function stripClinicalMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\>\s?/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\r\n/g, "\n")
    .trim();
}

/** Normalizes both text-chat Messages and voice-assistant transcript records into a shared export shape. */
export function normalizeMessagesForExport(
  messages: Array<
    | Message
    | {
        id: string | number;
        sender?: "user" | "assistant";
        role?: "user" | "assistant" | "system";
        text?: string;
        content?: string;
        time?: string;
        created_at?: string;
        model_used?: string;
        confidence_score?: number;
        sources?: MessageSource[];
        lstm_forecast?: LstmBiomarkerForecast;
      }
  >
): ExportableMessageItem[] {
  return messages.map((item) => {
    const rawRole = "sender" in item && item.sender ? item.sender : item.role || "assistant";
    const rawContent = "text" in item && typeof item.text === "string" ? item.text : item.content || "";
    const timestamp =
      "time" in item && item.time
        ? item.time
        : "created_at" in item && item.created_at
        ? new Date(item.created_at).toLocaleString()
        : undefined;
    return {
      id: item.id,
      role: rawRole,
      content: rawContent,
      timestamp,
      modelUsed: "model_used" in item ? item.model_used : undefined,
      confidenceScore: "confidence_score" in item ? item.confidence_score : undefined,
      sources: "sources" in item ? item.sources : undefined,
      lstmForecast: "lstm_forecast" in item ? item.lstm_forecast : undefined,
    };
  });
}

/** Builds formatted clinical text containing strictly the selected message(s) without dashboard UI chrome. */
export function formatClinicalExportText(
  items: ExportableMessageItem[],
  opts: ExportDocumentOptions
): string {
  const headerLines = [
    `GeneWise — ${opts.scope === "single" ? "Message Only Summary" : "Consultation Messages Only"}`,
    `Topic: ${opts.title || "Clinical Health Consultation"}`,
  ];

  if (opts.includeMetadata !== false) {
    if (opts.patientName) headerLines.push(`Patient Context: ${opts.patientName}`);
    headerLines.push(`Generated: ${new Date().toLocaleString()}`);
  }

  const bodyBlocks = items.map((msg, idx) => {
    const speaker = msg.role === "user" ? "Patient / Clinician Query" : "GeneWise AI Response";
    const metaParts = [speaker];
    if (opts.includeMetadata !== false && msg.timestamp) metaParts.push(msg.timestamp);
    if (opts.includeMetadata !== false && msg.modelUsed) metaParts.push(msg.modelUsed);
    if (opts.includeMetadata !== false && typeof msg.confidenceScore === "number") {
      metaParts.push(`${Math.round(msg.confidenceScore * 100)}% Confidence`);
    }

    const lines = [
      opts.scope === "single" ? `[${metaParts.join(" | ")}]` : `${idx + 1}. [${metaParts.join(" | ")}]`,
      stripClinicalMarkdown(msg.content),
    ];

    if (msg.lstmForecast) {
      const f = msg.lstmForecast;
      lines.push(
        `Bi-LSTM Forecast (${f.biomarkerLabel}): Current ${f.currentValue} ${f.unit} -> 30d ${f.projected30d} ${f.unit} -> 90d ${f.projected90d} ${f.unit} (${f.deltaPerMonth >= 0 ? "+" : ""}${f.deltaPerMonth} ${f.unit}/mo)`
      );
    }

    if (opts.includeCitations !== false && msg.sources && msg.sources.length > 0) {
      lines.push(
        "Peer-Reviewed Citations:",
        ...msg.sources.map(
          (s, sIdx) =>
            `  [${sIdx + 1}] ${s.title}${s.journal ? ` (${s.journal}` : ""}${s.year ? `, ${s.year}` : ""}${s.journal ? ")" : ""}${s.pmid ? ` PMID: ${s.pmid}` : ""}`
        )
      );
    }

    return lines.join("\n");
  });

  const disclaimer =
    "Educational Disclaimer: Synthesized by GeneWise clinical decision-support models. Not a standalone medical diagnosis.";

  return [headerLines.join("\n"), "---", ...bodyBlocks, "---", disclaimer].join("\n\n");
}

/** Formats concise WhatsApp-ready share copy containing only the message(s) and key findings. */
export function formatWhatsAppShareText(
  items: ExportableMessageItem[],
  opts: ExportDocumentOptions
): string {
  const titleLine = `*GeneWise — ${opts.scope === "single" ? "Clinical Message" : opts.title}*`;
  const sections = items.map((msg) => {
    const label = msg.role === "user" ? "*Question:*" : "*Clinical AI Brief:*";
    const clean = stripClinicalMarkdown(msg.content);
    const trimmed = clean.length > 1100 ? `${clean.slice(0, 1097)}...` : clean;
    const lstmNote = msg.lstmForecast
      ? `\n_Bi-LSTM 90d Forecast (${msg.lstmForecast.biomarkerLabel}): ${msg.lstmForecast.projected90d} ${msg.lstmForecast.unit}_`
      : "";
    return `${label}\n${trimmed}${lstmNote}`;
  });
  return `${titleLine}\n\n${sections.join("\n\n")}\n\n_Shared from GeneWise Clinical Intelligence (Educational Use Only)_`;
}

export interface SocialShareTarget {
  id: "whatsapp" | "telegram" | "twitter" | "linkedin" | "facebook" | "email";
  label: string;
  href: string;
  colorClass: string;
}

/** Builds clean outbound share URLs for WhatsApp and other major messaging/social platforms. */
export function getSocialShareTargets(
  items: ExportableMessageItem[],
  opts: ExportDocumentOptions,
  shareUrl: string = "https://medipredict-ai-seven.vercel.app/assistant"
): SocialShareTarget[] {
  const fullWaText = formatWhatsAppShareText(items, opts);
  const shortSummary = stripClinicalMarkdown(items[items.length - 1]?.content || opts.title).slice(0, 220);
  const subject = `GeneWise Clinical Summary: ${opts.title || "Consultation"}`;

  return [
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(fullWaText)}`,
      colorClass: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
    },
    {
      id: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(fullWaText.slice(0, 800))}`,
      colorClass: "bg-sky-600 hover:bg-sky-700 text-white border-sky-600",
    },
    {
      id: "twitter",
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${opts.title}: ${shortSummary}...`)}&url=${encodeURIComponent(shareUrl)}`,
      colorClass: "bg-slate-900 hover:bg-slate-800 text-white border-slate-900",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      colorClass: "bg-blue-700 hover:bg-blue-800 text-white border-blue-700",
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shortSummary)}`,
      colorClass: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
    },
    {
      id: "email",
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formatClinicalExportText(items, opts))}`,
      colorClass: "bg-teal-700 hover:bg-teal-800 text-white border-teal-700",
    },
  ];
}

function toAsciiPdfSafe(input: string): string {
  // Replace non-Latin-1 printable symbols cleanly and escape PDF literal parens/backslashes
  return input
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2022/g, "*")
    .replace(/\u2192/g, "->")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapTextLines(text: string, maxChars: number = 88): string[] {
  const result: string[] = [];
  for (const rawLine of text.split("\n")) {
    const trimmed = rawLine.trimEnd();
    if (!trimmed) {
      result.push("");
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = "";
    for (const word of words) {
      if (current.length + word.length + 1 <= maxChars) {
        current = current ? `${current} ${word}` : word;
      } else {
        if (current) result.push(current);
        current = word.length > maxChars ? word.slice(0, maxChars) : word;
      }
    }
    if (current) result.push(current);
  }
  return result;
}

interface ParsedContentBlock {
  kind: "heading" | "bullet" | "paragraph" | "spacer";
  text: string;
}

function parseClinicalBlocksForPdf(raw: string): ParsedContentBlock[] {
  const blocks: ParsedContentBlock[] = [];
  for (const rawLine of raw.replace(/\r\n/g, "\n").split("\n")) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      if (blocks.length > 0 && blocks[blocks.length - 1].kind !== "spacer") {
        blocks.push({ kind: "spacer", text: "" });
      }
      continue;
    }
    if (/^#{1,4}\s+/.test(trimmed)) {
      blocks.push({ kind: "heading", text: stripClinicalMarkdown(trimmed) });
      continue;
    }
    if (/^\*\*[^*]+\*\*:?$/.test(trimmed)) {
      blocks.push({ kind: "heading", text: stripClinicalMarkdown(trimmed) });
      continue;
    }
    if (/^[-*\u2022]\s+/.test(trimmed)) {
      blocks.push({
        kind: "bullet",
        text: stripClinicalMarkdown(trimmed.replace(/^[-*\u2022]\s+/, "")),
      });
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      blocks.push({ kind: "bullet", text: stripClinicalMarkdown(trimmed) });
      continue;
    }
    blocks.push({ kind: "paragraph", text: stripClinicalMarkdown(trimmed) });
  }
  return blocks;
}

/**
 * Generates a designed, multi-page binary PDF-1.4 clinical document strictly containing
 * the selected message(s), Bi-LSTM trajectories, and citations with structured cards and accents.
 */
export function buildClinicalPdfBlob(
  items: ExportableMessageItem[],
  opts: ExportDocumentOptions
): Blob {
  // Page geometry (A4: 595 x 842 pt)
  const PAGE_W = 595;
  const LEFT = 40;
  const RIGHT = 555;
  const CONTENT_W = RIGHT - LEFT;
  const TOP_START_Y = 768;
  const MIN_Y = 66;

  const pageOpsList: string[][] = [[]];
  let y = TOP_START_Y;

  const currentOps = () => pageOpsList[pageOpsList.length - 1];
  const pushPageBreak = () => {
    pageOpsList.push([]);
    y = TOP_START_Y;
  };
  const ensureSpace = (needed: number) => {
    if (y - needed < MIN_Y) {
      pushPageBreak();
    }
  };

  // Page 1 Metadata Summary Card
  const metaBoxH = opts.includeMetadata !== false ? 56 : 38;
  currentOps().push("0.94 0.99 0.98 rg");
  currentOps().push(`${LEFT} ${y - metaBoxH} ${CONTENT_W} ${metaBoxH} re f`);
  currentOps().push("0.60 0.89 0.85 RG 0.8 w");
  currentOps().push(`${LEFT} ${y - metaBoxH} ${CONTENT_W} ${metaBoxH} re S`);
  currentOps().push("0.02 0.35 0.32 rg");
  currentOps().push(`${LEFT} ${y - metaBoxH} 4 ${metaBoxH} re f`);

  const docTitle =
    opts.scope === "single"
      ? "GeneWise - Message Only Summary"
      : "GeneWise - Consultation Messages Record";
  currentOps().push(
    `BT /F2 11 Tf 0.02 0.35 0.32 rg ${LEFT + 12} ${y - 17} Td (${toAsciiPdfSafe(docTitle)}) Tj ET`
  );
  const topicText = `Topic: ${opts.title || "Clinical Health Consultation"}`;
  currentOps().push(
    `BT /F1 9 Tf 0.15 0.22 0.29 rg ${LEFT + 12} ${y - 31} Td (${toAsciiPdfSafe(topicText.slice(0, 82))}) Tj ET`
  );

  if (opts.includeMetadata !== false) {
    const metaRight = [
      opts.patientName ? `Patient: ${opts.patientName}` : null,
      `Scope: ${opts.scope === "single" ? "Selected Message" : `${items.length} Messages`}`,
      `Generated: ${new Date().toLocaleString()}`,
    ]
      .filter(Boolean)
      .join("   |   ");
    currentOps().push(
      `BT /F1 8 Tf 0.32 0.42 0.50 rg ${LEFT + 12} ${y - 45} Td (${toAsciiPdfSafe(metaRight)}) Tj ET`
    );
  }
  y -= metaBoxH + 14;

  // Render Each Selected Message as a Designed Card
  const safeItems =
    items.length > 0
      ? items
      : [
          {
            id: "empty",
            role: "assistant" as const,
            content: "No message selected for export.",
          },
        ];

  safeItems.forEach((msg, msgIdx) => {
    ensureSpace(78);

    const isUser = msg.role === "user";
    const speakerLabel = isUser
      ? "PATIENT / CLINICIAN QUERY"
      : "GENEWISE CLINICAL AI RESPONSE";
    const cardTitle =
      opts.scope === "single" ? speakerLabel : `#${msgIdx + 1}  ${speakerLabel}`;

    const accentFill = isUser ? "0.26 0.22 0.79 rg" : "0.02 0.42 0.38 rg";
    const headerBg = isUser ? "0.93 0.95 1.00 rg" : "0.92 0.98 0.97 rg";
    const borderCol = isUser ? "0.78 0.82 0.98 RG" : "0.70 0.89 0.86 RG";

    // Card header band
    const hdrH = 26;
    currentOps().push(headerBg);
    currentOps().push(`${LEFT} ${y - hdrH} ${CONTENT_W} ${hdrH} re f`);
    currentOps().push(`${borderCol} 0.75 w`);
    currentOps().push(`${LEFT} ${y - hdrH} ${CONTENT_W} ${hdrH} re S`);
    currentOps().push(accentFill);
    currentOps().push(`${LEFT} ${y - hdrH} 3.5 ${hdrH} re f`);

    currentOps().push(
      `BT /F2 9 Tf ${isUser ? "0.20 0.17 0.65" : "0.02 0.34 0.31"} rg ${LEFT + 11} ${y - 16} Td (${toAsciiPdfSafe(cardTitle)}) Tj ET`
    );

    if (opts.includeMetadata !== false) {
      const badgeParts: string[] = [];
      if (msg.modelUsed) badgeParts.push(msg.modelUsed);
      if (typeof msg.confidenceScore === "number") {
        badgeParts.push(`${Math.round(msg.confidenceScore * 100)}% Confidence`);
      }
      if (msg.timestamp) badgeParts.push(msg.timestamp);
      const badgeText = badgeParts.join(" | ");
      if (badgeText) {
        const badgeDisplay = badgeText.length > 82 ? badgeText.slice(0, 79) + "..." : badgeText;
        currentOps().push(
          `BT /F1 7.2 Tf 0.35 0.44 0.52 rg ${LEFT + 200} ${y - 16} Td (${toAsciiPdfSafe(badgeDisplay)}) Tj ET`
        );
      }
    }
    y -= hdrH + 10;

    // Parsed body lines with left accent stripe per line
    const parsedBlocks = parseClinicalBlocksForPdf(msg.content);
    for (const block of parsedBlocks) {
      if (block.kind === "spacer") {
        currentOps().push(accentFill);
        currentOps().push(`${LEFT} ${y - 6} 2.5 8 re f`);
        y -= 5;
        continue;
      }

      if (block.kind === "heading") {
        const wrappedHeading = wrapTextLines(block.text, 78);
        for (const hLine of wrappedHeading) {
          ensureSpace(18);
          currentOps().push(accentFill);
          currentOps().push(`${LEFT} ${y - 13} 2.5 16 re f`);
          currentOps().push(
            `BT /F2 10 Tf ${isUser ? "0.18 0.16 0.55" : "0.02 0.36 0.33"} rg ${LEFT + 12} ${y - 7} Td (${toAsciiPdfSafe(hLine)}) Tj ET`
          );
          y -= 15;
        }
        y -= 2;
        continue;
      }

      if (block.kind === "bullet") {
        const isNumbered = /^\d+\.\s+/.test(block.text.trim());
        const wrappedBullet = wrapTextLines(block.text, 80);
        wrappedBullet.forEach((bLine, bIdx) => {
          ensureSpace(15);
          currentOps().push(accentFill);
          currentOps().push(`${LEFT} ${y - 12} 2.5 15 re f`);
          if (bIdx === 0 && !isNumbered) {
            currentOps().push(
              `0.05 0.50 0.45 rg ${LEFT + 14} ${y - 5.5} 3 3 re f`
            );
          }
          const textX = isNumbered ? LEFT + 14 : LEFT + 22;
          currentOps().push(
            `BT /F1 9.2 Tf 0.10 0.15 0.21 rg ${textX} ${y - 7} Td (${toAsciiPdfSafe(bLine)}) Tj ET`
          );
          y -= 13.5;
        });
        continue;
      }

      // paragraph
      const wrappedPara = wrapTextLines(block.text, 84);
      for (const pLine of wrappedPara) {
        ensureSpace(15);
        currentOps().push(accentFill);
        currentOps().push(`${LEFT} ${y - 12} 2.5 15 re f`);
        currentOps().push(
          `BT /F1 9.3 Tf 0.12 0.17 0.23 rg ${LEFT + 12} ${y - 7} Td (${toAsciiPdfSafe(pLine)}) Tj ET`
        );
        y -= 13.5;
      }
    }

    y -= 6;

    // Optional Bi-LSTM Forecast Box
    if (msg.lstmForecast) {
      const f = msg.lstmForecast;
      ensureSpace(46);
      const lstmBoxH = 38;
      currentOps().push("0.93 0.95 1.00 rg");
      currentOps().push(`${LEFT + 8} ${y - lstmBoxH} ${CONTENT_W - 12} ${lstmBoxH} re f`);
      currentOps().push("0.74 0.78 0.98 RG 0.65 w");
      currentOps().push(`${LEFT + 8} ${y - lstmBoxH} ${CONTENT_W - 12} ${lstmBoxH} re S`);
      currentOps().push("0.26 0.22 0.79 rg");
      currentOps().push(`${LEFT + 8} ${y - lstmBoxH} 3 ${lstmBoxH} re f`);

      currentOps().push(
        `BT /F2 8.8 Tf 0.22 0.19 0.64 rg ${LEFT + 18} ${y - 14} Td (${toAsciiPdfSafe(`Bi-LSTM 90d Longitudinal Trajectory - ${f.biomarkerLabel}`)}) Tj ET`
      );
      const metricsLine = `Current: ${f.currentValue} ${f.unit} -> +30d: ${f.projected30d} ${f.unit} -> +90d: ${f.projected90d} ${f.unit} (${f.deltaPerMonth >= 0 ? "+" : ""}${f.deltaPerMonth} ${f.unit}/mo | ${Math.round(f.confidence * 100)}% conf | ${f.trend})`;
      currentOps().push(
        `BT /F1 8.4 Tf 0.14 0.18 0.28 rg ${LEFT + 18} ${y - 28} Td (${toAsciiPdfSafe(metricsLine)}) Tj ET`
      );
      y -= lstmBoxH + 8;
    }

    // Optional Peer-Reviewed PubMed Citations Card
    if (opts.includeCitations !== false && msg.sources && msg.sources.length > 0) {
      const citLines: string[] = [];
      msg.sources.forEach((s, sIdx) => {
        const ref = `[${sIdx + 1}] ${s.title}${s.journal ? ` (${s.journal}` : ""}${s.year ? `, ${s.year}` : ""}${s.journal ? ")" : ""}${s.pmid ? ` | PMID: ${s.pmid}` : ""}`;
        citLines.push(...wrapTextLines(ref, 84));
      });
      const citBoxH = 22 + citLines.length * 12;
      ensureSpace(citBoxH + 8);

      currentOps().push("0.97 0.98 0.99 rg");
      currentOps().push(`${LEFT + 8} ${y - citBoxH} ${CONTENT_W - 12} ${citBoxH} re f`);
      currentOps().push("0.82 0.86 0.90 RG 0.6 w");
      currentOps().push(`${LEFT + 8} ${y - citBoxH} ${CONTENT_W - 12} ${citBoxH} re S`);

      currentOps().push(
        `BT /F2 8.4 Tf 0.02 0.35 0.32 rg ${LEFT + 16} ${y - 14} Td (PEER-REVIEWED PUBMED CITATIONS) Tj ET`
      );
      let cy = y - 27;
      for (const cLine of citLines) {
        currentOps().push(
          `BT /F1 8 Tf 0.24 0.31 0.39 rg ${LEFT + 16} ${cy} Td (${toAsciiPdfSafe(cLine)}) Tj ET`
        );
        cy -= 12;
      }
      y -= citBoxH + 10;
    }

    y -= 8;
  });

  // Educational Notice Banner
  ensureSpace(44);
  const discLines = wrapTextLines(
    "Educational Notice: Synthesized by GeneWise clinical decision-support models from peer-reviewed medical literature. Intended solely for patient education and clinician preparation — not a standalone diagnostic prescription.",
    86
  );
  const discH = 14 + discLines.length * 11.5;
  currentOps().push("1.00 0.98 0.92 rg");
  currentOps().push(`${LEFT} ${y - discH} ${CONTENT_W} ${discH} re f`);
  currentOps().push("0.93 0.78 0.42 RG 0.6 w");
  currentOps().push(`${LEFT} ${y - discH} ${CONTENT_W} ${discH} re S`);
  currentOps().push("0.85 0.47 0.03 rg");
  currentOps().push(`${LEFT} ${y - discH} 3.5 ${discH} re f`);

  let dy = y - 14;
  for (const dLine of discLines) {
    currentOps().push(
      `BT /F1 8 Tf 0.47 0.24 0.03 rg ${LEFT + 10} ${dy} Td (${toAsciiPdfSafe(dLine)}) Tj ET`
    );
    dy -= 11.5;
  }

  // Assemble PDF-1.4 objects with branded header/footer chrome on every page
  const objects: string[] = [];
  const pageObjIds: number[] = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push(""); // Placeholder for Pages (id 2)
  objects.push("3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
  objects.push("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n");

  const totalPages = pageOpsList.length;

  pageOpsList.forEach((bodyOps, pageIndex) => {
    const pageId = objects.length + 1;
    const contentId = pageId + 1;
    pageObjIds.push(pageId);

    const headerLabel =
      opts.scope === "single"
        ? "GeneWise  |  Clinical Message Export"
        : "GeneWise  |  Consultation Brief";

    const chromeOps: string[] = [
      // Branded dark-teal top header bar
      "0.02 0.35 0.32 rg",
      `0 792 ${PAGE_W} 50 re f`,
      "0.08 0.72 0.65 rg",
      `0 790 ${PAGE_W} 2.5 re f`,
      `BT /F2 12 Tf 1 1 1 rg ${LEFT} 812 Td (${toAsciiPdfSafe(headerLabel)}) Tj ET`,
      `BT /F1 8 Tf 0.75 0.95 0.92 rg ${LEFT} 799 Td (Evidence-Grounded Genomic & Clinical Intelligence) Tj ET`,
      `BT /F2 8.5 Tf 0.85 0.98 0.96 rg 496 812 Td (Page ${pageIndex + 1} of ${totalPages}) Tj ET`,

      // Page content
      ...bodyOps,

      // Bottom footer separator & label
      "0.84 0.88 0.92 RG 0.6 w",
      `${LEFT} 44 m ${RIGHT} 44 l S`,
      `BT /F1 7.5 Tf 0.42 0.50 0.58 rg ${LEFT} 30 Td (GeneWise Clinical Brief  |  Non-Diagnostic Educational Record) Tj ET`,
      `BT /F1 7.5 Tf 0.42 0.50 0.58 rg 438 30 Td (github.com/Ranjeet7680/GeneWise) Tj ET`,
    ];

    const contentStream = chromeOps.join("\n");
    objects.push(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentId} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`
    );
  });

  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjIds.length} >>\nendobj\n`;

  let pdfBody = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(pdfBody.length);
    pdfBody += obj;
  }

  const xrefOffset = pdfBody.length;
  pdfBody += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdfBody += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  pdfBody += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdfBody], { type: "application/pdf" });
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
