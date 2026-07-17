import express from 'express';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApp } from './index';
import { createSdpForkClient, type SdpForkClient } from './services/sdpForkClient';
import { createSeedForkClient } from './services/seedForkClient';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const SDP_FORK_BASE_URL = process.env.SDP_FORK_BASE_URL;
const SDP_API_KEY = process.env.SDP_API_KEY;
const EXPLORER_BASE_URL =
  process.env.EXPLORER_BASE_URL || 'https://stellar.expert/explorer/testnet';

/**
 * The real SDP fork read API (OQ-1) and the LastMile confirmation contract (OQ-2) do not exist
 * yet — those are the two upstream features this backend depends on (docs/OPEN_ITEMS.md). Until
 * they land, the running server serves a baked-in seed so `npm start` still outputs realistic,
 * frontend-consumable data. Set SDP_FORK_BASE_URL to point at a live fork once it exists; the
 * HTTP client degrades gracefully (empty data) if that fork is unreachable.
 */
function buildForkClient(): SdpForkClient {
  if (SDP_FORK_BASE_URL) {
    if (!SDP_API_KEY) {
      throw new Error('SDP_API_KEY is required when SDP_FORK_BASE_URL is set');
    }
    return createSdpForkClient({ baseUrl: SDP_FORK_BASE_URL, apiKey: SDP_API_KEY });
  }
  return createSeedForkClient();
}

const app = buildApp(
  {
    forkClient: buildForkClient(),
    explorerBaseUrl: EXPLORER_BASE_URL,
  },
  { logger: true },
);

// Production single-origin serving: once the frontend is built (`npm run build` in frontend/),
// serve it from this same process so the portal and the API share one origin. Registered after
// buildApp's API routers, so /api and no-prefix API paths still win over the SPA fallback.
const frontendDist = join(dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/(.*)/, (req, res, next) => {
    // /programmes/:id and /programmes/:id/... are real API routes (no frontend route matches
    // them, since the client only ever mounts the bare /programmes list page) — let them through.
    if (req.path.startsWith('/api') || /^\/programmes\/.+/.test(req.path)) return next();
    res.sendFile(join(frontendDist, 'index.html'));
  });
  console.log(`Serving built frontend from ${frontendDist}`);
}

const server = app.listen(PORT, HOST, () => {
  const source = SDP_FORK_BASE_URL ? `SDP fork at ${SDP_FORK_BASE_URL}` : 'in-memory seed data';
  console.log(`OpenLedger backend listening on ${HOST}:${PORT} (data source: ${source})`);
});

server.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
