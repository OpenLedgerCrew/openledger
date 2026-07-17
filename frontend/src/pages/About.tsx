import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageShell, Container, Section } from "../components/ui/PageShell";
import { DonateModal } from "../components/DonateModal";

export function About() {
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <PageShell>
      <div className="bg-background text-foreground" style={{ minHeight: "80vh" }}>
        <Section className="pt-16 pb-12">
          <Container size="narrow">
            <h1
              className="font-serif text-center font-bold text-foreground"
              style={{ fontSize: "clamp(28px, 5vw, 42px)", marginBottom: 16 }}
            >
              About OpenLedger
            </h1>
            <p
              className="text-center text-muted-foreground"
              style={{ fontSize: "clamp(15px, 2.5vw, 18px)", lineHeight: 1.6, marginBottom: 40 }}
            >
              A public transparency portal powered by the Stellar network to verify humanitarian aid disbursements.
            </p>

            <div style={{ lineHeight: "1.8", fontSize: 15, color: "var(--foreground)" }}>
              <p style={{ marginBottom: 24 }}>
                OpenLedger is developed by <strong>SAPCONE</strong> to bring absolute clarity, verifiability, and
                trust to cash transfer programs in East Africa. By anchoring each aid payment to the public
                blockchain, donors and the public can trace funds in real-time.
              </p>

              <h2
                className="font-serif font-bold"
                style={{
                  fontSize: 24,
                  marginTop: 32,
                  marginBottom: 16,
                  borderBottom: "2px solid var(--primary)",
                  paddingBottom: 6,
                  color: "var(--foreground)",
                }}
              >
                Our Core Principles
              </h2>

              <ul style={{ listStyleType: "none", paddingLeft: 0, marginBottom: 32 }}>
                {[
                  {
                    title: "Blockchain Verification",
                    body: "Every disbursement settles on the public Stellar network, generating an immutable, cryptographic proof of value transfer.",
                  },
                  {
                    title: "Privacy First",
                    body: "No Personal Identifiable Information (PII) is uploaded to the ledger. We protect donor and recipient identities.",
                  },
                  {
                    title: "Field Audit Trail",
                    body: "Final last-mile delivery is audited and verified through SAPCONE's local field officers.",
                  },
                ].map((item) => (
                  <li
                    key={item.title}
                    style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-start" }}
                  >
                    <CheckCircle2
                      size={20}
                      aria-hidden="true"
                      style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }}
                    />
                    <div>
                      <strong style={{ color: "var(--foreground)" }}>{item.title}:</strong>{" "}
                      <span style={{ color: "var(--muted-foreground)" }}>{item.body}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Support Mission */}
              <div
                style={{
                  backgroundColor: "color-mix(in oklch, var(--primary) 10%, var(--card))",
                  border: "1.5px dashed var(--primary)",
                  borderRadius: 16,
                  padding: 24,
                  textAlign: "center",
                  marginTop: 40,
                }}
              >
                <h3 className="font-serif font-bold" style={{ fontSize: 20, marginBottom: 12, color: "var(--foreground)" }}>
                  Support Our Mission
                </h3>
                <p style={{ color: "var(--muted-foreground)", fontSize: 14, marginBottom: 20 }}>
                  Your support enables us to expand transparency tools to more programs and communities.
                  Donate on-chain to directly fund cash transfer systems.
                </p>
                <button
                  onClick={() => setDonateOpen(true)}
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                    border: "none",
                    borderRadius: 12,
                    padding: "12px 28px",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px color-mix(in oklch, var(--primary) 40%, transparent)",
                    transition: "opacity 0.2s",
                    minHeight: 44,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Donate to Sapcone
                </button>
              </div>
            </div>
          </Container>
        </Section>
      </div>

      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} />
    </PageShell>
  );
}
