import type { FastifyInstance } from 'fastify';
import { DISCLOSURE_FULL } from '../constants/disclosure';
import type { RawPaymentRecord } from '../types/payment';
import { buildProgrammeReadModel, type ProgrammeReadModel } from '../services/readModel';

const PAGE_SIZE = 25;

/**
 * Section 6.1 — the public programme view. Serves the aggregates (section 5.4), the section
 * 4.5 disclosure, and the paginated payment table in one response, with no login (O-5:
 * "works from a cold link, with no login and no training").
 */
export async function programmeRoutes(app: FastifyInstance): Promise<void> {
  app.get('/programmes/:programmeId', async (request) => {
    const { programmeId } = request.params as { programmeId: string };
    const { page: pageParam } = request.query as { page?: string };
    const { forkClient, explorerBaseUrl } = app.deps;

    const cacheKey = `readmodel:${programmeId}`;
    let readModel = app.cache.get(cacheKey) as ProgrammeReadModel | undefined;
    if (!readModel) {
      const [payments, deliveries] = await Promise.all([
        forkClient.getPayments(programmeId),
        forkClient.getDeliveries(programmeId),
      ]);
      readModel = buildProgrammeReadModel(
        payments as unknown as RawPaymentRecord[],
        deliveries,
        explorerBaseUrl,
      );
      // 60s TTL: cheap to recompute and slight staleness is harmless (section 5.5).
      app.cache.set(cacheKey, readModel, 'programme_aggregate');
    }

    const totalItems = readModel.views.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const page = Math.min(
      totalPages,
      Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1),
    );
    const start = (page - 1) * PAGE_SIZE;

    return {
      programme_id: programmeId,
      aggregates: readModel.aggregates,
      disclosure: DISCLOSURE_FULL,
      payments: readModel.views.slice(start, start + PAGE_SIZE),
      pagination: {
        page,
        page_size: PAGE_SIZE,
        total_items: totalItems,
        total_pages: totalPages,
      },
    };
  });
}
