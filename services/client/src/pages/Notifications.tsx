import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, BellIcon, PackageIcon, CheckCircleIcon, TruckIcon } from 'lucide-react';
import { useStore, formatDate, statusLabels } from '@jambarrtech/shared';

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'delivery';
  title: string;
  body: string;
  date: string;
  read: boolean;
}

export function Notifications() {
  const { orders } = useStore();

  const notifications: Notification[] = orders.slice(0, 10).map((order) => ({
    id: order.id,
    type: order.status === 'livree' ? 'delivery' : 'order',
    title: order.status === 'livree'
      ? `Commande ${order.id} livrée`
      : `Commande ${order.id} — ${statusLabels[order.status]}`,
    body: order.status === 'livree'
      ? `Votre commande de ${order.city} a été livrée.`
      : `Statut mis à jour : ${statusLabels[order.status]}.`,
    date: order.createdAt,
    read: false,
  }));

  const promoNotification: Notification = {
    id: 'promo-1',
    type: 'promo',
    title: 'Offre Tabaski',
    body: "Jusqu'à -40% sur une sélection de produits pour la Tabaski.",
    date: new Date().toISOString(),
    read: false,
  };

  const allNotifications = [promoNotification, ...notifications];

  function getIcon(type: string) {
    switch (type) {
      case 'delivery':
        return <CheckCircleIcon className="h-5 w-5 text-leaf" />;
      case 'promo':
        return <BellIcon className="h-5 w-5 text-brand" />;
      default:
        return <PackageIcon className="h-5 w-5 text-brand" />;
    }
  }

  return (
    <div className="min-h-screen bg-sand">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <Link to="/" className="rounded-lg p-1.5 text-ink-muted hover:bg-sand">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">Notifications</h1>
      </header>

      {allNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <BellIcon className="h-12 w-12 text-ink-muted" />
          <p className="mt-4 text-sm text-ink-muted">Aucune notification pour le moment.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line px-4">
          {allNotifications.map((n) => (
            <li key={n.id} className="flex gap-3 py-4">
              <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{n.title}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{n.body}</p>
                <p className="mt-1 text-[11px] text-ink-muted">{formatDate(n.date)}</p>
              </div>
              {!n.read && (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
