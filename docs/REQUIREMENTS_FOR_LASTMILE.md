# Requirements from OpenLedger to LastMile

**From:** OpenLedger team (Product 3)
**To:** LastMile team (Product 2)
**Re:** the delivery-confirmation contract — what OpenLedger needs to move from a seed dataset to
your real data.

OpenLedger does **not** integrate with LastMile directly (PRD §3.2.2) — we read delivery
confirmation data only as it surfaces inside the DisburseFlow/SDP fork's data model. This
document is a joint request: the field contract below is what we need regardless of the
transport, and we're also sending DisburseFlow a parallel request
(`REQUIREMENTS_FOR_DISBURSEFLOW.md`) asking them to confirm how your data reaches their fork. Full
background: `OpenLedger Documentation.md` §3.2, §4, and `docs/OPEN_ITEMS.md`.

Our backend is fully built and tested against a fixture assuming the shape below
(`backend/src/services/lastMileClient.ts` maps fork-provided records into our internal model —
this is the only file that needs to change once your real contract is confirmed).

## 1. Delivery confirmation fields (OQ-2)

Please confirm the exact field names and semantics for:

| Field | Type | Notes |
| --- | --- | --- |
| `reference_id` | string | The join key against DisburseFlow's payment records. Must be the **same identifier** used on both sides — see §2 below. |
| `proxy_id` | string | The proxy who handled/confirmed delivery. **This is never rendered publicly** by OpenLedger (safeguarding — PRD §4.3). We only need it internally in case of dispute resolution; confirm this level of internal-only handling matches your expectations. |
| `confirmed_at` | string (ISO 8601, UTC) or null | Null means "no confirmation yet" — a distinct state from "no record exists at all" (see three-state model below). |
| `geotag` | `{ lat: number, lon: number }` or null, optional | **Never rendered publicly** (targeting risk — PRD §4.3). Confirm whether this is even sent to the fork, or held entirely inside your systems. |
| `anchoring_tx_hash` | string or null | If a confirmation is itself anchored on-chain, we use this to build a second explorer deep link, distinct from the payment's own settlement link. |

We explicitly do **not** want and will never render: beneficiary name, phone, or any other PII.
Confirm no such fields are present in what reaches the fork (PRD §3.2.1: "no beneficiary PII —
LastMile's proxy delivery lists and confirmations use reference numbers only, never names").

## 2. Reference ID contract (A-4, OQ-5 — your call)

**A-4 (join integrity):** Confirm delivery confirmations join on the exact same `reference_id`
that DisburseFlow's payment records use. If your registry generates a different internal ID that
gets translated before reaching the fork, tell us where that translation happens and whether it's
guaranteed stable.

**OQ-5 (rotation policy — this is explicitly your decision, in consultation with SAPCONE, not
ours or DisburseFlow's):** Does a reference ID persist across multiple programmes for the same
household, or rotate per programme?
- **Persistent ID:** simpler joins, but means anyone with the public OpenLedger link can build a
  longitudinal profile of a household across programmes (how much received, how often, whether
  delivery was ever unconfirmed). This is flagged, not resolved, in PRD §4.4.
- **Rotated per programme:** breaks that cross-programme correlation risk, at some cost to your
  own internal traceability.

We're not asking you to change anything today — we're asking you to make this decision explicitly
(with SAPCONE) so we can document it, since right now our fixture assumes IDs are stable within a
programme but we have no signal either way about cross-programme behavior.

## 3. Three-state delivery model (D-7 — please validate our assumption)

We render three distinct states, and we'd like you to confirm this matches how your system
actually reports (or fails to report) delivery:

1. **`not_applicable`** — no delivery confirmation record exists at all for a reference ID. We
   treat this as "this payment was never routed through a proxy" (e.g., a direct-to-phone
   payment), **not** as a failed delivery.
2. **`awaiting_confirmation`** — a record exists, but `confirmed_at` is null. Field process hasn't
   reported back yet.
3. **`confirmed`** — a record exists with a non-null `confirmed_at`.

Please confirm: is "no record" ever ambiguous on your side (e.g., could a proxy delivery be in
progress but simply not yet synced to the fork, in a way that looks identical to "never routed
through a proxy")? If so we need a way to distinguish those two cases, or our delivery-rate
denominator (PRD §5.4, OQ-7) misreports.

## 4. Delivery-rate denominator (OQ-7 — needs SAPCONE sign-off too)

Our current logic: delivery rate = confirmed / (confirmed + awaiting_confirmation). Payments with
no delivery record at all are excluded from both numerator and denominator (treated as "not
applicable," not as a failure). Please confirm this matches your and SAPCONE's expectations for
what the delivery-rate metric should mean.

## 5. Authentication (OI-2)

Since we read your data via the fork rather than directly, this is primarily a DisburseFlow
question, but if there's a separate LastMile-side auth or data-sharing agreement that gates what
reaches the fork, let us know so we can flag any gap.

## What happens once we have this

We update `backend/src/services/lastMileClient.ts` (the parser and the three-state mapper) to
match your confirmed field names and any edge cases from §3. No other part of our backend needs
to change — aggregation, PII filtering, caching, routes, and PDF export all already operate on
our internal `DeliveryConfirmation` / `DeliveryView` types.

## Not your call, but flagging for visibility

**OQ-4** (SAPCONE's decision, not LastMile's or ours): the public Stellar explorer transaction
page exposes wallet addresses. This is a consequence of independent verification on a public
ledger, not something LastMile's data model causes — noted here only for completeness.
