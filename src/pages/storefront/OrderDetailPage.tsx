import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, XCircle } from "lucide-react";
import type { Order } from "@/lib/types";
import { fetchOrderById, cancelOrder } from "@/services/orderService";
import { initializePayment } from "@/services/paymentService";
import { useToast } from "@/context/ToastContext";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatPrice, formatDateTime } from "@/lib/utils";

const statusTone: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  pending: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
  paid: "success",
  failed: "error",
};

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const canCancel = order && !["shipped", "delivered", "cancelled"].includes(order.orderStatus);

  const handleCancel = async () => {
    if (!orderId) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(orderId);
      setOrder(updated);
      showToast("success", "Order cancelled");
      setShowCancel(false);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const payData = await initializePayment({ orderId: order._id });
      window.location.href = payData.authorizationUrl;
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Payment initialization failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <FullPageSpinner message="Loading order…" />
        </div>
      </StorefrontLayout>
    );
  }

  if (error) {
    return (
      <StorefrontLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ErrorState message={error} onRetry={load} />
        </div>
      </StorefrontLayout>
    );
  }

  if (!order) return null;

  return (
    <StorefrontLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-500 mt-1">{formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={statusTone[order.paymentStatus] ?? "neutral"}>{order.paymentStatus}</Badge>
            <Badge tone={statusTone[order.orderStatus] ?? "neutral"}>{order.orderStatus}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.image} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} · {formatPrice(item.price)}</p>
                    </div>
                    <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {order.shippingAddress && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Shipping Address</h2>
                <p className="text-gray-600 text-sm">
                  {order.shippingAddress.recipientName && <span>{order.shippingAddress.recipientName}<br /></span>}
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country}
                  {order.shippingAddress.postalCode && ` · ${order.shippingAddress.postalCode}`}
                  {order.shippingAddress.recipientPhone && <><br />{order.shippingAddress.recipientPhone}</>}
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="text-lg font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
                </div>
                {order.paymentReference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference</span>
                    <span className="text-gray-500 text-xs">{order.paymentReference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated</span>
                  <span className="text-gray-500 text-xs">{formatDateTime(order.updatedAt)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {order.paymentStatus === "pending" && (
                  <Button className="w-full" onClick={handlePay} loading={paying}>
                    <CreditCard className="h-4 w-4" />
                    Pay now
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCancel(true)}
                    disabled={cancelling}
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <ConfirmDialog
          open={showCancel}
          title="Cancel order?"
          message="Are you sure you want to cancel this order? Shipped and delivered orders cannot be cancelled."
          confirmLabel="Cancel order"
          danger
          loading={cancelling}
          onConfirm={handleCancel}
          onCancel={() => setShowCancel(false)}
        />
      </div>
    </StorefrontLayout>
  );
}
