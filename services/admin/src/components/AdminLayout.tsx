import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BellIcon,
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon
} from 'lucide-react';
import { useStore } from '@jambarrtech/shared';

const nav = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboardIcon, end: true },
  { to: '/produits', label: 'Produits', icon: PackageIcon, end: false },
  { to: '/commandes', label: 'Commandes', icon: ShoppingCartIcon, end: false },
  { to: '/clients', label: 'Clients', icon: UsersIcon, end: false }
];

const titles: Record<string, string> = {
  '/': 'Tableau de bord',
  '/produits': 'Produits',
  '/commandes': 'Commandes',
  '/clients': 'Clients'
};

export function AdminLayout() {
  const { orders } = useStore();
  const { pathname } = useLocation();
  const pending = orders.filter((o) => o.status === 'en_attente').length;

  return (
    <div className="flex min-h-full w-full bg-sand">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-white px-3 py-5 lg:flex">
        <Link to="/" className="px-2">
          <p className="font-display text-lg font-extrabold tracking-tight text-ink">
            jambarr<span className="text-brand">store</span>
          </p>
          <p className="mt-0.5 text-[11px] text-ink-muted">Backoffice vendeur</p>
        </Link>

        <nav aria-label="Navigation backoffice" className="mt-7 flex-1">
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-out ${
                      isActive
                        ? 'bg-brand-soft text-brand-dark'
                        : 'text-ink-soft hover:bg-sand hover:text-ink'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" aria-hidden />
                  {item.label}
                  {item.to === '/commandes' && pending > 0 && (
                    <span className="ml-auto rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {pending}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-line bg-white/90 px-5 py-3.5 backdrop-blur">
          <h1 className="font-display text-lg font-bold text-ink">
            {titles[pathname] ?? 'Backoffice'}
          </h1>
          <nav aria-label="Navigation mobile" className="ml-auto flex gap-1 lg:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                aria-label={item.label}
                className={({ isActive }) =>
                  `rounded-lg p-2 transition-colors duration-150 ease-out ${
                    isActive
                      ? 'bg-brand-soft text-brand-dark'
                      : 'text-ink-muted hover:text-ink'
                  }`
                }
              >
                <item.icon className="h-4 w-4" aria-hidden />
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-lg p-2 text-ink-soft transition-colors duration-150 ease-out hover:bg-sand"
            >
              <BellIcon className="h-4 w-4" aria-hidden />
              {pending > 0 && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
              )}
            </button>
            <div className="flex items-center gap-2 border-l border-line pl-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">
                JS
              </span>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-ink">Jambarr Officiel</p>
                <p className="text-[11px] text-ink-muted">Administrateur</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
