"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getBillingPeriodDay,
  setBillingPeriodDay,
} from "@/lib/utils/billing-period";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [billingDay, setBillingDay] = useState<string>("");
  const [error, setError] = useState<string>("");
  const t = useTranslations("settings");

  // Load current billing day when modal opens
  useEffect(() => {
    if (open) {
      const currentDay = getBillingPeriodDay();
      setBillingDay(currentDay.toString());
      setError("");
    }
  }, [open]);

  const handleSave = () => {
    const day = Number.parseInt(billingDay, 10);

    // Validation
    if (Number.isNaN(day)) {
      setError(t("errors.invalidNumber"));
      return;
    }

    if (day < 1 || day > 31) {
      setError(t("errors.dayRange"));
      return;
    }

    try {
      setBillingPeriodDay(day);
      toast.success(t("success.saved"));
      onOpenChange(false);

      // Reload the page to refresh the billing period calculations
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.saveFailed"));
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-border">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="billingDay">{t("billingPeriodDay")}</Label>
            <Input
              id="billingDay"
              type="number"
              min="1"
              max="31"
              value={billingDay}
              onChange={(e) => {
                setBillingDay(e.target.value);
                setError("");
              }}
              placeholder={t("billingPeriodDayPlaceholder")}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              {t("billingPeriodDayHelp")}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={handleSave}>
            {t("saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
