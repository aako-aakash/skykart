"use client";
import { useQuery } from "@tanstack/react-query";
import { adminService, orderService } from "@/services";
import { formatPrice, formatDate, ORDER_STATUS_MAP } from "@/utils";
import { Users, Package, ShoppingBag, TrendingUp, DollarSign, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/Badge";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: adminService.getStats });
  const { data: recentOrders } = useQuery({ queryKey: ["admin-orders-recent"], queryFn: () => adminService.listOrders(1, 5) });

  const statCards = stats ? [
    { icon: Users, label: "Total Users", value: stats.total_users.toLocaleString(), color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: Package, label: "Active Products", value: stats.total_products.toLocaleString(), color: "text-purple-400", bg: "bg-purple-400/10" },
    { icon: ShoppingBag, label: "Total Orders", value: stats.total_orders.toLocaleString(), color: "text-amber-400", bg: "bg-amber-400/10" },
    { icon: Clock, label: "Pending Orders", value: stats.pending_orders.toLocaleString(), color: "text-orange-400", bg: "bg-orange-400/10" },
    { icon: DollarSign, label: "Total Revenue", value: formatPrice(stats.revenue_total), color: "text-green-400", bg: "bg-green-400/10" },
    { icon: TrendingUp, label: "Today's Revenue", value: formatPrice(stats.revenue_today), color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ] : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ fontFamily: "var(--font-syne)" }}>Dashboard</h1>
        <p className="text-xs text-[rgba(240,239,248,0.4)] mt-1">Welcome back — here's what's happening</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : statCards.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[rgba(240,239,248,0.4)]">{label}</span>
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
              <p className="text-2xl font-black" style={{ fontFamily: "var(--font-syne)" }}>{value}</p>
            </div>
          ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-xl">
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.07)] flex justify-between items-center">
          <h2 className="font-semibold text-sm">Recent Orders</h2>
          <a href="/admin/orders" className="text-xs text-[#9d97ff] hover:underline">View all →</a>
        </div>
        <div className="divide-y divide-[rgba(255,255,255,0.05)]">
          {recentOrders?.items?.map((order: any) => {
            const s = ORDER_STATUS_MAP[order.status];
            return (
              <div key={order.id} className="px-6 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[10px] text-[rgba(240,239,248,0.35)]">{formatDate(order.created_at)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                <span className="text-xs font-semibold">{formatPrice(order.total_amount)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
