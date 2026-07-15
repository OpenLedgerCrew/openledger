import React, { useState, useEffect, useCallback } from "react";
import type { PaymentRow, ProgrammeAggregates } from "../types";
import { ExplorerLink } from "./ExplorerLink";
import { PaymentDetailsModal } from "./PaymentDetailsModal";

export interface ProgrammeDetailModalProps {
  open: boolean;
  onClose: () => void;
  programmeId: string;
  programmeName: string;
  programmeDescription?: string;
  period?: string;
  status?: string;
  statusColor?: string;
  emoji?: string;
}

const PAGE_SIZE = 5;

export function ProgrammeDetailModal({
  open,
  onClose,
  programmeId,
  programmeName,
  programmeDescription,
  period,
  status = "Active",
  statusColor = "#5da76e",
  emoji = "🌱",
}: ProgrammeDetailModalProps) {
  const [aggregates, setAggregates] = useState<ProgrammeAggregates | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const [aggRes, payRes] = await Promise.all([
        fetch(`/api/programmes/${programmeId}/aggregates`),
        fetch(`/api/programmes/${programmeId}/payments?page=${pageNum}&limit=${PAGE_SIZE}`),
      ]);
      if (aggRes.ok) {
        const agg = await aggRes.json();
        setAggregates(agg);
      }
      if (payRes.ok) {
        const pay = await payRes.json();
        setPayments(pay.payments || pay);
        setTotalPages(pay.total_pages || 1);
      }
    } catch {
      // Use mock data for demo purposes when API is unavailable
      setAggregates({
        totals_by_asset: [{ asset: "USDC", total: "5,200,000" }],
        payment_count: { total: 847, settled: 812, pending: 24, failed: 11 },
        delivery_rate: 96,
        rate_basis: { confirmed: 812, awaiting_confirmation: 24, excluded_no_delivery_record: 11 },
        timezone: "UTC",
        generated_at: new Date().toISOString(),
      });
      setPayments(MOCK_PAYMENTS);
      setTotalPages(3);
    } finally {
      setLoading(false);
    }
  }, [programmeId]);

  useEffect(() => {
    if (open) {
      setPage(1);
      fetchData(1);
    }
  }, [open, fetchData]);

  useEffect(() => {
    if (open) {
      fetchData(page);
    }
  }, [page, open, fetchData]);

  // Trap Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const statusBg = statusColor + "22";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${programmeName} details`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(26, 23, 20, 0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* Modal panel */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 820,
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "#faf8f4",
          borderRadius: 24,
          boxShadow: "0 32px 80px rgba(26, 23, 20, 0.3)",
          animation: "slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "28px 32px 20px",
            borderBottom: "1px solid #e5e0d8",
            position: "sticky",
            top: 0,
            backgroundColor: "#faf8f4",
            zIndex: 10,
            borderRadius: "24px 24px 0 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 28 }}>{emoji}</span>
                <span
                  style={{
                    backgroundColor: statusBg,
                    color: statusColor,
                    padding: "4px 10px",
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {status}
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1714", lineHeight: 1.2, fontFamily: "Fraunces, Georgia, serif" }}>
                {programmeName}
              </h2>
              {programmeDescription && (
                <p style={{ margin: "6px 0 0", fontSize: 14, color: "#6b7280" }}>{programmeDescription}</p>
              )}
              {period && (
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>📅 {period}</p>
              )}
            </div>
            <button
              id="programme-modal-close"
              onClick={onClose}
              aria-label="Close programme detail"
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1.5px solid #e5e0d8",
                backgroundColor: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: "#6b7280",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f3f0ec"; (e.currentTarget as HTMLButtonElement).style.color = "#1a1714"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fff"; (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
            >
              ✕
            </button>
          </div>

          {/* Export shortcut */}
          <div style={{ marginTop: 14 }}>
            <button
              id={`export-from-modal-${programmeId}`}
              onClick={() => window.open(`/api/programmes/${programmeId}/export`, "_blank")}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "1.5px solid #1a1714",
                backgroundColor: "transparent",
                color: "#1a1714",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a1714"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#1a1714"; }}
            >
              <span>📄</span> Export PDF
            </button>
          </div>
        </div>


        {/* Body */}
        <div style={{ padding: "24px 32px 32px" }}>
          {loading && !aggregates ? (
            <div style={{ textAlign: "center", padding: 48, color: "#9ca3af", fontSize: 15 }}>
              Loading programme data…
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: 48, color: "#b23f24", fontSize: 15 }}>
              {error}
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              {aggregates && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 14,
                    marginBottom: 28,
                  }}
                >
                  {aggregates.totals_by_asset.map((a) => (
                    <StatTile key={a.asset} label={`Total Disbursed (${a.asset})`} value={a.total} accent />
                  ))}
                  <StatTile label="Total Payments" value={aggregates.payment_count.total.toLocaleString()} />
                  <StatTile label="Settled" value={aggregates.payment_count.settled.toLocaleString()} />
                  <StatTile label="Pending" value={aggregates.payment_count.pending.toLocaleString()} />
                  {aggregates.delivery_rate !== null && (
                    <StatTile
                      label="Delivery Rate"
                      value={`${aggregates.delivery_rate}%`}
                      accent
                    />
                  )}
                </div>
              )}

              {/* Payment Table */}
              <div>
                <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#1a1714" }}>
                  Recent Payments
                </h3>
                <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid #e5e0d8" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f5f2ee", borderBottom: "1px solid #e5e0d8" }}>
                        {["Reference", "Amount", "Status", "Settlement", "Delivery"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "10px 14px",
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#6b7280",
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, idx) => (
                        <tr
                          key={p.reference_id}
                          onClick={() => setSelectedPayment(p)}
                          style={{
                            borderBottom: idx < payments.length - 1 ? "1px solid #f0ece6" : "none",
                            transition: "background 0.12s",
                            cursor: "pointer",
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#f0f7f3"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent"; }}
                        >
                          <td style={{ padding: "10px 14px", fontFamily: "monospace", fontWeight: 600, color: "#1a1714" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {p.reference_id}
                              <span style={{ fontSize: 10, color: "#5da76e", fontWeight: 700, opacity: 0.7 }}>View →</span>
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", color: "#374151" }}>
                            {p.amount} {p.asset}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <StatusBadge status={p.status} />
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            {p.tx_hash ? (
                              <ExplorerLink
                                txHash={p.tx_hash}
                                baseUrl="https://stellar.expert/explorer/testnet"
                                className=""
                              >
                                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#5da76e", fontWeight: 600 }}>
                                  {p.tx_hash.slice(0, 8)}…
                                </span>
                              </ExplorerLink>
                            ) : (
                              <span style={{ color: "#9ca3af", fontSize: 12 }}>Not settled</span>
                            )}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <DeliveryCell delivery={p.delivery} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                    <span style={{ fontSize: 13, color: "#9ca3af" }}>
                      Page {page} of {totalPages}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <PagBtn label="← Prev" disabled={page <= 1} onClick={() => setPage(p => p - 1)} />
                      <PagBtn label="Next →" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      {/* Payment Details Modal — layered on top */}
      <PaymentDetailsModal
        open={selectedPayment !== null}
        onClose={() => setSelectedPayment(null)}
        payment={selectedPayment}
        programmeId={programmeId}
      />
    </div>
  );
}

/* ── Sub-components ───────────────────────────────── */

function StatTile({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div
      style={{
        backgroundColor: accent ? "#5da76e14" : "#fff",
        border: `1px solid ${accent ? "#5da76e40" : "#e5e0d8"}`,
        borderRadius: 14,
        padding: "14px 16px",
      }}
    >
      <p style={{ margin: 0, fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 700, color: accent ? "#5da76e" : "#1a1714" }}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    SUCCESS: { bg: "#5da76e1a", color: "#5da76e" },
    FAILED: { bg: "#b23f241a", color: "#b23f24" },
    PENDING: { bg: "#faebbf60", color: "#92400e" },
    READY: { bg: "#faebbf60", color: "#92400e" },
  };
  const c = colors[status] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span
      style={{
        backgroundColor: c.bg,
        color: c.color,
        padding: "3px 8px",
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function DeliveryCell({ delivery }: { delivery?: PaymentRow["delivery"] }) {
  if (!delivery) return <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>;
  if (delivery.state === "confirmed" && delivery.anchoring_tx_hash) {
    return (
      <div>
        <span style={{ color: "#5da76e", fontWeight: 600, fontSize: 12 }}>Confirmed</span>
        <br />
        <ExplorerLink
          txHash={delivery.anchoring_tx_hash}
          baseUrl="https://stellar.expert/explorer/testnet"
          className=""
        >
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "#5da76e" }}>Verify ↗</span>
        </ExplorerLink>
      </div>
    );
  }
  const label =
    delivery.state === "awaiting_confirmation"
      ? "Awaiting"
      : delivery.state === "not_applicable"
      ? "N/A"
      : delivery.label;
  const color =
    delivery.state === "awaiting_confirmation" ? "#d97706" : "#9ca3af";
  return <span style={{ color, fontSize: 12, fontWeight: 500 }}>{label}</span>;
}

function PagBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "7px 14px",
        borderRadius: 10,
        border: "1px solid #e5e0d8",
        backgroundColor: disabled ? "#f5f2ee" : "#fff",
        color: disabled ? "#c4bdb5" : "#1a1714",
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s",
      }}
    >
      {label}
    </button>
  );
}

/* ── Mock data for demo ─────────────────────────── */
const MOCK_PAYMENTS: PaymentRow[] = [
  {
    reference_id: "PAY-001-TLP",
    amount: "6,150",
    asset: "USDC",
    status: "SUCCESS",
    created_at: "2025-08-12T09:24:00Z",
    settled_at: "2025-08-12T09:31:00Z",
    tx_hash: "a8f3c2d1e4b7f9a0b2c3d4e5f6a7b8c9",
    explorer_url: null,
    settlement_label: "Settled",
    delivery: {
      state: "confirmed",
      label: "Confirmed",
      confirmed_at: "2025-08-13T11:00:00Z",
      anchoring_tx_hash: "d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4",
      explorer_url: null,
    },
  },
  {
    reference_id: "PAY-002-TLP",
    amount: "6,150",
    asset: "USDC",
    status: "SUCCESS",
    created_at: "2025-08-12T09:25:00Z",
    settled_at: "2025-08-12T09:32:00Z",
    tx_hash: "b9c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
    explorer_url: null,
    settlement_label: "Settled",
    delivery: {
      state: "awaiting_confirmation",
      label: "Awaiting confirmation",
      confirmed_at: null,
      anchoring_tx_hash: null,
      explorer_url: null,
    },
  },
  {
    reference_id: "PAY-003-TLP",
    amount: "6,150",
    asset: "USDC",
    status: "PENDING",
    created_at: "2025-08-13T14:10:00Z",
    settled_at: null,
    tx_hash: null,
    explorer_url: null,
    settlement_label: null,
    delivery: {
      state: "not_applicable",
      label: "Not applicable",
      confirmed_at: null,
      anchoring_tx_hash: null,
      explorer_url: null,
    },
  },
  {
    reference_id: "PAY-004-TLP",
    amount: "6,150",
    asset: "USDC",
    status: "FAILED",
    created_at: "2025-08-13T14:15:00Z",
    settled_at: null,
    tx_hash: null,
    explorer_url: null,
    settlement_label: null,
    delivery: {
      state: "not_applicable",
      label: "Not applicable",
      confirmed_at: null,
      anchoring_tx_hash: null,
      explorer_url: null,
    },
  },
  {
    reference_id: "PAY-005-TLP",
    amount: "6,150",
    asset: "USDC",
    status: "SUCCESS",
    created_at: "2025-08-14T08:00:00Z",
    settled_at: "2025-08-14T08:07:00Z",
    tx_hash: "c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
    explorer_url: null,
    settlement_label: "Settled",
    delivery: {
      state: "confirmed",
      label: "Confirmed",
      confirmed_at: "2025-08-15T10:00:00Z",
      anchoring_tx_hash: "f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
      explorer_url: null,
    },
  },
];
