import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { defaultLocale } from "@/i18n/config";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  // Get locale from cookie or use default
  const cookieLocale = request.headers.get("cookie")?.match(/NEXT_LOCALE=([^;]+)/)?.[1];
  const locale = cookieLocale || defaultLocale;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure the redirect URL includes the locale
      const redirectPath = next.startsWith("/") ? next : `/${next}`;
      const localeRedirect = redirectPath.startsWith(`/${locale}`)
        ? redirectPath
        : `/${locale}${redirectPath}`;
      return NextResponse.redirect(`${origin}${localeRedirect}`);
    }
  }

  // Return the user to the home page with locale
  return NextResponse.redirect(`${origin}/${locale}`);
}
