import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  LayoutGridIcon,
  PackageIcon,
  ShoppingBagIcon,
  UserIcon,
} from 'lucide-react';
import { useStore } from '@jambarrtech/shared';

const tabs = [
  { to: '/', label: 'Accueil', icon: HomeIcon, end: true },
  { to: '/categories', label: 'Catégories', icon: LayoutGridIcon, end: false },
  { to: '/panier', label: 'Panier', icon: ShoppingBagIcon, end: false },
  { to: '/commandes', label: 'Commandes', icon: PackageIcon, end: false },
  { to: '/compte', label: 'Compte', icon: UserIcon, end: false },
];

export function MobileLayout() {
  const { cartCount } = useStore();
  const location = useLocation();

  const isDetailPage = /^\/produit\//.test(location.pathname) ||
    /^\/commandes\//.test(location.pathname) ||
    /^\/vendeur\//.test(location.pathname) ||
    ['/favoris', '/recherche', '/notifications', '/aide', '/adresses'].includes(location.pathname);

  return (
    <div className="relative flex h-full min-h-screen flex-col overflow-hidden bg-sand">
      <main
        key={location.pathname}
        className="no-scrollbar flex-1 overflow-y-auto pb-24"
      >
        <Outlet />
      </main>

      {!isDetailPage && (
        <nav
          aria-label="Navigation principale"
          className="fixed inset-x-0 bottom-0 border-t border-line bg-white/95 backdrop-blur"
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
    </div>
  );
}
