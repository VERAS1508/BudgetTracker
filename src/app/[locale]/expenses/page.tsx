import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ExpenseList from '@/components/ExpenseList';
import ExpenseForm from '@/components/ExpenseForm';
import type { Expense, Category } from '@/types';
import { Receipt, Wallet } from 'lucide-react';

type Props = { params: Promise<{ locale: string }> };

export default async function ExpensesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('expenses');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const [{ data: expenses }, { data: categories }] = await Promise.all([
    supabase
      .from('expenses')
      .select('*, categories(name, color)')
      .order('date', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .order('name')
  ]);

  const typedExpenses = (expenses || []) as Expense[];
  const typedCategories = (categories || []) as Category[];
  const total = typedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">
              {typedExpenses.length} {typedExpenses.length === 1 ? 'expense' : 'expenses'} total
            </p>
          </div>
        </div>
        <ExpenseForm categories={typedCategories} />
      </div>

      {/* Total Card */}
      {typedExpenses.length > 0 && (
        <div className="bg-card border border-border rounded-xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-chart-1" />
            </div>
            <span className="text-muted-foreground text-sm">{t('total')}</span>
          </div>
          <span className="text-foreground font-bold text-xl">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(total)}
          </span>
        </div>
      )}

      {/* Expense List */}
      <ExpenseList expenses={typedExpenses} locale={locale} />
    </div>
  );
}
