"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/utils";
import Button from "@/components/ui/Button";

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-[#111118] border-l border-[rgba(255,255,255,0.07)] z-50 flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#6C63FF]" />
            <h2 className="font-semibold text-base" style={{ fontFamily: "var(--font-syne)" }}>
              Your Cart
            </h2>
            {cart && cart.item_count > 0 && (
              <span className="text-xs bg-[rgba(108,99,255,0.15)] text-[#9d97ff] px-2 py-0.5 rounded-full">
                {cart.item_count}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-[rgba(240,239,248,0.15)]" />
              <p className="text-sm text-[rgba(240,239,248,0.5)]">Sign in to view your cart</p>
              <Link href="/login" onClick={closeCart}>
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-[rgba(240,239,248,0.15)]" />
              <p className="text-sm text-[rgba(240,239,248,0.5)]">Your cart is empty</p>
              <Link href="/products" onClick={closeCart}>
                <Button size="sm" variant="outline">Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(255,255,255,0.06)]">
              {cart.items.map((item) => (
                <div key={item.id} className="p-4 flex gap-3">
                  {/* Product image */}
                  <div className="w-16 h-16 rounded-lg bg-[#16161f] flex-shrink-0 overflow-hidden relative">
                    {item.product.thumbnail_url ? (
                      <Image
                        src={item.product.thumbnail_url}
                        alt={item.product.name}
                        fill className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#f0eff8] line-clamp-2 mb-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-[rgba(240,239,248,0.5)] mb-2">
                      {formatPrice(item.product.price)}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => item.quantity === 1 ? removeItem(item.id) : updateItem(item.id, item.quantity - 1)}
                          disabled={isLoading}
                          className="w-6 h-6 rounded-md bg-[#16161f] border border-[rgba(255,255,255,0.08)] flex items-center justify-center hover:bg-[#1c1c27] transition-colors"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3" />}
                        </button>
                        <span className="text-xs font-medium w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={isLoading || item.quantity >= item.product.stock_quantity}
                          className="w-6 h-6 rounded-md bg-[#16161f] border border-[rgba(255,255,255,0.08)] flex items-center justify-center hover:bg-[#1c1c27] transition-colors disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span className="text-xs font-semibold text-[#9d97ff]">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="p-5 border-t border-[rgba(255,255,255,0.07)] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[rgba(240,239,248,0.55)]">Total</span>
              <span className="text-lg font-bold" style={{ fontFamily: "var(--font-syne)" }}>
                {formatPrice(cart.total_amount)}
              </span>
            </div>
            <Link href="/checkout" onClick={closeCart} className="block">
              <Button className="w-full" size="lg">Proceed to Checkout →</Button>
            </Link>
            <Link href="/cart" onClick={closeCart}
              className="block text-center text-xs text-[rgba(240,239,248,0.4)] hover:text-[rgba(240,239,248,0.7)] transition-colors">
              View full cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
