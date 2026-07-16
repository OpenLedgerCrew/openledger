import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProgrammes } from "../api/programmes";
import { programmeStatusMeta } from "../components/lib/programmeStatus";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { ProgrammeDetailModal } from "../components/ProgrammeDetailModal";
import type { Programme } from "../types";

const STATUS_FILTER_OPTIONS = ["DRAFT", "READY", "STARTED", "PAUSED", "COMPLETED"];

export const ProgrammeView: React.FC = () => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProg, setSelectedProg] = useState<Programme | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProgrammes()
      .then((data) => {
        if (cancelled) return;
        setProgrammes(data);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const selectParam = searchParams.get("select");
    if (selectParam) {
      const matched = programmes.find((p) => p.id === selectParam);
      if (matched) {
        setSelectedProg(matched);
      }
    }
  }, [searchParams, programmes]);

  const filteredProgrammes = programmes.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = p.name.toLowerCase().includes(query);
    const matchesStatus = selectedStatus === "" || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <style>{`
        .programme-card{ transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease; }
        .programme-card:hover{ transform: translateY(-6px); box-shadow: 0 14px 40px rgba(15,23,42,0.12); border-color: rgba(0,0,0,0.06); }
        .programme-action{ transition: color 120ms ease, transform 120ms ease; }
        .programme-action:hover{ transform: translateY(-2px); }
        .programme-action-view:hover{ color: #3b7f55; }
        .programme-action-pdf:hover{ color: #8a2b1b; }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#fcf5ec",
          color: "#1a1714",
        }}
      >
        <Header />
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "32px 24px 48px",
          }}
        >
          <section style={{ marginBottom: 32 }}>
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
                placeholder="Search by name..."
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
              {STATUS_FILTER_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {programmeStatusMeta(s).label}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: 48, color: "#9ca3af", fontSize: 15 }}>
              Loading programmes…
            </div>
          )}

          {!loading && error && (
            <div style={{ textAlign: "center", padding: 48, color: "#b23f24", fontSize: 15 }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              {filteredProgrammes.map((programme) => {
                const statusMeta = programmeStatusMeta(programme.status);
                return (
                  <div
                    key={programme.id}
                    className="programme-card"
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
                          {programme.name}
                        </h2>
                        <span
                          style={{
                            backgroundColor: statusMeta.color + "1f",
                            color: statusMeta.color,
                            padding: "6px 12px",
                            borderRadius: 9999,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {statusMeta.label}
                        </span>
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
                        id={`view-programme-${programme.id}`}
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
                        className="programme-action programme-action-view"
                      >
                        View Programme →
                      </button>
                      <button
                        onClick={() =>
                          window.open(`/api/programmes/${programme.id}/export.pdf`, "_blank")
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
                        className="programme-action programme-action-pdf"
                      >
                        <span>📄</span> PDF
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />

        {/* Programme Detail Modal */}
        <ProgrammeDetailModal
          open={selectedProg !== null}
          onClose={() => setSelectedProg(null)}
          programmeId={selectedProg?.id ?? ""}
          programmeName={selectedProg?.name ?? ""}
          status={selectedProg?.status}
        />
      </div>
    </>
  );
};
export default ProgrammeView;
