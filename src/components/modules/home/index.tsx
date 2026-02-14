import type { Banner, Category, PublicProduct } from "@/lib/type";
import BannerCarousel from "./banner-carousel";
import CategorySection from "./category-section";
import FeaturedProductsSection from "./featured-products-section";

interface HomeProps {
  banners: Banner[];
  categories: Category[];
  featuredProducts?: PublicProduct[];
}

export default function Home({
  banners,
  categories,
  featuredProducts = [],
}: HomeProps) {
  return (
    <div className="lg:space-y-20 space-y-8 lg:mb-12 mb-6">
      <BannerCarousel banners={banners} />
      <CategorySection categories={categories} />
      {featuredProducts.length > 0 && (
        <FeaturedProductsSection products={featuredProducts} />
      )}
    </div>
  );
}
