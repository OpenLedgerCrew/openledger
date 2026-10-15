import { describe, expect, it } from "vitest";
import { formatAmount, formatDate, formatDeliveryRate } from "../../src/utils/formatters";

describe("formatDeliveryRate (Fix A5)", () => {
  it("formats raw decimals into correct percentages", () => {
    expect(formatDeliveryRate(0.5)).toBe("50.0%");
    expect(formatDeliveryRate(0.9544)).toBe("95.4%");
    expect(formatDeliveryRate(0.0)).toBe("0.0%");
    expect(formatDeliveryRate(1.0)).toBe("100.0%");
  });

  it("handles pre-multiplied values greater than 1 gracefully without glitches", () => {
    expect(formatDeliveryRate(50.0)).toBe("50.0%");
    expect(formatDeliveryRate(95.4)).toBe("95.4%");
    expect(formatDeliveryRate(96)).toBe("96.0%");
    expect(formatDeliveryRate(100)).toBe("100.0%");
  });

  it("returns fallback for null, undefined, or NaN", () => {
    expect(formatDeliveryRate(null)).toBe("—");
    expect(formatDeliveryRate(undefined)).toBe("—");
    expect(formatDeliveryRate(NaN)).toBe("—");
    expect(formatDeliveryRate(null, "N/A")).toBe("N/A");
  });
});

describe("formatAmount and formatDate", () => {
  it("formats amounts with asset correctly", () => {
    expect(formatAmount(100, "USDC")).toBe("100.00 USDC");
    expect(formatAmount("2500.5", "XLM")).toBe("2,500.50 XLM");
    expect(formatAmount(null, "USDC")).toBe("0.00 USDC");
  });

  it("formats ISO dates", () => {
    expect(formatDate("2026-07-01T09:00:00Z")).toBe("2026-07-01");
    expect(formatDate(null)).toBe("—");
  });
});
