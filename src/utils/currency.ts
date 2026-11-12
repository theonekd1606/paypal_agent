import { Currency } from '../types';

export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 84.5
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹'
};

/**
 * Converts a base USD amount to target currency using trusted exchange rates.
 */
export function convertCurrency(amountInUSD: number, targetCurrency: Currency): number {
  if (amountInUSD <= 0) return 0;
  const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
  return Number((amountInUSD * rate).toFixed(2));
}

/**
 * Formats monetary amounts with appropriate international currency symbols.
 */
export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Calculates annual plan billing with standard 15% discount for SaaS subscriptions.
 */
export function calculateAnnualDiscount(monthlyPriceUSD: number, discountRate = 0.15) {
  const fullAnnualCost = Number((monthlyPriceUSD * 12).toFixed(2));
  const discountedAnnualCost = Number((fullAnnualCost * (1 - discountRate)).toFixed(2));
  const savings = Number((fullAnnualCost - discountedAnnualCost).toFixed(2));

  return {
    monthlyRate: monthlyPriceUSD,
    annualTotal: discountedAnnualCost,
    fullAnnualCost,
    annualSavings: savings,
    discountPercent: Math.round(discountRate * 100)
  };
}
