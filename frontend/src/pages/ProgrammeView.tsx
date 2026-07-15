import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
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
    location: "Turkana",
    emoji: "🌱",
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
    location: "Kakuma",
    emoji: "⛺",
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
    location: "Omo Valley",
    emoji: "🌍",
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
    location: "Kakuma",
    emoji: "🏥",
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

export const ProgrammeView: React.FC<ProgrammeViewProps> = ({
  programmeId,
}) => {
  const [selectedProg, setSelectedProg] = useState<
    (typeof programmes)[0] | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const selectParam = searchParams.get("select");
    if (selectParam) {
      const matched = programmes.find(
        (p) => p.title.replace(/\s+/g, "-").toLowerCase() === selectParam,
      );
      if (matched) {
        setSelectedProg(matched);
      }
    }
  }, [searchParams]);

  const filteredProgrammes = programmes.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      p.title.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);

    const matchesStatus = selectedStatus === "" || p.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fcf5ec",
        color: "#1a1714",
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
              alignItems: "center",
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
              <h1
                style={{
                  margin: "8px 0 0",
                  fontSize: 36,
                  fontWeight: 700,
                  fontFamily: "Fraunces, Georgia, serif",
                }}
              >
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

        {/* Live Search and Dropdown Filter */}
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
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid #e5e0d8",
            }}
          >
            <span style={{ color: "#9ca3af", fontSize: 18 }}>🔎</span>
            <input
              type="text"
              placeholder="Search by name or location (e.g. Turkana)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: 14,
                backgroundColor: "transparent",
              }}
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              borderRadius: 14,
              border: "1px solid #e5e0d8",
              backgroundColor: "#ffffff",
              padding: "14px 18px",
              fontSize: 14,
              color: "#374151",
              minWidth: 180,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Programmes Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {filteredProgrammes.map((programme) => (
            <div
              key={programme.title}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 24,
                padding: 24,
                border: "1px solid #e5e0d8",
                boxShadow: "0 8px 30px rgba(15, 23, 42, 0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      fontFamily: "Fraunces, Georgia, serif",
                    }}
                  >
                    {programme.title}
                  </h2>
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
                <p
                  style={{ margin: "0 0 16px", color: "#6b7280", fontSize: 14 }}
                >
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
                      style={{
                        margin: "8px 0 0",
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {programme.budget}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>
                      Delivery
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {programme.delivery}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>
                      Reach
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {programme.reach}
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <button
                  id={`view-programme-${programme.title.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => setSelectedProg(programme)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#5da76e",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 14,
                  }}
                >
                  View Programme →
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `/api/programmes/${programme.title.replace(/\s+/g, "-").toLowerCase()}/export.pdf`,
                      "_blank",
                    )
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: "#b23f24",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>📄</span> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />

      {/* Programme Detail Modal */}
      <ProgrammeDetailModal
        open={selectedProg !== null}
        onClose={() => setSelectedProg(null)}
        programmeId={
          selectedProg?.title.replace(/\s+/g, "-").toLowerCase() ?? ""
        }
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
