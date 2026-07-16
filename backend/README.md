# OpenLedger Backend

Read-only API for the donor-facing verification portal. Joins DisburseFlow payment data and
LastMile delivery confirmations (via the SDP fork), strips PII at the boundary, aggregates
programme metrics, and deep-links settled payments to the public Stellar explorer. See
`../OpenLedger Documentation.md` for the full PRD and `docs/OPEN_ITEMS.md` for open questions.

Built on **Express** (`src/index.ts`). The PRD allows "Fastify or Express" (§2.3); this backend
was rewritten from an initial Fastify scaffold to Express per the team's preference — see
`docs/DECISIONS.md` (SD-1).

## Requirements

- Node.js (see `tsconfig.json` for target — ES2022/ESNext)
- npm

## Install

```bash
npm install
```

This pulls in Puppeteer, which downloads a Chromium build on first install. If Chromium can't be
provisioned in your environment, the PDF export still works — it falls back to `pdf-lib` (see
"PDF rendering" below).

## Run

```bash
npm start        # runs src/server.ts once via tsx
npm run dev       # same, but restarts on file change (tsx watch)
```

The server logs its bound address and port on boot, e.g.:

```
OpenLedger backend listening on 0.0.0.0:3001 (data source: in-memory seed data)
```

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | Port to listen on |
| `HOST` | `0.0.0.0` | Host to bind |
| `SDP_FORK_BASE_URL` | *(unset)* | Base URL of a live SDP fork (DisburseFlow/G3) read API. When unset, the server serves **baked-in seed data** instead (see below) |
| `SDP_API_KEY` | *(unset)* | Read-only API key for the fork above (`Authorization: Bearer SDP_...`), scoped to `read:disbursements` + `read:payments`. Required whenever `SDP_FORK_BASE_URL` is set — see the root README's "Running Against a Real DisburseFlow (G3) Fork Locally" for how to mint one |
| `EXPLORER_BASE_URL` | `https://stellar.expert/explorer/testnet` | Base URL used to build explorer deep links (`{base}/tx/{hash}`) |
| `OPENROUTER_API_KEY` | *(unset)* | Enables the AI transparency summary and chat assistant via OpenRouter. Without it, both features still work — they answer from a deterministic, non-AI fallback |
| `OPENROUTER_MODEL` | `google/gemma-4-26b-a4b-it:free` | Override the free OpenRouter model used for the above |

**Data source:** until `SDP_FORK_BASE_URL` (+ `SDP_API_KEY`) points at a real, running DisburseFlow
fork, the server serves an in-memory seed dataset (`src/services/seedForkClient.ts`) that mirrors
the test fixtures — 30 payments across mixed statuses/assets/delivery states — so the API returns
realistic data out of the box. When both are set, the server switches to the real HTTP client
(`src/services/sdpForkClient.ts`), which authenticates with the API key and degrades to empty
results if the fork is unreachable rather than crashing. The LastMile delivery-confirmation
contract genuinely doesn't exist yet (`docs/OPEN_ITEMS.md`, OQ-2) — delivery data is always empty
until that integration lands, independent of the SDP fork connection.

## Test

```bash
npm test          # vitest run — unit, integration, acceptance suites
npm run typecheck # tsc --noEmit
```

Acceptance tests hit the real Express app via `supertest` (no server bound to a port — supertest
manages an ephemeral listener per request); the SDP fork is the only faked boundary.

Two auth-related tests are intentionally `it.skip` (OI-2 — server-to-fork auth mechanism is an
open item, not yet implemented against a guessed scheme). Everything else should pass.

## API

All endpoints are public GETs (no auth, no login — see PRD §6.1 item 1). CORS is open for GET.

### `GET /programmes/:programmeId`

The public programme view: aggregate metrics, the disclosure text, and a paginated payment table.

Query params: `?page=1` (default `1`; page size is fixed at 25).

```json
{
  "programme_id": "prog-1",
  "aggregates": {
    "totals_by_asset": [{ "asset": "USDC", "total": "150.00" }, { "asset": "XLM", "total": "2600.00" }],
    "payment_count": { "total": 30, "settled": 27, "pending": 2, "failed": 1 },
    "delivery_rate": 0.5,
    "rate_basis": { "confirmed": 1, "awaiting_confirmation": 1, "excluded_no_delivery_record": 28 },
    "timezone": "UTC",
    "generated_at": "2026-07-14T17:05:39.000Z"
  },
  "disclosure": "How to read this page\n\n...",
  "payments": [
    {
      "reference_id": "REF-001",
      "amount": "100.00",
      "asset": "USDC",
      "status": "SUCCESS",
      "created_at": "2026-07-01T09:00:00Z",
      "settled_at": "2026-07-01T09:05:00Z",
      "tx_hash": "1111...1111",
      "delivery_confirmed_at": "2026-07-02T10:00:00Z",
      "explorer_url": "https://stellar.expert/explorer/testnet/tx/1111...1111",
      "settlement_label": null,
      "delivery": {
        "state": "confirmed",
        "label": "Cash confirmed delivered",
        "confirmed_at": "2026-07-02T10:00:00Z",
        "anchoring_tx_hash": "dcdc...dcdc",
        "explorer_url": "https://stellar.expert/explorer/testnet/tx/dcdc...dcdc"
      }
    }
  ],
  "pagination": { "page": 1, "page_size": 25, "total_items": 30, "total_pages": 2 }
}
```

Notes:
- `settlement_label` is `"Not yet settled."` for READY/PENDING payments with no tx hash, `null`
  otherwise. It is not an error state.
- `delivery.state` is one of `confirmed` / `awaiting_confirmation` / `not_applicable` (a payment
  with no LastMile record at all is `not_applicable`, distinct from an unconfirmed record).
- No PII (name, phone, wallet address, proxy identity, geotag) ever appears in this response.

### `GET /programmes/:programmeId/payments/:referenceId`

The payment detail view — both legs shown separately and honestly labelled. `404` if the
reference ID doesn't exist in the programme.

```json
{
  "reference_id": "REF-001",
  "amount": "100.00",
  "asset": "USDC",
  "status": "SUCCESS",
  "created_at": "2026-07-01T09:00:00Z",
  "settled_at": "2026-07-01T09:05:00Z",
  "tx_hash": "1111...1111",
  "funds_leg": {
    "label": "Funds sent",
    "status": "SUCCESS",
    "settled_at": "2026-07-01T09:05:00Z",
    "tx_hash": "1111...1111",
    "explorer_url": "https://stellar.expert/explorer/testnet/tx/1111...1111",
    "settlement_label": null
  },
  "delivery_leg": {
    "label": "Cash confirmed delivered",
    "delivery": { "state": "confirmed", "label": "Cash confirmed delivered", "...": "..." }
  },
  "disclosure": "How to read this page\n\n..."
}
```

### `GET /programmes/:programmeId/export.pdf`

Downloads a PDF impact report: programme name, aggregates, the **full** (unpaginated) payment
table, the disclosure text in full, and a generation timestamp. Zero PII. Rendered from the same
content template as the JSON views (`src/services/reportTemplate.ts`), so the PDF can't drift
from the web data.

```bash
curl -o report.pdf http://localhost:3001/programmes/prog-1/export.pdf
```

## PDF rendering

Two engines, tried in order (`src/services/pdf.ts`):

1. **Puppeteer** (primary, per the PRD) — renders the shared HTML template in headless Chromium.
2. **pdf-lib fallback** — if Chromium can't be launched in the environment, the same content is
   laid out as plain text so the export still succeeds. The engine actually used is logged once
   on first export (`[pdf] rendering engine: ...`).

## Architecture notes

- **No runtime chain dependency.** Explorer links are pure string concatenation
  (`{base}/tx/{hash}`); the backend never calls Horizon, RPC, or any blockchain endpoint.
- **PII is stripped server-side at the fork-client boundary** (`filterPayment`,
  `parseDeliveryRecord`), before data reaches routes or the cache — see `src/services/piiFilter.ts`
  and `src/services/lastMileClient.ts`.
- **No database.** An in-process `ReadModelCache` (`src/services/cache.ts`) is the only storage,
  with TTLs keyed by data kind (settled payments never expire; pending/aggregates/deliveries
  expire in 45–60s).
- See `IMPLEMENTATION_CHECKLIST.md` for a feature-by-feature status list and the open upstream
  dependencies (OQ-1, OQ-2, OI-2) that block replacing the seed data with a real fork.
