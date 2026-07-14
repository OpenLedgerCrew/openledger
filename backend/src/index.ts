import Fastify, { type FastifyInstance } from 'fastify';
import { exportRoutes } from './routes/export';
import { paymentRoutes } from './routes/payments';
import { programmeRoutes } from './routes/programmes';
import type { SdpForkClient } from './services/sdpForkClient';

export interface AppDeps {
  forkClient: SdpForkClient;
  /** D-6: explorer_url is computed server-side so testnet links cannot leak into mainnet reports. */
  explorerBaseUrl: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    deps: AppDeps;
  }
}

export function buildApp(deps: AppDeps): FastifyInstance {
  const app = Fastify({ logger: true });
  app.decorate('deps', deps);
  app.register(programmeRoutes);
  app.register(paymentRoutes);
  app.register(exportRoutes);
  return app;
}
