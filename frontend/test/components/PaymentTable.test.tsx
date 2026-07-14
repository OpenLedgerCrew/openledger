import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PaymentTable } from '../../src/components/PaymentTable';
import { awaitingPayment, noRecordPayment, paymentRow, readyPayment } from '../helpers/api';

// Doc section 6.1 — the payment table.

describe('PaymentTable (doc section 6.1)', () => {
  // 6.1 item 5 — "A READY payment appears in the table with no explorer link and the label
  // 'Not yet settled.' It is not styled as an error."
  it('6.1 item 5 — READY row renders "Not yet settled.", no explorer link, no error styling', () => {
    const { container } = render(
      <PaymentTable payments={[readyPayment]} page={1} totalPages={1} />,
    );
    const label = screen.getByText('Not yet settled.');
    expect(label).toBeInTheDocument();
    expect(label.className).not.toMatch(/error|danger|fail|alert/i);
    // No explorer link — an anchor pointing at a transaction must not exist for READY rows.
    expect(container.querySelector('a[href*="/tx/"]')).toBeNull();
  });

  // 6.1 item 6 — "A payment with no LastMile record shows delivery as 'Not applicable,'
  // visibly distinct from 'Awaiting confirmation.'" Two different render paths, not the same
  // fallback (D-7 three-state model).
  it('6.1 item 6 — "Not applicable" and "Awaiting confirmation" are two distinct rendered strings', () => {
    render(
      <PaymentTable payments={[noRecordPayment, awaitingPayment]} page={1} totalPages={1} />,
    );
    const notApplicable = screen.getByText('Not applicable');
    const awaiting = screen.getByText('Awaiting confirmation');
    expect(notApplicable).toBeInTheDocument();
    expect(awaiting).toBeInTheDocument();
    expect(notApplicable).not.toBe(awaiting);
    expect(notApplicable.closest('tr')).not.toBe(awaiting.closest('tr'));
  });

  // 6.1 item 4 — "The payment table renders paginated."
  it('6.1 item 4 — a pagination control exists once data exceeds one page', () => {
    const payments = Array.from({ length: 25 }, (_, i) =>
      paymentRow({ reference_id: `REF-${String(i + 1).padStart(3, '0')}` }),
    );
    render(<PaymentTable payments={payments} page={1} totalPages={2} />);
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
  });
});
