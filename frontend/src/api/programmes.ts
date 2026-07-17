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

export async function fetchProgrammes(): Promise<Programme[]> {
  try {
    const res = await fetch(`/api/programmes`);
    if (!res.ok) throw new Error(`Programmes request failed (${res.status})`);
    const body = await res.json();
    return body.programmes ?? [];
  } catch {
    // Backend unreachable — fall back to the last known real data rather than an empty page.
    return FALLBACK_SNAPSHOT.programmes;
  }
}

export async function fetchGlobalAggregates(): Promise<ProgrammeAggregates> {
  try {
    const res = await fetch(`/api/aggregates`);
    if (!res.ok) throw new Error(`Aggregates request failed (${res.status})`);
    return await res.json();
  } catch {
    return FALLBACK_SNAPSHOT.aggregates;
  }
}

export async function fetchProgrammeDetail(
  programmeId: string,
  page: number,
): Promise<ProgrammeDetailResponse | null> {
  try {
    const res = await fetch(`/api/programmes/${programmeId}?page=${page}`);
    if (!res.ok) throw new Error(`Failed to load programme (${res.status})`);
    return await res.json();
  } catch {
    // Covers both "the real backend 404'd for an unknown id" and "there's no backend/API route
    // reachable at all" (e.g. no /api/* configured on this deployment) — both look identical
    // from here (a non-OK response), so both fall back to the snapshot. Only genuinely resolves
    // to null when this id isn't in the fallback data either.
    return FALLBACK_SNAPSHOT.programmeDetails[programmeId] ?? null;
  }
}
