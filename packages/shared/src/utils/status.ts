import { OrderStatus } from '../types';

export const statusLabels: Record<OrderStatus, string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  expediee: 'Expédiée',
  livree: 'Livrée',
  annulee: 'Annulée'
};

export const statusClasses: Record<OrderStatus, string> = {
  en_attente: 'bg-brand-soft text-brand-dark',
  confirmee: 'bg-blue-50 text-blue-700',
  expediee: 'bg-amber-50 text-amber-700',
  livree: 'bg-emerald-50 text-leaf',
  annulee: 'bg-rose-50 text-berry'
};

export const statusOrder: OrderStatus[] = [
  'en_attente',
  'confirmee',
  'expediee',
  'livree',
  'annulee'
];
