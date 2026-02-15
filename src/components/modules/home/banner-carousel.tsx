"use client";

import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@/lib/type";
import { useEffect, useState } from "react";

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length, currentSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 30;
    const isRightSwipe = distance < -30;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (banners.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-lg"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full">
            {banner.link_url ? (
              <Link href={banner.link_url} className="block">
                <div className="relative w-full aspect-21/8">
                  <Image
                    src={banner.image_url}
                    alt={`Banner ${banner.id}`}
                    fill
                    className="object-cover"
                    priority={currentSlide === 0}
                    quality={100}
                  />
                </div>
              </Link>
            ) : (
              <div className="relative w-full aspect-21/8">
                <Image
                  src={banner.image_url}
                  alt={`Banner ${banner.id}`}
                  fill
                  className="object-cover"
                  priority={currentSlide === 0}
                  quality={100}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute lg:left-4 left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-pink-100 dark:bg-gray-800/80 dark:hover:bg-pink-900/20 text-foreground rounded-full lg:p-2 p-1.5 shadow-lg transition-all duration-200 z-10 hidden lg:block"
            aria-label="Previous slide"
          >
            <svg
              className="lg:w-5 lg:h-5 w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute lg:right-4 right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-pink-100 dark:bg-gray-800/80 dark:hover:bg-pink-900/20 text-foreground rounded-full lg:p-2 p-1.5 shadow-lg transition-all duration-200 z-10 hidden lg:block"
            aria-label="Next slide"
          >
            <svg
              className="lg:w-5 lg:h-5 w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-pink-600 lg:w-8 w-5"
                  : "bg-gray-300 dark:bg-gray-700 w-2 hover:bg-pink-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
