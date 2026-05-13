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
  PiggyBank,
  ArrowRight,
  BarChart3,
  PieChart
} from 'lucide-react';

import StatCard from '@/components/StatCard';
import DashboardCard from '@/components/DashboardCard';
import ExpenseBarChart from '@/components/charts/ExpenseBarChart';
import ExpensePieChart from '@/components/charts/ExpensePieChart';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';

type Props = { params: Promise<{ locale: string }> };

// Sample data for testing the visualizations
const SAMPLE_CATEGORY_DATA = [
  { name: 'Housing', amount: 1200, color: '#10b981' },
  { name: 'Food', amount: 450, color: '#3b82f6' },
  { name: 'Transport', amount: 280, color: '#f59e0b' },
  { name: 'Utilities', amount: 180, color: '#ec4899' },
  { name: 'Entertainment', amount: 150, color: '#8b5cf6' },
  { name: 'Shopping', amount: 320, color: '#06b6d4' }
];

const SAMPLE_PIE_DATA = SAMPLE_CATEGORY_DATA.map((item) => ({
  name: item.name,
  value: item.amount,
  color: item.color
}));

const SAMPLE_MONTHLY_DATA = [
  { name: 'Jan', income: 4500, expenses: 3200 },
  { name: 'Feb', income: 4800, expenses: 3100 },
  { name: 'Mar', income: 4200, expenses: 3400 },
  { name: 'Apr', income: 5100, expenses: 3000 },
  { name: 'May', income: 4700, expenses: 3300 },
  { name: 'Jun', income: 4900, expenses: 2900 }
];

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
  const hasRealData = typedExpenses.length > 0;

  // Build chart data from real expenses
  const realCategoryData = buildCategoryData(typedExpenses);

  const monthName = new Date().toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Use real data if available, otherwise show sample data
  const barChartData = hasRealData ? realCategoryData : SAMPLE_CATEGORY_DATA;
  const pieChartData = hasRealData
    ? realCategoryData.map((item) => ({ name: item.name, value: item.amount, color: item.color }))
    : SAMPLE_PIE_DATA;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1">{monthName}</p>
        </div>
        <Link
          href={`/${locale}/expenses`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors w-fit"
        >
          Add Expense
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('totalMonth')}
          value={formatCurrency(hasRealData ? total : 2580)}
          icon={<Wallet className="w-5 h-5" />}
          trend={{ value: '12%', isPositive: false }}
          variant="default"
        />
        <StatCard
          label="Income"
          value={formatCurrency(hasRealData ? 4500 : 4900)}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: '8%', isPositive: true }}
          variant="success"
        />
        <StatCard
          label="Savings"
          value={formatCurrency(hasRealData ? 4500 - total : 2320)}
          icon={<PiggyBank className="w-5 h-5" />}
          trend={{ value: '15%', isPositive: true }}
          variant="success"
        />
        <StatCard
          label="Budget Used"
          value={`${hasRealData ? Math.round((total / 3000) * 100) : 86}%`}
          icon={<TrendingDown className="w-5 h-5" />}
          variant={hasRealData && (total / 3000) > 0.9 ? 'danger' : 'warning'}
        />
      </div>

      {/* Sample Data Notice */}
      {!hasRealData && (
        <div className="bg-chart-3/10 border border-chart-3/20 rounded-lg px-4 py-3 text-sm text-chart-3">
          Showing sample data for visualization preview. Add expenses to see your real data.
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Bar Chart */}
        <DashboardCard
          title="Expenses by Category"
          description="Current month breakdown"
          icon={<BarChart3 className="w-5 h-5 text-primary" />}
        >
          <ExpenseBarChart data={barChartData} formatValue={formatCurrency} />
        </DashboardCard>

        {/* Expense Pie Chart */}
        <DashboardCard
          title="Spending Distribution"
          description="Category percentages"
          icon={<PieChart className="w-5 h-5 text-primary" />}
        >
          <ExpensePieChart data={pieChartData} formatValue={formatCurrency} />
        </DashboardCard>
      </div>

      {/* Income vs Expenses Trend */}
      <DashboardCard
        title="Income vs Expenses"
        description="6 month trend overview"
        icon={<TrendingUp className="w-5 h-5 text-primary" />}
        action={
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-chart-1" />
              <span className="text-muted-foreground">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Expenses</span>
            </div>
          </div>
        }
      >
        <IncomeExpenseChart data={SAMPLE_MONTHLY_DATA} formatValue={formatCurrency} />
      </DashboardCard>

      {/* Recent Expenses */}
      <DashboardCard
        title={t('recentExpenses')}
        description="Latest transactions this month"
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
        {!hasRealData ? (
          <div className="space-y-3">
            {SAMPLE_RECENT_EXPENSES.map((expense, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: expense.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {expense.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {expense.category}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : typedExpenses.length === 0 ? (
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
                  {expense.categories?.color && (
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: expense.categories.color }}
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {expense.description}
                    </p>
                    {expense.categories?.name && (
                      <p className="text-xs text-muted-foreground">
                        {expense.categories.name}
                      </p>
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

// Sample recent expenses for preview
const SAMPLE_RECENT_EXPENSES = [
  { description: 'Grocery Store', category: 'Food', amount: 85.50, color: '#3b82f6' },
  { description: 'Electric Bill', category: 'Utilities', amount: 120.00, color: '#ec4899' },
  { description: 'Gas Station', category: 'Transport', amount: 45.00, color: '#f59e0b' },
  { description: 'Netflix Subscription', category: 'Entertainment', amount: 15.99, color: '#8b5cf6' },
  { description: 'Coffee Shop', category: 'Food', amount: 12.50, color: '#3b82f6' }
];

function buildCategoryData(expenses: Expense[]) {
  const map = new Map<string, { name: string; amount: number; color: string }>();

  for (const e of expenses) {
    const key = e.categories?.name ?? 'Other';
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
