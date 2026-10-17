import React, { useEffect, useState } from "react";
import type { PaymentDetail, PaymentStatus, DeliveryStatus } from "@/types/openledger";
import { getPaymentDetail } from "@/services/api";
import { formatDate } from "@/utils/formatters";

export interface PaymentDetailModalProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentDetailModal({
  paymentId,
  isOpen,
  onClose,
}: PaymentDetailModalProps) {
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !paymentId) {
      setPayment(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getPaymentDetail(paymentId)
      .then((data) => {
        if (isMounted) {
          setPayment(data);
          setError(null);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err?.message || "Failed to load payment detail.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [paymentId, isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !paymentId) return null;

  const getStatusBadge = (status: PaymentStatus) => {
    const styles: Record<PaymentStatus, string> = {
      SUCCESS: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300",
      FAILED: "bg-rose-500/10 text-rose-700 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300",
      PENDING: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.PENDING}`}>
        {status}
      </span>
    );
  };

  const getDeliveryStatusBadge = (status: DeliveryStatus) => {
    const styles: Record<DeliveryStatus, string> = {
      CONFIRMED: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300",
      PENDING_ESCROW: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300",
      NOT_APPLICABLE: "bg-slate-500/10 text-slate-700 border-slate-500/30 dark:bg-slate-500/20 dark:text-slate-300",
      UNCONFIRMED: "bg-zinc-500/10 text-zinc-700 border-zinc-500/30 dark:bg-zinc-500/20 dark:text-zinc-300",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.UNCONFIRMED}`}>
        {status}
      </span>
    );
  };

  const leg1ExplorerUrl =
    payment?.leg_1_funds_sent?.stellar_explorer_url ||
    payment?.leg_1_funds_sent?.explorer_url;

  const isLastMile =
    payment?.leg_2_cash_delivered?.is_lastmile ||
    Boolean(payment?.leg_2_cash_delivered?.escrow_contract_id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      data-testid="payment-detail-modal"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl z-10 max-h-[90vh] flex flex-col">
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-linear-to-r from-emerald-500 via-amber-400 to-rose-500 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border p-6 shrink-0">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Cryptographic Verification
            </div>
            <h2
              id="payment-modal-title"
              className="mt-1 text-2xl font-serif font-bold text-foreground"
            >
              {payment ? payment.reference_id : "Payment Detail"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Loading verification proof...</p>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {!loading && !error && payment && (
            <>
              {/* Payment Summary Header Bar */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Reference ID</div>
                  <div className="font-mono font-medium text-foreground mt-0.5" data-testid="modal-reference-id">
                    {payment.reference_id}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Amount</div>
                  <div className="font-semibold text-foreground mt-0.5" data-testid="modal-amount">
                    {payment.amount} {payment.asset}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Overall Status</div>
                  <div className="mt-0.5" data-testid="modal-overall-status">
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              </div>

              {/* Leg 1: Funds Sent (On-Chain Settlement) */}
              <div
                className="rounded-xl border border-border bg-card p-5 space-y-4"
                data-testid="leg-1-funds-sent"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      1
                    </span>
                    <h3 className="font-serif font-bold text-foreground">
                      Leg 1: Funds Sent (On-Chain Settlement)
                    </h3>
                  </div>
                  {getStatusBadge(payment.leg_1_funds_sent.status)}
                </div>

                <p className="text-sm text-muted-foreground">
                  {payment.leg_1_funds_sent.description ||
                    "Disbursement settled directly on the public Stellar ledger."}
                </p>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground font-medium">Transaction Hash: </span>
                    {payment.leg_1_funds_sent.tx_hash ? (
                      <span className="font-mono text-foreground break-all select-all">
                        {payment.leg_1_funds_sent.tx_hash}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">Pending settlement</span>
                    )}
                  </div>

                  {payment.leg_1_funds_sent.settled_at && (
                    <div>
                      <span className="text-muted-foreground font-medium">Settled At: </span>
                      <span className="text-foreground">
                        {formatDate(payment.leg_1_funds_sent.settled_at)}
                      </span>
                    </div>
                  )}
                </div>

                {leg1ExplorerUrl && (
                  <div className="pt-2">
                    <a
                      href={leg1ExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                      data-testid="verify-stellar-explorer-button"
                    >
                      <span>Verify on Stellar Explorer</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {/* Leg 2: Cash Delivered (Field Confirmation) */}
              <div
                className="rounded-xl border border-border bg-card p-5 space-y-4"
                data-testid="leg-2-cash-delivered"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400">
                      2
                    </span>
                    <h3 className="font-serif font-bold text-foreground">
                      Leg 2: Cash Delivered (Field Confirmation)
                    </h3>
                  </div>
                  {getDeliveryStatusBadge(payment.leg_2_cash_delivered.status)}
                </div>

                <p className="text-sm text-muted-foreground">
                  {payment.leg_2_cash_delivered.description ||
                    "Physical verification and beneficiary receipt confirmation."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground font-medium">Delivery Mode: </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        isLastMile
                          ? "bg-purple-500/10 text-purple-700 border border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-300"
                          : "bg-blue-500/10 text-blue-700 border border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300"
                      }`}
                      data-testid="delivery-mode-tag"
                    >
                      {isLastMile ? "PIN Escrow Delivery" : "Direct Delivery"}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-medium">Delivery Status: </span>
                    <span className="font-medium text-foreground">
                      {payment.leg_2_cash_delivered.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-medium">Confirmed At: </span>
                    <span className="text-foreground">
                      {payment.leg_2_cash_delivered.confirmed_at
                        ? formatDate(payment.leg_2_cash_delivered.confirmed_at)
                        : "Awaiting confirmation"}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-medium">Escrow Contract: </span>
                    <span className="font-mono text-foreground break-all select-all">
                      {payment.leg_2_cash_delivered.escrow_contract_id || "None (Direct Delivery)"}
                    </span>
                  </div>
                </div>

                {payment.leg_2_cash_delivered.anchoring_tx_hash && (
                  <div className="text-xs pt-1 border-t border-border">
                    <span className="text-muted-foreground font-medium">Anchoring Hash: </span>
                    <span className="font-mono text-foreground break-all select-all">
                      {payment.leg_2_cash_delivered.anchoring_tx_hash}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-border p-4 bg-muted/20 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-card text-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentDetailModal;
