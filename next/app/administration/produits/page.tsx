"use client";
import { useState, useEffect } from "react";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { apiFetch } from '@/lib/apiClient';

export default function AdminProduitsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jambarr_admin_token");
    apiFetch("/api/products", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    const token = localStorage.getItem("jambarr_admin_token");
    await apiFetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !current }),
    });
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !current } : p)));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const token = localStorage.getItem("jambarr_admin_token");
    await apiFetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Produits</h1>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl h-16 border border-[#E5E5EA] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5EA] bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Produit</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Prix</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Stock</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Actif</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => (
                  <tr key={product.id} className="border-b border-[#E5E5EA] last:border-0">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-sm">📦</span>
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[150px]">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 text-[#FF6B00] font-medium">
                      {product.price?.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          (product.stock || 0) < 5 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                        }`}
                      >
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(product.id, product.active !== false)}>
                        {product.active !== false ? (
                          <ToggleRight className="w-7 h-7 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
