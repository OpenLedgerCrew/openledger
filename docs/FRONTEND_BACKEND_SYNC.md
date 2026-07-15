# Frontend ↔ Backend Sync — Status & Working Plan

**Goal:** get `frontend/` and `backend/` working together **without changing the frontend**.
**Rule:** the frontend is the fixed contract; the backend adapts. Anything that genuinely cannot
be reconciled backend-only is flagged below as an **ALERT** with an owner and a proposed fix — no
frontend edits have been made.

Status date: 2026-07-15. Backend: Express, 48 tests green. Frontend: React 19 (Vite), unchanged.

---

## TL;DR — how to run it today

The frontend uses **relative URLs with no proxy and no API-base config**, so it only reaches the
backend when they share an origin. The backend serves the built frontend:

```bash
cd frontend && npm run build        # produces frontend/dist
cd ../backend && npm start          # serves app + API on http://localhost:3001
# open http://localhost:3001   (NOT the Vite dev server on :5173)
```

Opening `:5173` (Vite dev) will *look* like it works but silently breaks every API call — see
**A1** below (this is what produced the "damaged PDF": Vite returned `index.html` and it got
saved as `.pdf`).

---

## ✅ In sync (backend already aligned — no action needed)

| Area | Contract | Where |
| --- | --- | --- |
| Aggregates | `GET /api/programmes/:id/aggregates` → bare `ProgrammeAggregates` | `backend/src/routes/api.ts` |
| Payments | `GET /api/programmes/:id/payments?page=&limit=` → `{payments, total_pages, …}` | `api.ts` |
| Payment detail | `GET /programmes/:id/payments/:ref` → flat `funds_leg`/`delivery_leg` | `readModel.ts` |
| PDF export | `GET /api/programmes/:id/export?include_*` → `application/pdf` | `api.ts`, `pdf.ts` |
| Dual prefix | every route mounted under both `/` and `/api` | `backend/src/index.ts` |
| Row shape | `PaymentRow` matches `frontend/src/types.ts` exactly | `readModel.ts` |
| Disclosure & labels | byte-identical copy on both sides | `constants/*` |
| Same-origin serving | backend serves `frontend/dist` + SPA fallback | `backend/src/server.ts` |

---

## 🚩 Not in sync — ALERTS

### A1 — Dev mode can't reach the backend (BLOCKER for `npm run dev`)
- **What:** Frontend fetches `/api/...` relatively. The Vite dev server (`:5173`) has no proxy, so
  those requests hit Vite, which returns `index.html` at HTTP 200. The frontend's `res.ok` check
  passes and it consumes HTML as data (JSON parse fails → catch → mock; or blob saved as a broken
  `.pdf`).
- **Impact:** Running via `npm run dev` shows mock data everywhere and produces corrupt PDF
  downloads. Only `build` + backend-`start` (same origin) works.
- **Why not backend-only:** the backend can't intercept requests made to Vite's port.
- **Owner / fix (needs your call):** add a proxy to `frontend/vite.config.ts` so dev-mode HMR
  reaches `:3001`:
  ```ts
  server: { proxy: { '/api': 'http://localhost:3001', '/programmes': 'http://localhost:3001' } }
  ```
  This is a frontend *config* change (not design/feature). **Decision needed:** allow this one
  file, or standardize on the `build` + `npm start` flow and skip Vite dev.

### A2 — Every programme shows identical data
- **What:** The seed fork client ignores the programme id, so all four cards
  (`turkana-livelihoods-programme`, `krp-2025`, …) return the same dataset (USDC 150.00, 30
  payments). There is no `GET /programmes` list endpoint and no per-programme data.
- **Impact:** The demo can't show distinct programmes; card metadata and modal data disagree.
- **Why not backend-only:** requires the real DisburseFlow fork read API (per-programme data) —
  this is open item **OQ-1** (`docs/OPEN_ITEMS.md`, `docs/REQUIREMENTS_FOR_DISBURSEFLOW.md`).
- **Owner:** DisburseFlow (data) → then backend wires it. Until then, seed is the stand-in.

### A3 — Programme card metadata is hard-coded in the frontend
- **What:** `description`, budget (KES), `beneficiaries`, `startDate`/`endDate`, `status`,
  `period`, emoji are literals in `ProgrammeView.tsx` / `PdfExport.tsx` / dashboard. The backend
  has no source for them.
- **Impact:** Cards show placeholder business data unrelated to the real payments in the modal.
- **Why not backend-only:** no data source exists; fabricating it would be misleading.
- **Owner:** Product + DisburseFlow (define a programme-metadata contract) → backend serves it,
  frontend swaps hard-coded values for the API. Deferred; not fabricated (per your instruction).

### A4 — The payment **detail page** is unreachable (endpoint built but unused)
- **What:** `App.tsx` routes only `/`, `/programmes`, `/export`. `pages/PaymentDetail.tsx` (which
  fetches `GET /programmes/:id/payments/:ref`) is imported nowhere. The running "payment details"
  UX is `PaymentDetailsModal`, which renders from the row object already in hand and makes **no
  fetch**.
- **Impact:** The aligned detail endpoint is currently dead in the running app.
- **Why not backend-only:** needs a frontend route (`<Route path="/programmes/:id/payments/:ref">`)
  to be used.
- **Owner:** Frontend — add the route (or confirm the modal is the intended detail UX and the
  page/endpoint are deprecated). Backend endpoint is ready either way.

### A5 — `delivery_rate` renders as `0.5%` instead of `50%`
- **What:** Backend returns a **fraction** `0.5` (per PRD §5.4 and the frontend's own MSW fixture,
  which also uses `0.5`). The modal renders `` `${delivery_rate}%` `` → **"0.5%"**. (The
  frontend's *mock* fallback uses `96`, a percentage — so the frontend is internally inconsistent
  about the unit.)
- **Impact:** Delivery rate displays 100× too small.
- **Why not backend-only:** returning `50` would break the frontend's MSW test fixture and the PRD
  contract. This is a frontend rendering bug (`* 100`).
- **Owner:** Frontend (multiply by 100 on render) — or agree a contract change to percentage and
  update both fixtures. **Decision needed on the unit.**

### A6 — Frontend masks API failures with mock data / fake success
- **What:** `ProgrammeDetailModal` `catch` → `MOCK_PAYMENTS`; `PdfExport` `catch` → marks the job
  "success" even on failure.
- **Impact:** Sync failures are invisible — this is *why* the Vite-dev breakage (A1) looked like it
  worked and cost debugging time.
- **Why not backend-only:** it's frontend error handling.
- **Owner:** Frontend — at minimum log/telemetry on catch, or show an error state in dev.

### A7 — Amounts have no thousand separators
- **What:** Backend emits `"2600.00"`; the modal renders `a.total` verbatim (no `toLocaleString`).
  Mock data uses `"5,200,000"`.
- **Impact:** Large totals read as `2600.00` not `2,600.00`. Cosmetic.
- **Owner:** Decide who formats — backend could emit grouped strings, or frontend could format.
  Low priority.

### A8 — Explorer base URL hard-coded in the frontend (minor)
- **What:** Components hard-code `https://stellar.expert/explorer/testnet` and rebuild links from
  `tx_hash`, ignoring the backend's `explorer_url` (which honors `EXPLORER_BASE_URL`).
- **Impact:** If the backend is pointed at mainnet, the frontend still links to testnet.
- **Owner:** Frontend — prefer the backend's `explorer_url` when present. Fine for the testnet demo.

---

## Working plan (suggested sequence & ownership)

1. **Unblock running (now).** Standardize on `build` + backend-`start` (single origin). If we want
   `npm run dev` HMR too → **you approve** the one-line Vite proxy (A1). *Owner: you decide;
   backend already supports both.*
2. **Frontend display fixes (small, high-value).** A5 (`delivery_rate * 100`), A6 (don't hide
   errors), A7 (format amounts). *Owner: frontend team.*
3. **Wire the detail page or deprecate it (A4).** Decide modal-only vs. add the route. *Owner:
   frontend.*
4. **Real programme data (A2, A3).** Chase DisburseFlow for OQ-1 + a programme-list/metadata
   contract (`docs/REQUIREMENTS_FOR_DISBURSEFLOW.md`); backend then replaces the seed and serves
   real per-programme data + metadata. *Owner: DisburseFlow → backend.*

**Backend is done for this pass.** Items above are either your decisions (A1, A5 unit), frontend
changes (A4–A8), or upstream data (A2, A3). Tell me which you want to action and I'll take the
backend-side pieces (and the Vite proxy, if you approve touching that one file).
