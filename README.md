# OpenLedger — Donor Transparency Portal

OpenLedger is a read-only, public, donor-facing verification portal for SAPCONE's cross-border disbursement system. It allows any donor, auditor, or member of the public to verify that funds moved on the Stellar blockchain and that last-mile delivery was recorded — without logging in, without installing anything, and without any prior knowledge of the system.

---

## Product Context

OpenLedger is Product 3 of a three-product disbursement and verification system built for SAPCONE:

| Product | Role |
|---------|------|
| **DisburseFlow** | Moves the money — manages the payment lifecycle and settles on the Stellar network |
| **LastMile** | Delivers to beneficiaries without phones — records physical delivery confirmations via field agents |
| **OpenLedger** | The proof layer — lets outsiders verify that both the funds movement and the physical delivery happened |

OpenLedger reads from a fork of DisburseFlow's data model and displays that data publicly. It does not sit inside the money movement path; it only reads and presents what already exists on-chain or in the delivery record.

---

## Key Features

1. Programme view with aggregate metrics — total disbursed, payment count, delivery rate, and beneficiary reach per programme
2. Individual payment table with reference ID, amount, asset, status, and timestamps for each payment record
3. Deep links from each settled payment to the public Stellar explorer, allowing independent on-chain verification without any intermediary
4. Delivery confirmations from LastMile shown alongside payments where field confirmation data exists
5. PDF impact report export per programme — includes the full unpaginated payment table, statistical aggregates, blockchain explorer links, and a generation timestamp
6. Shareable public links — any programme or payment can be linked directly with no login required
7. Zero PII displayed anywhere in the portal — only opaque reference IDs, no names, phone numbers, or wallet addresses

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19, TypeScript 5 |
| Build tool | Vite 6 |
| Routing | React Router DOM 7 |
| UI components | Radix UI primitives, shadcn/ui |
| Styling | Tailwind CSS 4, custom CSS |
| HTTP client | Native `fetch` (via Vite dev proxy to backend) |
| PDF generation | WKHTMLTOPDF (server-side, via Express backend) |
| Blockchain verification | Stellar network — deep links to stellar.expert, no runtime API calls |
| Testing | Vitest, Testing Library, MSW |

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/                  # Radix-based design system components
│   │   ├── lib/                 # Utility helpers (cn, etc.)
│   │   ├── Header.tsx           # Site-wide navigation header
│   │   ├── Footer.tsx           # Site-wide footer
│   │   ├── DisclosureBanner.tsx # Honest-about-limits disclosure
│   │   ├── ExplorerLink.tsx     # Stellar explorer deep-link wrapper
│   │   ├── ExportButton.tsx     # PDF export trigger
│   │   ├── PaymentDetailsModal.tsx   # Per-payment detail overlay
│   │   └── ProgrammeDetailModal.tsx  # Per-programme detail overlay
│   ├── pages/
│   │   ├── dashboard.tsx        # Home page with hero and programme overview
│   │   ├── ProgrammeView.tsx    # Programmes list with search and filter
│   │   ├── PdfExport.tsx        # Server-side PDF export render target
│   │   ├── About.tsx            # About OpenLedger page
│   │   ├── Contact.tsx          # Contact and inquiry form page
│   │   └── PaymentDetail.tsx    # Individual payment detail page
│   ├── api/                     # API client functions and request helpers
│   ├── types/                   # Shared TypeScript type definitions
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Pure utility functions
│   ├── constants/               # Application-wide constants
│   ├── routes/                  # Route definitions
│   ├── App.tsx                  # Root component with route declarations
│   ├── main.tsx                 # Application entry point
│   └── styles.css               # Global styles and Tailwind configuration
├── test/
│   ├── components/              # Component-level unit tests
│   └── setup.ts                 # Test environment setup
├── vite.config.ts               # Vite configuration including dev proxy
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js version 20.17.0 or higher
- npm version 10 or higher

### Clone the Repository

```bash
git clone git@github.com:OpenLedgerCrew/openledger.git
```

### Install Frontend Dependencies

```bash
cd openledger/frontend
npm install
```

### Start the Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

> **Note:** The frontend proxies all `/api/*` requests to the backend at `http://localhost:3001`. You must also start the backend for data to load. See the backend `README.md` for setup instructions.

### Start the Backend (Required for Data)

```bash
cd openledger/backend
npm install
npm run dev
```

The backend serves programme and payment data on `http://localhost:3001`.

### Build for Production

```bash
npm run build
```

The compiled output will be placed in `frontend/dist/`.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server with hot module replacement |
| `npm run build` | Compile TypeScript and bundle for production |
| `npm run preview` | Serve the production build locally for review |
| `npm run test` | Run the Vitest test suite |
| `npm run typecheck` | Run TypeScript type checking without emitting files |

---

## Running Against a Real DisburseFlow (G3) Fork Locally

By default the backend serves in-memory seed data (see `backend/README.md`), which is enough to
develop the UI without any other services running. To develop against the **real** DisburseFlow
fork (G3) instead — real disbursements, real payments, real Stellar transaction hashes, seeded
demo data, and remote/ngrok access for teammates — see **[`docs/RUNBOOK.md`](docs/RUNBOOK.md)**
for the full step-by-step and a troubleshooting section covering every failure mode we've hit
setting this up.

---

## Environment Variables

The frontend has **no `.env` file** in normal local development — every API call is a relative
`fetch('/api/...')`, resolved by the Vite dev proxy in `frontend/vite.config.ts`. The only
frontend-side override is an env var passed on the command line, not a `.env` file (Vite config
files run in Node before `.env` loading applies to client code):

| Variable | Default | Purpose |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:3001` | Where the `/api/*` dev proxy forwards to. Override to point your local frontend at a remote/tunneled backend — see `docs/RUNBOOK.md`. |

The **backend**'s configuration is a real `.env` file (`openledger/backend/.env`, copy from
`.env.example`) — see `backend/README.md` for the full list (`SDP_FORK_BASE_URL`, `SDP_API_KEY`,
`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `EXPLORER_BASE_URL`, `PORT`, `HOST`).

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Direct pushes are not permitted. |
| `development` | Integration branch. All feature branches merge here first via pull request. |
| `joshua` | Feature branch for Joshua Mumo |
| `keri` | Feature branch for Kernemi Kidane Akber |
| `shitandi` | Feature branch for Floyce Shitandi Omumani |
| `Lukas` | Feature branch for Lukas Enock |

### Contribution Workflow

1. Check out your personal branch
2. Make your changes and commit with a descriptive message
3. Push to your branch on origin
4. Open a pull request targeting `development`
5. Request a review from at least one other team member
6. After approval and passing checks, merge into `development`
7. Merges from `development` to `main` are done by the lead for release

---

## Integration Points

### 1. DisburseFlow Fork

OpenLedger reads all payment and programme data from a read-only fork of DisburseFlow's database. The backend exposes this data via REST endpoints. The frontend calls:

- `GET /api/programmes/:programmeId` — programme aggregates and paginated payment table
- `GET /api/programmes/:programmeId/export.pdf` — full PDF impact report

### 2. LastMile

Delivery confirmation data — including confirmation timestamps and anchoring transaction hashes — is included in the DisburseFlow fork's data model. OpenLedger surfaces this data alongside payment records where it exists. No direct call is made to LastMile at runtime.

### 3. Stellar Explorer

OpenLedger generates deep links to `stellar.expert` for each settled payment using the transaction hash. These are standard anchor tags — no Stellar SDK or Horizon API calls are made at runtime.

---

## PII and Pseudonymity

OpenLedger displays **zero personally identifiable information**. The following are never rendered anywhere in the portal:

- Beneficiary names
- Phone numbers
- Wallet addresses or proxy wallet identities
- Geographic coordinates or precise location data
- Agent or field worker identities

Only opaque reference IDs assigned by DisburseFlow are shown. These IDs are meaningless outside the system and cannot be used to identify any individual.

---

## Honest About Limits

OpenLedger is transparent about what the blockchain record does and does not prove.

**What the ledger proves:** That funds moved between accounts on the Stellar network, at a specific time, for a specific amount.

**What it does not prove:** That a particular person received cash. Beneficiary accounts are custodial, so the ledger records the movement of value — not the moment a note reaches a hand. Physical delivery is confirmed separately through SAPCONE's field process via LastMile and is shown in the portal where that data exists.

This is the same standard applied to any audited cash transfer programme. It is stated plainly because a transparency portal that overclaims is not transparent.

---

## Contributors

| Name | Role |
|------|------|
| Floyce Shitandi Omumani | Frontend developer |
| Kernemi Kidane Akber | Frontend developer |
| Felix Awere Odhiambo | Backend developer |
| Joshua Mumo | Backend developer |
| Lukas Enock | Frontend developer |

---

## License

MIT License. See `LICENSE` for details.
