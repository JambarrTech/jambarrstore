"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, LayoutGrid, Home } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([prods, cats]) => {
        setProducts(Array.isArray(prods) ? prods : prods.products || []);
        setCategories(Array.isArray(cats) ? cats : cats.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = [...products];
    if (activeCategory) list = list.filter((p: any) => String(p.categoryId) === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p: any) => p.name?.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [products, search, activeCategory]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      <div className="sticky top-0 z-10 bg-[#FAF7F2] border-b border-[#E5E5EA] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E5EA] text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-3 overflow-x-auto flex gap-2 no-scrollbar">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
            !activeCategory ? "bg-[#FF6B00] text-white" : "bg-white border border-[#E5E5EA] text-[#1A1A1A]"
          }`}
        >
          Tout
        </button>
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === String(cat.id) ? null : String(cat.id))}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeCategory === String(cat.id)
                ? "bg-[#FF6B00] text-white"
                : "bg-white border border-[#E5E5EA] text-[#1A1A1A]"
            }`}
          >
            {cat.emoji || "📦"} {cat.name}
          </button>
        ))}
      </div>

      <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400">Aucun produit trouvé</div>
        ) : (
          filtered.map((product: any) => (
            <Link
              key={product.id}
              href={`/produit/${product.id}`}
              className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">📦</span>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-[#1A1A1A] truncate">{product.name}</h3>
                <p className="text-[#FF6B00] font-bold mt-1">{product.price?.toLocaleString()} FCFA</p>
                <p className="text-xs text-gray-400 mt-0.5">{product.soldCount || 0} vendus</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5EA] flex justify-around items-center h-16 z-50">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-[#FF6B00]">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>
        <Link href="/categories" className="flex flex-col items-center gap-0.5 text-gray-400">
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px]">Catégories</span>
        </Link>
        <Link href="/panier" className="flex flex-col items-center gap-0.5 text-gray-400 relative">
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px]">Panier</span>
        </Link>
        <Link href="/compte" className="flex flex-col items-center gap-0.5 text-gray-400">
          <User className="w-5 h-5" />
          <span className="text-[10px]">Compte</span>
        </Link>
      </nav>
    </div>
  );
}
