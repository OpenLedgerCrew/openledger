// Mirror of the backend's public API shapes (doc sections 4.2, 6.1, 6.2).

export type PaymentStatus = 'READY' | 'PENDING' | 'SUCCESS' | 'FAILED';

/** Three-state delivery model per D-7 (section 5.1). */
export type DeliveryState = 'confirmed' | 'awaiting_confirmation' | 'not_applicable';

export interface DeliveryView {
  state: DeliveryState;
  label: string;
  confirmed_at: string | null;
  anchoring_tx_hash: string | null;
  explorer_url: string | null;
}

export interface PaymentRow {
  reference_id: string;
  amount: string;
  asset: string;
  status: PaymentStatus;
  created_at: string;
  settled_at: string | null;
  tx_hash: string | null;
  explorer_url: string | null;
  settlement_label: string | null;
  delivery: DeliveryView;
}

export interface AssetTotal {
  asset: string;
  total: string;
}

export interface ProgrammeAggregates {
  totals_by_asset: AssetTotal[];
  payment_count: { total: number; settled: number; pending: number; failed: number };
  delivery_rate: number | null;
  rate_basis: {
    confirmed: number;
    awaiting_confirmation: number;
    excluded_no_delivery_record: number;
  };
  timezone: 'UTC';
  generated_at: string;
}
