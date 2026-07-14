import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Container, PageShell, Section } from "../components/ui/PageShell";
import { SiteAlert } from "../components/ui/SiteAlert";
import { StatCard } from "../components/ui/StatCard";
import { Button } from "../components/ui/button";

export default function HomePage() {
  return (
    <PageShell>
      <Section className="pt-16 sm:pt-24">
        <Container className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            100% Transparent Feed
          </span>

          <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-foreground sm:text-6xl">
            Open<span className="text-primary">Ledger</span>
          </h1>

          <p className="mt-3 text-lg text-muted-foreground">
            Transparency. Verifiable. Public.
          </p>

          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Publicly verifiable on the Stellar blockchain. Every payment from
            donors to beneficiaries, with proof of impact.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/programmes">
                View Programmes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <Section className="py-6">
        <Container>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Disbursed" value="$45,230,000" hint="USD" />
            <StatCard label="Payments" value="12,847" />
            <StatCard
              label="Delivery Rate"
              value="94.2%"
              hint="↑ 2.1% MoM"
            />
            <StatCard label="Active Programmes" value="3,421" />
          </div>
        </Container>
      </Section>

      
    </PageShell>
  );
}