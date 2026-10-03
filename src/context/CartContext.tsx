import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { Cart } from "@/lib/types";
import * as cartService from "@/services/cartService";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity: number, selectedAttributes?: Record<string, string>) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const c = await cartService.getCart();
      setCart(c);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load cart";
      setError(msg);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(
    async (productId: string, quantity: number, selectedAttributes?: Record<string, string>) => {
      setError(null);
      try {
        const c = await cartService.addToCart({ productId, quantity, selectedAttributes });
        setCart(c);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to add item";
        setError(msg);
        throw err;
      }
    },
    []
  );

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    setError(null);
    try {
      const c = await cartService.updateCartItem(itemId, { quantity });
      setCart(c);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update item";
      setError(msg);
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setError(null);
    try {
      const c = await cartService.removeCartItem(itemId);
      setCart(c);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to remove item";
      setError(msg);
      throw err;
    }
  }, []);

  const clear = useCallback(async () => {
    setError(null);
    try {
      await cartService.clearCart();
      setCart({ _id: "", items: [], subtotal: 0 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to clear cart";
      setError(msg);
      throw err;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, error, refresh, addItem, updateItem, removeItem, clear, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
