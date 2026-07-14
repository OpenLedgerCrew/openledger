import type { SdpForkClient } from '../../src/services/sdpForkClient';
import type { DeliveryConfirmation } from '../../src/types/delivery';
import type { Payment } from '../../src/types/payment';
import type { Programme } from '../../src/types/programme';

export const EXPLORER_BASE = 'https://stellar.expert/explorer/testnet';

/** Distinct, well-formed 64-char hex transaction hash per payment index. */
export function txHash(i: number): string {
  return ((i + 16) % 256).toString(16).padStart(2, '0').repeat(32);
}

export const ANCHOR_HASH = 'dc'.repeat(32);

// PII fixture values (section 4.1 / 4.3). Tests scan serialized responses for these exact
// values to prove they never cross the read-model boundary (D-3).
export const PII_NAME = 'Amina Hassan';
export const PII_PHONE = '+254700000001';
export const PII_WALLET_ADDRESS = 'G' + 'A'.repeat(55);
export const PII_PROXY_IDENTITY = 'PROXY-7-JOSEPH';
export const PII_GEOTAG = { lat: 3.1189, lon: 35.5973 };
export const PII_VALUES = [
  PII_NAME,
  PII_PHONE,
  PII_WALLET_ADDRESS,
  PII_PROXY_IDENTITY,
  '3.1189',
  '35.5973',
];

export const programme: Programme = {
  id: 'prog-1',
  name: 'Emergency Cash Transfer — Cycle 3',
};

export function payment(overrides: Partial<Payment> & { reference_id: string }): Payment {
  return {
    amount: '100.00',
    asset: 'USDC',
    status: 'SUCCESS',
    created_at: '2026-07-01T09:00:00Z',
    settled_at: '2026-07-01T09:05:00Z',
    tx_hash: txHash(1),
    ...overrides,
  };
}

export function delivery(
  overrides: Partial<DeliveryConfirmation> & { reference_id: string },
): DeliveryConfirmation {
  return {
    proxy_id: 'PROXY-7',
    confirmed_at: '2026-07-02T10:00:00Z',
    geotag: null,
    anchoring_tx_hash: null,
    ...overrides,
  };
}

export interface ForkFixture {
  programme: Programme;
  payments: Payment[];
  deliveries: DeliveryConfirmation[];
}

/** In-memory stand-in for the SDP fork boundary — the one thing tests may fake (SD-4). */
export function fakeForkClient(data: ForkFixture): SdpForkClient {
  return {
    async getProgramme() {
      return data.programme;
    },
    async getPayments() {
      return data.payments;
    },
    async getDeliveryConfirmations() {
      return data.deliveries;
    },
  };
}

/**
 * 30 payments (forces pagination, section 6.1 item 4) with mixed statuses, mixed assets, and
 * mixed delivery states. REF-001 arrives from the fork with smuggled PII keys so acceptance
 * tests can prove the API boundary strips them (sections 4.3, 4.4), the way the raw upstream
 * payload will (section 4.1).
 */
export function standardFixture(): ForkFixture {
  const withPii = {
    ...payment({ reference_id: 'REF-001', amount: '100.00', asset: 'USDC', tx_hash: txHash(1) }),
    name: PII_NAME,
    phone: PII_PHONE,
    wallet_address: PII_WALLET_ADDRESS,
    proxy_identity: PII_PROXY_IDENTITY,
    delivery_geotag: PII_GEOTAG,
  } as unknown as Payment;

  const payments: Payment[] = [
    withPii,
    payment({ reference_id: 'REF-002', status: 'READY', settled_at: null, tx_hash: null }),
    payment({ reference_id: 'REF-003', amount: '50.00', asset: 'USDC', tx_hash: txHash(3) }),
    payment({ reference_id: 'REF-004', amount: '200.00', asset: 'XLM', tx_hash: txHash(4) }),
    payment({ reference_id: 'REF-005', status: 'PENDING', settled_at: null, tx_hash: null }),
    payment({ reference_id: 'REF-006', status: 'FAILED', settled_at: null, tx_hash: null }),
  ];
  for (let i = 7; i <= 30; i++) {
    const ref = `REF-${String(i).padStart(3, '0')}`;
    payments.push(payment({ reference_id: ref, tx_hash: txHash(i) }));
  }

  const deliveries: DeliveryConfirmation[] = [
    // Confirmed, anchored on-chain, carrying the internal-only proxy identity and geotag.
    delivery({
      reference_id: 'REF-001',
      proxy_id: PII_PROXY_IDENTITY,
      geotag: PII_GEOTAG,
      anchoring_tx_hash: ANCHOR_HASH,
    }),
    // Record exists but not yet confirmed — "Awaiting confirmation" (section 6.1 item 6).
    delivery({ reference_id: 'REF-003', confirmed_at: null }),
    // REF-004 has no record at all — "Not applicable" (section 6.1 item 6, D-7).
  ];

  return { programme, payments, deliveries };
}
