import LoginForm from '@/components/LoginForm';

type Props = { params: Promise<{ locale: string }> };

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <LoginForm locale={locale} />
    </div>
  );
}
