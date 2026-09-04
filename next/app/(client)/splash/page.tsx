"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { emoji: "🛍️", title: "Bienvenue sur Jambarr Store", desc: "Découvrez des milliers de produits de qualité à portée de main." },
  { emoji: "🚀", title: "Livraison rapide", desc: "Recevez vos commandes partout au Sénégal en un temps record." },
  { emoji: "💳", title: "Paiement facile", desc: "Payez avec Wave, Orange Money ou à la livraison." },
];

export default function SplashPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("jambarr_onboarding_done")) {
      router.replace("/connexion");
    }
  }, [router]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem("jambarr_onboarding_done", "1");
      router.push("/connexion");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("jambarr_onboarding_done", "1");
    router.push("/connexion");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <span className="text-7xl mb-6">{STEPS[step].emoji}</span>
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">{STEPS[step].title}</h1>
        <p className="text-gray-400 text-sm leading-relaxed">{STEPS[step].desc}</p>

        <div className="flex gap-2 mt-8 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === step ? "bg-[#FF6B00]" : "bg-[#E5E5EA]"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 border border-[#E5E5EA] text-gray-400 font-medium rounded-xl hover:bg-white transition-colors"
          >
            Passer
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-[#FF6B00] text-white font-semibold rounded-xl hover:bg-[#E55E00] transition-colors"
          >
            {step === STEPS.length - 1 ? "Commencer" : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
}
