import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, Loader2Icon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useAuth } from '@jambarrtech/shared';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ name, email, password, phone: phone || undefined });
      navigate('/confirmation', { replace: true });
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-sand">
      <header className="flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <Link to="/connexion" className="rounded-lg p-1.5 text-ink-muted hover:bg-sand">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">Inscription</h1>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-line/70">
            <div className="mb-6 text-center">
              <p className="font-display text-2xl font-extrabold text-ink">
                jambarr<span className="text-brand">store</span>
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Créez votre compte client
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="text-xs font-semibold text-ink-soft">
                  Nom complet
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aminata Diallo"
                  className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-xs font-semibold text-ink-soft">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div>
                <label htmlFor="phone" className="text-xs font-semibold text-ink-soft">
                  Téléphone <span className="text-ink-muted">(optionnel)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-xs font-semibold text-ink-soft">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-xl border border-line bg-sand px-3 py-2.5 pr-10 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 mt-0.5 text-ink-muted hover:text-ink"
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-ink-muted">6 caractères minimum</p>
              </div>

              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-ink-muted">
              Déjà un compte ?{' '}
              <Link to="/connexion" className="font-semibold text-brand hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
