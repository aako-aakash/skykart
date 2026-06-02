import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-7xl font-black gradient-text mb-4" style={{ fontFamily: "var(--font-syne)" }}>404</p>
        <h1 className="text-xl font-bold mb-2">Page Not Found</h1>
        <p className="text-sm text-[rgba(240,239,248,0.4)] mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/">
          <button className="px-6 py-2.5 bg-[#6C63FF] hover:bg-[#5a51e8] text-white text-sm font-medium rounded-xl transition-colors">
            Go Home
          </button>
        </Link>
      </div>
    </div>
  );
}
