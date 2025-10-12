import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { H2 } from "@/components/ui/typography";

interface HeaderProps {
  showBackButton?: boolean;
}

export function Header({ showBackButton = false }: HeaderProps) {
  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/">← Home</Link>
            </Button>
          )}
          <H2 className="border-b-0 pb-0">Finance Tracker</H2>
        </div>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
