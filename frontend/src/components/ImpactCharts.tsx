import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProgrammeAggregates } from "../types";

export interface ImpactChartsProps {
  aggregates: ProgrammeAggregates;
}

const STATUS_COLORS = {
  settled: "#5da76e",
  pending: "#d97706",
  failed: "#b23f24",
};

/**
 * Reports-with-charts: visualizes the same aggregate data already shown as numbers, so a
 * non-technical donor can read programme impact at a glance.
 */
export function ImpactCharts({ aggregates }: ImpactChartsProps) {
  const assetData = aggregates.totals_by_asset.map((t) => ({
    asset: t.asset,
    total: Number.parseFloat(t.total.replace(/,/g, "")) || 0,
  }));

  const statusData = [
    { name: "Settled", value: aggregates.payment_count.settled, color: STATUS_COLORS.settled },
    { name: "Pending", value: aggregates.payment_count.pending, color: STATUS_COLORS.pending },
    { name: "Failed", value: aggregates.payment_count.failed, color: STATUS_COLORS.failed },
  ].filter((d) => d.value > 0);

  const hasAssetData = assetData.length > 0;
  const hasStatusData = statusData.length > 0;

  if (!hasAssetData && !hasStatusData) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 16,
        marginTop: 24,
      }}
    >
      {hasAssetData && (
        <ChartCard title="Total disbursed by asset">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={assetData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" vertical={false} />
              <XAxis dataKey="asset" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e0d8", fontSize: 12 }}
                formatter={(value: number) => [value.toLocaleString(), "Total disbursed"]}
              />
              <Bar dataKey="total" fill="#5da76e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {hasStatusData && (
        <ChartCard title="Payments by status">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e0d8", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {aggregates.delivery_rate !== null && (
        <ChartCard title="Delivery rate">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 220 }}>
            <p style={{ fontSize: 44, fontWeight: 800, color: "#5da76e", margin: 0 }}>
              {(aggregates.delivery_rate * 100).toFixed(1)}%
            </p>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "8px 0 0", textAlign: "center" }}>
              {aggregates.rate_basis.confirmed} confirmed / {aggregates.rate_basis.confirmed + aggregates.rate_basis.awaiting_confirmation} with a delivery record
            </p>
            <div style={{ width: "80%", height: 10, borderRadius: 9999, backgroundColor: "#f0ece6", marginTop: 14, overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, aggregates.delivery_rate * 100)}%`,
                  height: "100%",
                  backgroundColor: "#5da76e",
                  borderRadius: 9999,
                }}
              />
            </div>
          </div>
        </ChartCard>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e0d8",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#1a1714" }}>{title}</p>
      {children}
    </div>
  );
}
