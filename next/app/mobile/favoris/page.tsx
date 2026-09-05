"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { apiFetch } from '@/lib/apiClient';

export default function FavorisPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jambarr_token");
    if (!token) {
      router.push("/mobile/connexion");
      return;
    }
    const favIds = JSON.parse(localStorage.getItem("jambarr_favorites") || "[]");
    if (favIds.length === 0) {
      setLoading(false);
      return;
    }
    fetch(`/api/products?ids=${favIds.join(",")}`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const removeFavorite = (id: string) => {
    const favs = JSON.parse(localStorage.getItem("jambarr_favorites") || "[]");
    localStorage.setItem("jambarr_favorites", JSON.stringify(favs.filter((f: string) => f !== id)));
    setProducts((p) => p.filter((prod) => prod.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="sticky top-0 z-10 bg-[#FAF7F2] border-b border-[#E5E5EA] px-4 py-3 flex items-center gap-3">
        <Link href="/mobile/compte" className="text-[#1A1A1A]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">Mes favoris</h1>
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
        ) : products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <Heart className="w-12 h-12 mb-4" />
            <p>Aucun favori</p>
            <Link href="/mobile/" className="mt-4 text-[#FF6B00] font-medium text-sm">Voir les produits</Link>
          </div>
        ) : (
          products.map((product: any) => (
            <div key={product.id} className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden relative">
              <button
                onClick={() => removeFavorite(product.id)}
                className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
              >
                <Heart className="w-4 h-4 fill-[#FF6B00] text-[#FF6B00]" />
              </button>
              <Link href={`/mobile/produit/${product.id}`}>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
