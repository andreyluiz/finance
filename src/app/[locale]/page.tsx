"use client";

import {
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  ListChecks,
  QrCode,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FeatureCard } from "@/components/landing/feature-card";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { PricingCard } from "@/components/landing/pricing-card";
import { StatCard } from "@/components/landing/stat-card";
import { TestimonialCard } from "@/components/landing/testimonial-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { H1, H2, H3, Lead, Muted } from "@/components/ui/typography";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const t = useTranslations("landing");

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 inline-flex items-center gap-2">
                <Shield className="h-3 w-3" />
                {t("hero.badge")}
              </Badge>
              <H1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl">
                {t("hero.title")}
              </H1>
              <Lead className="mb-8 text-lg sm:text-xl max-w-2xl">
                {t("hero.subtitle")}
              </Lead>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {!loading &&
                  (user ? (
                    <Button asChild size="lg" className="text-base">
                      <Link href="/app">{t("hero.goToDashboard")}</Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild size="lg" className="text-base">
                        <Link href="/signup">{t("hero.getStarted")}</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="text-base"
                      >
                        <a href="#pricing">{t("hero.viewPricing")}</a>
                      </Button>
                    </>
                  ))}
              </div>
              <Muted className="mt-6">{t("hero.noCreditCard")}</Muted>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 blur-3xl rounded-full" />
              <Image
                src="https://placehold.co/1200x800/1e293b/e2e8f0?text=Dashboard+Preview"
                alt="Finance Tracker Dashboard"
                width={1200}
                height={800}
                className="relative rounded-2xl shadow-2xl border border-border"
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-y border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-foreground">
                  CHF 500K+
                </div>
                <Muted className="mt-1">{t("stats.tracked")}</Muted>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">10K+</div>
                <Muted className="mt-1">{t("stats.payments")}</Muted>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">50+</div>
                <Muted className="mt-1">{t("stats.users")}</Muted>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">99.9%</div>
                <Muted className="mt-1">{t("stats.uptime")}</Muted>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">{t("features.badge")}</Badge>
            <H2 className="mb-4">{t("features.title")}</H2>
            <Lead className="max-w-3xl mx-auto">{t("features.subtitle")}</Lead>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title={t("features.paymentTracking.title")}
              description={t("features.paymentTracking.description")}
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6" />}
              title={t("features.dueDateAlerts.title")}
              description={t("features.dueDateAlerts.description")}
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title={t("features.financialOverview.title")}
              description={t("features.financialOverview.description")}
            />
            <FeatureCard
              icon={<QrCode className="h-6 w-6" />}
              title={t("features.qrBills.title")}
              description={t("features.qrBills.description")}
            />
            <FeatureCard
              icon={<CalendarClock className="h-6 w-6" />}
              title={t("features.installments.title")}
              description={t("features.installments.description")}
            />
            <FeatureCard
              icon={<ListChecks className="h-6 w-6" />}
              title={t("features.paymentSessions.title")}
              description={t("features.paymentSessions.description")}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">{t("howItWorks.badge")}</Badge>
            <H2 className="mb-4">{t("howItWorks.title")}</H2>
            <Lead className="max-w-3xl mx-auto">
              {t("howItWorks.subtitle")}
            </Lead>
          </div>

          <div className="space-y-24">
            {/* Step 1 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-6">
                  1
                </div>
                <H3 className="mb-4">{t("howItWorks.step1.title")}</H3>
                <Lead className="text-muted-foreground mb-6">
                  {t("howItWorks.step1.description")}
                </Lead>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>{t("howItWorks.step1.feature1")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>{t("howItWorks.step1.feature2")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>{t("howItWorks.step1.feature3")}</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <Image
                  src="https://placehold.co/600x400/1e293b/e2e8f0?text=Add+Transaction"
                  alt="Add Transaction"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-xl border border-border"
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Image
                  src="https://placehold.co/600x400/1e293b/e2e8f0?text=Track+Everything"
                  alt="Track Everything"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-xl border border-border"
                />
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-6">
                  2
                </div>
                <H3 className="mb-4">{t("howItWorks.step2.title")}</H3>
                <Lead className="text-muted-foreground mb-6">
                  {t("howItWorks.step2.description")}
                </Lead>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>{t("howItWorks.step2.feature1")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>{t("howItWorks.step2.feature2")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>{t("howItWorks.step2.feature3")}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-6">
                  3
                </div>
                <H3 className="mb-4">{t("howItWorks.step3.title")}</H3>
                <Lead className="text-muted-foreground mb-6">
                  {t("howItWorks.step3.description")}
                </Lead>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>{t("howItWorks.step3.feature1")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>{t("howItWorks.step3.feature2")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span>{t("howItWorks.step3.feature3")}</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <Image
                  src="https://placehold.co/600x400/1e293b/e2e8f0?text=Stay+In+Control"
                  alt="Stay In Control"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-xl border border-border"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">{t("pricing.badge")}</Badge>
            <H2 className="mb-4">{t("pricing.title")}</H2>
            <Lead className="max-w-3xl mx-auto">{t("pricing.subtitle")}</Lead>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <PricingCard
              name={t("pricing.free.name")}
              price="Free"
              period={t("pricing.period")}
              description={t("pricing.free.description")}
              ctaText={t("pricing.free.cta")}
              ctaHref="/signup"
              features={[
                {
                  text: t("pricing.free.transactions"),
                  included: true,
                },
                {
                  text: t("pricing.free.dashboard"),
                  included: true,
                },
                {
                  text: t("pricing.free.alerts"),
                  included: true,
                },
                {
                  text: t("pricing.free.qrBills"),
                  included: false,
                },
                {
                  text: t("pricing.free.installments"),
                  included: false,
                },
                {
                  text: t("pricing.free.sessions"),
                  included: false,
                },
                {
                  text: t("pricing.free.ai"),
                  included: false,
                },
              ]}
            />

            <PricingCard
              name={t("pricing.budget.name")}
              price="CHF 2"
              period={t("pricing.period")}
              description={t("pricing.budget.description")}
              ctaText={t("pricing.budget.cta")}
              ctaHref="/signup"
              features={[
                {
                  text: t("pricing.budget.transactions"),
                  included: true,
                },
                {
                  text: t("pricing.budget.dashboard"),
                  included: true,
                },
                {
                  text: t("pricing.budget.alerts"),
                  included: true,
                },
                {
                  text: t("pricing.budget.qrBills"),
                  included: false,
                },
                {
                  text: t("pricing.budget.installments"),
                  included: true,
                },
                {
                  text: t("pricing.budget.sessions"),
                  included: false,
                },
                {
                  text: t("pricing.budget.ai"),
                  included: false,
                },
              ]}
            />

            <PricingCard
              name={t("pricing.balance.name")}
              price="CHF 5"
              period={t("pricing.period")}
              description={t("pricing.balance.description")}
              ctaText={t("pricing.balance.cta")}
              ctaHref="/signup"
              popular
              features={[
                {
                  text: t("pricing.balance.transactions"),
                  included: true,
                },
                {
                  text: t("pricing.balance.dashboard"),
                  included: true,
                },
                {
                  text: t("pricing.balance.alerts"),
                  included: true,
                },
                {
                  text: t("pricing.balance.qrBills"),
                  included: true,
                },
                {
                  text: t("pricing.balance.installments"),
                  included: true,
                },
                {
                  text: t("pricing.balance.sessions"),
                  included: true,
                },
                {
                  text: t("pricing.balance.ai"),
                  included: false,
                },
              ]}
            />

            <PricingCard
              name={t("pricing.wealth.name")}
              price="CHF 10"
              period={t("pricing.period")}
              description={t("pricing.wealth.description")}
              ctaText={t("pricing.wealth.cta")}
              ctaHref="/signup"
              features={[
                {
                  text: t("pricing.wealth.transactions"),
                  included: true,
                },
                {
                  text: t("pricing.wealth.dashboard"),
                  included: true,
                },
                {
                  text: t("pricing.wealth.alerts"),
                  included: true,
                },
                {
                  text: t("pricing.wealth.qrBills"),
                  included: true,
                },
                {
                  text: t("pricing.wealth.installments"),
                  included: true,
                },
                {
                  text: t("pricing.wealth.sessions"),
                  included: true,
                },
                {
                  text: t("pricing.wealth.ai"),
                  included: true,
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">{t("testimonials.badge")}</Badge>
            <H2 className="mb-4">{t("testimonials.title")}</H2>
            <Lead className="max-w-3xl mx-auto">
              {t("testimonials.subtitle")}
            </Lead>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote={t("testimonials.testimonial1.quote")}
              author={t("testimonials.testimonial1.author")}
              role={t("testimonials.testimonial1.role")}
              avatar="https://placehold.co/100x100/1e293b/e2e8f0?text=SM"
            />
            <TestimonialCard
              quote={t("testimonials.testimonial2.quote")}
              author={t("testimonials.testimonial2.author")}
              role={t("testimonials.testimonial2.role")}
              avatar="https://placehold.co/100x100/1e293b/e2e8f0?text=MC"
            />
            <TestimonialCard
              quote={t("testimonials.testimonial3.quote")}
              author={t("testimonials.testimonial3.author")}
              role={t("testimonials.testimonial3.role")}
              avatar="https://placehold.co/100x100/1e293b/e2e8f0?text=AL"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">{t("benefits.badge")}</Badge>
            <H2 className="mb-4">{t("benefits.title")}</H2>
            <Lead className="max-w-3xl mx-auto">{t("benefits.subtitle")}</Lead>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              icon={<Shield className="h-8 w-8" />}
              value={t("benefits.swiss.value")}
              label={t("benefits.swiss.label")}
            />
            <StatCard
              icon={<Users className="h-8 w-8" />}
              value={t("benefits.languages.value")}
              label={t("benefits.languages.label")}
            />
            <StatCard
              icon={<Sparkles className="h-8 w-8" />}
              value={t("benefits.darkMode.value")}
              label={t("benefits.darkMode.label")}
            />
            <StatCard
              icon={<TrendingUp className="h-8 w-8" />}
              value={t("benefits.updates.value")}
              label={t("benefits.updates.label")}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <H2 className="mb-6">{t("cta.title")}</H2>
          <Lead className="mb-8">{t("cta.subtitle")}</Lead>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/signup">{t("cta.button")}</Link>
            </Button>
          </div>
          <Muted className="mt-6">{t("cta.noCreditCard")}</Muted>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
