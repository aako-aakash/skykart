"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { cn } from "@/utils";

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, toggleCart, fetchCart } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  const cartCount = cart?.item_count ?? 0;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[rgba(9,9,15,0.95)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.07)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span
              className="text-xl font-black tracking-tighter gradient-text"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              SKYKART
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: "/products", label: "Products" },
              { href: "/products?is_featured=true", label: "Featured" },
              { href: "/products?sort_by=price&sort_order=asc", label: "Deals" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[rgba(240,239,248,0.55)] hover:text-[#f0eff8] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search + Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="flex items-center gap-2 bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 w-44 focus-within:border-[#6C63FF]/50 transition-colors">
                <Search className="w-3.5 h-3.5 text-[rgba(240,239,248,0.35)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="bg-transparent text-xs text-[#f0eff8] placeholder:text-[rgba(240,239,248,0.3)] outline-none w-full"
                />
              </div>
            </form>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-lg bg-[#111118] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B6B] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#111118] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-colors"
                >
                  <User className="w-4 h-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-11 w-48 bg-[#16161f] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-xl py-1 z-50">
                    <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.06)]">
                      <p className="text-xs font-medium text-[#f0eff8] truncate">{user?.full_name}</p>
                      <p className="text-xs text-[rgba(240,239,248,0.4)] truncate">{user?.email}</p>
                    </div>
                    <Link href="/account" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                      <User className="w-3.5 h-3.5" /> My Account
                    </Link>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                      <Package className="w-3.5 h-3.5" /> My Orders
                    </Link>
                    {user?.role === "admin" && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-[#9d97ff] hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                        <LayoutDashboard className="w-3.5 h-3.5" /> Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-[rgba(255,255,255,0.04)] transition-colors border-t border-[rgba(255,255,255,0.06)] mt-1">
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button className="px-4 py-2 text-xs font-medium bg-[#6C63FF] hover:bg-[#5a51e8] text-white rounded-lg transition-colors">
                  Sign In
                </button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg bg-[#111118] border border-[rgba(255,255,255,0.08)]"
              onClick={() => setMobileOpen((p) => !p)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#111118] border-t border-[rgba(255,255,255,0.07)] px-4 py-4 space-y-3">
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-2 bg-[#16161f] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2">
              <Search className="w-3.5 h-3.5 text-[rgba(240,239,248,0.35)]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="bg-transparent text-sm text-[#f0eff8] placeholder:text-[rgba(240,239,248,0.3)] outline-none w-full" />
            </div>
          </form>
          {["/products", "/products?is_featured=true", "/orders"].map((href) => (
            <Link key={href} href={href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-[rgba(240,239,248,0.6)] hover:text-[#f0eff8] py-1">
              {href === "/products" ? "Products" : href === "/orders" ? "Orders" : "Featured"}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
