# Open Items

## OI-1 — Missing section 3.3 (Stellar Integration)

Sections 2.3 and 2.4 both cite "section 3.3.1" as the authority for the "no runtime chain
dependency, deep link only" decision. This document has no section 3.3 — it goes 3.1 → 3.2 → 4.
The decision itself is stated in D-1 (section 5.1), so the codebase proceeds on that basis, but
the evidence trail is broken. Someone needs to either restore section 3.3 or repoint the citations
in 2.3 / 2.4 at wherever the Horizon/RPC reasoning actually lives now.

Related dangling citations found while scaffolding, likely artifacts of the same renumbering that
removed section 3.3: the section 2.3 "Read model store" row and assumption A-6 both cite
"section 6.5" (the caching strategy is actually section 5.5); D-6 cites "section 5.2.1"; D-8
cites "section 5.3.1"; A-5 cites "section 3.3.3". None of these sections exist.

## OI-2 — Auth mechanism unspecified (sections 3.1.3, 3.2.3)

Both integration points (SDP fork, LastMile) leave the server-to-server auth mechanism as "an
open implementation detail to confirm during the gap analysis." Corresponding tests are written
as `it.skip(...)` with the doc citation so they surface in every test run until this is resolved
(`backend/test/integration/sdpForkClient.test.ts`, `backend/test/integration/lastMileClient.test.ts`).
Do not implement auth against a guessed mechanism — wait for the gap analysis per section 3.1.2's
own instruction that "the exact endpoint and event definitions are documented from the deployed
instance" during that process.

## OI-3 — Open Questions carried over from section 5.3

Copied verbatim from the source document so they are visible outside the PRD too. OQ-4 in
particular (wallet-address exposure via the explorer page, in conflict-affected areas —
SAPCONE's call, not the build team's) should not be closed by an engineering decision.

| Ref | Question | Owner | Blocks | Needed by |
| :---- | :---- | :---- | :---- | :---- |
| OQ-1 | What is the fork's read contract? Exact endpoints, field names, and auth. Section 5 is provisional until this lands | DisburseFlow and the gap analysis (D-4) | Section 5 and all implementation | Before build starts |
| OQ-2 | What is LastMile's confirmation contract? | LastMile | O-3 | Before build |
| OQ-3 | What is the next testnet reset date? | This team's runbook step 14 | Demo viability | This week |
| OQ-4 | The explorer transaction page exposes wallet addresses. Does SAPCONE accept that, knowingly, for beneficiaries in conflict-affected areas? | SAPCONE. This is their call, not ours | Section 4.4 | Before demo |
| OQ-5 | Rotate reference IDs per program, or accept cross-program correlation? Raised by us, decided by LastMile, since reference IDs are generated in their registry | LastMile, with SAPCONE | Section 4.4 | Before build |
| OQ-6 | Is any program sensitive enough that a public, no-login link is itself the risk? | SAPCONE | O-5 | Before demo |
| OQ-7 | Delivery-rate denominator. Confirm section 6.4 with SAPCONE | SAPCONE | O-1 | Before demo |

From the source document, section 5.3: "OQ-4 is the one to escalate. It is not a technical
question, and we must not answer it ourselves. We can and should present the trade-off clearly:
independent verification requires a public ledger, and a public ledger exposes addresses, but the
decision belongs to the organization that carries the consequences for the people involved."
