// Presentational label/color for the fork's real disbursement status enum
// (DRAFT/READY/STARTED/PAUSED/COMPLETED) — cosmetic mapping only, not fabricated data.

export interface ProgrammeStatusMeta {
  label: string;
  color: string;
}

const STATUS_META: Record<string, ProgrammeStatusMeta> = {
  DRAFT: { label: "Draft", color: "#9ca3af" },
  READY: { label: "Ready", color: "#d97706" },
  STARTED: { label: "Active", color: "#10b981" },
  PAUSED: { label: "On Hold", color: "#d97706" },
  COMPLETED: { label: "Completed", color: "#5da76e" },
};

export function programmeStatusMeta(status: string): ProgrammeStatusMeta {
  return STATUS_META[status] ?? { label: status || "Unknown", color: "#6b7280" };
}
