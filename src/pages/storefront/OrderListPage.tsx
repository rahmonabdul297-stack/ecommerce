import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import type { Order } from "@/lib/types";
import { fetchOrders } from "@/services/orderService";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDate } from "@/lib/utils";

const statusTone: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  pending: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
  paid: "success",
  failed: "error",
};

export function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <StorefrontLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>

        {loading && <FullPageSpinner message="Loading orders…" />}
        {error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && orders.length === 0 && (
          <EmptyState
            icon={Package}
            title="No orders yet"
            message="When you place an order, it will appear here."
            action={<Link to="/"><Button>Browse products</Button></Link>}
          />
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-teal-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={statusTone[order.paymentStatus] ?? "neutral"}>
                      {order.paymentStatus}
                    </Badge>
                    <Badge tone={statusTone[order.orderStatus] ?? "neutral"}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-lg font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}

