import type { PaymentRow, Programme, ProgrammeAggregates } from "../types";
import type { PaymentDetail } from "../types/openledger";
import { triggerRateLimitAlert } from "../utils/rateLimit";

/**
 * Structured error class thrown by API functions when a non-200 response is encountered.
 * Carries the HTTP status code, unmasked error message, and any structured error payload.
 */
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface ProgrammeSummaryResponse {
  programme_id: string;
  name: string;
  status: string;
  aggregates: ProgrammeAggregates;
  disclosure: string;
  payments: PaymentRow[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

export interface PaymentDetailResponse {
  reference_id: string;
  amount: string;
  asset: string;
  status: string;
  created_at: string;
  settled_at: string | null;
  tx_hash: string | null;
  explorer_url: string | null;
  funds_leg?: {
    label: string;
    tx_hash: string;
    explorer_url: string;
  };
  delivery_leg?: {
    label: string;
    confirmed_at: string | null;
    anchoring_tx_hash: string | null;
    explorer_url: string | null;
  };
  disclosure: string;
  [key: string]: any;
}

/**
 * Parses non-200 responses and throws a structured ApiError containing
 * the extracted error.message or HTTP status code, unmasking errors instead
 * of silently failing or returning null.
 */
export async function parseErrorResponse(res: Response): Promise<never> {
  if (res.status === 429) {
    triggerRateLimitAlert();
  }
  let message = `Request failed with status ${res.status}`;
  let errorData: any = null;

  try {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      errorData = await res.json();
      if (errorData) {
        if (typeof errorData.message === "string" && errorData.message.trim().length > 0) {
          message = errorData.message;
        } else if (typeof errorData.error === "string" && errorData.error.trim().length > 0) {
          message = errorData.error;
        } else if (errorData.error && typeof errorData.error.message === "string") {
          message = errorData.error.message;
        }
      }
    } else {
      const text = await res.text();
      if (text && text.trim().length > 0) {
        message = text.trim();
      }
    }
  } catch {
    // If response body parsing fails, retain status-based error message
  }

  throw new ApiError(message, res.status, errorData);
}

/**
 * Handles an API Response by throwing a structured ApiError on non-200 responses
 * and returning parsed JSON on success.
 */
export async function handleApiResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    await parseErrorResponse(res);
  }
  return res.json();
}

/**
 * Fix A2 & A6:
 * Fetches programme summary directly from `/programmes/${programmeId}` dynamically
 * instead of returning hardcoded static mock JSON files.
 * Throws structured ApiError on non-200 responses.
 */
export async function getProgrammeSummary(programmeId: string): Promise<ProgrammeSummaryResponse> {
  const url = programmeId.startsWith("/programmes/")
    ? programmeId
    : `/programmes/${encodeURIComponent(programmeId)}`;

  const res = await fetch(url);
  return handleApiResponse<ProgrammeSummaryResponse>(res);
}

/**
 * Fix A4:
 * Fetches payment detail targeting GET /api/v1/openledger/payments/:paymentId.
 * Throws structured ApiError on non-200 responses.
 */
export async function getPaymentDetail(paymentId: string): Promise<PaymentDetail> {
  const res = await fetch(`/api/v1/openledger/payments/${encodeURIComponent(paymentId)}`);
  return handleApiResponse<PaymentDetail>(res);
}

/**
 * Fetches all available programmes.
 * Throws structured ApiError on non-200 responses.
 */
export async function getProgrammes(): Promise<{ programmes: Programme[] }> {
  const res = await fetch(`/api/v1/openledger/programmes`);
  return handleApiResponse<{ programmes: Programme[] }>(res);
}

/**
 * Fetches aggregates for a programme or global aggregates.
 * Throws structured ApiError on non-200 responses.
 */
export async function getAggregates(programmeId?: string): Promise<ProgrammeAggregates> {
  const url = programmeId
    ? `/api/v1/openledger/programmes/${encodeURIComponent(programmeId)}/aggregates`
    : `/api/v1/openledger/aggregates`;
  const res = await fetch(url);
  return handleApiResponse<ProgrammeAggregates>(res);
}

/**
 * Fetches paginated payments for a programme.
 * Throws structured ApiError on non-200 responses.
 */
export async function getPayments(
  programmeId: string,
  page = 1,
  limit = 25
): Promise<{ payments: PaymentRow[]; total_pages: number; total_items?: number }> {
  const res = await fetch(
    `/api/v1/openledger/programmes/${encodeURIComponent(programmeId)}/payments?page=${page}&limit=${limit}`
  );
  return handleApiResponse<{ payments: PaymentRow[]; total_pages: number; total_items?: number }>(res);
}
