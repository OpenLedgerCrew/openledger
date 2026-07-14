import {
  LABEL_DELIVERY_AWAITING,
  LABEL_DELIVERY_LEG,
  LABEL_DELIVERY_NOT_APPLICABLE,
} from '../constants/labels';
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
  const geotag =
    raw.geotag && typeof raw.geotag === 'object'
      ? (raw.geotag as DeliveryConfirmation['geotag'])
      : null;
  return {
    reference_id: String(raw.reference_id ?? ''),
    proxy_id: String(raw.proxy_id ?? ''),
    confirmed_at: typeof raw.confirmed_at === 'string' ? raw.confirmed_at : null,
    geotag,
    anchoring_tx_hash: typeof raw.anchoring_tx_hash === 'string' ? raw.anchoring_tx_hash : null,
  };
}

/**
 * D-7 three-state mapping (section 5.1): no record at all is "not applicable" — an absent
 * confirmation is not a failed delivery; a record without confirmed_at is "awaiting
 * confirmation".
 */
export function toDeliveryView(record: DeliveryConfirmation | null | undefined): DeliveryView {
  // No record at all: the payment was never routed through a proxy, so an absent confirmation
  // is "not applicable", never a failed delivery (D-7, section 6.1 item 6).
  if (!record) {
    return {
      state: 'not_applicable',
      label: LABEL_DELIVERY_NOT_APPLICABLE,
      confirmed_at: null,
      anchoring_tx_hash: null,
      explorer_url: null,
    };
  }

  // A record exists but no confirmation timestamp: the field process has not reported yet.
  if (!record.confirmed_at) {
    return {
      state: 'awaiting_confirmation',
      label: LABEL_DELIVERY_AWAITING,
      confirmed_at: null,
      anchoring_tx_hash: record.anchoring_tx_hash,
      explorer_url: null,
    };
  }

  // Confirmed. Where the confirmation was anchored on-chain, a second explorer link is offered
  // (section 6.4 item 4). proxy_id and geotag are deliberately never carried across (section 4.3).
  return {
    state: 'confirmed',
    label: LABEL_DELIVERY_LEG,
    confirmed_at: record.confirmed_at,
    anchoring_tx_hash: record.anchoring_tx_hash,
    explorer_url: null,
  };
}
