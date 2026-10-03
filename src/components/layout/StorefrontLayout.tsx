import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ShoppingCart,
  ShoppingBag,
  UserRound,
  MapPin,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getMyProfile, type UserProfile } from "@/services/profileService";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { fetchCategories } from "@/services/categoryService";
import type { Category } from "@/lib/types";

function CategoryDropdown({
  categories,
  id,
  onSelect,
}: {
  categories: Category[];
  id: string;
  onSelect?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    onSelect?.();
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-teal-600 dark:text-gray-300"
      >
        Collection
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id={id}
          className="absolute left-0 top-full z-50 mt-3 max-h-72 min-w-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        >
          <Link
            to="/#collection"
            onClick={close}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-teal-50 hover:text-teal-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            All products
          </Link>
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category._id}
                to={`/?category=${encodeURIComponent(category._id)}#collection`}
                onClick={close}
                className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-teal-50 hover:text-teal-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {category.name}
              </Link>
            ))
          ) : (
            <p className="px-3 py-2 text-xs text-gray-500">
              No categories available
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function StorefrontHeader() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is signed in and load profile picture / auth state
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const profile = await getMyProfile();
        if (profile && (profile.email || profile.name)) {
          setUserProfile(profile);
        }
      } catch {
        setUserProfile(null); // Not authenticated
      }
    };
    checkUserAuth();
  }, []);

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

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (userProfile) {
      navigate("/profile");
    } else {
      navigate("/auth");
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-teal-600 font-semibold" : "text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-teal-600 rounded-xl p-2 shadow-md shadow-teal-900/20">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
              Nokata
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About us
            </NavLink>
            <NavLink to="/shop" className={linkClass}>
              Shop
            </NavLink>
            <CategoryDropdown
              categories={categories}
              id="desktop-category-menu"
            />
          </nav>

          {/* Actions (Theme toggle, Cart, Profile, Mobile Menu Toggle) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {/* Shopping Cart Icon */}
            <Link
              to="/cart"
              className="relative inline-flex items-center justify-center p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Smart User Profile Icon / Avatar */}
            <button
              onClick={handleProfileClick}
              aria-label="User Account"
              title={userProfile ? "View Profile" : "Sign In / Register"}
              className="relative flex items-center justify-center p-1 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {userProfile?.profileImage ? (
                <img
                  src={userProfile.profileImage}
                  alt={userProfile.name || "Profile"}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-teal-600/50"
                />
              ) : (
                <div className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800">
                  <UserRound className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl px-6 py-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-4">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={linkClass}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={linkClass}
            >
              About us
            </NavLink>
            <NavLink
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className={linkClass}
            >
              Shop
            </NavLink>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                Categories
              </span>
              <CategoryDropdown
                categories={categories}
                id="mobile-category-menu"
                onSelect={() => setMobileMenuOpen(false)}
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-teal-600 rounded-lg p-1.5">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Nokata</span>
            </div>
            <p className="text-sm text-gray-400">
              Your premier destination for quality mobile phones, accessories,
              seamless shopping, and secure checkout.
            </p>

            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-teal-500 shrink-0" />
              <span>Oyo, Osun and Lagos State, Nigeria.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="hover:text-teal-400 transition-colors"
                >
                  Shop Catalog
                </Link>
              </li>
              <li>
                <Link
                  to="/#collection"
                  className="hover:text-teal-400 transition-colors"
                >
                  Featured Collection
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="hover:text-teal-400 transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Customer Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/auth"
                  className="hover:text-teal-400 transition-colors"
                >
                  My Account
                </Link>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">
                  Track Order
                </span>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">
                  Shipping & Returns
                </span>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-400">
              Subscribe to get special offers, tech giveaways, and exclusive
              deals.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 text-white px-3 py-2 text-sm rounded-l-xl focus:outline-none focus:ring-1 focus:ring-teal-500 w-full"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-2 rounded-r-xl transition-colors flex items-center justify-center"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Nokata. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span>Secure Paystack Checkout</span>
            <span>Fast Lagos Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors">
      <StorefrontHeader />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}