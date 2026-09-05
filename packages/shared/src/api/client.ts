const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken(): string | null {
  try {
    return localStorage.getItem('jambarr_token');
  } catch {
    return null;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur API');
  }
  return res.json();
}

export interface UserApi {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  createdAt: string;
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
  auth: {
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: UserApi }>('/backend/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    register: (data: { name: string; email: string; password: string; phone?: string }) =>
      request<{ token: string; user: UserApi }>('/backend/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: (token?: string) => {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return request<UserApi>('/backend/api/auth/me', { headers });
    },
  },

  categories: {
    list: () => request<CategoryApi[]>('/backend/api/categories'),
  },

  products: {
    list: (params?: { category?: string; search?: string; active?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set('category', params.category);
      if (params?.search) qs.set('search', params.search);
      if (params?.active !== undefined) qs.set('active', String(params.active));
      const query = qs.toString();
      return request<ProductApi[]>(`/backend/api/products${query ? `?${query}` : ''}`);
    },
    get: (id: string) => request<ProductApi>(`/backend/api/products/${id}`),
    save: (product: Partial<ProductApi>) =>
      request<ProductApi>('/backend/api/products', {
        method: 'POST',
        body: JSON.stringify(product),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/backend/api/products/${id}`, { method: 'DELETE' }),
    toggle: (id: string) =>
      request<ProductApi>(`/backend/api/products/${id}`, { method: 'PATCH' }),
  },

  orders: {
    list: (params?: { status?: string }) => {
      const qs = params?.status ? `?status=${params.status}` : '';
      return request<OrderApi[]>(`/backend/api/orders${qs}`);
    },
    get: (id: string) => request<OrderApi>(`/backend/api/orders/${id}`),
    setStatus: (id: string, status: string) =>
      request<OrderApi>(`/backend/api/orders/${id}`, {
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
    request<OrderApi>('/backend/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  customers: {
    list: () => request<CustomerApi[]>('/backend/api/customers'),
    get: (id: string) => request<CustomerApi>(`/backend/api/customers/${id}`),
  },

  dashboard: {
    stats: () => request<DashboardStatsApi>('/backend/api/dashboard/stats'),
    sales: () => request<SalesDayApi[]>('/backend/api/dashboard/sales'),
  },
};
