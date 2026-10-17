/**
 * Vendor Payment Status Options
 * Used for dropdown selection in forms and filtering
 */
export const VENDOR_PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
] as const;

/**
 * Vendor Payment Status as JSON array for API/documentation
 */
export const VENDOR_PAYMENT_STATUS_JSON = JSON.stringify(
  VENDOR_PAYMENT_STATUS_OPTIONS.map(opt => opt.value)
);

/**
 * Get status label from value
 */
export const getVendorPaymentStatusLabel = (status: string): string => {
  const option = VENDOR_PAYMENT_STATUS_OPTIONS.find(opt => opt.value === status);
  return option?.label || status;
};

/**
 * Status badge variants for UI display
 */
export const VENDOR_PAYMENT_STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  unpaid: 'warning',
  paid: 'success',
};
