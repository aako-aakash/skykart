import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.07)] bg-[#111118] mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <span className="text-xl font-black tracking-tighter gradient-text" style={{ fontFamily: "var(--font-syne)" }}>SKYKART</span>
          <p className="mt-3 text-xs text-[rgba(240,239,248,0.4)] leading-relaxed">Shop the future — premium products, lightning-fast delivery.</p>
        </div>
        {[
          { title: "Shop", links: [["Products", "/products"], ["Featured", "/products?is_featured=true"], ["Deals", "/products?sort_by=price&sort_order=asc"]] },
          { title: "Account", links: [["My Orders", "/orders"], ["Profile", "/account"], ["Sign In", "/login"]] },
          { title: "Company", links: [["About", "#"], ["Contact", "#"], ["Privacy", "#"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[rgba(240,239,248,0.4)] mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}><Link href={href} className="text-xs text-[rgba(240,239,248,0.55)] hover:text-[#f0eff8] transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[rgba(255,255,255,0.05)] py-5 text-center text-xs text-[rgba(240,239,248,0.25)]">
        © {new Date().getFullYear()} SKYKART. All rights reserved.
      </div>
    </footer>
  );
}
