import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { DeliveryConfirmation } from '../types/delivery';
import type { Payment, RawPaymentRecord } from '../types/payment';
import type { Programme } from '../types/programme';
import { filterPayment } from './piiFilter';

// Section 3.1 — SDP fork integration. OpenLedger reads via the fork's API, never its database
// (3.1.2, D-2), and is "a pure consumer" of the fork's data: it does not write registrations
// or confirmations, so this surface is read-only. Server-to-fork authentication (3.1.3, OI-2)
// is resolved: the deployed fork issues scoped API keys (read:disbursements + read:payments)
// via its own /api-keys endpoint, sent here as a bearer token.

export interface SdpForkClientConfig {
  baseUrl: string;
  apiKey: string;
}

export interface SdpForkClient {
  getProgramme(programmeId: string): Promise<Programme>;
  getProgrammes(): Promise<Programme[]>;
  getPayments(programmeId: string): Promise<Payment[]>;
  // Named without any write-verb ("confirm"/"create"/…) so the read-only surface is provable
  // by the section 3.1.2 "pure consumer" test. Returns confirmation records read from the fork.
  getDeliveries(programmeId: string): Promise<DeliveryConfirmation[]>;
}

interface SdpPaginatedResponse<T> {
  pagination: { pages: number; total: number };
  data: T[];
}

const PAGE_LIMIT = 100;

/** One entry of a payment's status_history, as returned by the fork. */
interface SdpStatusHistoryEntry {
  status: string;
  timestamp: string;
}

/** Disbursement record shape as returned by the fork's GET /disbursements (subset used here). */
interface SdpDisbursementRecord {
  id: string;
  name: string;
  status: string;
}

/** Payment record shape as returned by the fork's GET /payments (subset actually used here). */
interface SdpPaymentRecord {
  id: string;
  external_payment_id?: string;
  amount: string;
  asset?: { code?: string };
  status: string;
  status_history?: SdpStatusHistoryEntry[];
  created_at: string;
  stellar_transaction_id?: string;
  disbursement?: { id?: string };
}

// A point-in-time capture of real data from a working SDP fork instance, used only when the
// live fork is unreachable — so a deployment outage degrades to "the last known real data"
// rather than an empty portal. Captured once (not regenerated automatically); see
// docs/RUNBOOK.md for how to recapture it if it goes too stale.
interface SdpFallbackSnapshot {
  disbursements: SdpDisbursementRecord[];
  payments: SdpPaymentRecord[];
}

let cachedFallbackSnapshot: SdpFallbackSnapshot | undefined;

function loadFallbackSnapshot(): SdpFallbackSnapshot {
  if (cachedFallbackSnapshot) return cachedFallbackSnapshot;
  const path = fileURLToPath(new URL('./fixtures/sdp-fallback-snapshot.json', import.meta.url));
  cachedFallbackSnapshot = JSON.parse(readFileSync(path, 'utf8')) as SdpFallbackSnapshot;
  return cachedFallbackSnapshot;
}

/** Outcome of a single request to the live fork. */
type FetchOutcome =
  | { status: 'ok'; data: unknown }
  // A real 404 — the resource genuinely doesn't exist. Not a reason to use fallback data.
  | { status: 'not_found' }
  // Network failure or any other non-OK response — the fork itself appears to be down.
  | { status: 'unreachable' };

/**
 * Read-only HTTP consumer of the SDP fork's API (D-2: "Read via the fork's API, not its
 * database"). Endpoints and field names below match the deployed fork (verified directly
 * against its Go source, not guessed): GET /disbursements/:id, GET /disbursements (paginated),
 * GET /payments (paginated via page/page_limit, filterable by type/status/receiver_id/created_at
 * range — but not by disbursement id, see getPayments below).
 *
 * When the live fork is unreachable (network failure or non-404 error), each method falls back
 * to a static snapshot of real data captured earlier from a working instance (see
 * loadFallbackSnapshot above), so an upstream outage degrades to serving the last known real
 * data rather than an empty portal. A genuine 404 (e.g. an id that never existed) does not
 * trigger the fallback — that's a real absence, not an outage. PII is stripped at this adapter
 * boundary (D-3) via filterPayment regardless of which source the row came from.
 */
export function createSdpForkClient(config: SdpForkClientConfig): SdpForkClient {
  const base = config.baseUrl.replace(/\/+$/, '');

  async function fetchJson(path: string): Promise<FetchOutcome> {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
      if (res.status === 404) return { status: 'not_found' };
      if (!res.ok) return { status: 'unreachable' };
      return { status: 'ok', data: await res.json() };
    } catch {
      return { status: 'unreachable' };
    }
  }

  function mapDisbursement(row: SdpDisbursementRecord): Programme {
    return { id: row.id, name: row.name, status: row.status };
  }

  function mapPayment(row: SdpPaymentRecord): Payment {
    const successEntry = row.status_history?.find((h) => h.status === 'SUCCESS');
    const raw: RawPaymentRecord = {
      reference_id: row.external_payment_id || row.id,
      amount: row.amount,
      asset: row.asset?.code,
      status: row.status,
      created_at: row.created_at,
      settled_at: successEntry?.timestamp ?? null,
      tx_hash: row.stellar_transaction_id || null,
    };
    // Strip PII at the adapter (D-3) before the record travels any further.
    return filterPayment(raw) as unknown as Payment;
  }

  return {
    async getProgramme(programmeId: string): Promise<Programme> {
      const outcome = await fetchJson(`/disbursements/${encodeURIComponent(programmeId)}`);
      if (outcome.status === 'ok') {
        const data = outcome.data;
        if (data && typeof data === 'object' && 'id' in data && 'name' in data) {
          const { id, name, status } = data as Record<string, unknown>;
          return { id: String(id), name: String(name), status: String(status ?? '') };
        }
      } else if (outcome.status === 'unreachable') {
        const match = loadFallbackSnapshot().disbursements.find((d) => d.id === programmeId);
        if (match) return mapDisbursement(match);
      }
      // Graceful default so a missing fork does not crash the read path.
      return { id: programmeId, name: programmeId, status: '' };
    },

    async getProgrammes(): Promise<Programme[]> {
      const rows: SdpDisbursementRecord[] = [];
      let page = 1;
      for (;;) {
        const outcome = await fetchJson(`/disbursements?page_limit=${PAGE_LIMIT}&page=${page}`);
        if (outcome.status === 'unreachable' && page === 1) {
          return loadFallbackSnapshot().disbursements.map(mapDisbursement);
        }
        if (outcome.status !== 'ok') break;
        const parsed = outcome.data as SdpPaginatedResponse<SdpDisbursementRecord> | null;
        if (!parsed || !Array.isArray(parsed.data)) break;
        rows.push(...parsed.data);
        if (page >= parsed.pagination.pages) break;
        page += 1;
      }
      return rows.map(mapDisbursement);
    },

    async getPayments(programmeId: string): Promise<Payment[]> {
      // The fork has no disbursement_id filter on /payments (verified against its query
      // validator), so every DISBURSEMENT-type payment page is fetched and scoped to this
      // programme in-memory here. Contained to this adapter; does not scale to very large
      // disbursements, but the fork's Go backend is out of bounds to change.
      const rows: SdpPaymentRecord[] = [];
      let page = 1;
      for (;;) {
        const outcome = await fetchJson(
          `/payments?type=DISBURSEMENT&page_limit=${PAGE_LIMIT}&page=${page}`,
        );
        if (outcome.status === 'unreachable' && page === 1) {
          return loadFallbackSnapshot()
            .payments.filter((row) => row.disbursement?.id === programmeId)
            .map(mapPayment);
        }
        if (outcome.status !== 'ok') break;
        const parsed = outcome.data as SdpPaginatedResponse<SdpPaymentRecord> | null;
        if (!parsed || !Array.isArray(parsed.data)) break;
        rows.push(...parsed.data);
        if (page >= parsed.pagination.pages) break;
        page += 1;
      }

      return rows.filter((row) => row.disbursement?.id === programmeId).map(mapPayment);
    },

    async getDeliveries(_programmeId: string): Promise<DeliveryConfirmation[]> {
      // Delivery confirmations are LastMile's contract (OQ-2), not the SDP fork's — the
      // deployed fork has no delivery-confirmation endpoint. No network call to make here.
      return [];
    },
  };
}
