import type { CSSProperties } from "react";
import type { ContractStats } from "./lib/types";
import { stroopsToXlm } from "./lib/contract";

interface Props {
  stats: ContractStats | null;
  loading: boolean;
}

const cardStyle: CSSProperties = {
  border: "1px solid #e5e0d8",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "14px 16px",
};

export function Stats({ stats, loading }: Props) {
  if (loading) {
    return (
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}
        aria-busy="true"
        aria-label="Loading stats"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ ...cardStyle, height: "64px", backgroundColor: "#f3f0ec", animation: "pulse 1.4s ease-in-out infinite" }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
      <div style={cardStyle}>
        <span style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Total Donated
        </span>
        <span style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "#5da76e", marginTop: "6px" }}>
          {stroopsToXlm(stats.totalDonated)} XLM
        </span>
      </div>
      <div style={cardStyle}>
        <span style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Contract Balance
        </span>
        <span style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "#1a1714", marginTop: "6px" }}>
          {stroopsToXlm(stats.balance)} XLM
        </span>
      </div>
      <div style={cardStyle}>
        <span style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Total Donations
        </span>
        <span style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "#1a1714", marginTop: "6px" }}>
          {stats.donationCount}
        </span>
      </div>
    </div>
  );
}
