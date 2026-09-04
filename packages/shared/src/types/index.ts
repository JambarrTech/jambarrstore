export type CategoryId =
  | 'electronique'
  | 'mode'
  | 'maison'
  | 'beaute'
  | 'epicerie';

export interface Category {
  id: CategoryId;
  label: string;
  emoji?: string;
}

export interface Product {
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
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export type OrderStatus =
  | 'en_attente'
  | 'confirmee'
  | 'expediee'
  | 'livree'
  | 'annulee';

export interface OrderLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerId: string | null;
  customerName: string;
  city: string;
  createdAt: string;
  status: OrderStatus;
  payment: 'Wave' | 'Orange Money' | 'Paiement à la livraison';
  lines: OrderLine[];
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  orders: number;
  spent: number;
  since: string;
}
