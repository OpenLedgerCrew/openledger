import {
  DISCLOSURE_CLOSING,
  DISCLOSURE_HEADING,
  DISCLOSURE_INTRO,
  DISCLOSURE_NOT_PROVES,
  DISCLOSURE_PROVES,
} from "../constants/disclosure";

/**
 * Section 4.5 — the "Honest About Limits" disclosure. O-3 requires this to be visible on the
 * same screen, not buried behind a click or a modal.
 */
export function DisclosureBanner() {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-5 sm:p-6">
      <h3 className="font-serif text-base font-semibold text-foreground">{DISCLOSURE_HEADING}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{DISCLOSURE_INTRO}</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{DISCLOSURE_PROVES}</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{DISCLOSURE_NOT_PROVES}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{DISCLOSURE_CLOSING}</p>
    </div>
  );
}
