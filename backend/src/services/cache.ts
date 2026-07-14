// Section 5.5 — caching strategy, built on assumption A-6 (settled payments are immutable).

export type CacheEntryKind =
  | 'settled_payment' // no TTL: SUCCESS with a hash cannot change, the chain is append-only
  | 'pending_payment' // 30-60 seconds: it is actively moving
  | 'programme_aggregate' // 60 seconds: cheap to recompute, slight staleness is harmless
  | 'delivery_confirmations'; // 60 seconds: field-driven and arrives asynchronously

export class ReadModelCache {
  set(key: string, value: unknown, kind: CacheEntryKind): void {
    throw new Error('Not implemented');
  }

  get(key: string): unknown {
    throw new Error('Not implemented');
  }
}
