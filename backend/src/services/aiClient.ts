import Anthropic from '@anthropic-ai/sdk';
import { DISCLOSURE_FULL } from '../constants/disclosure';
import type { Programme, ProgrammeAggregates } from '../types/programme';

// AI transparency summary + FAQ chat assistant. Both features are additive on top of the
// read-only core: they never see PII (only the already-filtered aggregate/public-view data
// reaches this module) and both degrade to a deterministic, offline answer when no API key is
// configured or the API call fails — the same "degrade gracefully" pattern used by
// sdpForkClient for the upstream fork (docs/OPEN_ITEMS.md OI-2/OQ-1).

const MODEL = 'claude-sonnet-5';

let cachedClient: Anthropic | null | undefined;

function getClient(): Anthropic | null {
  if (cachedClient !== undefined) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  cachedClient = apiKey ? new Anthropic({ apiKey }) : null;
  return cachedClient;
}

export interface AiSummaryResult {
  summary: string;
  source: 'ai' | 'fallback';
}

export interface ChatResult {
  reply: string;
  source: 'ai' | 'fallback';
}

function formatPercent(rate: number | null): string {
  return rate === null ? 'not yet measurable' : `${(rate * 100).toFixed(1)}%`;
}

/** Deterministic, data-driven summary — no network call, always available. */
function fallbackSummary(programme: Programme, aggregates: ProgrammeAggregates): string {
  const totals = aggregates.totals_by_asset
    .map((t) => `${t.total} ${t.asset}`)
    .join(' and ');
  const { settled, pending, failed, total } = aggregates.payment_count;

  const sentences = [
    `${programme.name} has disbursed ${totals || 'no funds yet'} across ${settled} settled payment${settled === 1 ? '' : 's'}, verifiable on the public Stellar ledger.`,
    `Of ${total} total payments recorded, ${settled} settled successfully, ${pending} are still pending, and ${failed} failed.`,
    `Delivery to beneficiaries is confirmed at a rate of ${formatPercent(aggregates.delivery_rate)}, based on ${aggregates.rate_basis.confirmed} confirmed and ${aggregates.rate_basis.awaiting_confirmation} awaiting field confirmation (${aggregates.rate_basis.excluded_no_delivery_record} payments have no delivery record and are excluded from that rate).`,
    `As with every figure on this page, this is a summary of the on-chain and field-reported data only — it proves funds moved and, where confirmed, that delivery was recorded, not that any specific individual received cash in hand.`,
  ];
  return sentences.join(' ');
}

export async function generateTransparencySummary(
  programme: Programme,
  aggregates: ProgrammeAggregates,
): Promise<AiSummaryResult> {
  const client = getClient();
  if (!client) return { summary: fallbackSummary(programme, aggregates), source: 'fallback' };

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system:
        'You write short, plain-language transparency summaries for a public donor portal. ' +
        'Use only the numbers given. Never claim a named individual received funds — the data ' +
        'only proves on-chain fund movement and, separately, field-reported delivery confirmation. ' +
        'Write 3-4 short sentences, no headings, no markdown, accessible to a general audience.',
      messages: [
        {
          role: 'user',
          content: `Programme: ${programme.name} (${programme.id})\nAggregates: ${JSON.stringify(aggregates)}\n\nWrite the transparency summary.`,
        },
      ],
    });
    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join(' ')
      .trim();
    if (!text) throw new Error('empty AI response');
    return { summary: text, source: 'ai' };
  } catch {
    return { summary: fallbackSummary(programme, aggregates), source: 'fallback' };
  }
}

const FAQ: Array<{ match: RegExp; answer: string }> = [
  {
    match: /verify.*payment|payment.*verif|how.*check/i,
    answer:
      'Open a programme, click a payment row, then use the explorer link — it takes you straight to the public Stellar explorer for that transaction hash. No login and no trust in OpenLedger required; you verify it yourself on the public chain.',
  },
  {
    match: /disclosure|honest|prove|limit/i,
    answer: DISCLOSURE_FULL.replace(/\n\n/g, ' '),
  },
  {
    match: /pdf|export|report/i,
    answer:
      'Every programme page has an "Export PDF" button. It generates a full impact report server-side — the same data and disclosure you see on screen, plus every payment row unpaginated, with a generation timestamp.',
  },
  {
    match: /personal|pii|privacy|name|phone|wallet|address/i,
    answer:
      'OpenLedger never displays personal data: no names, phone numbers, wallet addresses, or precise locations. Only opaque reference IDs, amounts, statuses, and timestamps are shown.',
  },
  {
    match: /deliver/i,
    answer:
      'Delivery has three states: "Confirmed" (field-confirmed and anchored on-chain), "Awaiting confirmation" (payment settled, confirmation not yet in), and "Not applicable" (no delivery record exists for that payment).',
  },
];

function fallbackChatReply(message: string): string {
  const hit = FAQ.find((f) => f.match.test(message));
  return (
    hit?.answer ??
    "I can help with questions about verifying payments, the transparency disclosure, PDF reports, delivery confirmation, and privacy. Try rephrasing, or ask about one of those topics."
  );
}

export async function answerChatQuestion(message: string): Promise<ChatResult> {
  const client = getClient();
  if (!client) return { reply: fallbackChatReply(message), source: 'fallback' };

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 250,
      system:
        'You are a support assistant embedded in OpenLedger, a public donor-transparency portal for a cross-border ' +
        'cash-transfer program. Answer only questions about: verifying payments on the Stellar blockchain, the ' +
        "honest-limits disclosure, PDF report export, delivery confirmation states, and the site's zero-PII policy. " +
        'Keep answers to 2-3 short sentences, plain language, no markdown. If asked something unrelated, politely ' +
        'redirect to what you can help with.',
      messages: [{ role: 'user', content: message }],
    });
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join(' ')
      .trim();
    if (!text) throw new Error('empty AI response');
    return { reply: text, source: 'ai' };
  } catch {
    return { reply: fallbackChatReply(message), source: 'fallback' };
  }
}
