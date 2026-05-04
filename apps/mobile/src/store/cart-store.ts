import { create } from 'zustand';
import * as cartService from '@/services/cart.service';
import type { CartItemServer, CartOptionData } from '@/services/cart.service';

interface CartItemLocal {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  restaurantId: string;
  options: { id: string; name: string; price: number; type: string }[];
}

interface CartState {
  items: CartItemLocal[];
  isLoading: boolean;

  fetchCart: () => Promise<void>;
  addItem: (item: {
    id: string;
    productId: string;
    restaurantId: string;
    name: string;
    price: number;
    image: string;
    options?: CartOptionData[];
  }) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  increaseQty: (productId: string) => Promise<void>;
  decreaseQty: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

function mapServerItems(items: CartItemServer[]): CartItemLocal[] {
  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    price: item.product.price,
    image: item.product.image ?? '',
    quantity: item.quantity,
    restaurantId: item.product.restaurantId,
    options: item.options.map((o) => ({
      // Use ProductOption.id (optionId), not CartItemOption.id (id)
      // The order endpoint validates options against product.options by this ID
      id: o.optionId,
      name: o.name,
      price: o.price,
      type: o.type,
    })),
  }));
}

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartService.getCart();
      set({ items: mapServerItems(cart.items), isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (item) => {
    try {
      const cart = await cartService.addToCart(item.productId, 1, item.options);
      set({ items: mapServerItems(cart.items) });
    } catch {
      // Fallback: optimistic update
      set((state) => {
        const existing = state.items.find((i) => i.productId === item.productId);
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return {
          items: [
            ...state.items,
            {
              id: item.id,
              productId: item.productId,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: 1,
              restaurantId: item.restaurantId,
              options: [],
            },
          ],
        };
      });
    }
  },

  removeItem: async (productId) => {
    const prev = get().items;
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
    try {
      const cart = await cartService.removeFromCart(productId);
      set({ items: mapServerItems(cart.items) });
    } catch {
      set({ items: prev });
    }
  },

  increaseQty: async (productId) => {
    const item = get().items.find((i) => i.productId === productId);
    if (!item) return;
    const newQty = item.quantity + 1;
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity: newQty } : i
      ),
    }));
    try {
      const cart = await cartService.updateCartItem(productId, newQty);
      set({ items: mapServerItems(cart.items) });
    } catch {
      /* optimistic stays */
    }
  },

  decreaseQty: async (productId) => {
    const item = get().items.find((i) => i.productId === productId);
    if (!item) return;
    const newQty = item.quantity - 1;

    if (newQty <= 0) {
      get().removeItem(productId);
      return;
    }

    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity: newQty } : i
      ),
    }));
    try {
      const cart = await cartService.updateCartItem(productId, newQty);
      set({ items: mapServerItems(cart.items) });
    } catch {
      /* optimistic stays */
    }
  },

  clearCart: async () => {
    set({ items: [] });
    try {
      await cartService.clearCart();
    } catch {
      /* already cleared locally */
    }
  },

  getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  getTotalPrice: () =>
    get().items.reduce((sum, item) => {
      const optionsPrice = item.options.reduce((s, o) => s + o.price, 0);
      return sum + (item.price + optionsPrice) * item.quantity;
    }, 0),
}));

export default useCartStore;
