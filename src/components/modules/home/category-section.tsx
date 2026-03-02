"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/type";
import SectionHeader from "@/components/shared/section-header";
import Carousel from "@/components/shared/carousel";

interface CategorySectionProps {
  categories: Category[];
}

const CategoryCard = ({ category }: { category: Category }) => (
  <Link href={`/category/${category.slug}`} className="group block">
    <div className="relative overflow-hidden border border-border bg-background shadow-sm hover:shadow-xl hover:border-pink-200 dark:hover:border-pink-800 transition-all duration-300 transform">
      {/* Category Image */}
      <div className="relative aspect-square overflow-hidden bg-muted aspect-square">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out aspect-square"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 aspect-square">
            <div className="bg-linear-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 p-4 rounded-full aspect-square">
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
      </div>

      {/* Category Name */}
      <div className="p-2 py-3 lg:p-4 text-center bg-linear-to-br from-pink-50/50 to-purple-50/50 transition-all duration-300">
        <h3 className="font-semibold text-pink-600 transition-colors duration-300 line-clamp-2 text-xs sm:text-sm md:text-base line-clam-1">
          {category.name}
        </h3>
      </div>
    </div>
  </Link>
);

export default function CategorySection({ categories }: CategorySectionProps) {
  if (categories.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <section>
        {/* Section Header */}
        <SectionHeader
          title="Category"
          description="Discover our carefully curated collection of premium fashion for every style and occasion"
          align="center"
          showDecorator={true}
          animated={true}
        />

        {/* Categories Carousel */}
        <Carousel
          items={categories}
          renderItem={(category) => <CategoryCard category={category} />}
          itemKey={(category) => category.id}
          itemsPerSlide={{ mobile: 2, tablet: 4, desktop: 4 }}
          slideClassName="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2 lg:gap-4"
          ariaLabelPrevious="Previous categories"
          ariaLabelNext="Next categories"
          ariaLabelDot={(index) => `Go to slide ${index + 1}`}
        />
      </section>
    </div>
  );
}
