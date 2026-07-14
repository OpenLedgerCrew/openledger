export interface ExplorerLinkProps {
  txHash: string | null;
  baseUrl: string;
}

/**
 * D-1 / I-3 — the href is built by string concatenation against the configured base URL
 * ({base}/tx/{hash}, assumption A-7); rendering performs no network call of any kind. When
 * there is no hash (status is not SUCCESS), nothing renders at all — no href="#", no disabled
 * link (section 6.1 item 5).
 *
 * Red-state stub: deliberately the wrong shape — a placeholder anchor — so both component
 * tests fail until the real behaviour replaces it.
 */
export function ExplorerLink(_props: ExplorerLinkProps) {
  return (
    <a href="#" data-testid="not-implemented">
      explorer
    </a>
  );
}
