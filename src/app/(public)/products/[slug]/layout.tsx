import type { Metadata } from "next";
import { getServerProductBySlug } from "@/lib/server/products";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getServerProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const plainDescription = product.description
    ? stripHtml(product.description).slice(0, 160)
    : `Buy ${product.name} at the best price from Dress Point.`;

  const ogImages = product.images.map((img) => ({
    url: img.url,
    alt: img.alt_text || product.name,
    width: 1200,
    height: 630,
  }));

  return {
    title: `${product.name}`,
    description: plainDescription,
    keywords: [
      product.name,
      product.category.name,
      "Dress Point",
      "buy online",
      "fashion",
      "clothing",
    ],
    openGraph: {
      title: product.name,
      description: plainDescription,
      type: "website",
      images: ogImages,
      siteName: "Dress Point",
      url: `/products/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: plainDescription,
      images: product.primary_image ? [product.primary_image.url] : [],
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/products/${product.slug}`,
    },
  };
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
