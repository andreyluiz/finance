/**
 * Payment reference type - currently only Swiss QR Bill is supported
 */
export type PaymentReferenceType = "SWISS_QR_BILL";

/**
 * Settings for payment reference feature
 */
export interface PaymentReferenceSettings {
  enabled: boolean;
  preferredType: PaymentReferenceType;
}

const PAYMENT_REFERENCE_ENABLED_KEY = "paymentReferenceEnabled";
const PAYMENT_REFERENCE_TYPE_KEY = "paymentReferenceType";

/**
 * Check if payment reference feature is enabled
 */
export function isPaymentReferenceEnabled(): boolean {
  if (typeof window === "undefined") return false;

  const value = localStorage.getItem(PAYMENT_REFERENCE_ENABLED_KEY);
  return value === "true";
}

/**
 * Enable or disable payment reference feature
 */
export function setPaymentReferenceEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(PAYMENT_REFERENCE_ENABLED_KEY, enabled.toString());
}

/**
 * Get the preferred payment reference type
 */
export function getPaymentReferenceType(): PaymentReferenceType {
  if (typeof window === "undefined") return "SWISS_QR_BILL";

  const value = localStorage.getItem(PAYMENT_REFERENCE_TYPE_KEY);
  return (value as PaymentReferenceType) || "SWISS_QR_BILL";
}

/**
 * Set the preferred payment reference type
 */
export function setPaymentReferenceType(type: PaymentReferenceType): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(PAYMENT_REFERENCE_TYPE_KEY, type);
}

/**
 * Get all payment reference settings
 */
export function getPaymentReferenceSettings(): PaymentReferenceSettings {
  return {
    enabled: isPaymentReferenceEnabled(),
    preferredType: getPaymentReferenceType(),
  };
}

/**
 * Update payment reference settings
 */
export function updatePaymentReferenceSettings(
  settings: Partial<PaymentReferenceSettings>,
): void {
  if (settings.enabled !== undefined) {
    setPaymentReferenceEnabled(settings.enabled);
  }

  if (settings.preferredType !== undefined) {
    setPaymentReferenceType(settings.preferredType);
  }
}

/**
 * Get human-readable label for payment reference type
 */
export function getPaymentReferenceTypeLabel(
  _type: PaymentReferenceType,
): string {
  return "Swiss QR Bill";
}
