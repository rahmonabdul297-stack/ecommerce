import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/lib/types";
import { effectivePrice, formatPrice } from "@/lib/utils";

export function ProductShowcase({ products }: { products: Product[] }) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0);
  const mobileSliderRef = useRef<HTMLDivElement>(null);
  const productKey = products.map((product) => product._id).join("|");

  useEffect(() => {
    setFeaturedIndex(0);
    setMobileSlideIndex(0);
    mobileSliderRef.current?.scrollTo({ left: 0 });
  }, [productKey]);

  useEffect(() => {
    if (products.length < 2) return;

    let transitionTimeout: number | undefined;
    const interval = window.setInterval(() => {
      setIsTransitioning(true);
      transitionTimeout = window.setTimeout(() => {
        setFeaturedIndex((current) => (current + 1) % products.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => {
      window.clearInterval(interval);
      if (transitionTimeout !== undefined) {
        window.clearTimeout(transitionTimeout);
      }
    };
  }, [products.length]);

  const featuredProduct = products[featuredIndex];
  const otherProducts = products.filter((_, index) => index !== featuredIndex);

  const goToMobileSlide = (index: number) => {
    const nextIndex = (index + products.length) % products.length;
    setMobileSlideIndex(nextIndex);
    mobileSliderRef.current?.children[nextIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  const updateMobileSlideIndex = () => {
    const slider = mobileSliderRef.current;
    const firstSlide = slider?.children[0] as HTMLElement | undefined;
    if (!slider || !firstSlide) return;

    const gap = Number.parseFloat(getComputedStyle(slider).columnGap) || 0;
    const slidePitch = firstSlide.getBoundingClientRect().width + gap;
    if (slidePitch > 0) {
      setMobileSlideIndex(
        Math.min(
          products.length - 1,
          Math.round(slider.scrollLeft / slidePitch),
        ),
      );
    }
  };

  const productImage = (product: Product) => product.images?.[0]?.url;
  const productCategory = (product: Product) =>
    typeof product.category === "object" && product.category
      ? product.category.name
      : "Accessories";

  return (
    <section
      className="space-y-6 sm:space-y-8"
      aria-labelledby="showcase-title"
    >
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:pb-5 dark:border-gray-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
            The Mobile Catalog Showcase
          </span>
          <h2
            id="showcase-title"
            className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white"
          >
            Explore Available Products
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Handpicked phones, chargers, power banks, earpods, and accessories.
          </p>
        </div>
        <span className="self-start rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 shadow-sm sm:self-auto sm:text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          {products.length} products
        </span>
      </div>

      <div className="md:hidden" aria-label="Product carousel">
        <div
          ref={mobileSliderRef}
          onScroll={updateMobileSlideIndex}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carousel"
        >
          {products.map((product, index) => (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              className="w-[84%] max-w-sm shrink-0 snap-start overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
              aria-label={`${index + 1} of ${products.length}: ${product.title}`}
            >
              <div className="relative flex h-56 items-center justify-center bg-gray-50 p-5 dark:bg-gray-800">
                {productImage(product) ? (
                  <img
                    src={productImage(product)}
                    alt={product.title}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <ShoppingCart className="h-12 w-12 text-gray-300" />
                )}
                <span className="absolute left-3 top-3 rounded-full bg-teal-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {productCategory(product)}
                </span>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 min-h-12 text-base font-bold text-gray-900 dark:text-gray-100">
                  {product.title}
                </h3>
                <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {product.description}
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-teal-700 dark:text-teal-400">
                    {formatPrice(
                      effectivePrice(product.price, product.discountPrice),
                    )}
                  </span>
                  {product.discountPrice != null &&
                    product.discountPrice < product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => goToMobileSlide(mobileSlideIndex - 1)}
            aria-label="Previous product"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-teal-500 hover:text-teal-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div
            className="flex items-center gap-2"
            aria-label="Choose a product slide"
          >
            {products.map((product, index) => (
              <button
                key={product._id}
                type="button"
                onClick={() => goToMobileSlide(index)}
                aria-label={`Go to slide ${index + 1}: ${product.title}`}
                aria-current={mobileSlideIndex === index ? "true" : undefined}
                className={`h-2 rounded-full transition-all ${
                  mobileSlideIndex === index
                    ? "w-6 bg-teal-600"
                    : "w-2 bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goToMobileSlide(mobileSlideIndex + 1)}
            aria-label="Next product"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-teal-500 hover:text-teal-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {featuredProduct && (
        <div className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          <Link
            to={`/products/${featuredProduct._id}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/50 to-white p-5 shadow-sm transition-shadow hover:shadow-lg dark:border-teal-900 dark:from-gray-900 dark:to-gray-900 sm:p-8 md:col-span-2 lg:row-span-2"
          >
            <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-teal-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
              <Zap className="h-3 w-3 fill-current" /> Featured
            </span>
            <div className="mb-6 flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-4 shadow-inner dark:bg-gray-800 sm:h-80">
              {productImage(featuredProduct) ? (
                <img
                  src={productImage(featuredProduct)}
                  alt={featuredProduct.title}
                  className={`h-full w-full object-contain transition-all duration-500 ${isTransitioning ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
                />
              ) : (
                <ShoppingCart className="h-16 w-16 text-gray-300" />
              )}
            </div>
            <div
              className={`space-y-3 transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            >
              <span className="inline-block rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                {productCategory(featuredProduct)}
              </span>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-teal-700 dark:text-white sm:text-2xl">
                {featuredProduct.title}
              </h3>
              <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                {featuredProduct.description}
              </p>
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl font-extrabold text-teal-700 dark:text-teal-400">
                  {formatPrice(
                    effectivePrice(
                      featuredProduct.price,
                      featuredProduct.discountPrice,
                    ),
                  )}
                </span>
                {featuredProduct.discountPrice != null &&
                  featuredProduct.discountPrice < featuredProduct.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(featuredProduct.price)}
                    </span>
                  )}
              </div>
            </div>
          </Link>

          {otherProducts.map((product) => (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              className="flex min-w-0 flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-teal-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 sm:p-5"
            >
              <div className="mb-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-2 dark:bg-gray-800">
                {productImage(product) ? (
                  <img
                    src={productImage(product)}
                    alt={product.title}
                    className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <ShoppingCart className="h-10 w-10 text-gray-300" />
                )}
              </div>
              <div className="space-y-2">
                <span className="inline-block rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  {productCategory(product)}
                </span>
                <h4 className="line-clamp-2 min-h-10 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {product.title}
                </h4>
                <span className="block pt-1 text-base font-bold text-gray-900 dark:text-white">
                  {formatPrice(
                    effectivePrice(product.price, product.discountPrice),
                  )}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
