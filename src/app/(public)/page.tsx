import Home from "@/components/modules/home";
import { getServerBanners } from "@/lib/server/banner";
import { getServerPublicCategories } from "@/lib/server/categories";
import {
  getServerBestSellingProducts,
  getServerFeaturedProducts,
  getServerNewProducts,
} from "@/lib/server/products";

export default async function HomePage() {
  const [banners, categories, featuredProducts, newProducts, bestSellingProducts] =
    await Promise.all([
    getServerBanners(),
    getServerPublicCategories(),
    getServerFeaturedProducts(),
    getServerNewProducts(),
    getServerBestSellingProducts(),
  ]);

  // Filter parent categories (categories with no parent_id)
  const parentCategories = categories.filter(
    (category) => category.parent_id === null && category.is_active
  );

  return (
    <Home
      banners={banners}
      categories={parentCategories}
      featuredProducts={featuredProducts}
      newProducts={newProducts}
      bestSellingProducts={bestSellingProducts}
    />
  );
}
