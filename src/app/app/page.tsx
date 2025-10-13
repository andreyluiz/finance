import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Muted } from "@/components/ui/typography";

export default function AppPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Muted>
              This is the main application area. Your payments and financial
              tracking features will be displayed here.
            </Muted>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
