import type { DeliveryConfirmation } from '../types/delivery';
import type { Payment } from '../types/payment';
import type { Programme } from '../types/programme';

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
  getDeliveryConfirmations(programmeId: string): Promise<DeliveryConfirmation[]>;
}

export function createSdpForkClient(config: SdpForkClientConfig): SdpForkClient {
  throw new Error('Not implemented');
}
