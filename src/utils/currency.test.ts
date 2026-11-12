import test from 'node:test';
import assert from 'node:assert/strict';
import { convertCurrency, formatCurrency, calculateAnnualDiscount } from './currency';

test('convertCurrency correctly converts USD to EUR, GBP, and INR', () => {
  assert.equal(convertCurrency(100, 'USD'), 100);
  assert.equal(convertCurrency(100, 'EUR'), 92.0);
  assert.equal(convertCurrency(100, 'GBP'), 79.0);
  assert.equal(convertCurrency(100, 'INR'), 8450.0);
  assert.equal(convertCurrency(0, 'EUR'), 0);
});

test('formatCurrency outputs expected symbol and decimal points', () => {
  assert.equal(formatCurrency(49.0, 'USD'), '$49.00');
  assert.equal(formatCurrency(45.08, 'EUR'), '€45.08');
  assert.equal(formatCurrency(38.71, 'GBP'), '£38.71');
  assert.equal(formatCurrency(4140.5, 'INR'), '₹4,140.50');
});

test('calculateAnnualDiscount calculates 15% annual savings accurately', () => {
  const result = calculateAnnualDiscount(50);
  assert.equal(result.fullAnnualCost, 600);
  assert.equal(result.annualTotal, 510);
  assert.equal(result.annualSavings, 90);
  assert.equal(result.discountPercent, 15);
});
