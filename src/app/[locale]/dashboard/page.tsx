import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getCurrentMonthRange, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import type { Expense } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  ArrowRight,
  BarChart3,
  PieChart
} from 'lucide-react';

import StatCard from '@/components/StatCard';
import DashboardCard from '@/components/DashboardCard';
import ExpenseBarChart from '@/components/charts/ExpenseBarChart';
import ExpensePieChart from '@/components/charts/ExpensePieChart';

type Props = { params: Promise<{ locale: string }> };

function buildCategoryData(expenses: Expense[], other: string) {
  const map = new Map<string, { name: string; amount: number; color: string }>();
  for (const e of expenses) {
    const key = e.categories?.name ?? other;
    const color = e.categories?.color ?? '#475569';
    const existing = map.get(key);
    if (existing) {
      existing.amount += Number(e.amount);
    } else {
      map.set(key, { name: key, amount: Number(e.amount), color });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

function buildMonthlyData(
  expenses: { amount: number; date: string }[],
  locale: string
) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return {
      name: d.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      amount: 0,
      color: '#4f46e5'
    };
  });

  for (const e of expenses) {
    const d = new Date(e.date + 'T00:00:00');
    const m = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
    if (m) m.amount += Number(e.amount);
  }

  return months.map(({ name, amount, color }) => ({ name, amount, color }));
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('dashboard');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { start, end } = getCurrentMonthRange();

  // Last 6 months start date
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  const sixMonthsStart = sixMonthsAgo.toISOString().split('T')[0];

  const [{ data: expenses }, { data: allExpenses }] = await Promise.all([
    supabase
      .from('expenses')
      .select('*, categories(name, color)')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false }),
    supabase
      .from('expenses')
      .select('amount, date')
      .gte('date', sixMonthsStart)
      .order('date', { ascending: true })
  ]);

  const typedExpenses = (expenses || []) as Expense[];
  const total = typedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Real stats
  const expenseCount = typedExpenses.length;
  const biggest = typedExpenses.reduce((max, e) => Math.max(max, Number(e.amount)), 0);
  const daysInMonth = new Date(
    new Date().getFullYear(), new Date().getMonth() + 1, 0
  ).getDate();
  const avgPerDay = total / daysInMonth;

  const categoryData = buildCategoryData(typedExpenses, t('other'));
  const pieData = categoryData.map(({ name, amount, color }) => ({ name, value: amount, color }));
  const monthlyData = buildMonthlyData(allExpenses || [], locale);

  const monthName = new Date().toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{monthName}</p>
        </div>
        <Link
          href={`/${locale}/expenses`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors w-fit"
        >
          {t('addExpense')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('totalMonth')}
          value={formatCurrency(total)}
          icon={<Wallet className="w-5 h-5" />}
          variant="default"
        />
        <StatCard
          label={t('expenseCount')}
          value={String(expenseCount)}
          icon={<Receipt className="w-5 h-5" />}
          variant="default"
        />
        <StatCard
          label={t('biggestExpense')}
          value={biggest > 0 ? formatCurrency(biggest) : '—'}
          icon={<TrendingDown className="w-5 h-5" />}
          variant={biggest > 500 ? 'danger' : 'warning'}
        />
        <StatCard
          label={t('avgPerDay')}
          value={total > 0 ? formatCurrency(avgPerDay) : '—'}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard
          title={t('expensesByCategory')}
          description={t('currentMonthBreakdown')}
          icon={<BarChart3 className="w-5 h-5 text-primary" />}
        >
          {categoryData.length > 0 ? (
            <ExpenseBarChart data={categoryData} />
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              {t('noData')}
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          title={t('spendingDistribution')}
          description={t('categoryPercentages')}
          icon={<PieChart className="w-5 h-5 text-primary" />}
        >
          {pieData.length > 0 ? (
            <ExpensePieChart data={pieData} />
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              {t('noData')}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Monthly Trend */}
      <DashboardCard
        title={t('monthlyTrend')}
        description={t('last6Months')}
        icon={<TrendingUp className="w-5 h-5 text-primary" />}
      >
        <ExpenseBarChart data={monthlyData} />
      </DashboardCard>

      {/* Recent Expenses */}
      <DashboardCard
        title={t('recentExpenses')}
        description={t('latestTransactions')}
        action={
          <Link
            href={`/${locale}/expenses`}
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            {t('viewAll')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {typedExpenses.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            {t('noExpenses')}
          </p>
        ) : (
          <div className="space-y-1">
            {typedExpenses.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: expense.categories?.color ?? '#475569' }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{expense.description}</p>
                    {expense.categories?.name && (
                      <p className="text-xs text-muted-foreground">{expense.categories.name}</p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(Number(expense.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
