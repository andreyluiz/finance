import { redirect } from "next/navigation";

// Root layout that redirects to default locale
// This satisfies Next.js requirement for a root layout
export default function RootLayout() {
  redirect("/en");
}
