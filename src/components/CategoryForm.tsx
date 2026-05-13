'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

const PRESET_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4',
  '#f97316', '#84cc16'
];

export default function CategoryForm() {
  const t = useTranslations('categories');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('categories').insert({
      user_id: user.id,
      name: name.trim(),
      color
    });

    if (error) {
      setError(error.message);
    } else {
      setOpen(false);
      setName('');
      setColor(PRESET_COLORS[0]);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
        style={{ backgroundColor: '#4f46e5' }}
      >
        + {t('addCategory')}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4"
            style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
            <h2 className="text-lg font-semibold text-white">{t('addCategory')}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                  style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  placeholder="z.B. Essen & Trinken"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>
                  {t('color')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded-full transition-transform"
                      style={{
                        backgroundColor: c,
                        transform: color === c ? 'scale(1.25)' : 'scale(1)',
                        outline: color === c ? `2px solid ${c}` : 'none',
                        outlineOffset: '2px'
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                    style={{ backgroundColor: 'transparent', border: 'none' }}
                  />
                  <span className="text-xs" style={{ color: '#64748b' }}>{color}</span>
                </div>
              </div>

              {error && (
                <p className="text-xs" style={{ color: '#fca5a5' }}>{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg font-medium text-white text-sm"
                  style={{ backgroundColor: '#4f46e5', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? '...' : t('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 rounded-lg font-medium text-sm"
                  style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
