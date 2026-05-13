'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Expense } from '@/types';
import { Trash2, Calendar, Tag } from 'lucide-react';

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
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Tag className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{t('noExpenses')}</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Add your first expense to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <ul className="divide-y divide-border">
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-background"
                style={{ backgroundColor: expense.categories?.color ?? '#475569' }}
              />
              <div className="min-w-0">
                <p className="text-foreground text-sm font-medium truncate">
                  {expense.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {expense.categories?.name && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      <Tag className="w-3 h-3" />
                      {expense.categories.name}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(expense.date, locale === 'de' ? 'de-DE' : 'en-US')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
              <span className="text-foreground font-semibold text-sm">
                {formatCurrency(Number(expense.amount))}
              </span>
              <button
                onClick={() => handleDelete(expense.id)}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Delete expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
