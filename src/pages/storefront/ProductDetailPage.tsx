import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Minus, Plus } from "lucide-react";
import { ApiRequestError, type Product } from "@/lib/types";
import { fetchPublicProductById } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, effectivePrice } from "@/lib/utils";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const p = await fetchPublicProductById(id);
      setProduct(p);
    } catch (err) {
      setError(
        err instanceof ApiRequestError && err.status === 404
          ? "Product not found or no longer available."
          : err instanceof Error
            ? err.message
            : "Failed to load product",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addItem(product._id, quantity);
      showToast("success", "Added to cart");
      navigate("/cart");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to add to cart",
      );
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <FullPageSpinner message="Loading product…" />
        </div>
      </StorefrontLayout>
    );
  }

  if (error) {
    return (
      <StorefrontLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ErrorState message={error} onRetry={load} />
        </div>
      </StorefrontLayout>
    );
  }

  if (!product) return null;

  const price = effectivePrice(product.price, product.discountPrice);
  const hasDiscount =
    product.discountPrice != null &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;
  const outOfStock = product.stock <= 0;

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
              {product.images?.[activeImage]?.url ? (
                <img
                  src={product.images[activeImage].url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ShoppingCart className="h-16 w-16" />
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={img.public_id}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                      idx === activeImage
                        ? "border-teal-600"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Badge tone="info">
                {product.category?.name ?? "Uncategorized"}
              </Badge>
              {outOfStock ? (
                <Badge tone="error">Out of stock</Badge>
              ) : product.stock <= 5 ? (
                <Badge tone="warning">Only {product.stock} left</Badge>
              ) : (
                <Badge tone="success">In stock</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              {product.title}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-teal-600">
                {formatPrice(price)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <div className="mt-6 prose prose-sm max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock || 99, q + 1))
                  }
                  className="p-2.5 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                  disabled={quantity >= (product.stock || 99)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                loading={adding}
                disabled={outOfStock}
                className="flex-1"
              >
                <ShoppingCart className="h-5 w-5" />
                {outOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
