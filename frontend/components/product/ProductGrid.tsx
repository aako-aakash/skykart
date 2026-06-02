"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Badge";
import { productService } from "@/services";
import type { ProductFilters } from "@/types";
import { cn } from "@/utils";

interface ProductGridProps {
  initialFilters?: ProductFilters;
}

export default function ProductGrid({ initialFilters = {} }: ProductGridProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    per_page: 12,
    sort_by: "created_at",
    sort_order: "desc",
    ...initialFilters,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.list(filters),
  });

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, per_page: 12, sort_by: "created_at", sort_order: "desc" });
  };

  const hasActiveFilters = filters.search || filters.category_id || filters.min_price || filters.max_price;

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all",
              showFilters
                ? "bg-[rgba(108,99,255,0.15)] border-[rgba(108,99,255,0.3)] text-[#9d97ff]"
                : "bg-[#16161f] border-[rgba(255,255,255,0.08)] text-[rgba(240,239,248,0.6)] hover:border-[rgba(255,255,255,0.15)]"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}

          {data && (
            <span className="text-xs text-[rgba(240,239,248,0.35)]">
              {data.total} products
            </span>
          )}
        </div>

        {/* Sort */}
        <select
          value={`${filters.sort_by}-${filters.sort_order}`}
          onChange={(e) => {
            const [sort_by, sort_order] = e.target.value.split("-") as [any, any];
            setFilters((p) => ({ ...p, sort_by, sort_order, page: 1 }));
          }}
          className="bg-[#16161f] border border-[rgba(255,255,255,0.08)] text-xs text-[rgba(240,239,248,0.7)] rounded-lg px-3 py-2 outline-none focus:border-[#6C63FF]/50"
        >
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="avg_rating-desc">Top Rated</option>
        </select>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-[rgba(240,239,248,0.45)] mb-1.5 block uppercase tracking-wide">Min Price</label>
            <input
              type="number"
              placeholder="₹0"
              value={filters.min_price ?? ""}
              onChange={(e) => updateFilter("min_price", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-xs text-[#f0eff8] outline-none focus:border-[#6C63FF]/50"
            />
          </div>
          <div>
            <label className="text-xs text-[rgba(240,239,248,0.45)] mb-1.5 block uppercase tracking-wide">Max Price</label>
            <input
              type="number"
              placeholder="₹99999"
              value={filters.max_price ?? ""}
              onChange={(e) => updateFilter("max_price", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-xs text-[#f0eff8] outline-none focus:border-[#6C63FF]/50"
            />
          </div>
          <div>
            <label className="text-xs text-[rgba(240,239,248,0.45)] mb-1.5 block uppercase tracking-wide">Featured</label>
            <select
              value={filters.is_featured === undefined ? "" : String(filters.is_featured)}
              onChange={(e) => updateFilter("is_featured", e.target.value === "" ? undefined : e.target.value === "true")}
              className="w-full bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-xs text-[#f0eff8] outline-none"
            >
              <option value="">All</option>
              <option value="true">Featured Only</option>
            </select>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : data?.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {/* Empty */}
      {!isLoading && data?.items.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-[rgba(240,239,248,0.4)] text-sm">No products found</p>
          <button onClick={clearFilters} className="mt-3 text-xs text-[#9d97ff] hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
            className="px-4 py-2 text-xs rounded-lg bg-[#16161f] border border-[rgba(255,255,255,0.08)] disabled:opacity-40 hover:border-[rgba(255,255,255,0.15)] transition-colors"
          >
            ← Prev
          </button>
          {Array.from({ length: Math.min(data.pages, 5) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setFilters((f) => ({ ...f, page: p }))}
                className={cn(
                  "w-9 h-9 text-xs rounded-lg border transition-colors",
                  filters.page === p
                    ? "bg-[#6C63FF] border-[#6C63FF] text-white"
                    : "bg-[#16161f] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]"
                )}
              >
                {p}
              </button>
            );
          })}
          <button
            disabled={filters.page === data.pages}
            onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
            className="px-4 py-2 text-xs rounded-lg bg-[#16161f] border border-[rgba(255,255,255,0.08)] disabled:opacity-40 hover:border-[rgba(255,255,255,0.15)] transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
