"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { scanQrFromPdf } from "@/lib/utils/pdf-qr-scanner";
import { extractTransactionData } from "@/lib/utils/swiss-qr-bill";

interface QRScannerProps {
  onScanSuccess: (data: {
    name: string;
    value: number;
    currency: string;
    dueDate: Date | null;
    paymentReference: string;
    paymentReferenceType: string;
  }) => void;
  scannerId?: string;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export function QRScanner({
  onScanSuccess,
  scannerId = "qr-scanner",
  onCancel,
  showCancelButton = false,
}: QRScannerProps) {
  const [_isScanning, setIsScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("transactions.qrScanner");

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      try {
        const transactionData = extractTransactionData(decodedText);
        onScanSuccess(transactionData);
        toast.success(t("success.scanned"));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("errors.invalidQR");
        toast.error(message);
      }
    },
    [onScanSuccess, t],
  );

  const handleScanFailure = useCallback((_error: string) => {
    // Scan failures happen continuously while scanning, so we ignore them
  }, []);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (_error) {
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  }, []);

  const startScanning = useCallback(async () => {
    if (!scannerElementRef.current || scannerRef.current) {
      return;
    }

    try {
      // Use unique ID for scanner
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
          aspectRatio: 1.0,
        },
        handleScanSuccess,
        handleScanFailure,
      );

      setIsScanning(true);
    } catch (_error) {
      toast.error(t("errors.cameraError"));
      setShowManualEntry(true);
      scannerRef.current = null;
    }
  }, [handleScanSuccess, handleScanFailure, t, scannerId]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          })
          .catch(() => {
            scannerRef.current = null;
          });
      }
    };
  }, []);

  useEffect(() => {
    if (!showManualEntry) {
      // Small delay to ensure DOM element is ready
      const timer = setTimeout(() => {
        // Only start if not already scanning and element exists
        if (scannerElementRef.current && !scannerRef.current) {
          startScanning();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    stopScanning();
  }, [showManualEntry, startScanning, stopScanning]);

  const handleManualSubmit = () => {
    try {
      const transactionData = extractTransactionData(manualEntry);
      onScanSuccess(transactionData);
      setManualEntry("");
      toast.success(t("success.processed"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("errors.invalidQR");
      toast.error(message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again
    e.target.value = "";

    setIsAnalyzingFile(true);
    // Stop camera scanning if it's running
    if (_isScanning) {
      await stopScanning();
    }

    try {
      let decodedText: string | null = null;

      if (file.type === "application/pdf") {
        decodedText = await scanQrFromPdf(file);
      } else if (file.type.startsWith("image/")) {
        // Use Html5Qrcode to scan image file
        const tempId = `file-scanner-${Math.random().toString(36).substring(7)}`;
        const tempDiv = document.createElement("div");
        tempDiv.id = tempId;
        tempDiv.style.display = "none";
        document.body.appendChild(tempDiv);

        const fileScanner = new Html5Qrcode(tempId);
        try {
          const result = await fileScanner.scanFileV2(file, false);
          decodedText = result.decodedText;
        } finally {
          fileScanner.clear();
          document.body.removeChild(tempDiv);
        }
      } else {
        throw new Error(t("errors.unsupportedFileType"));
      }

      if (decodedText) {
        handleScanSuccess(decodedText);
      } else {
        throw new Error(t("errors.noQRFound"));
      }
    } catch (error) {
      console.error("File scan error:", error);
      const message =
        error instanceof Error ? error.message : t("errors.scanFailed");
      toast.error(message);

      // Resume scanning if we weren't in manual mode
      if (!showManualEntry && scannerElementRef.current) {
        setTimeout(() => startScanning(), 500);
      }
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    stopScanning();
    setManualEntry("");
    setShowManualEntry(false);
    onCancel?.();
  };

  return (
    <div className="space-y-4">
      {!showManualEntry ? (
        <>
          <div
            id={scannerId}
            ref={scannerElementRef}
            className="w-full aspect-square border-2 border-border rounded-lg overflow-hidden bg-muted [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                stopScanning();
                setShowManualEntry(true);
              }}
            >
              {t("manualEntry")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={triggerFileUpload}
              disabled={isAnalyzingFile}
            >
              {isAnalyzingFile ? t("analyzing") : t("uploadFile")}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,image/*"
              onChange={handleFileUpload}
            />
          </div>
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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowManualEntry(false);
                setManualEntry("");
              }}
            >
              {t("backToCamera")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={triggerFileUpload}
              disabled={isAnalyzingFile}
            >
              {isAnalyzingFile ? t("analyzing") : t("uploadFile")}
            </Button>
          </div>
          <Button
            type="button"
            className="w-full mt-2"
            onClick={handleManualSubmit}
            disabled={!manualEntry.trim()}
          >
            {t("process")}
          </Button>
        </>
      )}

      {showCancelButton && (
        <div className="flex justify-end pt-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t("cancel")}
          </Button>
        </div>
      )}
    </div>
  );
}
