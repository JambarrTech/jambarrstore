import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRightIcon,
  CreditCardIcon,
  HeadphonesIcon,
  HeartIcon,
  LogOutIcon,
  MapPinIcon,
  PackageIcon,
  BellIcon,
} from 'lucide-react';
import { useStore, formatPrice } from '@jambarrtech/shared';

export function Account() {
  const { orders } = useStore();

  const sections = [
    {
      title: 'Commandes',
      links: [
        { to: '/commandes', label: 'Mes commandes', icon: PackageIcon },
        { to: '/favoris', label: 'Mes favoris', icon: HeartIcon },
      ],
    },
    {
      title: 'Paramètres',
      links: [
        { to: '/adresses', label: 'Adresses de livraison', icon: MapPinIcon },
        { to: '/paiement', label: 'Moyens de paiement', icon: CreditCardIcon },
        { to: '/notifications', label: 'Notifications', icon: BellIcon },
      ],
    },
    {
      title: 'Support',
      links: [
        { to: '/aide', label: 'Aide et support', icon: HeadphonesIcon },
      ],
    },
  ];

  return (
    <div>
      <header className="bg-brand px-4 pb-6 pt-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 font-display text-lg font-bold">
            JD
          </div>
          <div>
            <p className="font-display text-lg font-bold">Mon compte</p>
            <p className="text-xs text-white/75">Client Jambarr</p>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-3 text-center">
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-white/70">
              Commandes
            </dt>
            <dd className="font-display text-base font-bold">{orders.length}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-white/70">
              Points
            </dt>
            <dd className="font-display text-base font-bold">1 240</dd>
          </div>
        </dl>
      </header>

      <nav aria-label="Mon compte" className="p-4 space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              {section.title}
            </h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line/70">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-3 px-4 py-3.5 text-sm text-ink transition-colors duration-150 ease-out hover:bg-sand"
                  >
                    <link.icon className="h-4 w-4 text-ink-muted" aria-hidden />
                    {link.label}
                    <ChevronRightIcon
                      className="ml-auto h-4 w-4 text-ink-muted"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white py-3 text-sm font-semibold text-berry transition-colors duration-150 ease-out hover:bg-rose-50"
        >
          <LogOutIcon className="h-4 w-4" aria-hidden />
          Se déconnecter
        </button>
      </nav>
    </div>
  );
}
