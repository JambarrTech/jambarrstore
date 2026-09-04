"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function ConfirmationPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/"), 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Bienvenue!</h1>
        <p className="text-gray-400 text-center">Redirection vers l&apos;accueil...</p>
      </div>
    </div>
  );
}
