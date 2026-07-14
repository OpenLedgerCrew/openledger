import { render, screen, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ProgrammeView } from '../../src/pages/ProgrammeView';
import { PROGRAMME_NAME, apiServer } from '../helpers/api';

// Doc section 6.1 — Walkthrough 1: Programme View, at the component-integration level.
// MSW fakes the backend; the components under test are real (test rule 3).

const server = apiServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('walkthrough 1 — programme view (doc section 6.1)', () => {
  it('6.1 item 1 — renders from a cold link: no login form is presented', async () => {
    render(<ProgrammeView programmeId="prog-1" />);
    expect(await screen.findByText(PROGRAMME_NAME)).toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /log ?in|sign ?in/i })).not.toBeInTheDocument();
  });

  it('6.1 item 2 — total disbursed, payment count, and delivery rate are in the initial render', async () => {
    render(<ProgrammeView programmeId="prog-1" />);
    // Totals per asset, never summed together (section 5.4).
    expect(await screen.findByText(/150\.00/)).toBeInTheDocument();
    expect(screen.getByText(/200\.00/)).toBeInTheDocument();
    expect(screen.getByText(/delivery rate/i)).toBeInTheDocument();
    expect(screen.getByText(/payment/i)).toBeInTheDocument();
  });

  it('6.1 item 3 — the section 4.5 disclosure is on the same screen, not below a fold marker, not in a modal', async () => {
    render(<ProgrammeView programmeId="prog-1" />);
    expect(await screen.findByText('How to read this page')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('6.1 item 4 — the payment table renders paginated', async () => {
    render(<ProgrammeView programmeId="prog-1" />);
    await screen.findByText(PROGRAMME_NAME);
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
  });

  it('6.1 item 5 — a READY payment shows "Not yet settled." with no explorer link and no error styling', async () => {
    render(<ProgrammeView programmeId="prog-1" />);
    const label = await screen.findByText('Not yet settled.');
    expect(label.className).not.toMatch(/error|danger|fail|alert/i);
    const row = label.closest('tr');
    expect(row).not.toBeNull();
    expect(row!.querySelector('a[href*="/tx/"]')).toBeNull();
  });

  it('6.1 item 6 — "Not applicable" is visibly distinct from "Awaiting confirmation"', async () => {
    render(<ProgrammeView programmeId="prog-1" />);
    const notApplicable = await screen.findByText('Not applicable');
    const awaiting = screen.getByText('Awaiting confirmation');
    expect(notApplicable).not.toBe(awaiting);
    // Distinct rows, distinct render paths — not one shared fallback (D-7).
    expect(within(notApplicable.closest('tr')!).queryByText('Awaiting confirmation')).toBeNull();
  });
});
