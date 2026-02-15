"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface CarouselBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

const DEFAULT_ITEMS_PER_SLIDE: CarouselBreakpoints = {
  mobile: 2,
  tablet: 3,
  desktop: 4,
};

export interface CarouselProps<T> {
  /** Array of items to display in the carousel */
  items: T[];
  /** Function to render each item */
  renderItem: (item: T) => React.ReactNode;
  /** Function to get unique key for each item */
  itemKey: (item: T) => string | number;
  /** Items per slide at each breakpoint (mobile < 768px, tablet 768-1024px, desktop >= 1024px) */
  itemsPerSlide?: CarouselBreakpoints;
  /** Grid/slide layout class (e.g. "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2") */
  slideClassName?: string;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dots navigation */
  showDots?: boolean;
  /** Aria label for previous button */
  ariaLabelPrevious?: string;
  /** Aria label for next button */
  ariaLabelNext?: string;
  /** Aria label for dot buttons */
  ariaLabelDot?: (index: number) => string;
  /** Additional class for the carousel container */
  className?: string;
  /** Enable autoplay - automatically advance to next slide */
  autoplay?: boolean;
  /** Autoplay interval in milliseconds */
  autoplayInterval?: number;
  /** Enable one-way loop - when at last slide, next goes to first; when at first, previous goes to last */
  loop?: boolean;
}

export default function Carousel<T>({
  items,
  renderItem,
  itemKey,
  itemsPerSlide = DEFAULT_ITEMS_PER_SLIDE,
  slideClassName = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-2 lg:gap-4",
  showArrows = true,
  showDots = true,
  ariaLabelPrevious = "Previous",
  ariaLabelNext = "Next",
  ariaLabelDot = (index) => `Go to slide ${index + 1}`,
  className,
  autoplay = true,
  autoplayInterval = 5000,
  loop = true,
}: CarouselProps<T>) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const getItemsPerSlide = (): number => {
    if (isMobile) return itemsPerSlide.mobile;
    if (isTablet) return itemsPerSlide.tablet;
    return itemsPerSlide.desktop;
  };

  const itemsPerSlideCount = getItemsPerSlide();
  const totalSlides = Math.ceil(items.length / itemsPerSlideCount);
  const showCarousel = items.length > itemsPerSlideCount;

  // Autoplay - advance to next slide at interval
  useEffect(() => {
    if (!autoplay || !showCarousel || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        loop ? (prev + 1) % totalSlides : Math.min(totalSlides - 1, prev + 1),
      );
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [autoplay, autoplayInterval, loop, showCarousel, totalSlides]);

  const goToPrevious = () => {
    setCurrentSlide((prev) =>
      loop ? (prev - 1 + totalSlides) % totalSlides : Math.max(0, prev - 1),
    );
  };

  const goToNext = () => {
    setCurrentSlide((prev) =>
      loop ? (prev + 1) % totalSlides : Math.min(totalSlides - 1, prev + 1),
    );
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

    if (isLeftSwipe) goToNext();
    if (isRightSwipe) goToPrevious();
  };

  if (items.length === 0) return null;

  // Simple grid when all items fit in one slide
  if (!showCarousel) {
    return (
      <div className={cn(slideClassName, className)}>
        {items.map((item) => (
          <div key={itemKey(item)}>{renderItem(item)}</div>
        ))}
      </div>
    );
  }

  // Carousel with multiple slides
  return (
    <div className={cn("relative", className)}>
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => {
            const startIndex = slideIndex * itemsPerSlideCount;
            const slideItems = items.slice(
              startIndex,
              startIndex + itemsPerSlideCount,
            );

            return (
              <div
                key={slideIndex}
                className={cn("min-w-full", slideClassName)}
              >
                {slideItems.map((item) => (
                  <div key={itemKey(item)}>{renderItem(item)}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrevious();
            }}
            disabled={!loop && currentSlide === 0}
            className={cn(
              "absolute lg:left-4 left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-pink-100 dark:bg-gray-800/80 dark:hover:bg-pink-900/20 text-foreground rounded-full lg:p-2 p-1.5 shadow-lg transition-all duration-200 z-30 disabled:opacity-50 disabled:cursor-not-allowed hidden lg:block",
              !loop && currentSlide === 0 && "hidden",
            )}
            aria-label={ariaLabelPrevious}
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            disabled={!loop && currentSlide >= totalSlides - 1}
            className={cn(
              "absolute lg:right-4 right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-pink-100 dark:bg-gray-800/80 dark:hover:bg-pink-900/20 text-foreground rounded-full lg:p-2 p-1.5 shadow-lg transition-all duration-200 z-30 disabled:opacity-50 disabled:cursor-not-allowed hidden lg:block",
              !loop && currentSlide >= totalSlides - 1 && "hidden",
            )}
            aria-label={ariaLabelNext}
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
      {showDots && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                index === currentSlide
                  ? "bg-pink-600 dark:bg-pink-500 lg:w-8 w-5"
                  : "bg-gray-300 dark:bg-gray-700 lg:w-3 w-2 hover:bg-pink-400 dark:hover:bg-pink-600",
              )}
              aria-label={ariaLabelDot(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
