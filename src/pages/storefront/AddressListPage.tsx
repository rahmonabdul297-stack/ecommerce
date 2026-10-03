import { useEffect, useState, useCallback } from "react";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import type { Address, AddressListData } from "@/lib/types";
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/services/addressService";
import { useToast } from "@/context/ToastContext";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InlineError } from "@/components/ui/ErrorState";

interface AddressFormState {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  recipientName: string;
  recipientPhone: string;
  isDefault: boolean;
}

const emptyForm: AddressFormState = {
  street: "",
  city: "Lagos",
  state: "Lagos State",
  country: "Nigeria",
  postalCode: "100001",
  recipientName: "",
  recipientPhone: "",
  isDefault: false,
};

export function AddressListPage() {
  const { showToast } = useToast();

  const [data, setData] = useState<AddressListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAddresses();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr._id);
    setForm({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      postalCode: addr.postalCode ?? "",
      recipientName: addr.recipientName ?? "",
      recipientPhone: addr.recipientPhone ?? "",
      isDefault: addr.isDefault ?? false,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.street.trim() || !form.city.trim() || !form.state.trim()) {
      setFormError("Street, city, and state are required");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim() || "Nigeria",
        postalCode: form.postalCode.trim() || undefined,
        recipientName: form.recipientName.trim() || undefined,
        recipientPhone: form.recipientPhone.trim() || undefined,
        isDefault: form.isDefault,
      };
      let updated: Address[];
      if (editingId) {
        updated = await updateAddress(editingId, payload);
      } else {
        updated = await createAddress(payload);
      }
      setData((prev) => prev ? { ...prev, addresses: updated } : prev);
      setShowModal(false);
      showToast("success", editingId ? "Address updated" : "Address added");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const updated = await deleteAddress(deleteId);
      setData((prev) => prev ? { ...prev, addresses: updated } : prev);
      showToast("success", "Address deleted");
      setDeleteId(null);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete address");
    } finally {
      setDeleting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updated = await setDefaultAddress(id);
      setData((prev) => prev ? { ...prev, addresses: updated } : prev);
      showToast("success", "Default address updated");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to set default");
    }
  };

  const addresses = data?.addresses ?? [];

  return (
    <StorefrontLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shipping Addresses</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your delivery locations for swift checkout.</p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add address
          </Button>
        </div>

        {loading && <FullPageSpinner message="Loading addresses…" />}
        {error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && addresses.length === 0 && (
          <EmptyState
            icon={MapPin}
            title="No addresses yet"
            message="Add a shipping address for faster checkout."
            action={<Button onClick={openAdd}>Add address</Button>}
          />
        )}

        {!loading && !error && addresses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-sm ${
                  addr.isDefault ? "border-teal-300 ring-2 ring-teal-500/20 bg-teal-50/20" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-teal-600 shrink-0" />
                    {addr.isDefault && (
                      <span className="text-xs bg-teal-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(addr)}
                      className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                      title="Edit address"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(addr._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="font-semibold text-gray-900">
                  {addr.recipientName && <span>{addr.recipientName}<br /></span>}
                  {addr.street}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {addr.city}, {addr.state}, {addr.country}
                  {addr.postalCode && ` · ${addr.postalCode}`}
                </p>
                {addr.recipientPhone && (
                  <p className="text-sm text-gray-500 mt-1">{addr.recipientPhone}</p>
                )}

                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-semibold uppercase tracking-wider"
                  >
                    <Star className="h-3.5 w-3.5" />
                    Set as default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <Modal
        open={showModal}
        title={editingId ? "Edit Address" : "Add Address"}
        onClose={() => setShowModal(false)}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Recipient name">
              <input type="text" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} className="form-input" placeholder="e.g. Yekini Abdulrahmon" />
            </FormField>
            <FormField label="Recipient phone">
              <input type="text" value={form.recipientPhone} onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })} className="form-input" placeholder="e.g. +234..." />
            </FormField>
          </div>
          <FormField label="Street" required>
            <input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="form-input" placeholder="e.g. 95 Dolphin Estate, Adeniji Adele Road" />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="City" required>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="form-input" placeholder="e.g. Lagos" />
            </FormField>
            <FormField label="State" required>
              <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="form-input" placeholder="e.g. Lagos State" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Country">
              <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="form-input" placeholder="Nigeria" />
            </FormField>
            <FormField label="Postal code">
              <input type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="form-input" placeholder="100001" />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="accent-teal-600 h-4 w-4 rounded"
            />
            Set as default address
          </label>

          {formError && <InlineError message={formError} />}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {saving ? "Saving…" : editingId ? "Update Address" : "Save Address"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete address?"
        message="This will remove the shipping address. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </StorefrontLayout>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}