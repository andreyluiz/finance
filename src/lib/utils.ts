import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the base URL for auth redirects.
 * Uses NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_SUPABASE_REDIRECT_URL if set (for local development),
 * otherwise falls back to window.location.origin (for production).
 */
export function getRedirectUrlBase(): string {
  if (typeof window === "undefined") {
    throw new Error("getRedirectUrlBase must be called from client-side code");
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL;

  if (siteUrl && siteUrl.trim()) {
    return siteUrl.trim().replace(/\/$/, "");
  }

  const origin = window.location.origin;

  if (
    process.env.NODE_ENV === "development" &&
    (origin.includes("localhost") || origin.includes("127.0.0.1"))
  ) {
    console.warn(
      "NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_SUPABASE_REDIRECT_URL not set. Using window.location.origin:",
      origin,
      "\nFor local development, set NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_SUPABASE_REDIRECT_URL in .env.local",
    );
  }

  return origin;
}
