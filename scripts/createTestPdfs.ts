/**
 * scripts/createTestPdfs.ts
 *
 * Generates two minimal but fully-valid single-page PDFs:
 *   tests/fixtures/question-paper.pdf  — a 3-question science exam
 *   tests/fixtures/answer-sheet.pdf    — a student's handwritten-style answers
 *
 * Run with:
 *   npx ts-node --project tsconfig.json scripts/createTestPdfs.ts
 * or:
 *   bun run scripts/createTestPdfs.ts
 *
 * No external PDF library needed — the PDFs are assembled from raw bytes
 * following the PDF 1.4 specification. pdfjs-dist can render these.
 */

import * as fs from "fs";
import * as path from "path";

// ─── PDF builder ─────────────────────────────────────────────────────────────

/**
 * Minimal PDF builder. Supports a single page with arbitrary text content
 * using the standard PDF type-1 Helvetica font.
 */
function buildPdf(lines: string[]): Buffer {
  // PDF text stream: position lines down the page
  const textCommands = lines
    .map((line, i) => {
      const y = 750 - i * 28;
      // Escape PDF special characters: ( ) \
      const escaped = line
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
      return `BT /F1 12 Tf 50 ${y} Td (${escaped}) Tj ET`;
    })
    .join("\n");

  // ── objects ──────────────────────────────────────────────────────────────
  const objects: string[] = [];

  // obj 1: catalog
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");

  // obj 2: pages
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");

  // obj 3: page
  objects.push(
    "3 0 obj\n" +
      "<< /Type /Page /Parent 2 0 R\n" +
      "   /MediaBox [0 0 595 842]\n" +
      "   /Contents 4 0 R\n" +
      "   /Resources << /Font << /F1 5 0 R >> >> >>\n" +
      "endobj"
  );

  // obj 4: content stream
  const stream = textCommands;
  objects.push(
    `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`
  );

  // obj 5: font resource (Helvetica, built-in)
  objects.push(
    "5 0 obj\n" +
      "<< /Type /Font /Subtype /Type1\n" +
      "   /BaseFont /Helvetica\n" +
      "   /Encoding /WinAnsiEncoding >>\n" +
      "endobj"
  );

  // ── assemble ─────────────────────────────────────────────────────────────
  const header = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"; // marks binary PDF

  // Build body and collect byte offsets for xref
  const offsets: number[] = [];
  let body = "";
  for (const obj of objects) {
    offsets.push(header.length + body.length);
    body += obj + "\n";
  }

  // xref table
  const xrefOffset = header.length + body.length;
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += "0000000000 65535 f \n";
  for (const off of offsets) {
    xref += String(off).padStart(10, "0") + " 00000 n \n";
  }

  const trailer =
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(header + body + xref + trailer, "latin1");
}

// ─── Content ─────────────────────────────────────────────────────────────────

const questionPaperLines = [
  "VedaAI Assessment  —  Science: Light & Optics",
  "Class 10  |  Total Marks: 20  |  Time: 45 minutes",
  "",
  "Instructions: Answer all questions. Show working where applicable.",
  "",
  "Q1. What is the speed of light in a vacuum? [2 marks]",
  "",
  "Q2. Define the term 'refractive index' and write its formula. [4 marks]",
  "",
  "Q3 (a). A ray of light travels from water (n=1.33) into glass (n=1.5).",
  "        If the angle of incidence is 30 degrees, find the angle of",
  "        refraction using Snell's Law. [6 marks]",
  "",
  "Q3 (b). State one real-world application of total internal reflection. [2 marks]",
  "",
  "Q4. Draw a ray diagram showing how a concave mirror forms a",
  "    real, inverted image. Label the principal focus and centre",
  "    of curvature. [6 marks]",
];

const answerSheetLines = [
  "Student: Aryan Sharma     Class: 10-B     Roll No: 14",
  "Subject: Science - Light & Optics",
  "Date: 27 August 2026",
  "",
  "Ans 1:",
  "The speed of light in a vacuum is 3 x 10^8 metres per second",
  "or approximately 299,792,458 m/s.",
  "",
  "Ans 2:",
  "Refractive index (n) is the ratio of the speed of light in",
  "vacuum to the speed of light in the medium.",
  "Formula: n = c / v  where c is speed in vacuum and v in medium.",
  "",
  "Ans 3 (a):",
  "Using Snells Law: n1 * sin(i) = n2 * sin(r)",
  "1.33 * sin(30) = 1.5 * sin(r)",
  "1.33 * 0.5 = 1.5 * sin(r)",
  "0.665 = 1.5 * sin(r)",
  "sin(r) = 0.665 / 1.5 = 0.4433",
  "r = arcsin(0.4433) = approximately 26.3 degrees",
  "",
  "Ans 3 (b):",
  "Optical fibres use total internal reflection to transmit data",
  "as light pulses over long distances with minimal loss.",
  "",
  "Ans 4:",
  "[Ray diagram drawn - concave mirror with object beyond C,",
  " image formed between F and C, real and inverted]",
];

// ─── Write files ──────────────────────────────────────────────────────────────

const fixturesDir = path.join(__dirname, "..", "tests", "fixtures");
fs.mkdirSync(fixturesDir, { recursive: true });

const questionPaperPath = path.join(fixturesDir, "question-paper.pdf");
const answerSheetPath = path.join(fixturesDir, "answer-sheet.pdf");

fs.writeFileSync(questionPaperPath, buildPdf(questionPaperLines));
fs.writeFileSync(answerSheetPath, buildPdf(answerSheetLines));

console.log("✓ Created", questionPaperPath);
console.log("✓ Created", answerSheetPath);
console.log(
  `  question-paper.pdf  ${fs.statSync(questionPaperPath).size} bytes`
);
console.log(`  answer-sheet.pdf    ${fs.statSync(answerSheetPath).size} bytes`);
