import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PaymentDetail } from '../../src/pages/PaymentDetail';
import { ProgrammeView } from '../../src/pages/ProgrammeView';
import { PII_VALUES, PROGRAMME_NAME, TX_HASH, apiServer } from '../helpers/api';

// Doc section 6.2 — Walkthrough 2: Payment Verification, at the component-integration level.

const server = apiServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('walkthrough 2 — payment verification (doc section 6.2)', () => {
  it('6.2 item 1 — a payment in the table is selectable: its row links to the detail view', async () => {
    render(<ProgrammeView programmeId="prog-1" />);
    await screen.findByText(PROGRAMME_NAME);
    const rowLink = screen.getByRole('link', { name: /REF-001/ });
    expect(rowLink).toHaveAttribute('href', expect.stringContaining('REF-001'));
  });

  it('6.2 item 2 — the detail view shows reference ID, amount, status, timestamps, and the transaction hash', async () => {
    render(<PaymentDetail programmeId="prog-1" referenceId="REF-001" />);
    expect(await screen.findByText(/REF-001/)).toBeInTheDocument();
    expect(screen.getByText(/100\.00/)).toBeInTheDocument();
    expect(screen.getByText(/SUCCESS/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-07-01/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(TX_HASH.slice(0, 16)))).toBeInTheDocument();
  });

  it('6.2 item 3 — both legs render where the data exists, each honestly labelled, with the 4.5 disclosure reachable from this view', async () => {
    render(<PaymentDetail programmeId="prog-1" referenceId="REF-001" />);
    expect(await screen.findByText('Funds sent')).toBeInTheDocument();
    expect(screen.getByText('Cash confirmed delivered')).toBeInTheDocument();
    // The disclosure copy is reachable from the detail view, not just the programme view.
    expect(screen.getByText('How to read this page')).toBeInTheDocument();
  });

  it('6.2 item 4 — no name, no phone, no wallet address, no proxy, no geotag in the rendered detail view', async () => {
    render(<PaymentDetail programmeId="prog-1" referenceId="REF-001" />);
    // Positive anchor first: the view must have rendered real payment data.
    expect(await screen.findByText(/REF-001/)).toBeInTheDocument();
    // The API fixture deliberately smuggles PII fields (section 4.1); the component must
    // render only the public contract (sections 4.3, 4.4).
    const rendered = document.body.textContent ?? '';
    for (const value of PII_VALUES) {
      expect(rendered).not.toContain(value);
    }
  });
});
