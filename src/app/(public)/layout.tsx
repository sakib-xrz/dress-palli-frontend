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
    <>
      <Navbar categories={categories} />
      {children}
      <Footer />
    </>
  );
}
