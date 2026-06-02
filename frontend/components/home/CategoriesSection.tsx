"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services";

const ICONS: Record<string, string> = {
  electronics: "⚡", fashion: "👗", "home-living": "🏠",
  sports: "🏃", beauty: "✨", books: "📚",
};

export default function CategoriesSection() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: productService.getCategories,
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs text-[rgba(240,239,248,0.35)] uppercase tracking-widest mb-2">Browse by</p>
          <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>Categories</h2>
        </div>
        <Link href="/products" className="text-xs text-[#9d97ff] hover:underline">See all →</Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {(categories ?? []).map((cat) => (
          <Link key={cat.id} href={`/products?category_id=${cat.id}`}>
            <div className="group flex flex-col items-center gap-2.5 p-4 rounded-xl bg-[#16161f] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(108,99,255,0.3)] hover:bg-[rgba(108,99,255,0.06)] transition-all duration-200 cursor-pointer">
              <span className="text-2xl">{ICONS[cat.slug] ?? "🛍️"}</span>
              <span className="text-xs font-medium text-[rgba(240,239,248,0.7)] group-hover:text-[#f0eff8] transition-colors text-center leading-tight">{cat.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
