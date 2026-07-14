# Scaffolding Decisions

Tooling and structure choices the source document leaves open, recorded in the section 5.1
pattern (decision + rationale + evidence) so none of them slips in silently.

| Ref | Decision | Rationale | Evidence |
| ----- | ----- | ----- | ----- |
| SD-1 | Backend framework: Fastify | Doc section 2.3 allows "Fastify or Express"; scaffold spec says pick Fastify unless the team objects | Section 2.3 |
| SD-2 | Test runner: Vitest in both projects | Doc implies no runner; one runner across both TS projects, native TS/ESM, fake timers for the section 5.5 TTL tests, fetch spies for the zero-network assertions | Sections 2.3, 5.5 |
| SD-3 | Frontend build: Vite + React + TypeScript; tests via jsdom + Testing Library + user-event + MSW | Standard pairing with Vitest; doc mandates React + TypeScript | Section 2.3 |
| SD-4 | Backend HTTP tests use `fastify.inject()` against the real app; the SDP fork boundary is the only thing faked (in-memory `SdpForkClient`) | Test rule 3: never mock the thing under test; the fork is external | Sections 3.1, 6.1–6.4 |
| SD-5 | Puppeteer is NOT installed yet | The export stub throws `Not implemented` before any render; defer the heavy install to the implementation pass. `pdf-parse` is installed now because the walkthrough 3 tests assert on extracted PDF text | Sections 2.3, 6.3 |
| SD-6 | Added `backend/src/services/explorerUrl.ts` beyond the specced layout | D-6 says `explorer_url` is computed server-side; the concatenation-only builder needs a home and does not belong in the cache | Section 5.1 (D-1, D-6), A-7 |
| SD-7 | Added `constants/disclosure.ts` and `constants/labels.ts` in both projects | Single implementation source for the section 4.5 copy and the walkthrough labels. Tests deliberately do NOT import them — they embed the literal doc text, per test rule 4 | Sections 4.5, 6.1 |
| SD-8 | The label "Not yet settled." carries its trailing period | Both the doc (6.1 item 5) and the scaffold spec render the period inside the quotes and demand the exact label. "Not applicable" / "Awaiting confirmation" drop trailing punctuation, which is sentence punctuation in the doc | Section 6.1 |
| SD-9 | `backend/test/acceptance/walkthrough1-programme-view.test.ts` has 6 tests using the doc's numbering | Doc walkthrough 6.1 has 6 numbered lines; the scaffold spec listed 5, having moved item 3 (disclosure visible, not buried) to the frontend banner test. The backend keeps all 6 so every doc line traces to a test; the frontend banner test also covers item 3 as specced | Section 6.1 |
| SD-10 | No ORM, no Postgres client anywhere | Doc: in-process cache first, read via the fork's API; the 3.1.2 test statically asserts no DB client import | Sections 2.3, 3.1.2 (D-2) |
| SD-11 | Added runnable entry points beyond the specced layout: `backend/src/server.ts` (run via `tsx`, `npm run dev`/`start`) and `frontend/index.html` + `frontend/src/main.tsx` (served via `vite`, `npm run dev`) | A red-state test suite is not the same as a runnable skeleton — `npm run dev` must boot a server and a page even though nothing is implemented. `createSdpForkClient` is deliberately built to throw synchronously so its "pure consumer" unit test stays red (test rule keeping structural assertions from passing trivially); `server.ts` catches that and falls back to an inline client whose methods reject per-call, so the HTTP server still binds and only individual requests 500 | Sections 2.3, 3.1 |
