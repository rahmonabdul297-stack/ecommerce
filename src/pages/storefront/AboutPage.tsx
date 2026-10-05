import {
  ShoppingBag,
  ShieldCheck,
  Zap,
  Truck,
  MapPin,
  Award,
  Smartphone,
  Headphones,
  BatteryCharging,
  CheckCircle2,
} from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default function AboutPage() {
  return (
    <StorefrontLayout>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-block bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-teal-200 dark:border-teal-800">
              About Nokata
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              Powering Your Digital Life with Premium Mobile Tech
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Your premier destination for high-performance smartphones, heavy-duty power banks, original fast chargers, protective cases, and crystal-clear audio accessories.
            </p>
          </div>

          {/* Featured Brand Banner */}
          <div className="bg-gradient-to-br from-stone-900 via-teal-950 to-gray-900 dark:from-stone-950 dark:via-teal-950 dark:to-stone-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-teal-500/20 shadow-xl">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
              <Smartphone className="h-96 w-96 text-teal-400" />
            </div>
            <div className="max-w-2xl relative z-10 space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="bg-teal-600 rounded-xl p-2.5 shadow-md">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <span className="font-extrabold text-2xl tracking-tight">Nokata Store</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                Built on Trust, Authenticity, and Seamless Shopping
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                At Nokata, we understand that your mobile device is more than just a gadget—it's your connection to work, entertainment, and loved ones. That is why we are committed to stocking only 100% genuine tech gear backed by secure Paystack checkout and swift delivery.
              </p>
              <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold pt-1">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Proudly serving customers across Lagos, Oyo, and Osun State, Nigeria.</span>
              </div>
            </div>
          </div>

          {/* Core Values Grid */}
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Why Choose Nokata?</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">We go above and beyond to guarantee premium satisfaction on every transaction.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 hover:border-teal-500/50 transition-colors">
                <div className="bg-teal-50 dark:bg-teal-950/60 p-3.5 rounded-2xl w-fit text-teal-600 dark:text-teal-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">100% Authentic Gear</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  We source directly from certified manufacturers and trusted distributors to ensure every phone and accessory meets rigorous quality standards.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 hover:border-teal-500/50 transition-colors">
                <div className="bg-teal-50 dark:bg-teal-950/60 p-3.5 rounded-2xl w-fit text-teal-600 dark:text-teal-400">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Fast & Reliable Delivery</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Get your orders delivered promptly to your doorstep with our streamlined logistics network across major Nigerian commercial hubs.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 hover:border-teal-500/50 transition-colors sm:col-span-2 lg:col-span-1">
                <div className="bg-teal-50 dark:bg-teal-950/60 p-3.5 rounded-2xl w-fit text-teal-600 dark:text-teal-400">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Secure Checkout</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Enjoy complete peace of mind with encrypted, industry-standard payment processing powered by Paystack.
                </p>
              </div>
            </div>
          </div>

          {/* Product Offerings Details Section */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 sm:p-12 shadow-sm space-y-8">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">
                Our Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Everything You Need to Keep Your Devices Powered & Protected
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Whether you're upgrading to the latest flagship smartphone or looking for rugged charging solutions, Nokata offers a curated selection of top-tier products.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <div className="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 p-3 rounded-xl w-fit">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base">Smartphones</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Latest high-performance smartphones with industry-leading camera systems and long-lasting batteries.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <div className="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 p-3 rounded-xl w-fit">
                  <BatteryCharging className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base">Power & Chargers</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Ultra-fast wall chargers, GaN adapters, and high-capacity portable power banks for all-day connectivity.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <div className="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 p-3 rounded-xl w-fit">
                  <Headphones className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base">Audio & Earpods</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Crystal-clear wireless earpods, active noise cancellation headsets, and immersive spatial audio gear.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <div className="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 p-3 rounded-xl w-fit">
                  <Award className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base">Cases & Pouches</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Durable silicone pouches, shockproof rugged covers, and MagSafe accessories designed for optimal defense.
                </p>
              </div>
            </div>
          </div>

          {/* Regional Reach & Customer Assurance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                Our Regional Presence
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Headquartered to serve vibrant markets across Nigeria, Nokata specializes in fast regional dispatch. Whether you're ordering from the bustling hubs of Lagos State, Oyo State, or Osun State, our delivery partners ensure your items arrive securely and on schedule.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Lagos State (Island & Mainland express fulfillment)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Oyo State (Ibadan and surrounding tech centers)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Osun State (Prompt doorstep delivery routes)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                The Nokata Guarantee
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                We take immense pride in our customer-first philosophy. Every product listed on our store undergoes rigorous inspection before dispatch. Backed by responsive support channels and secure Paystack transactions, shopping with Nokata is risk-free and reliable.
              </p>
              <div className="pt-2">
                <a
                  href="/shop"
                  className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
                >
                  Explore Our Shop Catalog
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>
    </StorefrontLayout>
  );
}