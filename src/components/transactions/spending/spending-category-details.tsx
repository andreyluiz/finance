"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  addSpendingEntryAction,
  bulkAddSpendingEntriesAction,
  deleteSpendingEntryAction,
  getSpendingEntriesAction,
} from "@/actions/spending-actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { SpendingCategory } from "@/db/schema";
import { cn } from "@/lib/utils";
import type { BillingPeriod } from "@/lib/utils/billing-period";

interface SpendingCategoryDetailsProps {
  category: SpendingCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billingPeriod: BillingPeriod;
}

export function SpendingCategoryDetails({
  category,
  open,
  onOpenChange,
  billingPeriod,
}: SpendingCategoryDetailsProps) {
  const t = useTranslations("spending.details"); // Placeholder translation keys
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [bulkText, setBulkText] = useState("");
  const [activeTab, setActiveTab] = useState("single");

  // Fetch entries
  const { data: entries = [] } = useQuery({
    queryKey: [
      "spendingEntries",
      category?.id,
      billingPeriod.startDate,
      billingPeriod.endDate,
    ],
    queryFn: async () => {
      if (!category) return [];
      return await getSpendingEntriesAction(
        category.id,
        billingPeriod.startDate,
        billingPeriod.endDate,
      );
    },
    enabled: !!category && open,
  });

  const addEntryMutation = useMutation({
    mutationFn: addSpendingEntryAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spendingEntries"] });
      queryClient.invalidateQueries({ queryKey: ["spendingCategoriesTotals"] });
      setAmount("");
      setNote("");
      setDate(new Date());
      toast.success("Entry added");
    },
    onError: (error) => toast.error(error.message),
  });

  const bulkAddMutation = useMutation({
    mutationFn: bulkAddSpendingEntriesAction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["spendingEntries"] });
      queryClient.invalidateQueries({ queryKey: ["spendingCategoriesTotals"] });
      setBulkText("");
      toast.success(`${data.length} entries added`);
      setActiveTab("history"); // Switch to history to see results
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteEntryMutation = useMutation({
    mutationFn: deleteSpendingEntryAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spendingEntries"] });
      queryClient.invalidateQueries({ queryKey: ["spendingCategoriesTotals"] });
      toast.success("Entry deleted");
    },
    onError: (error) => toast.error("Failed to delete entry"),
  });

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;

    addEntryMutation.mutate({
      categoryId: category.id,
      amount: amount, // Logic to handle currency/locale parsing might be needed
      note: note.trim() || null,
      createdAt: date,
    });
  };

  const handleBulkSubmit = () => {
    if (!category || !bulkText.trim()) return;

    // Simple CSV parser: Date(ISO/Text), Description, Amount
    // Example:
    // 2023-10-27, Supermarket, 50.50
    // Milk, 10 (defaults to today?) -> Let's stick to strict or flexible.
    // Spec says: "paste a CSV with ISO date, title and amount"

    const lines = bulkText.split("\n").filter((l) => l.trim());
    const entries = [];

    try {
      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 3) continue; // Skip invalid lines, or throw?

        const [dateStr, desc, amountStr] = parts;
        const entryDate = new Date(dateStr);
        if (isNaN(entryDate.getTime()))
          throw new Error(`Invalid date in line: ${line}`);
        if (isNaN(parseFloat(amountStr)))
          throw new Error(`Invalid amount in line: ${line}`);

        entries.push({
          categoryId: category.id,
          createdAt: entryDate,
          note: desc,
          amount: amountStr,
        });
      }

      if (entries.length === 0) {
        toast.error("No valid entries found");
        return;
      }

      bulkAddMutation.mutate(entries);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <DialogTitle>{category.name}</DialogTitle>
          </div>
          <DialogDescription>
            Manage entries for this category
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">{t("addEntry")}</TabsTrigger>
            <TabsTrigger value="bulk">{t("bulkAdd")}</TabsTrigger>
            <TabsTrigger value="history">{t("history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4 py-4">
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                        )}
                      >
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border border-border">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Input
                  id="note"
                  placeholder="e.g. Weekly shopping"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={addEntryMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Paste CSV Data</Label>
              <Textarea
                placeholder="YYYY-MM-DD, Description, Amount&#10;2024-01-20, Supermarket, 45.20"
                rows={8}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Format: Date (ISO), Description, Amount
              </p>
            </div>
            <Button
              onClick={handleBulkSubmit}
              className="w-full"
              disabled={bulkAddMutation.isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Entries
            </Button>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 py-4">
            <div className="border border-border rounded-md divide-y max-h-[300px] overflow-y-auto">
              {entries.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No entries in this period
                </div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 flex justify-between items-center text-sm group border-border"
                  >
                    <div>
                      <div className="font-medium">
                        {entry.note || "No description"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(entry.createdAt), "PPP")}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-mono font-medium">
                        {Number(entry.amount).toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={deleteEntryMutation.isPending}
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this entry?",
                            )
                          ) {
                            deleteEntryMutation.mutate(entry.id);
                          }
                        }}
                      >
                        {deleteEntryMutation.isPending &&
                        deleteEntryMutation.variables === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
