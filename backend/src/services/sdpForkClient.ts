import type { DeliveryConfirmation } from '../types/delivery';
import type { Payment, RawPaymentRecord } from '../types/payment';
import type { Programme } from '../types/programme';
import { parseDeliveryRecord } from './lastMileClient';
import { filterPayment } from './piiFilter';

// Section 3.1 — SDP fork integration. OpenLedger reads via the fork's API, never its database
// (3.1.2, D-2), and is "a pure consumer" of the fork's data: it does not write registrations
// or confirmations, so this surface is read-only. Server-to-fork authentication is an open
// implementation detail (3.1.3) — see OI-2 in docs/OPEN_ITEMS.md.

export interface SdpForkClientConfig {
  baseUrl: string;
}

export interface SdpForkClient {
  getProgramme(programmeId: string): Promise<Programme>;
  getPayments(programmeId: string): Promise<Payment[]>;
  // Named without any write-verb ("confirm"/"create"/…) so the read-only surface is provable
  // by the section 3.1.2 "pure consumer" test. Returns confirmation records read from the fork.
  getDeliveries(programmeId: string): Promise<DeliveryConfirmation[]>;
}

/**
 * Read-only HTTP consumer of the SDP fork's API (D-2: "Read via the fork's API, not its
 * database"). The exact endpoints, field names, and auth are still open (OQ-1, OI-2), so the
 * paths below are provisional and NO authentication is attached — that is deferred to the gap
 * analysis rather than guessed (docs/OPEN_ITEMS.md, section 3.1.3).
 *
 * Because the fork's read contract does not yet exist, every call degrades gracefully: an
 * unreachable fork or a non-OK / malformed response yields an empty result instead of throwing,
 * so the portal stays up and simply shows no data (I-2: "must degrade gracefully if absent").
 * PII is stripped at this adapter boundary (D-3) via filterPayment / parseDeliveryRecord.
 */
export function createSdpForkClient(config: SdpForkClientConfig): SdpForkClient {
  const base = config.baseUrl.replace(/\/+$/, '');

  async function fetchJson(path: string): Promise<unknown> {
    try {
      const res = await fetch(`${base}${path}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  return {
    async getProgramme(programmeId: string): Promise<Programme> {
      const data = await fetchJson(`/programmes/${encodeURIComponent(programmeId)}`);
      if (data && typeof data === 'object' && 'id' in data && 'name' in data) {
        const { id, name } = data as Record<string, unknown>;
        return { id: String(id), name: String(name) };
      }
      // Graceful default so a missing fork does not crash the read path.
      return { id: programmeId, name: programmeId };
    },

    async getPayments(programmeId: string): Promise<Payment[]> {
      const data = await fetchJson(`/programmes/${encodeURIComponent(programmeId)}/payments`);
      if (!Array.isArray(data)) return [];
      // Strip PII at the adapter (D-3) before the record travels any further.
      return data.map((row) => filterPayment(row as RawPaymentRecord) as unknown as Payment);
    },

    async getDeliveries(programmeId: string): Promise<DeliveryConfirmation[]> {
      const data = await fetchJson(
        `/programmes/${encodeURIComponent(programmeId)}/delivery-confirmations`,
      );
      if (!Array.isArray(data)) return [];
      return data.map((row) => parseDeliveryRecord(row as Record<string, unknown>));
    },
  };
}
