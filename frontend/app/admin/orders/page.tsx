"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminService } from "@/services";
import { formatPrice, formatDate, ORDER_STATUS_MAP } from "@/utils";
import { OrderStatus } from "@/types";

const STATUSES = ["pending","confirmed","processing","shipped","delivered","cancelled","refunded"];

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ["admin-orders", statusFilter, page],
    queryFn: () => adminService.listOrders(page, 20, statusFilter || undefined),
  });

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await adminService.updateOrderStatus(orderId, status);
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black mb-6" style={{ fontFamily: "var(--font-syne)" }}>Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {["", ...STATUSES].map((s) => {
          const info = s ? ORDER_STATUS_MAP[s] : null;
          return (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${statusFilter === s ? "bg-[rgba(108,99,255,0.15)] border-[rgba(108,99,255,0.3)] text-[#9d97ff]" : "bg-[#16161f] border-[rgba(255,255,255,0.08)] text-[rgba(240,239,248,0.5)] hover:border-[rgba(255,255,255,0.15)]"}`}>
              {s ? (info?.label ?? s) : "All Orders"}
            </button>
          );
        })}
      </div>

      <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.07)] text-[rgba(240,239,248,0.4)] uppercase tracking-wide">
              <th className="text-left px-5 py-3">Order</th>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-left px-5 py-3">Items</th>
              <th className="text-left px-5 py-3">Total</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
            {data?.items?.map((order: any) => {
              const s = ORDER_STATUS_MAP[order.status];
              return (
                <tr key={order.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="px-5 py-3 font-mono font-medium">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-5 py-3 text-[rgba(240,239,248,0.5)]">{formatDate(order.created_at)}</td>
                  <td className="px-5 py-3">{order.items?.length ?? 0}</td>
                  <td className="px-5 py-3 font-semibold">{formatPrice(order.total_amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.color}`}>{s.label}</span>
                  </td>
                  <td className="px-5 py-3">
                    <select value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded text-xs px-2 py-1 text-[#f0eff8] outline-none focus:border-[#6C63FF]/50">
                      {STATUSES.map((st) => <option key={st} value={st}>{ORDER_STATUS_MAP[st]?.label ?? st}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-xs rounded-lg bg-[#16161f] border border-[rgba(255,255,255,0.08)] disabled:opacity-40">← Prev</button>
          <span className="px-4 py-2 text-xs text-[rgba(240,239,248,0.4)]">Page {page} of {data.pages}</span>
          <button disabled={page === data.pages} onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-xs rounded-lg bg-[#16161f] border border-[rgba(255,255,255,0.08)] disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
