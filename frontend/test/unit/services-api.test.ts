import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  ApiError,
  getPaymentDetail,
  getProgrammeSummary,
  handleApiResponse,
} from "../../src/services/api";

describe("services/api (Fix A2, A4, A6)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("Fix A2: getProgrammeSummary fetches directly from /programmes/:id dynamically", async () => {
    const mockData = {
      programme_id: "prog-xyz",
      name: "Dynamic Programme",
      status: "STARTED",
      aggregates: { totals_by_asset: [], payment_count: { total: 0, settled: 0, pending: 0, failed: 0 }, delivery_rate: 0.5, rate_basis: { confirmed: 0, awaiting_confirmation: 0, excluded_no_delivery_record: 0 }, timezone: "UTC", generated_at: "" },
      disclosure: "",
      payments: [],
      pagination: { page: 1, page_size: 25, total_items: 0, total_pages: 1 },
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await getProgrammeSummary("prog-xyz");
    expect(fetchSpy).toHaveBeenCalledWith("/programmes/prog-xyz");
    expect(result.name).toBe("Dynamic Programme");
  });

  it("Fix A4: getPaymentDetail targets /api/v1/openledger/payments/:paymentId", async () => {
    const mockPayment = {
      reference_id: "REF-999",
      amount: "150.00",
      asset: "USDC",
      status: "SUCCESS",
      created_at: "2026-07-01T00:00:00Z",
      settled_at: "2026-07-01T01:00:00Z",
      tx_hash: "abcd",
      explorer_url: "https://stellar.expert/explorer/testnet/tx/abcd",
      disclosure: "",
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockPayment), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await getPaymentDetail("REF-999");
    expect(fetchSpy).toHaveBeenCalledWith("/api/v1/openledger/payments/REF-999");
    expect(result.reference_id).toBe("REF-999");
  });

  it("Fix A6: unmasks errors by parsing and throwing structured ApiError on non-200 responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Programme not found in database" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(getProgrammeSummary("non-existent")).rejects.toThrow(ApiError);

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { message: "Internal server error" } }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    );

    try {
      await getPaymentDetail("fail-id");
      expect.fail("Should have thrown ApiError");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(500);
      expect(err.message).toBe("Internal server error");
    }
  });

  it("Fix A6: extracts HTTP status if no structured JSON is present", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Bad Gateway", {
        status: 502,
        headers: { "Content-Type": "text/plain" },
      })
    );

    try {
      await getProgrammeSummary("gateway-err");
      expect.fail("Should have thrown ApiError");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(502);
      expect(err.message).toBe("Bad Gateway");
    }
  });
});
