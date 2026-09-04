import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheckIcon, TruckIcon, ZapIcon, Loader2Icon } from 'lucide-react';
import { useStore, formatPrice } from '@jambarrtech/shared';
import { ProductCard } from '../components/ProductCard';

const bannerImage = '/64c39673-b5d1-4da4-af8c-0031da22ce09.jpg';

export function Home() {
  const { products, categories, loading, error } = useStore();
  const navigate = useNavigate();

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
  const deals = visible.filter((p) => p.oldPrice);
  const popular = [...visible].sort((a, b) => b.sold - a.sold);

  return (
    <div>
      <section className="px-4 pt-4" aria-label="Promotion en cours">
        <div className="relative overflow-hidden rounded-2xl bg-brand-dark">
          <img
            src={bannerImage}
            alt=""
            className="h-40 w-full object-cover object-right"
          />
          <div className="absolute inset-y-0 left-0 flex w-3/5 flex-col justify-center px-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/80">
              Tabaski deals
            </p>
            <p className="mt-1 font-display text-xl font-extrabold leading-tight text-white">
              Jusqu'à -40% sur la maison
            </p>
            <Link
              to="/categories?cat=maison"
              className="mt-3 w-fit rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink transition-colors duration-150 ease-out hover:bg-white/85"
            >
              J'en profite
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pt-5" aria-label="Catégories">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories?cat=${cat.id}`}
              className="whitespace-nowrap rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink-soft transition-colors duration-150 ease-out hover:border-brand hover:text-brand"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {deals.length > 0 && (
        <section className="px-4 pt-6" aria-labelledby="flash-title">
          <div className="flex items-end justify-between">
            <h2
              id="flash-title"
              className="flex items-center gap-1.5 font-display text-base font-bold text-ink"
            >
              <ZapIcon className="h-4 w-4 fill-brand text-brand" aria-hidden />
              Ventes flash
            </h2>
          </div>
          <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
            {deals.map((product) => (
              <Link
                key={product.id}
                to={`/produit/${product.id}`}
                className="w-32 shrink-0 rounded-2xl bg-white p-2 shadow-card ring-1 ring-line/70"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-24 w-full rounded-xl bg-sand object-contain p-1.5"
                  loading="lazy"
                />
                <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-ink">
                  {product.name}
                </p>
                <p className="mt-1 font-display text-[13px] font-bold text-brand">
                  {formatPrice(product.price)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="px-4 pt-6" aria-label="Garanties">
        <ul className="grid grid-cols-2 gap-2">
          <li className="flex items-center gap-2 rounded-xl bg-white p-2.5 ring-1 ring-line/70">
            <TruckIcon className="h-4 w-4 text-leaf" aria-hidden />
            <span className="text-[11px] font-medium text-ink-soft">
              Livraison 24h à Dakar
            </span>
          </li>
          <li className="flex items-center gap-2 rounded-xl bg-white p-2.5 ring-1 ring-line/70">
            <ShieldCheckIcon className="h-4 w-4 text-leaf" aria-hidden />
            <span className="text-[11px] font-medium text-ink-soft">
              Paiement à la livraison
            </span>
          </li>
        </ul>
      </section>

      <section className="px-4 pb-6 pt-6" aria-labelledby="popular-title">
        <h2
          id="popular-title"
          className="font-display text-base font-bold text-ink"
        >
          Les plus achetés
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {popular.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
