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

/**
 * Read-only HTTP consumer of the SDP fork's API (D-2: "Read via the fork's API, not its
 * database"). Endpoints and field names below match the deployed fork (verified directly
 * against its Go source, not guessed): GET /disbursements/:id, GET /disbursements (paginated),
 * GET /payments (paginated via page/page_limit, filterable by type/status/receiver_id/
 * disbursement_id/created_at range).
 *
 * Every call still degrades gracefully: an unreachable fork or a non-OK / malformed response
 * yields an empty result instead of throwing, so the portal stays up and simply shows no data
 * (I-2: "must degrade gracefully if absent"). PII is stripped at this adapter boundary (D-3)
 * via filterPayment.
 */
export function createSdpForkClient(config: SdpForkClientConfig): SdpForkClient {
  const base = config.baseUrl.replace(/\/+$/, '');

  async function fetchJson(path: string): Promise<unknown> {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  return {
    async getProgramme(programmeId: string): Promise<Programme> {
      const data = await fetchJson(`/disbursements/${encodeURIComponent(programmeId)}`);
      if (data && typeof data === 'object' && 'id' in data && 'name' in data) {
        const { id, name, status } = data as Record<string, unknown>;
        return { id: String(id), name: String(name), status: String(status ?? '') };
      }
      // Graceful default so a missing fork does not crash the read path.
      return { id: programmeId, name: programmeId, status: '' };
    },

    async getProgrammes(): Promise<Programme[]> {
      const rows: SdpDisbursementRecord[] = [];
      let page = 1;
      for (;;) {
        const data = await fetchJson(`/disbursements?page_limit=${PAGE_LIMIT}&page=${page}`);
        const parsed = data as SdpPaginatedResponse<SdpDisbursementRecord> | null;
        if (!parsed || !Array.isArray(parsed.data)) break;
        rows.push(...parsed.data);
        if (page >= parsed.pagination.pages) break;
        page += 1;
      }
      return rows.map((row) => ({ id: row.id, name: row.name, status: row.status }));
    },

    async getPayments(programmeId: string): Promise<Payment[]> {
      // The fork filters server-side by disbursement_id, so each page already contains
      // only this programme's payments.
      const rows: SdpPaymentRecord[] = [];
      let page = 1;
      for (;;) {
        const data = await fetchJson(
          `/payments?type=DISBURSEMENT&disbursement_id=${encodeURIComponent(programmeId)}&page_limit=${PAGE_LIMIT}&page=${page}`,
        );
        const parsed = data as SdpPaginatedResponse<SdpPaymentRecord> | null;
        if (!parsed || !Array.isArray(parsed.data)) break;
        rows.push(...parsed.data);
        if (page >= parsed.pagination.pages) break;
        page += 1;
      }

      return rows.map((row) => {
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
      });
    },

    async getDeliveries(_programmeId: string): Promise<DeliveryConfirmation[]> {
      // Delivery confirmations are LastMile's contract (OQ-2), not the SDP fork's — the
      // deployed fork has no delivery-confirmation endpoint. No network call to make here.
      return [];
    },
  };
}
