import React, { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../api/ai";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const QUICK_QUESTIONS = [
  "How do I verify a payment?",
  "What does the disclosure mean?",
  "How do I export a PDF report?",
  "Is any personal data shown here?",
];

// Offline fallback so the widget still answers common questions with zero network dependency,
// mirroring the resilience pattern used elsewhere in the app (fetch fails -> local answer).
const LOCAL_FAQ: Array<{ match: RegExp; answer: string }> = [
  {
    match: /verify.*payment|payment.*verif/i,
    answer:
      "Open a programme, click a payment row, then use \"Verify on Stellar\" — it opens the public Stellar explorer for that transaction hash. You don't need to log in or trust OpenLedger; you can check the chain yourself.",
  },
  {
    match: /disclosure|honest|prove/i,
    answer:
      "The disclosure explains what the ledger can and can't show: it proves funds moved on-chain at a specific time and amount, but it does not prove a specific person received cash in hand — that's confirmed separately through the field delivery process where that data exists.",
  },
  {
    match: /pdf|export|report/i,
    answer:
      "Click \"Export PDF\" on any programme to download a full impact report with the payment table, aggregate stats, and the disclosure — generated server-side so it always matches what you see on screen.",
  },
  {
    match: /personal|pii|privacy|name|phone|wallet/i,
    answer:
      "No personal data is shown anywhere in OpenLedger — no names, phone numbers, or wallet addresses. Only opaque reference IDs, amounts, statuses, and timestamps are displayed.",
  },
  {
    match: /delivery|deliver/i,
    answer:
      "Delivery confirmation has three states: \"Confirmed\" (field-confirmed and anchored on-chain, verifiable), \"Awaiting confirmation\" (payment settled, field confirmation pending), and \"Not applicable\" (no delivery record routed through this payment).",
  },
];

function localAnswer(message: string): string {
  const hit = LOCAL_FAQ.find((f) => f.match.test(message));
  return (
    hit?.answer ??
    "I can help with questions about payment verification, the honest-limits disclosure, PDF reports, and privacy. Try asking one of those, or use the quick questions below."
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi! I can answer quick questions about verifying payments, the transparency disclosure, PDF reports, and privacy on OpenLedger.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const res = await sendChatMessage(text);
      setMessages((m) => [...m, { role: "assistant", text: res.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: localAnswer(text) }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 2000 }}>
      {open && (
        <div
          role="dialog"
          aria-label="OpenLedger help chat"
          style={{
            width: 340,
            maxWidth: "calc(100vw - 40px)",
            height: 440,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#faf8f4",
            border: "1px solid #e5e0d8",
            borderRadius: 20,
            boxShadow: "0 24px 60px rgba(26, 23, 20, 0.28)",
            marginBottom: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              backgroundColor: "#1a1714",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>OpenLedger Assistant</p>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>Answers to frequent questions</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: 18,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  backgroundColor: m.role === "user" ? "#5da76e" : "#ffffff",
                  color: m.role === "user" ? "#fff" : "#1a1714",
                  border: m.role === "user" ? "none" : "1px solid #e5e0d8",
                  borderRadius: 14,
                  padding: "8px 12px",
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <div style={{ alignSelf: "flex-start", fontSize: 12, color: "#9ca3af" }}>Thinking…</div>
            )}
          </div>

          <div style={{ padding: "10px 12px", borderTop: "1px solid #e5e0d8", display: "flex", flexWrap: "wrap", gap: 6 }}>
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => ask(q)}
                style={{
                  fontSize: 11,
                  padding: "5px 9px",
                  borderRadius: 9999,
                  border: "1px solid #e5e0d8",
                  backgroundColor: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            style={{ display: "flex", gap: 8, padding: "10px 12px 12px", borderTop: "1px solid #f0ece6" }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              aria-label="Chat message"
              style={{
                flex: 1,
                borderRadius: 10,
                border: "1px solid #e5e0d8",
                padding: "8px 10px",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              style={{
                borderRadius: 10,
                border: "none",
                backgroundColor: "#1a1714",
                color: "#fff",
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                opacity: sending || !input.trim() ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close help chat" : "Open help chat"}
        aria-expanded={open}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#1a1714",
          color: "#fff",
          fontSize: 24,
          cursor: "pointer",
          boxShadow: "0 12px 30px rgba(26, 23, 20, 0.35)",
          float: "right",
        }}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
