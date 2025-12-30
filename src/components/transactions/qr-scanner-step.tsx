"use client";

import { QRScanner } from "./qr-scanner";

interface QRScannerStepProps {
  onScanSuccess: (data: {
    name: string;
    value: number;
    currency: string;
    dueDate: Date | null;
    paymentReference: string;
    paymentReferenceType: string;
  }) => void;
}

export function QRScannerStep({ onScanSuccess }: QRScannerStepProps) {
  return (
    <div className="py-2">
      <QRScanner onScanSuccess={onScanSuccess} scannerId="qr-scanner-step" />
    </div>
  );
}
