"use client";

import { useEffect, useState } from "react";
import type { PublicProduct } from "@/lib/type";
import ProductCard from "@/components/shared/product-card";
import SectionHeader from "@/components/shared/section-header";
import { cn } from "@/lib/utils";

interface FeaturedProductsSectionProps {
  products: PublicProduct[];
  title?: string;
  description?: string;
}

export default function FeaturedProductsSection({
  products,
  title = "Featured Products",
  description = "Discover our handpicked collection of trending and premium fashion pieces",
}: FeaturedProductsSectionProps) {
  const [productSlide, setProductSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const getItemsPerSlide = () => {
    if (isMobile) return 2;
    if (isTablet) return 3;
    return 4;
  };

  const goToPreviousProduct = (event?: React.MouseEvent | React.TouchEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    setProductSlide((prev) => Math.max(0, prev - 1));
  };

  const goToNextProduct = (event?: React.MouseEvent | React.TouchEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    const itemsPerSlide = getItemsPerSlide();
    const maxSlide = Math.ceil(products.length / itemsPerSlide) - 1;
    setProductSlide((prev) => Math.min(maxSlide, prev + 1));
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
      goToNextProduct();
    }
    if (isRightSwipe) {
      goToPreviousProduct();
    }
  };

  if (products.length === 0) return null;

  const itemsPerSlide = getItemsPerSlide();
  const showCarousel = products.length > itemsPerSlide;

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <section>
        {/* Section Header */}
        <SectionHeader
          title={title}
          description={description}
          align="center"
          showDecorator={true}
          animated={true}
        />

        {/* Products Display - Grid or Carousel */}
        {!showCarousel ? (
          // Simple Grid for few products
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-2 lg:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          // Carousel for many products
          <div className="relative">
            <div
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${productSlide * 100}%)` }}
              >
                {Array.from({
                  length: Math.ceil(products.length / itemsPerSlide),
                }).map((_, slideIndex) => {
                  const startIndex = slideIndex * itemsPerSlide;
                  const slideProducts = products.slice(
                    startIndex,
                    startIndex + itemsPerSlide,
                  );

                  return (
                    <div
                      key={slideIndex}
                      className="min-w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-2 lg:gap-4"
                    >
                      {slideProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            {showCarousel && (
              <>
                <button
                  onClick={goToPreviousProduct}
                  disabled={productSlide === 0}
                  className={cn(
                    "absolute lg:left-4 left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-pink-100 dark:bg-gray-800/80 dark:hover:bg-pink-900/20 text-foreground rounded-full lg:p-2 p-1.5 shadow-lg transition-all duration-200 z-10 disabled:opacity-50 disabled:pointer-events-none hidden lg:block",
                    productSlide === 0 && "hidden",
                  )}
                  aria-label="Previous products"
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
                  onClick={goToNextProduct}
                  disabled={
                    productSlide >=
                    Math.ceil(products.length / itemsPerSlide) - 1
                  }
                  className={cn(
                    "absolute lg:right-4 right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-pink-100 dark:bg-gray-800/80 dark:hover:bg-pink-900/20 text-foreground rounded-full lg:p-2 p-1.5 shadow-lg transition-all duration-200 z-10 disabled:opacity-50 disabled:pointer-events-none hidden lg:block",
                    productSlide >=
                      Math.ceil(products.length / itemsPerSlide) - 1 &&
                      "hidden",
                  )}
                  aria-label="Next products"
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
            {showCarousel && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({
                  length: Math.ceil(products.length / itemsPerSlide),
                }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setProductSlide(index)}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      index === productSlide
                        ? "bg-pink-600 dark:bg-pink-500 lg:w-8 w-5"
                        : "bg-gray-300 dark:bg-gray-700 lg:w-3 w-2 hover:bg-pink-400 dark:hover:bg-pink-600"
                    }`}
                    aria-label={`Go to product slide ${index + 1}`}
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
