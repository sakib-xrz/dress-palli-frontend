"use client";

import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@/lib/type";
import Carousel from "@/components/shared/carousel";

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <Carousel
        items={banners}
        renderItem={(banner) => {
          const isFirst = banner === banners[0];
          return banner.link_url ? (
            <Link href={banner.link_url} className="block">
              <div className="relative aspect-21/8 w-full overflow-hidden rounded-2xl border border-border/70 shadow-lg">
                <Image
                  src={banner.image_url}
                  alt={`Banner ${banner.id}`}
                  fill
                  className="object-cover"
                  priority={isFirst}
                  quality={100}
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/12 via-transparent to-transparent" />
              </div>
            </Link>
          ) : (
            <div className="relative aspect-21/8 w-full overflow-hidden rounded-2xl border border-border/70 shadow-lg">
              <Image
                src={banner.image_url}
                alt={`Banner ${banner.id}`}
                fill
                className="object-cover"
                priority={isFirst}
                quality={100}
              />
              <div className="absolute inset-0 bg-linear-to-r from-black/12 via-transparent to-transparent" />
            </div>
          );
        }}
        itemKey={(banner) => banner.id}
        itemsPerSlide={{ mobile: 1, tablet: 1, desktop: 1 }}
        slideClassName="grid grid-cols-1"
        className="rounded-2xl"
        showArrows={true}
        showDots={true}
        dotsClassName="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-2 backdrop-blur"
        autoplay={true}
        autoplayInterval={5000}
        loop={true}
        ariaLabelPrevious="Previous slide"
        ariaLabelNext="Next slide"
      />
    </div>
  );
}
