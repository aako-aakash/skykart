import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden px-4">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6C63FF]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FF6B6B]/8 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      <div className="relative text-center max-w-4xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(108,99,255,0.12)] border border-[rgba(108,99,255,0.25)] text-[#9d97ff] text-xs font-medium mb-8 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9d97ff] animate-pulse" />
          New Season Drop — Up to 40% Off
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-6" style={{ fontFamily: "var(--font-syne)" }}>
          Shop the{" "}
          <span className="gradient-text">Future</span>,<br />
          Delivered Today.
        </h1>

        <p className="text-base sm:text-lg text-[rgba(240,239,248,0.5)] max-w-xl mx-auto mb-10 leading-relaxed">
          Premium products across electronics, fashion, home & living — curated for the modern lifestyle.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products">
            <button className="px-8 py-3.5 bg-[#6C63FF] hover:bg-[#5a51e8] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-[0_0_32px_rgba(108,99,255,0.4)] active:scale-95 text-sm">
              Explore Products →
            </button>
          </Link>
          <Link href="/products?is_featured=true">
            <button className="px-8 py-3.5 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] text-[#f0eff8] font-semibold rounded-xl transition-all duration-200 text-sm">
              View Featured
            </button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-14 text-xs text-[rgba(240,239,248,0.35)]">
          {["✓ Free shipping over ₹499", "✓ 30-day returns", "✓ Secure checkout", "✓ 2M+ happy customers"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
