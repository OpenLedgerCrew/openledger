import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import { exportRoutes } from './routes/export';
import { paymentRoutes } from './routes/payments';
import { programmeRoutes } from './routes/programmes';
import { ReadModelCache } from './services/cache';
import type { SdpForkClient } from './services/sdpForkClient';

export interface AppDeps {
  forkClient: SdpForkClient;
  /** D-6: explorer_url is computed server-side so testnet links cannot leak into mainnet reports. */
  explorerBaseUrl: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    deps: AppDeps;
    /** In-process read-model cache (section 5.5). One per app instance. */
    cache: ReadModelCache;
  }
}

export interface BuildAppOptions {
  /** Enable the Fastify logger. Off by default so the test runner output stays clean. */
  logger?: boolean;
}

export function buildApp(deps: AppDeps, options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  app.decorate('deps', deps);
  app.decorate('cache', new ReadModelCache());
  // The portal is a public, read-only, no-login surface (O-5), so the browser client is served
  // cross-origin during development (Vite on :5173). Reads only; no credentials.
  app.register(cors, { origin: true, methods: ['GET'] });
  app.register(programmeRoutes);
  app.register(paymentRoutes);
  app.register(exportRoutes);
  return app;
}
