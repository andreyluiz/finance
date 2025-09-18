'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BillingCycleSelectorProps {
  currentBillingMonth: Date;
  onMonthChange: (newMonth: Date) => void;
}

export default function BillingCycleSelector({ currentBillingMonth, onMonthChange }: BillingCycleSelectorProps) {
  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentBillingMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentBillingMonth, 1));
  };

  return (
    <div className={cn("flex items-center justify-center gap-4 mb-4", "print:hidden")}>
      <Button variant="outline" size="icon" onClick={handlePrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h2 className="text-xl font-semibold w-48 text-center capitalize">
        {format(currentBillingMonth, 'MMMM yyyy', { locale: ptBR })}
      </h2>
      <Button variant="outline" size="icon" onClick={handleNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
