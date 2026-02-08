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

// ── Color ──────────────────────────────────────────────────

export type Color = {
  id: string;
  name: string;
  code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateColorPayload = {
  name: string;
  code?: string | null;
  is_active?: boolean;
};

export type UpdateColorPayload = {
  name?: string;
  code?: string | null;
  is_active?: boolean;
};

// ── Size ───────────────────────────────────────────────────

export type Size = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateSizePayload = {
  name: string;
  sort_order?: number;
  is_active?: boolean;
};

export type UpdateSizePayload = {
  name?: string;
  sort_order?: number;
  is_active?: boolean;
};
