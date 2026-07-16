// Programme aggregates per section 5.4.

export interface Programme {
  id: string;
  name: string;
  /** The fork's disbursement status (DRAFT/READY/STARTED/PAUSED/COMPLETED), passed through as-is. */
  status: string;
}

export interface AssetTotal {
  asset: string;
  total: string;
}

/** Section 5.4: "settled and pending shown separately. A single aggregate number here would be ambiguous." */
export interface PaymentCount {
  total: number;
  settled: number;
  pending: number;
  failed: number;
}

/** Section 5.4: "The rate_basis field is emitted in the API response so that the denominator is never a mystery." */
export interface RateBasis {
  confirmed: number;
  awaiting_confirmation: number;
  excluded_no_delivery_record: number;
}

export interface ProgrammeAggregates {
  totals_by_asset: AssetTotal[];
  payment_count: PaymentCount;
  delivery_rate: number | null;
  rate_basis: RateBasis;
  timezone: 'UTC';
  generated_at: string;
}
