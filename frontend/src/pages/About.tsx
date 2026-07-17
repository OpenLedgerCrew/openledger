import { useCallback, useEffect, useState } from "react";
import { PageShell, Container, Section } from "../components/ui/PageShell";
import { WalletConnect } from "../components/donation/WalletConnect";
import { Stats } from "../components/donation/Stats";
import { DonateForm } from "../components/donation/DonateForm";
import { DonationHistory } from "../components/donation/DonationHistory";
import { fetchStats, fetchDonations } from "../components/donation/lib/contract";
import type { WalletState, ContractStats, DonationRecord } from "../components/donation/lib/types";

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
      <div style={{ backgroundColor: "#fcf5ec", minHeight: "80vh", color: "#1a1714" }}>
        <Section className="pt-16 pb-12">
          <Container size="narrow">
            <h1
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: "42px",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              About OpenLedger
            </h1>
            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.6",
                color: "#6b7280",
                textAlign: "center",
                marginBottom: "40px",
              }}
            >
              A public transparency portal powered by the Stellar network to verify humanitarian aid disbursements.
            </p>

            <div style={{ lineHeight: "1.8", fontSize: "15px", color: "#374151" }}>
              <p style={{ marginBottom: "24px" }}>
                OpenLedger is developed by <strong>SAPCONE</strong> to bring absolute clarity, verifiability, and trust to cash transfer programs in East Africa.
                By anchoring each aid payment to the public blockchain, donors and the public can trace funds in real-time.
              </p>

              <h2
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: "24px",
                  fontWeight: 700,
                  marginTop: "32px",
                  marginBottom: "16px",
                  borderBottom: "2px solid #5da76e",
                  paddingBottom: "6px",
                }}
              >
                Our Core Principles
              </h2>
              <ul style={{ listStyleType: "none", paddingLeft: 0, marginBottom: "32px" }}>
                <li style={{ marginBottom: "16px", display: "flex", gap: "12px", alignItems: "start" }}>
                  <span style={{ color: "#5da76e", fontWeight: "bold" }}>✓</span>
                  <div>
                    <strong>Blockchain Verification:</strong> Every disbursement settles on the public Stellar network, generating an immutable, cryptographic proof of value transfer.
                  </div>
                </li>
                <li style={{ marginBottom: "16px", display: "flex", gap: "12px", alignItems: "start" }}>
                  <span style={{ color: "#5da76e", fontWeight: "bold" }}>✓</span>
                  <div>
                    <strong>Privacy First:</strong> No Personal Identifiable Information (PII) is uploaded to the ledger. We protect donor and recipient identities.
                  </div>
                </li>
                <li style={{ marginBottom: "16px", display: "flex", gap: "12px", alignItems: "start" }}>
                  <span style={{ color: "#5da76e", fontWeight: "bold" }}>✓</span>
                  <div>
                    <strong>Field Audit Trail:</strong> Final last-mile delivery is audited and verified through SAPCONE's local field officers.
                  </div>
                </li>
              </ul>

              <div
                style={{
                  backgroundColor: "#5da76e1a",
                  border: "1.5px dashed #5da76e",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                  marginTop: "40px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "Fraunces, Georgia, serif",
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "12px",
                    color: "#1a1714",
                  }}
                >
                  Support Our Mission
                </h3>
                <p style={{ color: "#4b5563", fontSize: "14px", marginBottom: "20px" }}>
                  Your support enables us to expand transparency tools to more programs and communities. Donate on-chain to directly fund cash transfer systems.
                </p>
                <button
                  onClick={() => setShowDonateModal(true)}
                  style={{
                    backgroundColor: "#5da76e",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 28px",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(93, 167, 110, 0.4)",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  Donate to OpenLedger
                </button>
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
