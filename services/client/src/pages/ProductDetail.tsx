import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  HeartIcon,
  StarIcon,
  ShoppingCartIcon,
  Share2Icon,
  Loader2Icon,
  ChevronDownIcon,
  MessageCircleIcon,
} from 'lucide-react';
import { useStore, formatPrice } from '@jambarrtech/shared';

const reviewData = [
  { name: 'Aminata D.', rating: 5, date: 'Il y a 2 jours', text: 'Excellent produit, je recommande ! La qualité est au rendez-vous.' },
  { name: 'Moussa S.', rating: 4, date: 'Il y a 1 semaine', text: 'Bon rapport qualité-prix. Livraison rapide.' },
  { name: 'Fatou N.', rating: 5, date: 'Il y a 2 semaines', text: 'Exactement comme sur la photo. Très satisfaite.' },
];

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { getProduct, addToCart, toggleFavorite, isFavorite, loading } = useStore();
  const product = getProduct(id ?? '');
  const [showReviews, setShowReviews] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <Loader2Icon className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <p className="text-sm text-ink-muted">Produit introuvable.</p>
      </div>
    );
  }

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const liked = isFavorite(product.id);

  function handleAddToCart() {
    addToCart(product.id);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleShare() {
    const text = `${product.name} - ${formatPrice(product.price)} sur jambarrstore`;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.name, text, url });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    }
  }

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <Link to="/" className="rounded-lg p-1.5 text-ink-muted hover:bg-sand">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-sm font-bold text-ink line-clamp-1">
          {product.name}
        </h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-sand"
          >
            <Share2Icon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            className="rounded-lg p-1.5 hover:bg-sand"
          >
            <HeartIcon
              className={`h-5 w-5 ${liked ? 'fill-berry text-berry' : 'text-ink-muted'}`}
            />
          </button>
        </div>
      </header>

      <div className="bg-white">
        <img
          src={product.image}
          alt={product.name}
          className="mx-auto h-64 w-64 object-contain p-4"
        />
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              {product.name}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-ink-muted">
                <StarIcon className="h-3.5 w-3.5 fill-brand text-brand" />
                <span>{product.rating.toFixed(1)}</span>
                <span>({product.reviews})</span>
              </div>
              <span className="text-xs text-ink-muted">•</span>
              <span className="text-xs text-ink-muted">{product.sold} vendus</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold text-brand">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <>
              <span className="text-sm text-ink-muted line-through">
                {formatPrice(product.oldPrice)}
              </span>
              <span className="rounded-full bg-berry/10 px-2 py-0.5 text-xs font-bold text-berry">
                -{discount}%
              </span>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
          <span>Vendu par{' '}
            <Link to={`/vendeur/${encodeURIComponent(product.seller)}`} className="font-bold text-brand underline">
              {product.seller}
            </Link>
          </span>
          <span>•</span>
          <span className={product.stock > 0 ? 'text-leaf' : 'text-berry'}>
            {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
          </span>
        </div>

        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Description
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {product.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowReviews(!showReviews)}
          className="mt-5 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-line/70"
        >
          <div className="flex items-center gap-2">
            <StarIcon className="h-4 w-4 fill-brand text-brand" />
            <span className="text-sm font-semibold text-ink">
              Avis ({reviewData.length})
            </span>
          </div>
          <ChevronDownIcon
            className={`h-4 w-4 text-ink-muted transition-transform duration-200 ${
              showReviews ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showReviews && (
          <div className="mt-3 space-y-3">
            {reviewData.map((review, i) => (
              <div key={i} className="rounded-2xl bg-white p-4 ring-1 ring-line/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-dark">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{review.name}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <StarIcon
                            key={j}
                            className={`h-3 w-3 ${
                              j < review.rating ? 'fill-brand text-brand' : 'text-line'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-ink-muted">{review.date}</span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white px-4 py-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-colors disabled:opacity-50 ${
            addedToCart ? 'bg-leaf' : 'bg-brand hover:bg-brand-dark'
          }`}
        >
          {addedToCart ? (
            <>
              <CheckCircleIcon className="h-4 w-4" />
              Ajouté au panier !
            </>
          ) : (
            <>
              <ShoppingCartIcon className="h-4 w-4" />
              Ajouter au panier
            </>
          )}
        </button>
      </div>
    </div>
  );
}
