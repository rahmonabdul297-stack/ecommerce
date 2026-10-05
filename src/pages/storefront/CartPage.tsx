import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, AlertTriangle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatPrice } from "@/lib/utils";

export function CartPage() {
  const { cart, loading, error, updateItem, removeItem, clear, refresh } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      await removeItem(itemId);
      showToast("success", "Item removed");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await clear();
      showToast("success", "Cart cleared");
      setConfirmClear(false);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to clear cart");
    } finally {
      setClearing(false);
    }
  };

  const handleQuantityChange = async (itemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await updateItem(itemId, newQty);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to update quantity");
    }
  };

  if (loading && !cart) {
    return (
      <StorefrontLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <FullPageSpinner message="Loading cart…" />
        </div>
      </StorefrontLayout>
    );
  }

  if (error && !cart) {
    return (
      <StorefrontLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <ErrorState message={error} onRetry={refresh} />
        </div>
      </StorefrontLayout>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;

  return (
    <StorefrontLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            message="Browse products and add items to your cart."
            action={
              <Link to="/">
                <Button>Continue shopping</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                    {item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt={item.product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product?._id}`}
                      className="font-medium text-gray-900 hover:text-teal-600 transition-colors line-clamp-1"
                    >
                      {item.product?.title ?? "Product"}
                    </Link>

                    {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {Object.entries(item.selectedAttributes).map(([key, val]) => (
                          <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {key}: {val}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-2 text-sm font-medium text-teal-600">
                      {formatPrice(item.price)}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                          className="p-1.5 text-gray-600 hover:text-gray-900"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                          className="p-1.5 text-gray-600 hover:text-gray-900"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item._id)}
                        disabled={removingId === item._id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setConfirmClear(true)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Clear cart
                </button>
                <Link to="/" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  Continue shopping
                </Link>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-500">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-baseline">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-teal-600">{formatPrice(subtotal)}</span>
                </div>

                <Button
                  size="lg"
                  className="w-full mt-6"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>

               
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={confirmClear}
          title="Clear cart?"
          message="This will remove all items from your cart. This action cannot be undone."
          confirmLabel="Clear cart"
          danger
          loading={clearing}
          onConfirm={handleClear}
          onCancel={() => setConfirmClear(false)}
        />
      </div>
    </StorefrontLayout>
  );
}
