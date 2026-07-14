import type { FastifyInstance } from 'fastify';
import type { RawPaymentRecord } from '../types/payment';
import { renderProgrammePdf } from '../services/pdf';
import { buildProgrammeReadModel } from '../services/readModel';

/**
 * Section 6.3 — PDF export: programme name, aggregates, the full payment table, the section
 * 4.5 disclosure in full, and a generation timestamp. Zero PII. Rendered server-side from the
 * same template as the web view (section 2.3, D-8: prevents drift).
 */
export async function exportRoutes(app: FastifyInstance): Promise<void> {
  app.get('/programmes/:programmeId/export.pdf', async (request, reply) => {
    const { programmeId } = request.params as { programmeId: string };
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

    return reply
      .header('content-type', 'application/pdf')
      .header('content-disposition', `attachment; filename="${programmeId}-impact-report.pdf"`)
      .send(pdf);
  });
}
