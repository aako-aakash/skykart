"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-5xl mb-4">⚠️</p>
        <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-syne)" }}>
          Something went wrong
        </h1>
        <p className="text-sm text-[rgba(240,239,248,0.4)] mb-6 max-w-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
