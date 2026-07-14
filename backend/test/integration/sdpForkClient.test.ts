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
    const client = createSdpForkClient({ baseUrl: 'http://fork.internal.test' });
    await expect(client.getPayments('prog-1')).resolves.toBeInstanceOf(Array);
  });

  // 3.1.2 — "OpenLedger is explicitly described as 'a pure consumer' of the fork's data — it
  // does not write registrations or confirmations, unlike LastMile." Read-only surface only.
  it('3.1.2 — pure consumer: the client exposes no write/POST/PUT/PATCH/DELETE method', () => {
    const client = createSdpForkClient({ baseUrl: 'http://fork.internal.test' });
    const writers = Object.keys(client).filter((name) =>
      /post|put|patch|delete|write|create|update|register|confirm/i.test(name),
    );
    expect(writers).toEqual([]);
  });

  // 3.1.3 — "Server-to-fork authentication is not addressed in the master PRD and should be
  // treated as an implementation detail to confirm during the gap analysis." Kept visible as
  // a skip, not deleted — see OI-2 in docs/OPEN_ITEMS.md.
  it.skip('3.1.3 — auth mechanism — pending gap analysis, doc section 3.1.3 (OI-2)', () => {});
});
