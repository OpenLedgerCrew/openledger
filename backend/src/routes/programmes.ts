import type { FastifyInstance } from 'fastify';

/**
 * Section 6.1 — the public programme view. Serves the aggregates (section 5.4), the section
 * 4.5 disclosure, and the paginated payment table in one response, with no login (O-5:
 * "works from a cold link, with no login and no training").
 */
export async function programmeRoutes(app: FastifyInstance): Promise<void> {
  app.get('/programmes/:programmeId', async () => {
    throw new Error('Not implemented');
  });
}
