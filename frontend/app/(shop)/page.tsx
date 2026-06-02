import { Suspense } from "react";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import StatsStrip from "@/components/home/StatsStrip";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "SKYKART — Shop the Future" };

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsStrip />
      <CategoriesSection />
      <Suspense fallback={null}>
        <FeaturedProducts />
      </Suspense>
    </>
  );
}
