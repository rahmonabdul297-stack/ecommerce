import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import type { Category } from "@/lib/types";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/categoryService";
import { useToast } from "@/context/ToastContext";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InlineError } from "@/components/ui/ErrorState";
import { formatDate } from "@/lib/utils";

interface CatFormState {
  name: string;
  description: string;
  isActive: boolean;
}

export function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CatFormState>({
    name: "",
    description: "",
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data.categories);
      setCount(data.count);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", description: "", isActive: true });
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      isActive: true,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Category name is required");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      };
      if (editingId) {
        await updateCategory(editingId, payload);
        showToast("success", "Category updated");
      } else {
        await createCategory({ ...payload, isActive: form.isActive });
        showToast("success", "Category created");
      }
      setShowModal(false);
      load();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save category",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteId);
      showToast("success", "Category deleted");
      setDeleteId(null);
      load();
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to delete category",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            {count} active categories
          </p>
        </div>
        <Button onClick={openAdd} className="w-full justify-center sm:w-auto">
          <Plus className="h-4 w-4" />
          New category
        </Button>
      </div>

      {loading && <FullPageSpinner message="Loading categories…" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && categories.length === 0 && (
        <EmptyState
          icon={Tag}
          title="No categories"
          message="Create your first category to organize products."
          action={<Button onClick={openAdd}>New category</Button>}
        />
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    Name
                  </th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    Slug
                  </th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    Description
                  </th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    Created
                  </th>
                  <th className="text-right font-medium text-gray-600 px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {cat.description ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(cat.createdAt ?? "")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(cat._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={showModal}
        title={editingId ? "Edit Category" : "New Category"}
        onClose={() => setShowModal(false)}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="form-input min-h-[80px] resize-y"
              placeholder="Optional"
            />
          </div>

          {formError && <InlineError message={formError} />}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {saving ? "Saving…" : editingId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete category?"
        message="This will delete the category. Deletion will fail if products are still using it."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
