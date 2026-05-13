'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/types';

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
      <div className="rounded-xl border p-12 text-center"
        style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
        <p style={{ color: '#475569' }}>{t('noCategories')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {categories.map(cat => (
        <div
          key={cat.id}
          className="flex items-center justify-between rounded-xl border px-5 py-4"
          style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-white font-medium">{cat.name}</span>
          </div>
          <button
            onClick={() => handleDelete(cat.id)}
            className="text-sm px-2 py-1 rounded"
            style={{ color: '#ef4444' }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
