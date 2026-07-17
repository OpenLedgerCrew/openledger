import { useCallback, useEffect, useState } from "react";
import { PageShell, Container, Section } from "../components/ui/PageShell";
import { WalletConnect } from "../components/donation/WalletConnect";
import { Stats } from "../components/donation/Stats";
import { DonateForm } from "../components/donation/DonateForm";
import { DonationHistory } from "../components/donation/DonationHistory";
import { fetchStats, fetchDonations } from "../components/donation/lib/contract";
import type { WalletState, ContractStats, DonationRecord } from "../components/donation/lib/types";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
const DEFAULT_WALLET: WalletState = { connected: false, publicKey: null, network: null };

export function About() {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [wallet, setWallet] = useState<WalletState>(DEFAULT_WALLET);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDonationData = useCallback(async () => {
    setStatsLoading(true);
    setHistoryLoading(true);
    setLoadError(null);
    try {
      const [s, d] = await Promise.all([fetchStats(), fetchDonations()]);
      setStats(s);
      setDonations(d);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load contract data");
    } finally {
      setStatsLoading(false);
      setHistoryLoading(false);
    }
  }, []);

  // Public, anonymous contract reads only — no wallet touched. Fires when the donate modal
  // opens (not on page mount) so a plain visit to /about never makes an RPC call.
  useEffect(() => {
    if (showDonateModal) loadDonationData();
  }, [showDonateModal, loadDonationData]);

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

                 <Button
                  onClick={() => setShowDonateModal(true)}
                  size="lg"
                  className="flex items-center gap-2 mx-auto"
                >
                  <CheckCircle2 size={18} />
                  Donate to SAPCONE
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </div>

      {/* Donation Modal overlay */}
      {showDonateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(26, 23, 20, 0.4)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            animation: "fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "32px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              position: "relative",
              border: "1px solid #e5e0d8",
            }}
          >
            <button
              onClick={() => setShowDonateModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "#f3f0ec",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontWeight: "bold",
                color: "#6b7280",
              }}
            >
              ✕
            </button>

            <h3 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>
              Donate to OpenLedger
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
              Donations settle on-chain via a Stellar Soroban smart contract — connect a wallet
              to send XLM directly, no intermediary.
            </p>

            <WalletConnect
              wallet={wallet}
              onConnect={setWallet}
              onDisconnect={() => setWallet(DEFAULT_WALLET)}
            />

            <Stats stats={stats} loading={statsLoading} />

            {loadError && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "20px",
                  fontSize: "13px",
                  color: "#b91c1c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
                role="alert"
              >
                <span>Could not reach contract: {loadError}</span>
                <button
                  onClick={loadDonationData}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#b91c1c",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            <DonateForm wallet={wallet} onSuccess={loadDonationData} />

            <DonationHistory donations={donations} loading={historyLoading} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </PageShell>
  );
}
