import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, effectivePrice } from "@/lib/utils";

export function ProductCard({
  product,
  animationIndex = 0,
}: {
  product: Product;
  animationIndex?: number;
}) {
  const price = effectivePrice(product.price, product.discountPrice);
  const hasDiscount =
    product.discountPrice != null &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;
  const outOfStock = product.stock <= 0;

  return (
    <Link
      to={`/products/${product._id}`}
      style={{ animationDelay: `${Math.min(animationIndex, 8) * 85}ms` }}
      className="product-card group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-2 hover:rotate-[0.7deg] hover:border-teal-300 hover:shadow-[0_24px_54px_-24px_rgba(13,148,136,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
    >
      <div className="product-card-image relative aspect-square overflow-hidden bg-gray-50">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.13] group-hover:rotate-2"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}
        {outOfStock && (
          <div className="absolute top-2 right-2">
            <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
              Out of stock
            </span>
          </div>
        )}
        {hasDiscount && !outOfStock && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Sale
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 transition-transform duration-500 group-hover:translate-x-1">
        <p className="mb-1 text-xs font-medium text-teal-600">
          {product.category?.name ?? "Uncategorized"}
        </p>
        <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
          {product.title}
        </h3>

        <div className="mt-auto pt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
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
  );
}
