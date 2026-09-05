"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Store } from "lucide-react";
import Link from "next/link";

export default function VendeurPage() {
  const params = useParams();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      fetch(`/backend/api/sellers/${params.id}`).then((r) => r.json()),
      fetch(`/backend/api/sellers/${params.id}/products`).then((r) => r.json()),
    ])
      .then(([s, p]) => {
        setSeller(s);
        setProducts(Array.isArray(p) ? p : p.products || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] px-4 py-6">
        <div className="space-y-3">
          <div className="bg-white rounded-xl h-24 border border-[#E5E5EA] animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-20 border border-[#E5E5EA] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-gray-400">
        Vendeur introuvable
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-6">
      <div className="bg-white rounded-xl border border-[#E5E5EA] p-4 mb-4 flex items-center gap-3">
        <div className="w-12 h-12 bg-[#FF6B00]/10 rounded-xl flex items-center justify-center">
          <Store className="w-6 h-6 text-[#FF6B00]" />
        </div>
        <div>
          <h1 className="font-bold text-lg">{seller.name || "Vendeur"}</h1>
          <p className="text-xs text-gray-400">{products.length} produit(s)</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-400 py-10">Aucun produit disponible</div>
      ) : (
        <div className="space-y-3">
          {products.map((product: any) => (
            <Link
              key={product.id}
              href={`/mobile/produit/${product.id}`}
              className="bg-white rounded-xl border border-[#E5E5EA] p-3 flex items-center gap-3"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>📦</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-sm font-bold text-[#FF6B00]">{product.price?.toLocaleString()} FCFA</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
