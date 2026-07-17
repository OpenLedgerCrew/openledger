import React, { useEffect, useRef } from "react";
import { X, Mic } from "lucide-react";

export const VOICE_COMMANDS = [
  { phrase: '"read page" / "read this"', does: "reads the current page aloud" },
  { phrase: '"stop" / "stop reading"', does: "stops text-to-speech reading" },
  { phrase: '"high contrast"', does: "toggles high contrast mode" },
  { phrase: '"go to programmes"', does: "opens the Programmes page" },
  { phrase: '"go home"', does: "opens the Home page" },
  { phrase: '"go to about"', does: "opens the About page" },
  { phrase: '"go to contact"', does: "opens the Contact page" },
  { phrase: '"pause" / "pause listening"', does: "pauses wake-word detection" },
  { phrase: '"resume" / "resume listening"', does: "resumes wake-word detection" },
  { phrase: '"close" / "dismiss"', does: "closes this overlay" },
];

// Not declared as a `declare global` augmentation here — AccessibilityToolbar.tsx (the only
// place that renders this component) already augments `Window` with a stricter version of the
// same shape. A second, looser `declare global` block for the same properties would conflict
// (TS requires merged global declarations to be identical types), so this stays a local,
// structural type used only to describe the instance this file creates.
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export interface VoiceOverlayProps {
  onClose: () => void;
  paused?: boolean;
  /** Called with the transcript when a command is spoken */
  onCommand?: (transcript: string) => void;
}

export function VoiceOverlay({ onClose, paused = false, onCommand }: VoiceOverlayProps) {
  const firstBtnRef = useRef<HTMLButtonElement>(null);
  const cmdRecRef = useRef<SpeechRecognitionInstance | null>(null);

  // Start command-mode speech recognition when overlay opens
  useEffect(() => {
    if (paused) return;

    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor || !onCommand) return;

    try {
      const rec = new Ctor();
      rec.lang = "en-US";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const transcript: string = event.results?.[0]?.[0]?.transcript ?? "";
        if (transcript) {
          onCommand(transcript);
        }
      };

      // Restart listening so user can keep saying commands while overlay is open
      rec.onend = () => {
        if (cmdRecRef.current === rec) {
          try { rec.start(); } catch { /* overlay might have closed */ }
        }
      };

      rec.onerror = (event: any) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") return;
        // Restart on recoverable errors
        setTimeout(() => {
          if (cmdRecRef.current === rec) {
            try { rec.start(); } catch { /* ignore */ }
          }
        }, 500);
      };

      cmdRecRef.current = rec;
      rec.start();
    } catch {
      /* SpeechRecognition unavailable */
    }

    return () => {
      // Stop command recognition when overlay closes
      try { cmdRecRef.current?.abort(); } catch { /* ignore */ }
      cmdRecRef.current = null;
    };
  }, [paused, onCommand]);

  // Focus trap + Escape
  useEffect(() => {
    firstBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const overlay = document.getElementById("voice-overlay-panel");
      if (!overlay) return;
      const focusable = overlay.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "rgba(26, 23, 20, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        id="voice-overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Voice command mode"
        style={{
          backgroundColor: "var(--card)",
          borderRadius: 24,
          padding: 28,
          width: "100%",
          maxWidth: "min(440px, 90vw)",
          boxShadow: "0 24px 60px rgba(26,23,20,0.3)",
          border: "1px solid var(--border)",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          ref={firstBtnRef}
          onClick={onClose}
          aria-label="Close voice overlay"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "var(--muted)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--muted-foreground)",
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>

        {/* Mic + status */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: "50%",
              backgroundColor: paused
                ? "color-mix(in oklch, var(--muted-foreground) 15%, transparent)"
                : "color-mix(in oklch, var(--primary) 15%, transparent)",
              marginBottom: 14,
              animation: paused ? "none" : "voicePulse 1.8s ease-in-out infinite",
            }}
          >
            <Mic
              size={32}
              aria-hidden="true"
              style={{ color: paused ? "var(--muted-foreground)" : "var(--primary)" }}
            />
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--foreground)",
            }}
          >
            {paused ? "Listening Paused" : "Listening…"}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--muted-foreground)" }}>
            {paused
              ? 'Say "resume" to continue'
              : "Say a command from the list below"}
          </p>
        </div>

        {/* Command list */}
        <div
          style={{
            maxHeight: 260,
            overflowY: "auto",
            borderRadius: 14,
            border: "1px solid var(--border)",
            backgroundColor: "var(--background)",
          }}
        >
          {VOICE_COMMANDS.map((cmd, i) => (
            <div
              key={cmd.phrase}
              style={{
                padding: "10px 14px",
                borderBottom:
                  i < VOICE_COMMANDS.length - 1 ? "1px solid var(--border)" : "none",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--primary)",
                  fontWeight: 600,
                  flexShrink: 0,
                  maxWidth: 180,
                }}
              >
                {cmd.phrase}
              </span>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)", flex: 1 }}>
                — {cmd.does}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes voicePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.08); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
