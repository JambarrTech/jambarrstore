"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  en_attente: "bg-yellow-100 text-yellow-700",
  confirmee: "bg-blue-100 text-blue-700",
  expediee: "bg-purple-100 text-purple-700",
  livree: "bg-green-100 text-green-700",
  annulee: "bg-red-100 text-red-700",
};

export default function CommandesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jambarr_token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="sticky top-0 z-10 bg-[#FAF7F2] border-b border-[#E5E5EA] px-4 py-3 flex items-center gap-3">
        <Link href="/compte" className="text-[#1A1A1A]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">Mes commandes</h1>
      </div>

      <div className="px-4 py-3 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E5EA] p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package className="w-12 h-12 mb-4" />
            <p>Aucune commande</p>
          </div>
        ) : (
          orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-xl border border-[#E5E5EA] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">#{order.id}</span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {new Date(order.createdAt || order.date).toLocaleDateString("fr-FR")}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  {order.itemsCount || order.items?.length || 0} article(s)
                </span>
                <span className="text-sm font-bold text-[#FF6B00]">
                  {(order.total || 0).toLocaleString()} FCFA
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
