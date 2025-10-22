import { SwissQRBill } from "swissqrbill/pdf";

/**
 * Parse a Swiss QR Bill code string and extract structured data
 */
export function parseSwissQRBill(qrCodeString: string) {
  try {
    // Swiss QR Bill format is a specific string format
    // The swissqrbill library can parse this
    const lines = qrCodeString.split("\n");

    // Basic validation - Swiss QR Bill should start with "SPC"
    if (lines[0] !== "SPC") {
      throw new Error("Invalid Swiss QR Bill format - must start with SPC");
    }

    // Extract key fields from the QR code
    // Format reference: https://www.paymentstandards.ch/dam/downloads/ig-qr-bill-en.pdf
    const _version = lines[1]; // Version (e.g., "0200")
    const _coding = lines[2]; // Coding type (e.g., "1")
    const iban = lines[3]; // Creditor IBAN

    // Creditor information (lines 4-10)
    const _creditorAddressType = lines[4];
    const creditorName = lines[5];
    const _creditorAddress = lines[6];
    const _creditorPostalCode = lines[7];
    const _creditorCity = lines[8];
    const _creditorCountry = lines[9];

    // Ultimate creditor (lines 11-17) - usually empty

    // Amount (line 18)
    const amount = lines[18] ? Number.parseFloat(lines[18]) : null;

    // Currency (line 19)
    const currency = lines[19] || "CHF";

    // Ultimate debtor (lines 20-26)
    const _debtorAddressType = lines[20];
    const _debtorName = lines[21];

    // Reference type and reference (lines 27-28)
    const referenceType = lines[27];
    const reference = lines[28];

    // Unstructured message (line 29)
    const message = lines[29];

    // Due date can be in the additional information (line 30+)
    const additionalInfo = lines[30] || "";

    return {
      valid: true,
      data: {
        creditorName,
        creditorIBAN: iban,
        amount,
        currency,
        reference,
        referenceType,
        message,
        additionalInfo,
        rawData: qrCodeString,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid QR code format",
    };
  }
}

/**
 * Validate if a string is a valid Swiss QR Bill
 */
export function validateSwissQRBill(qrCodeString: string): boolean {
  const result = parseSwissQRBill(qrCodeString);
  return result.valid;
}

/**
 * Extract transaction data from a Swiss QR Bill for auto-filling forms
 */
export function extractTransactionData(qrCodeString: string) {
  const parsed = parseSwissQRBill(qrCodeString);

  if (!parsed.valid) {
    throw new Error(parsed.error || "Invalid QR Bill");
  }

  const { data } = parsed;

  return {
    name: data.creditorName || data.message || "Payment",
    value: data.amount || 0,
    currency: data.currency || "CHF",
    dueDate: null, // Swiss QR Bills don't always include due dates
    paymentReference: data.rawData,
    paymentReferenceType: "SWISS_QR_BILL",
  };
}

/**
 * Generate a visual QR code from a Swiss QR Bill reference
 * This will be used in the payment session to display the QR code
 */
export async function generateSwissQRBillPDF(
  qrCodeString: string,
): Promise<Blob> {
  const parsed = parseSwissQRBill(qrCodeString);

  if (!parsed.valid || !parsed.data) {
    throw new Error("Invalid QR Bill data");
  }

  // Use swissqrbill to generate a PDF with the QR code
  const qrBill = new SwissQRBill({
    creditor: {
      name: parsed.data.creditorName,
      account: parsed.data.creditorIBAN,
      address: "",
      zip: 0,
      city: "",
      country: "CH",
    },
    amount: parsed.data.amount || undefined,
    currency: parsed.data.currency as "CHF" | "EUR",
    reference: parsed.data.reference,
    message: parsed.data.message,
  });

  const pdf = await qrBill.getBlob();
  return pdf;
}
