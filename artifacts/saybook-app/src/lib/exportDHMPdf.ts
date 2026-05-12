import jsPDF from "jspdf";
import type { BookData } from "@/lib/store";
import type { DHMChapter, DHMResult } from "@workspace/dhm-engine";
import {
  SYNTAX_KEY_BLOCK,
  listBookStoryParagraphs,
  pointThemeHeading,
  toPdfSafeText,
} from "@workspace/dhm-engine";

const MM_MARGIN = 14;
const PAGE_H = 297;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - 2 * MM_MARGIN;
const LINE_MM = 5;
const BOOK_SUMMARY_HEADING = "Story of Thesis — Book Summary";

function sanitizeFilename(title: string): string {
  const s = title
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return s || "saybook-outline";
}

export function downloadDHMPdf(bookData: BookData, dhm: DHMResult, editedTitles: Record<number, string>): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MM_MARGIN;

  const ensureBottom = (neededMm: number) => {
    if (y + neededMm > PAGE_H - MM_MARGIN) {
      doc.addPage();
      y = MM_MARGIN;
    }
  };

  const writeLines = (
    lines: string | string[],
    fontSize: number,
    style: "normal" | "bold" | "italic",
    align: "left" | "justify" = "justify",
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style === "italic" ? "italic" : style === "bold" ? "bold" : "normal");
    const raw = typeof lines === "string" ? lines : lines.join("\n");
    const blocks = raw
      .split(/\n\s*\n/)
      .map((block) => toPdfSafeText(block.replace(/\s+/g, " ").trim()))
      .filter(Boolean);

    for (const block of blocks) {
      const wrapped = doc.splitTextToSize(block, CONTENT_W);
      const h = Math.max(wrapped.length, 1) * LINE_MM;
      ensureBottom(h);
      for (let i = 0; i < wrapped.length; i++) {
        const line = wrapped[i]!;
        const lineY = y + i * LINE_MM;
        if (align === "justify") {
          doc.text(line, MM_MARGIN, lineY, { maxWidth: CONTENT_W, align: "justify" });
        } else {
          doc.text(line, MM_MARGIN, lineY);
        }
      }
      y += h + 2;
    }
  };

  writeLines(bookData.title || "SAYBOOK outline", 18, "bold", "left");
  y += 2;
  writeLines("Double Helix Map (DHM)", 11, "italic", "left");
  y += 4;

  writeLines(`Plan: ${bookData.plan}`, 10, "bold", "left");
  writeLines(`Audience: ${bookData.audience}`, 10, "normal");
  writeLines(`Genre: ${bookData.genre}`, 10, "normal");
  writeLines(`Main goal: ${bookData.goal}`, 10, "normal");
  writeLines(`Chapter syntax template: ${dhm.chapterSyntaxMatrix}`, 10, "bold", "left");
  writeLines("Each chapter lists its own matrix below when syntax varies by chapter.", 9, "italic");
  y += 4;

  writeLines("Syntax KEY", 12, "bold", "left");
  for (const line of SYNTAX_KEY_BLOCK.split("\n")) {
    writeLines(line, 9, "normal");
  }
  y += 4;

  const sections: { label: string; chapters: DHMChapter[] }[] = [
    { label: "AWARENESS", chapters: dhm.arc.awareness },
    { label: "RESOLUTION", chapters: dhm.arc.resolution },
    { label: "CALL TO ACTION", chapters: dhm.arc.callToAction },
  ];

  for (const { label, chapters } of sections) {
    if (chapters.length === 0) continue;
    ensureBottom(LINE_MM * 4);
    y += 2;
    writeLines(label, 13, "bold", "left");
    y += 2;

    for (const ch of chapters) {
      const title = editedTitles[ch.num] ?? ch.title;
      ensureBottom(LINE_MM * 6);
      writeLines(`Chapter ${ch.num}: ${title}`, 11, "bold", "left");
      writeLines(`Chapter syntax matrix: ${ch.chapterSyntaxMatrix}`, 10, "bold", "left");
      writeLines("Story of Thesis (SOT) — Chapter summary", 11, "bold", "left");
      writeLines(ch.chapterStoryOfThesis, 10, "normal");
      y += 2;

      for (const strand of ch.strands) {
        ensureBottom(LINE_MM * 5);
        writeLines(`Strand ${strand.index} · ${strand.pattern}`, 10, "bold", "left");
        writeLines(`Strand thesis (SOT): ${strand.strandThesis}`, 9, "italic");
        for (const pt of strand.points) {
          writeLines(`${pt.code} (${pt.label})`, 9, "bold", "left");
          writeLines(`${pointThemeHeading(pt.code)}: ${pt.pointTheme}`, 9, "normal");
          writeLines(`Guidance: ${pt.guidance}`, 9, "normal");
          y += 1;
        }
        y += 2;
      }
      y += 3;
    }
  }

  ensureBottom(LINE_MM * 10);
  writeLines(BOOK_SUMMARY_HEADING, 13, "bold", "left");
  writeLines(
    "Joined chapter summaries (strand wording preserved inside each chapter summary).",
    9,
    "italic",
  );
  y += 2;
  for (const paragraph of listBookStoryParagraphs(dhm)) {
    writeLines(paragraph, 10, "normal");
    y += 1;
  }

  doc.save(`${sanitizeFilename(bookData.title)}-dhm.pdf`);
}
