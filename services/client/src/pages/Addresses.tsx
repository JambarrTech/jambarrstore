import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  MapPinIcon,
  PlusIcon,
  Trash2Icon,
  CheckCircleIcon,
} from 'lucide-react';
import { useStore } from '@jambarrtech/shared';

const cities = [
  'Dakar — Plateau',
  'Dakar — Sacré-Cœur',
  'Dakar — Ouakam',
  'Dakar — Parcelles',
  'Thiès — Centre',
  'Saint-Louis',
  'Mbour',
];

export function Addresses() {
  const { addresses, addAddress, removeAddress, setPrimaryAddress } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [city, setCity] = useState(cities[0]);
  const [detail, setDetail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !detail.trim()) return;
    addAddress({ label: label.trim(), city, detail: detail.trim(), primary: addresses.length === 0 });
    setLabel('');
    setDetail('');
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-sand">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <Link to="/compte" className="rounded-lg p-1.5 text-ink-muted hover:bg-sand">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">Adresses de livraison</h1>
      </header>

      <div className="px-4 pt-4">
        {addresses.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPinIcon className="h-12 w-12 text-ink-muted" />
            <p className="mt-4 text-sm text-ink-muted">Aucune adresse enregistrée.</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
            >
              Ajouter une adresse
            </button>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {addresses.map((addr) => (
                <li
                  key={addr.id}
                  className={`rounded-2xl bg-white p-4 ring-1 ring-line/70 ${
                    addr.primary ? 'ring-2 ring-brand' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                      <div>
                        <p className="text-sm font-semibold text-ink">{addr.label}</p>
                        <p className="text-xs text-ink-muted">{addr.city}</p>
                        <p className="text-xs text-ink-muted">{addr.detail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {addr.primary && (
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                          Principal
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {!addr.primary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryAddress(addr.id)}
                        className="flex items-center gap-1 rounded-lg bg-sand px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-line"
                      >
                        <CheckCircleIcon className="h-3 w-3" />
                        Définir principal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAddress(addr.id)}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-berry hover:bg-rose-50"
                    >
                      <Trash2Icon className="h-3 w-3" />
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-3 text-sm font-semibold text-ink-muted transition-colors hover:border-brand hover:text-brand"
              >
                <PlusIcon className="h-4 w-4" />
                Ajouter une adresse
              </button>
            )}
          </>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-line/70">
            <h2 className="text-sm font-bold text-ink">Nouvelle adresse</h2>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-semibold text-ink-soft">
                  Nom de l'adresse
                </label>
                <input
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex: Maison, Bureau..."
                  className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-soft">Ville</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
                >
                  {cities.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-soft">
                  Détails (quartier, repère...)
                </label>
                <input
                  required
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Ex: Derrière la mosquée..."
                  className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-ink-soft hover:bg-sand"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
              >
                Enregistrer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
