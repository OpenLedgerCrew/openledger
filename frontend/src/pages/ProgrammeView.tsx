import React, { useState } from "react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { DisclosureBanner } from "../components/DisclosureBanner";
import { ProgrammeDetailModal } from "../components/ProgrammeDetailModal";

const programmes = [
  {
    title: "Turkana Livelihoods Programme",
    description: "Cash transfers for fisherfolk in Kalokol, Turkana County",
    period: "Q3 2025 - Q2 2026",
    budget: "5.2M KES",
    delivery: "96%",
    reach: "847",
    status: "Active",
    statusColor: "#10b981",
    
  },
  {
    title: "Kakuma Refugee Programme",
    description: "Cash assistance for refugee families in Kakuma camp",
    period: "Q1 2025 - Q4 2025",
    budget: "3.8M KES",
    delivery: "92%",
    reach: "612",
    status: "Active",
    statusColor: "#10b981",
   
  },
  {
    title: "Omo Valley Cross-Border Programme",
    description: "Cross-border cash transfers for pastoralists in Omo region",
    period: "Q2 2025 - Q1 2026",
    budget: "2.1M KES",
    delivery: "88%",
    reach: "423",
    status: "On Hold",
    statusColor: "#d97706",
    
  },
  {
    title: "Kakuma Health & Nutrition Programme",
    description: "Health and nutrition support for refugee communities",
    period: "Q3 2025 - Q2 2026",
    budget: "1.8M KES",
    delivery: "94%",
    reach: "356",
    status: "Active",
    statusColor: "#10b981",
   
  },
];

const stats = [
  { label: "Total disbursed (KES)", value: "45,230,000" },
  { label: "Total payments", value: "12,847" },
  { label: "Delivery rate", value: "94.2%" },
  { label: "Beneficiaries", value: "3,421" },
];

export interface ProgrammeViewProps {
  programmeId?: string;
}

export const ProgrammeView: React.FC<ProgrammeViewProps> = ({ programmeId }) => {
  const [selectedProg, setSelectedProg] = useState<(typeof programmes)[0] | null>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fcf5ec",
        color: "#111827",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <Header />
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 48px" }}
      >
        <section style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
                Browse all SAPCONE programmes and verify payments
              </p>
              <h1 style={{ margin: "8px 0 0", fontSize: 36, fontWeight: 700 }}>
                All Programmes
              </h1>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 18,
                  padding: 20,
                  boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {stat.label}
                </p>
                <p
                  style={{ margin: "12px 0 0", fontSize: 24, fontWeight: 700 }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              flex: "1 1 320px",
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid #e5e7eb",
            }}
          >
            <span style={{ color: "#9ca3af", fontSize: 18 }}>🔎</span>
            <input
              type="text"
              placeholder="Search programmes..."
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: 14,
                backgroundColor: "transparent",
              }}
            />
          </div>
          <button
            style={{
              borderRadius: 14,
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              padding: "14px 18px",
              fontSize: 14,
              color: "#374151",
              minWidth: 180,
              cursor: "pointer",
            }}
          >
            Filter by Status ▾
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {programmes.map((programme) => (
            <div
              key={programme.title}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 24,
                padding: 24,
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 30px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {programme.emoji} {programme.title}
                  </h2>
                </div>
                <span
                  style={{
                    backgroundColor: programme.statusColor + "1f",
                    color: programme.statusColor,
                    padding: "6px 12px",
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {programme.status}
                </span>
              </div>
              <p style={{ margin: "0 0 16px", color: "#6b7280", fontSize: 14 }}>
                {programme.description}
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#4b5563",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>📅</span>
                {programme.period}
              </p>

              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  margin: "20px 0 0",
                  paddingTop: 20,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                  textAlign: "left",
                }}
              >
                <div>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>
                    Budget
                  </p>
                  <p
                    style={{ margin: "8px 0 0", fontSize: 16, fontWeight: 700 }}
                  >
                    {programme.budget}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>
                    Delivery
                  </p>
                  <p
                    style={{ margin: "8px 0 0", fontSize: 16, fontWeight: 700 }}
                  >
                    {programme.delivery}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>
                    Reach
                  </p>
                  <p
                    style={{ margin: "8px 0 0", fontSize: 16, fontWeight: 700 }}
                  >
                    {programme.reach}
                  </p>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <button
                  id={`view-programme-${programme.title.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => setSelectedProg(programme)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#047857",
                    fontWeight: 700,
                    textDecoration: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "inherit",
                  }}
                >
                  View Programme →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 28,
            backgroundColor: "#fef3c7",
            border: "1px solid #fde68a",
            borderRadius: 18,
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 18 }}>⚠️</span>
          <p
            style={{ margin: 0, color: "#92400e", fontSize: 14, maxWidth: 900 }}
          >
            Attention: This portal shows funds movement. Physical delivery is
            confirmed through SAPCONE's field processes.
          </p>
        </div>
        <DisclosureBanner />
      </div>
      <Footer />

      {/* Programme Detail Modal */}
      <ProgrammeDetailModal
        open={selectedProg !== null}
        onClose={() => setSelectedProg(null)}
        programmeId={selectedProg?.title.replace(/\s+/g, '-').toLowerCase() ?? ""}
        programmeName={selectedProg?.title ?? ""}
        programmeDescription={selectedProg?.description}
        period={selectedProg?.period}
        status={selectedProg?.status}
        statusColor={selectedProg?.statusColor}
        emoji={selectedProg?.emoji}
      />
    </div>
  );
};

export default ProgrammeView;
