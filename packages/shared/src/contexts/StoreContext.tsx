import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ProductApi, OrderApi, CustomerApi, CategoryApi } from '../api/client';
import { CartLine, OrderStatus } from '../types';

function loadFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem('jambarr_favorites') || '[]');
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]) {
  localStorage.setItem('jambarr_favorites', JSON.stringify(ids));
}

function loadAddresses(): { id: string; label: string; city: string; detail: string; primary: boolean }[] {
  try {
    return JSON.parse(localStorage.getItem('jambarr_addresses') || '[]');
  } catch {
    return [];
  }
}

function saveAddresses(addrs: { id: string; label: string; city: string; detail: string; primary: boolean }[]) {
  localStorage.setItem('jambarr_addresses', JSON.stringify(addrs));
}

interface Address {
  id: string;
  label: string;
  city: string;
  detail: string;
  primary: boolean;
}

interface StoreValue {
  loading: boolean;
  error: string | null;
  products: ProductApi[];
  orders: OrderApi[];
  customers: CustomerApi[];
  categories: CategoryApi[];
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  favorites: string[];
  addresses: Address[];
  getProduct: (id: string) => ProductApi | undefined;
  addToCart: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  checkout: (city: string, payment?: string) => Promise<string | null>;
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  saveProduct: (product: Partial<ProductApi>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductActive: (id: string) => Promise<void>;
  setOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  addAddress: (addr: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  setPrimaryAddress: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [orders, setOrders] = useState<OrderApi[]>([]);
  const [customers, setCustomers] = useState<CustomerApi[]>([]);
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [addresses, setAddresses] = useState<Address[]>(loadAddresses);

  useEffect(() => { saveFavorites(favorites); }, [favorites]);
  useEffect(() => { saveAddresses(addresses); }, [addresses]);

  const refreshProducts = useCallback(async () => {
    const data = await api.products.list();
    setProducts(data);
  }, []);

  const refreshOrders = useCallback(async () => {
    const data = await api.orders.list();
    setOrders(data);
  }, []);

  const refreshCustomers = useCallback(async () => {
    const data = await api.customers.list();
    setCustomers(data);
  }, []);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.categories.list().then(setCategories),
      refreshProducts(),
      refreshOrders(),
      refreshCustomers(),
    ])
      .catch((err) => {
        if (mounted) setError(err.message || 'Erreur de chargement');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [refreshProducts, refreshOrders, refreshCustomers]);

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const addToCart = useCallback((productId: string, quantity = 1) => {
    setCart((prev) => {
      const found = prev.find((l) => l.productId === productId);
      if (found) {
        return prev.map((l) =>
          l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      return [...prev, { productId, quantity }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity } : l))
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);

  const cartTotal = cart.reduce((sum, l) => {
    const p = products.find((item) => item.id === l.productId);
    return sum + (p ? p.price * l.quantity : 0);
  }, 0);

  const checkout = useCallback(
    async (city: string, payment = 'wave') => {
      if (cart.length === 0) return null;
      const order = await api.checkout({
        city,
        payment,
        lines: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      });
      setCart([]);
      await refreshProducts();
      await refreshOrders();
      return order.id;
    },
    [cart, refreshProducts, refreshOrders]
  );

  const saveProduct = useCallback(
    async (product: Partial<ProductApi>) => {
      await api.products.save(product);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await api.products.delete(id);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const toggleProductActive = useCallback(
    async (id: string) => {
      await api.products.toggle(id);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const setOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      await api.orders.setStatus(id, status);
      await refreshOrders();
    },
    [refreshOrders]
  );

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  const addAddress = useCallback((addr: Omit<Address, 'id'>) => {
    setAddresses((prev) => {
      const newAddr = { ...addr, id: `addr-${Date.now()}` };
      if (newAddr.primary) return [...prev.map((a) => ({ ...a, primary: false })), newAddr];
      return [...prev, newAddr];
    });
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const setPrimaryAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, primary: a.id === id })));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      loading,
      error,
      products,
      orders,
      customers,
      categories,
      cart,
      cartCount,
      cartTotal,
      favorites,
      addresses,
      getProduct,
      addToCart,
      setQuantity,
      removeFromCart,
      checkout,
      refreshProducts,
      refreshOrders,
      refreshCustomers,
      saveProduct,
      deleteProduct,
      toggleProductActive,
      setOrderStatus,
      toggleFavorite,
      isFavorite,
      addAddress,
      removeAddress,
      setPrimaryAddress,
    }),
    [
      loading,
      error,
      products,
      orders,
      customers,
      categories,
      cart,
      cartCount,
      cartTotal,
      favorites,
      addresses,
      getProduct,
      addToCart,
      setQuantity,
      removeFromCart,
      checkout,
      refreshProducts,
      refreshOrders,
      refreshCustomers,
      saveProduct,
      deleteProduct,
      toggleProductActive,
      setOrderStatus,
      toggleFavorite,
      isFavorite,
      addAddress,
      removeAddress,
      setPrimaryAddress,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore doit être utilisé dans un StoreProvider');
  return ctx;
}
