import type { FastifyInstance } from 'fastify';

/**
 * Section 6.3 — PDF export: programme name, aggregates, the full payment table, the section
 * 4.5 disclosure in full, and a generation timestamp. Zero PII. Rendered server-side from the
 * same template as the web view (section 2.3, D-8: prevents drift).
 */
export async function exportRoutes(app: FastifyInstance): Promise<void> {
  app.get('/programmes/:programmeId/export.pdf', async () => {
    throw new Error('Not implemented');
  });
}
