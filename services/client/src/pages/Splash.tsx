import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react';

const slides = [
  {
    image: '/splash/splash-1.jpg',
    title: 'Bienvenue sur\njambarrstore',
    subtitle: 'Votre marketplace mobile au Sénégal.\nDes milliers de produits à prix.',
  },
  {
    image: '/splash/splash-2.jpg',
    title: 'Des produits\nqui vous plaisent',
    subtitle: 'Électronique, mode, beauté, maison...\nTrouvez tout en un seul endroit.',
  },
  {
    image: '/splash/splash-3.jpg',
    title: 'Paiement flexible\n& sécurisé',
    subtitle: 'Wave, Orange Money ou paiement\nà la livraison. Vous choisissez.',
  },
  {
    image: '/splash/splash-4.jpg',
    title: 'Livraison rapide\nà Dakar',
    subtitle: 'Commandez en quelques clics.\nLivraison en 24h dans toute la capitale.',
  },
];

const ONBOARDING_KEY = 'jambarr_onboarding_done';
const SLIDE_INTERVAL = 4500;

export function Splash() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const seen = localStorage.getItem(ONBOARDING_KEY);

  const goToNext = useCallback(() => {
    setStep((prev) => {
      if (prev < slides.length - 1) return prev + 1;
      return prev;
    });
  }, []);

  const goToPrev = useCallback(() => {
    setStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    if (seen) {
      const timer = setTimeout(() => {
        navigate('/connexion', { replace: true });
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [seen, navigate]);

  useEffect(() => {
    if (seen) return;
    const timer = setInterval(() => {
      setStep((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [seen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipe = 50;
    if (distance > minSwipe) goToNext();
    if (distance < -minSwipe) goToPrev();
  };

  const handleStart = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    navigate('/connexion', { replace: true });
  };

  if (seen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
            <span className="text-4xl">🛍️</span>
          </div>
          <p className="font-display text-3xl font-extrabold text-white tracking-tight">
            jambarr<span className="text-white/70">store</span>
          </p>
          <Loader2Icon className="mt-4 h-6 w-6 animate-spin text-white/70" />
        </div>
      </div>
    );
  }

  const current = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div
      className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0">
        <img
          key={step}
          src={current.image}
          alt=""
          className="h-full w-full object-cover animate-in fade-in duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-8">
        <div key={step} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="font-display text-3xl font-extrabold text-white whitespace-pre-line leading-tight">
            {current.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/80 whitespace-pre-line">
            {current.subtitle}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? 'h-2 w-8 bg-white'
                  : 'h-2 w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          {!isLast ? (
            <>
              <button
                type="button"
                onClick={handleStart}
                className="flex-1 rounded-xl border border-white/30 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Passer
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="flex-1 rounded-xl bg-brand py-3.5 text-sm font-bold text-white hover:bg-brand-dark"
              >
                Suivant
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              className="w-full rounded-xl bg-brand py-4 text-sm font-bold text-white hover:bg-brand-dark"
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
    const timer2 = setTimeout(() => navigate('/dashboard', { replace: true }), 2500);
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
