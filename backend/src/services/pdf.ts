import { spawn } from 'child_process';
import {
  renderProgrammeReportHtml,
  type ReportData,
} from './reportTemplate';

// Section 6.3 / D-8 — the impact report is rendered from the shared template in reportTemplate.ts.
// We are using wkhtmltopdf as requested to generate the PDF report.

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
