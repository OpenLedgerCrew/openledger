import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../../src/index';
import {
  ANCHOR_HASH,
  EXPLORER_BASE,
  PII_VALUES,
  fakeForkClient,
  programme,
  standardFixture,
} from '../helpers/fixtures';

// Integration contract consumed by the React frontend (frontend/src/** + frontend/test/helpers/api.ts):
// split /api endpoints, a flat payment-detail shape, and dual /api + no-prefix routing.

const app = buildApp({
  forkClient: fakeForkClient(standardFixture()),
  explorerBaseUrl: EXPLORER_BASE,
});

describe('frontend integration contract', () => {
  it('GET /api/programmes/:id/aggregates — bare ProgrammeAggregates', async () => {
    const res = await request(app).get(`/api/programmes/${programme.id}/aggregates`);
    expect(res.status).toBe(200);
    const body = res.body as any;
    // Bare aggregates object (not wrapped) — ProgrammeDetailModal reads these directly.
    const usdc = body.totals_by_asset.find((t: any) => t.asset === 'USDC');
    expect(usdc.total).toBe('150.00');
    expect(body.payment_count.settled).toBeGreaterThan(0);
    expect(typeof body.payment_count.total).toBe('number');
    expect(body.delivery_rate).not.toBeUndefined();
  });

  it('GET /api/aggregates — global aggregates reuse aggregateProgramme, matching the single-programme case', async () => {
    const [global, perProgramme] = await Promise.all([
      request(app).get('/api/aggregates'),
      request(app).get(`/api/programmes/${programme.id}/aggregates`),
    ]);
    expect(global.status).toBe(200);
    // With only one programme in the fork, global and per-programme aggregates must match
    // exactly (aside from each call's own generated_at timestamp) — proves this reuses
    // aggregateProgramme rather than a separate computation.
    const { generated_at: _g, ...globalRest } = global.body;
    const { generated_at: _p, ...perProgrammeRest } = perProgramme.body;
    expect(globalRest).toEqual(perProgrammeRest);
  });

  it('GET /api/programmes/:id/payments — honors page + limit, returns { payments, total_pages }', async () => {
    const res = await request(app).get(`/api/programmes/${programme.id}/payments?page=1&limit=5`);
    expect(res.status).toBe(200);
    const body = res.body as any;
    expect(Array.isArray(body.payments)).toBe(true);
    expect(body.payments.length).toBe(5); // limit honored
    expect(body.total_pages).toBe(6); // 30 payments / 5
    expect(body.page).toBe(1);
    expect(body.total_payments).toBe(30);
    // Row shape mirrors the frontend PaymentRow.
    const ref001 = body.payments.find((p: any) => p.reference_id === 'REF-001');
    expect(ref001.delivery.state).toBe('confirmed');
    expect(ref001.delivery.anchoring_tx_hash).toBe(ANCHOR_HASH);
  });

  it('GET /api/programmes/:id/payments — page 2 returns the next slice', async () => {
    const res = await request(app).get(`/api/programmes/${programme.id}/payments?page=2&limit=5`);
    expect(res.status).toBe(200);
    const body = res.body as any;
    expect(body.page).toBe(2);
    expect(body.payments.length).toBe(5);
    expect(body.payments.some((p: any) => p.reference_id === 'REF-001')).toBe(false);
  });

  it('GET /programmes/:id/payments/:refId (no /api) — flat funds_leg / delivery_leg, zero PII', async () => {
    const res = await request(app).get(`/programmes/${programme.id}/payments/REF-001`);
    expect(res.status).toBe(200);
    const body = res.body as any;
    expect(body.reference_id).toBe('REF-001');
    // funds_leg: frontend reads label + tx_hash.
    expect(body.funds_leg.label).toBe('Funds sent');
    expect(typeof body.funds_leg.tx_hash).toBe('string');
    // delivery_leg FLAT: confirmed_at + anchoring_tx_hash read directly (not nested under .delivery).
    expect(body.delivery_leg.label).toBe('Cash confirmed delivered');
    expect(body.delivery_leg.anchoring_tx_hash).toBe(ANCHOR_HASH);
    expect(body.delivery_leg.confirmed_at).toBe('2026-07-02T10:00:00Z');
    expect(body.delivery_leg).not.toHaveProperty('delivery');
    // Zero PII (sections 4.3/4.4, D-3).
    for (const value of PII_VALUES) {
      expect(res.text).not.toContain(value);
    }
  });

  it('both /api and no-prefix resolve the same endpoints', async () => {
    const [apiAgg, bareAgg, apiDetail] = await Promise.all([
      request(app).get(`/api/programmes/${programme.id}/aggregates`),
      request(app).get(`/programmes/${programme.id}/aggregates`),
      request(app).get(`/api/programmes/${programme.id}/payments/REF-001`),
    ]);
    expect(apiAgg.status).toBe(200);
    expect(bareAgg.status).toBe(200);
    expect(bareAgg.body).toEqual(apiAgg.body);
    expect(apiDetail.status).toBe(200); // detail also reachable under /api
    expect(apiDetail.body.reference_id).toBe('REF-001');
  });

  it('GET /api/programmes/:id/export — PDF, and include_payments=false omits the payment table', async () => {
    const withPayments = await request(app)
      .get(`/api/programmes/${programme.id}/export`)
      .buffer(true)
      .parse((res, cb) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => cb(null, Buffer.concat(chunks)));
      });
    expect(withPayments.status).toBe(200);
    expect(withPayments.headers['content-type']).toContain('application/pdf');
    expect((withPayments.body as Buffer).subarray(0, 5).toString('latin1')).toBe('%PDF-');
    const fullText = (await pdfParse(withPayments.body as Buffer)).text;
    expect(fullText).toContain('REF-001'); // table present by default

    const noPayments = await request(app)
      .get(`/api/programmes/${programme.id}/export?include_payments=false`)
      .buffer(true)
      .parse((res, cb) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => cb(null, Buffer.concat(chunks)));
      });
    expect(noPayments.status).toBe(200);
    const trimmedText = (await pdfParse(noPayments.body as Buffer)).text;
    expect(trimmedText).not.toContain('REF-001'); // table omitted
    expect(trimmedText).toContain('How to read this page'); // disclosure always present
  });
});
