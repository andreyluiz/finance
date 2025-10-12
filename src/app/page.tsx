"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1, Lead, Muted } from "@/components/ui/typography";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <H1 className="mb-6">Track Your Payments with Ease</H1>
          <Lead className="mb-8 max-w-2xl mx-auto">
            Stay on top of your finances by easily managing what's pending, due,
            and past due. Simple, intuitive, and built for you.
          </Lead>
          <div className="flex gap-4 justify-center">
            {!loading &&
              (user ? (
                <Button asChild size="lg">
                  <Link href="/app">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/signup">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/signin">Sign In</Link>
                  </Button>
                </>
              ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <Muted>
                Monitor all your payments in one place with clear status
                indicators.
              </Muted>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Due Date Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Muted>
                Never miss a payment with automated reminders and notifications.
              </Muted>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Muted>
                Get insights into your spending and payment patterns at a
                glance.
              </Muted>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <Muted>Built with Next.js, TypeScript, and shadcn/ui</Muted>
        </div>
      </footer>
    </div>
  );
}
