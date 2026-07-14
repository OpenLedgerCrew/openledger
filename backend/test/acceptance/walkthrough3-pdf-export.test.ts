import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../../src/index';
import {
  EXPLORER_BASE,
  PII_VALUES,
  fakeForkClient,
  programme,
  standardFixture,
} from '../helpers/fixtures';

// Doc section 6.3 — Walkthrough 3: PDF Export. Assertions run against text extracted from the
// actual PDF bytes, not a mocked intermediate (test rule 3).

const app = buildApp({
  forkClient: fakeForkClient(standardFixture()),
  explorerBaseUrl: EXPLORER_BASE,
});

function exportPdf() {
  return request(app).get(`/programmes/${programme.id}/export.pdf`).buffer(true).parse((res, callback) => {
    const chunks: Buffer[] = [];
    res.on('data', (chunk: Buffer) => chunks.push(chunk));
    res.on('end', () => callback(null, Buffer.concat(chunks)));
  });
}

/** PDF extraction mangles line breaks; compare with collapsed whitespace on both sides. */
const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();

describe('walkthrough 3 — PDF export (doc section 6.3)', () => {
  it('6.3 item 1 — clicking export produces a downloadable PDF', async () => {
    const res = await exportPdf();
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect((res.body as Buffer).subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  it('6.3 item 2 — the PDF contains programme name, aggregates, the full payment table, the section 4.5 disclosure in full, and a generation timestamp', async () => {
    const res = await exportPdf();
    expect(res.status).toBe(200);
    const { text } = await pdfParse(res.body as Buffer);
    const pdfText = normalize(text);

    expect(pdfText).toContain(programme.name);
    expect(pdfText).toContain('150.00'); // USDC total disbursed from the fixture (section 5.4)
    // The FULL table — first and last fixture rows, not just the first page (30 payments).
    expect(pdfText).toContain('REF-001');
    expect(pdfText).toContain('REF-030');
    // The section 4.5 disclosure in full — the literal text block, not a summary of it.
    expect(pdfText).toContain('How to read this page');
    expect(pdfText).toContain(
      normalize(
        'Every payment below settles on the public Stellar network, and you can verify any of them yourself on the public ledger. We do not sit in the middle of that check.',
      ),
    );
    expect(pdfText).toContain(
      normalize(
        'What the ledger proves: that funds moved between accounts on the Stellar network, at a specific time, for a specific amount.',
      ),
    );
    expect(pdfText).toContain(
      normalize(
        "What it does not prove: that a particular person received cash. Beneficiary accounts are custodial, so the ledger records the movement of value, not the moment a note reaches a hand. Physical delivery is confirmed separately through SAPCONE's field process and is shown here where that data exists.",
      ),
    );
    expect(pdfText).toContain(
      normalize(
        'This is the same standard applied to any audited cash transfer program. We state it plainly because a transparency portal that overclaims is not transparent.',
      ),
    );
    expect(pdfText).toMatch(/Generated/i); // generation timestamp
  });

  it('6.3 item 3 — the extracted PDF text contains zero PII (section 4.3 field list)', async () => {
    const res = await exportPdf();
    expect(res.status).toBe(200);
    const { text } = await pdfParse(res.body as Buffer);
    // The fixture smuggles PII into the fork payload, so this proves the export strips it
    // (section 4.4: "not in the PDF").
    for (const value of PII_VALUES) {
      expect(text).not.toContain(value);
    }
  });
});
