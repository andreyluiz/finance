import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

// This is a minimal root layout
// The actual layout with providers is in [locale]/layout.tsx
export default function RootLayout({ children }: Props) {
  return children;
}
