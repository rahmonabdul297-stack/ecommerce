import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProductListPage } from "@/pages/storefront/ProductListPage";
import { ProductDetailPage } from "@/pages/storefront/ProductDetailPage";
import { CartPage } from "@/pages/storefront/CartPage";
import { CheckoutPage } from "@/pages/storefront/CheckoutPage";
import { OrderListPage } from "@/pages/storefront/OrderListPage";
import { OrderDetailPage } from "@/pages/storefront/OrderDetailPage";
import { AddressListPage } from "@/pages/storefront/AddressListPage";
import { PaymentReturnPage } from "@/pages/storefront/PaymentReturnPage";
import { AuthPage } from "@/pages/storefront/AuthPage";
import { ProfilePage } from "@/pages/storefront/ProfilePage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminProductFormPage } from "@/pages/admin/AdminProductFormPage";
import { AdminCategoriesPage } from "@/pages/admin/AdminCategoriesPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import ShopPage from "./pages/storefront/ShopPage";
import { FaWhatsapp } from "react-icons/fa";
import AboutPage from "./pages/storefront/AboutPage";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-gray-600 mt-4">Page not found</p>
        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

function WhatsAppButton() {
  const location = useLocation();
  const cleanPhone = "2347089136508";
  const defaultMessage = encodeURIComponent(
    "Hello Nokata, I would like to ask about your products.",
  );

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${defaultMessage}`;

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-6 right-6 z-40 flex items-center justify-center transition-transform duration-300 hover:scale-110 focus:outline-none"
    >
      {/* Outer Pulse Rings */}
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />

      {/* Button Background */}
      <span className="relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-950/20 transition-all duration-300 group-hover:bg-[#20ba5a] group-hover:shadow-emerald-500/40">
        <FaWhatsapp className="size-8 transition-transform duration-300 group-hover:rotate-12" />
      </span>

      {/* Hover Tooltip Label */}
      <span className="absolute right-16 hidden whitespace-nowrap rounded-lg border border-gray-200 bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-100 dark:text-gray-900 sm:inline-block">
        Chat with us
      </span>
    </a>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProvider>
          <BrowserRouter>
            <WhatsAppButton />
            <Routes>
              {/* Storefront */}
              <Route path="/" element={<ProductListPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/orders/:orderId" element={<OrderDetailPage />} />
              <Route path="/addresses" element={<AddressListPage />} />
              <Route path="/payment/return" element={<PaymentReturnPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/reset-password" element={<AuthPage />} />

              {/* Admin */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route
                  index
                  element={<Navigate to="/admin/products" replace />}
                />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<AdminProductFormPage />} />
                <Route
                  path="products/:id/edit"
                  element={<AdminProductFormPage />}
                />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
