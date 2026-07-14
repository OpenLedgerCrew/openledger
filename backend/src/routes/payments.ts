import { Router } from 'express';
import type { AppInstance } from '../index';
import { DISCLOSURE_FULL } from '../constants/disclosure';
import { buildPaymentDetail, buildPublicPaymentView } from '../services/readModel';
import type { RawPaymentRecord } from '../types/payment';

/**
 * Section 6.2 — the payment detail view: reference ID, amount, status, timestamps, and the
 * transaction hash, plus both legs where the data exists — funds sent (on-chain) and cash
 * confirmed delivered (field process) — each honestly labelled, with the section 4.5
 * disclosure reachable from this view. Zero PII (section 4.3).
 */
export function paymentRoutes(app: AppInstance): Router {
  const router = Router();

  router.get('/programmes/:programmeId/payments/:referenceId', async (req, res) => {
    const { programmeId, referenceId } = req.params;
    const { forkClient, explorerBaseUrl } = app.deps;

    const [payments, deliveries] = await Promise.all([
      forkClient.getPayments(programmeId),
      forkClient.getDeliveries(programmeId),
    ]);

    const raw = (payments as unknown as RawPaymentRecord[]).find(
      (p) => String(p.reference_id) === referenceId,
    );
    if (!raw) {
      res.status(404).json({ error: 'payment_not_found' });
      return;
    }

    const delivery = deliveries.find((d) => d.reference_id === referenceId) ?? null;
    const view = buildPublicPaymentView(raw, delivery, explorerBaseUrl);
    res.json(buildPaymentDetail(view, DISCLOSURE_FULL));
  });

  return router;
}
