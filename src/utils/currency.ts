/**
 * Formats a numeric value as Colombian Peso (COP) string.
 * Standard format: $#,##0.00 (e.g., $45.000,00)
 *
 * @param amount - The numerical amount to format
 * @returns Formatted currency string with thousands period and decimal comma
 */
export function formatCOP(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0,00';
  }

  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  return `$${formatted}`;
}
