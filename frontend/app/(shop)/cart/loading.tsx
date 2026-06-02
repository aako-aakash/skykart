import { Skeleton } from "@/components/ui/Badge";

export default function CartLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
