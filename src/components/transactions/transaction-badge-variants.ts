import { cn } from "@/lib/utils";

export const TYPE_BADGE_CLASSNAMES = {
  income: cn(
    "bg-green-50 text-green-700 border-green-300",
    "dark:bg-green-950 dark:text-green-400 dark:border-green-700",
  ),
  expense: cn(
    "bg-red-50 text-red-700 border-red-300",
    "dark:bg-red-950 dark:text-red-400 dark:border-red-700",
  ),
} as const;

export const PRIORITY_BADGE_CLASSNAMES = {
  very_low: cn(
    "bg-green-50 text-green-700 border-green-300",
    "dark:bg-green-950 dark:text-green-400 dark:border-green-700",
  ),
  low: cn(
    "bg-lime-50 text-lime-700 border-lime-300",
    "dark:bg-lime-950 dark:text-lime-400 dark:border-lime-700",
  ),
  medium: cn(
    "bg-yellow-50 text-yellow-700 border-yellow-300",
    "dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-700",
  ),
  high: cn(
    "bg-orange-50 text-orange-700 border-orange-300",
    "dark:bg-orange-950 dark:text-orange-400 dark:border-orange-700",
  ),
  very_high: cn(
    "bg-red-50 text-red-700 border-red-300",
    "dark:bg-red-950 dark:text-red-400 dark:border-red-700",
  ),
} as const;
