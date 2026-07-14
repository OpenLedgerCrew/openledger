import { buildApp } from './index';
import { createSdpForkClient, type SdpForkClient } from './services/sdpForkClient';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const SDP_FORK_BASE_URL = process.env.SDP_FORK_BASE_URL || 'http://localhost:4000';
const EXPLORER_BASE_URL =
  process.env.EXPLORER_BASE_URL || 'https://stellar.expert/explorer/testnet';

/**
 * Section 3.1: createSdpForkClient is a stub that throws until the fork's real read API is
 * implemented (see docs/OPEN_ITEMS.md OI-2). That's deliberate at the test layer, but the
 * server itself must still bind a port on a red-state skeleton — so a construction failure
 * here falls back to an inline client whose methods reject per-call instead of crashing boot.
 * Route handlers then surface "Not implemented" as a 500 per request, same as today.
 */
function buildForkClient(): SdpForkClient {
  try {
    return createSdpForkClient({ baseUrl: SDP_FORK_BASE_URL });
  } catch {
    const notImplemented = async (): Promise<never> => {
      throw new Error('Not implemented');
    };
    return {
      getProgramme: notImplemented,
      getPayments: notImplemented,
      getDeliveryConfirmations: notImplemented,
    };
  }
}

const app = buildApp({
  forkClient: buildForkClient(),
  explorerBaseUrl: EXPLORER_BASE_URL,
});

app
  .listen({ port: PORT, host: HOST })
  .then(() => app.log.info(`OpenLedger backend listening on ${HOST}:${PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
