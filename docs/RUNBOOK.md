# Local Development Runbook

A self-contained, step-by-step guide to running OpenLedger against a **real** DisburseFlow
(G3) fork on your own machine — from an empty G3 checkout to a fully working local stack —
plus a troubleshooting section for every failure mode we've actually hit setting this up.

If you just want to develop the UI without any of this, you don't need this doc: run
`openledger/backend` with no `.env` and it serves realistic in-memory seed data on its own
(see `backend/README.md`).

## Architecture at a glance

```
┌─────────────────────┐        ┌───────────────────────┐        ┌────────────────────────┐
│  G3 SDP backend      │  <──   │  OpenLedger backend    │  <──   │  OpenLedger frontend    │
│  (DisburseFlow fork)  │  HTTP  │  (Express, Node)       │  HTTP  │  (Vite dev server)      │
│  :8000                │  API   │  :3001                 │ /api/* │  :5173                  │
│                       │  key   │                        │ proxy  │                         │
└─────────────────────┘        └───────────────────────┘        └────────────────────────┘
```

- The **G3** repo owns the actual disbursement/payment data (Postgres-backed, real Stellar testnet transactions).
- The **OpenLedger backend** reads that data read-only through a scoped API key, strips PII, computes aggregates, and re-serves it as its own public API.
- The **OpenLedger frontend** never talks to G3 directly — it only ever calls its own backend's `/api/*` routes, proxied by Vite in dev.

## Prerequisites

- Docker (G3's stack runs entirely in containers)
- Go (for G3's setup wizard)
- Node.js — Vite 6 has a specific version constraint (odd majors like 19/21/23 aren't supported); see "Node version" under Troubleshooting below if the frontend dev server misbehaves
- `jq`, `git`, `curl`

## Step 1 — Bring up G3 (DisburseFlow fork)

```bash
git clone --recursive https://github.com/DisburseFlow/G3.git
cd G3/backend
make setup   # interactive wizard — choose testnet, let it launch the Docker stack
```

Full walkthrough (Docker specifics, local DNS, HTTPS, monitoring): `G3/backend/dev/README.md`.

**Verify before moving on:**
```bash
curl http://localhost:8000/health
# {"status":"pass","version":"...","service_id":"serve","services":{"database":"pass"}}
```
If this doesn't return quickly, don't proceed to step 2 — see [G3 never comes up](#g3-never-comes-up).

At this point the SDP API is live but its database has **zero disbursements** — `make setup`
seeds wallets/assets/tenants, not demo transaction data.

## Step 2 — Seed demo data + wire up OpenLedger's `.env`

```bash
G3/backend/dev/scripts/seed-demo-disbursement.sh
```

What it does, in order: logs in as the default `owner@default.local` user, looks up the
auto-seeded "Demo Wallet" wallet and "XLM" asset, creates one disbursement with 3 receivers
(uploading the CSV in the same request), starts it (`READY → STARTED`), mints a read-only API
key scoped to `read:disbursements` + `read:payments`, and writes `SDP_FORK_BASE_URL` +
`SDP_API_KEY` into `openledger/backend/.env` (created from `.env.example` if missing).

**Expected output** ends with something like:
```
==> Done.
    Disbursement: <uuid> (Demo Disbursement — 2026-07-16)
    Wallet/Asset: Demo Wallet / XLM
    Remember: OPENROUTER_API_KEY is a separate, manually-added team secret (see openledger/README.md).
```

The script assumes `G3` and `openledger` are cloned as **sibling directories**. If yours aren't:
```bash
OPENLEDGER_BACKEND_DIR=/path/to/openledger/backend G3/backend/dev/scripts/seed-demo-disbursement.sh
```
If it can't find that directory at all, it just prints the two values for you to paste in by hand — nothing fails silently.

Safe to re-run any time you want more demo data — each run adds a new disbursement rather than overwriting anything.

**Verify:**
```bash
grep -E 'SDP_FORK_BASE_URL|SDP_API_KEY' openledger/backend/.env
```
Both lines should be present and non-empty.

## Step 3 — Add the shared OpenRouter key (manual — it's a team secret)

The seed script can't mint this one for you. Open `openledger/backend/.env` and set:
```env
OPENROUTER_API_KEY=<ask a teammate, or grab your own free key from openrouter.ai>
```
Without it, the AI transparency summary and chat assistant still work — they just answer from a
deterministic, non-AI fallback instead of calling OpenRouter. Nothing breaks if you skip this.

## Step 4 — Run OpenLedger

```bash
cd openledger/backend && npm install && npm run dev
```

**Verify the backend picked up your `.env`** — this is the single most common thing that goes
wrong in this whole chain, see [the dedicated gotcha below](#env-changes-dont-take-effect):
```bash
curl http://localhost:3001/api/programmes
```
You should see your seeded disbursement's real name, not an empty `{"programmes":[]}`. The
backend's boot log line is also authoritative:
```
OpenLedger backend listening on 0.0.0.0:3001 (data source: SDP fork at http://localhost:8000)
```
If it instead says `(data source: in-memory seed data)`, the backend didn't see
`SDP_FORK_BASE_URL` at all — see the gotcha below.

Then, in a second terminal:
```bash
cd openledger/frontend && npm install && npm run dev
```
Open `http://localhost:5173` — the homepage stats and `/programmes` list should show your real
seeded disbursement(s), not any hardcoded/fake programme names.

## Letting someone else hit your instance remotely

If a teammate needs their *own* local frontend to call *your* running backend (instead of
running their own G3 fork), tunnel your backend and have them override the proxy target:

```bash
# on your machine
ngrok http 3001

# on their machine, from openledger/frontend
VITE_BACKEND_URL=https://<your-tunnel-domain> npm run dev
```

`frontend/vite.config.ts`'s dev proxy already defaults to `http://localhost:3001`, reads
`VITE_BACKEND_URL` when set, and sends `ngrok-skip-browser-warning: true` on every proxied
request so ngrok's free-tier interstitial page doesn't return HTML instead of JSON. This is a
public URL for as long as the tunnel is up — treat it accordingly.

---

## Troubleshooting

### G3 never comes up

`curl http://localhost:8000/health` times out or connection-refuses.

- Is Docker actually running? `docker ps` should list `sdp-db`, `sdp-api`, etc.
- Did `make setup` finish? It's interactive and will hang waiting for input if you're not
  watching the terminal.
- Port conflict: something else already bound to `8000`/`5432`/`3000`/`4000`? `lsof -i :8000`.

### Seed script can't find "Demo Wallet" / "XLM"

```
error: could not find the 'Demo Wallet' wallet and/or 'XLM' asset.
```
These are only auto-seeded on a **testnet** setup (`db setup-for-network --all`, run
automatically by the `sdp-api` container's startup command). If you chose "pubnet (mainnet)" in
the setup wizard, or the container's first-boot migration didn't finish, they won't exist.
Restart the wizard and choose testnet, or check `docker logs` for the `sdp-api` container to
confirm `setup-for-network` actually ran.

### Disbursement created but `STARTED` fails

The script prints a warning and leaves the disbursement in `READY` rather than failing outright.
This is almost always an under-funded distribution account (needs XLM to pay transaction fees).
Fund it and re-run the status PATCH yourself:
```bash
cd G3/backend
go run tools/sdp-create-and-fund/main.go --secret <DISTRIBUTION_SEED> --fundxlm
```
The distribution seed/public key are in `G3/backend/dev/.env` (or whichever `.env.*` file the
setup wizard generated).

### `.env` changes don't take effect

**This backend has no dotenv autoloader.** Editing `openledger/backend/.env` and running
`npm run dev` again does **not** pick up your changes unless the variables are actually present
in the shell's environment when the process starts — there's no silent magic reading the file.
Two ways to actually load it:
```bash
# One-off, this shell session only:
set -a && source .env && set +a && npm run dev

# Or export the specific vars inline:
SDP_FORK_BASE_URL=http://localhost:8000 SDP_API_KEY=<key> npm run dev
```
The symptom of getting this wrong is subtle: the server starts fine, logs
`(data source: in-memory seed data)`, and serves plausible-looking fake data with **no error at
all** — always check that boot-log line after any `.env` edit.

### Colleague gets `ETIMEDOUT` connecting through your ngrok tunnel

A raw TCP connect timeout (not a TLS or HTTP error) from *their* machine, while the tunnel works
fine from yours, means *their* network can't reach ngrok's servers — this isn't fixable from your
side. Have them run, directly (not through Vite):
```bash
curl -I https://<your-tunnel-domain>
```
- **Fails the same way** → network-level block (corporate firewall/VPN often specifically
  blocklist `*.ngrok-free.dev`/`*.ngrok.io` as a "tunneling" risk). Needs a different network, VPN
  off, or IT allowlisting — not a code fix.
- **Succeeds** → likely a broken IPv6 path on their machine specifically for Node. Retry with:
  ```bash
  NODE_OPTIONS=--dns-result-order=ipv4first VITE_BACKEND_URL=https://<your-tunnel-domain> npm run dev
  ```
- Also worth checking: `echo $HTTPS_PROXY $HTTP_PROXY` on their machine — if their org mandates
  an outbound proxy, Node's raw TCP connect won't use it automatically the way a browser does.

### Vite dev server crashes with `protocol.split(':')[0]` (or similar, inside `node_modules/vite/dist/node/chunks/...`)

We hit this once and didn't get a confirmed root cause — it happened even with `VITE_BACKEND_URL`
completely unset, which rules out a malformed override value (the default,
`http://localhost:3001`, is a valid URL). This is Vite's dev-server proxy failing to parse a
`target` into a URL internally. If you hit this, work through in order:

1. **Confirm it's really unset**: `echo "$VITE_BACKEND_URL"` should print nothing. Check your
   shell profile (`.zshrc`/`.bashrc`) isn't exporting a stray value globally.
2. **Node version**: this repo's own installed Vite (6.4.x) declares
   `engines.node: "^18.0.0 || ^20.0.0 || >=22.0.0"` — note this **excludes odd majors** (19, 21,
   23). The README's stated minimum (`>=20.17`) is necessary but not sufficient; run `node -v`
   and confirm you're actually on an 18.x, 20.x, or 22+ release, not an odd-numbered one.
3. **Clean reinstall**: `rm -rf node_modules package-lock.json && npm install` — rules out a
   corrupted/partial `node_modules`.
4. **Diff `vite.config.ts` against the repo**: `git diff origin/main -- vite.config.ts` — rules
   out a stale local edit or merge artifact.

If none of these resolve it, capture the **full** stack trace (the actual thrown error type/message,
not just the `chunks/...` line) and the exact command that triggered it — that's what's needed to
actually root-cause it rather than guess further.
