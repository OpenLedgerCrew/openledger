import { spawn } from 'child_process';
import {
  renderProgrammeReportHtml,
  type ReportData,
} from './reportTemplate';

// Section 6.3 / D-8 — the impact report is rendered from the shared template in reportTemplate.ts.
// We are using wkhtmltopdf as requested to generate the PDF report.

<<<<<<< HEAD
=======
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
>>>>>>> 04b34aa (front end intergration)
export async function renderProgrammePdf(data: ReportData): Promise<Buffer> {
  const html = renderProgrammeReportHtml(data);
  
  // Path to portable wkhtmltopdf executable
  const exePath = 'C:\\Users\\user\\openledger\\wkhtmltopdf\\tools\\wkhtmltopdf.exe';

  return new Promise<Buffer>((resolve, reject) => {
    const child = spawn(exePath, [
      '--page-size', 'A4',
      '--margin-top', '16mm',
      '--margin-bottom', '16mm',
      '--margin-left', '14mm',
      '--margin-right', '14mm',
      '--encoding', 'utf-8',
      '-', // read HTML from stdin
      '-'  // output PDF to stdout
    ]);

    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];

    child.stdout.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    child.stderr.on('data', (chunk: Buffer) => {
      errChunks.push(chunk);
    });

    child.on('close', (code: number) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        const errorMsg = Buffer.concat(errChunks).toString('utf-8');
        reject(new Error(`wkhtmltopdf failed with code ${code}: ${errorMsg}`));
      }
    });

    child.on('error', (err: Error) => {
      reject(err);
    });

    // Write html to stdin
    try {
      child.stdin.write(html, 'utf-8');
      child.stdin.end();
    } catch (writeErr) {
      reject(writeErr);
    }
  });
}
