import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HttpResponse, http } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ProgrammeView } from '../../src/pages/ProgrammeView';
import { ProgrammeDetailPage } from '../../src/pages/ProgrammeDetailPage';
import { FALLBACK_SNAPSHOT } from '../../src/api/fixtures/sdp-fallback-snapshot';
import { apiServer, PROGRAMME_ID, PROGRAMME_NAME } from '../helpers/api';

// Regression coverage for the real GET /programmes wiring: previously ProgrammeView rendered
// hardcoded fake programmes and passed a slugified title as the "id" into the detail view, which
// then 404'd against the real backend and silently fell back to mock data. These tests prove the
// real id from the list fetch is the one used everywhere downstream, that a failed detail fetch
// for an id with no captured snapshot data shows "not found" (not hidden mock data), and that the
// client-side fallback snapshot actually renders when the backend is unreachable.

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/programmes" element={<ProgrammeView />} />
        <Route path="/programmes/:programmeId" element={<ProgrammeDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const server = apiServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('programme list -> detail integration', () => {
  it('fetches the real programme list and links to the detail page with the same real id', async () => {
    renderAt('/programmes');

    // The regression this protects against: the list used to pass a slugified title as the "id"
    // into the detail view, which then 404'd against the real backend. This proves the link
    // target is the real id GET /programmes returned, not a derived slug.
    const viewLink = await screen.findByRole('link', { name: /view/i });
    expect(viewLink).toHaveAttribute('href', `/programmes/${PROGRAMME_ID}`);
  });

  it('the detail page renders real data for that same id', async () => {
    renderAt(`/programmes/${PROGRAMME_ID}`);

    // Fetches /api/programmes/prog-1?page=1 — the exact id from the test above.
    expect(await screen.findByText(PROGRAMME_NAME)).toBeInTheDocument();
    expect(await screen.findByText('REF-001')).toBeInTheDocument();
  });

  it('shows "not found" (not hidden mock data) when the detail fetch fails for an id with no fallback snapshot', async () => {
    server.use(
      http.get('*/programmes/:programmeId', () => new HttpResponse(null, { status: 500 })),
    );

    renderAt(`/programmes/${PROGRAMME_ID}`);

    // prog-1 isn't a real captured disbursement id, so the client-side fallback snapshot has
    // nothing for it — this must resolve to "not found", never fabricated mock payment data.
    expect(await screen.findByText(/programme not found/i)).toBeInTheDocument();
    expect(screen.queryByText('PAY-001-TLP')).not.toBeInTheDocument();
  });

  it('renders the captured fallback snapshot when the backend is unreachable for a real snapshot id', async () => {
    server.use(
      http.get('*/programmes/:programmeId', () => HttpResponse.error()),
    );
    const [snapshotId, snapshotDetail] = Object.entries(FALLBACK_SNAPSHOT.programmeDetails)[0];

    renderAt(`/programmes/${snapshotId}`);

    expect(await screen.findByText(snapshotDetail.name)).toBeInTheDocument();
    expect(screen.getByText(snapshotDetail.payments[0].reference_id)).toBeInTheDocument();
  });
});
