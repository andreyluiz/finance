import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string;
  label: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ value, label, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 p-6 rounded-lg bg-card border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className,
      )}
    >
      {icon && <div className="text-primary mb-2">{icon}</div>}
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground text-center">{label}</div>
    </div>
  );
}
