export type ApiErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
  errors: unknown[];
  timestamp: string;
};

export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
  timestamp: string;
};

// ── Category ──────────────────────────────────────────────

export type CategoryChild = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export type CategoryParent = {
  id: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: CategoryParent | null;
  children?: CategoryChild[];
};

export type CreateCategoryPayload = {
  name: string;
  parent_id?: string | null;
  is_active?: boolean;
  image?: File;
};

export type UpdateCategoryPayload = {
  name?: string;
  parent_id?: string | null;
  image?: File;
};

export type UpdateCategoryStatusPayload = {
  is_active: boolean;
};

// ── Banner ─────────────────────────────────────────────────

export type Banner = {
  id: string;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateBannerPayload = {
  image: File;
  link_url?: string | null;
  is_active?: boolean;
};

export type UpdateBannerPayload = {
  image?: File;
  link_url?: string | null;
  is_active?: boolean;
};

export type ReorderBannerPayload = {
  items: { id: string; sort_order: number }[];
};

// ── Featured Category (Featuring) ───────────────────────────

export type FeaturedCategory = {
  id: string;
  category_id: string;
  title: string;
  banner_url: string | null;
  youtube_video_link: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category: { id: string; name: string; slug: string };
};

export type CreateFeaturedCategoryPayload = {
  category_id: string;
  title: string;
  banner?: File;
  youtube_video_link?: string | null;
  is_published?: boolean;
};

export type UpdateFeaturedCategoryPayload = {
  title?: string;
  banner?: File;
  youtube_video_link?: string | null;
  is_published?: boolean;
};

export type ReorderFeaturedCategoryPayload = {
  items: { id: string; sort_order: number }[];
};

export type FeaturedCategoryWithProducts = {
  id: string;
  category_id: string;
  title: string;
  banner_url: string | null;
  youtube_video_link: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category: { id: string; name: string; slug: string; is_active: boolean };
  products: PublicProduct[];
};

// ── Size ───────────────────────────────────────────────────

export type Size = {
  id: string;
  name: string;
  sort_order: number;
  is_deleted: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateSizePayload = {
  name: string;
  is_published?: boolean;
};

export type UpdateSizePayload = {
  name?: string;
  is_published?: boolean;
  is_deleted?: boolean;
};

export type ReorderSizePayload = {
  items: { id: string; sort_order: number }[];
};

// ── Product ─────────────────────────────────────────────

export type ProductImage = {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
};

export type UploadProductImageOptions = {
  alt_text?: string;
  is_primary?: boolean;
};

export type UpdateImagePayload = {
  alt_text?: string | null;
  is_primary?: boolean;
  sort_order?: number;
};

/** Formatted variant as returned by the backend (flat size_name) */
export type FormattedVariant = {
  id: string;
  size_id: string | null;
  size_name: string | null;
  stock: number;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

/** Image shape returned within product responses (no sort_order) */
export type ProductResponseImage = {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
};

/** Admin product detail (from /products/admin/:id via formatProduct) */
export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  attributes: Record<string, string> | null;
  buy_price: number;
  cost_price: number;
  sell_price: number;
  discount: number;
  discount_type: "PERCENTAGE" | "FLAT";
  effective_price: number;
  is_published: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_best_selling: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: ProductCategory;
  primary_image: ProductResponseImage | null;
  total_stock: number;
  variants: FormattedVariant[];
  images: ProductResponseImage[];
};

/** Admin product list item (formatted from /products/admin via formatProduct) */
export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  attributes: Record<string, string> | null;
  buy_price: number;
  cost_price: number;
  sell_price: number;
  discount: number;
  discount_type: "PERCENTAGE" | "FLAT";
  effective_price: number;
  is_published: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_best_selling: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: ProductCategory;
  primary_image: ProductResponseImage | null;
  images: ProductResponseImage[];
  total_stock: number;
  variants: FormattedVariant[];
};

/** Public product list item (formatted from /products via formatProduct) */
export type PublicProductVariant = {
  id: string;
  size_id: string;
  size_name: string;
  stock: number;
};

export type PublicProductImage = {
  url: string;
  alt_text: string | null;
  is_primary: boolean;
};

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  sell_price: number;
  discount: number;
  discount_type: "PERCENTAGE" | "FIXED";
  is_featured: boolean;
  is_new: boolean;
  is_best_selling: boolean;
  variants: PublicProductVariant[];
  effective_price: number;
  primary_image: PublicProductImage | null;
};

export type PaginatedResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  timestamp: string;
};

export type CreateProductPayload = {
  name: string;
  description?: string | null;
  category_id: string;
  attributes?: Record<string, string> | null;
  buy_price: number;
  cost_price: number;
  sell_price: number;
  discount?: number;
  discount_type?: "PERCENTAGE" | "FLAT";
  variants: {
    stock?: number;
    size_id?: string | null;
  }[];
  is_published?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  is_best_selling?: boolean;
};

export type UpdateProductPayload = {
  name?: string;
  description?: string | null;
  category_id?: string;
  attributes?: Record<string, string> | null;
  buy_price?: number;
  cost_price?: number;
  sell_price?: number;
  discount?: number;
  discount_type?: "PERCENTAGE" | "FLAT";
  is_published?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  is_best_selling?: boolean;
  variants?: {
    id?: string;
    stock?: number;
    size_id?: string | null;
  }[];
};

export type UpdateProductStatusPayload = {
  is_published?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  is_best_selling?: boolean;
};

export type ProductQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  is_published?: string;
  is_featured?: string;
  is_new?: string;
  is_best_selling?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: string;
};

// ── Order ───────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus = "PENDING" | "COLLECTED" | "REFUNDED";

export type OrderCustomer = {
  id: string;
  name: string;
  phone: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  price_at_purchase: number;
  name_snapshot: string;
  variant?: {
    id: string;
    size_id: string | null;
    stock: number;
    size: {
      id: string;
      name: string;
    } | null;
    product: {
      id: string;
      name: string;
      slug: string;
      images: {
        url: string;
        alt_text: string | null;
      }[];
    };
  };
};

export type Order = {
  id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  is_inside_dhaka: boolean;
  shipping_address: {
    address: string;
    area?: string;
    city?: string;
    note?: string;
  };
  subtotal_amount: number;
  delivery_fee: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  customer?: OrderCustomer;
  _count?: {
    items: number;
  };
  items?: OrderItem[];
};

export type OrderQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  sort_by?: string;
  sort_order?: string;
};

export type UpdateOrderStatusPayload = {
  status: OrderStatus;
};

export type UpdatePaymentStatusPayload = {
  payment_status: PaymentStatus;
};

export type OrderHistory = {
  id: string;
  order_id: string;
  admin_id: string | null;
  admin_name: string | null;
  admin_email: string | null;
  change_type: "ORDER_STATUS" | "PAYMENT_STATUS";
  from_order_status: OrderStatus | null;
  to_order_status: OrderStatus | null;
  from_payment_status: PaymentStatus | null;
  to_payment_status: PaymentStatus | null;
  note: string | null;
  created_at: string;
};

// ── Customer ──────────────────────────────────────────────

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
  updated_at: string;
  _count?: { orders: number };
};

export type CustomerWithOrders = Customer & {
  orders: Order[];
};

export type CustomerQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
};

export type CreateCustomerPayload = {
  name: string;
  phone: string;
  email?: string | null;
};

export type UpdateCustomerPayload = {
  name?: string;
  phone?: string;
  email?: string | null;
};

// ── Setting ──────────────────────────────────────────────

export type Setting = {
  id: string;
  logo: string;
  favicon: string | null;
  address: string;
  phone: string;
  email: string;
  facebook: string | null;
  instagram: string | null;
  title: string;
  description: string;
  keywords: string;
  show_featured_products: boolean;
  show_new_arrivals: boolean;
  show_best_selling: boolean;
  google_analytics_id: string | null;
  google_tag_manager_id: string | null;
  facebook_pixel_id: string | null;
  delivery_charge_inside_dhaka: number;
  delivery_charge_outside_dhaka: number;
  created_at: string;
  updated_at: string;
};

export type PublicSetting = Omit<Setting, "id" | "created_at" | "updated_at">;

export type InitSettingPayload = {
  logo?: File;
  address: string;
  phone: string;
  email: string;
  title: string;
  description: string;
  keywords: string;
};

export type UpdateSettingPayload = {
  logo?: File;
  favicon?: File;
  address?: string;
  phone?: string;
  email?: string;
  facebook?: string | null;
  instagram?: string | null;
  title?: string;
  description?: string;
  keywords?: string;
  show_featured_products?: boolean;
  show_new_arrivals?: boolean;
  show_best_selling?: boolean;
  google_analytics_id?: string | null;
  google_tag_manager_id?: string | null;
  facebook_pixel_id?: string | null;
  delivery_charge_inside_dhaka?: number;
  delivery_charge_outside_dhaka?: number;
};
