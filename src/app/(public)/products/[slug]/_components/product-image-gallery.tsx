"use client";

import { useState } from "react";
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
import { IconZoomIn } from "@tabler/icons-react";

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

  console.log(images);

  const slides = images.map((img) => ({
    src: img.url,
    alt: img.alt_text || productName,
  }));

  const currentImage = images[selectedIndex];

  if (images.length === 0) {
    return (
      <div className="aspect-3/4 rounded-lg bg-gray-100 flex items-center justify-center">
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
    <div className="space-y-3">
      {/* Main Image */}
      <div
        className="relative aspect-3/4 overflow-hidden rounded-lg bg-gray-50 cursor-zoom-in group"
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
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            onLoad={() => setMainImageLoaded(true)}
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <IconZoomIn className="size-6 text-gray-700" />
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setSelectedIndex(index);
                setMainImageLoaded(false);
              }}
              className={cn(
                "relative shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-md overflow-hidden border-2 transition-all duration-200",
                selectedIndex === index
                  ? "border-pink-500 shadow-md"
                  : "border-transparent hover:border-gray-300",
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt_text || `${productName} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
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
      />
    </div>
  );
}
