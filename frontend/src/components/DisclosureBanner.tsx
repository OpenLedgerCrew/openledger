import React from "react";

/**
 * Section 4.5 — the "Honest About Limits" disclosure. O-3: visible, not buried — rendered in
 * the programme view's initial DOM, not below the fold, not in a modal (section 6.1 item 3).
 */
export function DisclosureBanner() {
  return (
    <aside className="my-8 rounded-xl border border-warning/30 bg-warning/5 p-6 text-warning-foreground">
      <h3 className="mb-3 font-serif text-lg font-bold">How to read this page</h3>
      <div className="space-y-3 text-sm leading-relaxed">
        <p>
          Every payment below settles on the public Stellar network, and you can verify any of them yourself on the public ledger. We do not sit in the middle of that check.
        </p>
        <p>
          <strong>What the ledger proves:</strong> that funds moved between accounts on the Stellar network, at a specific time, for a specific amount.
        </p>
        <p>
          <strong>What it does not prove:</strong> that a particular person received cash. Beneficiary accounts are custodial, so the ledger records the movement of value, not the moment a note reaches a hand. Physical delivery is confirmed separately through SAPCONE's field process and is shown here where that data exists.
        </p>
        <p className="text-xs opacity-80">
          This is the same standard applied to any audited cash transfer program. We state it plainly because a transparency portal that overclaims is not transparent.
        </p>
      </div>
    </aside>
  );
}
