"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Heart, User, Star } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

export default function MobileHomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/api/products").then((r) => r.json()),
      apiFetch("/api/categories").then((r) => r.json()),
    ])
      .then(([p, c]) => {
        setProducts(Array.isArray(p) ? p.slice(0, 10) : []);
        setCategories(Array.isArray(c) ? c : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20">
      {/* Header */}
      <div className="bg-[#FF6B00] px-4 pt-6 pb-8 rounded-b-3xl">
        <h1 className="text-white text-xl font-bold mb-4">Jambarr Store</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mt-4">
        <h2 className="font-bold text-[#1A1A1A] mb-3">Catégories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-16 bg-white rounded-xl border border-[#E5E5EA] animate-pulse flex-shrink-0" />
              ))
            : categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/mobile/categories`}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                >
                  <div className="w-14 h-14 bg-white rounded-xl border border-[#E5E5EA] flex items-center justify-center">
                    <span className="text-2xl">{cat.emoji || "📦"}</span>
                  </div>
                  <span className="text-[10px] text-gray-500">{cat.label}</span>
                </Link>
              ))}
        </div>
      </div>

      {/* Products */}
      <div className="px-4 mt-4">
        <h2 className="font-bold text-[#1A1A1A] mb-3">Produits populaires</h2>
        <div className="space-y-3">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#E5E5EA] h-24 animate-pulse" />
              ))
            : products
                .filter((p) =>
                  search ? p.name.toLowerCase().includes(search.toLowerCase()) : true
                )
                .map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/mobile/produit/${product.id}`}
                    className="bg-white rounded-xl border border-[#E5E5EA] p-3 flex items-center gap-3"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#1A1A1A] truncate">{product.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] text-gray-400">{product.rating || 4.5}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-[#FF6B00]">
                          {(product.price || 0).toLocaleString()} FCFA
                        </span>
                        {product.oldPrice && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {product.oldPrice.toLocaleString()} FCFA
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
        </div>
      </div>
    </div>
  );
}