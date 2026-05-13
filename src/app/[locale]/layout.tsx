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
        <div className="min-h-screen bg-background">
          <Navigation locale={locale} />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          {children}
        </div>
      )}
    </NextIntlClientProvider>
  );
}
