import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <NextIntlClientProvider messages={messages}>
      {user ? (
        <div className="min-h-screen" style={{ backgroundColor: '#020617' }}>
          <Navigation locale={locale} />
          <main className="max-w-5xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      ) : (
        <div className="min-h-screen" style={{ backgroundColor: '#020617' }}>
          {children}
        </div>
      )}
    </NextIntlClientProvider>
  );
}
