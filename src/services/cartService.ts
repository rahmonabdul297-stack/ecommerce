import { api } from "@/lib/apiClient";
import type { Cart, CartSuccess, SelectedAttributes } from "../lib/types";

export interface AddItemPayload {
  productId: string;
  quantity: number;
  selectedAttributes?: SelectedAttributes;
}

export interface UpdateItemPayload {
  quantity: number;
}

/** GET /api/v1/getCart */
export async function getCart(signal?: AbortSignal): Promise<Cart> {
  const res = await api.get<CartSuccess<Cart>>("/api/v1/getCart", signal);
  return res.data;
}

/** POST /api/v1/items */
export async function addToCart(payload: AddItemPayload): Promise<Cart> {
  const res = await api.postJson<CartSuccess<Cart>>("/api/v1/items", payload);
  return res.data;
}

/** PATCH /api/v1/items/:itemId */
export async function updateCartItem(
  itemId: string,
  payload: UpdateItemPayload,
): Promise<Cart> {
  const res = await api.patchJson<CartSuccess<Cart>>(
    `/api/v1/items/${encodeURIComponent(itemId)}`,
    payload,
  );
  return res.data;
}

/** DELETE /api/v1/items/:itemId */
export async function removeCartItem(itemId: string): Promise<Cart> {
  const res = await api.delete<CartSuccess<Cart>>(
    `/api/v1/items/${encodeURIComponent(itemId)}`,
  );
  return res.data;
}

/**
 * DELETE /api/v1/clear-cart
 * BACKEND CAVEAT: This route has no auth middleware, and cart handlers use
 * req._id although auth middleware sets req.id. The call may fail with an
 * authorization or ID resolution error. Report failures clearly; do not
 * fabricate IDs client-side.
 */
export async function clearCart(): Promise<{ success: true; message: string }> {
  const res = await api.delete<{ success: true; message: string }>(
    "/api/v1/clear-cart",
  );
  return res;
}
