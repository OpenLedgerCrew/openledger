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
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to load programme (${res.status})`);
    return await res.json();
  } catch {
    return FALLBACK_SNAPSHOT.programmeDetails[programmeId] ?? null;
  }
}
