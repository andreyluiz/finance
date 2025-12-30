import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ locale: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  const { locale } = await context.params;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL;
  const redirectBase = siteUrl?.trim() || new URL(request.url).origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectPath = next.startsWith("/") ? next : `/${next}`;
      const localeRedirect = redirectPath.startsWith(`/${locale}`)
        ? redirectPath
        : `/${locale}${redirectPath}`;
      return NextResponse.redirect(`${redirectBase}${localeRedirect}`);
    }
  }

  return NextResponse.redirect(`${redirectBase}/${locale}`);
}
