import type { FilteredPaymentRecord, RawPaymentRecord } from '../types/payment';

/**
 * Section 4 — PII stripped server-side at this adapter boundary (D-3, section 2.2 step 3).
 *
 * Output may contain ONLY the fields listed in the section 4.2 table. The section 4.3 fields
 * are hard prohibitions (O-4: zero PII anywhere in the portal), and the receiver's wallet
 * address must be stripped wherever it appears, under any key (section 4.4: "Not in the UI,
 * not in the API response, not in the PDF, not in the page source").
 */
export function filterPayment(raw: RawPaymentRecord): FilteredPaymentRecord {
  throw new Error('Not implemented');
}
