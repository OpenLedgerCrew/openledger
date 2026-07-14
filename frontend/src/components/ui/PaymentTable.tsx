import type { PaymentRow } from '../../types';

export interface PaymentTableProps {
  payments: PaymentRow[];
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

/**
 * Section 6.1 — the paginated payment table. READY rows carry the label "Not yet settled."
 * with no explorer link and no error styling (item 5); delivery renders the three-state model
 * (item 6, D-7): "Not applicable" is visibly distinct from "Awaiting confirmation".
 */
export function PaymentTable(_props: PaymentTableProps) {
  return <table data-testid="not-implemented" />;
}
