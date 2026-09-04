import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HeadphonesIcon,
  MessageCircleIcon,
  PhoneIcon,
  MailIcon,
} from 'lucide-react';

const faqItems = [
  {
    q: 'Comment passer une commande ?',
    a: 'Ajoutez vos produits au panier, choisissez votre ville de livraison et votre moyen de paiement, puis cliquez sur "Commander". Vous recevrez un numéro de suivi.',
  },
  {
    q: 'Quels sont les délais de livraison ?',
    a: 'La livraison est effectuée sous 24 à 48h à Dakar et sous 48 à 72h pour les autres villes.',
  },
  {
    q: 'Comment payer ma commande ?',
    a: 'Nous acceptons Wave, Orange Money et le paiement à la livraison en espèces.',
  },
  {
    q: 'Puis-je retourner un produit ?',
    a: 'Oui, vous avez 7 jours après réception pour retourner un produit non utilisé dans son emballage d\'origine.',
  },
  {
    q: 'Comment suivre ma commande ?',
    a: 'Allez dans "Mes commandes" depuis votre compte pour voir le statut en temps réel de votre commande.',
  },
  {
    q: 'Comment contacter le support ?',
    a: 'Vous pouvez nous écrire à support@jambarrtech.sn ou nous appeler au +221 77 123 45 67.',
  },
];

export function Help() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-sand">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <Link to="/compte" className="rounded-lg p-1.5 text-ink-muted hover:bg-sand">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">Aide & Support</h1>
      </header>

      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <a
            href="tel:+221771234567"
            className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 ring-1 ring-line/70"
          >
            <PhoneIcon className="h-5 w-5 text-brand" />
            <span className="text-[11px] font-semibold text-ink-soft">Téléphone</span>
          </a>
          <a
            href="https://wa.me/221771234567"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 ring-1 ring-line/70"
          >
            <MessageCircleIcon className="h-5 w-5 text-leaf" />
            <span className="text-[11px] font-semibold text-ink-soft">WhatsApp</span>
          </a>
          <a
            href="mailto:support@jambarrtech.sn"
            className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 ring-1 ring-line/70"
          >
            <MailIcon className="h-5 w-5 text-brand" />
            <span className="text-[11px] font-semibold text-ink-soft">Email</span>
          </a>
        </div>

        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Questions fréquentes
        </h2>
        <div className="mt-2 rounded-2xl bg-white ring-1 ring-line/70">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-ink"
              >
                {item.q}
                <ChevronDownIcon
                  className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-sm leading-relaxed text-ink-soft">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
