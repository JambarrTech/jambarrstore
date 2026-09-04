import React, { useMemo, useState } from 'react';
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { useStore, formatPrice } from '@jambarrtech/shared';
import { ProductDrawer } from '../components/ProductDrawer';

export function AdminProducts() {
  const { products, categories, saveProduct, deleteProduct, toggleProductActive } = useStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    return products.filter((p) => {
      const matchCat = category === 'all' || p.categoryId === category;
      const matchQuery = p.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, category, query]);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(product: any) {
    setEditing(product);
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Rechercher un produit"
            aria-label="Rechercher un produit"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filtrer par catégorie"
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors duration-150 ease-out hover:bg-brand-dark"
        >
          <PlusIcon className="h-4 w-4" aria-hidden />
          Ajouter un produit
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line/70">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                <th scope="col" className="px-5 py-3 font-semibold">
                  Produit
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Catégorie
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Prix
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Stock
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Statut
                </th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((p) => (
                <tr key={p.id} className="align-middle">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt=""
                        className="h-11 w-11 rounded-lg bg-sand object-contain p-1"
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium text-ink">
                          {p.name}
                        </p>
                        <p className="text-xs text-ink-muted">{p.seller}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">
                    {categories.find((c) => c.id === p.categoryId)?.label}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-ink">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        p.stock === 0
                          ? 'text-berry'
                          : p.stock <= 5
                          ? 'text-brand-dark'
                          : 'text-ink'
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => toggleProductActive(p.id)}
                      aria-pressed={p.active}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-150 ease-out ${
                        p.active
                          ? 'bg-emerald-50 text-leaf hover:bg-emerald-100'
                          : 'bg-sand text-ink-muted hover:bg-line'
                      }`}
                    >
                      {p.active ? 'En ligne' : 'Masqué'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        aria-label={`Modifier ${p.name}`}
                        className="rounded-lg p-2 text-ink-soft transition-colors duration-150 ease-out hover:bg-sand hover:text-ink"
                      >
                        <PencilIcon className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id)}
                        aria-label={`Supprimer ${p.name}`}
                        className="rounded-lg p-2 text-ink-soft transition-colors duration-150 ease-out hover:bg-rose-50 hover:text-berry"
                      >
                        <Trash2Icon className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-ink-muted">
            Aucun produit ne correspond à cette recherche.
          </p>
        )}
      </div>

      <ProductDrawer
        open={open}
        product={editing}
        onClose={() => setOpen(false)}
        onSave={saveProduct}
      />
    </div>
  );
}
