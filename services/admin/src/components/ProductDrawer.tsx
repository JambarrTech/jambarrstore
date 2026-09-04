import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useStore, ProductApi } from '@jambarrtech/shared';

interface ProductDrawerProps {
  open: boolean;
  product: ProductApi | null;
  onClose: () => void;
  onSave: (product: Partial<ProductApi>) => void;
}

const empty: ProductApi = {
  id: '',
  name: '',
  categoryId: 'electronique',
  price: 0,
  image: "/cdc1b42b-fe11-4af7-9909-9f60cad5abbd.jpg",
  stock: 0,
  rating: 0,
  reviews: 0,
  sold: 0,
  seller: 'Jambarr Officiel',
  description: '',
  active: true
};

export function ProductDrawer({ open, product, onClose, onSave }: ProductDrawerProps) {
  const { categories } = useStore();
  const [draft, setDraft] = useState<ProductApi>(product ?? empty);

  useEffect(() => {
    setDraft(product ?? { ...empty, id: `p-${Date.now()}` });
  }, [product, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim() || draft.price <= 0) return;
    onSave(draft);
    onClose();
  }

  const fieldClass =
    'mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-30 flex justify-end">
          <motion.button
            type="button"
            aria-label="Fermer le panneau"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0 bg-ink/40"
          />
          <motion.aside
            role="dialog"
            aria-label={product ? 'Modifier le produit' : 'Nouveau produit'}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="relative flex h-full w-full max-w-md flex-col bg-sand shadow-device"
          >
            <header className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
              <h2 className="font-display text-base font-bold text-ink">
                {product ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="rounded-lg p-1.5 text-ink-muted transition-colors duration-150 ease-out hover:bg-sand hover:text-ink"
              >
                <XIcon className="h-4 w-4" aria-hidden />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-4 px-5 py-5">
                <div>
                  <label htmlFor="name" className="text-xs font-semibold text-ink-soft">
                    Nom du produit
                  </label>
                  <input
                    id="name"
                    required
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className={fieldClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="price" className="text-xs font-semibold text-ink-soft">
                      Prix (FCFA)
                    </label>
                    <input
                      id="price"
                      type="number"
                      min={0}
                      required
                      value={draft.price || ''}
                      onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="stock" className="text-xs font-semibold text-ink-soft">
                      Stock
                    </label>
                    <input
                      id="stock"
                      type="number"
                      min={0}
                      value={draft.stock}
                      onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="category" className="text-xs font-semibold text-ink-soft">
                      Catégorie
                    </label>
                    <select
                      id="category"
                      value={draft.categoryId}
                      onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
                      className={fieldClass}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="oldPrice" className="text-xs font-semibold text-ink-soft">
                      Prix barré (option.)
                    </label>
                    <input
                      id="oldPrice"
                      type="number"
                      min={0}
                      value={draft.oldPrice ?? ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          oldPrice: e.target.value ? Number(e.target.value) : undefined
                        })
                      }
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="seller" className="text-xs font-semibold text-ink-soft">
                    Vendeur
                  </label>
                  <input
                    id="seller"
                    value={draft.seller}
                    onChange={(e) => setDraft({ ...draft, seller: e.target.value })}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="image" className="text-xs font-semibold text-ink-soft">
                    Image (URL)
                  </label>
                  <input
                    id="image"
                    value={draft.image}
                    onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                    className={fieldClass}
                  />
                  <img
                    src={draft.image}
                    alt=""
                    className="mt-2 h-24 w-24 rounded-xl border border-line bg-white object-contain p-1.5"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="text-xs font-semibold text-ink-soft">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    className={fieldClass}
                  />
                </div>

                <label className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-3 ring-1 ring-line">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                    className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-ink">Visible dans l'application client</span>
                </label>
              </div>

              <footer className="sticky bottom-0 flex gap-3 border-t border-line bg-white px-5 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-ink-soft transition-colors duration-150 ease-out hover:bg-sand"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-bold text-white transition-colors duration-150 ease-out hover:bg-brand-dark"
                >
                  Enregistrer
                </button>
              </footer>
            </form>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
