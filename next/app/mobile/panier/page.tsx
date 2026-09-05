"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2, MapPin } from "lucide-react";
import { apiFetch } from '@/lib/apiClient';

const CITIES = ["Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack", "Mbour", "Touba", "Rufisque"];
const PAYMENT_METHODS = ["Wave", "Orange Money", "Paiement à la livraison"];

export default function PanierPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [city, setCity] = useState("Dakar");
  const [payment, setPayment] = useState("Wave");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("jambarr_token");
    if (!token) {
      router.push("/mobile/connexion");
      return;
    }
    const items = JSON.parse(localStorage.getItem("jambarr_cart") || "[]");
    setCart(items);

    const fetchProducts = items.length > 0
      ? fetch(`/api/products?ids=${items.map((i: any) => i.productId).join(",")}`)
          .then((r) => r.json())
          .then((data) => {
            const arr = Array.isArray(data) ? data : data.products || [];
            const map: Record<string, any> = {};
            arr.forEach((p: any) => { map[p.id] = p; });
            setProducts(map);
          })
          .catch(() => {})
      : Promise.resolve();

    apiFetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setUser(data))
      .catch(() => {});

    Promise.all([fetchProducts]).finally(() => setLoading(false));
  }, [router]);

  const updateQuantity = (productId: string, delta: number) => {
    const next = cart.map((item: any) => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCart(next);
    localStorage.setItem("jambarr_cart", JSON.stringify(next));
  };

  const removeItem = (productId: string) => {
    const next = cart.filter((item: any) => item.productId !== productId);
    setCart(next);
    localStorage.setItem("jambarr_cart", JSON.stringify(next));
  };

  const total = cart.reduce((sum: number, item: any) => {
    const p = products[item.productId];
    return sum + (p?.price || 0) * item.quantity;
  }, 0);

  const handleOrder = async () => {
    setSubmitting(true);
    try {
      const paymentMap: Record<string, string> = {
        "Wave": "wave",
        "Orange Money": "orange",
        "Paiement à la livraison": "cash",
      };
      const res = await apiFetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jambarr_token")}`,
        },
        body: JSON.stringify({
          customerName: user?.name || "",
          phone: user?.phone || "",
          city,
          payment: paymentMap[payment] || "cash",
          items: cart.map((c: any) => ({ productId: c.productId, quantity: c.quantity })),
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la commande");
      localStorage.removeItem("jambarr_cart");
      router.push("/mobile/commandes");
    } catch {
      alert("Erreur lors de la commande");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] px-4 py-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-24 border border-[#E5E5EA]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-40">
      <div className="sticky top-0 z-10 bg-[#FAF7F2] border-b border-[#E5E5EA] px-4 py-3 flex items-center gap-3">
        <Link href="/mobile/" className="text-[#1A1A1A]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">Panier</h1>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-5xl mb-4">🛒</span>
          <p>Votre panier est vide</p>
          <Link href="/mobile/" className="mt-4 text-[#FF6B00] font-medium text-sm">Voir les produits</Link>
        </div>
      ) : (
        <>
          <div className="px-4 py-3 space-y-3">
            {cart.map((item: any) => {
              const p = products[item.productId];
              if (!p) return null;
              return (
                <div key={item.productId} className="bg-white rounded-xl border border-[#E5E5EA] p-3 flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{p.name}</h3>
                    <p className="text-[#FF6B00] font-bold text-sm">{p.price?.toLocaleString()} FCFA</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-3 space-y-3">
            <div className="bg-white rounded-xl border border-[#E5E5EA] p-4">
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#FF6B00]" /> Ville de livraison
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E5EA] text-sm focus:outline-none focus:border-[#FF6B00]"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E5EA] p-4">
              <label className="text-sm font-medium mb-2 block">Mode de paiement</label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value={m}
                      checked={payment === m}
                      onChange={(e) => setPayment(e.target.value)}
                      className="w-4 h-4 text-[#FF6B00] accent-[#FF6B00]"
                    />
                    <span className="text-sm">{m}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5EA] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Total</span>
            <span className="text-lg font-bold text-[#FF6B00]">{total.toLocaleString()} FCFA</span>
          </div>
          <button
            onClick={handleOrder}
            disabled={submitting}
            className="w-full py-3 bg-[#FF6B00] text-white font-semibold rounded-xl hover:bg-[#E55E00] transition-colors disabled:opacity-50"
          >
            {submitting ? "Commande en cours..." : "Passer la commande"}
          </button>
        </div>
      )}
    </div>
  );
}
