'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { todayISO } from '@/lib/utils';
import type { Category } from '@/types';

type Props = { categories: Category[] };

export default function ExpenseForm({ categories }: Props) {
  const t = useTranslations('expenses');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      description: description.trim(),
      category_id: categoryId || null,
      date
    });

    if (error) {
      setError(error.message);
    } else {
      setOpen(false);
      setAmount('');
      setDescription('');
      setCategoryId('');
      setDate(todayISO());
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity"
        style={{ backgroundColor: '#4f46e5' }}
      >
        + {t('addExpense')}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl border p-6 space-y-4"
            style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
            <h2 className="text-lg font-semibold text-white">{t('addExpense')}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                    {t('amount')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                    style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                    {t('date')}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                    style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                  {t('description')}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                  style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  placeholder="z.B. Supermarkt"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                  {t('category')}
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                  style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                >
                  <option value="">{t('noCategory')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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
