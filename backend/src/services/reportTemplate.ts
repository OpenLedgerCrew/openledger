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

export interface ReportData {
  programme: Programme;
  aggregates: ProgrammeAggregates;
  payments: PublicPaymentView[];
  generatedAt: string;
}

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

/** Full HTML impact report, rendered to PDF by Puppeteer (the primary path, section 2.3). */
export function renderProgrammeReportHtml(data: ReportData): string {
  const { programme, aggregates, payments, generatedAt } = data;

  const totalsRows = aggregates.totals_by_asset
    .map((t) => `<tr><td>${escapeHtml(t.asset)}</td><td class="num">${escapeHtml(t.total)}</td></tr>`)
    .join('');

  const paymentRows = payments
    .map(
      (p) => `<tr>
        <td>${escapeHtml(p.reference_id)}</td>
        <td class="num">${escapeHtml(p.amount)}</td>
        <td>${escapeHtml(p.asset)}</td>
        <td>${escapeHtml(p.status)}</td>
        <td>${escapeHtml(p.created_at)}</td>
        <td>${escapeHtml(p.settled_at ?? p.settlement_label ?? '')}</td>
        <td>${escapeHtml(deliveryText(p))}</td>
      </tr>`,
    )
    .join('');

  const deliveryRate =
    aggregates.delivery_rate === null
      ? LABEL_DELIVERY_NOT_APPLICABLE
      : `${(aggregates.delivery_rate * 100).toFixed(1)}%`;

  const disclosureParas = DISCLOSURE_BLOCKS.map((b) => `<p>${escapeHtml(b)}</p>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(programme.name)} — Impact Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 40px; font-size: 12px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 24px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  .muted { color: #666; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { text-align: left; padding: 4px 6px; border-bottom: 1px solid #eee; font-size: 11px; }
  th { background: #f5f5f5; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .cards { display: flex; gap: 16px; margin-top: 8px; }
  .card { border: 1px solid #e5e5e5; border-radius: 6px; padding: 10px 14px; }
  .card .k { color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
  .card .v { font-size: 16px; font-weight: 600; }
  .disclosure { background: #fbfbf7; border: 1px solid #e7e4d8; border-radius: 6px; padding: 12px 16px; margin-top: 12px; }
  .disclosure h3 { margin: 0 0 8px; font-size: 13px; }
  .disclosure p { margin: 0 0 8px; line-height: 1.45; }
</style>
</head>
<body>
  <h1>${escapeHtml(programme.name)}</h1>
  <div class="muted">Programme ID: ${escapeHtml(programme.id)} · Generated ${escapeHtml(generatedAt)} (${escapeHtml(aggregates.timezone)})</div>

  <h2>Aggregate impact</h2>
  <div class="cards">
    <div class="card"><div class="k">Payments settled</div><div class="v">${aggregates.payment_count.settled}</div></div>
    <div class="card"><div class="k">Pending</div><div class="v">${aggregates.payment_count.pending}</div></div>
    <div class="card"><div class="k">Delivery rate</div><div class="v">${deliveryRate}</div></div>
  </div>
  <table>
    <thead><tr><th>Asset</th><th class="num">Total disbursed</th></tr></thead>
    <tbody>${totalsRows}</tbody>
  </table>
  <div class="muted">Delivery basis — confirmed: ${aggregates.rate_basis.confirmed}, awaiting: ${aggregates.rate_basis.awaiting_confirmation}, no delivery record: ${aggregates.rate_basis.excluded_no_delivery_record}.</div>

  <h2>Payments</h2>
  <table>
    <thead><tr><th>Reference</th><th class="num">Amount</th><th>Asset</th><th>Status</th><th>Created</th><th>Settled</th><th>Delivery</th></tr></thead>
    <tbody>${paymentRows}</tbody>
  </table>

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
  const lines: string[] = [];

  lines.push(programme.name);
  lines.push(`Programme ID: ${programme.id}`);
  lines.push(`Generated ${generatedAt} (${aggregates.timezone})`);
  lines.push('');
  lines.push('Aggregate impact');
  for (const t of aggregates.totals_by_asset) {
    lines.push(`Total disbursed (${t.asset}): ${t.total}`);
  }
  lines.push(
    `Payments — settled: ${aggregates.payment_count.settled}, pending: ${aggregates.payment_count.pending}, failed: ${aggregates.payment_count.failed}, total: ${aggregates.payment_count.total}`,
  );
  lines.push(
    `Delivery rate: ${aggregates.delivery_rate === null ? 'n/a' : `${(aggregates.delivery_rate * 100).toFixed(1)}%`} (confirmed ${aggregates.rate_basis.confirmed} / awaiting ${aggregates.rate_basis.awaiting_confirmation}, excluded ${aggregates.rate_basis.excluded_no_delivery_record})`,
  );
  lines.push('');
  lines.push('Payments');
  lines.push('Reference | Amount | Asset | Status | Created | Settled | Delivery');
  for (const p of payments) {
    lines.push(
      `${p.reference_id} | ${p.amount} | ${p.asset} | ${p.status} | ${p.created_at} | ${p.settled_at ?? p.settlement_label ?? ''} | ${deliveryText(p)}`,
    );
  }
  lines.push('');
  lines.push(DISCLOSURE_HEADING);
  for (const block of DISCLOSURE_BLOCKS) lines.push(block);

  return lines;
}
