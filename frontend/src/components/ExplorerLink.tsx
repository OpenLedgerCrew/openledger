import React from "react";

export interface ExplorerLinkProps {
  txHash: string | null;
  baseUrl: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * D-1 / I-3 — the href is built by string concatenation against the configured base URL
 * ({base}/tx/{hash}, assumption A-7); rendering performs no network call of any kind. When
 * there is no hash (status is not SUCCESS), nothing renders at all — no href="#", no disabled
 * link (section 6.1 item 5).
 */
export function ExplorerLink({ txHash, baseUrl, children, className }: ExplorerLinkProps) {
  if (!txHash) {
    return null;
  }

  return (
    <a
      href={`${baseUrl}/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children || "View on Stellar"}
    </a>
  );
}
