import { notFound } from "next/navigation";
import { getServerProductBySlug } from "@/lib/server/products";
import ProductDetail from "./_components/product-detail";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getServerProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description
      ? stripHtml(product.description).slice(0, 500)
      : undefined,
    image: product.images.map((img) => img.url),
    category: product.category.name,
    sku: product.id,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: product.effective_price,
      highPrice: product.sell_price,
      priceCurrency: "BDT",
      availability:
        totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      offerCount: product.variants.length,
    },
    brand: {
      "@type": "Brand",
      name: "Dress Palli",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category.name,
        item: `/category/${product.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetail product={product} />
    </>
  );
}
