export type OrderStatus = 'PENDING' | 'AWAITING_PAYMENT' | 'PAID' | 'PAYMENT_FAILED' | 'CANCELLED';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'AI & Machine Learning' | 'Cloud & DevOps' | 'Security & Auth' | 'Payments & Fintech' | 'Analytics' | 'Developer Tools';
  price: number;
  currency: Currency;
  billingPeriod: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  specs: Record<string, string>;
  rating: number;
  reviewsCount: number;
  availability: 'IN_STOCK' | 'LOW_STOCK' | 'PRE_ORDER';
  image: string;
  active: boolean;
  isPopular?: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  currency: Currency;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  currency: Currency;
  itemCount: number;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  totalAmount: number;
  currency: Currency;
  status: OrderStatus;
  userApproved: boolean;
  approvedAt?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paypalPayerEmail?: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    agentTaskId?: string;
    promptGoal?: string;
  };
}

export interface Transaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: Currency;
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  gateway: 'PAYPAL_SANDBOX';
  paypalOrderId: string;
  paypalCaptureId: string;
  payerEmail: string;
  feeAmount: number;
  netAmount: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'founder' | 'buyer' | 'admin';
  monthlyBudget: number;
  currency: Currency;
  categoriesOfInterest: string[];
  createdAt: string;
}

export type WorkflowStage = 
  | 'idle'
  | 'analyzing_intent'
  | 'searching_catalog'
  | 'comparing_options'
  | 'optimizing_budget'
  | 'preparing_recommendation'
  | 'awaiting_approval'
  | 'initiating_paypal'
  | 'verifying_payment'
  | 'order_confirmed'
  | 'failed';

export interface WorkflowStep {
  id: string;
  name: string;
  stage: WorkflowStage;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'waiting_approval';
  description: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface RecommendationItem {
  product: Product;
  reason: string;
  fitScore: number;
  tradeOff?: string;
  selectedQuantity: number;
}

export interface AgentRecommendation {
  summary: string;
  goalIdentified: string;
  allocatedBudget: number;
  currency: Currency;
  totalCost: number;
  remainingBudget: number;
  withinBudget: boolean;
  recommendedProducts: RecommendationItem[];
  missingInformationPrompt?: string;
  suggestedAction: 'approve_purchase' | 'clarify_requirements' | 'adjust_budget';
  approvalToken?: string;
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  workflowStage?: WorkflowStage;
  recommendation?: AgentRecommendation;
  toolInvocations?: {
    toolName: string;
    arguments: Record<string, any>;
    resultSummary: string;
  }[];
  requiresUserApproval?: boolean;
}

export interface AnalyticsSummary {
  totalSpend: number;
  monthlyBudget: number;
  budgetUtilizationPct: number;
  totalOrders: number;
  successfulPayments: number;
  pendingOrders: number;
  recentOrders: Order[];
  recentTransactions: Transaction[];
  spendByCategory: { category: string; amount: number; count: number }[];
  monthlySpendingTrend: { month: string; amount: number }[];
}

export interface Subscription {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  plan: 'monthly' | 'annual';
  amount: number;
  currency: Currency;
  status: 'ACTIVE' | 'CANCELLED' | 'PAUSED';
  nextBillingDate: string;
  autoRenew: boolean;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  eventType: 'PAYMENT.CAPTURE.COMPLETED' | 'PAYMENT.CAPTURE.DENIED' | 'CHECKOUT.ORDER.APPROVED' | 'BILLING.SUBSCRIPTION.CANCELLED';
  resourceType: 'capture' | 'order' | 'subscription';
  summary: string;
  payload: Record<string, any>;
  verified: boolean;
  createdAt: string;
}

export interface AiSpendingInsight {
  id: string;
  title: string;
  type: 'optimization' | 'overlap' | 'budget_health' | 'annual_discount';
  severity: 'high' | 'medium' | 'info';
  potentialSavings: number;
  description: string;
  actionLabel?: string;
}

// Module 1: Intelligent Invoice & Receipt Analyzer
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceDocument {
  id: string;
  userId: string;
  invoiceNumber: string;
  merchantName: string;
  issueDate: string;
  dueDate?: string;
  currency: Currency;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  calculatedTotal: number;
  items: InvoiceItem[];
  status: 'VALIDATED' | 'DISCREPANCY_FLAGGED' | 'DUPLICATE_SUSPECTED' | 'DRAFT' | 'PAID';
  confidenceScore: number;
  discrepancies: string[];
  rawTextSnippet?: string;
  fileName?: string;
  isDuplicate?: boolean;
  duplicateOfId?: string;
  createdAt: string;
}

// Module 2: Natural-Language Transaction Search
export interface NaturalLanguageFilterParams {
  minAmount?: number;
  maxAmount?: number;
  currency?: Currency;
  status?: string;
  merchant?: string;
  dateFrom?: string;
  dateTo?: string;
  mismatchOnly?: boolean;
}

export interface NaturalLanguageSearchResult {
  query: string;
  parsedParams: NaturalLanguageFilterParams;
  matchedCount: number;
  explanation: string;
  isAmbiguous: boolean;
  suggestions?: string[];
  results: Transaction[];
}

// Module 3: Payment Calendar and Reminder Center
export type ReminderCategory = 'RECURRING_BILL' | 'INVOICE_DUE' | 'REFUND_FOLLOWUP' | 'CUSTOM_DEADLINE';
export type ReminderStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'DISMISSED';

export interface PaymentReminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  amount?: number;
  currency?: Currency;
  dueDate: string;
  category: ReminderCategory;
  status: ReminderStatus;
  relatedOrderId?: string;
  relatedInvoiceId?: string;
  isRecurring?: boolean;
  frequency?: 'MONTHLY' | 'ANNUAL' | 'ONCE';
  createdAt: string;
}

// Module 4: User-Defined Payment Approval Rules
export type ApprovalRuleCondition = 'AMOUNT_THRESHOLD' | 'CURRENCY_RESTRICTION' | 'MERCHANT_CHECK' | 'VELOCITY_LIMIT';
export type ApprovalRuleAction = 'BLOCK' | 'REQUIRE_ADMIN_APPROVAL' | 'ALLOW_WITH_AUDIT';

export interface ApprovalRule {
  id: string;
  userId: string;
  name: string;
  description: string;
  conditionType: ApprovalRuleCondition;
  thresholdValue?: number;
  allowedCurrencies?: Currency[];
  restrictedMerchants?: string[];
  action: ApprovalRuleAction;
  enabled: boolean;
  createdAt: string;
}

export interface ApprovalEvaluationResult {
  approved: boolean;
  blocked: boolean;
  requiresAdditionalReview: boolean;
  triggeredRules: {
    ruleId: string;
    ruleName: string;
    reason: string;
    action: ApprovalRuleAction;
  }[];
}

// Module 5 & 6: Transaction Reconciliation Engine
export type ReconciliationDiscrepancyType =
  | 'MATCHED'
  | 'AMOUNT_MISMATCH'
  | 'MISSING_IN_PROVIDER'
  | 'MISSING_INTERNAL'
  | 'STATUS_MISMATCH';

export type ReconciliationResolutionStatus =
  | 'UNRESOLVED'
  | 'RESOLVED'
  | 'INVESTIGATING'
  | 'FORCE_ACCEPTED';

export interface ReconciliationAuditNote {
  author: string;
  note: string;
  timestamp: string;
}

export interface ReconciliationRecord {
  id: string;
  internalTxId?: string;
  gatewayRefId: string;
  merchantName: string;
  internalAmount?: number;
  gatewayAmount: number;
  currency: Currency;
  internalStatus?: string;
  gatewayStatus: string;
  discrepancyType: ReconciliationDiscrepancyType;
  resolutionStatus: ReconciliationResolutionStatus;
  auditNotes: ReconciliationAuditNote[];
  createdAt: string;
}

// Module 9: Simulation Lab Scenarios
export interface SimulationStep {
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  details?: string;
  payload?: any;
}

export interface SimulationScenario {
  id: string;
  title: string;
  category: 'HAPPY_PATH' | 'GATEWAY_ERROR' | 'SECURITY_TAMPERING' | 'RECONCILIATION_AUDIT';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  steps: SimulationStep[];
  status: 'idle' | 'running' | 'success' | 'failed';
  resultMessage?: string;
}


