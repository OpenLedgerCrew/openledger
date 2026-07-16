import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HttpResponse, http } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ProgrammeView } from '../../src/pages/ProgrammeView';
import { apiServer, PROGRAMME_NAME } from '../helpers/api';

// Regression coverage for the real GET /programmes wiring: previously ProgrammeView rendered
// hardcoded fake programmes and passed a slugified title as the "id" into ProgrammeDetailModal,
// which then 404'd against the real backend and silently fell back to mock data. These tests
// prove the real id from the list fetch is the one used everywhere downstream, and that a
// failed detail fetch now surfaces an error instead of hidden mock data.

const server = apiServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('programme list -> detail integration', () => {
  it('fetches the real programme list and opens the detail modal with the same real id', async () => {
    render(
      <MemoryRouter>
        <ProgrammeView />
      </MemoryRouter>,
    );

    const viewButton = await screen.findByRole('button', { name: /view programme/i });
    await userEvent.click(viewButton);

    // The modal fetches /api/programmes/prog-1?page=1 — the real id returned by GET /programmes,
    // not a slugified title. If a fake id were used, this data would never appear (404 -> error).
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(PROGRAMME_NAME)).toBeInTheDocument();
    expect(await within(dialog).findByText(/150\.00/)).toBeInTheDocument();
  });

  it('shows a real error state (not hidden mock data) when the detail fetch fails', async () => {
    server.use(
      http.get('*/programmes/:programmeId', () => new HttpResponse(null, { status: 500 })),
    );

    render(
      <MemoryRouter>
        <ProgrammeView />
      </MemoryRouter>,
    );

    const viewButton = await screen.findByRole('button', { name: /view programme/i });
    await userEvent.click(viewButton);

    expect(await screen.findByText(/failed to load programme/i)).toBeInTheDocument();
    // The mock fallback used to substitute this fabricated reference id — must never appear.
    expect(screen.queryByText('PAY-001-TLP')).not.toBeInTheDocument();
  });
});
