import { api } from "@/lib/apiClient";
import type { ApiSuccess, Order, PaystackInitializeData } from "../lib/types";

export interface InitializePaymentPayload {
  orderId: string;
}

/**
 * POST /api/v1/payments/initialize
 * Redirect the user to authorizationUrl; do not collect or send card details
 * through this app.
 */
export async function initializePayment(
  payload: InitializePaymentPayload,
): Promise<PaystackInitializeData> {
  const res = await api.postJson<ApiSuccess<PaystackInitializeData>>(
    "/api/v1/payments/initialize",
    payload,
  );
  return res.data;
}

/**
 * GET /api/v1/payments/verify/:reference
 * Call this after returning from Paystack, then refresh order state.
 */
export async function verifyPayment(
  reference: string,
  signal?: AbortSignal,
): Promise<Order> {
  const res = await api.get<ApiSuccess<Order>>(
    `/api/v1/payments/verify/${encodeURIComponent(reference)}`,
    signal,
  );
  return res.data;
}

/**
 * BACKEND ISSUE: GET /api/v1/payments/webhook is registered as a GET handler
 * but webhooks should be POST. This is a server-to-server endpoint and must
 * never be called from React. Do not use it.
 */
