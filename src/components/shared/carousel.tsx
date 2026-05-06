"use client";

import { useEffect, useRef, useState } from "react";
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
  /** Override class for the dots container (replaces default positioning) */
  dotsClassName?: string;
  /** Enable autoplay - automatically advance to next slide */
  autoplay?: boolean;
  /** Autoplay interval in milliseconds */
  autoplayInterval?: number;
  /** Enable infinite loop (seamless Swiper-style looping with cloned boundary slides) */
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
  dotsClassName,
  autoplay = true,
  autoplayInterval = 5000,
  loop = true,
}: CarouselProps<T>) {
  const [currentSlide, setCurrentSlide] = useState(loop ? 1 : 0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [enableTransition, setEnableTransition] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const isSnapping = useRef(false);
  const isHovered = useRef(false);
  const [autoplayResetKey, setAutoplayResetKey] = useState(0);

  const resetAutoplay = () => setAutoplayResetKey((k) => k + 1);

  // ---- Screen-size detection ----
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
  const transitionDuration = 500; // must match Tailwind's duration-500

  const buildSlides = (): T[][] => {
    const result: T[][] = [];

    if (loop) {
      const lastStart = (totalSlides - 1) * itemsPerSlideCount;
      result.push(items.slice(lastStart, lastStart + itemsPerSlideCount));
    }

    for (let i = 0; i < totalSlides; i++) {
      const start = i * itemsPerSlideCount;
      result.push(items.slice(start, start + itemsPerSlideCount));
    }

    if (loop) {
      result.push(items.slice(0, itemsPerSlideCount));
    }

    return result;
  };

  const slides = showCarousel ? buildSlides() : [];

  // Map internal index → real slide index (0-based) for dots highlight
  const realSlideIndex = loop
    ? currentSlide === 0
      ? totalSlides - 1
      : currentSlide === totalSlides + 1
        ? 0
        : currentSlide - 1
    : currentSlide;

  useEffect(() => {
    if (!loop || isSnapping.current) return;

    if (currentSlide === totalSlides + 1) {
      isSnapping.current = true;
      const id = setTimeout(() => {
        setEnableTransition(false);
        setCurrentSlide(1);
      }, transitionDuration + 20);
      return () => clearTimeout(id);
    }

    if (currentSlide === 0) {
      isSnapping.current = true;
      const id = setTimeout(() => {
        setEnableTransition(false);
        setCurrentSlide(totalSlides);
      }, transitionDuration + 20);
      return () => clearTimeout(id);
    }
  }, [loop, currentSlide, totalSlides, transitionDuration]);

  // Re-enable the CSS transition after the instant snap has painted
  useEffect(() => {
    if (!enableTransition) {
      const id = setTimeout(() => {
        setEnableTransition(true);
        isSnapping.current = false;
      }, 50);
      return () => clearTimeout(id);
    }
  }, [enableTransition]);

  // ---- Autoplay (pauses on hover, resets on user interaction) ----
  useEffect(() => {
    if (!autoplay || !showCarousel || totalSlides <= 1) return;

    const interval = setInterval(() => {
      if (isHovered.current) return;
      if (loop) {
        if (!isSnapping.current) {
          setCurrentSlide((prev) => prev + 1);
        }
      } else {
        setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
      }
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [autoplay, autoplayInterval, loop, showCarousel, totalSlides, autoplayResetKey]);

  // ---- Navigation helpers ----
  const goToPrevious = () => {
    if (loop) {
      if (isSnapping.current) return;
      setCurrentSlide((prev) => prev - 1);
    } else {
      setCurrentSlide((prev) => Math.max(0, prev - 1));
    }
    resetAutoplay();
  };

  const goToNext = () => {
    if (loop) {
      if (isSnapping.current) return;
      setCurrentSlide((prev) => prev + 1);
    } else {
      setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
    }
    resetAutoplay();
  };

  const goToSlide = (realIndex: number) => {
    if (loop) {
      if (isSnapping.current) return;
      setCurrentSlide(realIndex + 1); // +1 because index 0 is the prepended clone
    } else {
      setCurrentSlide(realIndex);
    }
    resetAutoplay();
  };

  // ---- Touch / swipe ----
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
    // goToNext / goToPrevious already call resetAutoplay()
    if (distance > 30) goToNext();
    if (distance < -30) goToPrevious();
  };

  // ---- Render ----
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

  // Carousel with slides
  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => (isHovered.current = true)}
      onMouseLeave={() => (isHovered.current = false)}
    >
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={cn(
            "flex",
            enableTransition && "transition-transform duration-500 ease-in-out",
          )}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slideItems, slideIndex) => (
            <div key={slideIndex} className={cn("min-w-full", slideClassName)}>
              {slideItems.map((item) => (
                <div key={`${slideIndex}-${itemKey(item)}`}>
                  {renderItem(item)}
                </div>
              ))}
            </div>
          ))}
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
              "absolute lg:left-4 left-2 top-1/2 -translate-y-1/2 bg-background/85 hover:bg-card text-foreground rounded-full border border-border/70 lg:p-2 p-1.5 shadow-lg transition-all duration-200 z-30 disabled:opacity-50 disabled:cursor-not-allowed hidden lg:block",
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
              "absolute lg:right-4 right-2 top-1/2 -translate-y-1/2 bg-background/85 hover:bg-card text-foreground rounded-full border border-border/70 lg:p-2 p-1.5 shadow-lg transition-all duration-200 z-30 disabled:opacity-50 disabled:cursor-not-allowed hidden lg:block",
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
        <div className={dotsClassName ?? "flex justify-center gap-2 mt-6"}>
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                index === realSlideIndex
                  ? "bg-primary lg:w-8 w-5"
                  : "bg-border lg:w-3 w-2 hover:bg-accent",
              )}
              aria-label={ariaLabelDot(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
