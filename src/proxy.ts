import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

const handleI18nRouting = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const locale =
    routing.locales.find(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ??
    routing.defaultLocale;

  const isLoginPage = pathname.includes('/login');

  if (!user && !isLoginPage) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach(c => redirectResponse.cookies.set(c.name, c.value));
    return redirectResponse;
  }

  if (user && isLoginPage) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    supabaseResponse.cookies.getAll().forEach(c => redirectResponse.cookies.set(c.name, c.value));
    return redirectResponse;
  }

  const intlResponse = handleI18nRouting(request);
  supabaseResponse.cookies.getAll().forEach(c => intlResponse.cookies.set(c.name, c.value));
  return intlResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
