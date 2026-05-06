import Footer from "./_components/footer";
import Navbar from "./_components/navbar";
import { getServerPublicCategories } from "@/lib/server/categories";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getServerPublicCategories();

  return (
    <div className="relative min-h-screen">
      <Navbar categories={categories} />
      <main className="relative pb-12 pt-6 md:pt-8">{children}</main>
      <Footer />
    </div>
  );
}
