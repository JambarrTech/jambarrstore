import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, SlidersHorizontalIcon, Loader2Icon } from 'lucide-react';
import { useStore } from '@jambarrtech/shared';
import { ProductCard } from '../components/ProductCard';

export function Categories() {
  const { products, categories, loading, error } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get('cat');
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <Loader2Icon className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand px-4">
        <div className="rounded-2xl bg-white p-6 text-center ring-1 ring-line/70">
          <p className="text-sm text-rose-600">{error}</p>
          <p className="mt-2 text-xs text-ink-muted">Vérifiez que l'API est démarrée.</p>
        </div>
      </div>
    );
  }

  const visible = products.filter((p) => p.active);
  const filtered = visible.filter((p) => {
    if (activeCat && p.categoryId !== activeCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <header className="sticky top-0 z-10 bg-white px-4 pb-3 pt-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="rounded-lg p-1.5 text-ink-muted hover:bg-sand">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-lg font-bold text-ink">Catalogue</h1>
          <button
            type="button"
            className="ml-auto rounded-lg p-1.5 text-ink-muted hover:bg-sand"
          >
            <SlidersHorizontalIcon className="h-5 w-5" />
          </button>
        </div>
        <input
          type="search"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-3 w-full rounded-xl border border-line bg-sand px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </header>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-3">
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
            !activeCat
              ? 'border-brand bg-brand text-white'
              : 'border-line bg-white text-ink-soft hover:border-brand hover:text-brand'
          }`}
        >
          Tout
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSearchParams({ cat: cat.id })}
            className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeCat === cat.id
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-white text-ink-soft hover:border-brand hover:text-brand'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-6 pt-2">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 py-12 text-center text-sm text-ink-muted">
            Aucun produit trouvé.
          </p>
        )}
      </div>
    </div>
  );
}
