import React, { useEffect, useState } from "react";
import { Sparkles, Volume2, Square } from "lucide-react";
import { fetchAiSummary } from "../api/ai";

export interface AiSummaryCardProps {
  programmeId: string;
}

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
    return () => { cancelled = true; };
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
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>
          Generating transparency summary…
        </p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} aria-hidden="true" style={{ color: "var(--primary)" }} />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
            AI Transparency Summary
          </p>
        </div>
        <button
          onClick={readAloud}
          aria-pressed={speaking}
          aria-label={speaking ? "Stop reading summary aloud" : "Read summary aloud"}
          style={{
            border: "1px solid color-mix(in oklch, var(--primary) 40%, transparent)",
            backgroundColor: speaking ? "var(--primary)" : "transparent",
            color: speaking ? "var(--primary-foreground)" : "var(--primary)",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 5,
            minHeight: 32,
          }}
        >
          {speaking ? (
            <><Square size={10} aria-hidden="true" /> Stop</>
          ) : (
            <><Volume2 size={12} aria-hidden="true" /> Listen</>
          )}
        </button>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.6, color: "var(--foreground)" }}>
        {summary}
      </p>
      {source === "fallback" && (
        <p style={{ margin: "10px 0 0", fontSize: 10, color: "var(--muted-foreground)" }}>
          Generated from programme data. Connect an AI API key for a richer summary.
        </p>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in oklch, var(--success) 8%, var(--card))",
  border: "1px solid color-mix(in oklch, var(--success) 25%, transparent)",
  borderRadius: 16,
  padding: 16,
};
