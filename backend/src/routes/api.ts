import { Router } from 'express';
import type { AppInstance } from '../index';
import { aggregateProgramme } from '../services/aggregation';
import { renderProgrammePdf } from '../services/pdf';
import { buildProgrammeReadModel, type ProgrammeReadModel } from '../services/readModel';
import type { RawPaymentRecord } from '../types/payment';

const DEFAULT_PAGE_SIZE = 25;
const GLOBAL_AGGREGATES_CACHE_KEY = 'aggregates:global';

/**
 * Endpoints the React frontend calls (split, `/api`-prefixed): a bare aggregates object, a
 * paginated payments list honoring `page`/`limit`, and a PDF export honoring `include_*` flags.
 * Mounted under both `/` and `/api` (see buildApp) so the frontend's inconsistent prefixing
 * resolves without touching the frontend. Reuses the same read-model + cache as the combined
 * programme view so the two contracts never disagree.
 */
export function apiRoutes(app: AppInstance): Router {
  const router = Router();

  function readModelFor(programmeId: string): Promise<ProgrammeReadModel> {
    const cacheKey = `readmodel:${programmeId}`;
    const cached = app.cache.get(cacheKey) as ProgrammeReadModel | undefined;
    if (cached) return Promise.resolve(cached);
    const { forkClient, explorerBaseUrl } = app.deps;
    return Promise.all([
      forkClient.getPayments(programmeId),
      forkClient.getDeliveries(programmeId),
    ]).then(([payments, deliveries]) => {
      const model = buildProgrammeReadModel(
        payments as unknown as RawPaymentRecord[],
        deliveries,
        explorerBaseUrl,
      );
      app.cache.set(cacheKey, model, 'programme_aggregate');
      return model;
    });
  }

  // Global ProgrammeAggregates summed across every programme (homepage stats bar). Reuses
  // aggregateProgramme unchanged — just fed the union of every programme's payments/deliveries
  // instead of one programme's, so this never drifts from the per-programme math.
  router.get('/aggregates', async (req, res) => {
    const cached = app.cache.get(GLOBAL_AGGREGATES_CACHE_KEY);
    if (cached) {
      res.json(cached);
      return;
    }

    const { forkClient } = app.deps;
    const programmes = await forkClient.getProgrammes();
    const perProgramme = await Promise.all(
      programmes.map((p) =>
        Promise.all([forkClient.getPayments(p.id), forkClient.getDeliveries(p.id)]),
      ),
    );
    const allPayments = perProgramme.flatMap(([payments]) => payments);
    const allDeliveries = perProgramme.flatMap(([, deliveries]) => deliveries);

    const aggregates = aggregateProgramme(allPayments, allDeliveries);
    app.cache.set(GLOBAL_AGGREGATES_CACHE_KEY, aggregates, 'programme_aggregate');
    res.json(aggregates);
  });

  // Bare ProgrammeAggregates (frontend ProgrammeDetailModal reads totals_by_asset,
  // payment_count.{total,settled,pending}, delivery_rate).
  router.get('/programmes/:programmeId/aggregates', async (req, res) => {
    const model = await readModelFor(req.params.programmeId);
    res.json(model.aggregates);
  });

  // Paginated payments. Frontend sends ?page=N&limit=M and reads { payments, total_pages }.
  router.get('/programmes/:programmeId/payments', async (req, res) => {
    const model = await readModelFor(req.params.programmeId);
    const limit = Math.max(1, Number.parseInt(String(req.query.limit ?? ''), 10) || DEFAULT_PAGE_SIZE);
    const totalPayments = model.views.length;
    const totalPages = Math.max(1, Math.ceil(totalPayments / limit));
    const page = Math.min(totalPages, Math.max(1, Number.parseInt(String(req.query.page ?? ''), 10) || 1));
    const start = (page - 1) * limit;

    res.json({
      payments: model.views.slice(start, start + limit),
      page,
      page_size: limit,
      total_pages: totalPages,
      total_payments: totalPayments,
    });
  });

  // PDF export honoring the include_* flags (default all true when absent, e.g. window.open).
  router.get('/programmes/:programmeId/export', async (req, res) => {
    const { programmeId } = req.params;
    const { forkClient, explorerBaseUrl } = app.deps;

    const [programme, payments, deliveries] = await Promise.all([
      forkClient.getProgramme(programmeId),
      forkClient.getPayments(programmeId),
      forkClient.getDeliveries(programmeId),
    ]);
    const { aggregates, views } = buildProgrammeReadModel(
      payments as unknown as RawPaymentRecord[],
      deliveries,
      explorerBaseUrl,
    );

    // A flag is off only when explicitly "false"; anything else (absent, "true") is on.
    const flag = (name: string) => String(req.query[name] ?? 'true') !== 'false';

    const pdf = await renderProgrammePdf({
      programme,
      aggregates,
      payments: views,
      generatedAt: new Date().toISOString(),
      sections: {
        includeStats: flag('include_stats'),
        includePayments: flag('include_payments'),
        includeDelivery: flag('include_delivery'),
      },
    });

    res
      .header('content-type', 'application/pdf')
      .header('content-disposition', `attachment; filename="${programmeId}-impact-report.pdf"`)
      .send(pdf);
  });

  return router;
}
