import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  SunMoon,
  Volume2,
  VolumeX,
  Mic,
  Square,
  X,
} from "lucide-react";
import { VoiceOverlay } from "./VoiceOverlay";

const HIGH_CONTRAST_KEY = "openledger:high-contrast";

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionResultList {
  length: number;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  [index: number]: ISpeechRecognitionAlternative;
}

interface ISpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

function getSpeechRecognitionCtor(): (new () => ISpeechRecognition) | null {
  return (window.SpeechRecognition ?? window.webkitSpeechRecognition) ?? null;
}

export function AccessibilityToolbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voicePaused, setVoicePaused] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);

  const wakeRef = useRef<ISpeechRecognition | null>(null);
  const heardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref mirrors state so callbacks always read current value (avoids stale closure)
  const pausedRef = useRef(false);
  const restartingRef = useRef(false);

  // ── Init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(HIGH_CONTRAST_KEY) === "1";
    setHighContrast(saved);
    document.documentElement.classList.toggle("high-contrast", saved);

    const Ctor = getSpeechRecognitionCtor();
    const supported = Boolean(Ctor) && "speechSynthesis" in window;
    setVoiceSupported(supported);

    if (supported && Ctor) {
      initWakeRecognition(Ctor);
    }

    return () => {
      if (heardTimeoutRef.current) clearTimeout(heardTimeoutRef.current);
      restartingRef.current = false;
      try { wakeRef.current?.abort(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initWakeRecognition(Ctor: new () => ISpeechRecognition) {
    if (wakeRef.current) {
      try { wakeRef.current.abort(); } catch { /* ignore */ }
    }
    try {
      const rec = new Ctor();
      rec.lang = "en-US";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (event: ISpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          // Wake phrase: any utterance containing both "open" and "ledger"
          if (transcript.includes("open") && transcript.includes("ledger")) {
            setVoiceActive(true);
            pausedRef.current = false;
            setVoicePaused(false);
          }
        }
      };

      rec.onend = () => {
        // Auto-restart unless explicitly paused or component is unmounting
        if (!pausedRef.current && !restartingRef.current) {
          restartingRef.current = true;
          setTimeout(() => {
            restartingRef.current = false;
            if (!pausedRef.current && wakeRef.current === rec) {
              try { rec.start(); } catch { /* already running or unavailable */ }
            }
          }, 300);
        }
      };

      rec.onerror = (event: ISpeechRecognitionErrorEvent) => {
        // "not-allowed" means mic permission denied — don't retry
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setVoiceSupported(false);
          return;
        }
        // For other errors (network, aborted) restart after a short delay
        if (!pausedRef.current) {
          setTimeout(() => {
            if (!pausedRef.current && wakeRef.current === rec) {
              try { rec.start(); } catch { /* ignore */ }
            }
          }, 1000);
        }
      };

      wakeRef.current = rec;
      rec.start();
    } catch {
      // SpeechRecognition not available in this context (e.g. Firefox, non-HTTPS)
      setVoiceSupported(false);
    }
  }

  // ── High contrast ──────────────────────────────────────────────────────
  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("high-contrast", next);
      localStorage.setItem(HIGH_CONTRAST_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  // ── TTS ────────────────────────────────────────────────────────────────
  const readPageAloud = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const main = document.querySelector("main") ?? document.body;
    const text = (main.textContent ?? "").replace(/\s+/g, " ").trim();
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 4000));
    utterance.rate = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }, [speaking]);

  const stopReading = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  // ── Announce heard ─────────────────────────────────────────────────────
  const announceHeard = useCallback((transcript: string, action: string) => {
    setHeard(`"${transcript}" → ${action}`);
    if (heardTimeoutRef.current) clearTimeout(heardTimeoutRef.current);
    heardTimeoutRef.current = setTimeout(() => setHeard(null), 4000);
  }, []);

  // ── Voice command dispatcher ───────────────────────────────────────────
  const handleVoiceCommand = useCallback((transcript: string) => {
    const c = transcript.toLowerCase().trim();

    if (c.includes("stop")) {
      stopReading();
      announceHeard(transcript, "stopped reading");
      setVoiceActive(false);
    } else if (c.includes("read")) {
      readPageAloud();
      announceHeard(transcript, "reading the page");
      setVoiceActive(false);
    } else if (c.includes("high contrast")) {
      toggleHighContrast();
      announceHeard(transcript, "toggled high contrast");
      setVoiceActive(false);
    } else if (c.includes("programme") || c.includes("program")) {
      announceHeard(transcript, "opening Programmes");
      setVoiceActive(false);
      navigate("/programmes");
    } else if (c.includes("home")) {
      announceHeard(transcript, "opening Home");
      setVoiceActive(false);
      navigate("/");
    } else if (c.includes("about")) {
      announceHeard(transcript, "opening About");
      setVoiceActive(false);
      navigate("/about");
    } else if (c.includes("contact")) {
      announceHeard(transcript, "opening Contact");
      setVoiceActive(false);
      navigate("/contact");
    } else if (c.includes("pause")) {
      pausedRef.current = true;
      setVoicePaused(true);
      try { wakeRef.current?.stop(); } catch { /* ignore */ }
      announceHeard(transcript, "voice detection paused");
      setVoiceActive(false);
    } else if (c.includes("resume")) {
      pausedRef.current = false;
      setVoicePaused(false);
      const Ctor = getSpeechRecognitionCtor();
      if (Ctor) initWakeRecognition(Ctor);
      announceHeard(transcript, "voice detection resumed");
      setVoiceActive(false);
    } else if (c.includes("close") || c.includes("dismiss")) {
      setVoiceActive(false);
    } else {
      announceHeard(transcript, "not recognized");
    }
  }, [stopReading, readPageAloud, toggleHighContrast, navigate, announceHeard]);

  // ── FAB slots (quarter-circle above/left of main FAB) ─────────────────
  const slots = [
    { bottom: 68, right: 0 },   // straight up
    { bottom: 48, right: 48 },  // diagonal
    { bottom: 0,  right: 68 },  // straight left
  ];

  return (
    <>
      {/* Voice overlay */}
      {voiceActive && (
        <VoiceOverlay
          onClose={() => setVoiceActive(false)}
          paused={voicePaused}
          onCommand={handleVoiceCommand}
        />
      )}

      {/* Stop-reading button — only visible while TTS is playing */}
      {speaking && (
        <button
          onClick={stopReading}
          aria-label="Stop reading aloud"
          title="Stop reading aloud"
          style={{
            position: "fixed",
            bottom: 84,
            right: 20,
            zIndex: 1999,
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "1.5px solid var(--destructive)",
            backgroundColor: "var(--destructive)",
            color: "var(--destructive-foreground)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          }}
        >
          <VolumeX size={18} aria-hidden="true" />
        </button>
      )}

      {/* Toolbar — anchored bottom-right */}
      <div
        role="toolbar"
        aria-label="Accessibility controls"
        style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1998, width: 56, height: 56 }}
      >
        {/* Contrast */}
        <FabButton
          slot={slots[0]}
          open={open}
          active={highContrast}
          onClick={toggleHighContrast}
          label="Toggle high contrast mode"
          icon={<SunMoon size={17} aria-hidden="true" />}
        />

        {/* Read aloud */}
        <FabButton
          slot={slots[1]}
          open={open}
          active={speaking}
          onClick={readPageAloud}
          label={speaking ? "Stop reading aloud" : "Read this page aloud"}
          icon={speaking ? <Square size={14} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
        />

        {/* Voice (only if mic is supported) */}
        {voiceSupported && (
          <FabButton
            slot={slots[2]}
            open={open}
            active={voiceActive || voicePaused}
            onClick={() => setVoiceActive((v) => !v)}
            label={
              voiceActive ? "Close voice overlay" :
              voicePaused ? "Voice paused — tap to open" :
              "Open voice commands"
            }
            icon={<Mic size={17} aria-hidden="true" />}
          />
        )}

        {/* Heard toast */}
        {heard && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              right: 0,
              maxWidth: 260,
              backgroundColor: "var(--foreground)",
              color: "var(--background)",
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 12,
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
              whiteSpace: "nowrap",
            }}
          >
            {heard}
          </div>
        )}

        {/* Main FAB — Settings icon, rightmost */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close accessibility options" : "Open accessibility options"}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            backgroundColor: "var(--foreground)",
            color: "var(--background)",
            cursor: "pointer",
            boxShadow: "0 12px 30px rgba(26, 23, 20, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {open
            ? <X size={20} aria-hidden="true" />
            : <Settings size={22} aria-hidden="true" />
          }
        </button>
      </div>
    </>
  );
}

function FabButton({
  slot,
  open,
  active,
  onClick,
  label,
  icon,
}: {
  slot: { bottom: number; right: number };
  open: boolean;
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      style={{
        position: "absolute",
        bottom: slot.bottom,
        right: slot.right,
        opacity: open ? 1 : 0,
        transform: open ? "scale(1)" : "scale(0.4)",
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.2s ease, transform 0.2s ease",
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: `1.5px solid ${active ? "var(--foreground)" : "var(--border)"}`,
        backgroundColor: active ? "var(--foreground)" : "var(--card)",
        color: active ? "var(--background)" : "var(--foreground)",
        cursor: "pointer",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </button>
  );
}
