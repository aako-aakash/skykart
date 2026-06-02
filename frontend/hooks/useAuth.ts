"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

/**
 * useRequireAuth — redirects to /login if not authenticated.
 * Use at the top of any protected page.
 */
export function useRequireAuth(redirectTo = "/login") {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
}

/**
 * useRequireAdmin — redirects non-admins away.
 */
export function useRequireAdmin() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) router.push("/login");
      else if (user?.role !== "admin") router.push("/");
    }
  }, [isAuthenticated, isLoading, user]);

  return { user, isAuthenticated, isLoading };
}
