"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, DollarSign, Users, Package } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jambarr_admin_token");
    Promise.all([
      fetch("/api/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/dashboard/sales", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([s, sl]) => {
        setStats(s);
        setSales(Array.isArray(sl) ? sl : sl.sales || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Commandes", value: stats.orders || 0, icon: ShoppingCart, color: "bg-blue-500" },
    { label: "Revenus", value: `${(stats.revenue || 0).toLocaleString()} FCFA`, icon: DollarSign, color: "bg-green-500" },
    { label: "Clients", value: stats.customers || 0, icon: Users, color: "bg-purple-500" },
    { label: "Produits", value: stats.products || 0, icon: Package, color: "bg-[#FF6B00]" },
  ];

  const maxSales = Math.max(...sales.map((s: any) => s.value || 0), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-[#E5E5EA] p-4">
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-400">{card.label}</p>
            <p className="text-lg font-bold mt-0.5">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5EA] p-4">
        <h2 className="font-semibold mb-4">Ventes des 7 derniers jours</h2>
        <div className="flex items-end gap-2 h-40">
          {loading ? (
            [...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 bg-gray-200 rounded-t animate-pulse" style={{ height: "100%" }} />
            ))
          ) : (
            sales.map((s: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[#FF6B00] rounded-t transition-all"
                  style={{ height: `${((s.value || 0) / maxSales) * 100}%`, minHeight: "4px" }}
                />
                <span className="text-[10px] text-gray-400">{s.label || ""}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {stats.lowStock && stats.lowStock.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E5EA] p-4">
          <h2 className="font-semibold mb-3 text-red-500">Stock faible</h2>
          <div className="space-y-2">
            {stats.lowStock.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#E5E5EA] last:border-0">
                <span className="text-sm">{item.name}</span>
                <span className="text-sm text-red-500 font-medium">{item.stock} restant(s)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
