import type { DeliveryConfirmation, DeliveryView } from '../types/delivery';

// Section 3.2 — LastMile integration. OpenLedger does NOT integrate with LastMile directly
// (3.2.2): delivery confirmations are read only as they surface inside the SDP fork's data
// model (C.1, C.2), so this module is a mapper over fork-provided records and owns no
// outbound connection of its own. Authentication is an open item (3.2.3) — see OI-2 in
// docs/OPEN_ITEMS.md.

/**
 * Section 3.2.1 — the payload carries only: reference ID (the join key, section 2.2), proxy
 * ID, confirmation timestamp, optional geotag, and anchoring transaction hash. No beneficiary
 * PII, never a name (L-3, L-4). Anything else in the raw record must not survive parsing.
 */
export function parseDeliveryRecord(raw: Record<string, unknown>): DeliveryConfirmation {
  throw new Error('Not implemented');
}

/**
 * D-7 three-state mapping (section 5.1): no record at all is "not applicable" — an absent
 * confirmation is not a failed delivery; a record without confirmed_at is "awaiting
 * confirmation".
 */
export function toDeliveryView(record: DeliveryConfirmation | null | undefined): DeliveryView {
  throw new Error('Not implemented');
}
