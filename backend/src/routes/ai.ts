import { Router } from 'express';
import type { AppInstance } from '../index';
import { answerChatQuestion, generateTransparencySummary } from '../services/aiClient';
import { buildProgrammeReadModel } from '../services/readModel';
import type { RawPaymentRecord } from '../types/payment';

/**
 * Optional "special features" layer on top of the read-only core: an AI-generated plain-
 * language transparency summary per programme, and a simple FAQ chat assistant. Both call
 * OpenRouter when OPENROUTER_API_KEY is set, and fall back to a deterministic, offline answer
 * otherwise (see aiClient.ts) — the endpoints never fail the request for a missing key.
 */
export function aiRoutes(app: AppInstance): Router {
  const router = Router();

  router.get('/programmes/:programmeId/ai-summary', async (req, res) => {
    const { programmeId } = req.params;
    const { forkClient, explorerBaseUrl } = app.deps;

    const cacheKey = `ai-summary:${programmeId}`;
    const cached = app.cache.get(cacheKey) as { summary: string; source: 'ai' | 'fallback' } | undefined;
    if (cached) {
      res.json({ ...cached, generated_at: new Date().toISOString() });
      return;
    }

    const [programme, payments, deliveries] = await Promise.all([
      forkClient.getProgramme(programmeId),
      forkClient.getPayments(programmeId),
      forkClient.getDeliveries(programmeId),
    ]);
    const { aggregates } = buildProgrammeReadModel(
      payments as unknown as RawPaymentRecord[],
      deliveries,
      explorerBaseUrl,
    );

    const result = await generateTransparencySummary(programme, aggregates);
    // Cache like any other aggregate view (60s) so repeated page loads don't re-call the API.
    app.cache.set(cacheKey, result, 'programme_aggregate');

    res.json({ ...result, generated_at: new Date().toISOString() });
  });

  router.post('/chat', async (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }
    if (message.length > 2000) {
      res.status(400).json({ error: 'message is too long' });
      return;
    }

    const result = await answerChatQuestion(message);
    res.json(result);
  });

  return router;
}
