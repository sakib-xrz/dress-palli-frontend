"use client";

import type { PublicProduct } from "@/lib/type";
import ProductCard from "@/components/shared/product-card";
import SectionHeader from "@/components/shared/section-header";
import Carousel from "@/components/shared/carousel";

interface FeaturedProductsSectionProps {
  products: PublicProduct[];
  title?: string;
  description?: string;
}

export default function ProductsSection({
  products,
  title = "Featured Products",
  description = "Discover our handpicked collection of trending and premium fashion pieces",
}: FeaturedProductsSectionProps) {
  if (products.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <section>
        <SectionHeader
          title={title}
          description={description}
          align="center"
          showDecorator={true}
          animated={true}
        />

        <Carousel<PublicProduct>
          items={products}
          renderItem={(product) => <ProductCard product={product} />}
          itemKey={(product) => product.id}
          slideClassName="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5"
          ariaLabelPrevious="Previous products"
          ariaLabelNext="Next products"
          ariaLabelDot={(index) => `Go to product slide ${index + 1}`}
        />
      </section>
    </div>
  );
}
