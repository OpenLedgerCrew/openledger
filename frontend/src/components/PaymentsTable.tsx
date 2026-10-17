import React from "react";
import type { PaymentListItem, PaymentStatus, DeliveryStatus } from "@/types/openledger";
import { formatDate } from "@/utils/formatters";

export interface PaymentsTableProps {
  payments: PaymentListItem[];
  onSelectPayment: (paymentId: string) => void;
}

export function PaymentsTable({ payments, onSelectPayment }: PaymentsTableProps) {
  const getStatusBadgeStyle = (status: PaymentStatus) => {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "FAILED":
        return "bg-rose-500/10 text-rose-700 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300";
      case "PENDING":
      default:
        return "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300";
    }
  };

  const getDeliveryBadgeStyle = (status: DeliveryStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "PENDING_ESCROW":
        return "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300";
      case "NOT_APPLICABLE":
        return "bg-slate-500/10 text-slate-700 border-slate-500/30 dark:bg-slate-500/20 dark:text-slate-300";
      case "UNCONFIRMED":
      default:
        return "bg-zinc-500/10 text-zinc-700 border-zinc-500/30 dark:bg-zinc-500/20 dark:text-zinc-300";
    }
  };

  const getDeliveryMethodTag = (item: PaymentListItem) => {
    const method = item.delivery.delivery_method;
    const isLastMile =
      item.delivery.is_lastmile ||
      method === "LASTMILE_ESCROW" ||
      Boolean(item.delivery.escrow_contract_id);

    if (isLastMile) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-700 border border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-300">
          LastMile Escrow
        </span>
      );
    }

    if (method === "DIRECT_WALLET" || item.delivery.status === "NOT_APPLICABLE") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-700 border border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300">
          Direct Wallet
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border">
        {method ? method.replace(/_/g, " ") : "Direct Wallet"}
      </span>
    );
  };

  if (!payments || payments.length === 0) {
    return (
      <div
        className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground"
        data-testid="payments-table-empty"
      >
        No payments found for this programme.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm" data-testid="payments-table">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground font-medium">
              <th className="p-4 font-semibold">Reference ID</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">Disbursed Date</th>
              <th className="p-4 font-semibold">Leg 1 (On-Chain)</th>
              <th className="p-4 font-semibold">Leg 2 (Delivery)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((payment) => {
              const explorerUrl =
                payment.blockchain_tx.stellar_explorer_url ||
                payment.blockchain_tx.explorer_url;

              return (
                <tr
                  key={payment.payment_id}
                  onClick={() => onSelectPayment(payment.payment_id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectPayment(payment.payment_id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View payment details for ${payment.reference_id}`}
                  className="cursor-pointer hover:bg-muted/40 focus:bg-muted/40 focus:outline-hidden transition-colors"
                  data-testid={`payment-row-${payment.payment_id}`}
                >
                  {/* Reference ID (Pseudonymous, Zero PII) */}
                  <td className="p-4 font-mono font-medium text-foreground">
                    <span className="hover:underline">{payment.reference_id}</span>
                  </td>

                  {/* Amount */}
                  <td className="p-4 font-medium text-foreground whitespace-nowrap">
                    {payment.amount} {payment.asset}
                  </td>

                  {/* Disbursed Date */}
                  <td className="p-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(payment.disbursed_at)}
                  </td>

                  {/* Leg 1 (On-Chain) */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>

                      {explorerUrl && (
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Stellar Explorer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-muted inline-flex items-center"
                          aria-label="View on Stellar Explorer"
                          data-testid="explorer-link-leg1"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Leg 2 (Delivery) */}
                  <td className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDeliveryBadgeStyle(
                          payment.delivery.status
                        )}`}
                      >
                        {payment.delivery.status}
                      </span>
                      {getDeliveryMethodTag(payment)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentsTable;
