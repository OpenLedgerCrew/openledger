import React from "react";
import type { PaymentRow } from "../../types";
import { ExplorerLink } from "../ExplorerLink";

export interface PaymentTableProps {
  payments: PaymentRow[];
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function PaymentTable({ payments, page, totalPages, onPageChange }: PaymentTableProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground font-medium">
              <th className="p-4">Reference ID</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Settlement</th>
              <th className="p-4">Delivery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((p) => {
              const isReady = p.status === "READY";
              
              // Delivery representation: three-state model per D-7 (section 5.1).
              let deliveryText = p.delivery?.label || "";
              if (p.delivery?.state === "not_applicable") {
                deliveryText = "Not applicable";
              } else if (p.delivery?.state === "awaiting_confirmation") {
                deliveryText = "Awaiting confirmation";
              }

              return (
                <tr key={p.reference_id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-mono font-medium">
                    <a href={`/programmes/prog-1/payments/${p.reference_id}`} className="hover:underline">
                      {p.reference_id}
                    </a>
                  </td>
                  <td className="p-4">
                    {p.amount} {p.asset}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.status === "SUCCESS"
                          ? "bg-success/10 text-success"
                          : p.status === "FAILED"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {isReady ? (
                      <span className="text-muted-foreground">Not yet settled.</span>
                    ) : (
                      <ExplorerLink
                        txHash={p.tx_hash}
                        baseUrl="https://stellar.expert/explorer/testnet"
                        className="text-primary hover:underline font-mono text-xs"
                      >
                        {p.tx_hash ? `${p.tx_hash.slice(0, 8)}...` : ""}
                      </ExplorerLink>
                    )}
                  </td>
                  <td className="p-4">
                    {p.delivery?.state === "confirmed" && p.delivery.anchoring_tx_hash ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-success">{deliveryText}</span>
                        <ExplorerLink
                          txHash={p.delivery.anchoring_tx_hash}
                          baseUrl="https://stellar.expert/explorer/testnet"
                          className="text-primary hover:underline font-mono text-xs"
                        >
                          Verify Receipt
                        </ExplorerLink>
                      </div>
                    ) : (
                      <span className={p.delivery?.state === "awaiting_confirmation" ? "text-warning font-medium" : "text-muted-foreground"}>
                        {deliveryText}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav
          role="navigation"
          aria-label="Pagination"
          className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6"
        >
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="relative inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
              className="relative ml-3 inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Page <span className="font-medium">{page}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
                <button
                  disabled={page <= 1}
                  onClick={() => onPageChange?.(page - 1)}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => onPageChange?.(pNum)}
                    aria-current={pNum === page ? "page" : undefined}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-border hover:bg-muted ${
                      pNum === page ? "bg-primary text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => onPageChange?.(page + 1)}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
