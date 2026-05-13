'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import LanguageSwitch from './LanguageSwitch';

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
        // Email confirmation disabled — session exists, redirect directly
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
    <div className="w-full max-w-sm">
      <div className="absolute top-4 right-4">
        <LanguageSwitch />
      </div>

      <div className="rounded-2xl border p-8 space-y-6" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
        <div className="text-center">
          <div className="text-4xl mb-2">💰</div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>
              {t('email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none transition-colors"
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>
              {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#450a0a', color: '#fca5a5' }}>
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#052e16', color: '#86efac' }}>
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-medium text-white transition-opacity text-sm"
            style={{ backgroundColor: '#4f46e5', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '...' : isRegister ? t('registerButton') : t('loginButton')}
          </button>
        </form>

        <button
          onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
          className="w-full text-sm text-center transition-colors"
          style={{ color: '#818cf8' }}
        >
          {isRegister ? t('switchToLogin') : t('switchToRegister')}
        </button>
      </div>
    </div>
  );
}
