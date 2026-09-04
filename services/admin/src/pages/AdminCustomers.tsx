import React from 'react';
import { PhoneIcon } from 'lucide-react';
import { useStore, formatDate, formatPrice } from '@jambarrtech/shared';

export function AdminCustomers() {
  const { customers, orders } = useStore();
  const sorted = [...customers].sort((a, b) => b.spent - a.spent);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line/70">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-display text-sm font-bold text-ink">
          {customers.length} clients
        </h2>
        <p className="text-xs text-ink-muted">Classés par montant dépensé</p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th scope="col" className="px-5 py-3 font-semibold">
                Client
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Téléphone
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Ville
              </th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">
                Commandes
              </th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">
                Total dépensé
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Client depuis
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sorted.map((c) => {
              const open = orders.filter(
                (o) =>
                  o.customerId === c.id &&
                  o.status !== 'livree' &&
                  o.status !== 'annulee'
              ).length;
              return (
                <tr key={c.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-dark">
                        {c.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                      <div>
                        <p className="font-medium text-ink">{c.name}</p>
                        {open > 0 && (
                          <p className="text-[11px] font-semibold text-brand-dark">
                            {open} commande{open > 1 ? 's' : ''} en cours
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5 text-ink-soft">
                      <PhoneIcon className="h-3.5 w-3.5" aria-hidden />
                      {c.phone}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">{c.city}</td>
                  <td className="px-3 py-3 text-right text-ink">{c.orders}</td>
                  <td className="px-3 py-3 text-right font-semibold text-ink">
                    {formatPrice(c.spent)}
                  </td>
                  <td className="px-5 py-3 text-ink-muted">
                    {formatDate(c.since)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
