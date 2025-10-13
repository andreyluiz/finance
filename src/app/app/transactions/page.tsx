import { Header } from "@/components/header";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { H1 } from "@/components/ui/typography";

export default function TransactionsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <H1 className="mb-6 pb-2 border-b border-border">Transactions</H1>

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
      </main>
    </div>
  );
}
