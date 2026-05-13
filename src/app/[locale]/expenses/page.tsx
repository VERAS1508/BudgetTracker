import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ExpenseList from '@/components/ExpenseList';
import ExpenseForm from '@/components/ExpenseForm';
import type { Expense, Category } from '@/types';

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <ExpenseForm categories={typedCategories} />
      </div>

      {typedExpenses.length > 0 && (
        <div className="rounded-xl border px-6 py-4 flex justify-between items-center"
          style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
          <span style={{ color: '#94a3b8' }}>{t('total')}</span>
          <span className="text-white font-bold text-lg">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(total)}
          </span>
        </div>
      )}

      <ExpenseList expenses={typedExpenses} locale={locale} />
    </div>
  );
}
