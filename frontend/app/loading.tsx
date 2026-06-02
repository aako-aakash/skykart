import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="text-xl font-black gradient-text" style={{ fontFamily: "var(--font-syne)" }}>
          SKYKART
        </span>
        <Loader2 className="w-6 h-6 animate-spin text-[#6C63FF]" />
      </div>
    </div>
  );
}
