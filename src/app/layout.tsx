import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";

type Props = {
  children: ReactNode;
  params: { locale: string };
};

// This is a minimal root layout that just validates the locale
// The actual layout with providers is in [locale]/layout.tsx
export default function RootLayout({ children, params }: Props) {
  // Validate locale
  if (!locales.includes(params.locale as any)) {
    notFound();
  }

  return children;
}
