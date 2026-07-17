import { Router } from 'express';
import type { AppInstance } from '../index';
import { DISCLOSURE_FULL } from '../constants/disclosure';
import { buildProgrammeReadModel, type ProgrammeReadModel } from '../services/readModel';
import type { RawPaymentRecord } from '../types/payment';

const PAGE_SIZE = 25;

/** The cached per-programme view: the read model plus the programme's own name/status, so a
 * direct link to /programmes/:id (no list-page navigation state to draw from) can still show
 * a real name and status badge instead of falling back to the bare id. */
interface CachedProgrammeView extends ProgrammeReadModel {
  name: string;
  status: string;
}

/**
 * Section 6.1 — the public programme view. Serves the aggregates (section 5.4), the section
 * 4.5 disclosure, and the paginated payment table in one response, with no login (O-5:
 * "works from a cold link, with no login and no training").
 */
export function programmeRoutes(app: AppInstance): Router {
  const router = Router();

  // Thin listing — id + name only, same shape as the Programme type. Callers needing
  // aggregates/payments for a given programme still go through GET /programmes/:programmeId.
  router.get('/programmes', async (req, res) => {
    const { forkClient } = app.deps;
    const programmes = await forkClient.getProgrammes();
    res.json({ programmes });
  });

  router.get('/programmes/:programmeId', async (req, res) => {
    const { programmeId } = req.params;
    const pageParam = req.query.page as string | undefined;
    const { forkClient, explorerBaseUrl } = app.deps;

    const cacheKey = `readmodel:${programmeId}`;
    let readModel = app.cache.get(cacheKey) as CachedProgrammeView | undefined;
    if (!readModel) {
      const [programme, payments, deliveries] = await Promise.all([
        forkClient.getProgramme(programmeId),
        forkClient.getPayments(programmeId),
        forkClient.getDeliveries(programmeId),
      ]);
      const built = buildProgrammeReadModel(
        payments as unknown as RawPaymentRecord[],
        deliveries,
        explorerBaseUrl,
      );
      readModel = { ...built, name: programme.name, status: programme.status };
      // 60s TTL: cheap to recompute and slight staleness is harmless (section 5.5).
      app.cache.set(cacheKey, readModel, 'programme_aggregate');
    }

    const totalItems = readModel.views.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const page = Math.min(totalPages, Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1));
    const start = (page - 1) * PAGE_SIZE;

    res.json({
      programme_id: programmeId,
      name: readModel.name,
      status: readModel.status,
      aggregates: readModel.aggregates,
      disclosure: DISCLOSURE_FULL,
      payments: readModel.views.slice(start, start + PAGE_SIZE),
      pagination: {
        page,
        page_size: PAGE_SIZE,
        total_items: totalItems,
        total_pages: totalPages,
      },
    });
  });

  return router;
}
