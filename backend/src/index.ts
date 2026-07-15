import cors from 'cors';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import { apiRoutes } from './routes/api';
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

/** An Express app plus the request-independent deps every route needs (deps, cache). */
export interface AppInstance extends Express {
  deps: AppDeps;
  /** In-process read-model cache (section 5.5). One per app instance. */
  cache: ReadModelCache;
}

export interface BuildAppOptions {
  /** Log each request to the console. Off by default so the test runner output stays clean. */
  logger?: boolean;
}

export function buildApp(deps: AppDeps, options: BuildAppOptions = {}): AppInstance {
  const app = express() as AppInstance;
  app.deps = deps;
  app.cache = new ReadModelCache();

  if (options.logger) {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`${req.method} ${req.originalUrl}`);
      next();
    });
  }

  // The portal is a public, read-only, no-login surface (O-5), so the browser client is served
  // cross-origin during development (Vite on :5173). Reads only; no credentials.
  app.use(cors({ origin: true, methods: ['GET'] }));

  // Mounted under both `/` and `/api` — the frontend calls `/api/...`, existing tests/tools use
  // the no-prefix paths, and both must resolve to the same read model (see docs/FRONTEND_BACKEND_SYNC.md).
  const routers = [programmeRoutes(app), paymentRoutes(app), exportRoutes(app), apiRoutes(app)];
  for (const router of routers) {
    app.use(router);
    app.use('/api', router);
  }

  return app;
}
