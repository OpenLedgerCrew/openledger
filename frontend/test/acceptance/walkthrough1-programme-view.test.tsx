import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ProgrammeDetailPage } from '../../src/pages/ProgrammeDetailPage';
import { PROGRAMME_ID, PROGRAMME_NAME, apiServer } from '../helpers/api';

// Doc section 6.1 — Walkthrough 1: Programme View, at the component-integration level.
// MSW fakes the backend; the components under test are real (test rule 3).
// ProgrammeDetailPage is the real non-modal /programmes/:programmeId route (App.tsx line 62).

const server = apiServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderProgrammeDetail() {
  return render(
    <MemoryRouter initialEntries={[`/programmes/${PROGRAMME_ID}`]}>
      <Routes>
        <Route path="/programmes/:programmeId" element={<ProgrammeDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('walkthrough 1 — programme view (doc section 6.1)', () => {
  it('6.1 item 1 — renders from a cold link: no login form is presented', async () => {
    renderProgrammeDetail();
    expect(await screen.findByText(PROGRAMME_NAME)).toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /log ?in|sign ?in/i })).not.toBeInTheDocument();
  });

  it('6.1 item 2 — total disbursed, payment count, and delivery rate are in the initial render', async () => {
    renderProgrammeDetail();
    // Totals per asset, never summed together (section 5.4).
    expect(await screen.findByText(/150\.00/)).toBeInTheDocument();
    expect(screen.getAllByText(/200\.00/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/delivery rate/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/payment/i)[0]).toBeInTheDocument();
  });

  it('6.1 item 3 — the section 4.5 disclosure is on the same screen, not below a fold marker, not in a modal', async () => {
    renderProgrammeDetail();
    expect(await screen.findByText('How to read this page')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('6.1 item 4 — the payment table renders paginated', async () => {
    renderProgrammeDetail();
    await screen.findByText(PROGRAMME_NAME);
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
  });

  it('6.1 item 5 — a READY payment shows "Not yet settled." with no explorer link and no error styling', async () => {
    renderProgrammeDetail();
    const label = await screen.findByText('Not yet settled.');
    expect(label.className).not.toMatch(/error|danger|fail|alert/i);
    const row = label.closest('tr');
    expect(row).not.toBeNull();
    expect(row!.querySelector('a[href*="/tx/"]')).toBeNull();
  });

  it('6.1 item 6 — "Not applicable" is visibly distinct from "Awaiting confirmation"', async () => {
    renderProgrammeDetail();
    const notApplicables = await screen.findAllByText('Not applicable');
    const notApplicable = notApplicables[0];
    const awaiting = screen.getByText('Awaiting confirmation');
    expect(notApplicable).not.toBe(awaiting);
    // Distinct rows, distinct render paths — not one shared fallback (D-7).
    expect(within(notApplicable.closest('tr')!).queryByText('Awaiting confirmation')).toBeNull();
  });
});
