import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2Icon, CheckCircle2Icon } from 'lucide-react';

const steps = [
  {
    emoji: '🛍️',
    title: 'Bienvenue sur\njambarrstore',
    description: 'Votre marketplace mobile au Sénégal.\nDécouvrez des milliers de produits à prix.',
  },
  {
    emoji: '🚀',
    title: 'Livraison rapide\nà Dakar',
    description: 'Commandez en quelques clics.\nLivraison en 24h dans toute la capitale.',
  },
  {
    emoji: '💳',
    title: 'Paiement flexible\n& sécurisé',
    description: 'Wave, Orange Money ou paiement\nà la livraison. Vous choisissez.',
  },
];

const ONBOARDING_KEY = 'jambarr_onboarding_done';

export function Splash() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const seen = localStorage.getItem(ONBOARDING_KEY);

  useEffect(() => {
    if (seen) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => navigate('/connexion', { replace: true }), 500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [seen, navigate]);

  if (seen) {
    return (
      <div className={`flex min-h-screen flex-col items-center justify-center bg-brand transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
            <span className="text-4xl">🛍️</span>
          </div>
          <div>
            <p className="font-display text-3xl font-extrabold text-white tracking-tight">
              jambarr<span className="text-white/70">store</span>
            </p>
          </div>
          <Loader2Icon className="mt-4 h-6 w-6 animate-spin text-white/70" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-sand">
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div
          key={step}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="mb-8 flex h-28 w-28 mx-auto items-center justify-center rounded-[2rem] bg-brand/10">
            <span className="text-6xl">{steps[step].emoji}</span>
          </div>

          <h1 className="font-display text-2xl font-extrabold text-ink whitespace-pre-line leading-tight">
            {steps[step].title}
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-ink-muted whitespace-pre-line">
            {steps[step].description}
          </p>
        </div>
      </div>

      <div className="px-6 pb-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-brand' : 'w-2 bg-line'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {step < steps.length - 1 ? (
            <>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(ONBOARDING_KEY, '1');
                  navigate('/connexion', { replace: true });
                }}
                className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-ink-soft hover:bg-white"
              >
                Passer
              </button>
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex-1 rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark"
              >
                Suivant
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(ONBOARDING_KEY, '1');
                navigate('/connexion', { replace: true });
              }}
              className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white hover:bg-brand-dark"
            >
              Commencer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Confirmation() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 2000);
    const timer2 = setTimeout(() => navigate('/', { replace: true }), 2500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [navigate]);

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center bg-sand transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex flex-col items-center gap-4 px-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2Icon className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Bienvenue !
        </h1>
        <p className="text-sm text-ink-muted">
          Votre compte a été créé avec succès.
        </p>
        <Loader2Icon className="mt-2 h-5 w-5 animate-spin text-brand" />
      </div>
    </div>
  );
}
