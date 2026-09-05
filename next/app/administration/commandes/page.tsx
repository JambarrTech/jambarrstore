"use client";
import { useState, useEffect } from "react";

const STATUSES = ["en_attente", "confirmee", "expediee", "livree", "annulee"];
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

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("jambarr_admin_token");
    fetch("/backend/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem("jambarr_admin_token");
    await fetch(`/backend/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Commandes</h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            filter === "all" ? "bg-[#FF6B00] text-white" : "bg-white border border-[#E5E5EA]"
          }`}
        >
          Toutes
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              filter === s ? "bg-[#FF6B00] text-white" : "bg-white border border-[#E5E5EA]"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-20 border border-[#E5E5EA] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order: any) => (
            <div key={order.id} className="bg-white rounded-xl border border-[#E5E5EA] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">#{order.id}</span>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[order.status] || ""}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400">
                {new Date(order.createdAt || order.date).toLocaleDateString("fr-FR")}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-500">{order.customerName || "Client"}</span>
                <span className="text-sm font-bold text-[#FF6B00]">{(order.total || 0).toLocaleString()} FCFA</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
