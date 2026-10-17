/**
 * OL-1 Read Contract Specification Types
 *
 * Strictly enforces zero PII:
 * - Only opaque, pseudonymous reference IDs (e.g., "REF-001", "PAY-2026-X9")
 * - Zero beneficiary names, phone numbers, wallet addresses, proxy identities, or coordinates
 */

export type ProgrammeStatus = "ACTIVE" | "COMPLETED" | "PAUSED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export type DeliveryStatus =
  | "UNCONFIRMED"
  | "CONFIRMED"
  | "PENDING_ESCROW"
  | "NOT_APPLICABLE";

export interface ProgrammeMetrics {
  total_disbursed: string | number;
  total_payments_count: number;
  successful_payments_count: number;
  confirmed_deliveries_count: number;
  /** Decimal float representation of delivery rate, e.g., 0.954 (95.4%) */
  delivery_rate: number;
  last_updated_at: string;
}

export interface ProgrammeSummary {
  programme_id: string;
  name: string;
  country_code: string;
  currency: string;
  status: ProgrammeStatus;
  metrics: ProgrammeMetrics;
}

export interface BlockchainTx {
  tx_hash: string | null;
  explorer_url?: string | null;
  stellar_explorer_url?: string | null;
  ledger_sequence?: number | null;
}

export interface DeliveryDetails {
  status: DeliveryStatus;
  delivery_method?: "DIRECT_WALLET" | "LASTMILE_ESCROW" | "CASH_OFFLINE" | string;
  is_lastmile?: boolean;
  confirmed_at?: string | null;
  escrow_contract_id?: string | null;
  anchoring_tx_hash?: string | null;
  explorer_url?: string | null;
  stellar_explorer_url?: string | null;
}

export interface PaymentListItem {
  payment_id: string;
  /** Pseudonymous reference ID only — strictly zero PII */
  reference_id: string;
  amount: string;
  asset: string;
  status: PaymentStatus;
  disbursed_at: string | null;
  blockchain_tx: BlockchainTx;
  delivery: DeliveryDetails;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next?: boolean;
  has_prev?: boolean;
}

export interface PaginatedPaymentsResponse {
  data: PaymentListItem[];
  pagination: PaginationMeta;
}

export interface FundsSentLeg {
  status: PaymentStatus;
  amount: string;
  asset: string;
  tx_hash: string | null;
  explorer_url?: string | null;
  stellar_explorer_url?: string | null;
  description?: string;
  settled_at: string | null;
  memo?: string | null;
  disbursed_at?: string | null;
}

export interface CashDeliveredLeg {
  status: DeliveryStatus;
  description?: string;
  is_lastmile?: boolean;
  confirmed_at: string | null;
  escrow_contract_id: string | null;
  anchoring_tx_hash: string | null;
  explorer_url?: string | null;
  stellar_explorer_url?: string | null;
  confirmation_method?: string | null;
  agent_reference?: string | null;
}

export interface PaymentDetail {
  payment_id: string;
  /** Pseudonymous reference ID only — strictly zero PII */
  reference_id: string;
  programme_id: string;
  amount: string;
  asset: string;
  status: PaymentStatus;
  created_at: string;
  disbursed_at?: string | null;
  leg_1_funds_sent: FundsSentLeg;
  leg_2_cash_delivered: CashDeliveredLeg;
  disclosure?: string;
}
