import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  LayoutGridIcon,
  PackageIcon,
  ShoppingBagIcon,
  UserIcon,
  BellIcon,
  SearchIcon,
} from 'lucide-react';
import { useStore } from '@jambarrtech/shared';

const tabs = [
  { to: '/dashboard', label: 'Accueil', icon: HomeIcon, end: true },
  { to: '/categories', label: 'Catégories', icon: LayoutGridIcon, end: false },
  { to: '/panier', label: 'Panier', icon: ShoppingBagIcon, end: false },
  { to: '/commandes', label: 'Commandes', icon: PackageIcon, end: false },
  { to: '/compte', label: 'Compte', icon: UserIcon, end: false },
];

export function MobileLayout() {
  const { cartCount, loading, error } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isDetailPage = /^\/produit\//.test(location.pathname) ||
    /^\/commandes\//.test(location.pathname) ||
    /^\/vendeur\//.test(location.pathname) ||
    ['/favoris', '/recherche', '/notifications', '/aide', '/adresses'].includes(location.pathname);

  const showHomeHeader = location.pathname === '/dashboard';

  return (
    <div className="relative flex flex-col min-h-screen bg-sand">
      {showHomeHeader && !loading && !error && (
        <header className="sticky top-0 z-20 shrink-0 bg-brand px-4 pb-4 pt-5 text-white safe-top">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-extrabold tracking-tight">
              jambarr<span className="text-white/70">store</span>
            </p>
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="relative rounded-full p-1.5 transition-colors duration-150 ease-out hover:bg-white/15"
              aria-label="Notifications"
            >
              <BellIcon className="h-5 w-5" aria-hidden />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-white" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => navigate('/recherche')}
            className="mt-3 flex w-full items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-left text-sm text-ink-muted transition-shadow duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <SearchIcon className="h-4 w-4" aria-hidden />
            Rechercher un produit, une marque…
          </button>
        </header>
      )}

      <main
        key={location.pathname}
        className="flex-1 overflow-y-auto pb-24"
      >
        <Outlet />
      </main>

      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-sand/80 z-50">
          <div className="rounded-2xl bg-white p-8 shadow-card ring-1 ring-line/70 text-center max-w-md">
            <p className="text-sm text-rose-600 mb-4">{error}</p>
            <p className="text-sm text-ink-muted">Vérifiez votre connexion</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {!isDetailPage && !loading && !error && (
        <nav
          aria-label="Navigation principale"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur safe-bottom"
        >
          <ul className="flex items-stretch justify-between px-2 pb-2 pt-1.5">
            {tabs.map((tab) => (
              <li key={tab.to} className="flex-1">
                <NavLink
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    `relative flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors duration-150 ease-out ${
                      isActive
                        ? 'text-brand'
                        : 'text-ink-muted hover:text-ink-soft'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative">
                        <tab.icon
                          className="h-5 w-5"
                          strokeWidth={isActive ? 2.4 : 1.8}
                          aria-hidden
                        />
                        {tab.to === '/panier' && cartCount > 0 && (
                          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                            {cartCount}
                          </span>
                        )}
                      </span>
                      {tab.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="rounded-2xl bg-white p-8 shadow-card ring-1 ring-line/70">
            <Loader2Icon className="h-8 w-8 animate-spin text-brand" />
            <p className="mt-4 text-sm text-ink">Chargement...</p>
          </div>
        </div>
      )}
    </div>
  );
}