import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Smartphone,
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import type { Category, ProductsListData } from "@/lib/types";
import { fetchAdminProducts } from "@/services/productService";
import { fetchCategories } from "@/services/categoryService";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StaticCollectionShowcase } from "./productCard";
import { FaArrowRight } from "react-icons/fa";

export function ProductListPage() {
  const [data, setData] = useState<ProductsListData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") ?? "all";

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

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((result) => {
        if (!cancelled) setCategories(result.categories);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const publishedProducts = data?.products.filter((p) => p.isPublished) ?? [];

  // Filter products based on selected category tag if needed
  const filteredProducts = publishedProducts.filter((product) => {
    if (selectedCategory === "all") return true;
    if (typeof product.category === "object" && product.category !== null) {
      return (
        product.category._id === selectedCategory ||
        product.category.slug === selectedCategory
      );
    }
    return String(product.category) === selectedCategory;
  });

  const selectCategory = (categoryId: string) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    if (categoryId === "all") nextSearchParams.delete("category");
    else nextSearchParams.set("category", categoryId);
    setSearchParams(nextSearchParams);
  };

  return (
    <StorefrontLayout>
      {/* Hero Section with Tailored Mobile Tech Image */}
      <section className="relative isolate flex min-h-[420px] items-center overflow-hidden bg-gray-900 text-white md:min-h-[500px]">
        <img
          className="absolute h-full lg:w-[50%] right-0 opacity-50"
          src="/images/generated-image.jpg"
          alt="Smartphones and modern mobile accessories"
        />
        <div className="absolute inset-0 bg-gradient-to-r lg:from-gray-950 lg:via-gray-900/90 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
          <span className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-4 border border-teal-500/30 backdrop-blur-sm">
            <Smartphone className="h-3.5 w-3.5" /> Premium Mobile Gear & Tech
          </span>
          <h1 className="mt-2 max-w-2xl font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
            Power Up Your Mobile Experience
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-300 sm:text-lg">
            Discover authentic smartphones, ultra-fast chargers, durable power
            banks, and crystal-clear earpods. Quality tested and delivered
            straight to your doorstep.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#collection"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-7 py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-teal-900/30 transition-all"
            >
              Explore Collection <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
        <a
          href="#collection"
          aria-label="Scroll to the collection"
          className="absolute bottom-6 right-8 hidden rounded-full border border-white/30 bg-gray-900/60 backdrop-blur-sm p-3 text-white transition-colors hover:bg-teal-600 sm:block"
        >
          <ArrowDown className="h-4 w-4" />
        </a>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <div className="flex items-center gap-4 p-2">
            <div className="bg-teal-50 text-teal-600 p-3 rounded-xl shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                Fast Delivery
              </h4>
              <p className="text-xs text-gray-500">
                Quick dispatch across Lagos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-2">
            <div className="bg-teal-50 text-teal-600 p-3 rounded-xl shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                100% Genuine
              </h4>
              <p className="text-xs text-gray-500">
                Original phones & accessories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-2">
            <div className="bg-teal-50 text-teal-600 p-3 rounded-xl shrink-0">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                Secure Paystack
              </h4>
              <p className="text-xs text-gray-500">Safe & encrypted checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-2">
            <div className="bg-teal-50 text-teal-600 p-3 rounded-xl shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                Warranty Assured
              </h4>
              <p className="text-xs text-gray-500">Tested quality guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Collection Section */}
      <div
        id="collection"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 space-y-6 sm:space-y-8"
      >
        <StaticCollectionShowcase />
        <Link to="/shop" className="flex justify-end hover:text-teal-400 items-center gap-2">
          see more <FaArrowRight/>
        </Link>
      </div>

      {/* About Us Summary Section */}
     <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
  <div className="bg-gradient-to-br from-stone-900 via-teal-950 to-gray-900 dark:from-stone-950 dark:via-teal-950 dark:to-stone-900 text-white rounded-3xl p-6 sm:p-10 lg:p-16 relative overflow-hidden border border-teal-500/20 shadow-xl">
    {/* Decorative background watermark icon */}
    <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 pointer-events-none select-none">
      <Smartphone className="h-72 w-72 sm:h-96 sm:w-96 text-teal-400" />
    </div>

    <div className="max-w-2xl relative z-10 space-y-6">
      <span className="inline-block bg-teal-500/20 text-teal-300 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border border-teal-500/30">
        About Nokata
      </span>

      <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug sm:leading-tight">
        Your Trusted Destination for Mobile Phones & Tech Accessories
      </h2>

      <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
        At Nokata, we know your mobile device is essential to your daily
        life. That's why we curate top-tier smartphones, heavy-duty power
        banks, original fast chargers, protective pouches, and
        crystal-clear earpods. Enjoy seamless shopping and reliable
        delivery right to your door.
      </p>

      {/* Responsive Stats Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2">
        <div className="bg-teal-900/40 backdrop-blur-sm p-3.5 sm:p-4 rounded-2xl border border-teal-800/50 shadow-inner">
          <h4 className="text-lg sm:text-2xl font-bold text-teal-400 tracking-tight">
            100%
          </h4>
          <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1 font-medium">Original Gear</p>
        </div>

        <div className="bg-teal-900/40 backdrop-blur-sm p-3.5 sm:p-4 rounded-2xl border border-teal-800/50 shadow-inner">
          <h4 className="text-lg sm:text-2xl font-bold text-teal-400 tracking-tight">
            Fast
          </h4>
          <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1 font-medium">Lagos Delivery</p>
        </div>

        <div className="bg-teal-900/40 backdrop-blur-sm p-3.5 sm:p-4 rounded-2xl border border-teal-800/50 shadow-inner">
          <h4 className="text-lg sm:text-2xl font-bold text-teal-400 tracking-tight">
            Secure
          </h4>
          <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1 font-medium">Paystack Checkout</p>
        </div>
      </div>
    </div>
  </div>
</section>
    </StorefrontLayout>
  );
}
