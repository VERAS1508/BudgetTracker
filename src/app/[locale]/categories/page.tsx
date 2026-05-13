import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import CategoryList from '@/components/CategoryList';
import CategoryForm from '@/components/CategoryForm';
import type { Category } from '@/types';
import { Tags } from 'lucide-react';

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Tags className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">
              {typedCategories.length} {typedCategories.length === 1 ? 'category' : 'categories'} created
            </p>
          </div>
        </div>
        <CategoryForm />
      </div>

      {/* Category List */}
      <CategoryList categories={typedCategories} />
    </div>
  );
}
