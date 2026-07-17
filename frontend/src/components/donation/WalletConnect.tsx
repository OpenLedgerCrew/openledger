import { useState } from "react";
import type { WalletState } from "./lib/types";
import { checkFreighterInstalled, connectWallet } from "./lib/stellar";

interface Props {
  wallet: WalletState;
  onConnect: (state: WalletState) => void;
  onDisconnect: () => void;
}

export function WalletConnect({ wallet, onConnect, onDisconnect }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    setLoading(true);
    try {
      const installed = await checkFreighterInstalled();
      if (!installed) {
        setError("Freighter wallet extension not found. Please install it from freighter.app.");
        return;
      }
      const state = await connectWallet();
      onConnect(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }

  function truncate(key: string) {
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  }

  if (wallet.connected && wallet.publicKey) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "12px 16px",
          borderRadius: "12px",
          border: "1px solid #e5e0d8",
          backgroundColor: "#fcf5ec",
          marginBottom: "20px",
        }}
      >
        <span
          title={wallet.publicKey}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "monospace",
            fontSize: "13px",
            fontWeight: 600,
            color: "#1a1714",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#5da76e",
              display: "inline-block",
            }}
          />
          {truncate(wallet.publicKey)}
          <span
            style={{
              backgroundColor: "#5da76e1a",
              color: "#5da76e",
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "2px 8px",
              borderRadius: "9999px",
            }}
          >
            {wallet.network}
          </span>
        </span>
        <button
          onClick={onDisconnect}
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#374151",
            cursor: "pointer",
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      {error && (
        <p style={{ color: "#b91c1c", fontSize: "13px", marginBottom: "8px" }} role="alert">
          {error}
        </p>
      )}
      <button
        onClick={handleConnect}
        disabled={loading}
        aria-busy={loading}
        style={{
          width: "100%",
          backgroundColor: "#5da76e",
          color: "#ffffff",
          border: "none",
          borderRadius: "12px",
          padding: "12px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Connecting…" : "Connect Freighter"}
      </button>
    </div>
  );
}
