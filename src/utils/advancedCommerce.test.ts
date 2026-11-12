import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAndValidateInvoice,
  parseNaturalLanguageSearch,
  evaluateApprovalRules,
  reconcileTransactions,
  sanitizeCSVValue,
  generateSafeCSV
} from './advancedCommerce';
import { Transaction, ApprovalRule } from '../types';

test('parseAndValidateInvoice deterministically extracts invoice fields and validates math', () => {
  const invoiceText = `
    Merchant: CloudScale AI
    Invoice #: INV-89201
    Date: 2026-10-12
    Due: 2026-11-12
    Currency: USD

    - GPU Instance Cluster x 1 $150.00
    - Premium Support x 1 $20.00

    Subtotal: $170.00
    Tax: $17.00
    Discount: $10.00
    Total Amount: $177.00
  `;

  const result = parseAndValidateInvoice(invoiceText, []);

  assert.equal(result.parsed.merchantName, 'CloudScale AI');
  assert.equal(result.parsed.invoiceNumber, 'INV-89201');
  assert.equal(result.parsed.currency, 'USD');
  assert.equal(result.parsed.subtotal, 170.0);
  assert.equal(result.parsed.tax, 17.0);
  assert.equal(result.parsed.discount, 10.0);
  assert.equal(result.parsed.totalAmount, 177.0);
  assert.equal(result.calculatedTotal, 177.0);
  assert.equal(result.isDuplicate, false);
  assert.equal(result.discrepancies.length, 0);
  assert.ok(result.confidenceScore >= 90);
});

test('parseAndValidateInvoice flags mathematical inconsistencies when stated total does not match', () => {
  const flawedText = `
    Merchant: ShadyVendor Corp
    Invoice #: INV-999
    Subtotal: $100.00
    Tax: $10.00
    Discount: $0.00
    Total Amount: $150.00
  `;

  const result = parseAndValidateInvoice(flawedText, []);
  assert.equal(result.calculatedTotal, 110.0);
  assert.equal(result.parsed.totalAmount, 150.0);
  assert.ok(result.discrepancies.some(d => d.includes('Amount mismatch')));
  assert.ok(result.confidenceScore < 85);
});

test('parseAndValidateInvoice detects duplicate invoices against existing records', () => {
  const existingInvoices = [
    {
      id: 'inv-101',
      userId: 'user-01',
      invoiceNumber: 'INV-4040',
      merchantName: 'SecureShield',
      issueDate: '2026-10-01',
      currency: 'USD' as const,
      subtotal: 50,
      tax: 0,
      discount: 0,
      totalAmount: 50,
      calculatedTotal: 50,
      items: [],
      status: 'VALIDATED' as const,
      confidenceScore: 100,
      discrepancies: [],
      createdAt: '2026-10-01'
    }
  ];

  const duplicateText = `
    Merchant: SecureShield
    Invoice #: INV-4040
    Subtotal: $50.00
    Total: $50.00
  `;

  const result = parseAndValidateInvoice(duplicateText, existingInvoices);
  assert.equal(result.isDuplicate, true);
  assert.equal(result.duplicateOfId, 'inv-101');
  assert.ok(result.discrepancies.some(d => d.includes('Duplicate invoice suspected')));
});

test('parseNaturalLanguageSearch safely extracts structured filters from user queries', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      orderId: 'ord-1',
      userId: 'u1',
      amount: 150.0,
      currency: 'USD',
      status: 'COMPLETED',
      gateway: 'PAYPAL_SANDBOX',
      paypalOrderId: 'PAYID-1',
      paypalCaptureId: 'CAP-1',
      payerEmail: 'user1@agentpay.ai',
      feeAmount: 4.65,
      netAmount: 145.35,
      createdAt: '2026-10-15T00:00:00.000Z'
    },
    {
      id: 'tx-2',
      orderId: 'ord-2',
      userId: 'u1',
      amount: 25.0,
      currency: 'EUR',
      status: 'FAILED',
      gateway: 'PAYPAL_SANDBOX',
      paypalOrderId: 'PAYID-2',
      paypalCaptureId: 'CAP-2',
      payerEmail: 'user2@agentpay.ai',
      feeAmount: 1.03,
      netAmount: 23.97,
      createdAt: '2026-10-18T00:00:00.000Z'
    },
    {
      id: 'tx-3',
      orderId: 'ord-3',
      userId: 'u1',
      amount: 45.0,
      currency: 'USD',
      status: 'PENDING',
      gateway: 'PAYPAL_SANDBOX',
      paypalOrderId: 'PAYID-3',
      paypalCaptureId: 'CAP-3',
      payerEmail: 'user@secureshield.com',
      feeAmount: 1.61,
      netAmount: 43.39,
      createdAt: '2026-10-20T00:00:00.000Z'
    }
  ];

  // Test amount query
  const res1 = parseNaturalLanguageSearch('Find transactions above $50', mockTransactions);
  assert.equal(res1.parsedParams.minAmount, 50);
  assert.equal(res1.results.length, 1);
  assert.equal(res1.results[0].id, 'tx-1');

  // Test status & currency query
  const res2 = parseNaturalLanguageSearch('Show failed EUR transactions', mockTransactions);
  assert.equal(res2.parsedParams.status, 'FAILED');
  assert.equal(res2.parsedParams.currency, 'EUR');
  assert.equal(res2.results.length, 1);
  assert.equal(res2.results[0].id, 'tx-2');

  // Test merchant keyword search
  const res3 = parseNaturalLanguageSearch('Transactions for secureshield', mockTransactions);
  assert.equal(res3.parsedParams.merchant, 'secureshield');
  assert.equal(res3.results.length, 1);
  assert.equal(res3.results[0].id, 'tx-3');
});

test('evaluateApprovalRules enforces amount thresholds and currency restrictions', () => {
  const sampleRules: ApprovalRule[] = [
    {
      id: 'rule-max-amt',
      userId: 'u1',
      name: 'High Value Threshold',
      description: 'Orders > $100 require approval',
      conditionType: 'AMOUNT_THRESHOLD',
      thresholdValue: 100,
      action: 'REQUIRE_ADMIN_APPROVAL',
      enabled: true,
      createdAt: '2026-01-01'
    },
    {
      id: 'rule-curr',
      userId: 'u1',
      name: 'Allowed Currencies',
      description: 'Only USD allowed',
      conditionType: 'CURRENCY_RESTRICTION',
      allowedCurrencies: ['USD'],
      action: 'BLOCK',
      enabled: true,
      createdAt: '2026-01-01'
    }
  ];

  // Order under threshold in USD -> Approved
  const res1 = evaluateApprovalRules(
    { id: 'o1', totalAmount: 50, currency: 'USD', items: [] },
    sampleRules
  );
  assert.equal(res1.approved, true);
  assert.equal(res1.blocked, false);
  assert.equal(res1.requiresAdditionalReview, false);

  // Order above threshold -> Requires Admin Approval
  const res2 = evaluateApprovalRules(
    { id: 'o2', totalAmount: 150, currency: 'USD', items: [] },
    sampleRules
  );
  assert.equal(res2.approved, false);
  assert.equal(res2.requiresAdditionalReview, true);
  assert.equal(res2.triggeredRules.length, 1);

  // Order in forbidden currency -> Blocked
  const res3 = evaluateApprovalRules(
    { id: 'o3', totalAmount: 50, currency: 'INR', items: [] },
    sampleRules
  );
  assert.equal(res3.approved, false);
  assert.equal(res3.blocked, true);
});

test('reconcileTransactions detects matched, mismatched, and orphan charges', () => {
  const internalTxs: Transaction[] = [
    {
      id: 'tx-match',
      orderId: 'ord-1',
      userId: 'u1',
      amount: 44.0,
      currency: 'USD',
      status: 'COMPLETED',
      gateway: 'PAYPAL_SANDBOX',
      paypalOrderId: 'PAYID-100',
      paypalCaptureId: 'CAP-100',
      payerEmail: 'user@agentpay.ai',
      feeAmount: 1.58,
      netAmount: 42.42,
      createdAt: '2026-10-15'
    },
    {
      id: 'tx-mismatch',
      orderId: 'ord-2',
      userId: 'u1',
      amount: 99.0,
      currency: 'USD',
      status: 'COMPLETED',
      gateway: 'PAYPAL_SANDBOX',
      paypalOrderId: 'PAYID-200',
      paypalCaptureId: 'CAP-200',
      payerEmail: 'user@agentpay.ai',
      feeAmount: 3.17,
      netAmount: 95.83,
      createdAt: '2026-10-15'
    },
    {
      id: 'tx-missing-in-prov',
      orderId: 'ord-3',
      userId: 'u1',
      amount: 15.0,
      currency: 'USD',
      status: 'COMPLETED',
      gateway: 'PAYPAL_SANDBOX',
      paypalOrderId: 'PAYID-300',
      paypalCaptureId: 'CAP-300',
      payerEmail: 'user@agentpay.ai',
      feeAmount: 0.74,
      netAmount: 14.26,
      createdAt: '2026-10-15'
    }
  ];

  const providerRecords = [
    {
      gatewayRefId: 'CAP-100',
      amount: 44.0,
      currency: 'USD' as const,
      status: 'COMPLETED',
      merchantName: 'SecureShield',
      timestamp: '2026-10-15'
    },
    {
      gatewayRefId: 'CAP-200',
      amount: 89.0, // Difference: $10 mismatch
      currency: 'USD' as const,
      status: 'COMPLETED',
      merchantName: 'CloudScale',
      timestamp: '2026-10-15'
    },
    {
      gatewayRefId: 'CAP-999', // Orphan provider record
      amount: 25.0,
      currency: 'USD' as const,
      status: 'COMPLETED',
      merchantName: 'Unknown Vendor',
      timestamp: '2026-10-16'
    }
  ];

  const reconciliation = reconcileTransactions(internalTxs, providerRecords);

  const matched = reconciliation.find(r => r.internalTxId === 'tx-match');
  assert.equal(matched?.discrepancyType, 'MATCHED');
  assert.equal(matched?.resolutionStatus, 'RESOLVED');

  const mismatched = reconciliation.find(r => r.internalTxId === 'tx-mismatch');
  assert.equal(mismatched?.discrepancyType, 'AMOUNT_MISMATCH');
  assert.equal(mismatched?.resolutionStatus, 'UNRESOLVED');

  const missingInProv = reconciliation.find(r => r.internalTxId === 'tx-missing-in-prov');
  assert.equal(missingInProv?.discrepancyType, 'MISSING_IN_PROVIDER');

  const missingInternal = reconciliation.find(r => r.gatewayRefId === 'CAP-999');
  assert.equal(missingInternal?.discrepancyType, 'MISSING_INTERNAL');
});

test('sanitizeCSVValue prevents formula injection (DDE attacks)', () => {
  // Dangerous inputs starting with =, +, -, @
  assert.equal(sanitizeCSVValue('=cmd|"/C calc"!A0'), "\"'=cmd|\"\"/C calc\"\"!A0\"");
  assert.equal(sanitizeCSVValue('+12345'), "\"'\\+12345\"".replace('\\+', '+'));
  assert.equal(sanitizeCSVValue('-99.99'), "\"'\\-99.99\"".replace('\\-', '-'));
  assert.equal(sanitizeCSVValue('@SUM(A1:B1)'), "\"'@SUM(A1:B1)\"");

  // Safe normal inputs
  assert.equal(sanitizeCSVValue('Standard Merchant'), '"Standard Merchant"');
  assert.equal(sanitizeCSVValue(150.5), '"150.5"');

  // Test full CSV generation
  const csv = generateSafeCSV(['Name', 'Amount'], [['=SUM(1,2)', 42]]);
  assert.ok(csv.includes("\"'=SUM(1,2)\""));
});
