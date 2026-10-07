import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ChevronDown, ClipboardList } from "lucide-react";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminOrdersPagination,
} from "@/lib/types";
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
  type AdminOrderSortField,
} from "@/services/adminOrderService";
import { ApiRequestError } from "@/lib/types";
import { useToast } from "@/context/ToastContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { formatDateTime, formatPrice } from "@/lib/utils";

const PAGE_SIZE = 20;
const ORDER_STATUSES: AdminOrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const statusTone: Record<
  AdminOrderStatus,
  "success" | "warning" | "error" | "info"
> = {
  pending: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
};

const paymentTone: Record<string, "success" | "warning" | "error" | "neutral"> =
  {
    paid: "success",
    pending: "warning",
    failed: "error",
  };

const formatCustomer = (customer: AdminOrder["customer"]) => {
  if (typeof customer === "string") {
    return { name: customer, email: "" };
  }
  return {
    name: customer?.name || customer?.username || "Customer",
    email: customer?.email || customer?.phone || "",
  };
};

const getAccessMessage = (status: number) => {
  if (status === 401) {
    return "Your session has expired. Sign in again to access admin orders.";
  }
  return "Your account does not have permission to manage orders.";
};

export function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState<AdminOrdersPagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<AdminOrderSortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<{
    orderId: string;
    message: string;
    status?: number;
  } | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await fetchAdminOrders({
        page,
        limit: PAGE_SIZE,
        sortBy,
        sortOrder,
      });
      setOrders(result.orders);
      setPagination(result.pagination);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error : new Error("Failed to load orders."),
      );
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (
    order: AdminOrder,
    status: AdminOrderStatus,
  ) => {
    if (status === order.orderStatus) return;
    setUpdatingOrderId(order._id);
    setUpdateError(null);
    setStatusNotice(null);
    try {
      const savedStatus = await updateAdminOrderStatus(order._id, status);
      setOrders((current) =>
        current.map((item) =>
          item._id === order._id ? { ...item, orderStatus: savedStatus } : item,
        ),
      );
      setStatusNotice(
        `Order #${order._id.slice(-8)} updated to ${savedStatus}.`,
      );
      showToast("success", "Order status updated");
    } catch (error) {
      const statusCode =
        error instanceof ApiRequestError ? error.status : undefined;
      const message =
        statusCode === 401 || statusCode === 403
          ? getAccessMessage(statusCode)
          : error instanceof Error
            ? error.message
            : "Could not update the order status. Try again.";
      setUpdateError({ orderId: order._id, message, status: statusCode });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const accessStatus =
    loadError instanceof ApiRequestError &&
    (loadError.status === 401 || loadError.status === 403)
      ? loadError.status
      : undefined;
  const rangeStart = pagination.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, pagination.total);

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-400">
            Administration
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review customer purchases and update fulfillment status.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
            Sort by
            <select
              value={sortBy}
              onChange={(event) => {
                setPage(1);
                setSortBy(event.target.value as AdminOrderSortField);
              }}
              className="form-input min-w-44"
            >
              <option value="createdAt">Date created</option>
              <option value="updatedAt">Last updated</option>
              <option value="totalAmount">Order total</option>
              <option value="orderStatus">Order status</option>
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            className="justify-center"
            aria-label={`Sort ${sortOrder === "desc" ? "ascending" : "descending"}`}
            onClick={() => {
              setPage(1);
              setSortOrder((current) => (current === "desc" ? "asc" : "desc"));
            }}
          >
            {sortOrder === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            {sortOrder === "desc" ? "Descending" : "Ascending"}
          </Button>
        </div>
      </div>

      {statusNotice && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {statusNotice}
        </p>
      )}

      {loading && <FullPageSpinner message="Loading orders…" />}

      {loadError && (
        <section
          className="rounded-xl border border-red-200 bg-white p-5 dark:border-red-900 dark:bg-gray-900"
          role="alert"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {accessStatus === 401
              ? "Sign-in required"
              : accessStatus === 403
                ? "Admin access required"
                : "Could not load orders"}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {accessStatus ? getAccessMessage(accessStatus) : loadError.message}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {accessStatus === 401 && (
              <Link
                to="/admin/login"
                className="text-sm font-semibold text-teal-700 underline dark:text-teal-300"
              >
                Sign in
              </Link>
            )}
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="text-sm font-semibold text-teal-700 underline dark:text-teal-300"
            >
              Try again
            </button>
          </div>
        </section>
      )}

      {!loading && !loadError && orders.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No orders found"
          message="Orders will appear here when customers complete checkout."
        />
      )}

      {!loading && !loadError && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const customer = formatCustomer(order.customer);
            const orderUpdateError =
              updateError?.orderId === order._id ? updateError : null;

            return (
              <article
                key={order._id}
                className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h2>
                      <span className="break-all font-mono text-xs text-gray-400">
                        {order._id}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                      {customer.name}
                    </p>
                    {customer.email && (
                      <p className="break-all text-xs text-gray-500 dark:text-gray-400">
                        {customer.email}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {order.createdAt
                        ? formatDateTime(order.createdAt)
                        : "Date unavailable"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={paymentTone[order.paymentStatus] ?? "neutral"}>
                      Payment: {order.paymentStatus}
                    </Badge>
                    <Badge tone={statusTone[order.orderStatus]}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Order total
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    Update status
                    <select
                      value={order.orderStatus}
                      disabled={updatingOrderId === order._id}
                      onChange={(event) =>
                        void handleStatusChange(
                          order,
                          event.target.value as AdminOrderStatus,
                        )
                      }
                      className="form-input min-w-0"
                      aria-label={`Status for order ${order._id}`}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status[0].toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    {updatingOrderId === order._id && (
                      <span className="text-xs text-gray-500">
                        Saving status…
                      </span>
                    )}
                  </label>
                </div>

                {orderUpdateError && (
                  <div
                    role="alert"
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
                  >
                    <p>{orderUpdateError.message}</p>
                    {orderUpdateError.status === 401 && (
                      <Link
                        to="/admin/login"
                        className="mt-2 inline-block font-semibold underline"
                      >
                        Sign in
                      </Link>
                    )}
                  </div>
                )}

                <details className="group mt-3 min-w-0 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    <span>Items and delivery ({order.items.length} items)</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-3 grid gap-4 border-t border-gray-200 pt-3 dark:border-gray-700 sm:grid-cols-2">
                    <div className="min-w-0 space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={`${item.product}-${index}`}
                          className="flex min-w-0 items-center gap-3"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="h-11 w-11 shrink-0 rounded-md bg-white object-cover dark:bg-gray-900"
                            />
                          ) : (
                            <span className="h-11 w-11 shrink-0 rounded-md bg-gray-200 dark:bg-gray-700" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium text-gray-800 dark:text-gray-100">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        Shipping address
                      </p>
                      {order.shippingAddress ? (
                        <p className="mt-1 break-words text-gray-600 dark:text-gray-300">
                          {order.shippingAddress.recipientName && (
                            <>
                              {order.shippingAddress.recipientName}
                              <br />
                            </>
                          )}
                          {order.shippingAddress.street}
                          <br />
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state},{" "}
                          {order.shippingAddress.country}
                          {order.shippingAddress.postalCode &&
                            `, ${order.shippingAddress.postalCode}`}
                          {order.shippingAddress.recipientPhone && (
                            <>
                              <br />
                              {order.shippingAddress.recipientPhone}
                            </>
                          )}
                        </p>
                      ) : (
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                          No shipping address provided.
                        </p>
                      )}
                    </div>
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      )}

      {!loading && !loadError && (
        <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {rangeStart}–{rangeEnd} of {pagination.total} orders
          </p>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="min-w-20 text-center text-sm text-gray-600 dark:text-gray-300">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
