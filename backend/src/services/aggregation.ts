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
export function aggregateProgramme(
  payments: Payment[],
  deliveries: DeliveryConfirmation[],
): ProgrammeAggregates {
  throw new Error('Not implemented');
}
