import api from "@/lib/axios";
import type { ApiResponse } from "@/lib/type";
import type { CartItem } from "@/store/use-cart-store";

export type CartProductImage = {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
} | null;

export type CartProduct = {
  id: string;
  name: string;
  sell_price: number;
  discount: number;
  discount_type: "PERCENTAGE" | "FLAT";
  has_discount: boolean;
};

export type CartItemResponse = {
  variant_id: string;
  quantity: number;
  stock: number;
  size: string | null;
  effected_unit_price: number;
  total_price: number;
  image: CartProductImage;
  product: CartProduct;
};

export type CartSummary = {
  item_count: number;
  total_quantity: number;
  subtotal: number;
  delivery_charge: number;
  grand_total: number;
};

export type CartResponse = {
  items: CartItemResponse[];
  summary: CartSummary;
};

export const cartService = {
  /**
   * Fetch cart items with product details
   */
  getCartItems: async (
    items: CartItem[],
    isInsideDhaka?: boolean
  ): Promise<ApiResponse<CartResponse>> => {
    return api.post("/cart", { 
      items,
      is_inside_dhaka: isInsideDhaka ?? true
    });
  },
};
