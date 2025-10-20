// The root layout is required by Next.js
// With [locale] routing, we export the LocaleLayout as the root
import type { ReactNode } from "react";
import LocaleLayout from "./[locale]/layout";

type RootLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale?: string }>;
};

export default async function RootLayout(props: RootLayoutProps) {
  const params = await props.params;
  const locale = params.locale || "en";

  return LocaleLayout({
    children: props.children,
    params: Promise.resolve({ locale }),
  });
}
