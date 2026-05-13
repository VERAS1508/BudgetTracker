'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/types';
import { Trash2, Folder } from 'lucide-react';

type Props = { categories: Category[] };

export default function CategoryList({ categories }: Props) {
  const t = useTranslations('categories');
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    const supabase = createClient();
    await supabase.from('categories').delete().eq('id', id);
    router.refresh();
  }

  if (categories.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Folder className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{t('noCategories')}</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Create categories to organize your expenses
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              </div>
              <div>
                <span className="text-foreground font-medium">{cat.name}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cat.color}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(cat.id)}
              className="p-2 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
              aria-label={`Delete ${cat.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
