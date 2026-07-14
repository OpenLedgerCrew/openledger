// Section 5.5 — caching strategy, built on assumption A-6 (settled payments are immutable).

export type CacheEntryKind =
  | 'settled_payment' // no TTL: SUCCESS with a hash cannot change, the chain is append-only
  | 'pending_payment' // 30-60 seconds: it is actively moving
  | 'programme_aggregate' // 60 seconds: cheap to recompute, slight staleness is harmless
  | 'delivery_confirmations'; // 60 seconds: field-driven and arrives asynchronously

/** TTLs in milliseconds. A settled payment never expires (Infinity) — the chain is append-only. */
const TTL_MS: Record<CacheEntryKind, number> = {
  settled_payment: Infinity,
  pending_payment: 45_000, // inside the doc's 30-60s window
  programme_aggregate: 60_000,
  delivery_confirmations: 60_000,
};

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

export class ReadModelCache {
  private readonly store = new Map<string, CacheEntry>();

  set(key: string, value: unknown, kind: CacheEntryKind): void {
    const ttl = TTL_MS[kind];
    const expiresAt = ttl === Infinity ? Infinity : Date.now() + ttl;
    this.store.set(key, { value, expiresAt });
  }

  get(key: string): unknown {
    const entry = this.store.get(key);
    if (entry === undefined) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }
}
