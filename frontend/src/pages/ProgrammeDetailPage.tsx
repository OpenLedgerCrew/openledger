import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FileText, X, ArrowRight, Eye } from "lucide-react";
import type { PaymentRow, ProgrammeAggregates } from "../types";
import { fetchProgrammeDetail } from "../api/programmes";
import { programmeStatusMeta } from "../components/lib/programmeStatus";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AiSummaryCard } from "../components/AiSummaryCard";
import { DisclosureBanner } from "../components/DisclosureBanner";
import { EmailReportButton } from "../components/EmailReportButton";
import { ExplorerLink } from "../components/ExplorerLink";
import { ImpactCharts } from "../components/ImpactCharts";
import { PaymentDetailsModal } from "../components/PaymentDetailsModal";
import { Button } from "../components/ui/button";

export function ProgrammeDetailPage() {
  const { programmeId } = useParams<{ programmeId: string }>();

  const [programmeName, setProgrammeName] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [aggregates, setAggregates] = useState<ProgrammeAggregates | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const chartsRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(
    async (pageNum: number) => {
      if (!programmeId) return;
      setLoading(true);
      // Falls back to a captured real-data snapshot internally if the backend is unreachable —
      // only genuinely resolves to null when the programme id doesn't exist anywhere.
      const body = await fetchProgrammeDetail(programmeId, pageNum);
      if (!body) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProgrammeName(body.name ?? programmeId);
      setStatus(body.status ?? "");
      setAggregates(body.aggregates);
      setPayments(body.payments ?? []);
      setTotalPages(body.pagination?.total_pages ?? 1);
      setLoading(false);
    },
    [programmeId],
  );

  useEffect(() => { fetchData(1); }, [fetchData]);
  useEffect(() => { if (page > 1) fetchData(page); }, [page, fetchData]);

  useEffect(() => {
    document.title = programmeName ? `${programmeName} — OpenLedger` : "Programme — OpenLedger";
    return () => { document.title = "OpenLedger"; };
  }, [programmeName]);

  const handleExportPdf = async () => {
    if (!programmeId) return;
    // Capture chart images if charts are rendered
    let chartImages: { bar?: string; pie?: string } = {};
    if (chartsRef.current) {
      try {
        const svgs = chartsRef.current.querySelectorAll("svg");
        const toDataUrl = (svg: SVGElement): string => {
          const serializer = new XMLSerializer();
          const svgStr = serializer.serializeToString(svg);
          const canvas = document.createElement("canvas");
          canvas.width = svg.clientWidth || 300;
          canvas.height = svg.clientHeight || 220;
          const ctx = canvas.getContext("2d");
          const img = new Image();
          img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
          return new Promise<string>((resolve) => {
            img.onload = () => { ctx?.drawImage(img, 0, 0); resolve(canvas.toDataURL("image/png")); };
            img.onerror = () => resolve("");
          }) as unknown as string;
        };
        const captures = await Promise.all(Array.from(svgs).map((s) => {
          const serializer = new XMLSerializer();
          const svgStr = serializer.serializeToString(s);
          return new Promise<string>((resolve) => {
            const canvas = document.createElement("canvas");
            canvas.width = s.clientWidth || 300;
            canvas.height = s.clientHeight || 220;
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
            img.onload = () => { ctx?.drawImage(img, 0, 0); resolve(canvas.toDataURL("image/png")); };
            img.onerror = () => resolve("");
          });
        }));
        if (captures[0]) chartImages.bar = captures[0];
        if (captures[1]) chartImages.pie = captures[1];
      } catch {
        // proceed without chart images
      }
    }

    try {
      const res = await fetch(`/api/programmes/${programmeId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chartImages }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${programmeId}-report.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // fall through to GET fallback
    }
    window.open(`/api/programmes/${programmeId}/export.pdf`, "_blank");
  };

  const statusMeta = programmeStatusMeta(status);

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-3xl font-bold font-serif text-foreground">Programme Not Found</h1>
          <p className="text-muted-foreground">
            The programme <code className="font-mono text-sm">{programmeId}</code> does not exist.
          </p>
          <Link to="/programmes" className="text-primary font-semibold hover:underline">
            ← Back to Programmes
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link to="/programmes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← All Programmes
          </Link>
        </nav>

        {loading && !aggregates ? (
          <div className="py-24 text-center text-muted-foreground">Loading programme data…</div>
        ) : (
          <>
            {/* Page header */}
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span
                    style={{
                      backgroundColor: statusMeta.color + "22",
                      color: statusMeta.color,
                      padding: "4px 12px",
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
                <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground leading-tight">
                  {programmeName || programmeId}
                </h1>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportPdf}
                  aria-label="Export PDF report"
                >
                  <FileText size={16} aria-hidden="true" />
                  Export PDF
                </Button>
                <EmailReportButton
                  programmeId={programmeId!}
                  programmeName={programmeName}
                  aggregates={aggregates}
                />
              </div>
            </div>

            {/* Stats grid */}
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
                      value={`${(aggregates.delivery_rate * 100).toFixed(1)}%`}
                      accent
                    />
                  )}
                </div>

                {/* Charts */}
                <div ref={chartsRef}>
                  <ImpactCharts aggregates={aggregates} />
                </div>
              </>
            )}

            {/* AI summary */}
            <div className="mt-8 mb-8">
              <AiSummaryCard programmeId={programmeId!} />
            </div>

            {/* Payment table */}
            <div className="mb-8">
              <h2 className="font-serif text-xl font-bold text-foreground mb-4">Recent Payments</h2>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                      {["Reference", "Amount", "Status", "Settlement", "Delivery", ""].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 14px",
                            textAlign: h === "" ? "right" : "left",
                            fontWeight: 600,
                            color: "var(--muted-foreground)",
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
                        style={{
                          borderBottom: idx < payments.length - 1 ? "1px solid var(--border)" : "none",
                          transition: "background 0.12s",
                        }}
                      >
                        <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--foreground)" }}>
                          {p.reference_id}
                        </td>
                        <td style={{ padding: "10px 14px", color: "var(--foreground)" }}>
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
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 11,
                                  color: "var(--success)",
                                  fontWeight: 600,
                                }}
                              >
                                {p.tx_hash.slice(0, 8)}…
                              </span>
                            </ExplorerLink>
                          ) : (
                            <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>Not settled</span>
                          )}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <DeliveryCell delivery={p.delivery} />
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayment(p)}
                            aria-label={`View payment ${p.reference_id}`}
                            className="text-primary hover:bg-primary/10"
                          >
                            <Eye size={16} className="mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  role="navigation"
                  aria-label="Pagination"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 16,
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                    Page {page} of {totalPages}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <PagBtn label="← Prev" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} />
                    <PagBtn label="Next →" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} />
                  </div>
                </nav>
              )}
            </div>

            {/* Disclosure */}
            <DisclosureBanner />
          </>
        )}
      </main>
      <Footer />

      <PaymentDetailsModal
        open={selectedPayment !== null}
        onClose={() => setSelectedPayment(null)}
        payment={selectedPayment}
        programmeId={programmeId}
      />
    </div>
  );
}

/* ── Sub-components ──────────────────────────────── */

function StatTile({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div
      style={{
        backgroundColor: accent
          ? "color-mix(in oklch, var(--success) 10%, var(--card))"
          : "var(--card)",
        border: `1px solid ${accent ? "color-mix(in oklch, var(--success) 35%, transparent)" : "var(--border)"}`,
        borderRadius: 14,
        padding: "14px 16px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          color: "var(--muted-foreground)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 20,
          fontWeight: 700,
          color: accent ? "var(--success)" : "var(--foreground)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    SUCCESS: { bg: "color-mix(in oklch, var(--success) 15%, transparent)", color: "var(--success)" },
    FAILED: { bg: "color-mix(in oklch, var(--destructive) 15%, transparent)", color: "var(--destructive)" },
    PENDING: { bg: "#faebbf60", color: "#92400e" },
    READY: { bg: "#faebbf60", color: "#92400e" },
  };
  const c = colors[status] ?? { bg: "var(--muted)", color: "var(--muted-foreground)" };
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
  if (!delivery) return <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>—</span>;
  if (delivery.state === "confirmed" && delivery.anchoring_tx_hash) {
    return (
      <div>
        <span style={{ color: "var(--success)", fontWeight: 600, fontSize: 12 }}>Confirmed</span>
        <br />
        <ExplorerLink
          txHash={delivery.anchoring_tx_hash}
          baseUrl="https://stellar.expert/explorer/testnet"
          className=""
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--success)" }}>
            Verify ↗
          </span>
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
  const color = delivery.state === "awaiting_confirmation" ? "#d97706" : "var(--muted-foreground)";
  return <span style={{ color, fontSize: 12, fontWeight: 500 }}>{label}</span>;
}

function PagBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}
