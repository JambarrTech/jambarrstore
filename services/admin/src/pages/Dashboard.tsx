import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArrowUpRightIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  UsersIcon,
  Loader2Icon
} from 'lucide-react';
import { useStore, formatPrice, formatDate, statusLabels, statusClasses, api } from '@jambarrtech/shared';

export function Dashboard() {
  const { orders, products, customers, loading } = useStore();
  const [salesData, setSalesData] = useState<{ day: string; value: number }[]>([]);
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenue: number;
    pendingOrders: number;
    lowStock: any[];
  } | null>(null);

  useEffect(() => {
    api.dashboard.sales().then(setSalesData).catch(() => {});
    api.dashboard.stats().then(setStats).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2Icon className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  const revenue = stats?.revenue ?? orders
    .filter((o) => o.status !== 'annulee')
    .reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === 'en_attente');
  const lowStock = stats?.lowStock ?? products.filter((p) => p.stock <= 5);
  const max = Math.max(...salesData.map((d) => d.value), 1);

  const secondary = [
    {
      label: 'Commandes',
      value: String(stats?.totalOrders ?? orders.length),
      hint: `${pending.length} à traiter`,
      icon: ShoppingCartIcon
    },
    {
      label: 'Clients',
      value: String(stats?.totalCustomers ?? customers.length),
      icon: UsersIcon
    },
    {
      label: 'Panier moyen',
      value: formatPrice(Math.round(revenue / Math.max(orders.length, 1))),
      icon: TrendingUpIcon
    }
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-line/70">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Chiffre d'affaires — 7 derniers jours
              </p>
              <p className="mt-2 font-display text-4xl font-extrabold text-ink">
                {formatPrice(revenue)}
              </p>
            </div>
            <Link
              to="/commandes"
              className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-ink-soft"
            >
              Traiter les commandes
            </Link>
          </div>

          {salesData.length > 0 && (
            <div className="mt-8 flex h-44 items-end gap-3">
              {salesData.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-medium text-ink-muted">
                    {Math.round(d.value / 1000)}k
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-brand/85"
                    style={{ height: `${(d.value / max) * 100}%` }}
                    role="presentation"
                  />
                  <span className="text-[11px] text-ink-muted">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {secondary.map((item) => (
            <article
              key={item.label}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-line/70"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sand text-ink-soft">
                <item.icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-ink-muted">{item.label}</p>
                <p className="truncate font-display text-lg font-bold text-ink">
                  {item.value}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl bg-white shadow-card ring-1 ring-line/70">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-sm font-bold text-ink">
              Dernières commandes
            </h2>
            <Link
              to="/commandes"
              className="text-xs font-semibold text-brand transition-colors duration-150 ease-out hover:text-brand-dark"
            >
              Tout voir
            </Link>
          </header>
          <ul className="divide-y divide-line">
            {orders.slice(0, 5).map((order) => (
              <li
                key={order.id}
                className="flex items-center gap-4 px-5 py-3.5 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{order.customerName}</p>
                  <p className="text-xs text-ink-muted">
                    {order.id} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[order.status]}`}
                >
                  {statusLabels[order.status]}
                </span>
                <span className="w-32 text-right font-display font-bold text-ink">
                  {formatPrice(order.total)}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl bg-white ring-1 ring-line/70">
          <header className="flex items-center gap-2 border-b border-line px-5 py-4">
            <AlertTriangleIcon className="h-4 w-4 text-brand" aria-hidden />
            <h2 className="font-display text-sm font-bold text-ink">
              Stock à surveiller
            </h2>
          </header>
          {lowStock.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-ink-muted">
              Tous les stocks sont à niveau.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.map((p: any) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <img
                    src={p.image}
                    alt=""
                    className="h-10 w-10 rounded-lg bg-sand object-contain p-1"
                  />
                  <p className="line-clamp-2 flex-1 text-xs text-ink">{p.name}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      p.stock === 0
                        ? 'bg-rose-50 text-berry'
                        : 'bg-brand-soft text-brand-dark'
                    }`}
                  >
                    {p.stock === 0 ? 'Rupture' : `${p.stock} restants`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="px-5 py-4">
            <Link
              to="/produits"
              className="block rounded-xl border border-line py-2 text-center text-xs font-semibold text-ink-soft transition-colors duration-150 ease-out hover:border-brand hover:text-brand"
            >
              Réapprovisionner
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
