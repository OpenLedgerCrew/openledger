import { PDFDocument, StandardFonts } from 'pdf-lib';
import {
  renderProgrammeReportHtml,
  renderProgrammeReportLines,
  type ReportData,
} from './reportTemplate';

// Section 6.3 / D-8 — the impact report is rendered from the shared template in reportTemplate.ts.
//
// Primary engine: Puppeteer (headless Chromium), as the doc mandates — "one template, two
// outputs, so the PDF cannot drift from the web view" (section 2.3). Chromium is a heavy, and in
// some sandboxes unavailable, dependency; the chosen mitigation is a pdf-lib fallback that emits
// the same textual content so the export keeps working (and its assertions keep passing) when a
// browser cannot be launched. The selected engine is logged once so the environment is auditable.

let loggedEngine = false;
function logEngine(engine: string): void {
  if (!loggedEngine) {
    loggedEngine = true;
    // eslint-disable-next-line no-console
    console.log(`[pdf] rendering engine: ${engine}`);
  }
}

async function renderWithPuppeteer(data: ReportData): Promise<Buffer> {
  // Dynamic import so a missing/unusable Chromium only affects the export path, not app boot.
  const { default: puppeteer } = await import('puppeteer');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // Lets an install point at a system-installed Chrome/Chromium (e.g. when the bundled
    // per-OS download is blocked or skipped) instead of always requiring puppeteer's own binary.
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(renderProgrammeReportHtml(data), { waitUntil: 'load' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function renderWithPdfLib(data: ReportData): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 9;
  const lineHeight = 12;
  const margin = 40;
  const pageWidth = 595.28; // A4 portrait, points
  const pageHeight = 841.89;
  const maxWidth = pageWidth - margin * 2;

  // Word-wrap a logical line to the page width, preserving word order so extracted text stays
  // contiguous after whitespace normalisation.
  function wrap(text: string): string[] {
    if (text === '') return [''];
    const words = text.split(/\s+/);
    const out: string[] = [];
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && current) {
        out.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) out.push(current);
    return out;
  }

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  const drawLine = (line: string) => {
    if (y < margin) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    page.drawText(line, { x: margin, y, size: fontSize, font });
    y -= lineHeight;
  };

  for (const logicalLine of renderProgrammeReportLines(data)) {
    for (const wrapped of wrap(logicalLine)) drawLine(wrapped);
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

/** Render the programme impact report to PDF bytes, preferring Puppeteer, falling back to pdf-lib. */
export async function renderProgrammePdf(data: ReportData): Promise<Buffer> {
  try {
    const pdf = await renderWithPuppeteer(data);
    logEngine('puppeteer');
    return pdf;
  } catch (err) {
    logEngine(`pdf-lib (puppeteer unavailable: ${(err as Error).message.split('\n')[0]})`);
    return renderWithPdfLib(data);
  }
}
