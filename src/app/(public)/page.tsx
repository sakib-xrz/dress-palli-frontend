import Home from "@/components/modules/home";
import { getServerBanners } from "@/lib/server/banner";
import { getServerPublicCategories } from "@/lib/server/categories";
import { getServerFeaturedProducts } from "@/lib/server/products";

export default async function HomePage() {
  const [banners, categories, featuredProducts] = await Promise.all([
    getServerBanners(),
    getServerPublicCategories(),
    getServerFeaturedProducts(),
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
    />
  );
}
