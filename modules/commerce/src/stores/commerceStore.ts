import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  inventory: number;
  sku: string;
  slug: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type CheckoutStep = 'shipping' | 'payment' | 'review';

interface CommerceStore {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  currentCheckoutStep: CheckoutStep;
  shippingAddress: Address;
  paymentConfig: {
    stripe?: { publishableKey: string };
    paypal?: { clientId: string };
  };
  setProducts: (products: Product[]) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setOrders: (orders: Order[]) => void;
  setCheckoutStep: (step: CheckoutStep) => void;
  setShippingAddress: (address: Partial<Address>) => void;
  setPaymentConfig: (config: Partial<CommerceStore['paymentConfig']>) => void;
}

export const useCommerceStore = create<CommerceStore>()((set, get) => ({
  products: [],
  cart: [],
  orders: [],
  currentCheckoutStep: 'shipping',
  shippingAddress: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  },
  paymentConfig: {},

  setProducts: (products) => set({ products }),
  addToCart: (item) =>
    set((s) => {
      const existing = s.cart.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          cart: s.cart.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { cart: [...s.cart, item] };
    }),
  removeFromCart: (productId) =>
    set((s) => ({ cart: s.cart.filter((i) => i.productId !== productId) })),
  updateQuantity: (productId, quantity) =>
    set((s) => ({
      cart:
        quantity <= 0
          ? s.cart.filter((i) => i.productId !== productId)
          : s.cart.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
    })),
  clearCart: () => set({ cart: [] }),
  setOrders: (orders) => set({ orders }),
  setCheckoutStep: (step) => set({ currentCheckoutStep: step }),
  setShippingAddress: (address) =>
    set((s) => ({ shippingAddress: { ...s.shippingAddress, ...address } })),
  setPaymentConfig: (config) =>
    set((s) => ({ paymentConfig: { ...s.paymentConfig, ...config } })),
}));
