import type { Banner, Category, AdminProduct } from "@/lib/type";
import BannerCarousel from "./banner-carousel";
import CategorySection from "./category-section";
import FeaturedProductsSection from "./featured-products-section";

interface HomeProps {
  banners: Banner[];
  categories: Category[];
  featuredProducts?: AdminProduct[];
}

export default function Home({
  banners,
  categories,
  featuredProducts = [],
}: HomeProps) {
  return (
    <div className="lg:space-y-12 space-y-6 lg:mb-12 mb-6">
      <BannerCarousel banners={banners} />
      <CategorySection categories={categories} />
      {featuredProducts.length > 0 && (
        <FeaturedProductsSection products={featuredProducts} />
      )}
    </div>
  );
}
