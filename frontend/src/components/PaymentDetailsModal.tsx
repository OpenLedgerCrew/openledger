import React, { useEffect } from "react";
import type { PaymentRow } from "../types";
import { ExplorerLink } from "./ExplorerLink";

export interface PaymentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  payment: PaymentRow | null;
  programmeId?: string;
}

export function PaymentDetailsModal({
  open,
  onClose,
  payment,
  programmeId,
}: PaymentDetailsModalProps) {
  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !payment) return null;

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    SUCCESS: { bg: "#5da76e14", text: "#5da76e", border: "#5da76e40" },
    FAILED: { bg: "#b23f2414", text: "#b23f24", border: "#b23f2440" },
    PENDING: { bg: "#faebbf80", text: "#92400e", border: "#f59e0b40" },
    READY: { bg: "#faebbf80", text: "#92400e", border: "#f59e0b40" },
  };
  const sc = statusColors[payment.status] ?? { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" };

  const createdDate = payment.created_at
    ? new Date(payment.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const settledDate = payment.settled_at
    ? new Date(payment.settled_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const stellarExplorerBase = "https://stellar.expert/explorer/testnet";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Payment details for ${payment.reference_id}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Blurred backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(26, 23, 20, 0.65)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          animation: "pdFadeIn 0.18s ease",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 540,
          backgroundColor: "#faf8f4",
          borderRadius: 24,
          boxShadow: "0 32px 80px rgba(26, 23, 20, 0.35)",
          animation: "pdSlideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          overflow: "hidden",
        }}
      >
        {/* Top accent strip */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #5da76e, #faebbf, #b23f24)" }} />

        {/* Header */}
        <div style={{ padding: "24px 28px 18px", borderBottom: "1px solid #e5e0d8" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Payment Reference
              </p>
              <h2
                style={{
                  margin: "6px 0 0",
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  color: "#1a1714",
                  wordBreak: "break-all",
                }}
              >
                {payment.reference_id}
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginTop: 4 }}>
              <span
                style={{
                  backgroundColor: sc.bg,
                  color: sc.text,
                  border: `1px solid ${sc.border}`,
                  padding: "4px 12px",
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {payment.status}
              </span>
              <button
                id="payment-modal-close"
                onClick={onClose}
                aria-label="Close payment details"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1.5px solid #e5e0d8",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: "#6b7280",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f3f0ec"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fff"; }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 28px 28px" }}>
          {/* Amount hero */}
          <div
            style={{
              backgroundColor: "#5da76e0f",
              border: "1px solid #5da76e30",
              borderRadius: 16,
              padding: "18px 20px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ fontSize: 28 }}>💰</span>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#5da76e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Payment Amount
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800, color: "#1a1714" }}>
                {payment.amount}{" "}
                <span style={{ fontSize: 16, fontWeight: 500, color: "#6b7280" }}>{payment.asset}</span>
              </p>
            </div>
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <InfoField label="Created" value={createdDate} />
            {settledDate && <InfoField label="Settled" value={settledDate} />}
            {programmeId && <InfoField label="Programme ID" value={programmeId} mono />}
            {payment.settlement_label && <InfoField label="Settlement" value={payment.settlement_label} />}
          </div>

          {/* Transaction Hash */}
          {payment.tx_hash && (
            <div
              style={{
                backgroundColor: "#f5f2ee",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 20,
              }}
            >
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Transaction Hash
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#1a1714",
                  wordBreak: "break-all",
                  lineHeight: 1.6,
                }}
              >
                {payment.tx_hash}
              </p>
            </div>
          )}

          {/* Verifiable Steps */}
          <div style={{ borderTop: "1px solid #e5e0d8", paddingTop: 18, marginBottom: 20 }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#1a1714", fontFamily: "Fraunces, Georgia, serif" }}>
              Verifiable Steps
            </p>

            {payment.tx_hash ? (
              <VerifyCard
                label="Funds Leg"
                description="On-chain settlement verification"
                txHash={payment.tx_hash}
                baseUrl={stellarExplorerBase}
                buttonLabel="Verify on Stellar ↗"
                buttonColor="#5da76e"
              />
            ) : (
              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid #e5e0d8",
                  backgroundColor: "#f9f7f4",
                  padding: "12px 16px",
                  fontSize: 13,
                  color: "#9ca3af",
                }}
              >
                No on-chain transaction yet — payment is {payment.status.toLowerCase()}.
              </div>
            )}

            {payment.delivery?.state === "confirmed" && payment.delivery.anchoring_tx_hash && (
              <div style={{ marginTop: 10 }}>
                <VerifyCard
                  label="Delivery Leg"
                  description={
                    payment.delivery.confirmed_at
                      ? `Confirmed on ${new Date(payment.delivery.confirmed_at).toLocaleDateString("en-GB")}`
                      : "Physical delivery confirmation"
                  }
                  txHash={payment.delivery.anchoring_tx_hash}
                  baseUrl={stellarExplorerBase}
                  buttonLabel="Verify Receipt ↗"
                  buttonColor="#1a1714"
                />
              </div>
            )}

            {payment.delivery?.state === "awaiting_confirmation" && (
              <div
                style={{
                  marginTop: 10,
                  borderRadius: 12,
                  border: "1px solid #f59e0b40",
                  backgroundColor: "#faebbf50",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18 }}>⏳</span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#92400e" }}>Delivery Awaiting Confirmation</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#b45309" }}>
                    Field confirmation pending upload
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes pdFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pdSlideUp {
            from { opacity: 0; transform: translateY(28px) scale(0.96); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────── */

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </p>
      <p
        style={{
          margin: "5px 0 0",
          fontSize: 14,
          fontWeight: 600,
          color: "#1a1714",
          fontFamily: mono ? "monospace" : undefined,
          wordBreak: mono ? "break-all" : undefined,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function VerifyCard({
  label,
  description,
  txHash,
  baseUrl,
  buttonLabel,
  buttonColor,
}: {
  label: string;
  description: string;
  txHash: string;
  baseUrl: string;
  buttonLabel: string;
  buttonColor: string;
}) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid #e5e0d8",
        backgroundColor: "#fff",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a1714" }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>{description}</p>
      </div>
      <ExplorerLink
        txHash={txHash}
        baseUrl={baseUrl}
        className=""
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: buttonColor,
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLSpanElement).style.opacity = "0.85"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLSpanElement).style.opacity = "1"; }}
        >
          {buttonLabel}
        </span>
      </ExplorerLink>
    </div>
  );
}
