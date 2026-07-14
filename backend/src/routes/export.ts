import { Router } from 'express';
import type { AppInstance } from '../index';
import { renderProgrammePdf } from '../services/pdf';
import { buildProgrammeReadModel } from '../services/readModel';
import type { RawPaymentRecord } from '../types/payment';

/**
 * Section 6.3 — PDF export: programme name, aggregates, the full payment table, the section
 * 4.5 disclosure in full, and a generation timestamp. Zero PII. Rendered server-side from the
 * same template as the web view (section 2.3, D-8: prevents drift).
 */
export function exportRoutes(app: AppInstance): Router {
  const router = Router();

  router.get('/programmes/:programmeId/export.pdf', async (req, res) => {
    const { programmeId } = req.params;
    const { forkClient, explorerBaseUrl } = app.deps;

    const [programme, payments, deliveries] = await Promise.all([
      forkClient.getProgramme(programmeId),
      forkClient.getPayments(programmeId),
      forkClient.getDeliveries(programmeId),
    ]);

    // The export shows the FULL table (all payments, unpaginated), unlike the paginated web view.
    const { aggregates, views } = buildProgrammeReadModel(
      payments as unknown as RawPaymentRecord[],
      deliveries,
      explorerBaseUrl,
    );

    const pdf = await renderProgrammePdf({
      programme,
      aggregates,
      payments: views,
      generatedAt: new Date().toISOString(),
    });

    res
      .header('content-type', 'application/pdf')
      .header('content-disposition', `attachment; filename="${programmeId}-impact-report.pdf"`)
      .send(pdf);
  });

  return router;
}
