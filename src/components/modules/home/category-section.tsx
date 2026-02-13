"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/type";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CategorySectionProps {
  categories: Category[];
}

const CategoryCard = ({ category }: { category: Category }) => (
  <Link href={`/category/${category.slug}`} className="group block">
    <div className="relative overflow-hidden rounded-xl border border-border bg-background shadow-sm hover:shadow-xl hover:border-pink-200 dark:hover:border-pink-800 transition-all duration-300 transform">
      {/* Category Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
            <div className="bg-linear-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 p-4 rounded-full">
              <svg
                className="w-12 h-12 text-pink-400 dark:text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-linear-to-t from-pink-500/0 via-transparent to-transparent group-hover:from-pink-500/20 dark:group-hover:from-pink-500/30 transition-all duration-300 pointer-events-none" />
      </div>

      {/* Category Name */}
      <div className="p-4 text-center bg-background group-hover:bg-linear-to-br group-hover:from-pink-50/50 group-hover:to-purple-50/50 dark:group-hover:from-pink-950/10 dark:group-hover:to-purple-950/10 transition-all duration-300">
        <h3 className="font-semibold text-foreground group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300 line-clamp-2 text-sm md:text-base">
          {category.name}
        </h3>
      </div>

      {/* Decorative Border Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-linear-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20" />
      </div>
    </div>
  </Link>
);

export default function CategorySection({ categories }: CategorySectionProps) {
  const [categorySlide, setCategorySlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const goToPreviousCategory = (
    event?: React.MouseEvent | React.TouchEvent,
  ) => {
    event?.preventDefault();
    event?.stopPropagation();
    setCategorySlide((prev) => Math.max(0, prev - 1));
  };

  const goToNextCategory = (event?: React.MouseEvent | React.TouchEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    const itemsPerSlide = isMobile ? 2 : 4;
    const maxSlide = Math.ceil(categories.length / itemsPerSlide) - 1;
    setCategorySlide((prev) => Math.min(maxSlide, prev + 1));
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
      goToNextCategory();
    }
    if (isRightSwipe) {
      goToPreviousCategory();
    }
  };

  if (categories.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <section>
        {/* Section Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold pb-3 bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Category
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Discover our carefully curated collection of premium fashion for
            every style and occasion
          </p>
        </div>

        {/* Categories Display - Grid or Carousel */}
        {categories.length <= 4 ? (
          // Grid for 4 or fewer categories
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          // Carousel for more than 4 categories
          <div className="relative">
            <div
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${categorySlide * 100}%)` }}
              >
                {Array.from({
                  length: Math.ceil(categories.length / (isMobile ? 2 : 4)),
                }).map((_, slideIndex) => {
                  const itemsPerSlide = isMobile ? 2 : 4;
                  const startIndex = slideIndex * itemsPerSlide;
                  const slideCategories = categories.slice(
                    startIndex,
                    startIndex + itemsPerSlide,
                  );

                  return (
                    <div
                      key={slideIndex}
                      className="min-w-full grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6"
                    >
                      {slideCategories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            {categories.length > (isMobile ? 2 : 4) && (
              <>
                <button
                  onClick={goToPreviousCategory}
                  disabled={categorySlide === 0}
                  className={cn(
                    "absolute lg:left-4 left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-pink-100 dark:bg-gray-800/80 dark:hover:bg-pink-900/20 text-foreground rounded-full lg:p-2 p-1.5 shadow-lg transition-all duration-200 z-10 disabled:opacity-50 disabled:pointer-events-none",
                    categorySlide === 0 && "hidden",
                  )}
                  aria-label="Previous categories"
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
                  onClick={goToNextCategory}
                  disabled={
                    categorySlide >=
                    Math.ceil(categories.length / (isMobile ? 2 : 4)) - 1
                  }
                  className={cn(
                    "absolute lg:right-4 right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-pink-100 dark:bg-gray-800/80 dark:hover:bg-pink-900/20 text-foreground rounded-full lg:p-2 p-1.5 shadow-lg transition-all duration-200 z-10 disabled:opacity-50 disabled:pointer-events-none",
                    categorySlide >=
                      Math.ceil(categories.length / (isMobile ? 2 : 4)) - 1 &&
                      "hidden",
                  )}
                  aria-label="Next categories"
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
            {categories.length > (isMobile ? 2 : 4) && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({
                  length: Math.ceil(categories.length / (isMobile ? 2 : 4)),
                }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCategorySlide(index)}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      index === categorySlide
                        ? "bg-pink-600 dark:bg-pink-500 lg:w-8 w-5"
                        : "bg-gray-300 dark:bg-gray-700 lg:w-3 w-2 hover:bg-pink-400 dark:hover:bg-pink-600"
                    }`}
                    aria-label={`Go to category slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
