"use client";
import { useState, useEffect } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";

interface Address {
  id: string;
  name: string;
  phone: string;
  city: string;
  detail: string;
}

export default function AdressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", city: "", detail: "" });

  useEffect(() => {
    const stored = localStorage.getItem("jambarr_addresses");
    if (stored) setAddresses(JSON.parse(stored));
  }, []);

  const save = (list: Address[]) => {
    setAddresses(list);
    localStorage.setItem("jambarr_addresses", JSON.stringify(list));
  };

  const addAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.city || !form.detail) return;
    const newAddr: Address = { id: Date.now().toString(), ...form };
    save([...addresses, newAddr]);
    setForm({ name: "", phone: "", city: "", detail: "" });
    setShowForm(false);
  };

  const removeAddress = (id: string) => {
    save(addresses.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Mes adresses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-sm text-[#FF6B00] font-medium"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={addAddress} className="bg-white rounded-xl border border-[#E5E5EA] p-4 space-y-3 mb-4">
          <input
            type="text"
            placeholder="Nom complet"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-[#E5E5EA] text-sm focus:outline-none focus:border-[#FF6B00]"
          />
          <input
            type="tel"
            placeholder="Téléphone"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-[#E5E5EA] text-sm focus:outline-none focus:border-[#FF6B00]"
          />
          <input
            type="text"
            placeholder="Ville"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-[#E5E5EA] text-sm focus:outline-none focus:border-[#FF6B00]"
          />
          <textarea
            placeholder="Détail adresse (quartier, rue, repère...)"
            required
            rows={2}
            value={form.detail}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-[#E5E5EA] text-sm focus:outline-none focus:border-[#FF6B00] resize-none"
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-[#FF6B00] text-white font-semibold rounded-lg text-sm"
          >
            Enregistrer
          </button>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <MapPin className="w-12 h-12 mb-4" />
          <p>Aucune adresse enregistrée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-xl border border-[#E5E5EA] p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#FF6B00]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="font-medium text-sm">{addr.name}</p>
                  <p className="text-xs text-gray-400">{addr.phone}</p>
                  <p className="text-xs text-gray-500 mt-1">{addr.city} - {addr.detail}</p>
                </div>
              </div>
              <button onClick={() => removeAddress(addr.id)} className="text-gray-300 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
