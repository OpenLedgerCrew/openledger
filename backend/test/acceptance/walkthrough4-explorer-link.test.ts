import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../src/index';
import {
  ANCHOR_HASH,
  EXPLORER_BASE,
  fakeForkClient,
  programme,
  standardFixture,
} from '../helpers/fixtures';

// Doc section 6.4 — Walkthrough 4: Stellar Explorer Link. Links are built by concatenation
// (D-1; I-3 in section 2.4: "No coupling. No API, no key, no SLA").

const fixture = standardFixture();
const app = buildApp({
  forkClient: fakeForkClient(fixture),
  explorerBaseUrl: EXPLORER_BASE,
});

afterEach(() => vi.restoreAllMocks());

async function getProgrammeBody() {
  const res = await request(app).get(`/programmes/${programme.id}`);
  return { res, body: res.body as any };
}

describe('walkthrough 4 — Stellar explorer link (doc section 6.4)', () => {
  it('6.4 item 1 — a settled payment carries a well-formed explorer link built by concatenation, with no network call', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { res, body } = await getProgrammeBody();
    expect(res.status).toBe(200);
    const settled = body.payments.find((p: any) => p.status === 'SUCCESS');
    expect(settled.explorer_url).toBe(`${EXPLORER_BASE}/tx/${settled.tx_hash}`);
    expect(() => new URL(settled.explorer_url)).not.toThrow();
    expect(new URL(settled.explorer_url).hostname).toBe('stellar.expert');
    // "No API, no key, no SLA" — producing the link fetched nothing.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('6.4 item 2 — amount and timestamp shown by OpenLedger match the values tied to the generated link', async () => {
    const { res, body } = await getProgrammeBody();
    expect(res.status).toBe(200);
    const settled = body.payments.find((p: any) => p.reference_id === 'REF-001');
    const source = fixture.payments.find((p) => p.reference_id === 'REF-001')!;
    // A downstream integration test (outside this skeleton) compares these against what the
    // explorer displays for the hash embedded in the link.
    expect(settled.amount).toBe(source.amount);
    expect(settled.settled_at).toBe(source.settled_at);
    expect(settled.explorer_url.endsWith(`/tx/${source.tx_hash}`)).toBe(true);
  });

  it('6.4 item 3 — verification requires no OpenLedger-held secret or session: "The donor did not have to trust OpenLedger to verify this"', async () => {
    const { res, body } = await getProgrammeBody();
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeUndefined();
    const settled = body.payments.find((p: any) => p.status === 'SUCCESS');
    const url = new URL(settled.explorer_url);
    expect(url.search).toBe(''); // no token, key, or session in the link
    expect(url.username).toBe('');
    expect(url.password).toBe('');
  });

  it('6.4 item 4 — a LastMile anchoring hash yields a second, distinct explorer link for the delivery confirmation', async () => {
    const { res, body } = await getProgrammeBody();
    expect(res.status).toBe(200);
    const anchored = body.payments.find((p: any) => p.reference_id === 'REF-001');
    expect(anchored.delivery.explorer_url).toBe(`${EXPLORER_BASE}/tx/${ANCHOR_HASH}`);
    expect(anchored.delivery.explorer_url).not.toBe(anchored.explorer_url);
  });
});
