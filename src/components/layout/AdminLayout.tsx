import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Package,
  Tag,
  Users,
  ClipboardList,
  ArrowLeft,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const adminLinks = [
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/users", label: "Users", icon: Users },
];

export function AdminLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-teal-50 text-teal-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:flex">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-teal-600 rounded-lg p-1.5">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Nokata</span>
          </Link>
          <p className="text-xs text-gray-400 mt-1 ml-9">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-gray-100 px-3 py-4 dark:border-gray-800">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Appearance
            </span>
            <ThemeToggle />
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 md:hidden">
          <div className="flex min-h-10 items-center justify-between gap-3">
            <Link to="/" className="flex min-w-0 items-center gap-2">
              <span className="rounded-lg bg-teal-600 p-1.5">
                <ShoppingBag className="h-5 w-5 text-white" />
              </span>
              <span className="truncate font-bold text-gray-900 dark:text-white">
                Nokata <span className="font-normal text-gray-500">Admin</span>
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-1">
              <ThemeToggle />
              <button
                type="button"
                aria-label={
                  mobileMenuOpen ? "Close admin menu" : "Open admin menu"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-admin-menu"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <nav
              id="mobile-admin-menu"
              className="mt-3 space-y-1 border-t border-gray-100 pt-3 dark:border-gray-800"
            >
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={linkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Store
              </Link>
            </nav>
          )}
        </header>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
