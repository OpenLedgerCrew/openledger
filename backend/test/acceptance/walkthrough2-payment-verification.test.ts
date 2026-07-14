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

// Doc section 6.2 — Walkthrough 2: Payment Verification. These tests hit the actual
// payment-detail endpoint; they do not re-run the piiFilter unit test against a mocked
// intermediate object (test rule 3).

const app = buildApp({
  forkClient: fakeForkClient(standardFixture()),
  explorerBaseUrl: EXPLORER_BASE,
});

function getPaymentDetail(referenceId: string) {
  return request(app).get(`/programmes/${programme.id}/payments/${referenceId}`);
}

describe('walkthrough 2 — payment verification (doc section 6.2)', () => {
  it('6.2 item 1 — selecting a payment from the table opens the detail view', async () => {
    const res = await getPaymentDetail('REF-001');
    expect(res.status).toBe(200);
    const body = res.body as any;
    expect(body.reference_id).toBe('REF-001');
  });

  it('6.2 item 2 — the detail view shows reference ID, amount, status, timestamps, and the transaction hash', async () => {
    const res = await getPaymentDetail('REF-001');
    expect(res.status).toBe(200);
    const body = res.body as any;
    expect(body.reference_id).toBe('REF-001');
    expect(body.amount).toBe('100.00');
    expect(body.status).toBe('SUCCESS');
    expect(body.created_at).toBe('2026-07-01T09:00:00Z');
    expect(body.settled_at).toBe('2026-07-01T09:05:00Z');
    expect(typeof body.tx_hash).toBe('string');
    expect(body.tx_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('6.2 item 3 — both legs render where the data exists, each honestly labelled, with the section 4.5 disclosure reachable from this view', async () => {
    const res = await getPaymentDetail('REF-001');
    expect(res.status).toBe(200);
    const body = res.body as any;
    // "funds sent (on-chain) and cash confirmed delivered (field process)" — section 1.2 / 6.2.
    expect(body.funds_leg.label).toBe('Funds sent');
    expect(body.delivery_leg.label).toBe('Cash confirmed delivered');
    // Honest labelling means the 4.5 disclosure is reachable here, not just on the programme view.
    expect(body.disclosure).toContain('How to read this page');
    expect(body.disclosure).toContain(
      "What it does not prove: that a particular person received cash. Beneficiary accounts are custodial, so the ledger records the movement of value, not the moment a note reaches a hand. Physical delivery is confirmed separately through SAPCONE's field process and is shown here where that data exists.",
    );
  });

  it('6.2 item 4 — no name, no phone, no wallet address, no proxy, no geotag in the actual detail response', async () => {
    const res = await getPaymentDetail('REF-001');
    // The fixture smuggles PII into REF-001 as it arrives from the fork (section 4.1), so
    // this proves the endpoint strips it (sections 4.3, 4.4, D-3).
    expect(res.status).toBe(200);
    const body = res.body as any;
    for (const key of ['name', 'phone', 'wallet_address', 'proxy_identity', 'delivery_geotag']) {
      expect(body).not.toHaveProperty(key);
    }
    for (const value of PII_VALUES) {
      expect(res.text).not.toContain(value);
    }
  });
});
