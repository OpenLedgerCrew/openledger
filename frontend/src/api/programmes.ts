import type { Programme, ProgrammeAggregates } from "../types";

export async function fetchProgrammes(): Promise<Programme[]> {
  const res = await fetch(`/api/programmes`);
  if (!res.ok) throw new Error(`Programmes request failed (${res.status})`);
  const body = await res.json();
  return body.programmes ?? [];
}

export async function fetchGlobalAggregates(): Promise<ProgrammeAggregates> {
  const res = await fetch(`/api/aggregates`);
  if (!res.ok) throw new Error(`Aggregates request failed (${res.status})`);
  return res.json();
}
