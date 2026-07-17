import { useState, type FormEvent } from "react";
import { xlmToStroops, submitDonation } from "./lib/contract";
import type { WalletState } from "./lib/types";

interface Props {
  wallet: WalletState;
  onSuccess: () => void;
}

export function DonateForm({ wallet, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setTxHash(null);

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMsg("Please enter a valid positive amount.");
      return;
    }

    if (!wallet.publicKey) {
      setErrorMsg("Please connect your wallet first.");
      return;
    }

    setStatus("submitting");
    try {
      const stroops = xlmToStroops(parsed);
      const hash = await submitDonation(wallet.publicKey, stroops);
      setTxHash(hash);
      setStatus("success");
      setAmount("");
      onSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Transaction failed");
      setStatus("error");
    }
  }

  const isSubmitting = status === "submitting";

  return (
    <div style={{ marginBottom: "20px" }}>
      {!wallet.connected && (
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
          Connect your Freighter wallet above to donate.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="donate-amount"
            style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "8px" }}
          >
            Amount (XLM)
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="donate-amount"
              type="number"
              inputMode="decimal"
              min="0.0000001"
              step="any"
              placeholder="e.g. 10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!wallet.connected || isSubmitting}
              required
              style={{
                width: "100%",
                padding: "12px 52px 12px 12px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                fontSize: "16px",
                fontWeight: 600,
                outline: "none",
                backgroundColor: !wallet.connected ? "#f5f2ee" : "#ffffff",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "13px",
                fontWeight: 700,
                color: "#9ca3af",
              }}
            >
              XLM
            </span>
          </div>
        </div>

        {errorMsg && (
          <p style={{ color: "#b91c1c", fontSize: "13px", marginBottom: "16px" }} role="alert">
            {errorMsg}
          </p>
        )}

        {status === "success" && txHash && (
          <div
            style={{
              backgroundColor: "#5da76e1a",
              border: "1px solid #5da76e40",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "16px",
              fontSize: "13px",
              color: "#1a1714",
            }}
            role="status"
          >
            Donation confirmed!{" "}
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#5da76e", fontWeight: 700 }}
            >
              View on explorer
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={!wallet.connected || isSubmitting || !amount}
          aria-busy={isSubmitting}
          style={{
            width: "100%",
            backgroundColor: !wallet.connected || isSubmitting || !amount ? "#d1d5db" : "#5da76e",
            color: !wallet.connected || isSubmitting || !amount ? "#9ca3af" : "#ffffff",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            fontWeight: 700,
            fontSize: "15px",
            cursor: !wallet.connected || isSubmitting || !amount ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Submitting…" : "Donate"}
        </button>
      </form>
    </div>
  );
}
