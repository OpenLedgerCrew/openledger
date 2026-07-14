import type { FilteredPaymentRecord, RawPaymentRecord } from '../types/payment';

/**
 * Section 4 — PII stripped server-side at this adapter boundary (D-3, section 2.2 step 3).
 *
 * Output may contain ONLY the fields listed in the section 4.2 table. The section 4.3 fields
 * are hard prohibitions (O-4: zero PII anywhere in the portal), and the receiver's wallet
 * address must be stripped wherever it appears, under any key (section 4.4: "Not in the UI,
 * not in the API response, not in the PDF, not in the page source").
 */
function asStringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/**
 * Rebuild the record from a fixed allowlist of the section 4.2 fields. Every other field in the
 * raw upstream record — name, phone, wallet address, proxy identity, geotag, and any key we
 * have not enumerated — is dropped by construction (D-3). A smuggled wallet address (under any
 * key, at any nesting depth) cannot survive because it is never copied across (section 4.4).
 */
export function filterPayment(raw: RawPaymentRecord): FilteredPaymentRecord {
  return {
    reference_id: String(raw.reference_id ?? ''),
    amount: String(raw.amount ?? ''),
    asset: String(raw.asset ?? ''),
    status: raw.status as FilteredPaymentRecord['status'],
    created_at: String(raw.created_at ?? ''),
    settled_at: asStringOrNull(raw.settled_at),
    tx_hash: asStringOrNull(raw.tx_hash),
    delivery_confirmed_at: asStringOrNull(raw.delivery_confirmed_at),
  };
}
