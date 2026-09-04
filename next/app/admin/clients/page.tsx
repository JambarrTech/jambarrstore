"use client";
import { useState, useEffect } from "react";
import { Users } from "lucide-react";

export default function AdminClientsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jambarr_admin_token");
    fetch("/api/customers", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : data.customers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Clients</h1>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl h-16 border border-[#E5E5EA] animate-pulse" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Users className="w-12 h-12 mb-4" />
          <p>Aucun client</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5EA] bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Téléphone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Ville</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Commandes</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Dépensé</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer: any) => (
                  <tr key={customer.id} className="border-b border-[#E5E5EA] last:border-0">
                    <td className="px-4 py-3 font-medium">{customer.name}</td>
                    <td className="px-4 py-3 text-gray-500">{customer.phone || "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{customer.city || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-600">
                        {customer.ordersCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#FF6B00]">
                      {(customer.totalSpent || 0).toLocaleString()} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
