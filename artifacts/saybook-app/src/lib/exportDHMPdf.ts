import jsPDF from "jspdf";
import type { BookData } from "@/lib/store";
import type { DHMChapter, DHMResult } from "@workspace/dhm-engine";
import { SYNTAX_KEY_BLOCK, pointThemeHeading } from "@workspace/dhm-engine";

const MM_MARGIN = 14;
const PAGE_H = 297;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - 2 * MM_MARGIN;
const LINE_MM = 5;

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

  const writeLines = (lines: string | string[], fontSize: number, style: "normal" | "bold" | "italic") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style === "italic" ? "italic" : style === "bold" ? "bold" : "normal");
    const arr = typeof lines === "string" ? doc.splitTextToSize(lines.replace(/\s+/g, " ").trim(), CONTENT_W) : lines;
    const h = Math.max(arr.length, 1) * LINE_MM;
    ensureBottom(h);
    doc.text(arr, MM_MARGIN, y);
    y += h + 2;
  };

  writeLines(bookData.title || "SAYBOOK outline", 18, "bold");
  y += 2;
  writeLines("Double Helix Map (DHM)", 11, "italic");
  y += 4;

  writeLines(`Plan: ${bookData.plan}`, 10, "bold");
  writeLines(`Audience: ${bookData.audience}`, 10, "normal");
  writeLines(`Genre: ${bookData.genre}`, 10, "normal");
  writeLines(`Main goal: ${bookData.goal}`, 10, "normal");
  writeLines(`Chapter syntax matrix: ${dhm.chapterSyntaxMatrix}`, 10, "bold");
  y += 4;

  writeLines("Syntax KEY", 12, "bold");
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
    writeLines(label, 13, "bold");
    y += 2;

    for (const ch of chapters) {
      const title = editedTitles[ch.num] ?? ch.title;
      ensureBottom(LINE_MM * 6);
      writeLines(`Chapter ${ch.num}: ${title}`, 11, "bold");
      writeLines(`Chapter syntax matrix: ${ch.chapterSyntaxMatrix}`, 10, "bold");
      writeLines(`Chapter theme: ${ch.chapterTheme}`, 10, "normal");
      y += 2;

      for (const strand of ch.strands) {
        ensureBottom(LINE_MM * 5);
        writeLines(`Strand ${strand.index} · ${strand.pattern}`, 10, "bold");
        for (const pt of strand.points) {
          writeLines(`${pt.code} (${pt.label})`, 9, "bold");
          writeLines(`${pointThemeHeading(pt.code)}: ${pt.pointTheme}`, 9, "normal");
          writeLines(`Guidance: ${pt.guidance}`, 9, "normal");
          y += 1;
        }
        y += 2;
      }
      y += 3;
    }
  }

  ensureBottom(LINE_MM * 8);
  writeLines("Story of Thesis", 13, "bold");
  writeLines(dhm.storyOfThesis, 10, "normal");

  doc.save(`${sanitizeFilename(bookData.title)}-dhm.pdf`);
}
