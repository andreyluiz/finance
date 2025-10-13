import { Header } from "@/components/header";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { H1 } from "@/components/ui/typography";

export default function TransactionsPage() {
  return (
    <div className="min-h-screen">
      <Header showBackButton />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <H1 className="mb-6">Transactions</H1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form: full width on mobile, 35% on desktop */}
          <div className="w-full lg:w-[35%]">
            <TransactionForm />
          </div>

          {/* List: full width on mobile, 65% on desktop */}
          <div className="w-full lg:w-[65%]">
            <TransactionList />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
