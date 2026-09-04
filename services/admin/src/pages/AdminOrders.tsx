import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { useStore, formatDate, formatPrice, statusClasses, statusLabels, statusOrder, OrderStatus } from '@jambarrtech/shared';

const paymentLabels: Record<string, string> = {
  wave: 'Wave',
  orange: 'Orange Money',
  cash: 'Paiement à la livraison',
};

export function AdminOrders() {
  const { orders, setOrderStatus } = useStore();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = orders.filter((o) => filter === 'all' || o.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ease-out ${
            filter === 'all'
              ? 'bg-ink text-white'
              : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'
          }`}
        >
          Toutes ({orders.length})
        </button>
        {statusOrder.map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ease-out ${
                filter === status
                  ? 'bg-ink text-white'
                  : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'
              }`}
            >
              {statusLabels[status]} ({count})
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line/70">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                <th scope="col" className="px-5 py-3 font-semibold">
                  Commande
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Client
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Paiement
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Total
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Statut
                </th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  Détail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((order) => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td className="px-5 py-3">
                      <p className="font-display font-bold text-ink">
                        {order.id}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-ink-muted">{order.city}</p>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">
                      {paymentLabels[order.payment] || order.payment}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-ink">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          setOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        aria-label={`Statut de la commande ${order.id}`}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-brand/40 ${statusClasses[order.status]}`}
                      >
                        {statusOrder.map((s) => (
                          <option key={s} value={s}>
                            {statusLabels[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(expanded === order.id ? null : order.id)
                        }
                        aria-expanded={expanded === order.id}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-soft transition-colors duration-150 ease-out hover:bg-sand hover:text-ink"
                      >
                        Articles
                        <ChevronDownIcon
                          className={`h-3.5 w-3.5 transition-transform duration-150 ease-out ${
                            expanded === order.id ? 'rotate-180' : ''
                          }`}
                          aria-hidden
                        />
                      </button>
                    </td>
                  </tr>
                  {expanded === order.id && (
                    <tr className="bg-sand/60">
                      <td colSpan={6} className="px-5 py-4">
                        <ul className="space-y-2">
                          {order.lines.map((l) => (
                            <li
                              key={l.productId}
                              className="flex items-center gap-3 text-sm"
                            >
                              <img
                                src={l.image}
                                alt=""
                                className="h-10 w-10 rounded-lg bg-white object-contain p-1"
                              />
                              <span className="flex-1 text-ink">{l.name}</span>
                              <span className="text-ink-muted">
                                × {l.quantity}
                              </span>
                              <span className="w-32 text-right font-medium text-ink">
                                {formatPrice(l.price * l.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-ink-muted">
            Aucune commande avec ce statut.
          </p>
        )}
      </div>
    </div>
  );
}
