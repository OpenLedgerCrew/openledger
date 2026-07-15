import React, { useEffect, useState } from "react";
import { fetchAiSummary } from "../api/ai";

export interface AiSummaryCardProps {
  programmeId: string;
}

/**
 * AI transparency summary — a short, plain-language readout of the aggregate data, generated
 * server-side (real LLM call when ANTHROPIC_API_KEY is configured, deterministic otherwise).
 * Includes a "read aloud" control so the summary itself is accessible without reading text.
 */
export function AiSummaryCard({ programmeId }: AiSummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [source, setSource] = useState<"ai" | "fallback" | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAiSummary(programmeId)
      .then((res) => {
        if (cancelled) return;
        setSummary(res.summary);
        setSource(res.source);
      })
      .catch(() => {
        if (cancelled) return;
        setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [programmeId]);

  const readAloud = () => {
    if (!summary || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  if (loading) {
    return (
      <div style={cardStyle}>
        <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>Generating transparency summary…</p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a1714" }}>
            AI Transparency Summary
          </p>
        </div>
        <button
          onClick={readAloud}
          aria-pressed={speaking}
          title="Read summary aloud"
          style={{
            border: "1px solid #5da76e40",
            backgroundColor: speaking ? "#5da76e" : "transparent",
            color: speaking ? "#fff" : "#5da76e",
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {speaking ? "■ Stop" : "🔊 Listen"}
        </button>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.6, color: "#374151" }}>{summary}</p>
      {source === "fallback" && (
        <p style={{ margin: "10px 0 0", fontSize: 10, color: "#9ca3af" }}>
          Generated from programme data. Connect an AI API key for a richer summary.
        </p>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "#f7fbf8",
  border: "1px solid #5da76e30",
  borderRadius: 16,
  padding: 16,
};
