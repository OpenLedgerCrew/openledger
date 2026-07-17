import type { DeliveryConfirmation } from '../types/delivery';
import type { Payment } from '../types/payment';
import type { ProgrammeAggregates } from '../types/programme';

/**
 * Section 5.4 — data aggregation logic.
 *
 * Total disbursed sums only SUCCESS payments, grouped by asset; mixed assets are never summed
 * together. Payment count reports settled and pending separately. Delivery rate is
 * confirmed / (confirmed + awaiting confirmation), with payments that have no LastMile record
 * excluded from the denominator, and rate_basis emitted so the denominator is never a mystery.
 * Timestamps are UTC with an explicit timezone label.
 */
/** Parse a 2-decimal amount string into integer minor units, avoiding float drift. */
function toMinorUnits(amount: string): number {
  const [whole, frac = ''] = amount.split('.');
  const fracPadded = (frac + '00').slice(0, 2);
  return parseInt(whole || '0', 10) * 100 + parseInt(fracPadded || '0', 10);
}

function fromMinorUnits(minor: number): string {
  return `${Math.floor(minor / 100)}.${String(minor % 100).padStart(2, '0')}`;
}

export function aggregateProgramme(
  payments: Payment[],
  deliveries: DeliveryConfirmation[],
): ProgrammeAggregates {
  // Total disbursed: sum only SUCCESS payments, grouped by asset. Pending/failed are excluded
  // ("a 'total disbursed' that includes money not yet disbursed is a false claim"), and mixed
  // assets are never summed into one figure ("no defensible exchange rate to apply").
  const totalsByAsset = new Map<string, number>();
  const payment_count: ProgrammeAggregates['payment_count'] = {
    total: payments.length,
    settled: 0,
    pending: 0,
    failed: 0,
  };

  for (const p of payments) {
    switch (p.status) {
      case 'SUCCESS':
        payment_count.settled += 1;
        totalsByAsset.set(p.asset, (totalsByAsset.get(p.asset) ?? 0) + toMinorUnits(p.amount));
        break;
      case 'DRAFT':
      case 'READY':
      case 'PENDING':
      case 'PAUSED':
        payment_count.pending += 1;
        break;
      case 'FAILED':
      case 'CANCELED':
        payment_count.failed += 1;
        break;
    }
  }

  const totals_by_asset = [...totalsByAsset.entries()].map(([asset, minor]) => ({
    asset,
    total: fromMinorUnits(minor),
  }));

  // Delivery rate: confirmed / (confirmed + awaiting). Payments with no LastMile record are
  // excluded from the denominator — a direct-to-phone payment was never routed through a proxy,
  // so counting it as unconfirmed would misreport a category error as a delivery failure.
  const deliveredRefs = new Set(deliveries.map((d) => d.reference_id));
  let confirmed = 0;
  let awaiting_confirmation = 0;
  for (const d of deliveries) {
    if (d.confirmed_at) confirmed += 1;
    else awaiting_confirmation += 1;
  }
  const excluded_no_delivery_record = payments.filter(
    (p) => !deliveredRefs.has(p.reference_id),
  ).length;

  const denominator = confirmed + awaiting_confirmation;
  const delivery_rate = denominator === 0 ? null : confirmed / denominator;

  return {
    totals_by_asset,
    payment_count,
    delivery_rate,
    rate_basis: { confirmed, awaiting_confirmation, excluded_no_delivery_record },
    timezone: 'UTC',
    generated_at: new Date().toISOString(),
  };
}
