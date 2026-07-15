import React, { useState } from "react";
import { PageShell, Container, Section } from "../components/ui/PageShell";
import { Button } from "../components/ui/button";

export function About() {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateStep, setDonateStep] = useState(1); // 1: Select details, 2: Send payment, 3: Success
  const [asset, setAsset] = useState("USDC");
  const [amount, setAmount] = useState("100");
  const [txHash, setTxHash] = useState("");

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDonateStep(2);
  };

  const handleConfirmSent = () => {
    // Generate a mock Stellar tx hash
    const chars = "0123456789abcdef";
    let hash = "";
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * 16)];
    }
    setTxHash(hash);
    setDonateStep(3);
  };

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
                  onClick={() => {
                    setShowDonateModal(true);
                    setDonateStep(1);
                  }}
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
              maxWidth: "480px",
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

            {donateStep === 1 && (
              <form onSubmit={handleDonateSubmit}>
                <h3 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
                  Select Donation Amount
                </h3>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "8px" }}>
                    Select Asset
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {["USDC", "XLM", "KES"].map((cur) => (
                      <button
                        type="button"
                        key={cur}
                        onClick={() => setAsset(cur)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "10px",
                          border: asset === cur ? "2px solid #5da76e" : "1px solid #d1d5db",
                          backgroundColor: asset === cur ? "#5da76e14" : "#ffffff",
                          color: asset === cur ? "#5da76e" : "#374151",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "8px" }}>
                    Amount
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "16px",
                      fontWeight: 600,
                      outline: "none",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    backgroundColor: "#5da76e",
                    color: "#ffffff",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Continue
                </button>
              </form>
            )}

            {donateStep === 2 && (
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>
                  Send Donation
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
                  Please send exactly <strong>{amount} {asset}</strong> to the Stellar address below.
                </p>

                {/* QR Code Placeholder */}
                <div
                  style={{
                    width: "160px",
                    height: "160px",
                    backgroundColor: "#f5f5f5",
                    margin: "0 auto 20px",
                    border: "1px solid #eee",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <div style={{ width: "120px", height: "120px", border: "4px solid #1a1714", position: "relative" }}>
                    <div style={{ position: "absolute", top: 10, left: 10, right: 10, bottom: 10, background: "#5da76e" }}></div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#fcf5ec",
                    padding: "12px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    border: "1px solid #e5e0d8",
                    color: "#1a1714",
                    marginBottom: "24px",
                  }}
                >
                  GBXTLP...DONATE...SAPCONE...KEY
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("GBXTLPDONATESAPCONEKEY");
                      alert("Address copied!");
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: "#ffffff",
                      border: "1px solid #d1d5db",
                      padding: "12px",
                      borderRadius: "10px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Copy Address
                  </button>
                  <button
                    onClick={handleConfirmSent}
                    style={{
                      flex: 1,
                      backgroundColor: "#5da76e",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    I Have Sent Funds
                  </button>
                </div>
              </div>
            )}

            {donateStep === 3 && (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "#5da76e1a",
                    color: "#5da76e",
                    fontSize: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  ✓
                </div>
                <h3 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>
                  Thank You!
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
                  Your donation of <strong>{amount} {asset}</strong> has been received and verified.
                </p>

                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "12px",
                    borderRadius: "10px",
                    textAlign: "left",
                    marginBottom: "24px",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280" }}>TRANSACTION HASH</div>
                  <div style={{ fontSize: "11px", fontFamily: "monospace", wordBreak: "break-all", marginTop: "4px" }}>
                    {txHash}
                  </div>
                </div>

                <button
                  onClick={() => setShowDonateModal(false)}
                  style={{
                    width: "100%",
                    backgroundColor: "#1a1714",
                    color: "#ffffff",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </PageShell>
  );
}
