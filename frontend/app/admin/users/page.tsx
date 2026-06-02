"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminService } from "@/services";
import { formatDate } from "@/utils";
import { Search } from "lucide-react";

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => adminService.listUsers(1, 50, search || undefined),
  });

  const updateRole = async (id: string, role: string) => {
    try { await adminService.updateUserRole(id, role); toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black mb-6" style={{ fontFamily: "var(--font-syne)" }}>Users</h1>

      <div className="relative max-w-xs mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgba(240,239,248,0.35)]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…"
          className="w-full bg-[#16161f] border border-[rgba(255,255,255,0.08)] rounded-lg pl-9 pr-3 py-2 text-xs text-[#f0eff8] placeholder:text-[rgba(240,239,248,0.3)] outline-none focus:border-[#6C63FF]/50" />
      </div>

      <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.07)] text-[rgba(240,239,248,0.4)] uppercase tracking-wide">
              <th className="text-left px-5 py-3">User</th>
              <th className="text-left px-5 py-3">Joined</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
            {(Array.isArray(data) ? data : data?.items ?? []).map((user: any) => (
              <tr key={user.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="px-5 py-3">
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-[rgba(240,239,248,0.35)] text-[10px]">{user.email}</p>
                </td>
                <td className="px-5 py-3 text-[rgba(240,239,248,0.5)]">{formatDate(user.created_at)}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${user.is_active ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <select value={user.role} onChange={(e) => updateRole(user.id, e.target.value)}
                    className="bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded text-xs px-2 py-1 text-[#f0eff8] outline-none focus:border-[#6C63FF]/50">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
