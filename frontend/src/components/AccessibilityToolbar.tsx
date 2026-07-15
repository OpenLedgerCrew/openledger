import React, { useEffect, useRef, useState } from "react";

const HIGH_CONTRAST_KEY = "openledger:high-contrast";

const VOICE_COMMANDS = [
  { phrase: "“read page” / “read this”", does: "reads the current page aloud" },
  { phrase: "“stop” / “stop reading”", does: "stops reading" },
  { phrase: "“high contrast”", does: "toggles high contrast mode" },
  { phrase: "“go to programmes”", does: "opens the Programmes page" },
  { phrase: "“go home”", does: "opens the Home page" },
  { phrase: "“go to about”", does: "opens the About page" },
  { phrase: "“go to contact”", does: "opens the Contact page" },
];

/**
 * Global accessibility controls, mounted once at the app root so every page gets them. A
 * floating speed-dial FAB (matching the chat widget's floating style) fans three controls out
 * in a quarter-circle above the main button:
 * - High contrast mode for low-vision users (persisted, applied via a root CSS class).
 * - Read-page-aloud for blind/low-vision users, using the browser's built-in speech
 *   synthesis (no external API, works offline).
 * - Voice command via the Web Speech API's SpeechRecognition, feature-detected since it's
 *   Chromium-only; a hover/focus panel lists the exact phrases it understands.
 */
export function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const heardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(HIGH_CONTRAST_KEY) === "1";
    setHighContrast(saved);
    document.documentElement.classList.toggle("high-contrast", saved);

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceSupported(Boolean(SpeechRecognitionCtor) && "speechSynthesis" in window);

    return () => {
      if (heardTimeoutRef.current) clearTimeout(heardTimeoutRef.current);
    };
  }, []);

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("high-contrast", next);
      localStorage.setItem(HIGH_CONTRAST_KEY, next ? "1" : "0");
      return next;
    });
  };

  const readPageAloud = () => {
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
  };

  const announceHeard = (transcript: string, action: string) => {
    setHeard(`Heard "${transcript}" → ${action}`);
    if (heardTimeoutRef.current) clearTimeout(heardTimeoutRef.current);
    heardTimeoutRef.current = setTimeout(() => setHeard(null), 4000);
  };

  const handleVoiceCommand = (transcript: string) => {
    const c = transcript.toLowerCase();
    if (c.includes("high contrast")) {
      toggleHighContrast();
      announceHeard(transcript, "toggled high contrast");
    } else if (c.includes("stop")) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      announceHeard(transcript, "stopped reading");
    } else if (c.includes("read")) {
      readPageAloud();
      announceHeard(transcript, "reading the page");
    } else if (c.includes("programme") || c.includes("program")) {
      announceHeard(transcript, "opening Programmes");
      window.location.assign("/programmes");
    } else if (c.includes("home")) {
      announceHeard(transcript, "opening Home");
      window.location.assign("/");
    } else if (c.includes("about")) {
      announceHeard(transcript, "opening About");
      window.location.assign("/about");
    } else if (c.includes("contact")) {
      announceHeard(transcript, "opening Contact");
      window.location.assign("/contact");
    } else {
      announceHeard(transcript, "not recognized — try one of the listed commands");
    }
  };

  const toggleListening = () => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) handleVoiceCommand(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  // Quarter-circle fan: three slots arcing from straight-up to straight-left of the main
  // button, so the cluster opens into the empty space above/left of the bottom-right corner.
  const slots = [
    { bottom: 68, right: 0 }, // up
    { bottom: 48, right: 48 }, // diagonal
    { bottom: 0, right: 68 }, // left
  ];

  const items: Array<{ key: string; render: (slot: { bottom: number; right: number }) => React.ReactNode }> = [
    {
      key: "contrast",
      render: (slot) => (
        <FabButton
          slot={slot}
          open={open}
          active={highContrast}
          onClick={toggleHighContrast}
          ariaPressed={highContrast}
          label="Toggle high contrast mode"
          icon="◑"
        />
      ),
    },
    {
      key: "read",
      render: (slot) => (
        <FabButton
          slot={slot}
          open={open}
          active={speaking}
          onClick={readPageAloud}
          ariaPressed={speaking}
          label={speaking ? "Stop reading this page aloud" : "Read this page aloud"}
          icon={speaking ? "■" : "\u{1F50A}"}
        />
      ),
    },
  ];

  if (voiceSupported) {
    items.push({
      key: "voice",
      render: (slot) => (
        <div
          style={{
            position: "absolute",
            bottom: slot.bottom,
            right: slot.right,
            opacity: open ? 1 : 0,
            transform: open ? "scale(1)" : "scale(0.4)",
            pointerEvents: open ? "auto" : "none",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
          onMouseEnter={() => setShowVoiceHelp(true)}
          onMouseLeave={() => setShowVoiceHelp(false)}
        >
          <button
            type="button"
            onClick={toggleListening}
            onFocus={() => setShowVoiceHelp(true)}
            onBlur={() => setShowVoiceHelp(false)}
            aria-pressed={listening}
            aria-label="Voice command — see supported phrases on hover or focus"
            title="Voice command"
            style={fabButtonStyle(listening)}
          >
            {listening ? "■" : "\u{1F399}"}
          </button>

          {showVoiceHelp && (
            <div
              role="tooltip"
              style={{
                position: "absolute",
                bottom: "calc(100% + 10px)",
                right: 0,
                width: 260,
                backgroundColor: "#1a1714",
                color: "#fff",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 12,
                lineHeight: 1.5,
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
              }}
            >
              <p style={{ margin: "0 0 6px", fontWeight: 700 }}>Try saying:</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                {VOICE_COMMANDS.map((c) => (
                  <li key={c.phrase}>
                    <span style={{ color: "#8fe3a3" }}>{c.phrase}</span> — {c.does}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    });
  }

  return (
    <div
      role="toolbar"
      aria-label="Accessibility controls"
      style={{ position: "fixed", bottom: 20, right: 92, zIndex: 1999, width: 56, height: 56 }}
    >
      {items.map((item, i) => (
        <React.Fragment key={item.key}>{item.render(slots[i])}</React.Fragment>
      ))}

      {heard && (
        <div
          role="status"
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            right: 0,
            maxWidth: 260,
            backgroundColor: "#1a1714",
            color: "#fff",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
          }}
        >
          {heard}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close accessibility options" : "Open accessibility options"}
        title="Accessibility options"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#1a1714",
          color: "#fff",
          fontSize: 22,
          cursor: "pointer",
          boxShadow: "0 12px 30px rgba(26, 23, 20, 0.35)",
        }}
      >
        {open ? "✕" : "♿"}
      </button>
    </div>
  );
}

function FabButton({
  slot,
  open,
  active,
  onClick,
  ariaPressed,
  label,
  icon,
}: {
  slot: { bottom: number; right: number };
  open: boolean;
  active: boolean;
  onClick: () => void;
  ariaPressed: boolean;
  label: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed}
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
        ...fabButtonStyle(active),
      }}
    >
      {icon}
    </button>
  );
}

function fabButtonStyle(active: boolean): React.CSSProperties {
  return {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: `1.5px solid ${active ? "#1a1714" : "#e5e0d8"}`,
    backgroundColor: active ? "#1a1714" : "#ffffff",
    color: active ? "#ffffff" : "#1a1714",
    fontSize: 17,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}
