// StatsStrip
export default function StatsStrip() {
  const stats = [
    { value: "50K+", label: "Products" },
    { value: "2M+", label: "Customers" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9★", label: "Rating" },
    { value: "₹0", label: "Delivery over ₹499" },
  ];
  return (
    <div className="border-y border-[rgba(255,255,255,0.07)] bg-[#111118] py-5">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 md:gap-16">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-xl font-black gradient-text" style={{ fontFamily: "var(--font-syne)" }}>{s.value}</div>
            <div className="text-xs text-[rgba(240,239,248,0.4)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
