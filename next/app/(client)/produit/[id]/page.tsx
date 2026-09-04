"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Star, Heart } from "lucide-react";

export default function ProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => setProduct(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("jambarr_favorites") || "[]");
    setIsFavorite(favs.includes(id));
  }, [id]);

  const toggleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem("jambarr_favorites") || "[]");
    const next = isFavorite ? favs.filter((f: string) => f !== id) : [...favs, id];
    localStorage.setItem("jambarr_favorites", JSON.stringify(next));
    setIsFavorite(!isFavorite);
  };

  const addToCart = () => {
    setAdding(true);
    const cart = JSON.parse(localStorage.getItem("jambarr_cart") || "[]");
    const existing = cart.find((c: any) => c.productId === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId: id, quantity: 1 });
    }
    localStorage.setItem("jambarr_cart", JSON.stringify(cart));
    setTimeout(() => {
      setAdding(false);
      router.push("/panier");
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] px-4 py-4">
        <div className="animate-pulse space-y-4">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <p className="text-gray-400">Produit non trouvé</p>
      </div>
    );
  }

  const stars = product.rating || 4;

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      <div className="sticky top-0 z-10 bg-[#FAF7F2] border-b border-[#E5E5EA] px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-[#1A1A1A]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={toggleFavorite} className="text-[#1A1A1A]">
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-[#FF6B00] text-[#FF6B00]" : ""}`} />
        </button>
      </div>

      <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-7xl">📦</span>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xl font-bold text-[#FF6B00]">{product.price?.toLocaleString()} FCFA</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">{product.oldPrice.toLocaleString()} FCFA</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < stars ? "fill-[#FF6B00] text-[#FF6B00]" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span>{product.reviewsCount || 0} avis</span>
          <span>{product.soldCount || 0} vendus</span>
        </div>

        {product.sellerName && (
          <div className="bg-white rounded-xl border border-[#E5E5EA] px-4 py-3">
            <span className="text-sm text-gray-400">Vendeur</span>
            <p className="text-sm font-medium">{product.sellerName}</p>
          </div>
        )}

        {product.description && (
          <div>
            <h3 className="font-semibold text-sm mb-1">Description</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5EA] p-4">
        <button
          onClick={addToCart}
          disabled={adding}
          className="w-full py-3 bg-[#FF6B00] text-white font-semibold rounded-xl hover:bg-[#E55E00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          {adding ? "Ajout..." : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}
