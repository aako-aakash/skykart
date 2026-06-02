"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart, Star, Package, Shield, Truck, ArrowLeft, Minus, Plus } from "lucide-react";
import { productService } from "@/services";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice, discountPercent } from "@/utils";
import { Skeleton } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getBySlug(slug),
  });

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error("Please sign in first"); router.push("/login"); return; }
    try {
      await addItem(product!.id, qty);
      toast.success("Added to cart!");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed");
    }
  };

  if (isLoading) return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-12">
      <Skeleton className="aspect-square" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" /><Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-28" /><Skeleton className="h-24 w-full" />
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 text-[rgba(240,239,248,0.4)]">Product not found.</div>;

  const images = product.image_urls?.length ? product.image_urls : [product.thumbnail_url ?? ""];
  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-xs text-[rgba(240,239,248,0.4)] hover:text-[#f0eff8] mb-8 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl bg-[#16161f] border border-[rgba(255,255,255,0.07)] overflow-hidden relative mb-3">
            {images[activeImg] ? (
              <Image src={images[activeImg]} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">📦</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg border-2 overflow-hidden relative transition-colors ${i === activeImg ? "border-[#6C63FF]" : "border-[rgba(255,255,255,0.07)]"}`}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <p className="text-xs text-[rgba(240,239,248,0.35)] uppercase tracking-widest mb-3">{product.category.name}</p>
          )}

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-4" style={{ fontFamily: "var(--font-syne)" }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.avg_rating) ? "fill-amber-400 text-amber-400" : "text-[rgba(255,255,255,0.12)]"}`} />
              ))}
            </div>
            <span className="text-xs text-[rgba(240,239,248,0.45)]">{product.avg_rating} ({product.review_count} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black" style={{ fontFamily: "var(--font-syne)" }}>{formatPrice(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-base text-[rgba(240,239,248,0.35)] line-through">{formatPrice(product.compare_price!)}</span>
                <span className="text-sm font-semibold text-green-400">
                  {discountPercent(Number(product.price), Number(product.compare_price))}% off
                </span>
              </>
            )}
          </div>

          {product.short_description && (
            <p className="text-sm text-[rgba(240,239,248,0.55)] leading-relaxed mb-6">{product.short_description}</p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${product.stock_quantity > 0 ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-xs text-[rgba(240,239,248,0.5)]">
              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Qty + CTA */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-[#16161f] border border-[rgba(255,255,255,0.08)] rounded-lg p-1">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-md hover:bg-[rgba(255,255,255,0.05)] flex items-center justify-center transition-colors">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))} disabled={qty >= product.stock_quantity}
                className="w-8 h-8 rounded-md hover:bg-[rgba(255,255,255,0.05)] flex items-center justify-center transition-colors disabled:opacity-40">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <Button onClick={handleAddToCart} isLoading={cartLoading} disabled={product.stock_quantity === 0} className="flex-1" size="lg">
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </Button>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Free Shipping", sub: "On orders ₹499+" },
              { icon: Shield, label: "Secure Pay", sub: "Razorpay encrypted" },
              { icon: Package, label: "Easy Returns", sub: "30-day window" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#16161f] border border-[rgba(255,255,255,0.06)] text-center">
                <Icon className="w-4 h-4 text-[#9d97ff]" />
                <span className="text-xs font-medium">{label}</span>
                <span className="text-[10px] text-[rgba(240,239,248,0.35)]">{sub}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[rgba(108,99,255,0.1)] text-[#9d97ff] border border-[rgba(108,99,255,0.2)]">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-14 border-t border-[rgba(255,255,255,0.07)] pt-10">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-syne)" }}>Product Description</h2>
          <p className="text-sm text-[rgba(240,239,248,0.55)] leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}
    </div>
  );
}
