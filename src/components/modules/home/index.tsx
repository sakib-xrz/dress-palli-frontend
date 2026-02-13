"use client";

import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@/lib/type";
import { useEffect, useState } from "react";

interface HomeProps {
  banners: Banner[];
}

export default function Home({ banners }: HomeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <div>
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <div className="relative overflow-hidden rounded-lg shadow-lg">
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
                className="absolute lg:left-4 left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all opacity-50 hover:opacity-100"
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
                className="absolute lg:right-4 right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all opacity-50 hover:opacity-100"
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
                  className={`lg:w-3 lg:h-3 w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? "bg-white lg:w-8 w-5"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
