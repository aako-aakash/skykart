"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services";
import ProductCard from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Badge";

export default function FeaturedProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productService.getFeatured(8),
  });

  return (
    <section className="max-w-7xl mx-auto px-4 pb-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs text-[rgba(240,239,248,0.35)] uppercase tracking-widest mb-2">Hand-picked</p>
          <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>Featured Products</h2>
        </div>
        <Link href="/products?is_featured=true" className="text-xs text-[#9d97ff] hover:underline">View all →</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products?.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
