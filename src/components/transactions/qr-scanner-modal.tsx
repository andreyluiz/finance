"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extractTransactionData } from "@/lib/utils/swiss-qr-bill";

interface QRScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (data: {
    name: string;
    value: number;
    currency: string;
    dueDate: Date | null;
    paymentReference: string;
    paymentReferenceType: string;
  }) => void;
}

export function QRScannerModal({
  open,
  onOpenChange,
  onScanSuccess,
}: QRScannerModalProps) {
  const [_isScanning, setIsScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("transactions.qrScanner");

  // Debug logging
  useEffect(() => {
    console.log("QRScannerModal open state changed:", open);
  }, [open]);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      try {
        const transactionData = extractTransactionData(decodedText);
        onScanSuccess(transactionData);
        onOpenChange(false);
        toast.success(t("success.scanned"));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("errors.invalidQR");
        toast.error(message);
      }
    },
    [onScanSuccess, onOpenChange, t],
  );

  const handleScanFailure = useCallback((error: string) => {
    // Ignore scan failures - they happen continuously while scanning
    // Only log actual errors
    if (!error.includes("NotFoundException")) {
      console.warn("QR scan error:", error);
    }
  }, []);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        console.log("Stopping scanner...");
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null; // Clear the ref
        setIsScanning(false);
        console.log("Scanner stopped and cleared");
      } catch (error) {
        console.error("Error stopping scanner:", error);
        // Even if there's an error, clear the ref to allow reinitialization
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  }, []);

  const startScanning = useCallback(async () => {
    if (!scannerElementRef.current) {
      console.log("Scanner element not ready");
      return;
    }

    // Prevent multiple initializations
    if (scannerRef.current) {
      console.log("Scanner already running");
      return;
    }

    try {
      console.log("Initializing QR scanner...");
      const html5QrCode = new Html5Qrcode("qr-scanner");
      scannerRef.current = html5QrCode;

      console.log("Starting camera...");
      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: 250, // Square box of 250x250
          aspectRatio: 1.0, // Keep video square
        },
        handleScanSuccess,
        handleScanFailure,
      );

      console.log("Camera started successfully");
      setIsScanning(true);
    } catch (error) {
      console.error("Error starting QR scanner:", error);
      toast.error(t("errors.cameraError"));
      setShowManualEntry(true);
      // Clear ref on error to allow retry
      scannerRef.current = null;
    }
  }, [handleScanSuccess, handleScanFailure, t]);

  // Cleanup scanner when component unmounts
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          })
          .catch((error) => {
            console.error("Cleanup error:", error);
            scannerRef.current = null;
          });
      }
    };
  }, []);

  // Start camera scanning when modal opens
  useEffect(() => {
    if (open && !showManualEntry) {
      // Add a small delay to ensure the DOM element is mounted
      const timer = setTimeout(() => {
        if (scannerElementRef.current) {
          startScanning();
        }
      }, 100);
      return () => clearTimeout(timer);
    } else if (!open || showManualEntry) {
      stopScanning();
    }
  }, [open, showManualEntry, startScanning, stopScanning]);

  const handleManualSubmit = () => {
    try {
      const transactionData = extractTransactionData(manualEntry);
      onScanSuccess(transactionData);
      onOpenChange(false);
      setManualEntry("");
      toast.success(t("success.processed"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("errors.invalidQR");
      toast.error(message);
    }
  };

  const handleCancel = () => {
    stopScanning();
    setManualEntry("");
    setShowManualEntry(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-2xl border-border">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!showManualEntry ? (
            <>
              <div
                id="qr-scanner"
                ref={scannerElementRef}
                className="w-full aspect-square border-2 border-border rounded-lg overflow-hidden bg-muted [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  stopScanning();
                  setShowManualEntry(true);
                }}
              >
                {t("manualEntry")}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="manual-qr">{t("manualEntryLabel")}</Label>
                <Textarea
                  id="manual-qr"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  placeholder={t("manualEntryPlaceholder")}
                  rows={10}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  {t("manualEntryHelp")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowManualEntry(false);
                  setManualEntry("");
                }}
              >
                {t("backToCamera")}
              </Button>
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t("cancel")}
          </Button>
          {showManualEntry && (
            <Button
              type="button"
              onClick={handleManualSubmit}
              disabled={!manualEntry.trim()}
            >
              {t("process")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
