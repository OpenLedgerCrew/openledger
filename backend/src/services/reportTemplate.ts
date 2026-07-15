import {
  DISCLOSURE_CLOSING,
  DISCLOSURE_HEADING,
  DISCLOSURE_INTRO,
  DISCLOSURE_NOT_PROVES,
  DISCLOSURE_PROVES,
} from '../constants/disclosure';
import { LABEL_DELIVERY_NOT_APPLICABLE } from '../constants/labels';
import type { PublicPaymentView } from '../types/payment';
import type { Programme, ProgrammeAggregates } from '../types/programme';

// Single source of the impact report's CONTENT. Both outputs — the Puppeteer-rendered HTML and
// the pdf-lib text fallback — are derived from the same model here, so the PDF cannot drift from
// the web view (the intent behind D-8). Only filtered PublicPaymentView data reaches this module,
// so no PII can appear in the report (sections 4.3, 4.4).

export interface ReportSections {
  includeStats: boolean;
  includePayments: boolean;
  includeDelivery: boolean;
}

export interface ReportData {
  programme: Programme;
  aggregates: ProgrammeAggregates;
  payments: PublicPaymentView[];
  generatedAt: string;
  /** All sections render when absent (e.g. window.open with no query flags). */
  sections?: ReportSections;
}

const DEFAULT_SECTIONS: ReportSections = {
  includeStats: true,
  includePayments: true,
  includeDelivery: true,
};

const DISCLOSURE_BLOCKS = [
  DISCLOSURE_INTRO,
  DISCLOSURE_PROVES,
  DISCLOSURE_NOT_PROVES,
  DISCLOSURE_CLOSING,
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function deliveryText(view: PublicPaymentView): string {
  return view.delivery.label;
}

/** Full HTML impact report, rendered to PDF by Puppeteer (the primary path, section 2.3). Styled with SAPCONE brand colors. */
export function renderProgrammeReportHtml(data: ReportData): string {
  const { programme, aggregates, payments, generatedAt } = data;
  const { includeStats, includePayments, includeDelivery } = data.sections ?? DEFAULT_SECTIONS;

  const totalsRows = aggregates.totals_by_asset
    .map((t) => `<tr><td style="font-weight: 600;">${escapeHtml(t.asset)}</td><td class="num" style="color: #5da76e; font-weight: 700;">${escapeHtml(t.total)}</td></tr>`)
    .join('');

  const statusColor = (status: string): string => {
    if (status === 'SUCCESS') return '#5da76e';
    if (status === 'FAILED') return '#b23f24';
    if (status === 'PENDING') return '#d97706';
    return '#1a1714';
  };

  const paymentRows = payments
    .map(
      (p) => `<tr>
        <td style="font-family: monospace; font-weight: 600;">${escapeHtml(p.reference_id)}</td>
        <td class="num" style="font-weight: 600;">${escapeHtml(p.amount)}</td>
        <td>${escapeHtml(p.asset)}</td>
        <td style="color: ${statusColor(p.status)}; font-weight: 600;">${escapeHtml(p.status)}</td>
        <td>${escapeHtml(p.created_at)}</td>
        <td>${escapeHtml(p.settled_at ?? p.settlement_label ?? '')}</td>
        ${includeDelivery ? `<td>${escapeHtml(deliveryText(p))}</td>` : ''}
      </tr>`,
    )
    .join('');

  const deliveryRate =
    aggregates.delivery_rate === null
      ? LABEL_DELIVERY_NOT_APPLICABLE
      : `${(aggregates.delivery_rate * 100).toFixed(1)}%`;

  const statsSection = includeStats
    ? `<h2>Aggregate Impact</h2>
  <div class="cards">
    <div class="card"><div class="k">Payments Settled</div><div class="v">${aggregates.payment_count.settled}</div></div>
    <div class="card"><div class="k">Pending</div><div class="v">${aggregates.payment_count.pending}</div></div>
    ${includeDelivery ? `<div class="card accent"><div class="k">Delivery Rate</div><div class="v">${deliveryRate}</div></div>` : ''}
  </div>
  <table>
    <thead><tr><th>Asset</th><th class="num">Total Disbursed</th></tr></thead>
    <tbody>${totalsRows}</tbody>
  </table>
  ${includeDelivery ? `<div class="muted" style="margin-top: 8px;">Delivery basis — confirmed: ${aggregates.rate_basis.confirmed}, awaiting: ${aggregates.rate_basis.awaiting_confirmation}, no delivery record: ${aggregates.rate_basis.excluded_no_delivery_record}.</div>` : ''}`
    : '';

  const paymentsSection = includePayments
    ? `<h2>Payments</h2>
  <table>
    <thead><tr><th>Reference</th><th class="num">Amount</th><th>Asset</th><th>Status</th><th>Created</th><th>Settled</th>${includeDelivery ? '<th>Delivery</th>' : ''}</tr></thead>
    <tbody>${paymentRows}</tbody>
  </table>`
    : '';

  const disclosureParas = DISCLOSURE_BLOCKS.map((b) => `<p>${escapeHtml(b)}</p>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(programme.name)} — Impact Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1714; background-color: #fcf5ec; margin: 40px; font-size: 12px; }
  h1 { font-family: 'Fraunces', Georgia, serif; font-size: 24px; color: #1a1714; margin: 0 0 4px; }
  h2 { font-family: 'Fraunces', Georgia, serif; font-size: 16px; color: #1a1714; margin: 28px 0 12px; border-bottom: 2px solid #5da76e; padding-bottom: 6px; }
  .muted { color: #6b7280; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 11px; }
  th { background: #f5f2ee; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 10px; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .cards { display: flex; gap: 16px; margin-top: 12px; }
  .card { flex: 1; border: 1px solid #e5e0d8; background: #ffffff; border-radius: 12px; padding: 14px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
  .card .k { color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
  .card .v { font-size: 18px; font-weight: 700; color: #1a1714; margin-top: 6px; }
  .card.accent .v { color: #5da76e; }
</style>
</head>
<body>
  <h1>${escapeHtml(programme.name)}</h1>
  <div class="muted">Programme ID: ${escapeHtml(programme.id)} · Generated ${escapeHtml(generatedAt)} (${escapeHtml(aggregates.timezone)})</div>

  ${statsSection}

  ${paymentsSection}

  <h2>How to read this page</h2>
  <div class="disclosure">
    <h3>${escapeHtml(DISCLOSURE_HEADING)}</h3>
    ${disclosureParas}
  </div>
</body>
</html>`;
}

/**
 * Plain-text line model for the pdf-lib fallback. Same content as the HTML, so the extracted
 * text satisfies the same assertions when Chromium is unavailable in a given environment.
 */
export function renderProgrammeReportLines(data: ReportData): string[] {
  const { programme, aggregates, payments, generatedAt } = data;
  const { includeStats, includePayments, includeDelivery } = data.sections ?? DEFAULT_SECTIONS;
  const lines: string[] = [];

  lines.push(programme.name);
  lines.push(`Programme ID: ${programme.id}`);
  lines.push(`Generated ${generatedAt} (${aggregates.timezone})`);
  lines.push('');

  if (includeStats) {
    lines.push('Aggregate impact');
    for (const t of aggregates.totals_by_asset) {
      lines.push(`Total disbursed (${t.asset}): ${t.total}`);
    }
    lines.push(
      `Payments — settled: ${aggregates.payment_count.settled}, pending: ${aggregates.payment_count.pending}, failed: ${aggregates.payment_count.failed}, total: ${aggregates.payment_count.total}`,
    );
    if (includeDelivery) {
      lines.push(
        `Delivery rate: ${aggregates.delivery_rate === null ? 'n/a' : `${(aggregates.delivery_rate * 100).toFixed(1)}%`} (confirmed ${aggregates.rate_basis.confirmed} / awaiting ${aggregates.rate_basis.awaiting_confirmation}, excluded ${aggregates.rate_basis.excluded_no_delivery_record})`,
      );
    }
    lines.push('');
  }

  if (includePayments) {
    lines.push('Payments');
    lines.push(
      `Reference | Amount | Asset | Status | Created | Settled${includeDelivery ? ' | Delivery' : ''}`,
    );
    for (const p of payments) {
      lines.push(
        `${p.reference_id} | ${p.amount} | ${p.asset} | ${p.status} | ${p.created_at} | ${p.settled_at ?? p.settlement_label ?? ''}${includeDelivery ? ` | ${deliveryText(p)}` : ''}`,
      );
    }
    lines.push('');
  }

  lines.push(DISCLOSURE_HEADING);
  for (const block of DISCLOSURE_BLOCKS) lines.push(block);

  return lines;
}
