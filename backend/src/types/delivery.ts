// Three-state delivery model per D-7 (section 5.1): an absent confirmation is not a failed
// delivery.

export type DeliveryState = 'confirmed' | 'awaiting_confirmation' | 'not_applicable';

/** Delivery confirmation as it surfaces inside the SDP fork's data model (sections 3.2.1, 3.2.2). */
export interface DeliveryConfirmation {
  reference_id: string;
  proxy_id: string;
  confirmed_at: string | null;
  geotag?: { lat: number; lon: number } | null;
  anchoring_tx_hash: string | null;
}

/**
 * Delivery leg as rendered publicly. Proxy identity and geotag never cross this boundary
 * (section 4.3).
 */
export interface DeliveryView {
  state: DeliveryState;
  label: string;
  confirmed_at: string | null;
  anchoring_tx_hash: string | null;
  explorer_url: string | null;
}
