'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import LanguageSwitch from './LanguageSwitch';
import { Wallet, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

type Props = { locale: string };

export default function LoginForm({ locale }: Props) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const supabase = createClient();

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(t('registerError'));
      } else if (data.session) {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      } else {
        setSuccess(t('registerSuccess'));
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(t('loginError'));
      } else {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md">
      <div className="absolute top-4 right-4">
        <LanguageSwitch />
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/20">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('email')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-chart-1/10 border border-chart-1/20 rounded-lg px-4 py-3 text-sm text-chart-1">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isRegister ? t('registerButton') : t('loginButton')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccess('');
            }}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {isRegister ? t('switchToLogin') : t('switchToRegister')}
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center mt-6">
        Track your finances with clarity and control
      </p>
    </div>
  );
}
