import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { BookData } from "@/lib/store";
import type { DHMChapter, DHMResult } from "@workspace/dhm-engine";
import { SYNTAX_KEY_BLOCK, pointThemeHeading } from "@workspace/dhm-engine";

function sanitizeFilename(title: string): string {
  const s = title
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return s || "saybook-outline";
}

function pHeading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]): Paragraph {
  return new Paragraph({ heading: level, children: [new TextRun(text)] });
}

function pBody(text: string, bold = false): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: text.replace(/\s+/g, " ").trim(), bold })],
  });
}

/** Word (.docx) opens cleanly in Google Docs via Upload → Open with Google Docs. */
export async function downloadDHMDocx(bookData: BookData, dhm: DHMResult, editedTitles: Record<number, string>): Promise<void> {
  const blocks: Paragraph[] = [];

  blocks.push(pHeading(bookData.title || "SAYBOOK outline", HeadingLevel.TITLE));
  blocks.push(pBody("Double Helix Map (DHM)", true));

  blocks.push(pBody(`Plan: ${bookData.plan}`, true));
  blocks.push(pBody(`Audience: ${bookData.audience}`));
  blocks.push(pBody(`Genre: ${bookData.genre}`));
  blocks.push(pBody(`Main goal: ${bookData.goal}`));
  blocks.push(pBody(`Chapter syntax matrix: ${dhm.chapterSyntaxMatrix}`));

  blocks.push(pHeading("Syntax KEY", HeadingLevel.HEADING_2));
  for (const line of SYNTAX_KEY_BLOCK.split("\n")) {
    blocks.push(pBody(line));
  }

  const sections: { label: string; chapters: DHMChapter[] }[] = [
    { label: "AWARENESS", chapters: dhm.arc.awareness },
    { label: "RESOLUTION", chapters: dhm.arc.resolution },
    { label: "CALL TO ACTION", chapters: dhm.arc.callToAction },
  ];

  for (const { label, chapters } of sections) {
    if (chapters.length === 0) continue;
    blocks.push(pHeading(label, HeadingLevel.HEADING_1));
    for (const ch of chapters) {
      const title = editedTitles[ch.num] ?? ch.title;
      blocks.push(pHeading(`Chapter ${ch.num}: ${title}`, HeadingLevel.HEADING_2));
      blocks.push(pBody(`Chapter syntax matrix: ${ch.chapterSyntaxMatrix}`, true));
      blocks.push(pBody(`Chapter theme: ${ch.chapterTheme}`));

      for (const strand of ch.strands) {
        blocks.push(pHeading(`Strand ${strand.index} · ${strand.pattern}`, HeadingLevel.HEADING_3));
        for (const pt of strand.points) {
          blocks.push(pBody(`${pt.code} (${pt.label})`, true));
          blocks.push(pBody(`${pointThemeHeading(pt.code)}: ${pt.pointTheme}`));
          blocks.push(pBody(`Guidance: ${pt.guidance}`));
        }
      }
    }
  }

  blocks.push(pHeading("Story of Thesis", HeadingLevel.HEADING_1));
  blocks.push(pBody(dhm.storyOfThesis));

  const doc = new Document({
    sections: [{ properties: {}, children: blocks }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFilename(bookData.title)}-dhm.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
