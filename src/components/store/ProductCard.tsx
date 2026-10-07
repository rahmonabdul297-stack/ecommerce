import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, effectivePrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export function ProductCard({
  product,
  animationIndex = 0,
}: {
  product: Product;
  animationIndex?: number;
}) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const price = effectivePrice(product.price, product.discountPrice);
  const hasDiscount =
    product.discountPrice != null &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;
  const outOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addItem(product._id, quantity);
      showToast("success", `${quantity} × ${product.title} added to cart`);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Could not add this item to cart",
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <article
      style={{ animationDelay: `${Math.min(animationIndex, 8) * 85}ms` }}
      className="product-card group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-2 hover:rotate-[0.7deg] hover:border-teal-300 hover:shadow-[0_24px_54px_-24px_rgba(13,148,136,0.55)] dark:border-gray-800 dark:bg-gray-900"
    >
      <Link
        to={`/products/${product._id}`}
        aria-label={`View ${product.title}`}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-inset"
      >
        <div className="product-card-image relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.13] group-hover:rotate-2"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}
          {outOfStock && (
            <span className="absolute right-2 top-2 rounded-full bg-gray-900 px-2 py-1 text-xs text-white">
              Out of stock
            </span>
          )}
          {hasDiscount && !outOfStock && (
            <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
              Sale
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4 transition-transform duration-500 group-hover:translate-x-1">
          <p className="mb-1 text-xs font-medium text-teal-600 dark:text-teal-400">
            {product.category?.name ?? "Uncategorized"}
          </p>
          <h3 className="line-clamp-2 font-medium text-gray-900 transition-colors group-hover:text-teal-600 dark:text-gray-100">
            {product.title}
          </h3>

          <div className="mt-auto flex items-baseline gap-2 pt-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="inline-flex h-10 shrink-0 items-center overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={outOfStock || adding || quantity <= 1}
            aria-label={`Decrease ${product.title} quantity`}
            className="inline-flex h-full w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span
            aria-label={`Quantity ${quantity}`}
            aria-live="polite"
            className="min-w-8 text-center text-sm font-semibold text-gray-900 dark:text-gray-100"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity((current) => Math.min(product.stock, current + 1))
            }
            disabled={outOfStock || adding || quantity >= product.stock}
            aria-label={`Increase ${product.title} quantity`}
            className="inline-flex h-full w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock || adding}
          aria-label={`Add ${product.title} to cart`}
          className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 px-2 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 sm:px-3"
        >
          {!outOfStock && <ShoppingCart className="h-4 w-4 shrink-0" />}
          <span className="truncate">
            {adding ? "Adding…" : outOfStock ? "Out of stock" : "Add to cart"}
          </span>
        </button>
      </div>
    </article>
  );
}
