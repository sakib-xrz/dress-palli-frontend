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
        {/* Section Header */}
        <SectionHeader
          title={title}
          description={description}
          align="center"
          showDecorator={true}
          animated={true}
        />

        {/* Products Display - Grid or Carousel */}
        <Carousel<PublicProduct>
          items={products}
          renderItem={(product) => <ProductCard product={product} />}
          itemKey={(product) => product.id}
          ariaLabelPrevious="Previous products"
          ariaLabelNext="Next products"
          ariaLabelDot={(index) => `Go to product slide ${index + 1}`}
        />
      </section>
    </div>
  );
}
