import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="flex justify-end mb-8">
        <ThemeSwitcher />
      </div>

      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Finance Tracker</h1>
          <p className="text-muted-foreground text-lg">
            Track and manage your payments with ease
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="p-8 border rounded-lg bg-card">
            <h2 className="text-2xl font-semibold mb-4">
              shadcn/ui Button Showcase
            </h2>
            <p className="text-muted-foreground mb-6">
              Examples of different button variants from shadcn/ui
            </p>

            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div className="p-8 border rounded-lg bg-card w-full">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="text-muted-foreground">
              This is a financial tracker application built with Next.js,
              TypeScript, and Tailwind CSS. The application supports both light
              and dark themes, which you can toggle using the button in the
              top-right corner.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
