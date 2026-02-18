import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { showToast } from "@/lib/toast";

export interface CartItem {
  variant_id: string;
  quantity: number;
}

interface CartStoreState {
  is_inside_dhaka?: boolean;
  items: CartItem[];
  buyNowItem: CartItem | null;
  addToCart: (item: CartItem) => void;
  setBuyNowItem: (item: CartItem | null) => void;
  clearBuyNowItem: () => void;
  removeFromCart: (variant_id: string) => void;
  incrementQuantity: (variant_id: string) => void;
  decrementQuantity: (variant_id: string) => void;
  clearCart: () => void;
  setInsideDhaka: (value: boolean) => void;
}

const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      is_inside_dhaka: undefined,
      items: [],
      buyNowItem: null,

      addToCart: (item: CartItem) =>
        set((state) => {
          // Check if variant already exists in cart
          const exists = state.items.some(
            (cartItem) => cartItem.variant_id === item.variant_id,
          );

          if (!exists) {
            showToast.success("Added to cart");
            return { items: [...state.items, item] };
          }

          // If already exists, don't add again (show info toast)
          showToast.warning("Item already in cart");
          return state;
        }),

      setBuyNowItem: (item: CartItem | null) => set({ buyNowItem: item }),

      clearBuyNowItem: () => set({ buyNowItem: null }),

      removeFromCart: (variant_id: string) =>
        set((state) => ({
          items: state.items.filter((item) => item.variant_id !== variant_id),
        })),

      incrementQuantity: (variant_id: string) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.variant_id === variant_id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        })),

      decrementQuantity: (variant_id: string) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.variant_id === variant_id
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item,
          ),
        })),

      clearCart: () => set({ is_inside_dhaka: undefined, items: [] }),

      setInsideDhaka: (value: boolean) => set({ is_inside_dhaka: value }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useCartStore;

// Custom hooks following Redux pattern

// Hook to get all cart items
export const useCartItems = () => {
  return useCartStore((state) => state.items);
};

// Hook to check if a variant is in the cart
export const useIsInCart = (variant_id: string) => {
  return useCartStore((state) =>
    state.items.some((item) => item.variant_id === variant_id),
  );
};

// Hook to get cart count (number of unique items)
export const useCartCount = () => {
  return useCartStore((state) => state.items.length);
};

// Hook to get total cart quantity (sum of all quantities)
export const useCartTotalQuantity = () => {
  return useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
};

// Hook to get a specific cart item by variant_id
export const useCartItem = (variant_id: string) => {
  return useCartStore((state) =>
    state.items.find((item) => item.variant_id === variant_id),
  );
};
