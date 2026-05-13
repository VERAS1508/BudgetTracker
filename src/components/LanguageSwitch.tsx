'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    // Replace the current locale prefix with the new one
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  }

  return (
    <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: '#1e293b' }}>
      {(['de', 'en'] as const).map(l => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className="px-3 py-1 rounded-md text-sm font-medium transition-colors"
          style={{
            backgroundColor: locale === l ? '#4f46e5' : 'transparent',
            color: locale === l ? '#fff' : '#94a3b8'
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
