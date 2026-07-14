import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Wallet,
  Globe,
  CheckCircle,
  Users,
  BadgeDollarSign,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Container, PageShell, Section } from "../components/ui/PageShell";

export default function AboutPage() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Blockchain Verified",
      description:
        "Every aid payment is permanently recorded on the Stellar blockchain.",
    },

    {
      icon: Globe,
      title: "Public Transparency",
      description:
        "Anyone can independently verify every completed transaction.",
    },
    {
      icon: CheckCircle,
      title: "Proof of Impact",
      description:
        "Every payment is accompanied by verifiable delivery information.",
    },
    {
      icon: Users,
      title: "Beneficiary Focused",
      description:
        "Designed around accountability while protecting beneficiary privacy.",
    },

  ];

  return (
    <PageShell>
      {/* Hero */}
      <Section className="py-24">
        <Container className="text-center max-w-4xl">
          <span className="inline-flex rounded-full border border-border bg-card px-4 py-1 text-sm text-muted-foreground">
            About OpenLedger
          </span>

          <h1 className="mt-6 font-serif text-5xl sm:text-6xl">
            Making Humanitarian Aid
            <span className="text-primary"> Transparent</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
            OpenLedger enables donors, humanitarian organizations and the public
            to verify every aid payment on the Stellar blockchain. Every
            donation becomes traceable, accountable and transparent.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/programmes">
                Explore Programmes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Mission */}
      <Section className="py-20">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-8 shadow-sm">
              <h2 className="font-serif text-3xl">Our Mission</h2>

              <p className="mt-5 text-muted-foreground leading-7">
                To eliminate opacity in humanitarian funding by providing
                publicly verifiable financial records that increase trust
                between donors, NGOs and beneficiaries.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-8 shadow-sm">
              <h2 className="font-serif text-3xl">Our Vision</h2>

              <p className="mt-5 text-muted-foreground leading-7">
                A future where every humanitarian donation can be independently
                verified, creating greater transparency, accountability and
                confidence in aid delivery worldwide.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Features */}
      <Section className="py-24">
        <Container>
          <div className="text-center">
            <h2 className="font-serif text-4xl">
              Why OpenLedger?
            </h2>

            <p className="mt-4 text-muted-foreground">
              Designed to make humanitarian aid transparent and trustworthy.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-card p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Statistics */}
      <Section className="py-20 bg-primary text-primary-foreground">
        <Container>
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div>
              <h3 className="text-5xl font-bold">12K+</h3>
              <p className="mt-2 text-primary-foreground/80">
                Payments Verified
              </p>
            </div>

            <div>
              <h3 className="text-5xl font-bold">$45M</h3>
              <p className="mt-2 text-primary-foreground/80">
                Aid Tracked
              </p>
            </div>

            <div>
              <h3 className="text-5xl font-bold">94%</h3>
              <p className="mt-2 text-primary-foreground/80">
                Delivery Rate
              </p>
            </div>

            <div>
              <h3 className="text-5xl font-bold">100%</h3>
              <p className="mt-2 text-primary-foreground/80">
                Public Verification
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="py-24">
        <Container className="text-center max-w-3xl">
          <h2 className="font-serif text-4xl">
            Building Trust Through Transparency
          </h2>

          <p className="mt-5 text-muted-foreground">
            OpenLedger helps humanitarian organizations demonstrate impact while
            giving donors confidence that every contribution reaches its
            intended destination.
          </p>

          <Button asChild size="lg" className="mt-8">
            <Link to="/programmes">
              Browse Programmes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Container>
      </Section>
    </PageShell>
  );
}