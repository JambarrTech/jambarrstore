import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, CreditCardIcon, PackageIcon, Loader2Icon } from 'lucide-react';
import { useStore, formatPrice, formatDate, statusLabels, statusClasses, statusOrder } from '@jambarrtech/shared';

const paymentLabels: Record<string, string> = {
  wave: 'Wave',
  Wave: 'Wave',
  orange: 'Orange Money',
  Orange_Money: 'Orange Money',
  cash: 'Paiement à la livraison',
  Paiement_a_la_livraison: 'Paiement à la livraison',
};

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { orders, loading } = useStore();
  const order = orders.find((o) => o.id === id);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <Loader2Icon className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <p className="text-sm text-ink-muted">Commande introuvable.</p>
      </div>
    );
  }

  const statusIndex = statusOrder.indexOf(order.status);

  return (
    <div className="min-h-screen bg-sand pb-6">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <Link to="/commandes" className="rounded-lg p-1.5 text-ink-muted hover:bg-sand">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">{order.id}</h1>
      </header>

      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-line/70">
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[order.status]}`}
            >
              {statusLabels[order.status]}
            </span>
            <span className="font-display text-xl font-extrabold text-ink">
              {formatPrice(order.total)}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
            <MapPinIcon className="h-3.5 w-3.5" />
            <span>{order.city}</span>
            <span>•</span>
            <CreditCardIcon className="h-3.5 w-3.5" />
            <span>{paymentLabels[order.payment] || order.payment}</span>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Passée le {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-line/70">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Suivi de la commande
          </h2>
          <div className="mt-3 space-y-3">
            {statusOrder.map((s, i) => (
              <div key={s} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      i <= statusIndex ? 'bg-brand' : 'bg-line'
                    }`}
                  />
                  {i < statusOrder.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 ${
                        i < statusIndex ? 'bg-brand' : 'bg-line'
                      }`}
                    />
                  )}
                </div>
                <div className="pb-2">
                  <p
                    className={`text-sm font-medium ${
                      i <= statusIndex ? 'text-ink' : 'text-ink-muted'
                    }`}
                  >
                    {statusLabels[s]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-line/70">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {order.lines.length} article{order.lines.length > 1 ? 's' : ''}
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {order.lines.map((line) => (
              <li key={line.productId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <img
                  src={line.image}
                  alt={line.name}
                  className="h-14 w-14 shrink-0 rounded-lg bg-sand object-contain p-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-ink">
                    {line.name}
                  </p>
                  <p className="text-xs text-ink-muted">× {line.quantity}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-ink">
                  {formatPrice(line.price * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm font-semibold text-ink">Total</span>
            <span className="font-display text-lg font-extrabold text-brand">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
