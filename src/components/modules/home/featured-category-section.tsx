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
    <div className="w-full max-w-7xl mx-auto px-4 lg:space-y-20 space-y-8">
      {/* Banner */}
      {banner_url && (
        <div className="relative w-full aspect-21/8 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={banner_url}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
          />
        </div>
      )}

      {/* Section Header + Products */}
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
            ariaLabelPrevious={`Previous ${title} products`}
            ariaLabelNext={`Next ${title} products`}
            ariaLabelDot={(index) =>
              `Go to ${title} product slide ${index + 1}`
            }
          />

          {/* View More Button */}
          <div className="flex justify-center mt-6">
            <Button variant="secondary" asChild>
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

      {/* YouTube Video Embed */}
      {embedUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
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
