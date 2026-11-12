import {
  Currency,
  InvoiceDocument,
  InvoiceItem,
  NaturalLanguageFilterParams,
  NaturalLanguageSearchResult,
  Transaction,
  Order,
  ApprovalRule,
  ApprovalEvaluationResult,
  ReconciliationRecord,
  ReconciliationDiscrepancyType
} from '../types';

/**
 * Deterministic Invoice Text Parsing & Mathematical Validation.
 * Operates without external paid API keys.
 */
export function parseAndValidateInvoice(
  rawText: string,
  existingInvoices: InvoiceDocument[] = []
): {
  parsed: Partial<InvoiceDocument>;
  calculatedTotal: number;
  confidenceScore: number;
  discrepancies: string[];
  isDuplicate: boolean;
  duplicateOfId?: string;
} {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const discrepancies: string[] = [];
  let confidenceScore = 100;

  // 1. Detect Merchant Name
  let merchantName = 'Unknown Merchant';
  const merchantLine = lines.find(l => /^(merchant|vendor|from|seller|billed by):/i.test(l));
  if (merchantLine) {
    merchantName = merchantLine.replace(/^(merchant|vendor|from|seller|billed by):/i, '').trim();
  } else if (lines.length > 0 && !lines[0].toLowerCase().includes('invoice')) {
    merchantName = lines[0].replace(/^[#*-]\s*/, '').trim();
  } else {
    confidenceScore -= 15;
    discrepancies.push('Merchant name could not be reliably extracted');
  }

  // 2. Detect Invoice Number
  let invoiceNumber = '';
  const invMatch = rawText.match(/(?:invoice\s*(?:#|no|number)?[:.\s]*|inv[:#\s]*)(\b[A-Z0-9-_]{3,20}\b)/i);
  if (invMatch) {
    invoiceNumber = invMatch[1].trim();
  } else {
    invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    confidenceScore -= 15;
    discrepancies.push('Invoice number missing; generated temporary reference');
  }

  // 3. Detect Currency
  let currency: Currency = 'USD';
  if (/€|EUR/i.test(rawText)) currency = 'EUR';
  else if (/£|GBP/i.test(rawText)) currency = 'GBP';
  else if (/₹|INR/i.test(rawText)) currency = 'INR';
  else if (/\$|USD/i.test(rawText)) currency = 'USD';

  // 4. Helper to extract amounts
  const extractAmount = (pattern: RegExp): number | null => {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      const num = parseFloat(match[1].replace(/,/g, ''));
      return isNaN(num) ? null : num;
    }
    return null;
  };

  const subtotal = extractAmount(/(?:subtotal|sub-total|net amount)[:\s]*[$€£₹]?\s*([0-9,]+(?:\.[0-9]{2})?)/i) || 0;
  const tax = extractAmount(/(?:tax|vat|gst|sales tax)[:\s]*[$€£₹]?\s*([0-9,]+(?:\.[0-9]{2})?)/i) || 0;
  const discount = extractAmount(/(?:discount|savings|promo)[:\s]*[$€£₹]?\s*([0-9,]+(?:\.[0-9]{2})?)/i) || 0;
  const statedTotal = extractAmount(/(?:(?<!sub)total amount|grand total|amount due|final amount|(?<!sub)total)[:\s]*[$€£₹]?\s*([0-9,]+(?:\.[0-9]{2})?)/i);


  // 5. Parse Line Items if present
  const items: InvoiceItem[] = [];
  const itemRegex = /(?:^|\n)(?:[-*•]\s*)?([A-Za-z0-9\s&()\-]{3,40})\s+(?:x\s*(\d+)|\((\d+)\))\s+[$€£₹]?([0-9,]+(?:\.[0-9]{2})?)/gi;
  let match: RegExpExecArray | null;
  let itemIndex = 1;
  while ((match = itemRegex.exec(rawText)) !== null) {
    const desc = match[1].trim();
    const qty = parseInt(match[2] || match[3] || '1', 10);
    const unitPrice = parseFloat(match[4].replace(/,/g, ''));
    if (!isNaN(unitPrice)) {
      items.push({
        id: `item-${itemIndex++}`,
        description: desc,
        quantity: qty,
        unitPrice,
        total: Number((qty * unitPrice).toFixed(2))
      });
    }
  }

  // 6. Deterministic Mathematical Verification
  let effectiveSubtotal = subtotal;
  if (items.length > 0 && subtotal === 0) {
    effectiveSubtotal = items.reduce((acc, it) => acc + it.total, 0);
  }

  const calculatedTotal = Number((effectiveSubtotal + tax - discount).toFixed(2));
  const finalTotal = statedTotal !== null ? statedTotal : calculatedTotal;

  if (statedTotal !== null) {
    const diff = Math.abs(calculatedTotal - statedTotal);
    if (diff > 0.05 && effectiveSubtotal > 0) {
      confidenceScore -= 25;
      discrepancies.push(
        `Amount mismatch: Stated total (${currency} ${statedTotal.toFixed(2)}) != Subtotal (${effectiveSubtotal.toFixed(2)}) + Tax (${tax.toFixed(2)}) - Discount (${discount.toFixed(2)}) = ${currency} ${calculatedTotal.toFixed(2)}`
      );
    }
  }

  // 7. Duplicate Detection against existing invoices
  let isDuplicate = false;
  let duplicateOfId: string | undefined;

  for (const existing of existingInvoices) {
    const isSameInvoiceNumber =
      invoiceNumber &&
      existing.invoiceNumber.toLowerCase() === invoiceNumber.toLowerCase() &&
      existing.merchantName.toLowerCase() === merchantName.toLowerCase();

    const isSameAmountAndMerchant =
      existing.merchantName.toLowerCase() === merchantName.toLowerCase() &&
      Math.abs(existing.totalAmount - finalTotal) < 0.01;

    if (isSameInvoiceNumber || isSameAmountAndMerchant) {
      isDuplicate = true;
      duplicateOfId = existing.id;
      confidenceScore -= 20;
      discrepancies.push(
        `Duplicate invoice suspected: Matches existing invoice #${existing.invoiceNumber} (${existing.merchantName} - ${existing.currency} ${existing.totalAmount})`
      );
      break;
    }
  }

  // Extract dates
  const dateMatch = rawText.match(/(?:date|issued|billed)[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
  const issueDate = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString();

  const dueDateMatch = rawText.match(/(?:due date|payment due|due)[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
  const dueDate = dueDateMatch ? new Date(dueDateMatch[1]).toISOString() : undefined;

  return {
    parsed: {
      merchantName,
      invoiceNumber,
      currency,
      subtotal: Number(effectiveSubtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      totalAmount: Number(finalTotal.toFixed(2)),
      issueDate,
      dueDate,
      items
    },
    calculatedTotal,
    confidenceScore: Math.max(10, Math.min(100, confidenceScore)),
    discrepancies,
    isDuplicate,
    duplicateOfId
  };
}

/**
 * Deterministic Natural-Language Transaction Search.
 * Safely parses queries into structured filter parameters without unsanitized execution.
 */
export function parseNaturalLanguageSearch(
  query: string,
  transactions: Transaction[]
): NaturalLanguageSearchResult {
  const q = query.trim().toLowerCase();
  const parsedParams: NaturalLanguageFilterParams = {};
  const filterDescriptions: string[] = [];
  const suggestions: string[] = [];

  if (!q) {
    return {
      query: '',
      parsedParams: {},
      matchedCount: transactions.length,
      explanation: 'Showing all transactions (no active search filters).',
      isAmbiguous: false,
      suggestions: [
        'Show my failed payments',
        'Find transactions above $50',
        'Show USD transactions',
        'Transactions to SecureShield'
      ],
      results: transactions
    };
  }

  // 1. Currency Filter
  if (/\b(usd|\$|dollar|dollars)\b/i.test(q)) {
    parsedParams.currency = 'USD';
    filterDescriptions.push('Currency is USD');
  } else if (/\b(eur|€|euro|euros)\b/i.test(q)) {
    parsedParams.currency = 'EUR';
    filterDescriptions.push('Currency is EUR');
  } else if (/\b(gbp|£|pound|pounds)\b/i.test(q)) {
    parsedParams.currency = 'GBP';
    filterDescriptions.push('Currency is GBP');
  } else if (/\b(inr|₹|rupee|rupees)\b/i.test(q)) {
    parsedParams.currency = 'INR';
    filterDescriptions.push('Currency is INR');
  }

  // 2. Status Filter
  if (/\b(failed|denied|declined|error)\b/i.test(q)) {
    parsedParams.status = 'FAILED';
    filterDescriptions.push('Status is FAILED');
  } else if (/\b(pending|in progress|processing)\b/i.test(q)) {
    parsedParams.status = 'PENDING';
    filterDescriptions.push('Status is PENDING');
  } else if (/\b(completed|successful|paid|success)\b/i.test(q)) {
    parsedParams.status = 'COMPLETED';
    filterDescriptions.push('Status is COMPLETED');
  } else if (/\b(refunded|refund|reversed)\b/i.test(q)) {
    parsedParams.status = 'REFUNDED';
    filterDescriptions.push('Status is REFUNDED');
  }

  // 3. Amount Filter (Above / Over / > / Greater than / Below / Under / < / Less than / Between)
  const betweenMatch = q.match(/(?:between)\s+[$€£₹]?\s*([0-9.]+)\s+(?:and|to)\s+[$€£₹]?\s*([0-9.]+)/i);
  if (betweenMatch) {
    parsedParams.minAmount = parseFloat(betweenMatch[1]);
    parsedParams.maxAmount = parseFloat(betweenMatch[2]);
    filterDescriptions.push(`Amount between ${parsedParams.minAmount} and ${parsedParams.maxAmount}`);
  } else {
    const aboveMatch = q.match(/(?:above|over|greater than|more than|>|at least)\s+[$€£₹]?\s*([0-9,.]+)/i);
    if (aboveMatch) {
      parsedParams.minAmount = parseFloat(aboveMatch[1].replace(/,/g, ''));
      filterDescriptions.push(`Amount ≥ ${parsedParams.minAmount}`);
    }

    const belowMatch = q.match(/(?:below|under|less than|<|up to|at most)\s+[$€£₹]?\s*([0-9,.]+)/i);
    if (belowMatch) {
      parsedParams.maxAmount = parseFloat(belowMatch[1].replace(/,/g, ''));
      filterDescriptions.push(`Amount ≤ ${parsedParams.maxAmount}`);
    }
  }

  // 4. Merchant / Keyword search
  const knownKeywords = [
    'secureshield', 'edgedns', 'cloudscale', 'vectorflow', 'devguard',
    'synthvoice', 'quantumcache', 'logpulse', 'codegate', 'modelbench',
    'paypal', 'stripe', 'sandbox'
  ];
  for (const kw of knownKeywords) {
    if (q.includes(kw)) {
      parsedParams.merchant = kw;
      filterDescriptions.push(`Merchant/Keyword matches "${kw}"`);
      break;
    }
  }

  // 5. Date Filter (Last month, recent, this year)
  const now = new Date();
  if (/\b(last month)\b/i.test(q)) {
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    parsedParams.dateFrom = firstDayLastMonth.toISOString();
    parsedParams.dateTo = lastDayLastMonth.toISOString();
    filterDescriptions.push('Date range: Last month');
  } else if (/\b(this month)\b/i.test(q)) {
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    parsedParams.dateFrom = firstDayThisMonth.toISOString();
    filterDescriptions.push('Date range: This month');
  }

  // 6. Discrepancy / Mismatch Filter
  if (/\b(mismatch|discrepancy|suspicious|flagged)\b/i.test(q)) {
    parsedParams.mismatchOnly = true;
    filterDescriptions.push('Filtered to transactions with fee/amount discrepancies');
  }

  // Execute safe deterministic filtering
  const results = transactions.filter(tx => {
    if (parsedParams.currency && tx.currency !== parsedParams.currency) return false;
    if (parsedParams.status && tx.status !== parsedParams.status) return false;
    if (parsedParams.minAmount !== undefined && tx.amount < parsedParams.minAmount) return false;
    if (parsedParams.maxAmount !== undefined && tx.amount > parsedParams.maxAmount) return false;
    if (parsedParams.dateFrom && new Date(tx.createdAt) < new Date(parsedParams.dateFrom)) return false;
    if (parsedParams.dateTo && new Date(tx.createdAt) > new Date(parsedParams.dateTo)) return false;
    if (parsedParams.merchant) {
      const txText = `${tx.id} ${tx.orderId} ${tx.payerEmail || ''} ${tx.gateway} ${tx.paypalOrderId || ''}`.toLowerCase();
      if (!txText.includes(parsedParams.merchant.toLowerCase())) return false;
    }
    if (parsedParams.mismatchOnly) {
      if (!tx.feeAmount || tx.feeAmount === 0) return false;
    }
    return true;
  });

  const isAmbiguous = filterDescriptions.length === 0;
  if (isAmbiguous) {
    suggestions.push(
      'Try: "Show my failed payments"',
      'Try: "Transactions above $50"',
      'Try: "Show USD transactions"'
    );
  }

  const explanation = isAmbiguous
    ? `No specific financial filters detected in "${query}". Showing all ${transactions.length} records.`
    : `Applied ${filterDescriptions.length} structured filter(s): ${filterDescriptions.join(' • ')}`;

  return {
    query,
    parsedParams,
    matchedCount: results.length,
    explanation,
    isAmbiguous,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    results
  };
}

/**
 * User-Defined Payment Approval Rules Engine.
 * Evaluates authorization guards before order execution.
 */
export function evaluateApprovalRules(
  order: Pick<Order, 'id' | 'totalAmount' | 'currency' | 'items'>,
  rules: ApprovalRule[]
): ApprovalEvaluationResult {
  const triggeredRules: ApprovalEvaluationResult['triggeredRules'] = [];
  let blocked = false;
  let requiresAdditionalReview = false;

  const activeRules = rules.filter(r => r.enabled);

  for (const rule of activeRules) {
    let triggered = false;
    let reason = '';

    switch (rule.conditionType) {
      case 'AMOUNT_THRESHOLD':
        if (rule.thresholdValue !== undefined && order.totalAmount > rule.thresholdValue) {
          triggered = true;
          reason = `Order total (${order.currency} ${order.totalAmount}) exceeds maximum single-transaction threshold of ${order.currency} ${rule.thresholdValue}`;
        }
        break;

      case 'CURRENCY_RESTRICTION':
        if (rule.allowedCurrencies && !rule.allowedCurrencies.includes(order.currency)) {
          triggered = true;
          reason = `Currency ${order.currency} is not in the allowed list: [${rule.allowedCurrencies.join(', ')}]`;
        }
        break;

      case 'MERCHANT_CHECK':
        if (rule.restrictedMerchants && rule.restrictedMerchants.length > 0) {
          const matchedItem = order.items.find(item =>
            rule.restrictedMerchants!.some(rm =>
              item.productName.toLowerCase().includes(rm.toLowerCase())
            )
          );
          if (matchedItem) {
            triggered = true;
            reason = `Item "${matchedItem.productName}" matches restricted vendor restriction: [${rule.restrictedMerchants.join(', ')}]`;
          }
        }
        break;

      case 'VELOCITY_LIMIT':
        // Evaluates high-velocity order spikes
        if (rule.thresholdValue !== undefined && order.items.length > rule.thresholdValue) {
          triggered = true;
          reason = `Cart item count (${order.items.length}) exceeds velocity policy limit of ${rule.thresholdValue}`;
        }
        break;
    }

    if (triggered) {
      triggeredRules.push({
        ruleId: rule.id,
        ruleName: rule.name,
        reason,
        action: rule.action
      });

      if (rule.action === 'BLOCK') {
        blocked = true;
      } else if (rule.action === 'REQUIRE_ADMIN_APPROVAL') {
        requiresAdditionalReview = true;
      }
    }
  }

  return {
    approved: !blocked && !requiresAdditionalReview,
    blocked,
    requiresAdditionalReview,
    triggeredRules
  };
}

/**
 * Transaction Reconciliation Engine.
 * Matches internal ledger against external provider statements with mismatch classification.
 */
export function reconcileTransactions(
  internalTransactions: Transaction[],
  providerRecords: {
    gatewayRefId: string;
    amount: number;
    currency: Currency;
    status: string;
    merchantName: string;
    timestamp: string;
  }[]
): ReconciliationRecord[] {
  const records: ReconciliationRecord[] = [];
  const matchedProviderRefs = new Set<string>();

  // Compare internal txs against provider
  for (const tx of internalTransactions) {
    const ref = tx.paypalCaptureId || tx.paypalOrderId || tx.id;
    const providerMatch = providerRecords.find(p => p.gatewayRefId === ref);

    if (providerMatch) {
      matchedProviderRefs.add(providerMatch.gatewayRefId);
      const isAmountMatch = Math.abs(tx.amount - providerMatch.amount) < 0.01;
      const isCurrencyMatch = tx.currency === providerMatch.currency;
      const isStatusMatch =
        (tx.status === 'COMPLETED' && providerMatch.status === 'COMPLETED') ||
        (tx.status === 'FAILED' && providerMatch.status === 'DENIED');

      let discrepancyType: ReconciliationDiscrepancyType = 'MATCHED';
      if (!isAmountMatch || !isCurrencyMatch) {
        discrepancyType = 'AMOUNT_MISMATCH';
      } else if (!isStatusMatch) {
        discrepancyType = 'STATUS_MISMATCH';
      }

      records.push({
        id: `rec-${tx.id}`,
        internalTxId: tx.id,
        gatewayRefId: providerMatch.gatewayRefId,
        merchantName: providerMatch.merchantName,
        internalAmount: tx.amount,
        gatewayAmount: providerMatch.amount,
        currency: tx.currency,
        internalStatus: tx.status,
        gatewayStatus: providerMatch.status,
        discrepancyType,
        resolutionStatus: discrepancyType === 'MATCHED' ? 'RESOLVED' : 'UNRESOLVED',
        auditNotes: [
          {
            author: 'Reconciliation Engine',
            note: discrepancyType === 'MATCHED'
              ? 'Exact ledger and gateway statement match confirmed.'
              : `Discrepancy detected: ${discrepancyType}. Requires accounting review.`,
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: tx.createdAt
      });
    } else {
      // Missing in provider
      records.push({
        id: `rec-missing-prov-${tx.id}`,
        internalTxId: tx.id,
        gatewayRefId: ref,
        merchantName: 'Unknown Provider',
        internalAmount: tx.amount,
        gatewayAmount: 0,
        currency: tx.currency,
        internalStatus: tx.status,
        gatewayStatus: 'NOT_FOUND',
        discrepancyType: 'MISSING_IN_PROVIDER',
        resolutionStatus: 'UNRESOLVED',
        auditNotes: [
          {
            author: 'Reconciliation Engine',
            note: 'Internal transaction exists in database but was not reported in gateway settlement statement.',
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: tx.createdAt
      });
    }
  }

  // Check for orphan provider records (charged on gateway, missing in internal database)
  for (const prov of providerRecords) {
    if (!matchedProviderRefs.has(prov.gatewayRefId)) {
      records.push({
        id: `rec-orphan-prov-${prov.gatewayRefId}`,
        gatewayRefId: prov.gatewayRefId,
        merchantName: prov.merchantName,
        internalAmount: 0,
        gatewayAmount: prov.amount,
        currency: prov.currency,
        internalStatus: 'NOT_FOUND',
        gatewayStatus: prov.status,
        discrepancyType: 'MISSING_INTERNAL',
        resolutionStatus: 'UNRESOLVED',
        auditNotes: [
          {
            author: 'Reconciliation Engine',
            note: 'Provider statement contains captured charge with no corresponding internal order in database.',
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: prov.timestamp
      });
    }
  }

  return records;
}

/**
 * Formula Injection Mitigation for Financial CSV Exports.
 * Prevents CSV / DDE injection vulnerabilities in spreadsheet applications.
 * Characters =, +, -, @, tab, newline at start of field are sanitized by prepending a single quote.
 */
export function sanitizeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);

  // If starts with active formula execution triggers, neutralize it
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape internal double quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Safe CSV Generator with Formula-Injection Mitigation
 */
export function generateSafeCSV(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): string {
  const headerLine = headers.map(h => sanitizeCSVValue(h)).join(',');
  const rowLines = rows.map(r => r.map(c => sanitizeCSVValue(c)).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}
