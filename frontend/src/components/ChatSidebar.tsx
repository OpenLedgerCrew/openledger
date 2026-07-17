import React, { useEffect, useRef, useState } from "react";
import { X, MessageSquare } from "lucide-react";
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

const LOCAL_FAQ: Array<{ match: RegExp; answer: string }> = [
  {
    match: /verify.*payment|payment.*verif/i,
    answer:
      'Open a programme, click a payment row, then use "Verify on Stellar" — it opens the public Stellar explorer for that transaction hash.',
  },
  {
    match: /disclosure|honest|prove/i,
    answer:
      "The disclosure explains what the ledger can and can't show: it proves funds moved on-chain, but not that a specific person received cash in hand.",
  },
  {
    match: /pdf|export|report/i,
    answer:
      'Click "Export PDF" inside any programme detail page to download a full impact report with charts, payment table, and disclosure.',
  },
  {
    match: /personal|pii|privacy|name|phone|wallet/i,
    answer:
      "No personal data is shown — no names, phone numbers, or wallet addresses. Only opaque reference IDs, amounts, statuses, and timestamps.",
  },
  {
    match: /delivery|deliver/i,
    answer:
      '"Confirmed" = field-confirmed and anchored on-chain. "Awaiting confirmation" = payment settled, field confirmation pending. "N/A" = no delivery record.',
  },
];

function localAnswer(message: string): string {
  const hit = LOCAL_FAQ.find((f) => f.match.test(message));
  return (
    hit?.answer ??
    "I can help with questions about payment verification, the disclosure, PDF reports, and privacy. Try one of the quick questions below."
  );
}

export interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function ChatSidebar({ open, onClose }: ChatSidebarProps) {
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

  // Trap escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

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
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(26, 23, 20, 0.4)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            zIndex: 1998,
          }}
          className="sm:hidden"
        />
      )}

      {/* Sidebar panel */}
      <div
        role="dialog"
        aria-label="OpenLedger help chat"
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: open ? "100%" : 0,
          maxWidth: 320,
          zIndex: 1999,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--card)",
          borderLeft: "1px solid var(--border)",
          boxShadow: open ? "-8px 0 40px rgba(26,23,20,0.15)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s",
          overflowY: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 16px",
            backgroundColor: "var(--foreground)",
            color: "var(--background)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MessageSquare size={18} aria-hidden="true" />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>OpenLedger Assistant</p>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.65 }}>Answers to frequent questions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close chat sidebar"
            style={{
              background: "none",
              border: "none",
              color: "var(--background)",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              minWidth: 44,
              minHeight: 44,
            }}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                backgroundColor: m.role === "user" ? "var(--primary)" : "var(--background)",
                color: m.role === "user" ? "var(--primary-foreground)" : "var(--foreground)",
                border: m.role === "user" ? "none" : "1px solid var(--border)",
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
            <div style={{ alignSelf: "flex-start", fontSize: 12, color: "var(--muted-foreground)" }}>
              Thinking…
            </div>
          )}
        </div>

        {/* Quick questions */}
        <div
          style={{
            padding: "10px 12px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              style={{
                fontSize: 11,
                padding: "5px 9px",
                borderRadius: 9999,
                border: "1px solid var(--border)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                cursor: "pointer",
                minHeight: 28,
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); ask(input); }}
          style={{
            display: "flex",
            gap: 8,
            padding: "10px 12px 12px",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
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
              border: "1px solid var(--border)",
              padding: "8px 10px",
              fontSize: 13,
              outline: "none",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
              minHeight: 44,
            }}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            style={{
              borderRadius: 10,
              border: "none",
              backgroundColor: "var(--foreground)",
              color: "var(--background)",
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              opacity: sending || !input.trim() ? 0.5 : 1,
              minHeight: 44,
            }}
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}
