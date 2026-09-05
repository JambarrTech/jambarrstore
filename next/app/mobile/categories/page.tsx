"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/backend/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : data.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-6">
      <div className="sticky top-0 z-10 bg-[#FAF7F2] border-b border-[#E5E5EA] px-4 py-3 flex items-center gap-3">
        <Link href="/mobile/" className="text-[#1A1A1A]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">Catégories</h1>
      </div>

      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E5EA] p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto mb-3" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
            </div>
          ))
        ) : (
          categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.id}`}
              className="bg-white rounded-xl border border-[#E5E5EA] p-6 flex flex-col items-center gap-3 hover:shadow-md transition-shadow"
            >
              <span className="text-4xl">{cat.emoji || "📦"}</span>
              <span className="text-sm font-medium text-[#1A1A1A]">{cat.label}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
