"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Package, MapPin, HelpCircle, LogOut, ChevronRight, User } from "lucide-react";

export default function ComptePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jambarr_token");
    if (!token) {
      router.push("/connexion");
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setUser(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    localStorage.removeItem("jambarr_token");
    router.push("/connexion");
  };

  const links = [
    { href: "/favoris", icon: Heart, label: "Mes favoris" },
    { href: "/commandes", icon: Package, label: "Mes commandes" },
    { href: "/adresses", icon: MapPin, label: "Mes adresses" },
    { href: "/aide", icon: HelpCircle, label: "Aide & Support" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      <div className="sticky top-0 z-10 bg-[#FAF7F2] border-b border-[#E5E5EA] px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-[#1A1A1A]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">Mon compte</h1>
      </div>

      {loading ? (
        <div className="px-4 py-6 animate-pulse space-y-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto" />
          <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      ) : (
        <>
          <div className="px-4 py-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-[#FF6B00] rounded-full flex items-center justify-center mb-3">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-bold text-lg">{user?.name || "Utilisateur"}</h2>
            <p className="text-sm text-gray-400">{user?.email || ""}</p>
            {user?.phone && <p className="text-sm text-gray-400">{user.phone}</p>}
          </div>

          <div className="px-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white rounded-xl border border-[#E5E5EA] px-4 py-3.5 flex items-center gap-3 hover:shadow-sm transition-shadow"
              >
                <link.icon className="w-5 h-5 text-[#FF6B00]" />
                <span className="flex-1 text-sm font-medium">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
            ))}
          </div>

          <div className="px-4 mt-6">
            <button
              onClick={logout}
              className="w-full bg-white rounded-xl border border-red-200 px-4 py-3.5 flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Se déconnecter</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
