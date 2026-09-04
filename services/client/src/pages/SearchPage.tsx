import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, SearchIcon, XIcon } from 'lucide-react';
import { useStore } from '@jambarrtech/shared';
import { ProductCard } from '../components/ProductCard';

const recentSearchesKey = 'jambarr_recent_searches';

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(recentSearchesKey) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const recent = getRecentSearches().filter((s) => s !== term);
  recent.unshift(term);
  localStorage.setItem(recentSearchesKey, JSON.stringify(recent.slice(0, 10)));
}

function clearRecentSearches() {
  localStorage.removeItem(recentSearchesKey);
}

export function SearchPage() {
  const { products } = useStore();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(getRecentSearches);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.active &&
        (p.name.toLowerCase().includes(q) ||
          p.seller.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q))
    );
  }, [products, query]);

  function handleSearch(term: string) {
    if (!term.trim()) return;
    saveRecentSearch(term);
    setRecentSearches(getRecentSearches());
    setQuery(term);
  }

  function handleClear() {
    clearRecentSearches();
    setRecentSearches([]);
  }

  const suggestions = [
    { label: 'Téléphones', query: 'téléphone' },
    { label: 'Beauté', query: 'beauté' },
    { label: 'Maison', query: 'maison' },
    { label: 'Mode', query: 'mode' },
  ];

  return (
    <div className="min-h-screen bg-sand">
      <header className="sticky top-0 z-10 bg-white px-4 pb-3 pt-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="rounded-lg p-1.5 text-ink-muted hover:bg-sand">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch(query);
              }}
              placeholder="Rechercher un produit..."
              className="w-full rounded-xl border border-line bg-sand py-2.5 pl-9 pr-9 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 pt-4">
        {query.trim() ? (
          <>
            <p className="text-xs text-ink-muted">
              {results.length} résultat{results.length > 1 ? 's' : ''} pour "{query}"
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {results.length === 0 && (
              <p className="py-12 text-center text-sm text-ink-muted">
                Aucun produit trouvé pour cette recherche.
              </p>
            )}
          </>
        ) : (
          <>
            <section className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Recherches récentes
                </h2>
                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs font-semibold text-brand"
                  >
                    Tout effacer
                  </button>
                )}
              </div>
              {recentSearches.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">Aucune recherche récente.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {recentSearches.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => handleSearch(term)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-ink hover:bg-white"
                      >
                        <SearchIcon className="h-3.5 w-3.5 text-ink-muted" />
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Suggestions
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.query}
                    type="button"
                    onClick={() => handleSearch(s.query)}
                    className="rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink-soft transition-colors hover:border-brand hover:text-brand"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
