import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/common/QueryProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "SKYKART", template: "%s | SKYKART" },
  description: "Shop the future — premium products, delivered today.",
  keywords: ["ecommerce", "shopping", "skykart", "online store"],
  openGraph: {
    title: "SKYKART",
    description: "Shop the future — premium products, delivered today.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#16161f",
                color: "#f0eff8",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                fontSize: "13px",
              },
              success: { iconTheme: { primary: "#22c55e", secondary: "#16161f" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#16161f" } },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
