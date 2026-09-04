"use client";
import { useState } from "react";
import { ChevronDown, HelpCircle, CreditCard, Truck, RotateCcw, Phone } from "lucide-react";

const FAQ_SECTIONS = [
  {
    icon: HelpCircle,
    title: "Comment commander?",
    content:
      "Parcourez nos catégories, sélectionnez un produit et ajoutez-le au panier. Puis allez dans votre panier, choisissez une adresse de livraison et confirmez votre commande. Vous recevrez une confirmation par SMS.",
  },
  {
    icon: CreditCard,
    title: "Modes de paiement",
    content:
      "Nous acceptons le paiement à la livraison (cash) et Mobile Money (MTN Moov, Wave). Le paiement se fait lors de la réception de votre colis.",
  },
  {
    icon: Truck,
    title: "Livraison",
    content:
      "La livraison est effectuée dans un délai de 24 à 72 heures selon votre localisation. Les frais de livraison varient selon la ville et sont affichés lors de la validation de la commande.",
  },
  {
    icon: RotateCcw,
    title: "Retours",
    content:
      "Vous disposez de 24 heures après réception pour retourner un produit défectueux. Contactez notre service client avec votre numéro de commande pour initier un retour.",
  },
  {
    icon: Phone,
    title: "Contact",
    content:
      "Service client disponible du lundi au samedi de 8h à 18h. Téléphone: +225 07 00 00 00. Email: support@jambarr.com. WhatsApp: +225 07 00 00 00.",
  },
];

export default function AidePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Aide</h1>

      <div className="space-y-3">
        {FAQ_SECTIONS.map((section, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="bg-white rounded-xl border border-[#E5E5EA] overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <section.icon className="w-5 h-5 text-[#FF6B00]" />
                  <span className="font-medium text-sm">{section.title}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
