import { Link, NavLink, Outlet } from "react-router-dom";
import { Package, Tag, Users, ArrowLeft, ShoppingBag } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const adminLinks = [
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/users", label: "Users", icon: Users },
];

export function AdminLayout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-teal-50 text-teal-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
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
      <div className="flex-1 overflow-x-auto">
        <Outlet />
      </div>
    </div>
  );
}
