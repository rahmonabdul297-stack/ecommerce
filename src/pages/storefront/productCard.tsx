import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Zap } from "lucide-react";

// Static showcase items array
const showcaseProducts = [
  {
    _id: "showcase-1",
    name: "iPhone 15 Pro Max - Titanium Edition",
    price: 1150000,
    compareAtPrice: 1280000,
    category: "Smartphones",
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    description:
      "Grade-A Titanium build with ProMotion display and lightning-fast A17 Pro chip.",
    rating: 4.9,
  },
  {
    _id: "showcase-3",
    name: "Apple AirPods Pro (2nd Gen) Active Noise Cancelling",
    price: 185000,
    compareAtPrice: 210000,
    category: "Audio & Earpods",
    image:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
    description:
      "Immersive spatial audio with adaptive transparency and all-day battery life.",
    rating: 4.9,
  },
  {
    _id: "showcase-4",
    name: "Samsung Galaxy S24 Ultra AI Smartphone",
    price: 1050000,
    compareAtPrice: 1150000,
    category: "Smartphones",
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
    description:
      "Built-in S-Pen with cutting-edge AI photography features and titanium armor.",
    rating: 4.7,
  },
  {
    _id: "showcase-5",
    name: "MagSafe Silicone Protective Pouch & Case",
    price: 15000,
    compareAtPrice: 20000,
    category: "Cases & Pouches",
    image:
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80",
    description:
      "Silky, soft-touch exterior finish with microfiber lining and magnetic alignment.",
    rating: 4.6,
  },
  {
    _id: "showcase-6",
    name: "65W GaN Fast Wall Charger Adapter",
    price: 25000,
    compareAtPrice: 32000,
    category: "Power & Chargers",
    image:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    description:
      "Ultra-compact multi-port wall charger for lightning-fast laptop and phone power.",
    rating: 4.8,
  },
];

export function StaticCollectionShowcase() {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0);
  const mobileSliderRef = useRef<HTMLDivElement>(null);

  // Automatically cycle/slide items into the featured card every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setFeaturedIndex((prev) => (prev + 1) % showcaseProducts.length);
        setIsTransitioning(false);
      }, 300); // match fade duration
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const featuredProduct = showcaseProducts[featuredIndex];
  // Get the other products to display in the grid
  const gridProducts = showcaseProducts.filter((_, i) => i !== featuredIndex);

  const goToMobileSlide = (index: number) => {
    const nextIndex =
      (index + showcaseProducts.length) % showcaseProducts.length;
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
          showcaseProducts.length - 1,
          Math.round(slider.scrollLeft / slidePitch),
        ),
      );
    }
  };

  return (
    <div
      id="collection"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 space-y-6 sm:space-y-8 select-none"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-gray-200 pb-4 sm:pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
            The Mobile Catalog Showcase
          </span>
          <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            Explore Available Products
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Handpicked mobile phones, chargers, power banks, earpods, pouches,
            and accessories.
          </p>
        </div>
        <span className="text-xs sm:text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm self-start sm:self-auto">
          {showcaseProducts.length} items showcased
        </span>
      </div>

      {/* Mobile-only swipeable product slides */}
      <section className="md:hidden" aria-label="Featured products carousel">
        <div
          ref={mobileSliderRef}
          onScroll={updateMobileSlideIndex}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carousel"
        >
          {showcaseProducts.map((product, index) => (
            <article
              key={product._id}
              className="w-[84%] max-w-sm shrink-0 snap-start overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
              aria-label={`${index + 1} of ${showcaseProducts.length}: ${product.name}`}
            >
              <div className="relative flex h-56 items-center justify-center bg-gray-50 p-5 dark:bg-gray-800">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
                <span className="absolute left-3 top-3 rounded-full bg-teal-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {product.category}
                </span>
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm dark:bg-gray-900/90 dark:text-gray-100">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {product.rating}
                </span>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 min-h-12 text-base font-bold text-gray-900 dark:text-gray-100">
                  {product.name}
                </h3>
                <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {product.description}
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-teal-700 dark:text-teal-400">
                    ₦{product.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ₦{product.compareAtPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </article>
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
            {showcaseProducts.map((product, index) => (
              <button
                key={product._id}
                type="button"
                onClick={() => goToMobileSlide(index)}
                aria-label={`Go to slide ${index + 1}: ${product.name}`}
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
      </section>

      {/* Asymmetric desktop showcase grid */}
      <div className="hidden grid-cols-1 gap-4 md:grid lg:grid-cols-4 sm:gap-6">
        {/* Prominent Featured Card (Left / Span 2) */}
        <div className="lg:col-span-2 lg:row-span-2 bg-gradient-to-br  rounded-3xl border border-teal-100 p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-4 right-4 z-10 bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
            <Zap className="h-3 w-3 fill-current" /> Featured Spotlight
          </div>

          <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-white shadow-inner mb-6 flex items-center justify-center p-4">
            <img
              src={featuredProduct.image}
              alt={featuredProduct.name}
              className={`h-full w-full object-contain transition-all duration-500 transform ${
                isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            />
          </div>

          <div
            className={`space-y-3 transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-teal-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                {featuredProduct.category}
              </span>
              <div className="flex items-center gap-1 text-amber-600">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{featuredProduct.rating}</span>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {featuredProduct.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {featuredProduct.description}
            </p>
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-2xl font-extrabold text-teal-700">
                ₦{featuredProduct.price.toLocaleString()}
              </span>
              {featuredProduct.compareAtPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ₦{featuredProduct.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Smaller Sliding Showcase Grid Items */}
        {gridProducts.map((product) => (
          <div
            key={product._id}
            onClick={() => {
              // Click handler disabled to prevent navigation
            }}
            className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between transition-all duration-300 hover:border-teal-300 hover:shadow-md cursor-default"
          >
            <div className="relative h-40 w-full rounded-xl overflow-hidden bg-gray-50 mb-4 flex items-center justify-center p-2">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                {product.category}
              </span>
              <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                {product.name}
              </h4>
              <div className="flex items-center justify-between pt-1">
                <span className="text-base font-bold text-gray-900">
                  ₦{product.price.toLocaleString()}
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{product.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
