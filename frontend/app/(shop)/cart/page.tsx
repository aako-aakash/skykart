"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/utils";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Badge";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, fetchCart, updateItem, removeItem, isLoading } = useCartStore();

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    fetchCart();
  }, [isAuthenticated]);

  if (isLoading && !cart) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-40" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  const shipping = cart && Number(cart.total_amount) < 499 ? 49 : 0;
  const total = cart ? Number(cart.total_amount) + shipping : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
          Shopping Cart
          {cart && cart.item_count > 0 && (
            <span className="ml-3 text-sm font-medium text-[rgba(240,239,248,0.4)]">({cart.item_count} items)</span>
          )}
        </h1>
      </div>

      {!cart || cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag className="w-16 h-16 text-[rgba(240,239,248,0.1)] mb-5" />
          <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
          <p className="text-sm text-[rgba(240,239,248,0.4)] mb-6">Add some products to get started</p>
          <Link href="/products"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 hover:border-[rgba(255,255,255,0.1)] transition-colors">
                {/* Image */}
                <Link href={`/products/${item.product.slug}`}>
                  <div className="w-20 h-20 rounded-lg bg-[#111118] flex-shrink-0 overflow-hidden relative">
                    {item.product.thumbnail_url ? (
                      <Image src={item.product.thumbnail_url} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="text-sm font-medium hover:text-[#9d97ff] transition-colors line-clamp-2 mb-1">{item.product.name}</h3>
                  </Link>
                  {item.product.category && (
                    <p className="text-xs text-[rgba(240,239,248,0.35)] mb-3">{item.product.category.name}</p>
                  )}

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Quantity */}
                    <div className="flex items-center gap-2 bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-lg p-1">
                      <button
                        onClick={() => item.quantity === 1 ? removeItem(item.id) : updateItem(item.id, item.quantity - 1)}
                        disabled={isLoading}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.06)] transition-colors disabled:opacity-40"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= item.product.stock_quantity}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.06)] transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-bold" style={{ fontFamily: "var(--font-syne)" }}>
                        {formatPrice(item.subtotal)}
                      </p>
                      <p className="text-xs text-[rgba(240,239,248,0.35)]">{formatPrice(item.product.price)} each</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-xl p-6 h-fit sticky top-24">
            <h2 className="font-semibold text-sm mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-[rgba(240,239,248,0.55)]">
                <span>Subtotal ({cart.item_count} items)</span>
                <span>{formatPrice(cart.total_amount)}</span>
              </div>
              <div className="flex justify-between text-[rgba(240,239,248,0.55)]">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-400" : ""}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-[rgba(240,239,248,0.35)] bg-[rgba(255,255,255,0.03)] rounded-lg px-3 py-2">
                  Add {formatPrice(499 - Number(cart.total_amount))} more for free shipping
                </p>
              )}
            </div>

            <div className="border-t border-[rgba(255,255,255,0.07)] pt-4 mb-5">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-black" style={{ fontFamily: "var(--font-syne)" }}>{formatPrice(total)}</span>
              </div>
            </div>

            <Link href="/checkout">
              <Button className="w-full" size="lg">Proceed to Checkout →</Button>
            </Link>

            <Link href="/products">
              <button className="w-full mt-3 text-xs text-[rgba(240,239,248,0.4)] hover:text-[rgba(240,239,248,0.7)] transition-colors py-2">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
