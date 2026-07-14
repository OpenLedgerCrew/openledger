import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as lastMile from '../../src/services/lastMileClient';

// Doc section 3.2 — LastMile integration (indirect, via the SDP fork's data model).

const moduleSource = readFileSync(
  new URL('../../src/services/lastMileClient.ts', import.meta.url),
  'utf8',
);

describe('lastMileClient (doc section 3.2)', () => {
  // 3.2.1 — "Delivery confirmation records only, where they exist: proxy ID, confirmation
  // timestamp, optional geotag, and anchoring transaction hash (C.1). No beneficiary PII —
  // LastMile's proxy delivery lists and confirmations use reference numbers only, never names
  // (L-3, L-4)." reference_id is the join key (section 2.2).
  it('3.2.1 — parsed payload carries only reference ID, proxy ID, confirmation timestamp, optional geotag, and anchoring tx hash — never a name', () => {
    const parsed = lastMile.parseDeliveryRecord({
      reference_id: 'REF-001',
      proxy_id: 'PROXY-7',
      confirmed_at: '2026-07-02T10:00:00Z',
      geotag: null,
      anchoring_tx_hash: 'cd'.repeat(32),
      // Fields that must not survive parsing:
      name: 'Amina Hassan',
      beneficiary_name: 'Amina Hassan',
      phone: '+254700000001',
    });
    const allowed = ['reference_id', 'proxy_id', 'confirmed_at', 'geotag', 'anchoring_tx_hash'];
    expect(allowed).toEqual(expect.arrayContaining(Object.keys(parsed)));
    expect(parsed).not.toHaveProperty('name');
    expect(parsed).not.toHaveProperty('beneficiary_name');
    expect(parsed).not.toHaveProperty('phone');
  });

  // 3.2.2 — "OpenLedger does not integrate with LastMile directly. It reads LastMile's
  // delivery confirmation data as it appears within the SDP fork's data model." Structural:
  // this module holds no connector making its own outbound HTTP call independent of the fork.
  it('3.2.2 — no direct LastMile connector: no outbound HTTP client in this module', () => {
    expect(moduleSource).not.toMatch(/\b(fetch|axios|undici|got|superagent|XMLHttpRequest)\b/);
    expect(Object.keys(lastMile).filter((name) => /client|connector/i.test(name))).toEqual([]);
    // Exercise the fork-sourced mapper so this test stays red until D-7 is implemented.
    const view = lastMile.toDeliveryView(undefined);
    expect(view.state).toBe('not_applicable');
  });

  // 3.2.3 — "Not specified in the master PRD beyond the general principle that OpenLedger is
  // read-only ... an open implementation detail for the gap-analysis-versioned API
  // documentation." Kept visible as a skip — see OI-2 in docs/OPEN_ITEMS.md.
  it.skip('3.2.3 — auth mechanism — pending gap analysis, doc section 3.2.3 (OI-2)', () => {});
});
