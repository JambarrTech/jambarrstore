import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, PackageIcon, Loader2Icon } from 'lucide-react';
import { useStore, formatPrice, formatDate, statusLabels, statusClasses } from '@jambarrtech/shared';

export function Orders() {
  const { orders, loading } = useStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <Loader2Icon className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <Link to="/" className="rounded-lg p-1.5 text-ink-muted hover:bg-sand">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">Mes commandes</h1>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <PackageIcon className="h-12 w-12 text-ink-muted" />
          <p className="mt-4 text-sm text-ink-muted">Aucune commande pour le moment.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line px-4">
          {orders.map((order) => (
            <li key={order.id} className="py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{order.id}</p>
                  <p className="text-xs text-ink-muted">{formatDate(order.createdAt)}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[order.status]}`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {order.lines.map((line, i) => (
                  <img
                    key={i}
                    src={line.image}
                    alt={line.name}
                    className="h-14 w-14 shrink-0 rounded-lg bg-sand object-contain p-1"
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-ink-muted">
                  {order.lines.length} article{order.lines.length > 1 ? 's' : ''} • {order.city}
                </span>
                <span className="font-display text-sm font-bold text-ink">
                  {formatPrice(order.total)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
