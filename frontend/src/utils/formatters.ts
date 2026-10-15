/**
 * Formats delivery rate numbers into standard percentage strings using Intl.NumberFormat.
 * 
 * Handles:
 * - Raw decimals in [0, 1] (e.g., 0.50 -> "50.0%", 0.9544 -> "95.4%")
 * - Pre-multiplied numbers > 1 (e.g., 50.0 -> "50.0%", 95.4 -> "95.4%", 96 -> "96.0%")
 * - Values slightly greater than 1 are treated as pre-multiplied percentages to prevent
 *   fractional percentage glitches like "0.5%" when 50% was intended.
 * - null, undefined, or NaN safely fall back to the provided fallback string (default: "—").
 */
export function formatDeliveryRate(
  rate: number | null | undefined,
  fallback = "—"
): string {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return fallback;
  }

  // If rate is greater than 1, it has already been pre-multiplied into a percentage range (e.g., 50 for 50%)
  const decimal = rate > 1 ? rate / 100 : rate;

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(decimal);
}

/**
 * Formats a numeric string or number into a comma-separated amount string.
 */
export function formatAmount(
  amount: number | string | null | undefined,
  asset?: string,
  fallback = "0.00"
): string {
  if (amount === null || amount === undefined || amount === "") {
    return fallback + (asset ? ` ${asset}` : "");
  }
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return String(amount) + (asset ? ` ${asset}` : "");
  }
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return asset ? `${formatted} ${asset}` : formatted;
}

/**
 * Formats an ISO date string into YYYY-MM-DD.
 */
export function formatDate(dateStr: string | null | undefined, fallback = "—"): string {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return d.toISOString().split("T")[0];
  } catch {
    return fallback;
  }
}
