"use client";

import { useTranslations } from "next-intl";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1, Lead, Muted } from "@/components/ui/typography";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const t = useTranslations("pages.home");

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <H1 className="mb-6">{t("hero.title")}</H1>
          <Lead className="mb-8 max-w-2xl mx-auto">{t("hero.subtitle")}</Lead>
          <div className="flex gap-4 justify-center">
            {!loading &&
              (user ? (
                <Button asChild size="lg">
                  <Link href="/app">{t("hero.goToDashboard")}</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/signup">{t("hero.getStarted")}</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/signin">{t("hero.signIn")}</Link>
                  </Button>
                </>
              ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("features.paymentTracking.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Muted>{t("features.paymentTracking.description")}</Muted>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("features.dueDateAlerts.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Muted>{t("features.dueDateAlerts.description")}</Muted>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("features.financialOverview.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Muted>{t("features.financialOverview.description")}</Muted>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <Muted>{t("footer.builtWith")}</Muted>
        </div>
      </footer>
    </div>
  );
}
