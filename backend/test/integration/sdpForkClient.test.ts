import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createSdpForkClient } from '../../src/services/sdpForkClient';

// Doc section 3.1 — SDP fork integration.

const clientSource = readFileSync(
  new URL('../../src/services/sdpForkClient.ts', import.meta.url),
  'utf8',
);

describe('sdpForkClient (doc section 3.1)', () => {
  // 3.1.2 — "Read-only access to the fork's payment and delivery data" via the fork's API
  // (D-2: "Read via the fork's API, not its database"). Static check: no database client is
  // imported anywhere in the module.
  it('3.1.2 — the client only calls the SDP fork API: no database client import', async () => {
    expect(clientSource).not.toMatch(
      /['"](pg|pg-\w+|@prisma\/client|prisma|knex|typeorm|sequelize|mysql2?|sqlite3?|postgres)['"]/,
    );
    // Exercise the read path so this test stays red until the API-based client exists.
    const client = createSdpForkClient({ baseUrl: 'http://fork.internal.test', apiKey: 'SDP_test-key' });
    await expect(client.getPayments('prog-1')).resolves.toBeInstanceOf(Array);
  });

  // 3.1.2 — "OpenLedger is explicitly described as 'a pure consumer' of the fork's data — it
  // does not write registrations or confirmations, unlike LastMile." Read-only surface only.
  it('3.1.2 — pure consumer: the client exposes no write/POST/PUT/PATCH/DELETE method', () => {
    const client = createSdpForkClient({ baseUrl: 'http://fork.internal.test', apiKey: 'SDP_test-key' });
    const writers = Object.keys(client).filter((name) =>
      /post|put|patch|delete|write|create|update|register|confirm/i.test(name),
    );
    expect(writers).toEqual([]);
  });

  // 3.1.3 — auth mechanism resolved (OI-2): the deployed fork issues scoped API keys, sent as
  // a bearer token. Verified against a local stub server rather than the real fork.
  it('3.1.3 — sends the configured API key as an Authorization bearer token (OI-2)', async () => {
    let receivedAuth: string | undefined;
    const server = createServer((req, res) => {
      receivedAuth = req.headers.authorization;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ pagination: { pages: 0, total: 0 }, data: [] }));
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    const client = createSdpForkClient({
      baseUrl: `http://127.0.0.1:${port}`,
      apiKey: 'SDP_test-key',
    });
    await client.getPayments('prog-1');
    await new Promise<void>((resolve) => server.close(() => resolve()));

    expect(receivedAuth).toBe('Bearer SDP_test-key');
  });

  // getProgrammes() lists all disbursements via the fork's GET /disbursements, mapped to the
  // thin { id, name } Programme shape used everywhere else in this codebase.
  it('getProgrammes — maps GET /disbursements into Programme[]', async () => {
    const server = createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          pagination: { pages: 1, total: 2 },
          data: [
            { id: 'd1', name: 'Turkana North MPCA — Cycle 1', status: 'STARTED' },
            { id: 'd2', name: 'Kakuma Cash Transfer — Cycle 2', status: 'DRAFT' },
          ],
        }),
      );
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    const client = createSdpForkClient({
      baseUrl: `http://127.0.0.1:${port}`,
      apiKey: 'SDP_test-key',
    });
    const programmes = await client.getProgrammes();
    await new Promise<void>((resolve) => server.close(() => resolve()));

    expect(programmes).toEqual([
      { id: 'd1', name: 'Turkana North MPCA — Cycle 1', status: 'STARTED' },
      { id: 'd2', name: 'Kakuma Cash Transfer — Cycle 2', status: 'DRAFT' },
    ]);
  });
});
