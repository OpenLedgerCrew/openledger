// Section 4.5 — the "Honest About Limits" disclosure, byte-exact from the source document.
// O-3 requires this to be visible, not buried. This is graded copy submitted for approval:
// do not edit it here without editing the document.

export const DISCLOSURE_HEADING = 'How to read this page';

export const DISCLOSURE_INTRO =
  'Every payment below settles on the public Stellar network, and you can verify any of them yourself on the public ledger. We do not sit in the middle of that check.';

export const DISCLOSURE_PROVES =
  'What the ledger proves: that funds moved between accounts on the Stellar network, at a specific time, for a specific amount.';

export const DISCLOSURE_NOT_PROVES =
  "What it does not prove: that a particular person received cash. Beneficiary accounts are custodial, so the ledger records the movement of value, not the moment a note reaches a hand. Physical delivery is confirmed separately through SAPCONE's field process and is shown here where that data exists.";

export const DISCLOSURE_CLOSING =
  'This is the same standard applied to any audited cash transfer program. We state it plainly because a transparency portal that overclaims is not transparent.';

export const DISCLOSURE_FULL = [
  DISCLOSURE_HEADING,
  DISCLOSURE_INTRO,
  DISCLOSURE_PROVES,
  DISCLOSURE_NOT_PROVES,
  DISCLOSURE_CLOSING,
].join('\n\n');
