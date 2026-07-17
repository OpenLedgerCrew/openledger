import React, { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";

export interface DonateModalProps {
  open: boolean;
  onClose: () => void;
}

const SAPCONE_WALLET = "GBXTLP...DONATE...SAPCONE...KEY";

export function DonateModal({ open, onClose }: DonateModalProps) {
  const [step, setStep] = useState(1);
  const [asset, setAsset] = useState("USDC");
  const [amount, setAmount] = useState("100");
  const [txHash, setTxHash] = useState("");

  const reset = () => {
    setStep(1);
    setAsset("USDC");
    setAmount("100");
    setTxHash("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleConfirmSent = async () => {
    // Try backend donate endpoint; fall back to mock tx hash
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset, amount: Number(amount) }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setTxHash(data.tx_hash ?? generateMockHash());
      } else {
        setTxHash(generateMockHash());
      }
    } catch {
      setTxHash(generateMockHash());
    }
    setStep(3);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(26, 23, 20, 0.5)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Donate to Sapcone"
        style={{
          backgroundColor: "var(--card)",
          borderRadius: 24,
          width: "100%",
          maxWidth: 480,
          padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          position: "relative",
          border: "1px solid var(--border)",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close donation modal"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "var(--muted)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--muted-foreground)",
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>

        {/* Step 1: Select asset & amount */}
        {step === 1 && (
          <form onSubmit={handleSubmitStep1}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700, marginBottom: 8, color: "var(--foreground)" }}>
              Donate to Sapcone
            </h3>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginBottom: 24 }}>
              Your donation funds cash transfer programmes across East Africa.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 8 }}>
                Select Asset
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {["USDC", "XLM", "KES"].map((cur) => (
                  <button
                    type="button"
                    key={cur}
                    onClick={() => setAsset(cur)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      border: asset === cur ? "2px solid var(--primary)" : "1px solid var(--border)",
                      backgroundColor: asset === cur ? "color-mix(in oklch, var(--primary) 10%, transparent)" : "var(--card)",
                      color: asset === cur ? "var(--primary)" : "var(--foreground)",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 8 }}>
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
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  fontSize: 16,
                  fontWeight: 600,
                  outline: "none",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                padding: "14px",
                borderRadius: 12,
                border: "none",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              Continue →
            </button>
          </form>
        )}

        {/* Step 2: Send payment */}
        {step === 2 && (
          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, marginBottom: 8, color: "var(--foreground)" }}>
              Send {amount} {asset}
            </h3>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginBottom: 20 }}>
              Send exactly <strong style={{ color: "var(--foreground)" }}>{amount} {asset}</strong> to the Stellar address below.
            </p>

            {/* QR placeholder */}
            <div
              style={{
                width: 160, height: 160,
                backgroundColor: "var(--muted)",
                margin: "0 auto 20px",
                border: "1px solid var(--border)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div style={{ width: 120, height: 120, border: "4px solid var(--foreground)", position: "relative" }}>
                <div style={{ position: "absolute", top: 10, left: 10, right: 10, bottom: 10, background: "var(--primary)" }} />
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--muted)",
                padding: "12px 16px",
                borderRadius: 10,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                wordBreak: "break-all",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                marginBottom: 24,
                textAlign: "left",
              }}
            >
              {SAPCONE_WALLET}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(SAPCONE_WALLET);
                }}
                style={{
                  flex: 1,
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  padding: "12px",
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--foreground)",
                  fontSize: 13,
                  minHeight: 44,
                }}
              >
                Copy Address
              </button>
              <button
                onClick={handleConfirmSent}
                style={{
                  flex: 1,
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  border: "none",
                  padding: "12px",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 13,
                  minHeight: 44,
                }}
              >
                I've Sent Funds
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64, height: 64,
                borderRadius: "50%",
                backgroundColor: "color-mix(in oklch, var(--success) 15%, transparent)",
                color: "var(--success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <CheckCircle2 size={32} aria-hidden="true" />
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, marginBottom: 8, color: "var(--foreground)" }}>
              Thank You!
            </h3>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginBottom: 20 }}>
              Your donation of <strong style={{ color: "var(--foreground)" }}>{amount} {asset}</strong> has been received.
            </p>

            <div
              style={{
                backgroundColor: "var(--muted)",
                padding: "12px 14px",
                borderRadius: 10,
                textAlign: "left",
                marginBottom: 24,
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Transaction Hash
              </p>
              <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", wordBreak: "break-all", margin: 0, color: "var(--foreground)" }}>
                {txHash}
              </p>
            </div>

            <button
              onClick={handleClose}
              style={{
                width: "100%",
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
                padding: "12px",
                borderRadius: 10,
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                minHeight: 44,
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function generateMockHash(): string {
  const chars = "0123456789abcdef";
  return Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * 16)]).join("");
}
