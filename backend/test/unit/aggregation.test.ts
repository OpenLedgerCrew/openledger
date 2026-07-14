import { describe, expect, it } from 'vitest';
import { aggregateProgramme } from '../../src/services/aggregation';
import { delivery, payment } from '../helpers/fixtures';

// Doc section 5.4 — data aggregation logic.

const payments = [
  payment({ reference_id: 'P-1', status: 'SUCCESS', amount: '100.00', asset: 'USDC' }),
  payment({ reference_id: 'P-2', status: 'SUCCESS', amount: '50.00', asset: 'USDC' }),
  payment({ reference_id: 'P-3', status: 'SUCCESS', amount: '200.00', asset: 'XLM' }),
  payment({ reference_id: 'P-4', status: 'PENDING', amount: '75.00', asset: 'USDC', settled_at: null, tx_hash: null }),
  payment({ reference_id: 'P-5', status: 'READY', amount: '10.00', asset: 'XLM', settled_at: null, tx_hash: null }),
  payment({ reference_id: 'P-6', status: 'FAILED', amount: '25.00', asset: 'USDC', settled_at: null, tx_hash: null }),
];

const deliveries = [
  delivery({ reference_id: 'P-1' }), // confirmed
  delivery({ reference_id: 'P-2' }), // confirmed
  delivery({ reference_id: 'P-3', confirmed_at: null }), // awaiting confirmation
  // P-4, P-5, P-6 have no LastMile record at all.
];

describe('aggregation (doc section 5.4)', () => {
  // 5.4 — "Total disbursed is the sum of amounts where status is SUCCESS ... Pending and
  // failed payments are excluded, because a 'total disbursed' that includes money not yet
  // disbursed is a false claim to a donor."
  it('5.4 — total disbursed sums only SUCCESS payments; pending and failed do not move the total', () => {
    const result = aggregateProgramme(payments, deliveries);
    const usdc = result.totals_by_asset.find((t) => t.asset === 'USDC');
    // 100 + 50; the PENDING 75.00 and FAILED 25.00 must not appear in the sum.
    expect(usdc?.total).toBe('150.00');
  });

  // 5.4 — "If mixed assets exist, they are reported separately and never summed because there
  // is no defensible exchange rate to apply."
  it('5.4 — mixed assets produce separate totals, never one converted figure', () => {
    const result = aggregateProgramme(payments, deliveries);
    expect(result.totals_by_asset).toHaveLength(2);
    const byAsset = Object.fromEntries(result.totals_by_asset.map((t) => [t.asset, t.total]));
    expect(byAsset).toEqual({ USDC: '150.00', XLM: '200.00' });
  });

  // 5.4 — "with settled and pending shown separately. A single aggregate number here would be
  // ambiguous."
  it('5.4 — payment count reports settled and pending as separate numbers, not one combined count', () => {
    const result = aggregateProgramme(payments, deliveries);
    expect(typeof result.payment_count).not.toBe('number');
    expect(result.payment_count.settled).toBe(3);
    expect(result.payment_count.pending).toBe(2); // READY + PENDING
  });

  // 5.4 — "Delivery rate is confirmed divided by (confirmed plus awaiting confirmation).
  // Payments with no LastMile record are excluded from the denominator ... The rate_basis
  // field is emitted in the API response so that the denominator is never a mystery."
  it('5.4 — delivery rate = confirmed / (confirmed + awaiting); payments with no LastMile record appear in neither numerator nor denominator', () => {
    const result = aggregateProgramme(payments, deliveries);
    expect(result.delivery_rate).toBeCloseTo(2 / 3, 10);
    expect(result.rate_basis).toEqual({
      confirmed: 2,
      awaiting_confirmation: 1,
      excluded_no_delivery_record: 3,
    });
  });

  // 5.4 — "Timestamps are stored and served in UTC and rendered with an explicit timezone
  // label."
  it('5.4 — timestamps are UTC and the response carries an explicit timezone label', () => {
    const result = aggregateProgramme(payments, deliveries);
    expect(result.timezone).toBe('UTC');
    expect(result.generated_at).toMatch(/(Z|\+00:00)$/);
  });
});
