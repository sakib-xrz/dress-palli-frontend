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
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="aspect-square object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-muted to-card">
            <div className="rounded-full bg-linear-to-br from-card to-muted p-4">
              <svg
                className="h-12 w-12 text-accent"
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

      <div className="bg-linear-to-b from-card to-muted/50 p-3 text-center lg:p-4">
        <h3 className="line-clamp-2 text-xs font-semibold text-foreground transition-colors duration-300 group-hover:text-primary sm:text-sm md:text-base">
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
        <SectionHeader
          title="Shop by Category"
          description="Discover our carefully curated collection of premium fashion for every style and occasion"
          align="center"
          showDecorator={true}
          animated={true}
        />

        <Carousel
          items={categories}
          renderItem={(category) => <CategoryCard category={category} />}
          itemKey={(category) => category.id}
          itemsPerSlide={{ mobile: 2, tablet: 4, desktop: 4 }}
          slideClassName="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-3 lg:gap-5"
          ariaLabelPrevious="Previous categories"
          ariaLabelNext="Next categories"
          ariaLabelDot={(index) => `Go to slide ${index + 1}`}
        />
      </section>
    </div>
  );
}
