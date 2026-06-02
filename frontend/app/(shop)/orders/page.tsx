"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { orderService } from "@/services";
import { formatPrice, formatDate, ORDER_STATUS_MAP } from "@/utils";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/Badge";

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.list(),
    enabled: isAuthenticated,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black mb-8" style={{ fontFamily: "var(--font-syne)" }}>My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : !data?.items.length ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 mx-auto text-[rgba(240,239,248,0.12)] mb-4" />
          <p className="text-[rgba(240,239,248,0.4)] text-sm">No orders yet</p>
          <Link href="/products" className="mt-3 inline-block text-xs text-[#9d97ff] hover:underline">Start shopping →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((order) => {
            const statusInfo = ORDER_STATUS_MAP[order.status] ?? ORDER_STATUS_MAP.pending;
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-xl p-5 hover:border-[rgba(108,99,255,0.3)] transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-[rgba(240,239,248,0.35)] mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-[rgba(240,239,248,0.45)]">{formatDate(order.created_at)} · {order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <p className="text-sm font-bold mt-1.5" style={{ fontFamily: "var(--font-syne)" }}>{formatPrice(order.total_amount)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {order.items.slice(0, 3).map((item) => (
                      <span key={item.id} className="text-xs text-[rgba(240,239,248,0.5)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded">
                        {item.product_name}
                      </span>
                    ))}
                    {order.items.length > 3 && <span className="text-xs text-[rgba(240,239,248,0.35)]">+{order.items.length - 3} more</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
