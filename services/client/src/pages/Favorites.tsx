import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, HeartIcon } from 'lucide-react';
import { useStore, formatPrice } from '@jambarrtech/shared';
import { ProductCard } from '../components/ProductCard';

export function Favorites() {
  const { products, favorites } = useStore();
  const favProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-sand">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <Link to="/dashboard" className="rounded-lg p-1.5 text-ink-muted hover:bg-sand">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">Mes favoris</h1>
        <span className="ml-auto text-sm text-ink-muted">
          {favProducts.length} produit{favProducts.length > 1 ? 's' : ''}
        </span>
      </header>

      {favProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <HeartIcon className="h-12 w-12 text-ink-muted" />
          <p className="mt-4 text-sm text-ink-muted">
            Aucun produit en favori pour le moment.
          </p>
          <Link
            to="/dashboard"
            className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
          >
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-6 pt-4">
          {favProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
