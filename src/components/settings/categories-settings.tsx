"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  createSpendingCategoryAction,
  deleteSpendingCategoryAction,
  getSpendingCategoriesAction,
} from "@/actions/spending-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SpendingCategory } from "@/db/schema";

const PREDEFINED_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
];

import { Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CategoriesSettings() {
  const t = useTranslations("settings.categories");
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(
    PREDEFINED_COLORS[5].value,
  ); // Default Green
  const [isCreating, setIsCreating] = useState(false);
  const [openColorPopover, setOpenColorPopover] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["spendingCategories"],
    queryFn: async () => await getSpendingCategoriesAction(),
  });

  const createMutation = useMutation({
    mutationFn: createSpendingCategoryAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spendingCategories"] });
      setNewCategoryName("");
      setIsCreating(false);
      toast.success(t("created"));
    },
    onError: (error) => {
      toast.error(error.message || t("createFailed"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSpendingCategoryAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spendingCategories"] });
      toast.success(t("deleted"));
    },
    onError: (error) => {
      toast.error(error.message || t("deleteFailed"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsCreating(true);
    createMutation.mutate({
      name: newCategoryName.trim(),
      color: newCategoryColor,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {t("addNew")}
        </h3>
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Popover open={openColorPopover} onOpenChange={setOpenColorPopover}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-10 h-10 rounded-full border border-border shadow-sm flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                style={{ backgroundColor: newCategoryColor }}
                title={t("selectColor")}
              />
            </PopoverTrigger>
            <PopoverContent className="w-[196px] p-3" align="start">
              <div className="grid grid-cols-5 gap-2">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      setNewCategoryColor(color.value);
                      setOpenColorPopover(false);
                    }}
                    className="w-6 h-6 rounded-full border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 relative flex items-center justify-center"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {newCategoryColor === color.value && (
                      <Check className="w-3 h-3 text-white drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex-1">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t("namePlaceholder")}
              disabled={isCreating}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={isCreating || !newCategoryName.trim()}
            size="icon"
            className="shrink-0"
          >
            {isCreating ? (
              <Plus className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="sr-only">{t("add")}</span>
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {t("existing")}
        </h3>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">{t("loading")}</div>
        ) : categories.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">
            {t("noCategories")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm(t("deleteConfirm"))) {
                      deleteMutation.mutate(category.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">{t("delete")}</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
