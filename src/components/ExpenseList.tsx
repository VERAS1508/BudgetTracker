'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Expense } from '@/types';

type Props = { expenses: Expense[]; locale: string };

export default function ExpenseList({ expenses, locale }: Props) {
  const t = useTranslations('expenses');
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    const supabase = createClient();
    await supabase.from('expenses').delete().eq('id', id);
    router.refresh();
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border p-12 text-center"
        style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
        <p style={{ color: '#475569' }}>{t('noExpenses')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
      <ul className="divide-y" style={{ borderColor: '#1e293b' }}>
        {expenses.map(expense => (
          <li key={expense.id} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: expense.categories?.color ?? '#475569' }}
              />
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{expense.description}</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                  {expense.categories?.name && <span>{expense.categories.name} · </span>}
                  {formatDate(expense.date, locale === 'de' ? 'de-DE' : 'en-US')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
              <span className="text-white font-semibold text-sm">
                {formatCurrency(Number(expense.amount))}
              </span>
              <button
                onClick={() => handleDelete(expense.id)}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{ color: '#ef4444', backgroundColor: 'transparent' }}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
