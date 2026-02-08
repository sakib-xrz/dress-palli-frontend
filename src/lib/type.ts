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
};

export type UpdateCategoryPayload = {
  name?: string;
  parent_id?: string | null;
};

export type UpdateCategoryStatusPayload = {
  is_active: boolean;
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

export type ProductVariant = {
  id: string;
  stock: number;
  size_id: string | null;
  size: { id: string; name: string; sort_order: number } | null;
  attributes: Record<string, unknown> | null;
  is_deleted: boolean;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

/** Admin product (raw from /products/admin/:id) with flat variants */
export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  info: Record<string, string> | null;
  buy_price: number;
  cost_price: number;
  sell_price: number;
  discount: number;
  discount_type: "PERCENTAGE" | "FLAT";
  is_published: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_best_selling: boolean;
  is_deleted: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: ProductCategory;
  variants: ProductVariant[];
  images: ProductImage[];
};

/** Admin product list item (formatted from /products/admin) */
export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  info: Record<string, string> | null;
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
  is_deleted: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: ProductCategory;
  primary_image: ProductImage | null;
  images: ProductImage[];
  total_stock: number;
  in_stock: boolean;
  available_sizes: { id: string; name: string }[];
  variants: {
    id: string;
    size_id: string | null;
    size_name: string | null;
    stock: number;
    attributes: Record<string, unknown> | null;
  }[];
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
  info?: Record<string, string> | null;
  buy_price: number;
  cost_price: number;
  sell_price: number;
  discount?: number;
  discount_type?: "PERCENTAGE" | "FLAT";
  variants: {
    stock?: number;
    size_id?: string | null;
    attributes?: Record<string, unknown> | null;
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
  info?: Record<string, string> | null;
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
    attributes?: Record<string, unknown> | null;
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
