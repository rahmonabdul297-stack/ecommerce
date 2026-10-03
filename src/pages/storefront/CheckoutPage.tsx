import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { getAddresses, createAddress, setDefaultAddress } from "@/services/addressService";
import { checkout } from "@/services/orderService";
import { initializePayment } from "@/services/paymentService";
import type { Address } from "@/lib/types";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { InlineError } from "@/components/ui/ErrorState";
import { formatPrice } from "@/lib/utils";
import { ApiRequestError } from "@/lib/types";

export function CheckoutPage() {
  const { cart, loading: cartLoading } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // New address form
  const [newAddr, setNewAddr] = useState({ street: "", city: "", state: "", country: "Nigeria", postalCode: "", recipientName: "", recipientPhone: "" });
  const [addrFormError, setAddrFormError] = useState<string | null>(null);
  const [savingAddr, setSavingAddr] = useState(false);

  const loadAddresses = useCallback(async () => {
    setAddrLoading(true);
    setAddrError(null);
    try {
      const data = await getAddresses();
      setAddresses(data.addresses);
      const defaultAddr = data.addresses.find((a) => a.isDefault) ?? data.addresses[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
    } catch (err) {
      setAddrError(err instanceof Error ? err.message : "Failed to load addresses");
    } finally {
      setAddrLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleSaveAddress = async () => {
    if (!newAddr.street.trim() || !newAddr.city.trim() || !newAddr.state.trim()) {
      setAddrFormError("Street, city, and state are required");
      return;
    }
    setSavingAddr(true);
    setAddrFormError(null);
    try {
      const updated = await createAddress({
        street: newAddr.street.trim(),
        city: newAddr.city.trim(),
        state: newAddr.state.trim(),
        country: newAddr.country.trim() || "Nigeria",
        postalCode: newAddr.postalCode.trim() || undefined,
        recipientName: newAddr.recipientName.trim() || undefined,
        recipientPhone: newAddr.recipientPhone.trim() || undefined,
        isDefault: addresses.length === 0,
      });
      setAddresses(updated);
      const newDefault = updated.find((a) => a.isDefault) ?? updated[updated.length - 1];
      if (newDefault) setSelectedAddressId(newDefault._id);
      setShowAddModal(false);
      setNewAddr({ street: "", city: "", state: "", country: "Nigeria", postalCode: "", recipientName: "", recipientPhone: "" });
      showToast("success", "Address added");
    } catch (err) {
      setAddrFormError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSavingAddr(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updated = await setDefaultAddress(id);
      setAddresses(updated);
      setSelectedAddressId(id);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to set default address");
    }
  };

  const handleCheckout = async () => {
    if (!cart?._id) {
      showToast("error", "Cart not loaded");
      return;
    }
    if (!selectedAddressId) {
      showToast("error", "Please select a shipping address");
      return;
    }
    setProcessing(true);
    try {
      const order = await checkout({ cartId: cart._id, addressId: selectedAddressId });
      showToast("success", "Order placed");

      // Initialize Paystack payment
      try {
        const payData = await initializePayment({ orderId: order._id });
        window.location.href = payData.authorizationUrl;
      } catch (payErr) {
        // Order created but payment init failed — redirect to order detail
        showToast("error", "Order placed but payment initialization failed. You can retry payment from the order page.");
        navigate(`/orders/${order._id}`);
      }
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : err instanceof Error ? err.message : "Checkout failed";
      showToast("error", msg);
    } finally {
      setProcessing(false);
    }
  };

  if (cartLoading && !cart) {
    return (
      <StorefrontLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <FullPageSpinner message="Loading checkout…" />
        </div>
      </StorefrontLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <StorefrontLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <EmptyState
            title="Your cart is empty"
            message="Add items before checking out."
            action={<Link to="/"><Button>Browse products</Button></Link>}
          />
        </div>
      </StorefrontLayout>
    );
  }

  const subtotal = cart.subtotal ?? 0;

  return (
    <StorefrontLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address selection */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
                  + Add address
                </Button>
              </div>

              {addrLoading && <FullPageSpinner message="Loading addresses…" />}
              {addrError && <ErrorState message={addrError} onRetry={loadAddresses} />}
              {!addrLoading && !addrError && addresses.length === 0 && (
                <EmptyState
                  icon={MapPin}
                  title="No addresses yet"
                  message="Add a shipping address to proceed."
                  action={<Button onClick={() => setShowAddModal(true)}>Add address</Button>}
                />
              )}

              {!addrLoading && !addrError && addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        selectedAddressId === addr._id
                          ? "border-teal-600 bg-teal-50/50 ring-1 ring-teal-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                        className="mt-1 accent-teal-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {addr.recipientName && <span>{addr.recipientName} · </span>}
                          {addr.street}
                        </p>
                        <p className="text-sm text-gray-500">
                          {addr.city}, {addr.state}, {addr.country}
                          {addr.postalCode && ` · ${addr.postalCode}`}
                        </p>
                        {addr.recipientPhone && (
                          <p className="text-sm text-gray-500">{addr.recipientPhone}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          {addr.isDefault && (
                            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">Default</span>
                          )}
                          {!addr.isDefault && (
                            <button
                              onClick={(e) => { e.preventDefault(); handleSetDefault(addr._id); }}
                              className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                            >
                              Set as default
                            </button>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Order items */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      {item.product?.images?.[0]?.url ? (
                        <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-1">{item.product?.title}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} · {formatPrice(item.price)}</p>
                    </div>
                    <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-baseline">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-teal-600">{formatPrice(subtotal)}</span>
              </div>
              <Button
                size="lg"
                className="w-full mt-6"
                onClick={handleCheckout}
                loading={processing}
                disabled={!selectedAddressId}
              >
                {processing ? "Processing…" : "Place Order & Pay"}
              </Button>
              <p className="text-xs text-gray-400 mt-3 text-center">
                You will be redirected to Paystack to complete payment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add address modal */}
      <Modal open={showAddModal} title="Add Shipping Address" onClose={() => setShowAddModal(false)} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Recipient name">
              <input
                type="text"
                value={newAddr.recipientName}
                onChange={(e) => setNewAddr({ ...newAddr, recipientName: e.target.value })}
                className="form-input"
              />
            </FormField>
            <FormField label="Recipient phone">
              <input
                type="text"
                value={newAddr.recipientPhone}
                onChange={(e) => setNewAddr({ ...newAddr, recipientPhone: e.target.value })}
                className="form-input"
              />
            </FormField>
          </div>
          <FormField label="Street" required>
            <input
              type="text"
              value={newAddr.street}
              onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
              className="form-input"
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="City" required>
              <input
                type="text"
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="form-input"
              />
            </FormField>
            <FormField label="State" required>
              <input
                type="text"
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="form-input"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Country">
              <input
                type="text"
                value={newAddr.country}
                onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                className="form-input"
              />
            </FormField>
            <FormField label="Postal code">
              <input
                type="text"
                value={newAddr.postalCode}
                onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                className="form-input"
              />
            </FormField>
          </div>

          {addrFormError && <InlineError message={addrFormError} />}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleSaveAddress} loading={savingAddr}>
              {savingAddr ? "Saving…" : "Save address"}
            </Button>
          </div>
        </div>
      </Modal>
    </StorefrontLayout>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
