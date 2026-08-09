import { create } from "zustand";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;

  // Actions (Fungsi Pengubah State)
  addItem: (product: Product) => void;
  removeItem: (productId: string | number) => void;
  clearCart: () => void;
}

// Pajak default (contoh 11%)
const TAX_RATE = 0.11;

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,

  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      let newItems;

      if (existingItem) {
        // Jika produk sudah ada, tambah kuantitasnya
        newItems = state.items.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
              }
            : item,
        );
      } else {
        // Jika produk baru, masukkan ke array
        newItems = [
          ...state.items,
          { ...product, quantity: 1, subtotal: product.price },
        ];
      }

      // Kalkulasi ulang total harga
      const newSubtotal = newItems.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );
      const newTax = newSubtotal * TAX_RATE;
      const newTotal = newSubtotal + newTax;

      return {
        items: newItems,
        subtotal: newSubtotal,
        tax: newTax,
        total: newTotal,
      };
    }),

  removeItem: (productId) =>
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== productId);

      // Kalkulasi ulang setelah item dihapus
      const newSubtotal = newItems.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );
      const newTax = newSubtotal * TAX_RATE;
      const newTotal = newSubtotal + newTax;

      return {
        items: newItems,
        subtotal: newSubtotal,
        tax: newTax,
        total: newTotal,
      };
    }),

  clearCart: () => set({ items: [], subtotal: 0, tax: 0, total: 0 }),
}));
