import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Upload, X, AlertTriangle, Loader2 } from "lucide-react";
import type { Product, Category, ProductImage } from "@/lib/types";
import {
  fetchAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteProductImage,
  togglePublishProduct,
} from "@/services/productService";
import { fetchCategories } from "@/services/categoryService";
import { useToast } from "@/context/ToastContext";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { InlineError } from "@/components/ui/ErrorState";

const MAX_IMAGES = 5;

interface FormState {
  title: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  category: string;
  isPublished: boolean;
}

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "",
    category: "",
    isPublished: false,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialPublished, setInitialPublished] = useState<boolean | null>(
    null,
  );
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [imagesToKeep, setImagesToKeep] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const catData = await fetchCategories();
      setCategories(catData.categories);

      if (isEdit && id) {
        const product = await fetchAdminProductById(id);
        setInitialPublished(product.isPublished);
        setForm({
          title: product.title,
          description: product.description,
          price: String(product.price),
          discountPrice:
            product.discountPrice != null ? String(product.discountPrice) : "",
          stock: String(product.stock),
          category: product.category?._id ?? "",
          isPublished: product.isPublished,
        });
        setExistingImages(product.images ?? []);
        setImagesToKeep(product.images?.map((img) => img.public_id) ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [id, isEdit]);

  useEffect(() => {
    load();
  }, [load]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - imagesToKeep.length - newImages.length;
    const toAdd = files.slice(0, remaining);
    if (toAdd.length < files.length) {
      showToast(
        "info",
        `Only ${toAdd.length} image(s) can be added (max ${MAX_IMAGES} total)`,
      );
    }
    setNewImages((prev) => [...prev, ...toAdd]);
    setImagePreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeNewImage = (idx: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExistingImage = async (publicId: string) => {
    // For edit mode, remove via API if product is saved
    if (isEdit && id) {
      try {
        const updatedImages = await deleteProductImage(id, publicId);
        setExistingImages(updatedImages);
        setImagesToKeep((prev) => prev.filter((pid) => pid !== publicId));
        showToast("success", "Image removed");
      } catch (err) {
        showToast(
          "error",
          err instanceof Error ? err.message : "Failed to remove image",
        );
      }
    } else {
      setImagesToKeep((prev) => prev.filter((pid) => pid !== publicId));
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.description.trim())
      errors.description = "Description is required";
    if (
      !form.price.trim() ||
      isNaN(Number(form.price)) ||
      Number(form.price) < 0
    )
      errors.price = "Valid price is required";
    if (!form.category) errors.category = "Category is required";
    if (
      form.discountPrice &&
      (isNaN(Number(form.discountPrice)) || Number(form.discountPrice) < 0)
    )
      errors.discountPrice = "Discount price must be a valid number";
    if (form.stock && (isNaN(Number(form.stock)) || Number(form.stock) < 0))
      errors.stock = "Stock must be a valid number";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("price", form.price);
      formData.append("category", form.category);
      if (form.discountPrice)
        formData.append("discountPrice", form.discountPrice);
      if (form.stock) formData.append("stock", form.stock);

      // BACKEND CAVEAT: Boolean("false") === true, so only send isPublished when true.
      // To unpublish, use the toggle-publish endpoint instead.
      if (!isEdit && form.isPublished) {
        formData.append("isPublished", "true");
      }

      if (isEdit && id) {
        formData.append("imagesToKeep", JSON.stringify(imagesToKeep));
        newImages.forEach((file) => formData.append("images", file));
        await updateAdminProduct(id, formData);
        if (
          initialPublished !== null &&
          form.isPublished !== initialPublished
        ) {
          await togglePublishProduct(id);
          setInitialPublished(form.isPublished);
        }
        showToast("success", "Product updated");
      } else {
        newImages.forEach((file) => formData.append("images", file));
        await createAdminProduct(formData);
        showToast("success", "Product created");
      }
      navigate("/admin/products");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to save product",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <FullPageSpinner message="Loading product…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  const totalImages = imagesToKeep.length + newImages.length;

  return (
    <div className="w-full max-w-3xl p-4 sm:p-6 lg:p-8">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? "Edit Product" : "New Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Title" required error={formErrors.title}>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="form-input"
            placeholder="Product title"
          />
        </FormField>

        <FormField label="Description" required error={formErrors.description}>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="form-input min-h-[120px] resize-y"
            placeholder="Product description"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Price" required error={formErrors.price}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="form-input"
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Discount price" error={formErrors.discountPrice}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.discountPrice}
              onChange={(e) =>
                setForm({ ...form, discountPrice: e.target.value })
              }
              className="form-input"
              placeholder="Optional"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Category" required error={formErrors.category}>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="form-input"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Stock" error={formErrors.stock}>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="form-input"
              placeholder="0"
            />
          </FormField>
        </div>

        {/* Image management */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images (max {MAX_IMAGES})
          </label>

          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {existingImages.map((img) => (
                <div
                  key={img.public_id}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.public_id)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {imagePreviews.map((src, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group"
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalImages < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors text-sm w-full justify-center"
            >
              <Upload className="h-4 w-4" />
              Upload images ({totalImages}/{MAX_IMAGES})
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Publish toggle */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
              className="h-5 w-5 accent-teal-600"
            />
            <span className="text-sm font-medium text-gray-700">Published</span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
          <Link to="/admin/products" className="w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center sm:w-auto"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            loading={saving}
            className="w-full justify-center sm:w-auto"
          >
            {saving ? "Saving…" : isEdit ? "Update product" : "Create product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
