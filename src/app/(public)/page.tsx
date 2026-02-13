import Home from "@/components/modules/home";
import { getServerBanners } from "@/lib/server/banner";

export default async function HomePage() {
  const banners = await getServerBanners();

  return <Home banners={banners} />;
}
