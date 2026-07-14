export interface PaymentDetailProps {
  programmeId: string;
  referenceId: string;
}

/**
 * Section 6.2 — the payment detail view: reference ID, amount, status, timestamps, and the
 * transaction hash (item 2); both legs where the data exists — funds sent and cash confirmed
 * delivered — each honestly labelled (item 3); zero PII (item 4, section 4.3).
 */
export function PaymentDetail(_props: PaymentDetailProps) {
  return <main data-testid="not-implemented" />;
}
