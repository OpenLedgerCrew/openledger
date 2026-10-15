import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import type { PaymentRow, ProgrammeAggregates, Programme } from "../types";
import { fetchProgrammes } from "../api/programmes";
import { programmeStatusMeta } from "../components/lib/programmeStatus";
import { AiSummaryCard } from "../components/AiSummaryCard";
import { DisclosureBanner } from "../components/DisclosureBanner";
import { EmailReportButton } from "../components/EmailReportButton";
import { ExplorerLink } from "../components/ExplorerLink";
import { ImpactCharts } from "../components/ImpactCharts";
import { PaymentDetailsModal } from "../components/PaymentDetailsModal";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { formatDeliveryRate } from "../utils/formatters";

export function ProgrammeDetail() {
  const { programmeId } = useParams<{ programmeId: string }>();
  const navigate = useNavigate();

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [aggregates, setAggregates] = useState<ProgrammeAggregates | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programmeId) return;
    fetchProgrammes()
      .then((res) => {
        const list = res.data;
        const found = list.find((p: Programme) => p.id === programmeId);
        if (found) {
          setProgramme(found);
        }
      })
      .catch((err) => console.error("Error fetching programme name:", err));
  }, [programmeId]);

  const fetchData = useCallback(async (pageNum: number) => {
    if (!programmeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/programmes/${programmeId}?page=${pageNum}`);
      if (!res.ok) throw new Error(`Failed to load programme (${res.status})`);
      const body = await res.json();
      setAggregates(body.aggregates);
      setPayments(body.payments ?? []);
      setTotalPages(body.pagination?.total_pages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load programme data");
    } finally {
      setLoading(false);
    }
  }, [programmeId]);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  if (!programmeId) return null;

  const statusMeta = programmeStatusMeta(programme?.status ?? "DRAFT");
  const statusBg = statusMeta.color + "22";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fcf5ec",
        color: "#1a1714",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <main style={{ flex: 1, padding: "32px 24px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Back button */}
          <button
            onClick={() => navigate("/programmes")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              color: "#5da76e",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              padding: 0,
              marginBottom: 24,
            }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Programmes
          </button>

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
              {/* Header section */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 28,
                  borderBottom: "1px solid #e5e0d8",
                  paddingBottom: 24,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span
                      style={{
                        backgroundColor: statusBg,
                        color: statusMeta.color,
                        padding: "4px 10px",
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 32,
                      fontWeight: 700,
                      color: "#1a1714",
                      lineHeight: 1.2,
                      fontFamily: "Fraunces, Georgia, serif",
                    }}
                  >
                    {programme?.name ?? "Programme Details"}
                  </h1>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <button
                    id={`export-from-modal-${programmeId}`}
                    onClick={() => window.open(`/api/programmes/${programmeId}/export.pdf`, "_blank")}
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
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a1714";
                      (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "#1a1714";
                    }}
                  >
                    <FileText className="h-4 w-4" /> Export PDF
                  </button>
                  {aggregates && (
                    <EmailReportButton
                      programmeId={programmeId}
                      programmeName={programme?.name ?? ""}
                      aggregates={aggregates}
                    />
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              {aggregates && (
                <>
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
                        value={formatDeliveryRate(aggregates.delivery_rate)}
                        accent
                      />
                    )}
                  </div>

                  <ImpactCharts aggregates={aggregates} />
                </>
              )}

              {/* AI transparency summary */}
              <div style={{ margin: "28px 0" }}>
                <AiSummaryCard programmeId={programmeId} />
              </div>

              {/* Payment Table */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 700, color: "#1a1714" }}>
                  Recent Payments
                </h3>
                <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid #e5e0d8", backgroundColor: "#ffffff" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f5f2ee", borderBottom: "1px solid #e5e0d8" }}>
                        {["Reference", "Amount", "Status", "Settlement", "Delivery", "Action"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "12px 14px",
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
                      {payments.map((p, idx) => {
                        console.log("RENDER_PAYMENT:", p);
                        return (
                        <tr
                          key={p.reference_id}
                          style={{
                            borderBottom: idx < payments.length - 1 ? "1px solid #f0ece6" : "none",
                            transition: "background 0.12s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#f0f7f3";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent";
                          }}
                        >
                          <td style={{ padding: "12px 14px", fontFamily: "monospace", fontWeight: 600, color: "#1a1714" }}>
                            <Link to={`/programmes/${programmeId}/payments/${p.reference_id}`} className="hover:underline" style={{ color: "inherit", textDecoration: "none" }}>
                              {p.reference_id}
                            </Link>
                            <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 400, marginTop: 2 }}>
                              {p.created_at ? p.created_at.split('T')[0] : ''}
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", color: "#374151" }}>
                            {p.amount} {p.asset}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <StatusBadge status={p.status} />
                          </td>
                          <td style={{ padding: "12px 14px" }}>
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
                              <span style={{ color: "#9ca3af", fontSize: 12 }}>Not yet settled.</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <DeliveryCell delivery={p.delivery} />
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <button
                              onClick={() => setSelectedPayment(p)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: "1px solid #5da76e",
                                backgroundColor: "transparent",
                                color: "#5da76e",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#5da76e";
                                (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color = "#5da76e";
                              }}
                            >
                              View Transaction
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav
                    role="navigation"
                    aria-label="Pagination"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}
                  >
                    <span style={{ fontSize: 13, color: "#9ca3af" }}>
                      Page {page} of {totalPages}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <PagBtn label="← Prev" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} />
                      <PagBtn label="Next →" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} />
                    </div>
                  </nav>
                )}
              </div>

              {/* Honest disclosure */}
              <div style={{ marginTop: 28 }}>
                <DisclosureBanner />
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Payment Details Modal */}
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
      ? "Awaiting confirmation"
      : delivery.state === "not_applicable"
      ? "Not applicable"
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
