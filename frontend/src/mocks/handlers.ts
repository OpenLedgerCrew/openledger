import { HttpResponse, http } from "msw";
import type {
  PaginatedPaymentsResponse,
  PaymentDetail,
  PaymentListItem,
  ProgrammeSummary,
} from "../types/openledger";

export const ESCROW_CONTRACT_ID =
  "CCUENRJNRPVSIQG7LIHMUAVQOE5MIMYBFQQG7VXXRS4L5NTGALVX6IV5";

const EXPLORER_BASE = "https://stellar.expert/explorer/testnet";

const TX_HASH_1 = "3a8fe912a78b54c01289de456812bcfe34890123456789abcdef0123456789ab";
const TX_HASH_2 = "7d4e12c45b89a01234ef567890abcdef1234567890abcdef1234567890abcdef";
const ANCHOR_HASH_1 = "b7c2d89012ef34567890abcdef1234567890abcdef1234567890abcdef123456";
const ANCHOR_HASH_2 = "90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678";

export const mockProgrammes: Record<string, ProgrammeSummary> = {
  "prog-kenya-2026-q3": {
    programme_id: "prog-kenya-2026-q3",
    name: "Kenya Emergency Cash Transfer — Q3 2026",
    country_code: "KE",
    currency: "KES",
    status: "ACTIVE",
    metrics: {
      total_disbursed: "4500000.00",
      total_payments_count: 1200,
      successful_payments_count: 1150,
      confirmed_deliveries_count: 1098,
      delivery_rate: 0.9548,
      last_updated_at: "2026-10-15T12:00:00Z",
    },
  },
  "turkana-north-mcpa-cycle-1": {
    programme_id: "turkana-north-mcpa-cycle-1",
    name: "Turkana North MPCA — Cycle 1",
    country_code: "KE",
    currency: "USDC",
    status: "ACTIVE",
    metrics: {
      total_disbursed: "180000.00",
      total_payments_count: 600,
      successful_payments_count: 580,
      confirmed_deliveries_count: 565,
      delivery_rate: 0.9741,
      last_updated_at: "2026-10-15T14:30:00Z",
    },
  },
};

export const mockPayments: PaymentListItem[] = [
  // 1. Direct wallet delivery (on-chain settlement, no escrow required)
  {
    payment_id: "pay-dw-001",
    reference_id: "REF-DW-1001",
    amount: "150.00",
    asset: "USDC",
    status: "SUCCESS",
    disbursed_at: "2026-10-14T08:30:00Z",
    blockchain_tx: {
      tx_hash: TX_HASH_1,
      explorer_url: `${EXPLORER_BASE}/tx/${TX_HASH_1}`,
      ledger_sequence: 5421098,
    },
    delivery: {
      status: "NOT_APPLICABLE",
      delivery_method: "DIRECT_WALLET",
      confirmed_at: "2026-10-14T08:31:00Z",
      escrow_contract_id: null,
      anchoring_tx_hash: null,
      explorer_url: null,
    },
  },
  // 2. LastMile Escrow delivery (Confirmed state anchored on-chain)
  {
    payment_id: "pay-lm-002",
    reference_id: "REF-LM-2002",
    amount: "100.00",
    asset: "USDC",
    status: "SUCCESS",
    disbursed_at: "2026-10-14T09:15:00Z",
    blockchain_tx: {
      tx_hash: TX_HASH_2,
      explorer_url: `${EXPLORER_BASE}/tx/${TX_HASH_2}`,
      ledger_sequence: 5421150,
    },
    delivery: {
      status: "CONFIRMED",
      delivery_method: "LASTMILE_ESCROW",
      confirmed_at: "2026-10-14T11:20:00Z",
      escrow_contract_id: ESCROW_CONTRACT_ID,
      anchoring_tx_hash: ANCHOR_HASH_1,
      explorer_url: `${EXPLORER_BASE}/tx/${ANCHOR_HASH_1}`,
    },
  },
  // 3. LastMile Escrow delivery (Pending Escrow state awaiting physical verification)
  {
    payment_id: "pay-lm-003",
    reference_id: "REF-LM-2003",
    amount: "100.00",
    asset: "USDC",
    status: "PENDING",
    disbursed_at: "2026-10-15T07:45:00Z",
    blockchain_tx: {
      tx_hash: null,
      explorer_url: null,
      ledger_sequence: null,
    },
    delivery: {
      status: "PENDING_ESCROW",
      delivery_method: "LASTMILE_ESCROW",
      confirmed_at: null,
      escrow_contract_id: ESCROW_CONTRACT_ID,
      anchoring_tx_hash: null,
      explorer_url: null,
    },
  },
  // 4. Unconfirmed offline cash distribution
  {
    payment_id: "pay-lm-004",
    reference_id: "REF-LM-2004",
    amount: "75.00",
    asset: "USDC",
    status: "PENDING",
    disbursed_at: "2026-10-15T08:00:00Z",
    blockchain_tx: {
      tx_hash: null,
      explorer_url: null,
      ledger_sequence: null,
    },
    delivery: {
      status: "UNCONFIRMED",
      delivery_method: "CASH_OFFLINE",
      confirmed_at: null,
      escrow_contract_id: ESCROW_CONTRACT_ID,
      anchoring_tx_hash: null,
      explorer_url: null,
    },
  },
];

export const mockPaymentDetails: Record<string, PaymentDetail> = {
  "pay-dw-001": {
    payment_id: "pay-dw-001",
    reference_id: "REF-DW-1001",
    programme_id: "turkana-north-mcpa-cycle-1",
    amount: "150.00",
    asset: "USDC",
    status: "SUCCESS",
    created_at: "2026-10-14T08:00:00Z",
    disbursed_at: "2026-10-14T08:30:00Z",
    leg_1_funds_sent: {
      status: "SUCCESS",
      amount: "150.00",
      asset: "USDC",
      tx_hash: TX_HASH_1,
      explorer_url: `${EXPLORER_BASE}/tx/${TX_HASH_1}`,
      settled_at: "2026-10-14T08:30:00Z",
      memo: "OL-PAY-DW-1001",
    },
    leg_2_cash_delivered: {
      status: "NOT_APPLICABLE",
      confirmed_at: "2026-10-14T08:31:00Z",
      escrow_contract_id: null,
      anchoring_tx_hash: null,
      explorer_url: null,
      confirmation_method: "DIRECT_WALLET_RECIPIENT",
    },
    disclosure: "On-chain direct wallet delivery verification.",
  },
  "pay-lm-002": {
    payment_id: "pay-lm-002",
    reference_id: "REF-LM-2002",
    programme_id: "turkana-north-mcpa-cycle-1",
    amount: "100.00",
    asset: "USDC",
    status: "SUCCESS",
    created_at: "2026-10-14T08:45:00Z",
    disbursed_at: "2026-10-14T09:15:00Z",
    leg_1_funds_sent: {
      status: "SUCCESS",
      amount: "100.00",
      asset: "USDC",
      tx_hash: TX_HASH_2,
      explorer_url: `${EXPLORER_BASE}/tx/${TX_HASH_2}`,
      settled_at: "2026-10-14T09:15:00Z",
      memo: "OL-PAY-LM-2002",
    },
    leg_2_cash_delivered: {
      status: "CONFIRMED",
      confirmed_at: "2026-10-14T11:20:00Z",
      escrow_contract_id: ESCROW_CONTRACT_ID,
      anchoring_tx_hash: ANCHOR_HASH_1,
      explorer_url: `${EXPLORER_BASE}/tx/${ANCHOR_HASH_1}`,
      confirmation_method: "LASTMILE_AGENT_SIGNATURE",
      agent_reference: "AGENT-TURKANA-44",
    },
    disclosure: "Two-leg cryptographic verification: funds sent on Stellar, physical delivery anchored via escrow contract.",
  },
  "pay-lm-003": {
    payment_id: "pay-lm-003",
    reference_id: "REF-LM-2003",
    programme_id: "prog-kenya-2026-q3",
    amount: "100.00",
    asset: "USDC",
    status: "PENDING",
    created_at: "2026-10-15T07:00:00Z",
    disbursed_at: "2026-10-15T07:45:00Z",
    leg_1_funds_sent: {
      status: "PENDING",
      amount: "100.00",
      asset: "USDC",
      tx_hash: null,
      explorer_url: null,
      settled_at: null,
      memo: "OL-PAY-LM-2003",
    },
    leg_2_cash_delivered: {
      status: "PENDING_ESCROW",
      confirmed_at: null,
      escrow_contract_id: ESCROW_CONTRACT_ID,
      anchoring_tx_hash: null,
      explorer_url: null,
      confirmation_method: "LASTMILE_FIELD_VERIFICATION",
    },
    disclosure: "Awaiting physical field confirmation and escrow release.",
  },
};

export const handlers = [
  // 1. GET /api/v1/openledger/programmes/:id
  http.get("*/api/v1/openledger/programmes/:id", ({ params }) => {
    const id = String(params.id);
    const programme = mockProgrammes[id] ?? {
      programme_id: id,
      name: `Programme ${id}`,
      country_code: "KE",
      currency: "USDC",
      status: "ACTIVE" as const,
      metrics: {
        total_disbursed: "100000.00",
        total_payments_count: 500,
        successful_payments_count: 480,
        confirmed_deliveries_count: 470,
        delivery_rate: 0.979,
        last_updated_at: new Date().toISOString(),
      },
    };

    return HttpResponse.json(programme);
  }),

  // 2. GET /api/v1/openledger/programmes/:id/payments
  http.get("*/api/v1/openledger/programmes/:id/payments", ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(url.searchParams.get("limit") || url.searchParams.get("page_size") || "10", 10));

    const totalItems = mockPayments.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const pageData = mockPayments.slice(startIndex, startIndex + pageSize);

    const response: PaginatedPaymentsResponse = {
      data: pageData,
      pagination: {
        page,
        page_size: pageSize,
        total_items: totalItems,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };

    return HttpResponse.json(response);
  }),

  // 3. GET /api/v1/openledger/payments/:paymentId
  http.get("*/api/v1/openledger/payments/:paymentId", ({ params }) => {
    const paymentId = String(params.paymentId);
    const detail = mockPaymentDetails[paymentId];

    if (!detail) {
      // Dynamic fallback for any unlisted payment ID to keep tests resilient
      const fallbackDetail: PaymentDetail = {
        payment_id: paymentId,
        reference_id: `REF-${paymentId.toUpperCase().slice(0, 10)}`,
        programme_id: "turkana-north-mcpa-cycle-1",
        amount: "100.00",
        asset: "USDC",
        status: "SUCCESS",
        created_at: "2026-10-15T08:00:00Z",
        disbursed_at: "2026-10-15T08:05:00Z",
        leg_1_funds_sent: {
          status: "SUCCESS",
          amount: "100.00",
          asset: "USDC",
          tx_hash: TX_HASH_1,
          explorer_url: `${EXPLORER_BASE}/tx/${TX_HASH_1}`,
          settled_at: "2026-10-15T08:05:00Z",
          memo: `OL-${paymentId}`,
        },
        leg_2_cash_delivered: {
          status: "CONFIRMED",
          confirmed_at: "2026-10-15T09:30:00Z",
          escrow_contract_id: ESCROW_CONTRACT_ID,
          anchoring_tx_hash: ANCHOR_HASH_2,
          explorer_url: `${EXPLORER_BASE}/tx/${ANCHOR_HASH_2}`,
          confirmation_method: "LASTMILE_ESCROW_SETTLEMENT",
        },
        disclosure: "Verifiable two-leg proof: funds sent on Stellar and cash delivery anchored via Soroban escrow contract.",
      };
      return HttpResponse.json(fallbackDetail);
    }

    return HttpResponse.json(detail);
  }),
];
