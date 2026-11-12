import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  evaluateBudget,
  isValidOrderStateTransition,
  detectPriceTampering,
  optimizeProductsForBudget
} from './commerceLogic';
import { SEED_PRODUCTS } from '../data/seedCatalog';

test('calculateCartTotals calculates accurate subtotal from authoritative catalog', () => {
  const items = [
    { productId: 'prod-neuroapi', quantity: 1 }, // 79.0
    { productId: 'prod-vectorbase', quantity: 2 }  // 35.0 * 2 = 70.0
  ];

  const result = calculateCartTotals(items, SEED_PRODUCTS);

  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.items.length, 2);
  assert.equal(result.totalAmount, 149.0);
  assert.equal(result.itemCount, 3);
  assert.equal(result.currency, 'USD');
});

test('calculateCartTotals rejects empty item lists', () => {
  const result = calculateCartTotals([], SEED_PRODUCTS);
  assert.equal(result.isValid, false);
  assert.equal(result.totalAmount, 0);
  assert.match(result.errors[0], /empty/i);
});

test('calculateCartTotals flags invalid or missing product IDs', () => {
  const items = [{ productId: 'non-existent-item-999', quantity: 1 }];
  const result = calculateCartTotals(items, SEED_PRODUCTS);
  assert.equal(result.isValid, false);
  assert.match(result.errors[0], /not found/i);
});

test('calculateCartTotals rejects zero or negative quantities', () => {
  const items = [{ productId: 'prod-cloudpulse', quantity: 0 }];
  const result = calculateCartTotals(items, SEED_PRODUCTS);
  assert.equal(result.isValid, false);
  assert.match(result.errors[0], /positive integer/i);
});

test('detectPriceTampering flags altered client prices', () => {
  const tamperedItems = [
    { productId: 'prod-neuroapi', declaredPrice: 1.0 } // Attempting to pay $1 instead of $79
  ];
  const check = detectPriceTampering(tamperedItems, SEED_PRODUCTS);
  assert.equal(check.tampered, true);
  assert.equal(check.details.length, 1);
  assert.match(check.details[0], /mismatch/i);

  const genuineItems = [
    { productId: 'prod-neuroapi', declaredPrice: 79.0 }
  ];
  const genuineCheck = detectPriceTampering(genuineItems, SEED_PRODUCTS);
  assert.equal(genuineCheck.tampered, false);
});

test('evaluateBudget correctly identifies limits and remaining reserves', () => {
  const underBudget = evaluateBudget(120, 200);
  assert.equal(underBudget.withinBudget, true);
  assert.equal(underBudget.remainingBudget, 80);
  assert.equal(underBudget.utilizationPct, 60);
  assert.equal(underBudget.excess, 0);

  const overBudget = evaluateBudget(250, 200);
  assert.equal(overBudget.withinBudget, false);
  assert.equal(overBudget.remainingBudget, -50);
  assert.equal(overBudget.excess, 50);
});

test('isValidOrderStateTransition enforces strict non-tamperable payment lifecycle', () => {
  // Valid transitions
  assert.equal(isValidOrderStateTransition('PENDING', 'AWAITING_PAYMENT'), true);
  assert.equal(isValidOrderStateTransition('AWAITING_PAYMENT', 'PAID'), true);
  assert.equal(isValidOrderStateTransition('AWAITING_PAYMENT', 'PAYMENT_FAILED'), true);
  assert.equal(isValidOrderStateTransition('PAYMENT_FAILED', 'AWAITING_PAYMENT'), true);
  assert.equal(isValidOrderStateTransition('PENDING', 'CANCELLED'), true);

  // Illegal transitions (e.g. attempting to jump straight from PENDING to PAID without PayPal capture)
  assert.equal(isValidOrderStateTransition('PENDING', 'PAID'), false);
  // Attempting to alter or revert a terminal PAID order
  assert.equal(isValidOrderStateTransition('PAID', 'PENDING'), false);
  assert.equal(isValidOrderStateTransition('PAID', 'CANCELLED'), false);
  assert.equal(isValidOrderStateTransition('CANCELLED', 'PAID'), false);
});

test('optimizeProductsForBudget selects best combo within strict budget threshold', () => {
  const maxBudget = 100;
  const result = optimizeProductsForBudget(maxBudget, SEED_PRODUCTS, ['AI & Machine Learning']);

  assert.ok(result.totalCost <= maxBudget);
  assert.ok(result.selected.length >= 1);
  assert.equal(result.remainingBudget, maxBudget - result.totalCost);
});
