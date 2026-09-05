import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

interface CartStore {
  items: CartItem[];
  addItem: (component: any, quantity?: number) => void;
  removeItem: (componentId: string) => void;
  updateQuantity: (componentId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (component: any, quantity: number = 1) => {
        set((state) => {
          const compId = component.id;
          const existing = state.items.find(
            (item) => (item.component?.id || item.product?.id) === compId
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                (item.component?.id || item.product?.id) === compId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { component, product: component, quantity }] };
        });
      },

      removeItem: (componentId: string) => {
        set((state) => ({
          items: state.items.filter(
            (item) => (item.component?.id || item.product?.id) !== componentId
          ),
        }));
      },

      updateQuantity: (componentId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(componentId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            (item.component?.id || item.product?.id) === componentId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (sum, item) =>
            sum + Number((item.component || item.product)?.price || 0) * item.quantity,
          0
        );
      },
    }),
    {
      name: "z-electronics-cart-storage",
    }
  )
);
