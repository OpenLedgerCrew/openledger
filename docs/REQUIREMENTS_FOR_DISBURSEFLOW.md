# Requirements from OpenLedger to DisburseFlow (SDP Fork)

**From:** OpenLedger team (Product 3)
**To:** DisburseFlow team (Product 1)
**Re:** the SDP fork's read API — what OpenLedger needs to move from a seed dataset to your real data.

OpenLedger's backend is fully built and tested against a fixture that assumes the shape below.
Everything downstream (PII stripping, aggregation, caching, the public API, PDF export) is
already implemented and will not need to change once your real contract lands — only our fork
client (`backend/src/services/sdpForkClient.ts`) does. This document is what we need from you to
make that swap. Full background: `OpenLedger Documentation.md` §3.1, and `docs/OPEN_ITEMS.md`
(OI-1, OI-2).

## 1. Endpoints (OQ-1 — blocks all implementation)

We need the exact, deployed base URL and paths for:

| Read | What we need |
| --- | --- |
| Get a programme | `GET {base}/programmes/:programmeId` (or your actual path) → programme metadata |
| List payments for a programme | `GET {base}/programmes/:programmeId/payments` (or your actual path) → payment array, scoped to that programme |
| List delivery confirmations for a programme | Same question — see §3 below, since this may come from LastMile via your model rather than a fork endpoint of its own |

Our client currently calls provisional paths matching the pattern above and treats a
non-200/unreachable response as "no data" rather than crashing. Please tell us:
- The real base URL for each environment (testnet / staging / demo).
- The real path and HTTP method for each read.
- Whether reads are paginated on your side, and if so, the pagination contract (so we don't
  silently truncate large programmes).

## 2. Payment record fields (assumption A-1 — stop-the-line if wrong)

We need every settled payment to expose a **Stellar transaction hash**. Please confirm the
payment record includes, at minimum:

| Field | Type | Notes |
| --- | --- | --- |
| `reference_id` | string | Stable, opaque, safe for public display (A-2). This is our join key with LastMile data. |
| `amount` | string | Decimal string, e.g. `"100.00"` |
| `asset` | string | e.g. `"USDC"`, `"XLM"` |
| `status` | string | One of `READY`, `PENDING`, `SUCCESS`, `FAILED` — confirm this is your actual state machine, or tell us the real one and we'll remap |
| `created_at` | string (ISO 8601, UTC) | |
| `settled_at` | string or null | Null until settled |
| `tx_hash` | string or null | **Must be present and non-null on every `SUCCESS` payment.** If this is not available, our core verification feature (explorer deep link) is not buildable — please flag immediately if this is at risk (A-1). |

If your actual field names differ, that's fine — just tell us the mapping and we'll update the
adapter. We do **not** need write access; OpenLedger is a pure read consumer (PRD §3.1.2) and
will never register payments or confirmations through your API.

## 3. Delivery confirmation data (A-4)

The PRD states delivery confirmations "appear within the SDP fork's data model" as an extension
alongside payment data, sourced from LastMile. We need to know:
- Is this literally a field/array on the payment record, or a separate endpoint on the fork?
- Confirm it joins on the **same `reference_id`** as the payment record. If LastMile uses a
  different identifier internally that gets translated before it reaches us, tell us where that
  translation happens.

Fields we expect per confirmation (also sent to the LastMile team — see
`REQUIREMENTS_FOR_LASTMILE.md`):

| Field | Type | Notes |
| --- | --- | --- |
| `reference_id` | string | Join key |
| `proxy_id` | string | Internal only — we never render this publicly (§4.3) |
| `confirmed_at` | string or null | Null = not yet confirmed |
| `geotag` | `{ lat, lon }` or null | Internal only — never rendered publicly (§4.3) |
| `anchoring_tx_hash` | string or null | If the confirmation itself is anchored on-chain |

## 4. Programme scoping (A-3)

Confirm reads can be scoped by programme ID server-side (not "fetch everything and filter
client-side" — at scale that's a correctness and performance problem for us).

## 5. Authentication (OI-2 — do not skip this)

The PRD explicitly leaves server-to-fork auth unspecified pending your gap analysis. **We have
not implemented any auth mechanism and will not guess one.** Please tell us:
- What auth scheme to use (API key, mTLS, signed requests, service-to-service token, etc.)
- Where credentials/secrets should be provisioned for our deployment
- Whether auth differs between environments (testnet vs. demo vs. eventual production)

Two tests on our side are currently `it.skip` specifically waiting on this
(`backend/test/integration/sdpForkClient.test.ts`, `backend/test/integration/lastMileClient.test.ts`).

## 6. Testnet stability (OQ-3, A-5)

We need the next testnet reset date. If testnet resets during the Studio demo window, our cached
deep links (and the demo itself) break and require a re-seed. This is time-sensitive — please
confirm this week if possible.

## What happens once we have this

We swap the provisional URLs/fields/auth into `sdpForkClient.ts` — a contained change. No route,
aggregation, PII, caching, or PDF code needs to change, since all of that already operates on our
internal `Payment` / `DeliveryConfirmation` types, not on your wire format directly.

## Not your call, but flagging for visibility

**OQ-4** (owned by SAPCONE, not DisburseFlow or us): the public explorer transaction page exposes
wallet addresses. This needs SAPCONE sign-off before demo, independent of anything above.
