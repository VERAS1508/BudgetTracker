import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getCurrentMonthRange, formatCurrency } from '@/lib/utils';
import MonthlyChart from '@/components/MonthlyChart';
import Link from 'next/link';
import type { Expense } from '@/types';

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('dashboard');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { start, end } = getCurrentMonthRange();

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, categories(name, color)')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false });

  const typedExpenses = (expenses || []) as Expense[];
  const total = typedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const monthName = new Date().toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t('title')}</h1>

      {/* Total card */}
      <div className="rounded-xl border p-6" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
        <p className="text-sm" style={{ color: '#94a3b8' }}>{t('totalMonth')} — {monthName}</p>
        <p className="text-4xl font-bold text-white mt-2">{formatCurrency(total)}</p>
      </div>

      {/* Chart */}
      <div className="rounded-xl border p-6" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
        <h2 className="text-lg font-semibold text-white mb-4">{t('monthlyChart')}</h2>
        {typedExpenses.length > 0 ? (
          <MonthlyChart expenses={typedExpenses} />
        ) : (
          <p style={{ color: '#94a3b8' }}>{t('noExpenses')}</p>
        )}
      </div>

      {/* Recent expenses */}
      <div className="rounded-xl border p-6" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{t('recentExpenses')}</h2>
          <Link
            href={`/${locale}/expenses`}
            className="text-sm transition-colors"
            style={{ color: '#818cf8' }}
          >
            {t('viewAll')} →
          </Link>
        </div>
        {typedExpenses.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>{t('noExpenses')}</p>
        ) : (
          <ul className="space-y-3">
            {typedExpenses.slice(0, 5).map(expense => (
              <li key={expense.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expense.categories?.color && (
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: expense.categories.color }}
                    />
                  )}
                  <div>
                    <span className="text-white text-sm">{expense.description}</span>
                    {expense.categories?.name && (
                      <span className="text-xs ml-2" style={{ color: '#64748b' }}>
                        {expense.categories.name}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-white font-medium text-sm">
                  {formatCurrency(Number(expense.amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
