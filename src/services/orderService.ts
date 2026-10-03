import { api } from "@/lib/apiClient";
import type { ApiSuccess, Order } from "../lib/types";

export interface CheckoutPayload {
  cartId: string;
  addressId?: string;
}

/** POST /api/v1/checkout — empties cart on success */
export async function checkout(payload: CheckoutPayload): Promise<Order> {
  const res = await api.postJson<ApiSuccess<Order>>(
    "/api/v1/checkout",
    payload,
  );
  return res.data;
}

/** GET /api/v1/getOrders */
export async function fetchOrders(signal?: AbortSignal): Promise<Order[]> {
  const res = await api.get<ApiSuccess<Order[]>>("/api/v1/getOrders", signal);
  return res.data;
}

/** GET /api/v1/order/:orderId */
export async function fetchOrderById(
  orderId: string,
  signal?: AbortSignal,
): Promise<Order> {
  const res = await api.get<ApiSuccess<Order>>(
    `/api/v1/order/${encodeURIComponent(orderId)}`,
    signal,
  );
  return res.data;
}

/**
 * PATCH /api/v1/order/:orderId/cancel
 * Shipped and delivered orders cannot be cancelled.
 */
export async function cancelOrder(orderId: string): Promise<Order> {
  const res = await api.patchJson<ApiSuccess<Order>>(
    `/api/v1/order/${encodeURIComponent(orderId)}/cancel`,
    {},
  );
  return res.data;
}
