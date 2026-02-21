/**
 * Formato de moneda para el mercado peruano (Soles - PEN)
 * Formato: S/ 0.00
 */

export function formatCurrency(value: number, symbol: string = "S/"): string {
  return `${symbol} ${value.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Alias para mantener compatibilidad con refactorización gradual
export const formatSoles = formatCurrency;
