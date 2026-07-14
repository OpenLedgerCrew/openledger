import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExplorerLink } from '../../src/components/ExplorerLink';
import { EXPLORER_BASE, TX_HASH } from '../helpers/api';

// D-1 / I-3 (doc sections 5.1, 2.4) — the explorer link is pure string concatenation:
// "No coupling. No API, no key, no SLA."

afterEach(() => vi.restoreAllMocks());

describe('ExplorerLink (doc sections 2.4 I-3, 5.1 D-1, 6.1 item 5)', () => {
  it('D-1 / I-3 — href is built by concatenation against the configured base; rendering makes zero network calls', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<ExplorerLink txHash={TX_HASH} baseUrl={EXPLORER_BASE} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `${EXPLORER_BASE}/tx/${TX_HASH}`);
    // Same discipline as the backend cache test (section 5.5: "Derived from the hash, with
    // no fetch").
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // 6.1 item 5 — consistent with walkthrough 1: a payment with no hash gets no link at all.
  it('6.1 item 5 — no hash (status is not SUCCESS): no link renders at all — no href="#", no disabled link, just absence', () => {
    const { container } = render(<ExplorerLink txHash={null} baseUrl={EXPLORER_BASE} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container.querySelector('a')).toBeNull();
  });
});
