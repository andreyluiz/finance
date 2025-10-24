import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ locale: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  // Get locale from URL params
  const { locale } = await context.params;

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
