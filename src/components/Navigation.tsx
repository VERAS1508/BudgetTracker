'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import LanguageSwitch from './LanguageSwitch';

type Props = { locale: string };

export default function Navigation({ locale }: Props) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
    router.refresh();
  }

  const links = [
    { href: `/${locale}/dashboard`, label: t('dashboard') },
    { href: `/${locale}/expenses`, label: t('expenses') },
    { href: `/${locale}/categories`, label: t('categories') }
  ];

  return (
    <nav className="border-b" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-bold text-white text-lg">💰 Budget</span>
          <div className="flex gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: pathname === link.href ? '#1e293b' : 'transparent',
                  color: pathname === link.href ? '#fff' : '#94a3b8'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitch />
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: '#94a3b8' }}
          >
            {t('logout')}
          </button>
        </div>
      </div>
    </nav>
  );
}
