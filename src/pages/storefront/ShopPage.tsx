import { useEffect, useState, useMemo } from "react";
import { Search, ArrowUpDown, Package, Sparkles } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { fetchPublicCategories } from "@/services/categoryService";
import type { Product, Category } from "@/lib/types";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchPublicProducts } from "@/services/productService";
import { ProductCard } from "@/components/store/ProductCard";
// Assuming you have a ProductCard component available in your project

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  type SortOption = "default" | "low-high" | "high-low";
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setCategoryError(null);
    try {
      const [productResult, categoryResult] = await Promise.allSettled([
        fetchPublicProducts(),
        fetchPublicCategories(),
      ]);

      if (productResult.status === "rejected") {
        throw productResult.reason;
      }

      setProducts(productResult.value.products);
      if (categoryResult.status === "fulfilled") {
        setCategories(categoryResult.value.categories);
      } else {
        setCategories([]);
        setCategoryError("Categories are unavailable; showing all products.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load shop catalog.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => {
        const catId =
          typeof p.category === "string" ? p.category : p.category?._id;
        return catId === selectedCategory;
      });
    }

    // Sorting
    if (sortBy === "low-high") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "high-low") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <StorefrontLayout>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full">
                <Sparkles className="h-3.5 w-3.5" /> Full Catalog
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Explore All Products
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover genuine smartphones, fast chargers, power banks, and
                accessories.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                {filteredProducts.length} items available
              </span>
            </div>
          </div>

          {/* Controls Bar: Search, Category Filter, and Price Sort */}
          <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search phones, chargers, earpods, pouches..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-48">
                  <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Sort products by price"
                    className="w-full pl-10 pr-8 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none transition-all cursor-pointer"
                  >
                    <option value="default">Sort by: Featured</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Pills (Horizontal Scrollable) */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none [-ms-overflow-style:none] [&-::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === "all"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-gray-700"
                }`}
              >
                All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                    selectedCategory === cat._id
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {categoryError && (
              <p
                role="status"
                className="text-xs text-amber-700 dark:text-amber-300"
              >
                {categoryError}
              </p>
            )}
          </div>

          {/* States: Loading, Error, Empty, and Product Grid */}
          {loading && <FullPageSpinner message="Loading available products…" />}
          {error && <ErrorState message={error} onRetry={loadData} />}
          {!loading && !error && filteredProducts.length === 0 && (
            <EmptyState
              icon={Package}
              title="No products found"
              message="We couldn't find any items matching your search or category filter."
              action={
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSortBy("default");
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Reset Filters
                </button>
              }
            />
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-1">
              {filteredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} animationIndex={index} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </StorefrontLayout>
  );
}
