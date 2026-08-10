import { create } from "zustand";
import type { BusinessMode } from "@/types";

export interface ExtendedCartItem {
  id: string;
  sku: string;
  name: string;
  mode: BusinessMode;
  price: number;
  stock: number;
  quantity: number;
  subtotal: number;
  rawType: "product" | "service" | "rental";
  rawId: string;

  // Additional options per item
  scheduled_start?: string;
  start_date?: string;
  end_date?: string;
}

interface CartState {
  items: ExtendedCartItem[];
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  depositPaid: number;
  selectedCustomerId: string | null;
  paymentMethod: "cash" | "qris" | "transfer";

  // Actions
  addItem: (item: {
    id: string;
    sku: string;
    name: string;
    mode: BusinessMode;
    price: number;
    stock: number;
    rawType: "product" | "service" | "rental";
  }) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  setDiscount: (discount: number) => void;
  setDepositPaid: (deposit: number) => void;
  setSelectedCustomerId: (customerId: string | null) => void;
  setPaymentMethod: (method: "cash" | "qris" | "transfer") => void;
  setItemDates: (id: string, dates: { scheduled_start?: string; start_date?: string; end_date?: string }) => void;
  clearCart: () => void;
}

const TAX_RATE = 0.11;

const recalculateTotals = (items: ExtendedCartItem[], discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * TAX_RATE;
  const total = Math.max(0, subtotal - discount + tax);
  return { subtotal, tax, total };
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  discount: 0,
  depositPaid: 0,
  selectedCustomerId: null,
  paymentMethod: "cash",

  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      let newItems: ExtendedCartItem[];

      if (existingItem) {
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
        const today = new Date().toISOString().split("T")[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

        newItems = [
          ...state.items,
          {
            id: product.id,
            sku: product.sku,
            name: product.name,
            mode: product.mode,
            price: product.price,
            stock: product.stock,
            quantity: 1,
            subtotal: product.price,
            rawType: product.rawType,
            rawId: product.id,
            start_date: today,
            end_date: tomorrow,
            scheduled_start: new Date().toISOString(),
          },
        ];
      }

      const { subtotal, tax, total } = recalculateTotals(newItems, state.discount);
      return { items: newItems, subtotal, tax, total };
    }),

  updateQuantity: (id, delta) =>
    set((state) => {
      const newItems = state.items
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.price,
            };
          }
          return item;
        })
        .filter(Boolean) as ExtendedCartItem[];

      const { subtotal, tax, total } = recalculateTotals(newItems, state.discount);
      return { items: newItems, subtotal, tax, total };
    }),

  removeItem: (id) =>
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== id);
      const { subtotal, tax, total } = recalculateTotals(newItems, state.discount);
      return { items: newItems, subtotal, tax, total };
    }),

  setDiscount: (discount) =>
    set((state) => {
      const { subtotal, tax, total } = recalculateTotals(state.items, discount);
      return { discount, subtotal, tax, total };
    }),

  setDepositPaid: (depositPaid) => set({ depositPaid }),

  setSelectedCustomerId: (selectedCustomerId) => set({ selectedCustomerId }),

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  setItemDates: (id, dates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...dates } : item
      ),
    })),

  clearCart: () =>
    set({
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      discount: 0,
      depositPaid: 0,
      selectedCustomerId: null,
      paymentMethod: "cash",
    }),
}));
