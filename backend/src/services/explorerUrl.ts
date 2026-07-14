/**
 * D-1 / D-6 (section 5.1) — explorer_url is computed server-side, by string concatenation
 * against the configured explorer base, in the format {base}/tx/{hash} (assumption A-7).
 *
 * No runtime chain dependency: no Horizon, no RPC, no HTTP call of any kind (section 2.4,
 * I-3: "No coupling. No API, no key, no SLA"; I-4: none at runtime). Section 5.5: "Derived
 * from the hash, with no fetch."
 */
export function buildExplorerUrl(txHash: string, baseUrl: string): string {
  return `${baseUrl}/tx/${txHash}`;
}
