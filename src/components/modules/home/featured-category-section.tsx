"use client";

import Image from "next/image";
import Link from "next/link";
import type { FeaturedCategoryWithProducts } from "@/lib/type";
import ProductCard from "@/components/shared/product-card";
import SectionHeader from "@/components/shared/section-header";
import Carousel from "@/components/shared/carousel";
import { Button } from "@/components/ui/button";

interface FeaturedCategorySectionProps {
  featuredCategory: FeaturedCategoryWithProducts;
}

/**
 * Extract YouTube embed URL from various YouTube link formats.
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
 */
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    // youtube.com/watch?v=VIDEO_ID
    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.searchParams.has("v")
    ) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }

    // youtu.be/VIDEO_ID
    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // youtube.com/embed/VIDEO_ID (already an embed URL)
    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname.startsWith("/embed/")
    ) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

export default function FeaturedCategorySection({
  featuredCategory,
}: FeaturedCategorySectionProps) {
  const { title, banner_url, youtube_video_link, products, category } =
    featuredCategory;
  const embedUrl = youtube_video_link
    ? getYouTubeEmbedUrl(youtube_video_link)
    : null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 md:space-y-14 lg:space-y-16">
      {banner_url && (
        <div className="relative aspect-21/8 w-full overflow-hidden rounded-2xl border border-border/70 shadow-lg">
          <Image
            src={banner_url}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/10 via-transparent to-transparent" />
        </div>
      )}

      {products.length > 0 && (
        <section>
          <SectionHeader
            title={title}
            align="center"
            showDecorator={true}
            animated={true}
          />

          <Carousel
            items={products}
            renderItem={(product) => <ProductCard product={product} />}
            itemKey={(product) => product.id}
            slideClassName="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5"
            ariaLabelPrevious={`Previous ${title} products`}
            ariaLabelNext={`Next ${title} products`}
            ariaLabelDot={(index) =>
              `Go to ${title} product slide ${index + 1}`
            }
          />

          <div className="flex justify-center mt-6">
            <Button variant="default" asChild className="px-7">
              <Link
                href={`/category/${category.slug}`}
                className="flex items-center gap-2"
              >
                View More
              </Link>
            </Button>
          </div>
        </section>
      )}

      {embedUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/70 shadow-lg">
          <iframe
            src={embedUrl}
            title={`${title} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      )}
    </div>
  );
}
