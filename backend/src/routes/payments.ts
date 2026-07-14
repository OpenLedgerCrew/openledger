import type { FastifyInstance } from 'fastify';

/**
 * Section 6.2 — the payment detail view: reference ID, amount, status, timestamps, and the
 * transaction hash, plus both legs where the data exists — funds sent (on-chain) and cash
 * confirmed delivered (field process) — each honestly labelled, with the section 4.5
 * disclosure reachable from this view. Zero PII (section 4.3).
 */
export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  app.get('/programmes/:programmeId/payments/:referenceId', async () => {
    throw new Error('Not implemented');
  });
}
