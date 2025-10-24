/**
 * Check if a transaction is overdue (due date is before today)
 */
export function isTransactionOverdue(
  dueDate: Date | string,
  isPaid: boolean,
): boolean {
  if (isPaid) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

/**
 * Check if a transaction is due today
 */
export function isTransactionDueToday(
  dueDate: Date | string,
  isPaid: boolean,
): boolean {
  if (isPaid) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return due.getTime() === today.getTime();
}

/**
 * Normalize a date to midnight (00:00:00) for comparison
 */
export function normalizeDate(date: Date | string): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}
