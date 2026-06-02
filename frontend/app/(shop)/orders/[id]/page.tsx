"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { orderService } from "@/services";
import { formatPrice, formatDateTime, ORDER_STATUS_MAP } from "@/utils";
import { ArrowLeft, MapPin, Package } from "lucide-react";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Badge";
import Image from "next/image";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getById(id),
  });

  const handleCancel = async () => {
    try {
      await orderService.cancel(id);
      toast.success("Order cancelled");
      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Cannot cancel order");
    }
  };

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-10 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48" /></div>;
  if (!order) return <div className="text-center py-20 text-[rgba(240,239,248,0.4)]">Order not found.</div>;

  const statusInfo = ORDER_STATUS_MAP[order.status];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => router.push("/orders")} className="flex items-center gap-2 text-xs text-[rgba(240,239,248,0.4)] hover:text-[#f0eff8] mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> My Orders
      </button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black" style={{ fontFamily: "var(--font-syne)" }}>Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-xs text-[rgba(240,239,248,0.4)] mt-1">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>{statusInfo.label}</span>
          {["pending", "confirmed"].includes(order.status) && (
            <Button variant="danger" size="sm" onClick={handleCancel}>Cancel Order</Button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden mb-5">
        <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.07)]">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Package className="w-4 h-4 text-[#9d97ff]" /> Items</h2>
        </div>
        <div className="divide-y divide-[rgba(255,255,255,0.06)]">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-12 h-12 rounded-lg bg-[#111118] flex-shrink-0 relative overflow-hidden">
                {item.product_image ? <Image src={item.product_image} alt={item.product_name} fill className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-xl">📦</span>}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product_name}</p>
                <p className="text-xs text-[rgba(240,239,248,0.4)]">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
              </div>
              <span className="text-sm font-semibold">{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.07)] space-y-1.5 text-xs">
          <div className="flex justify-between text-[rgba(240,239,248,0.5)]"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-[rgba(240,239,248,0.5)]"><span>Shipping</span><span>{order.shipping_charge === 0 || String(order.shipping_charge) === "0" ? "FREE" : formatPrice(order.shipping_charge)}</span></div>
          <div className="flex justify-between font-bold text-sm pt-1 border-t border-[rgba(255,255,255,0.07)] mt-1">
            <span>Total</span><span style={{ fontFamily: "var(--font-syne)" }}>{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3"><MapPin className="w-4 h-4 text-[#9d97ff]" /> Delivery Address</h2>
        <div className="text-xs text-[rgba(240,239,248,0.6)] leading-relaxed space-y-0.5">
          <p className="font-semibold text-[#f0eff8]">{order.address.full_name} · {order.address.phone}</p>
          <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</p>
          <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
          <p>{order.address.country}</p>
        </div>
      </div>
    </div>
  );
}
