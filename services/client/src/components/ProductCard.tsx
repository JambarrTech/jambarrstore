import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from 'lucide-react';
import { formatPrice } from '@jambarrtech/shared';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    oldPrice?: number;
    image: string;
    stock: number;
    rating: number;
    reviews: number;
    sold: number;
    seller: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <Link
      to={`/produit/${product.id}`}
      className="group flex h-full flex-col rounded-2xl bg-white shadow-card ring-1 ring-line/70 transition-shadow duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-sand">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-3 transition-transform duration-200 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-berry px-2 py-0.5 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1 text-center text-[11px] font-semibold text-white">
            Rupture de stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">
          {product.name}
        </h3>
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[15px] font-bold text-ink">
              {formatPrice(product.price)}
            </span>
          </div>
          {product.oldPrice && (
            <span className="text-[11px] text-ink-muted line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          <div className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted">
            <StarIcon className="h-3 w-3 fill-brand text-brand" aria-hidden />
            <span>{product.rating.toFixed(1)}</span>
            <span aria-hidden>.</span>
            <span>{product.sold} vendus</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
