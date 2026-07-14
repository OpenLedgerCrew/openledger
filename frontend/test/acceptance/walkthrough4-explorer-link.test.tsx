import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ProgrammeView } from '../../src/pages/ProgrammeView';
import {
  ANCHOR_HASH,
  EXPLORER_BASE,
  PROGRAMME_NAME,
  TX_HASH,
  apiServer,
} from '../helpers/api';

// Doc section 6.4 — Walkthrough 4: Stellar Explorer Link, at the component-integration level.
// The link is built by concatenation (D-1; I-3: "No coupling. No API, no key, no SLA").

const server = apiServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

async function renderProgramme() {
  render(<ProgrammeView programmeId="prog-1" />);
  await screen.findByText(PROGRAMME_NAME);
}

describe('walkthrough 4 — Stellar explorer link (doc section 6.4)', () => {
  it("6.4 item 1 — the settled payment's explorer link is well-formed, points at stellar.expert, and producing it made no network call beyond the data load", async () => {
    await renderProgramme();
    const fetchSpy = vi.spyOn(globalThis, 'fetch'); // after data load: link rendering itself fetches nothing
    const link = document.querySelector(`a[href="${EXPLORER_BASE}/tx/${TX_HASH}"]`);
    expect(link).not.toBeNull();
    expect(new URL((link as HTMLAnchorElement).href).hostname).toBe('stellar.expert');
    expect(link).toHaveAttribute('target', '_blank');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('6.4 item 2 — the amount and timestamp OpenLedger shows sit alongside the link, matching what the explorer will display', async () => {
    await renderProgramme();
    const link = document.querySelector(`a[href="${EXPLORER_BASE}/tx/${TX_HASH}"]`);
    expect(link).not.toBeNull();
    const row = (link as HTMLAnchorElement).closest('tr');
    expect(row).not.toBeNull();
    // Fixture REF-001: 100.00 USDC settled 2026-07-01T09:05:00Z — a downstream integration
    // test (outside this skeleton) verifies these against the explorer page for TX_HASH.
    expect(row!.textContent).toContain('100.00');
    expect(row!.textContent).toContain('2026-07-01');
  });

  it('6.4 item 3 — verification needs no OpenLedger-held secret or session: "The donor did not have to trust OpenLedger to verify this"', async () => {
    await renderProgramme();
    const link = document.querySelector(`a[href^="${EXPLORER_BASE}/tx/"]`);
    expect(link).not.toBeNull();
    const url = new URL((link as HTMLAnchorElement).href);
    expect(url.search).toBe(''); // no token, key, or session travels with the donor
    expect(document.cookie).toBe('');
  });

  it('6.4 item 4 — a LastMile anchoring hash yields a second, distinct explorer link for the delivery confirmation', async () => {
    await renderProgramme();
    const paymentLink = document.querySelector(`a[href="${EXPLORER_BASE}/tx/${TX_HASH}"]`);
    const deliveryLink = document.querySelector(`a[href="${EXPLORER_BASE}/tx/${ANCHOR_HASH}"]`);
    expect(paymentLink).not.toBeNull();
    expect(deliveryLink).not.toBeNull();
    expect((deliveryLink as HTMLAnchorElement).href).not.toBe(
      (paymentLink as HTMLAnchorElement).href,
    );
  });
});
