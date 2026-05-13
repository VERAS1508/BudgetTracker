'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Loader2, Type, Palette, Check } from 'lucide-react';

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ec4899',
  '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16',
  '#f97316', '#6366f1'
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
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        {t('addCategory')}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('addCategory')}</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('name')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
                    placeholder="e.g. Food & Drinks"
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  {t('color')}
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="relative w-10 h-10 rounded-lg transition-all hover:scale-105"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Color */}
                <div className="flex items-center gap-3 mt-4 p-3 bg-muted rounded-lg">
                  <div
                    className="w-8 h-8 rounded-lg flex-shrink-0 border border-border"
                    style={{ backgroundColor: color }}
                  />
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs text-muted-foreground font-mono">{color}</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('save')
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 bg-muted text-muted-foreground rounded-lg font-medium text-sm hover:bg-secondary hover:text-foreground transition-colors"
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
