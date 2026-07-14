import type { DeliveryConfirmation } from '../types/delivery';
import type { Payment } from '../types/payment';
import type { Programme } from '../types/programme';
import type { SdpForkClient } from './sdpForkClient';

// Demo/dev data source. The real SDP fork read API (OQ-1) and LastMile contract (OQ-2) do not
// exist yet, so `npm start` has nothing to read from. This seed lets the running server serve
// realistic, frontend-consumable data without a live fork — the mitigation for the two
// unbuilt upstream dependencies (docs/OPEN_ITEMS.md). It intentionally mirrors the shape and
// values of test/helpers/fixtures.ts:standardFixture, including the PII deliberately smuggled
// onto REF-001, so the running portal demonstrably strips it at the read-model boundary (D-3).

const EXPLORER_ANCHOR_HASH = 'dc'.repeat(32);

/** Distinct, well-formed 64-char hex transaction hash per payment index (mirrors the fixture). */
function txHash(i: number): string {
  return ((i + 16) % 256).toString(16).padStart(2, '0').repeat(32);
}

function payment(overrides: Partial<Payment> & { reference_id: string }): Payment {
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

function delivery(
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

function seedData(): { programme: Programme; payments: Payment[]; deliveries: DeliveryConfirmation[] } {
  const withPii = {
    ...payment({ reference_id: 'REF-001', amount: '100.00', asset: 'USDC', tx_hash: txHash(1) }),
    // Smuggled PII, exactly as the raw upstream payload is expected to carry it (section 4.1).
    // The read path must strip every one of these before it reaches a response (sections 4.3, 4.4).
    name: 'Amina Hassan',
    phone: '+254700000001',
    wallet_address: 'G' + 'A'.repeat(55),
    proxy_identity: 'PROXY-7-JOSEPH',
    delivery_geotag: { lat: 3.1189, lon: 35.5973 },
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
    payments.push(
      payment({ reference_id: `REF-${String(i).padStart(3, '0')}`, asset: 'XLM', tx_hash: txHash(i) }),
    );
  }

  const deliveries: DeliveryConfirmation[] = [
    delivery({
      reference_id: 'REF-001',
      proxy_id: 'PROXY-7-JOSEPH',
      geotag: { lat: 3.1189, lon: 35.5973 },
      anchoring_tx_hash: EXPLORER_ANCHOR_HASH,
    }),
    delivery({ reference_id: 'REF-003', confirmed_at: null }),
    // REF-004 has no delivery record at all — "Not applicable" (D-7).
  ];

  return { programme: { id: 'prog-1', name: 'Emergency Cash Transfer — Cycle 3' }, payments, deliveries };
}

/** In-memory SdpForkClient backed by the seed dataset. Read-only, no network, no write methods. */
export function createSeedForkClient(): SdpForkClient {
  const data = seedData();
  return {
    async getProgramme() {
      return data.programme;
    },
    async getPayments() {
      return data.payments;
    },
    async getDeliveries() {
      return data.deliveries;
    },
  };
}
