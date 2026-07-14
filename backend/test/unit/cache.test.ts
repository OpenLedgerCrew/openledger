import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadModelCache } from '../../src/services/cache';
import { buildExplorerUrl } from '../../src/services/explorerUrl';
import { EXPLORER_BASE, payment } from '../helpers/fixtures';

// Doc section 5.5 — caching strategy, built on assumption A-6 (settled payments are immutable).

describe('cache (doc section 5.5)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // 5.5 — "Settled payment (SUCCESS with a hash): Indefinite. It cannot change. The chain is
  // append-only."
  it('5.5 — a settled payment has no TTL: still served after time advances arbitrarily far', () => {
    const cache = new ReadModelCache();
    const settled = payment({ reference_id: 'P-1' });
    cache.set('payment:P-1', settled, 'settled_payment');
    vi.advanceTimersByTime(1000 * 60 * 60 * 24 * 365 * 10); // ten years
    expect(cache.get('payment:P-1')).toEqual(settled);
  });

  // 5.5 — "Pending payment (READY or PENDING): 30 to 60 seconds. It is actively moving."
  it('5.5 — a pending payment is evicted inside the 30-60 second TTL window', () => {
    const cache = new ReadModelCache();
    const pending = payment({ reference_id: 'P-2', status: 'READY', settled_at: null, tx_hash: null });
    cache.set('payment:P-2', pending, 'pending_payment');
    vi.advanceTimersByTime(29_000);
    expect(cache.get('payment:P-2')).toEqual(pending); // TTL must be at least 30s
    vi.advanceTimersByTime(32_000); // 61s after set — past the 60s upper bound
    expect(cache.get('payment:P-2')).toBeUndefined();
  });

  // 5.5 — "Programme aggregate: 60 seconds. Cheap to recompute and slight staleness is
  // harmless."
  it('5.5 — a programme aggregate expires after 60 seconds', () => {
    const cache = new ReadModelCache();
    const aggregate = { totals_by_asset: [] };
    cache.set('aggregate:prog-1', aggregate, 'programme_aggregate');
    vi.advanceTimersByTime(59_000);
    expect(cache.get('aggregate:prog-1')).toEqual(aggregate);
    vi.advanceTimersByTime(2_000);
    expect(cache.get('aggregate:prog-1')).toBeUndefined();
  });

  // 5.5 — "Delivery confirmations: 60 seconds. Field-driven and arrives asynchronously."
  it('5.5 — delivery confirmations expire after 60 seconds', () => {
    const cache = new ReadModelCache();
    const confirmations = [{ reference_id: 'REF-001' }];
    cache.set('deliveries:prog-1', confirmations, 'delivery_confirmations');
    vi.advanceTimersByTime(59_000);
    expect(cache.get('deliveries:prog-1')).toEqual(confirmations);
    vi.advanceTimersByTime(2_000);
    expect(cache.get('deliveries:prog-1')).toBeUndefined();
  });

  // 5.5 — "Explorer URL: Not applicable. Derived from the hash, with no fetch."
  it('5.5 — generating an explorer URL never calls any HTTP client', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const hash = 'ab'.repeat(32);
    const url = buildExplorerUrl(hash, EXPLORER_BASE);
    expect(url).toBe(`${EXPLORER_BASE}/tx/${hash}`);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
