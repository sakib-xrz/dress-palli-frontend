"use client";

import type {
  Banner,
  Category,
  FeaturedCategoryWithProducts,
  PublicProduct,
} from "@/lib/type";
import BannerCarousel from "./banner-carousel";
import CategorySection from "./category-section";
import ProductsSection from "./products-section";
import FeaturedCategorySection from "./featured-category-section";
import { useGlobalSettings } from "@/contexts/settings-context";

interface HomeProps {
  banners: Banner[];
  categories: Category[];
  featuredProducts?: PublicProduct[];
  newProducts?: PublicProduct[];
  bestSellingProducts?: PublicProduct[];
  featuredCategories?: FeaturedCategoryWithProducts[];
}

export default function Home({
  banners,
  categories,
  featuredProducts = [],
  newProducts = [],
  bestSellingProducts = [],
  featuredCategories = [],
}: HomeProps) {
  const { settings } = useGlobalSettings();

  return (
    <div className="space-y-10 pb-10 md:space-y-16 lg:space-y-20 lg:pb-14">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="rounded-2xl border border-border/80 bg-white/85 px-4 py-2 text-center text-xs font-medium tracking-wide text-muted-foreground shadow-sm backdrop-blur md:text-sm">
          Free delivery in selected areas | Easy returns | Secure checkout
        </div>
      </div>
      <BannerCarousel banners={banners} />
      <CategorySection categories={categories} />
      {settings?.show_featured_products && featuredProducts.length > 0 && (
        <ProductsSection products={featuredProducts} />
      )}
      {settings?.show_new_arrivals && newProducts.length > 0 && (
        <ProductsSection
          products={newProducts}
          title="New Products"
          description="Explore the latest arrivals freshly added to our collection"
        />
      )}
      {settings?.show_best_selling && bestSellingProducts.length > 0 && (
        <ProductsSection
          products={bestSellingProducts}
          title="Best Selling Products"
          description="Shop the most loved items our customers keep coming back for"
        />
      )}
      {featuredCategories.map((fc) => (
        <FeaturedCategorySection key={fc.id} featuredCategory={fc} />
      ))}
    </div>
  );
}
