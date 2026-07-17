import { DISCLOSURE_FULL } from '../constants/disclosure';
import type { Programme, ProgrammeAggregates } from '../types/programme';

// AI transparency summary + FAQ chat assistant. Both features are additive on top of the
// read-only core: they never see PII (only the already-filtered aggregate/public-view data
// reaches this module) and both degrade to a deterministic, offline answer when no API key is
// configured or the API call fails — the same "degrade gracefully" pattern used by
// sdpForkClient for the upstream fork (docs/OPEN_ITEMS.md OI-2/OQ-1).
//
// Uses OpenRouter's OpenAI-compatible chat completions endpoint via plain fetch (no SDK
// dependency), matching the fetch-based style already used elsewhere (sdpForkClient.ts).

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Free-tier OpenRouter model. Picked over other :free options because it answers directly
// (no reasoning-token preamble that can eat the whole max_tokens budget on short replies) and
// wasn't upstream-rate-limited when checked. OpenRouter's free catalog rotates — override via
// OPENROUTER_MODEL if this one stops being available.
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';

function getApiKey(): string | null {
  return process.env.OPENROUTER_API_KEY || null;
}

async function callOpenRouter(
  apiKey: string,
  system: string,
  userMessage: string,
  maxTokens: number,
): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter request failed: ${res.status}`);
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('empty AI response');
  return text;
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
  const apiKey = getApiKey();
  if (!apiKey) return { summary: fallbackSummary(programme, aggregates), source: 'fallback' };

  try {
    const text = await callOpenRouter(
      apiKey,
      'You write short, plain-language transparency summaries for a public donor portal. ' +
        'Use only the numbers given. Never claim a named individual received funds — the data ' +
        'only proves on-chain fund movement and, separately, field-reported delivery confirmation. ' +
        'Write 3-4 short sentences, no headings, no markdown, accessible to a general audience.',
      `Programme: ${programme.name} (${programme.id})\nAggregates: ${JSON.stringify(aggregates)}\n\nWrite the transparency summary.`,
      300,
    );
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
  const apiKey = getApiKey();
  if (!apiKey) return { reply: fallbackChatReply(message), source: 'fallback' };

  try {
    const text = await callOpenRouter(
      apiKey,
      'You are a support assistant embedded in OpenLedger, a public donor-transparency portal for a cross-border ' +
        'cash-transfer program. Answer only questions about: verifying payments on the Stellar blockchain, the ' +
        "honest-limits disclosure, PDF report export, delivery confirmation states, and the site's zero-PII policy. " +
        'Keep answers to 2-3 short sentences, plain language, no markdown. If asked something unrelated, politely ' +
        'redirect to what you can help with.',
      message,
      250,
    );
    return { reply: text, source: 'ai' };
  } catch {
    return { reply: fallbackChatReply(message), source: 'fallback' };
  }
}
