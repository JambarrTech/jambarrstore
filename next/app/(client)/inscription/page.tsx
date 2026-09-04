"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, UserPlus } from "lucide-react";

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription");
      localStorage.setItem("jambarr_token", data.token);
      router.push("/confirmation");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FF6B00] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">J</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Inscription</h1>
          <p className="text-gray-400 mt-1">Créez votre compte</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#1A1A1A] mb-1 block">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Votre nom"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E5E5EA] text-sm focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#1A1A1A] mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="votre@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E5E5EA] text-sm focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#1A1A1A] mb-1 block">Téléphone <span className="text-gray-400">(optionnel)</span></label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+221 77 000 00 00"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E5E5EA] text-sm focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#1A1A1A] mb-1 block">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E5E5EA] text-sm focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF6B00] text-white font-semibold rounded-xl hover:bg-[#E55E00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-[#FF6B00] font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
