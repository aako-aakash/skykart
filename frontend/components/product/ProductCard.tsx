"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice, discountPercent, cn } from "@/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isWished, setIsWished] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    try {
      await addItem(product.id);
      toast.success("Added to cart!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add to cart");
    }
  };

  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discount = hasDiscount
    ? discountPercent(Number(product.price), Number(product.compare_price))
    : 0;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className={cn(
        "group bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden",
        "transition-all duration-300 hover:border-[rgba(108,99,255,0.3)] hover:-translate-y-1",
        "hover:shadow-[0_8px_32px_rgba(108,99,255,0.12)]",
        isOutOfStock && "opacity-60"
      )}>
        {/* Image */}
        <div className="relative h-52 bg-[#111118] overflow-hidden">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_featured && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(108,99,255,0.25)] text-[#9d97ff] border border-[rgba(108,99,255,0.3)] uppercase tracking-wide">
                Featured
              </span>
            )}
            {hasDiscount && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(255,107,107,0.2)] text-[#ff9d9d] border border-[rgba(255,107,107,0.3)] uppercase tracking-wide">
                -{discount}%
              </span>
            )}
            {isOutOfStock && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.08)] text-[rgba(240,239,248,0.5)] uppercase tracking-wide">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); setIsWished((p) => !p); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[rgba(9,9,15,0.7)] backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={cn("w-3.5 h-3.5 transition-colors", isWished ? "fill-red-400 text-red-400" : "text-white")} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category && (
            <p className="text-[10px] text-[rgba(240,239,248,0.35)] uppercase tracking-widest mb-1.5 font-medium">
              {product.category.name}
            </p>
          )}

          {/* Stars */}
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn("w-2.5 h-2.5", i < Math.floor(product.avg_rating) ? "fill-amber-400 text-amber-400" : "text-[rgba(255,255,255,0.12)]")}
              />
            ))}
            <span className="text-[10px] text-[rgba(240,239,248,0.35)] ml-1">
              ({product.review_count})
            </span>
          </div>

          <h3 className="text-sm font-medium text-[#f0eff8] line-clamp-2 mb-3 leading-snug">
            {product.name}
          </h3>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-base font-bold" style={{ fontFamily: "var(--font-syne)" }}>
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[rgba(240,239,248,0.35)] line-through ml-2">
                  {formatPrice(product.compare_price!)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isLoading || isOutOfStock}
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                "bg-[#6C63FF] hover:bg-[#5a51e8] text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "active:scale-95"
              )}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
