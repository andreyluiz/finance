"use client";

import { Globe, Menu, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Locale } from "@/i18n/config";
import { localeNames, locales } from "@/i18n/config";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("landing.header");
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params.locale as Locale) || "en";

  const handleLocaleChange = (locale: Locale) => {
    router.replace(pathname, { locale });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="font-bold text-xl text-foreground hover:text-primary transition-colors">
              {t("logo")}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("features")}
            >
              {t("features")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("how-it-works")}
            >
              {t("howItWorks")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("pricing")}
            >
              {t("pricing")}
            </Button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeSwitcher />

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  {localeNames[currentLocale]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-border">
                {locales.map((locale) => (
                  <DropdownMenuItem
                    key={locale}
                    onClick={() => handleLocaleChange(locale)}
                    className="cursor-pointer"
                  >
                    {localeNames[locale]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" asChild>
              <Link href="/signin">{t("signIn")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">{t("getStarted")}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2 animate-in slide-in-from-top-5 duration-200">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => scrollToSection("features")}
            >
              {t("features")}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => scrollToSection("how-it-works")}
            >
              {t("howItWorks")}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => scrollToSection("pricing")}
            >
              {t("pricing")}
            </Button>

            <div className="pt-4 border-t space-y-2">
              {/* Language Switcher Mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    {localeNames[currentLocale]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {locales.map((locale) => (
                    <DropdownMenuItem
                      key={locale}
                      onClick={() => handleLocaleChange(locale)}
                      className="cursor-pointer"
                    >
                      {localeNames[locale]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                className="w-full"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/signin">{t("signIn")}</Link>
              </Button>
              <Button
                className="w-full"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/signup">{t("getStarted")}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
