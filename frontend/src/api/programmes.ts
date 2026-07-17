import type { PaymentRow, Programme, ProgrammeAggregates } from "../types";
import { FALLBACK_SNAPSHOT } from "./fixtures/sdp-fallback-snapshot";

export interface ProgrammeDetailResponse {
  programme_id: string;
  name: string;
  status: string;
  aggregates: ProgrammeAggregates;
  disclosure: string;
  payments: PaymentRow[];
  pagination: { page: number; page_size: number; total_items: number; total_pages: number };
}

/** Tags every fetch result with where it actually came from, so the UI can be honest about it. */
export interface FetchResult<T> {
  data: T;
  source: "live" | "fallback";
}

// Render's free tier spins a backend down after ~15 min idle; the next request has to cold-start
// the container, which can take 30-50s and sometimes fails fast (rather than hanging) on the very
// first attempt. Retrying a couple of times with backoff gives it a real chance to come up before
// we give up and show the (possibly stale) fallback snapshot.
const RETRY_DELAYS_MS = [3000, 8000];

/** Only retry on signals that plausibly mean "still waking up" — not on definitive app errors
 * like a 404 for an id that genuinely doesn't exist, which retrying would never fix. */
function isRetryableStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
}

async function fetchWithRetry(
  input: string,
  init: RequestInit | undefined,
  onRetry?: (attempt: number, maxAttempts: number) => void,
): Promise<Response> {
  const maxAttempts = RETRY_DELAYS_MS.length + 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(input, init);
      if (res.ok || !isRetryableStatus(res.status)) return res;
      lastError = new Error(`Request failed (${res.status})`);
    } catch (err) {
      lastError = err;
    }

    if (attempt < maxAttempts) {
      onRetry?.(attempt, maxAttempts);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt - 1]));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed");
}

export async function fetchProgrammes(
  onRetry?: (attempt: number, maxAttempts: number) => void,
): Promise<FetchResult<Programme[]>> {
  try {
    const res = await fetchWithRetry(`/api/programmes`, undefined, onRetry);
    if (!res.ok) throw new Error(`Programmes request failed (${res.status})`);
    const body = await res.json();
    return { data: body.programmes ?? [], source: "live" };
  } catch {
    // Backend unreachable after retries — fall back to the last known real data rather than an
    // empty page. Callers should surface `source === "fallback"` to the user.
    return { data: FALLBACK_SNAPSHOT.programmes, source: "fallback" };
  }
}

export async function fetchGlobalAggregates(
  onRetry?: (attempt: number, maxAttempts: number) => void,
): Promise<FetchResult<ProgrammeAggregates>> {
  try {
    const res = await fetchWithRetry(`/api/aggregates`, undefined, onRetry);
    if (!res.ok) throw new Error(`Aggregates request failed (${res.status})`);
    return { data: await res.json(), source: "live" };
  } catch {
    return { data: FALLBACK_SNAPSHOT.aggregates, source: "fallback" };
  }
}

export async function fetchProgrammeDetail(
  programmeId: string,
  page: number,
  onRetry?: (attempt: number, maxAttempts: number) => void,
): Promise<FetchResult<ProgrammeDetailResponse | null>> {
  try {
    const res = await fetchWithRetry(`/api/programmes/${programmeId}?page=${page}`, undefined, onRetry);
    if (!res.ok) throw new Error(`Failed to load programme (${res.status})`);
    return { data: await res.json(), source: "live" };
  } catch {
    // Covers both "the real backend 404'd for an unknown id" and "there's no backend/API route
    // reachable at all after retries" — both look identical from here (a non-OK response), so
    // both fall back to the snapshot. Only genuinely resolves to null when this id isn't in the
    // fallback data either.
    return { data: FALLBACK_SNAPSHOT.programmeDetails[programmeId] ?? null, source: "fallback" };
  }
}
