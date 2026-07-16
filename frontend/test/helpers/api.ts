import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { DISCLOSURE_FULL } from '../../src/constants/disclosure';
import type { PaymentRow } from '../../src/types';

export const EXPLORER_BASE = 'https://stellar.expert/explorer/testnet';

export const TX_HASH = 'ab'.repeat(32);
export const ANCHOR_HASH = 'dc'.repeat(32);

// PII fixture values (sections 4.1 / 4.3) — smuggled into API fixtures so tests can prove the
// UI never renders fields outside the public contract, even if a backend regression leaks them.
export const PII_NAME = 'Amina Hassan';
export const PII_PHONE = '+254700000001';
export const PII_WALLET_ADDRESS = 'G' + 'A'.repeat(55);
export const PII_PROXY_IDENTITY = 'PROXY-7-JOSEPH';
export const PII_VALUES = [PII_NAME, PII_PHONE, PII_WALLET_ADDRESS, PII_PROXY_IDENTITY, '3.1189', '35.5973'];

export const PROGRAMME_NAME = 'Emergency Cash Transfer — Cycle 3';

export function paymentRow(overrides: Partial<PaymentRow> & { reference_id: string }): PaymentRow {
  return {
    amount: '100.00',
    asset: 'USDC',
    status: 'SUCCESS',
    created_at: '2026-07-01T09:00:00Z',
    settled_at: '2026-07-01T09:05:00Z',
    tx_hash: TX_HASH,
    explorer_url: `${EXPLORER_BASE}/tx/${TX_HASH}`,
    settlement_label: null,
    delivery: {
      state: 'not_applicable',
      label: 'Not applicable',
      confirmed_at: null,
      anchoring_tx_hash: null,
      explorer_url: null,
    },
    ...overrides,
  };
}

export const settledWithAnchor = paymentRow({
  reference_id: 'REF-001',
  delivery: {
    state: 'confirmed',
    label: 'Confirmed',
    confirmed_at: '2026-07-02T10:00:00Z',
    anchoring_tx_hash: ANCHOR_HASH,
    explorer_url: `${EXPLORER_BASE}/tx/${ANCHOR_HASH}`,
  },
});

export const readyPayment = paymentRow({
  reference_id: 'REF-002',
  status: 'READY',
  settled_at: null,
  tx_hash: null,
  explorer_url: null,
  settlement_label: 'Not yet settled.',
});

export const awaitingPayment = paymentRow({
  reference_id: 'REF-003',
  amount: '50.00',
  tx_hash: 'cd'.repeat(32),
  explorer_url: `${EXPLORER_BASE}/tx/${'cd'.repeat(32)}`,
  delivery: {
    state: 'awaiting_confirmation',
    label: 'Awaiting confirmation',
    confirmed_at: null,
    anchoring_tx_hash: null,
    explorer_url: null,
  },
});

export const noRecordPayment = paymentRow({
  reference_id: 'REF-004',
  amount: '200.00',
  asset: 'XLM',
  tx_hash: 'ef'.repeat(32),
  explorer_url: `${EXPLORER_BASE}/tx/${'ef'.repeat(32)}`,
});

export const programmesListFixture = [{ id: 'prog-1', name: PROGRAMME_NAME, status: 'STARTED' }];

export const globalAggregatesFixture = {
  totals_by_asset: [{ asset: 'USDC', total: '150.00' }],
  payment_count: { total: 30, settled: 27, pending: 2, failed: 1 },
  delivery_rate: 0.5,
  rate_basis: { confirmed: 1, awaiting_confirmation: 1, excluded_no_delivery_record: 28 },
  timezone: 'UTC',
  generated_at: '2026-07-14T12:00:00Z',
};

export const programmeFixture = {
  programme: { id: 'prog-1', name: PROGRAMME_NAME, status: 'STARTED' },
  aggregates: {
    totals_by_asset: [
      { asset: 'USDC', total: '150.00' },
      { asset: 'XLM', total: '200.00' },
    ],
    payment_count: { total: 30, settled: 27, pending: 2, failed: 1 },
    delivery_rate: 0.5,
    rate_basis: { confirmed: 1, awaiting_confirmation: 1, excluded_no_delivery_record: 28 },
    timezone: 'UTC',
    generated_at: '2026-07-14T12:00:00Z',
  },
  disclosure: DISCLOSURE_FULL,
  payments: [settledWithAnchor, readyPayment, awaitingPayment, noRecordPayment],
  pagination: { page: 1, page_size: 25, total_pages: 2, total_payments: 30 },
};

export const paymentDetailFixture = {
  reference_id: 'REF-001',
  amount: '100.00',
  asset: 'USDC',
  status: 'SUCCESS',
  created_at: '2026-07-01T09:00:00Z',
  settled_at: '2026-07-01T09:05:00Z',
  tx_hash: TX_HASH,
  explorer_url: `${EXPLORER_BASE}/tx/${TX_HASH}`,
  funds_leg: { label: 'Funds sent', tx_hash: TX_HASH, explorer_url: `${EXPLORER_BASE}/tx/${TX_HASH}` },
  delivery_leg: {
    label: 'Cash confirmed delivered',
    confirmed_at: '2026-07-02T10:00:00Z',
    anchoring_tx_hash: ANCHOR_HASH,
    explorer_url: `${EXPLORER_BASE}/tx/${ANCHOR_HASH}`,
  },
  disclosure: DISCLOSURE_FULL,
  // Smuggled PII (defensive fixture) — the UI must never render fields outside the contract:
  name: PII_NAME,
  phone: PII_PHONE,
  wallet_address: PII_WALLET_ADDRESS,
  proxy_identity: PII_PROXY_IDENTITY,
  delivery_geotag: { lat: 3.1189, lon: 35.5973 },
};

/** MSW server faking the OpenLedger backend — the network is the only thing mocked (test rule 3). */
export function apiServer() {
  return setupServer(
    http.get('*/programmes/:programmeId/payments/:referenceId', () =>
      HttpResponse.json(paymentDetailFixture),
    ),
    http.get('*/programmes', () => HttpResponse.json({ programmes: programmesListFixture })),
    http.get('*/aggregates', () => HttpResponse.json(globalAggregatesFixture)),
    http.get('*/programmes/:programmeId', () => HttpResponse.json(programmeFixture)),
  );
}
