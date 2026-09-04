const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur API');
  }
  return res.json();
}

export type CategoryApi = { id: string; label: string; emoji?: string };

export interface ProductApi {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  oldPrice?: number;
  image: string;
  stock: number;
  rating: number;
  reviews: number;
  sold: number;
  seller: string;
  description: string;
  active: boolean;
  category?: CategoryApi;
}

export interface OrderLineApi {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderApi {
  id: string;
  customerId: string | null;
  customerName: string;
  city: string;
  createdAt: string;
  status: string;
  payment: string;
  lines: OrderLineApi[];
  total: number;
  customer?: CustomerApi;
}

export interface CustomerApi {
  id: string;
  name: string;
  phone: string;
  city: string;
  orders: number;
  spent: number;
  since: string;
}

export interface DashboardStatsApi {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenue: number;
  pendingOrders: number;
  lowStock: ProductApi[];
}

export interface SalesDayApi {
  day: string;
  value: number;
}

export const api = {
  categories: {
    list: () => request<CategoryApi[]>('/api/categories'),
  },

  products: {
    list: (params?: { category?: string; search?: string; active?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set('category', params.category);
      if (params?.search) qs.set('search', params.search);
      if (params?.active !== undefined) qs.set('active', String(params.active));
      const query = qs.toString();
      return request<ProductApi[]>(`/api/products${query ? `?${query}` : ''}`);
    },
    get: (id: string) => request<ProductApi>(`/api/products/${id}`),
    save: (product: Partial<ProductApi>) =>
      request<ProductApi>('/api/products', {
        method: 'POST',
        body: JSON.stringify(product),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' }),
    toggle: (id: string) =>
      request<ProductApi>(`/api/products/${id}/toggle`, { method: 'PATCH' }),
  },

  orders: {
    list: (params?: { status?: string }) => {
      const qs = params?.status ? `?status=${params.status}` : '';
      return request<OrderApi[]>(`/api/orders${qs}`);
    },
    get: (id: string) => request<OrderApi>(`/api/orders/${id}`),
    setStatus: (id: string, status: string) =>
      request<OrderApi>(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  checkout: (data: {
    customerId?: string;
    customerName?: string;
    city: string;
    payment: string;
    lines: { productId: string; quantity: number }[];
  }) =>
    request<OrderApi>('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  customers: {
    list: () => request<CustomerApi[]>('/api/customers'),
    get: (id: string) => request<CustomerApi>(`/api/customers/${id}`),
  },

  dashboard: {
    stats: () => request<DashboardStatsApi>('/api/dashboard/stats'),
    sales: () => request<SalesDayApi[]>('/api/dashboard/sales'),
  },
};
