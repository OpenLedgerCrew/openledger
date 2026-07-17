import React, { useEffect, useState } from "react";
import { DisclosureBanner } from "../components/DisclosureBanner";
import { ExplorerLink } from "../components/ExplorerLink";
import { Button } from "../components/ui/button";

export interface PaymentDetailProps {
  programmeId: string;
  referenceId: string;
}

export function PaymentDetail({ programmeId, referenceId }: PaymentDetailProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/programmes/${programmeId}/payments/${referenceId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load payment detail");
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [programmeId, referenceId]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center text-muted-foreground animate-pulse">
        Loading payment detail...
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center text-destructive">
        {error || "Payment detail not found."}
      </main>
    );
  }

  // Double check: absolutely no PII fields rendered (PII_VALUES)
  // Ensure we don't display: data.name, data.phone, data.wallet_address, data.proxy_identity, or geotag lat/lon

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-xs">
        {/* Header Section */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Reference
            </p>
            <h1 className="mt-1 text-3xl font-bold font-serif">{data.reference_id}</h1>
          </div>
          <div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                data.status === "SUCCESS"
                  ? "bg-success/10 text-success"
                  : data.status === "FAILED"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {data.status}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Amount
            </p>
            <p className="mt-1 text-2xl font-bold">
              {data.amount} {data.asset}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Created At
            </p>
            <p className="mt-1 text-sm text-foreground">
              {data.created_at ? new Date(data.created_at).toISOString().split("T")[0] : "-"}
            </p>
          </div>
          {data.settled_at && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Settled At
              </p>
              <p className="mt-1 text-sm text-foreground">
                {new Date(data.settled_at).toISOString().split("T")[0]}
              </p>
            </div>
          )}
          {data.tx_hash && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Transaction Hash
              </p>
              <div className="mt-1 font-mono text-xs text-primary flex items-center gap-1.5">
                <span>{data.tx_hash}</span>
              </div>
            </div>
          )}
        </div>

        {/* Verification Legs */}
        <div className="border-t border-border pt-6 mb-8 space-y-6">
          <h2 className="text-lg font-bold font-serif">Verifiable Steps</h2>
          
          {data.funds_leg && (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{data.funds_leg.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">On-chain settlement verification</p>
                </div>
                <ExplorerLink
                  txHash={data.funds_leg.tx_hash}
                  baseUrl="https://stellar.expert/explorer/testnet"
                >
                  <Button size="sm">
                    Verify Funds Leg
                  </Button>
                </ExplorerLink>
              </div>
            </div>
          )}

          {data.delivery_leg && (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{data.delivery_leg.label}</h3>
                  {data.delivery_leg.confirmed_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Confirmed on {new Date(data.delivery_leg.confirmed_at).toISOString().split("T")[0]}
                    </p>
                  )}
                </div>
                <ExplorerLink
                  txHash={data.delivery_leg.anchoring_tx_hash}
                  baseUrl="https://stellar.expert/explorer/testnet"
                >
                  <Button variant="secondary" size="sm">
                    Verify Delivery Leg
                  </Button>
                </ExplorerLink>
              </div>
            </div>
          )}
        </div>

        {/* Disclosure */}
        <div className="border-t border-border pt-6">
          <DisclosureBanner />
        </div>
      </div>
    </main>
  );
}
