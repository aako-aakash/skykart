import ProductGrid from "@/components/product/ProductGrid";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products" };

interface Props {
  searchParams: { search?: string; category_id?: string; is_featured?: string; sort_by?: string; sort_order?: string };
}

export default function ProductsPage({ searchParams }: Props) {
  const filters = {
    search: searchParams.search,
    category_id: searchParams.category_id,
    is_featured: searchParams.is_featured === "true" ? true : undefined,
    sort_by: (searchParams.sort_by as any) ?? "created_at",
    sort_order: (searchParams.sort_order as any) ?? "desc",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
          {filters.search ? `Results for "${filters.search}"` : filters.is_featured ? "Featured Products" : "All Products"}
        </h1>
      </div>
      <ProductGrid initialFilters={filters} />
    </div>
  );
}
