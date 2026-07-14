import { buildApp } from './index';
import { createSdpForkClient, type SdpForkClient } from './services/sdpForkClient';
import { createSeedForkClient } from './services/seedForkClient';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const SDP_FORK_BASE_URL = process.env.SDP_FORK_BASE_URL;
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
    return createSdpForkClient({ baseUrl: SDP_FORK_BASE_URL });
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

const server = app.listen(PORT, HOST, () => {
  const source = SDP_FORK_BASE_URL ? `SDP fork at ${SDP_FORK_BASE_URL}` : 'in-memory seed data';
  console.log(`OpenLedger backend listening on ${HOST}:${PORT} (data source: ${source})`);
});

server.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
