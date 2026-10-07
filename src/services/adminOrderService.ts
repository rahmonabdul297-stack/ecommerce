import { api } from "@/lib/apiClient";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminOrdersData,
  ApiSuccess,
} from "@/lib/types";

export type AdminOrderSortField =
  | "createdAt"
  | "updatedAt"
  | "totalAmount"
  | "orderStatus";

export interface AdminOrdersQuery {
  page: number;
  limit: number;
  sortBy: AdminOrderSortField;
  sortOrder: "asc" | "desc";
}

interface RawOrdersData {
  [key: string]: unknown;
  orders?: AdminOrder[];
  pagination?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  page?: number;
  limit?: number;
  total?: number;
  totalOrders?: number;
  totalPages?: number;
}

function numericValue(
  source: Record<string, unknown>,
  keys: string[],
): number | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function normalizeOrdersData(
  value: unknown,
  requested: AdminOrdersQuery,
): AdminOrdersData {
  if (!value || typeof value !== "object") {
    throw new Error("The orders response did not contain order data.");
  }

  const raw = value as RawOrdersData;
  const orders = Array.isArray(raw.orders) ? raw.orders : [];
  const pagination = raw.pagination ?? raw.meta ?? {};
  const page = Math.max(
    1,
    numericValue(pagination, ["page", "currentPage"]) ??
      numericValue(raw, ["page"]) ??
      requested.page,
  );
  const limit = Math.max(
    1,
    numericValue(pagination, ["limit", "perPage"]) ??
      numericValue(raw, ["limit"]) ??
      requested.limit,
  );
  const total = Math.max(
    0,
    numericValue(pagination, ["total", "totalOrders", "totalCount"]) ??
      numericValue(raw, ["total", "totalOrders"]) ??
      orders.length,
  );
  const totalPages = Math.max(
    1,
    numericValue(pagination, ["totalPages", "pages"]) ??
      numericValue(raw, ["totalPages"]) ??
      Math.ceil(total / limit),
  );

  return {
    orders,
    pagination: { page, limit, total, totalPages },
  };
}

export async function fetchAdminOrders(
  query: AdminOrdersQuery,
  signal?: AbortSignal,
): Promise<AdminOrdersData> {
  const search = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });

  // Ensure path aligns correctly with your apiClient base URL setup
  const response = await api.get<ApiSuccess<unknown>>(
    `/admin/orders?${search.toString()}`,
    signal,
  );

  return normalizeOrdersData(response.data, query);
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: AdminOrderStatus,
): Promise<AdminOrderStatus> {
  const response = await api.patchJson<ApiSuccess<unknown>>(
    `/admin/orders/${encodeURIComponent(orderId)}/status`,
    { status },
  );
  const result = response.data;
  if (!result || typeof result !== "object") return status;

  const payload = result as Record<string, unknown>;
  const nestedOrder = payload.order || payload.data;
  const returnedStatus =
    nestedOrder && typeof nestedOrder === "object"
      ? (nestedOrder as Record<string, unknown>).orderStatus
      : (payload.orderStatus ?? payload.status);
      
  const supportedStatuses: AdminOrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return supportedStatuses.includes(returnedStatus as AdminOrderStatus)
    ? (returnedStatus as AdminOrderStatus)
    : status;
}