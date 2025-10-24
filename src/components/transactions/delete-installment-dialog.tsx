"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteInstallmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSingle: () => void;
  onDeleteAll: () => void;
  isDeleting: boolean;
  installmentInfo: {
    number: number;
    total: number;
    name: string;
  };
}

export function DeleteInstallmentDialog({
  open,
  onOpenChange,
  onDeleteSingle,
  onDeleteAll,
  isDeleting,
  installmentInfo,
}: DeleteInstallmentDialogProps) {
  const t = useTranslations("transactions.deleteInstallmentDialog");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", {
              name: installmentInfo.name,
              number: installmentInfo.number,
              total: installmentInfo.total,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="font-medium text-sm">{t("singleOption")}</p>
            <p className="text-xs text-muted-foreground">
              {t("singleDescription", {
                number: installmentInfo.number,
              })}
            </p>
          </div>

          <div className="rounded-lg border border-destructive/50 p-3 space-y-1">
            <p className="font-medium text-sm text-destructive">
              {t("allOption")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("allDescription", {
                total: installmentInfo.total,
              })}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="outline"
            onClick={onDeleteSingle}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {t("deleteSingle")}
          </Button>
          <Button
            variant="destructive"
            onClick={onDeleteAll}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? t("deleting") : t("deleteAll")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
