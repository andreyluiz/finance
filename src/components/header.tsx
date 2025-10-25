"use client";

import { LogOut, Menu, Plus, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SettingsModal } from "@/components/settings/settings-modal";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { H2 } from "@/components/ui/typography";
import { useAuth } from "@/contexts/auth-context";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTransactionStore } from "@/stores/transaction-store";

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setShowTransactionModal } = useTransactionStore();
  const t = useTranslations("header");

  const isTransactionsPage = pathname === "/app/transactions";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name;
    }
    return user?.email?.split("@")[0] || "User";
  };

  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <H2 className="border-b-0 pb-0">{t("financeTracker")}</H2>
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              <Button
                asChild
                variant={pathname === "/" ? "secondary" : "ghost"}
                size="sm"
              >
                <Link href="/">{t("home")}</Link>
              </Button>
              <Button
                asChild
                variant={pathname === "/app" ? "secondary" : "ghost"}
                size="sm"
              >
                <Link href="/app">{t("dashboard")}</Link>
              </Button>
              <Button
                asChild
                variant={
                  pathname === "/app/transactions" ? "secondary" : "ghost"
                }
                size="sm"
              >
                <Link href="/app/transactions">{t("transactions")}</Link>
              </Button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user && isTransactionsPage && (
            <>
              <Button
                onClick={() => setShowTransactionModal(true)}
                size="sm"
                className="hidden md:flex gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("addTransaction")}
              </Button>
              <Button
                onClick={() => setShowTransactionModal(true)}
                size="icon"
                className="md:hidden h-9 w-9"
                aria-label={t("addTransaction")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}
          <ThemeSwitcher />
          {user && (
            <>
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Desktop User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {getInitials(user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 border-border"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setSettingsOpen(true)}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t("settings")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("signOut")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      {user && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>{t("menu")}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {getInitials(user.email || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{getDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-2">
                <Button
                  asChild
                  variant={pathname === "/" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/">{t("home")}</Link>
                </Button>
                <Button
                  asChild
                  variant={pathname === "/app" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/app">{t("dashboard")}</Link>
                </Button>
                <Button
                  asChild
                  variant={
                    pathname === "/app/transactions" ? "secondary" : "ghost"
                  }
                  className="justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/app/transactions">{t("transactions")}</Link>
                </Button>
              </nav>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    setSettingsOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t("settings")}
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-destructive hover:text-destructive"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("signOut")}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
