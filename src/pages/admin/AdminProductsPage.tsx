import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, EyeOff, Eye, AlertTriangle } from "lucide-react";
import type { ProductsListData } from "@/lib/types";
import {
  fetchAdminProducts,
  deleteAdminProduct,
  togglePublishProduct,
} from "@/services/productService";
import { useToast } from "@/context/ToastContext";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatPrice, formatDate, effectivePrice } from "@/lib/utils";

export function AdminProductsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<ProductsListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminProducts();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAdminProduct(deleteId);
      setData((prev) =>
        prev
          ? {
              ...prev,
              count: prev.count - 1,
              products: prev.products.filter((p) => p._id !== deleteId),
            }
          : prev,
      );
      showToast("success", "Product deleted");
      setDeleteId(null);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to delete product",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (id: string) => {
    setTogglingId(id);
    try {
      const isPublished = await togglePublishProduct(id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              products: prev.products.map((p) =>
                p._id === id ? { ...p, isPublished } : p,
              ),
            }
          : prev,
      );
      showToast(
        "success",
        isPublished ? "Product published" : "Product unpublished",
      );
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to toggle publish",
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.count ?? 0} total products
          </p>
        </div>
        <Link to="/admin/products/new" className="w-full sm:w-auto">
          <Button className="w-full justify-center sm:w-auto">
            <Plus className="h-4 w-4" />
            New product
          </Button>
        </Link>
      </div>

      {loading && <FullPageSpinner message="Loading products…" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && data && data.products.length === 0 && (
        <EmptyState
          title="No products"
          message="Create your first product to get started."
          action={
            <Link to="/admin/products/new">
              <Button>New product</Button>
            </Link>
          }
        />
      )}

      {!loading && !error && data && data.products.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    Product
                  </th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    Category
                  </th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    Price
                  </th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    Stock
                  </th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    Status
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
                {data.products.map((product) => {
                  const price = effectivePrice(
                    product.price,
                    product.discountPrice,
                  );
                  return (
                    <tr key={product._id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {product.title}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.category?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatPrice(price)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            product.stock <= 0
                              ? "text-red-600"
                              : product.stock <= 5
                                ? "text-amber-600"
                                : "text-gray-600"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {product.isPublished ? (
                          <Badge tone="success">Published</Badge>
                        ) : (
                          <Badge tone="neutral">Draft</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {formatDate(product.createdAt ?? "")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleTogglePublish(product._id)}
                            disabled={togglingId === product._id}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
                            title={
                              product.isPublished ? "Unpublish" : "Publish"
                            }
                          >
                            {product.isPublished ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(product._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete product?"
        message="This will permanently delete the product and its images. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
