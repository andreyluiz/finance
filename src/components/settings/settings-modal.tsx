"use client";

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
      setError("Please enter a valid number");
      return;
    }

    if (day < 1 || day > 31) {
      setError("Day must be between 1 and 31");
      return;
    }

    try {
      setBillingPeriodDay(day);
      toast.success("Settings saved successfully");
      onOpenChange(false);

      // Reload the page to refresh the billing period calculations
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
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
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your billing period preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="billingDay">Billing Period Day</Label>
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
              placeholder="Enter day (1-31)"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Your billing period will start on this day of each month. For
              example, if you set it to 10, your billing period will run from
              the 10th of one month to the 10th of the next month.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
