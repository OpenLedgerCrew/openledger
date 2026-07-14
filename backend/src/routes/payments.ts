import type { FastifyInstance } from 'fastify';
import { DISCLOSURE_FULL } from '../constants/disclosure';
import type { RawPaymentRecord } from '../types/payment';
import { buildPaymentDetail, buildPublicPaymentView } from '../services/readModel';

/**
 * Section 6.2 — the payment detail view: reference ID, amount, status, timestamps, and the
 * transaction hash, plus both legs where the data exists — funds sent (on-chain) and cash
 * confirmed delivered (field process) — each honestly labelled, with the section 4.5
 * disclosure reachable from this view. Zero PII (section 4.3).
 */
export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  app.get('/programmes/:programmeId/payments/:referenceId', async (request, reply) => {
    const { programmeId, referenceId } = request.params as {
      programmeId: string;
      referenceId: string;
    };
    const { forkClient, explorerBaseUrl } = app.deps;

    const [payments, deliveries] = await Promise.all([
      forkClient.getPayments(programmeId),
      forkClient.getDeliveries(programmeId),
    ]);

    const raw = (payments as unknown as RawPaymentRecord[]).find(
      (p) => String(p.reference_id) === referenceId,
    );
    if (!raw) {
      return reply.code(404).send({ error: 'payment_not_found' });
    }

    const delivery = deliveries.find((d) => d.reference_id === referenceId) ?? null;
    const view = buildPublicPaymentView(raw, delivery, explorerBaseUrl);
    return buildPaymentDetail(view, DISCLOSURE_FULL);
  });
}
