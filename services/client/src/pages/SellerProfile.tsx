import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, StarIcon, MapPinIcon } from 'lucide-react';
import { useStore, formatPrice } from '@jambarrtech/shared';
import { ProductCard } from '../components/ProductCard';

export function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const { products } = useStore();
  const sellerProducts = products.filter((p) => p.seller === id && p.active);
  const sellerName = sellerProducts[0]?.seller || id;

  return (
    <div className="min-h-screen bg-sand">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <Link to="/" className="rounded-lg p-1.5 text-ink-muted hover:bg-sand">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-bold text-ink line-clamp-1">
          {sellerName}
        </h1>
      </header>

      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-line/70">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft font-display text-lg font-bold text-brand-dark">
              {sellerName.charAt(0)}
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink">{sellerName}</p>
              <div className="flex items-center gap-1 text-xs text-ink-muted">
                <StarIcon className="h-3 w-3 fill-brand text-brand" />
                <span>4.8</span>
                <span>•</span>
                <span>{sellerProducts.length} produit{sellerProducts.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mt-5 font-display text-sm font-bold text-ink">
          Produits du vendeur
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 pb-6">
          {sellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {sellerProducts.length === 0 && (
            <p className="col-span-2 py-12 text-center text-sm text-ink-muted">
              Aucun produit actif de ce vendeur.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
