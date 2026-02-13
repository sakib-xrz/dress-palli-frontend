import type { Banner, Category } from "@/lib/type";
import BannerCarousel from "./banner-carousel";
import CategorySection from "./category-section";

interface HomeProps {
  banners: Banner[];
  categories: Category[];
}

export default function Home({ banners, categories }: HomeProps) {
  return (
    <div className="lg:space-y-12 space-y-6 lg:mb-12 mb-6">
      <BannerCarousel banners={banners} />
      <CategorySection categories={categories} />
    </div>
  );
}
