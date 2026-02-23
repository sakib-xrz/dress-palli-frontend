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
    <Carousel
      items={banners}
      renderItem={(banner) => {
        const isFirst = banner === banners[0];
        return banner.link_url ? (
          <Link href={banner.link_url} className="block">
            <div className="relative w-full aspect-21/9">
              <Image
                src={banner.image_url}
                alt={`Banner ${banner.id}`}
                fill
                className="object-cover"
                priority={isFirst}
                quality={100}
              />
            </div>
          </Link>
        ) : (
          <div className="relative w-full aspect-21/9">
            <Image
              src={banner.image_url}
              alt={`Banner ${banner.id}`}
              fill
              className="object-cover"
              priority={isFirst}
              quality={100}
            />
          </div>
        );
      }}
      itemKey={(banner) => banner.id}
      itemsPerSlide={{ mobile: 1, tablet: 1, desktop: 1 }}
      slideClassName="grid grid-cols-1"
      className="rounded-lg shadow-lg"
      showArrows={true}
      showDots={true}
      dotsClassName="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
      autoplay={true}
      autoplayInterval={5000}
      loop={true}
      ariaLabelPrevious="Previous slide"
      ariaLabelNext="Next slide"
    />
  );
}
