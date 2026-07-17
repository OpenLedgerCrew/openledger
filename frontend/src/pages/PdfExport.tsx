import React, { useState, useRef, useEffect } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { DisclosureBanner } from "../components/DisclosureBanner";
import { fetchProgrammes } from "../api/programmes";
import type { Programme } from "../types";

interface ExportJob {
  programmeId: string;
  programmeName: string;
  status: "idle" | "loading" | "success" | "error";
  error?: string;
}

export default function PdfExportPage() {
  const [availableProgrammes, setAvailableProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [waking, setWaking] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [includePayments, setIncludePayments] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [includeDelivery, setIncludeDelivery] = useState(true);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    let cancelled = false;
    setWaking(false);
    fetchProgrammes(() => { if (!cancelled) setWaking(true); }).then(({ data }) => {
      if (cancelled) return;
      setAvailableProgrammes(data);
      setLoading(false);
      setWaking(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExport = () => {
    if (!selectedId) {
      selectRef.current?.focus();
      return;
    }
    const prog = availableProgrammes.find((p) => p.id === selectedId);
    if (!prog) return;

    // Check if already exporting
    if (jobs.some((j) => j.programmeId === selectedId && j.status === "loading")) return;

    const newJob: ExportJob = {
      programmeId: prog.id,
      programmeName: prog.name,
      status: "loading",
    };
    setJobs((prev) => [newJob, ...prev.filter((j) => j.programmeId !== prog.id)]);

    const params = new URLSearchParams({
      include_payments: String(includePayments),
      include_stats: String(includeStats),
      include_delivery: String(includeDelivery),
    });

    const url = `/api/programmes/${prog.id}/export?${params}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        // Trigger browser download
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `openledger-${prog.id}-report.pdf`;
        a.click();
        URL.revokeObjectURL(a.href);
        setJobs((prev) =>
          prev.map((j) => (j.programmeId === prog.id ? { ...j, status: "success" } : j))
        );
      })
      .catch((err: Error) => {
        setJobs((prev) =>
          prev.map((j) =>
            j.programmeId === prog.id
              ? { ...j, status: "error", error: err.message }
              : j
          )
        );
      });
  };

  const selected = availableProgrammes.find((p) => p.id === selectedId);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fcf5ec",
        color: "#1a1714",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <Header />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 64px" }}>
        {/* Page title */}
        <section style={{ marginBottom: 36 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Reporting
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: 34, fontWeight: 800, color: "#1a1714" }}>
            Export Programme Report
          </h1>
          <p style={{ margin: "10px 0 0", fontSize: 15, color: "#6b7280", maxWidth: 560 }}>
            Generate a PDF audit report for any SAPCONE programme. The report includes payment
            records, delivery confirmations, and Stellar blockchain transaction hashes.
          </p>
        </section>

        {/* Main export card */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 32,
            boxShadow: "0 8px 32px rgba(26, 23, 20, 0.07)",
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: "0 0 22px", fontSize: 18, fontWeight: 700, color: "#1a1714" }}>
            Configure Export
          </h2>

          {/* Programme selector */}
          <div style={{ marginBottom: 22 }}>
            <label
              htmlFor="programme-select"
              style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}
            >
              Select Programme
            </label>
            <select
              id="programme-select"
              ref={selectRef}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 14,
                border: "1.5px solid #e5e0d8",
                backgroundColor: "#faf8f4",
                fontSize: 15,
                color: "#1a1714",
                outline: "none",
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                backgroundSize: "20px",
                paddingRight: 44,
              }}
            >
              <option value="">
                {loading ? (waking ? "Waking up the live server…" : "Loading programmes…") : "— Choose a programme —"}
              </option>
              {availableProgrammes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected programme info */}
          {selected && (
            <div
              style={{
                backgroundColor: "#5da76e0f",
                border: "1px solid #5da76e30",
                borderRadius: 14,
                padding: "14px 18px",
                marginBottom: 22,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 24 }}>📋</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: "#1a1714", fontSize: 14 }}>{selected.name}</p>
              </div>
            </div>
          )}

          {/* Include sections */}
          <div style={{ marginBottom: 26 }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#374151" }}>
              Include in Report
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <CheckOption
                id="opt-stats"
                label="Programme Statistics"
                description="Total disbursed, payment counts, delivery rate"
                checked={includeStats}
                onChange={setIncludeStats}
              />
              <CheckOption
                id="opt-payments"
                label="Payment Records"
                description="Full list of payments with reference IDs and amounts"
                checked={includePayments}
                onChange={setIncludePayments}
              />
              <CheckOption
                id="opt-delivery"
                label="Delivery Confirmation"
                description="Field delivery states and anchoring transaction hashes"
                checked={includeDelivery}
                onChange={setIncludeDelivery}
              />
            </div>
          </div>

          {/* Export button */}
          <button
            id="export-pdf-btn"
            onClick={handleExport}
            disabled={!selectedId}
            style={{
              width: "100%",
              padding: "16px 24px",
              borderRadius: 16,
              border: "none",
              backgroundColor: selectedId ? "#1a1714" : "#d1d5db",
              color: selectedId ? "#fff" : "#9ca3af",
              fontSize: 15,
              fontWeight: 700,
              cursor: selectedId ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "background 0.2s, transform 0.1s",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={e => { if (selectedId) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#2d2925"; }}
            onMouseLeave={e => { if (selectedId) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a1714"; }}
            onMouseDown={e => { if (selectedId) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.99)"; }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            <span style={{ fontSize: 18 }}>📄</span>
            Export PDF Report
          </button>
        </div>

        {/* Export jobs / history */}
        {jobs.length > 0 && (
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: "20px 24px",
              boxShadow: "0 4px 18px rgba(26, 23, 20, 0.05)",
              marginBottom: 24,
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1a1714" }}>
              Export History
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {jobs.map((job) => (
                <ExportJobRow key={job.programmeId} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* Info panel */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <InfoTile emoji="🔏" title="Tamper-Evident" body="Every report includes cryptographic transaction hashes that link to the Stellar blockchain." />
          <InfoTile emoji="📊" title="Audit-Ready" body="Reports match exactly what is shown in the web portal — no drift between online and PDF views." />
          <InfoTile emoji="🌍" title="Publicly Verifiable" body="Anyone can verify the transactions using Stellar Explorer, no account required." />
        </div>

        <DisclosureBanner />
      </div>
      <Footer />
    </div>
  );
}

/* ── Sub-components ───────────────────────────────── */

function CheckOption({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        cursor: "pointer",
        padding: "12px 14px",
        borderRadius: 12,
        border: `1.5px solid ${checked ? "#5da76e40" : "#e5e0d8"}`,
        backgroundColor: checked ? "#5da76e08" : "#faf8f4",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          marginTop: 3,
          accentColor: "#5da76e",
          width: 16,
          height: 16,
          cursor: "pointer",
          flexShrink: 0,
        }}
      />
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1714" }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{description}</p>
      </div>
    </label>
  );
}

function ExportJobRow({ job }: { job: ExportJob }) {
  const icons: Record<ExportJob["status"], string> = {
    idle: "📋",
    loading: "⏳",
    success: "✅",
    error: "❌",
  };
  const colors: Record<ExportJob["status"], string> = {
    idle: "#6b7280",
    loading: "#d97706",
    success: "#5da76e",
    error: "#b23f24",
  };
  const labels: Record<ExportJob["status"], string> = {
    idle: "Queued",
    loading: "Generating…",
    success: "Downloaded",
    error: job.error || "Export failed",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 12,
        border: "1px solid #e5e0d8",
        backgroundColor: "#faf8f4",
      }}
    >
      <span style={{ fontSize: 20 }}>{icons[job.status]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1714", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {job.programmeName}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: colors[job.status], fontWeight: 600 }}>
          {labels[job.status]}
        </p>
      </div>
      {job.status === "loading" && (
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "2.5px solid #faebbf",
            borderTopColor: "#d97706",
            animation: "spin 0.7s linear infinite",
          }}
        />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function InfoTile({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: "18px 20px",
        border: "1px solid #e5e0d8",
      }}
    >
      <span style={{ fontSize: 26 }}>{emoji}</span>
      <p style={{ margin: "10px 0 6px", fontSize: 15, fontWeight: 700, color: "#1a1714" }}>{title}</p>
      <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{body}</p>
    </div>
  );
}
