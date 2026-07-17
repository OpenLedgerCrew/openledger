import {
  ArrowRight,
  BookOpen,
  Eye,
  ShieldCheck,
  MessageSquare,
  Mic,
  FileText,
  Volume2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { Container, PageShell, Section } from "../components/ui/PageShell";
import { StatCard } from "../components/ui/StatCard";
import { Button } from "../components/ui/button";
import { fetchGlobalAggregates, fetchProgrammes } from "../api/programmes";
import { programmeStatusMeta } from "../components/lib/programmeStatus";
import type { Programme, ProgrammeAggregates } from "../types";

const HOW_IT_WORKS = [
  {
    icon: BookOpen,
    title: "Browse Programmes",
    description:
      'Click "Programmes" in the navigation bar to see all active SAPCONE aid programmes and their current disbursement status.',
  },
  {
    icon: Eye,
    title: "Open a Programme",
    description:
      'Click "View →" on any programme card to open its dedicated detail page with statistics, charts, and the full payment ledger.',
  },
  {
    icon: ShieldCheck,
    title: "Verify a Payment",
    description:
      'Inside a programme, click any payment row to open its details. Then click "Verify on Stellar ↗" to check the transaction hash on the public blockchain — no login required.',
  },
  {
    icon: MessageSquare,
    title: "Use the Chat Assistant",
    description:
      'Click the "Assistant" button in the top navigation bar to open the chat sidebar. Ask questions about payment verification, the disclosure, PDF reports, or privacy.',
  },
  {
    icon: Mic,
    title: "Use Voice Commands",
    description:
      'Say "open ledger" to activate the microphone. A command overlay will appear listing all available voice commands — navigate, read aloud, toggle contrast, and more.',
  },
  {
    icon: FileText,
    title: "Export a Report",
    description:
      'Inside a programme detail page, click "Export PDF" to download a full impact report including statistics, charts, the payment table, and the honest-limits disclosure.',
  },
  {
    icon: Volume2,
    title: "Read a Report Aloud",
    description:
      'Open the accessibility toolbar (bottom-right wheel icon), click the speaker button to read the current page aloud. Or say "read page" after activating voice mode.',
  },
];

export default function HomePage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [aggregates, setAggregates] = useState<ProgrammeAggregates | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchProgrammes(), fetchGlobalAggregates()])
      .then(([programmesData, aggregatesData]) => {
        if (cancelled) return;
        setProgrammes(programmesData);
        setAggregates(aggregatesData);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => { cancelled = true; };
  }, []);

  const totalDisbursed =
    aggregates?.totals_by_asset.map((t) => `${t.total} ${t.asset}`).join(", ") ?? "—";
  const deliveryRate =
    aggregates?.delivery_rate !== null && aggregates?.delivery_rate !== undefined
      ? `${(aggregates.delivery_rate * 100).toFixed(1)}%`
      : "—";

  return (
    <PageShell>
      {/* Hero */}
      <Section className="pt-16 pb-12">
        <Container className="text-center">
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
            ● NGO Transparency Portal
          </span>

          <h1 className="mt-6 text-5xl font-bold font-serif text-foreground">
            Open<span className="text-primary">Ledger</span>
          </h1>

          <p className="mt-3 text-xl text-primary font-semibold">
            Transparency. Verifiable. Public.
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Publicly verifiable on the Stellar blockchain. Empowering donors with real-time
            financial tracking and proof of impact.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild>
              <Link to="/programmes">
                View Programmes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Stats */}
      <Section className="pb-10">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard label="Total Disbursed" value={totalDisbursed} />
            <StatCard
              label="Total Payments"
              value={aggregates ? aggregates.payment_count.total.toLocaleString() : "—"}
            />
            <StatCard label="Delivery Rate" value={deliveryRate} />
            <StatCard label="Active Programmes" value={programmes.length.toLocaleString()} />
          </div>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </Container>
      </Section>

      {/* Programme previews */}
      <Section className="pb-12">
        <Container>
          <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold font-serif text-foreground">Current Programmes</h2>
              <p className="text-sm text-muted-foreground">Live funding data and disbursement status.</p>
            </div>
            <Link to="/programmes" className="text-sm text-primary font-semibold hover:underline">
              See all programmes →
            </Link>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {programmes.slice(0, 3).map((programme) => {
              const statusMeta = programmeStatusMeta(programme.status);
              return (
                <div
                  key={programme.id}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="mb-3 flex justify-between items-start gap-2">
                      <h3 className="font-bold font-serif text-foreground leading-snug">{programme.name}</h3>
                      <span
                        className="rounded px-2 py-1 text-xs font-semibold flex-shrink-0 h-fit"
                        style={{
                          backgroundColor: statusMeta.color + "1f",
                          color: statusMeta.color,
                        }}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Link
                      to={`/programmes/${programme.id}`}
                      className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold min-h-[44px] transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      View →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* How It Works — 7 numbered steps */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-serif text-foreground">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Seven steps to verify aid, explore data, and use every feature of OpenLedger.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {HOW_IT_WORKS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-3"
                >
                  {/* Number badge + icon + bold title all on the same row */}
                  <div className="flex items-center gap-3">
                    <span
                      className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {index + 1}
                    </span>
                    <Icon
                      size={18}
                      aria-hidden="true"
                      className="flex-shrink-0"
                      style={{ color: "var(--primary)" }}
                    />
                    <h3 className="font-serif font-bold text-foreground leading-snug">
                      {step.title}
                    </h3>
                  </div>
                  {/* Description below */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
