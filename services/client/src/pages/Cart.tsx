import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, MinusIcon, PlusIcon, TrashIcon, Loader2Icon } from 'lucide-react';
import { useStore, formatPrice } from '@jambarrtech/shared';

const cities = [
  'Dakar — Plateau',
  'Dakar — Sacré-Cœur',
  'Dakar — Ouakam',
  'Dakar — Parcelles',
  'Thiès — Centre',
  'Saint-Louis',
  'Mbour'
];

const paymentMethods = [
  { id: 'wave', label: 'Wave', emoji: '📱' },
  { id: 'orange', label: 'Orange Money', emoji: '🟠' },
  { id: 'cash', label: 'Paiement à la livraison', emoji: '💵' },
];

export function Cart() {
  const { cart, cartTotal, getProduct, setQuantity, removeFromCart, checkout } =
    useStore();
  const [city, setCity] = useState(cities[0]);
  const [payment, setPayment] = useState('wave');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const id = await checkout(city, payment);
      if (id) setOrderId(id);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  }

  if (orderId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-sand px-4 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-card ring-1 ring-line/70">
          <p className="text-4xl">✅</p>
          <h2 className="mt-4 font-display text-xl font-extrabold text-ink">
            Commande passée !
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Numéro de suivi : <strong>{orderId}</strong>
          </p>
          <Link
            to="/commandes"
            className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
          >
            Voir mes commandes
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-sand px-4 text-center">
        <p className="text-4xl">🛒</p>
        <h2 className="mt-4 font-display text-lg font-bold text-ink">
          Votre panier est vide
        </h2>
        <Link
          to="/"
          className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
        >
          Découvrir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand pb-32">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <Link to="/" className="rounded-lg p-1.5 text-ink-muted hover:bg-sand">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">Panier</h1>
        <span className="ml-auto text-sm text-ink-muted">
          {cart.length} article{cart.length > 1 ? 's' : ''}
        </span>
      </header>

      <ul className="divide-y divide-line px-4">
        {cart.map((line) => {
          const product = getProduct(line.productId);
          if (!product) return null;
          return (
            <li key={line.productId} className="flex gap-3 py-4">
              <img
                src={product.image}
                alt={product.name}
                className="h-20 w-20 shrink-0 rounded-xl bg-sand object-contain p-1"
              />
              <div className="flex flex-1 flex-col">
                <p className="line-clamp-2 text-sm font-medium text-ink">
                  {product.name}
                </p>
                <p className="mt-1 text-sm font-bold text-brand">
                  {formatPrice(product.price)}
                </p>
                <div className="mt-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(line.productId, line.quantity - 1)}
                    className="rounded-lg border border-line p-1 hover:bg-sand"
                  >
                    <MinusIcon className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.productId, line.quantity + 1)}
                    className="rounded-lg border border-line p-1 hover:bg-sand"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(line.productId)}
                    className="ml-auto rounded-lg p-1 text-berry hover:bg-rose-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white px-4 py-4">
        <div className="mb-3">
          <label className="text-xs font-semibold text-ink-soft">
            Ville de livraison
          </label>
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

        <div className="mb-3">
          <label className="text-xs font-semibold text-ink-soft">
            Paiement
          </label>
          <div className="mt-1 flex gap-2">
            {paymentMethods.map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPayment(pm.id)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
                  payment === pm.id
                    ? 'border-brand bg-brand/5 text-brand ring-1 ring-brand'
                    : 'border-line bg-sand text-ink-muted hover:border-brand/40'
                }`}
              >
                <span className="block text-lg">{pm.emoji}</span>
                {pm.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">Total</span>
          <span className="font-display text-xl font-extrabold text-ink">
            {formatPrice(cartTotal)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            'Commander'
          )}
        </button>
      </div>
    </div>
  );
}
