import type { DonationRecord } from "./lib/types";
import { stroopsToXlm } from "./lib/contract";

interface Props {
  donations: DonationRecord[];
  loading: boolean;
}

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatDate(ts: bigint) {
  // Soroban ledger timestamps are Unix seconds
  return new Date(Number(ts) * 1000).toLocaleString();
}

export function DonationHistory({ donations, loading }: Props) {
  return (
    <div>
      <h4
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: "16px",
          fontWeight: 700,
          marginBottom: "10px",
          color: "#1a1714",
        }}
      >
        Donation History
      </h4>

      {loading && (
        <p style={{ fontSize: "13px", color: "#6b7280" }} aria-live="polite">
          Loading donations…
        </p>
      )}

      {!loading && donations.length === 0 && (
        <p style={{ fontSize: "13px", color: "#6b7280" }}>No donations yet. Be the first!</p>
      )}

      {!loading && donations.length > 0 && (
        <div
          role="region"
          aria-label="Donation history table"
          tabIndex={0}
          style={{
            maxHeight: "220px",
            overflowY: "auto",
            borderRadius: "12px",
            border: "1px solid #e5e0d8",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f3f0ec", position: "sticky", top: 0 }}>
                <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>
                  Donor
                </th>
                <th style={{ textAlign: "right", padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>
                  Amount
                </th>
                <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {[...donations].reverse().map((d, i) => (
                <tr key={i} style={{ borderTop: "1px solid #e5e0d8" }}>
                  <td style={{ padding: "8px 12px" }}>
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${d.donor}`}
                      target="_blank"
                      rel="noreferrer"
                      title={d.donor}
                      style={{ color: "#5da76e", fontFamily: "monospace", fontWeight: 600 }}
                    >
                      {truncate(d.donor)}
                    </a>
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#1a1714" }}>
                    {stroopsToXlm(d.amount)} XLM
                  </td>
                  <td style={{ padding: "8px 12px", color: "#6b7280" }}>{formatDate(d.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
