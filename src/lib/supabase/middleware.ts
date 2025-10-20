import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(
  request: NextRequest,
  response?: NextResponse,
) {
  let supabaseResponse =
    response ||
    NextResponse.next({
      request,
    });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are required",
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({
            request,
          });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /app routes - check for locale-prefixed paths
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute =
    pathname.includes("/app") && !pathname.match(/^\/(en|pt)\/app/);
  const isProtectedLocaleRoute = pathname.match(/^\/(en|pt)\/app/);

  if ((isProtectedRoute || isProtectedLocaleRoute) && !user) {
    const redirectUrl = request.nextUrl.clone();
    const locale = pathname.match(/^\/(en|pt)/)?.[1] || "en";
    redirectUrl.pathname = `/${locale}`;
    redirectUrl.searchParams.set("redirected", "true");
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
