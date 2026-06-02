import { ProductCardSkeleton } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Badge";

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Skeleton className="h-9 w-56 mb-8" />
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
