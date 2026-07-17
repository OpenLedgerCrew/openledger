import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { fetchProgrammes } from "../api/programmes";
import { programmeStatusMeta } from "../components/lib/programmeStatus";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import type { Programme } from "../types";

const STATUS_FILTER_OPTIONS = ["DRAFT", "READY", "STARTED", "PAUSED", "COMPLETED"];

export const ProgrammeView: React.FC = () => {
  const navigate = useNavigate();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProgrammes()
      .then((data) => { if (!cancelled) setProgrammes(data); })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Handle ?select=id from home page cards
  useEffect(() => {
    const selectParam = searchParams.get("select");
    if (selectParam && programmes.length > 0) {
      const matched = programmes.find((p) => p.id === selectParam);
      if (matched) navigate(`/programmes/${matched.id}`, { replace: true });
    }
  }, [searchParams, programmes, navigate]);

  const filteredProgrammes = programmes.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = p.name.toLowerCase().includes(query);
    const matchesStatus = selectedStatus === "" || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <style>{`
        .programme-card { transition: transform 180ms ease, box-shadow 180ms ease; }
        .programme-card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(15,23,42,0.10); }
      `}</style>

      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading */}
        <section className="mb-8">
          <p className="text-sm text-muted-foreground">Browse all SAPCONE programmes and verify payments</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold font-serif text-foreground">
            All Programmes
          </h1>
        </section>

        {/* Search + filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px] flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
            <Search size={16} aria-hidden="true" className="text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search programmes"
              className="w-full border-none outline-none text-sm bg-transparent text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Custom select wrapper so the chevron sits in the right place */}
          <div className="relative flex-shrink-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
              className="appearance-none rounded-2xl border border-border bg-card pl-4 pr-10 py-3 text-sm text-foreground min-w-[160px] cursor-pointer outline-none min-h-[44px] w-full"
            >
              <option value="">All Statuses</option>
              {STATUS_FILTER_OPTIONS.map((s) => (
                <option key={s} value={s}>{programmeStatusMeta(s).label}</option>
              ))}
            </select>
            {/* Chevron icon — absolutely positioned inside the wrapper */}
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        {loading && (
          <div className="py-24 text-center text-muted-foreground text-sm">Loading programmes…</div>
        )}

        {!loading && error && (
          <div className="py-24 text-center text-destructive text-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProgrammes.map((programme) => {
              const statusMeta = programmeStatusMeta(programme.status);
              return (
                <div
                  key={programme.id}
                  className="programme-card bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h2 className="font-serif font-bold text-lg leading-snug text-foreground">
                      {programme.name}
                    </h2>
                    <span
                      className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: statusMeta.color + "1f",
                        color: statusMeta.color,
                      }}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  {/* Card action — View button right-aligned */}
                  <div className="mt-auto flex justify-end">
                    <Button
                      asChild
                      size="sm"
                    >
                      <Link to={`/programmes/${programme.id}`}>
                        View
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}

            {filteredProgrammes.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
                No programmes match your search.
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProgrammeView;
