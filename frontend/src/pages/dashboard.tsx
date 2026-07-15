import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Container, PageShell, Section } from "../components/ui/PageShell";
import { StatCard } from "../components/ui/StatCard";
import { Button } from "../components/ui/button";

const programmes = [
  {
    title: "Turkana Livelihoods Programme",
    description: "Cash transfers for fisherfolk in Kalokol, Turkana County",
    amount: "5.2M KES",
    beneficiaries: "847",
  },
  {
    title: "Kakuma Refugee Programme",
    description: "Cash assistance for refugee families in Kakuma camp",
    amount: "3.8M KES",
    beneficiaries: "612",
  },
  {
    title: "Omo Valley Cross-Border Programme",
    description: "Cross-border cash transfers for pastoralists in Omo region",
    amount: "2.1M KES",
    beneficiaries: "423",
  },
];

export default function HomePage() {
  return (
    <PageShell>
      {/* Hero */}
      <Section className="pt-16 pb-12">
        <Container className="text-center">
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
            ● NGO Transparency Portal
          </span>

          <h1 className="mt-6 text-5xl font-bold font-serif" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
            Open<span className="text-green-700">Ledger</span>
          </h1>

          <p className="mt-3 text-xl text-green-700 font-semibold">
            Transparency. Verifiable. Public.
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Publicly verifiable on the Stellar blockchain. Empowering donors
            with real-time financial tracking and proof of impact.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Button asChild>
              <Link to="/programmes">
                View Programmes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Stats */}
      <Section className="pb-10">
        <Container>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Total Disbursed"
              value="45,230,000"
              hint="KES"
            />

            <StatCard
              label="Beneficiaries"
              value="12,847"
            />

            <StatCard
              label="Delivery Rate"
              value="94.2%"
              hint="↗"
            />

            <StatCard
              label="Active Programmes"
              value="3,421"
            />
          </div>
        </Container>
      </Section>

      {/* Programmes */}
      <Section className="pb-12">
        <Container>
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold font-serif" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
                Current Programmes
              </h2>

              <p className="text-sm text-muted-foreground">
                Live funding data and disbursement status.
              </p>
            </div>

            <Link
              to="/programmes"
              className="text-sm text-green-700 font-semibold"
            >
              See all programmes →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {programmes.map((programme) => (
              <div
                key={programme.title}
                className="rounded-lg border border-green-200 bg-yellow-50 p-6 shadow-sm transition hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="mb-3 flex justify-between">
                    <h3 className="font-bold font-serif" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
                      {programme.title}
                    </h3>

                    <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 font-semibold h-fit">
                      Active
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    {programme.description}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="text-2xl font-bold">
                    {programme.amount}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {programme.beneficiaries} beneficiaries
                  </div>
                  
                  <Link
                    to={`/programmes?select=${programme.title.replace(/\s+/g, "-").toLowerCase()}`}
                    className="mt-5 inline-block text-sm font-semibold text-green-700 hover:text-green-800"
                  >
                    VIEW →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* How It Works */}
      <Section className="py-16">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">

            <div className="rounded-lg bg-stone-100 p-8">
              <h2 className="mb-8 text-3xl font-bold font-serif" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
                How It Works
              </h2>

              <div className="space-y-8">

                <div className="flex gap-4">
                  <span style={{ color: "#5da76e", fontSize: "20px" }}>✓</span>
                  <div>
                    <h3 className="font-semibold">
                      Funds deposited
                    </h3>
                    <p className="text-sm text-gray-600">
                      Donations are converted into digital assets.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span style={{ color: "#5da76e", fontSize: "20px" }}>✓</span>
                  <div>
                    <h3 className="font-semibold">
                      Immutable Tracking
                    </h3>
                    <p className="text-sm text-gray-600">
                      Every transaction is anchored to Stellar.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span style={{ color: "#5da76e", fontSize: "20px" }}>✓</span>
                  <div>
                    <h3 className="font-semibold">
                      Field Verification
                    </h3>
                    <p className="text-sm text-gray-600">
                      Receipts and confirmations are uploaded afterwards.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <div className="rounded-lg border bg-white p-8 shadow">
              <p className="text-sm text-muted-foreground">
                TX HASH
              </p>

              <div className="mt-6 space-y-4">
                <div className="h-3 rounded bg-gray-200"></div>
                <div className="h-3 rounded bg-gray-200"></div>
                <div className="h-3 w-2/3 rounded bg-gray-200"></div>
              </div>

              <div className="mt-10 rounded border bg-green-50 p-4 text-center text-green-700 font-semibold">
                Verified on Stellar
              </div>

              <div className="mt-8 flex items-center gap-2 text-xl font-bold">
                <span style={{ color: "#5da76e" }}>✓</span>
                Verified
              </div>
            </div>

          </div>
        </Container>
      </Section>
    </PageShell>
  );
}