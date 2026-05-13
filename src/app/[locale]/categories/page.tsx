import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import CategoryList from '@/components/CategoryList';
import CategoryForm from '@/components/CategoryForm';
import type { Category } from '@/types';

type Props = { params: Promise<{ locale: string }> };

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('categories');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const typedCategories = (categories || []) as Category[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <CategoryForm />
      </div>

      <CategoryList categories={typedCategories} />
    </div>
  );
}
