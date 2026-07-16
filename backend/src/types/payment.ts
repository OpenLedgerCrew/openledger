// Types derived from OpenLedger Documentation sections 2.2 (data flow), 4.2 (displayable
// fields), 5.4 (aggregation) and 5.5 (caching states).

import type { DeliveryView } from './delivery';

export type PaymentStatus =
  | 'DRAFT'
  | 'READY'
  | 'PENDING'
  | 'PAUSED'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELED';

/** Payment record as read from the SDP fork (section 2.2, step 2). */
export interface Payment {
  reference_id: string;
  amount: string;
  asset: string;
  status: PaymentStatus;
  created_at: string;
  settled_at: string | null;
  tx_hash: string | null;
}

/** Raw upstream record before PII stripping — may carry arbitrary extra keys (section 4.1). */
export type RawPaymentRecord = Record<string, unknown>;

/** Post-filter record: exactly the fields the section 4.2 table permits, nothing else. */
export interface FilteredPaymentRecord {
  reference_id: string;
  amount: string;
  asset: string;
  status: PaymentStatus;
  created_at: string;
  settled_at: string | null;
  tx_hash: string | null;
  delivery_confirmed_at: string | null;
}

/** Payment as served by the public API (walkthroughs 6.1 and 6.2). */
export interface PublicPaymentView extends FilteredPaymentRecord {
  explorer_url: string | null;
  settlement_label: string | null;
  delivery: DeliveryView;
}
