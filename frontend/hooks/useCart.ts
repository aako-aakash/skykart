"use client";

import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";

/**
 * useCart — wraps the cart store and auto-fetches on mount if authenticated.
 */
export function useCart() {
  const cartStore = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !cartStore.cart) {
      cartStore.fetchCart();
    }
  }, [isAuthenticated]);

  return cartStore;
}
