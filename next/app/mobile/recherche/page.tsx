"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function RecherchePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/backend/api/products?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : data.products || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="sticky top-0 z-10 bg-[#FAF7F2] border-b border-[#E5E5EA] px-4 py-3 flex items-center gap-3">
        <Link href="/mobile/" className="text-[#1A1A1A]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E5EA] text-sm focus:outline-none focus:border-[#FF6B00]"
          />
        </form>
      </div>

      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : results.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <Search className="w-12 h-12 mb-4" />
            <p>{searched ? "Aucun résultat" : "Recherchez un produit"}</p>
          </div>
        ) : (
          results.map((product: any) => (
            <Link
              key={product.id}
              href={`/mobile/produit/${product.id}`}
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
                <h3 className="text-sm font-medium truncate">{product.name}</h3>
                <p className="text-[#FF6B00] font-bold text-sm mt-1">{product.price?.toLocaleString()} FCFA</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
