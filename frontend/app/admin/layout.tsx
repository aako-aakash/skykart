"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/utils";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") router.push("/login");
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen flex bg-[#09090f]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#111118] border-r border-[rgba(255,255,255,0.07)] flex flex-col">
        <div className="p-5 border-b border-[rgba(255,255,255,0.07)]">
          <Link href="/">
            <span className="text-base font-black tracking-tighter gradient-text" style={{ fontFamily: "var(--font-syne)" }}>SKYKART</span>
          </Link>
          <p className="text-[10px] text-[rgba(240,239,248,0.35)] mt-0.5 uppercase tracking-widest">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all",
                  active ? "bg-[rgba(108,99,255,0.15)] text-[#9d97ff] border border-[rgba(108,99,255,0.2)]"
                    : "text-[rgba(240,239,248,0.5)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0eff8]"
                )}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[rgba(108,99,255,0.25)] flex items-center justify-center text-[10px] font-bold text-[#9d97ff]">
              {user?.full_name?.[0] ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.full_name}</p>
              <p className="text-[10px] text-[rgba(240,239,248,0.35)] truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); router.push("/"); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
