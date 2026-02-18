"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { cn } from "@/lib/utils";
import type { PublicProductImage } from "@/lib/type";
import {
  IconZoomIn,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

interface ProductImageGalleryProps {
  images: PublicProductImage[];
  productName: string;
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const slides = images.map((img) => ({
    src: img.url,
    alt: img.alt_text || productName,
  }));

  const currentImage = images[selectedIndex];

  const scrollThumbs = (direction: "left" | "right") => {
    if (!thumbsRef.current) return;
    const scrollAmount = thumbsRef.current.offsetWidth * 0.6;
    thumbsRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (images.length === 0) {
    return (
      <div className="aspect-3/4 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
        <svg
          className="w-16 h-16 text-gray-300"
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
    );
  }

  return (
    <div className="flex flex-col gap-2.5 min-w-0">
      {/* Main Image */}
      <div
        className="relative aspect-3/4 overflow-hidden rounded-xl bg-gray-50 cursor-zoom-in group border border-gray-200/80"
        onClick={() => setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Click to open image gallery"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setLightboxOpen(true);
          }
        }}
      >
        {currentImage && (
          <Image
            key={selectedIndex}
            src={currentImage.url}
            alt={currentImage.alt_text || productName}
            fill
            className={cn(
              "object-cover transition-all duration-500",
              mainImageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm",
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
            onLoad={() => setMainImageLoaded(true)}
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
            <IconZoomIn className="size-5 text-gray-700" />
          </div>
        </div>

        {/* Image counter badge */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="relative min-w-0">
          {/* Scroll arrows for many thumbnails */}
          {images.length > 4 && (
            <>
              <button
                type="button"
                onClick={() => scrollThumbs("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 size-7 rounded-full bg-white/90 shadow-md border border-gray-200 items-center justify-center hover:bg-white transition-colors hidden sm:flex"
                aria-label="Scroll thumbnails left"
              >
                <IconChevronLeft className="size-3.5 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => scrollThumbs("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 size-7 rounded-full bg-white/90 shadow-md border border-gray-200 items-center justify-center hover:bg-white transition-colors hidden sm:flex"
                aria-label="Scroll thumbnails right"
              >
                <IconChevronRight className="size-3.5 text-gray-600" />
              </button>
            </>
          )}

          <div
            ref={thumbsRef}
            className="flex gap-2 overflow-x-auto scroll-smooth thumb-scroll-hide"
          >
            {images.map((img, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSelectedIndex(index);
                  setMainImageLoaded(false);
                }}
                className={cn(
                  "relative shrink-0 w-14 h-[4.5rem] sm:w-[4.5rem] sm:h-[5.5rem] rounded-lg overflow-hidden border-2 transition-all duration-200",
                  selectedIndex === index
                    ? "border-pink-500 shadow-md ring-1 ring-pink-500/30"
                    : "border-gray-200 hover:border-gray-400",
                )}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text || `${productName} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={selectedIndex}
        slides={slides}
        plugins={[Fullscreen, Zoom, Thumbnails, Counter]}
        on={{
          view: ({ index }) => setSelectedIndex(index),
        }}
        carousel={{
          finite: images.length <= 1,
        }}
        thumbnails={{
          position: "bottom",
          width: 80,
          height: 80,
          gap: 8,
          borderRadius: 4,
        }}
        zoom={{
          maxZoomPixelRatio: 3,
        }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.92)" },
        }}
      />
    </div>
  );
}
