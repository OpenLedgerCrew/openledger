import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/index';
import { EXPLORER_BASE, fakeForkClient, programme, standardFixture } from '../helpers/fixtures';

// Doc section 6.1 — Walkthrough 1: Programme View. One test per numbered line, using the
// document's own numbering (6 lines). Note: the scaffold spec moved item 3 (disclosure
// visible, not buried) to the frontend DisclosureBanner test; it is asserted here too at the
// API level so every doc line traces to a backend test (SD-9 in docs/DECISIONS.md).

const app = buildApp({
  forkClient: fakeForkClient(standardFixture()),
  explorerBaseUrl: EXPLORER_BASE,
});

afterAll(() => app.close());

function getProgrammeView() {
  return app.inject({ method: 'GET', url: `/programmes/${programme.id}` });
}

describe('walkthrough 1 — programme view (doc section 6.1)', () => {
  it('6.1 item 1 — opening the public programme link presents no login', async () => {
    const res = await getProgrammeView();
    expect(res.statusCode).toBe(200);
    expect(res.statusCode).not.toBe(401);
    expect(res.headers['www-authenticate']).toBeUndefined();
    expect(res.headers.location).toBeUndefined(); // no redirect to a login page
  });

  it('6.1 item 2 — total disbursed, payment count, and delivery rate are in the initial response', async () => {
    const res = await getProgrammeView();
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.aggregates.totals_by_asset.length).toBeGreaterThan(0);
    expect(body.aggregates.payment_count.settled).toBeGreaterThan(0);
    expect(body.aggregates.payment_count.pending).toBeGreaterThan(0);
    expect(body.aggregates.delivery_rate).not.toBeUndefined();
  });

  it('6.1 item 3 — the section 4.5 disclosure is part of the programme view response', async () => {
    const res = await getProgrammeView();
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.disclosure).toContain('How to read this page');
    expect(body.disclosure).toContain(
      'What the ledger proves: that funds moved between accounts on the Stellar network, at a specific time, for a specific amount.',
    );
  });

  it('6.1 item 4 — the payment table renders paginated', async () => {
    const res = await getProgrammeView();
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    // The fixture holds 30 payments; one page must be smaller than the whole set.
    expect(body.payments.length).toBeLessThan(30);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.total_pages).toBeGreaterThan(1);
  });

  it('6.1 item 5 — a READY payment has no explorer link and the exact label "Not yet settled.", not styled as an error', async () => {
    const res = await getProgrammeView();
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    const ready = body.payments.find((p: any) => p.status === 'READY');
    expect(ready).toBeDefined();
    expect(ready.explorer_url).toBeNull();
    expect(ready.settlement_label).toBe('Not yet settled.');
    // "It is not styled as an error" — the row carries no error marker for downstream renderers.
    expect(ready.error).toBeUndefined();
    expect(ready.severity).toBeUndefined();
  });

  it('6.1 item 6 — no LastMile record shows "Not applicable", visibly distinct from "Awaiting confirmation"', async () => {
    const res = await getProgrammeView();
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    const noRecord = body.payments.find((p: any) => p.reference_id === 'REF-004');
    const awaiting = body.payments.find((p: any) => p.reference_id === 'REF-003');
    // Two distinct render paths, not the same fallback (D-7 three-state model).
    expect(noRecord.delivery.state).toBe('not_applicable');
    expect(noRecord.delivery.label).toBe('Not applicable');
    expect(awaiting.delivery.state).toBe('awaiting_confirmation');
    expect(awaiting.delivery.label).toBe('Awaiting confirmation');
    expect(noRecord.delivery.label).not.toBe(awaiting.delivery.label);
  });
});
