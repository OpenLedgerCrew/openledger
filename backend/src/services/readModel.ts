import {
  LABEL_DELIVERY_LEG,
  LABEL_FUNDS_LEG,
  LABEL_NOT_YET_SETTLED,
} from '../constants/labels';
import type { DeliveryConfirmation } from '../types/delivery';
import type { Payment, PaymentStatus, PublicPaymentView, RawPaymentRecord } from '../types/payment';
import type { ProgrammeAggregates } from '../types/programme';
import { aggregateProgramme } from './aggregation';
import { buildExplorerUrl } from './explorerUrl';
import { toDeliveryView } from './lastMileClient';
import { filterPayment } from './piiFilter';

// The read model (section 2.2 step 3): join payments and delivery confirmations on reference_id,
// strip PII at the boundary (D-3), and derive the public per-payment view. This module is the
// single composition point so the programme view, the payment detail, and the PDF report can
// never drift from one another (the intent behind D-8).

/** READY/PENDING payments have not settled; SUCCESS has, FAILED is terminal (not "not yet"). */
function settlementLabel(status: PaymentStatus, txHash: string | null): string | null {
  if (txHash) return null;
  if (status === 'READY' || status === 'PENDING') return LABEL_NOT_YET_SETTLED;
  return null;
}

export function buildPublicPaymentView(
  raw: RawPaymentRecord,
  delivery: DeliveryConfirmation | null,
  explorerBaseUrl: string,
): PublicPaymentView {
  const filtered = filterPayment(raw);
  const deliveryView = toDeliveryView(delivery);
  // Where the confirmation was anchored on-chain, offer a second, distinct explorer link
  // (section 6.4 item 4). Built by concatenation only — no fetch (D-1).
  const deliveryExplorerUrl = delivery?.anchoring_tx_hash
    ? buildExplorerUrl(delivery.anchoring_tx_hash, explorerBaseUrl)
    : null;

  return {
    ...filtered,
    delivery_confirmed_at: delivery?.confirmed_at ?? null,
    explorer_url: filtered.tx_hash ? buildExplorerUrl(filtered.tx_hash, explorerBaseUrl) : null,
    settlement_label: settlementLabel(filtered.status, filtered.tx_hash),
    delivery: { ...deliveryView, explorer_url: deliveryExplorerUrl },
  };
}

export interface ProgrammeReadModel {
  aggregates: ProgrammeAggregates;
  views: PublicPaymentView[];
}

export function buildProgrammeReadModel(
  payments: RawPaymentRecord[],
  deliveries: DeliveryConfirmation[],
  explorerBaseUrl: string,
): ProgrammeReadModel {
  const deliveryByRef = new Map<string, DeliveryConfirmation>();
  for (const d of deliveries) deliveryByRef.set(d.reference_id, d);

  const views = payments.map((p) =>
    buildPublicPaymentView(p, deliveryByRef.get(String(p.reference_id)) ?? null, explorerBaseUrl),
  );
  // Aggregation reads only non-PII fields (amount, asset, status); PII keys are ignored.
  const aggregates = aggregateProgramme(payments as unknown as Payment[], deliveries);
  return { aggregates, views };
}

/** The two-leg payment detail (section 6.2 item 3), built from an already-filtered view. */
export function buildPaymentDetail(view: PublicPaymentView, disclosure: string) {
  return {
    reference_id: view.reference_id,
    amount: view.amount,
    asset: view.asset,
    status: view.status,
    created_at: view.created_at,
    settled_at: view.settled_at,
    tx_hash: view.tx_hash,
    // "funds sent (on-chain)" — what the ledger proves.
    funds_leg: {
      label: LABEL_FUNDS_LEG,
      status: view.status,
      settled_at: view.settled_at,
      tx_hash: view.tx_hash,
      explorer_url: view.explorer_url,
      settlement_label: view.settlement_label,
    },
    // "cash confirmed delivered (field process)" — the separate, three-state delivery leg.
    delivery_leg: {
      label: LABEL_DELIVERY_LEG,
      delivery: view.delivery,
    },
    disclosure,
  };
}
