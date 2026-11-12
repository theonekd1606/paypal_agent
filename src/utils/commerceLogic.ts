import { Product, OrderStatus, Currency } from '../types';

export interface CalculatedItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  currency: Currency;
}

export interface CalculationResult {
  items: CalculatedItem[];
  totalAmount: number;
  currency: Currency;
  itemCount: number;
  isValid: boolean;
  errors: string[];
}

/**
 * Calculates authoritative cart and order totals from verified catalog data.
 * Rejects client-supplied prices to guarantee anti-tampering security.
 */
export function calculateCartTotals(
  rawItems: { productId: string; quantity: number }[],
  catalog: Product[]
): CalculationResult {
  const errors: string[] = [];
  const calculatedItems: CalculatedItem[] = [];
  let totalAmount = 0;
  let totalQuantity = 0;
  let detectedCurrency: Currency = 'USD';

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return {
      items: [],
      totalAmount: 0,
      currency: 'USD',
      itemCount: 0,
      isValid: false,
      errors: ['Cart is empty or item list is invalid']
    };
  }

  const catalogMap = new Map<string, Product>();
  for (const prod of catalog) {
    catalogMap.set(prod.id, prod);
  }

  for (const item of rawItems) {
    if (!item.productId || typeof item.productId !== 'string') {
      errors.push(`Invalid product ID in request: ${JSON.stringify(item)}`);
      continue;
    }

    const qty = Math.floor(Number(item.quantity) || 0);
    if (qty <= 0) {
      errors.push(`Quantity must be a positive integer for product: ${item.productId}`);
      continue;
    }

    const product = catalogMap.get(item.productId);
    if (!product) {
      errors.push(`Product not found in active catalog: ${item.productId}`);
      continue;
    }

    if (!product.active) {
      errors.push(`Product is currently inactive: ${product.name}`);
      continue;
    }

    detectedCurrency = product.currency;
    const unitPrice = Number(product.price.toFixed(2));
    const subtotal = Number((unitPrice * qty).toFixed(2));

    totalAmount = Number((totalAmount + subtotal).toFixed(2));
    totalQuantity += qty;

    calculatedItems.push({
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice,
      subtotal,
      currency: product.currency
    });
  }

  return {
    items: calculatedItems,
    totalAmount,
    currency: detectedCurrency,
    itemCount: totalQuantity,
    isValid: errors.length === 0 && calculatedItems.length > 0,
    errors
  };
}

/**
 * Evaluates purchase total against user-defined budget.
 */
export function evaluateBudget(totalAmount: number, userBudget: number) {
  const safeTotal = Math.max(0, Number(totalAmount.toFixed(2)));
  const safeBudget = Math.max(0, Number(userBudget.toFixed(2)));

  const remainingBudget = Number((safeBudget - safeTotal).toFixed(2));
  const withinBudget = safeTotal <= safeBudget;
  const utilizationPct = safeBudget > 0 ? Math.min(100, Math.round((safeTotal / safeBudget) * 100)) : 100;
  const excess = withinBudget ? 0 : Number((safeTotal - safeBudget).toFixed(2));

  return {
    withinBudget,
    totalAmount: safeTotal,
    userBudget: safeBudget,
    remainingBudget,
    utilizationPct,
    excess
  };
}

/**
 * Validates order state transitions to prevent fraud, replay, or skipping payment verification.
 */
export function isValidOrderStateTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus
): boolean {
  if (currentStatus === targetStatus) {
    return true;
  }

  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['AWAITING_PAYMENT', 'CANCELLED'],
    AWAITING_PAYMENT: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
    PAYMENT_FAILED: ['AWAITING_PAYMENT', 'CANCELLED'],
    PAID: [], // Terminal verified state
    CANCELLED: [] // Terminal cancelled state
  };

  const possible = allowedTransitions[currentStatus] || [];
  return possible.includes(targetStatus);
}

/**
 * Checks for client price tampering by comparing client-provided prices to authoritative values.
 */
export function detectPriceTampering(
  clientItems: { productId: string; declaredPrice?: number }[],
  catalog: Product[]
): { tampered: boolean; details: string[] } {
  const catalogMap = new Map(catalog.map((p) => [p.id, p]));
  const details: string[] = [];
  let tampered = false;

  for (const item of clientItems) {
    const product = catalogMap.get(item.productId);
    if (!product) continue;

    if (item.declaredPrice !== undefined && item.declaredPrice !== null) {
      const declared = Number(item.declaredPrice);
      const expected = product.price;
      if (Math.abs(declared - expected) > 0.001) {
        tampered = true;
        details.push(
          `Price mismatch for ${product.name}: client declared $${declared}, catalog is $${expected}`
        );
      }
    }
  }

  return { tampered, details };
}

/**
 * Intelligent Budget Optimizer: Selects optimal product combination within budget limit.
 */
export function optimizeProductsForBudget(
  maxBudget: number,
  products: Product[],
  preferredCategories?: string[]
): {
  selected: Product[];
  totalCost: number;
  remainingBudget: number;
  tradeOffNote: string;
} {
  const activeProducts = products
    .filter((p) => p.active)
    .sort((a, b) => {
      // Prioritize preferred categories, then rating
      const aPreferred = preferredCategories?.includes(a.category) ? 1 : 0;
      const bPreferred = preferredCategories?.includes(b.category) ? 1 : 0;
      if (aPreferred !== bPreferred) return bPreferred - aPreferred;
      return b.rating - a.rating;
    });

  const selected: Product[] = [];
  let currentCost = 0;

  for (const prod of activeProducts) {
    if (currentCost + prod.price <= maxBudget) {
      selected.push(prod);
      currentCost = Number((currentCost + prod.price).toFixed(2));
    }
  }

  const remaining = Number((maxBudget - currentCost).toFixed(2));
  const tradeOffNote =
    selected.length === 0
      ? `No single product fits the strict budget of $${maxBudget}. Consider adjusting the budget ceiling.`
      : `Selected ${selected.length} top-rated tools fitting within $${maxBudget} (leaving $${remaining} reserve).`;

  return {
    selected,
    totalCost: currentCost,
    remainingBudget: remaining,
    tradeOffNote
  };
}
