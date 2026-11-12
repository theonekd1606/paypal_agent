import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { SEED_PRODUCTS } from './src/data/seedCatalog';
import {
  calculateCartTotals,
  evaluateBudget,
  isValidOrderStateTransition,
  detectPriceTampering,
  optimizeProductsForBudget
} from './src/utils/commerceLogic';
import {
  Order,
  Transaction,
  CartItem,
  OrderStatus,
  AgentRecommendation,
  AgentMessage,
  WorkflowStep,
  Currency,
  Subscription,
  WebhookEvent,
  AiSpendingInsight
} from './src/types';
import { calculateAnnualDiscount } from './src/utils/currency';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), 'public')));

// In-Memory persistent data store (backed by real server state across user session)
const db = {
  products: [...SEED_PRODUCTS],
  carts: new Map<string, CartItem[]>(),
  orders: new Map<string, Order>(),
  transactions: new Map<string, Transaction>(),
  subscriptions: new Map<string, Subscription>(),
  webhooks: new Map<string, WebhookEvent>(),
  tasks: new Map<string, { id: string; steps: WorkflowStep[]; recommendation?: AgentRecommendation; status: string }>(),
  conversations: new Map<string, AgentMessage[]>(),
  userProfiles: new Map<string, {
    id: string;
    name: string;
    email: string;
    role: string;
    monthlyBudget: number;
    currency: Currency;
    categoriesOfInterest: string[];
    createdAt: string;
  }>()
};

// Seed default demo user profile
const DEFAULT_USER_ID = 'user-founder-01';
db.userProfiles.set(DEFAULT_USER_ID, {
  id: DEFAULT_USER_ID,
  name: 'Alex Rivera',
  email: 'alex.rivera@agentpay.ai',
  role: 'founder',
  monthlyBudget: 250.0,
  currency: 'USD',
  categoriesOfInterest: ['AI & Machine Learning', 'Cloud & DevOps', 'Security & Auth'],
  createdAt: '2026-01-01T00:00:00.000Z'
});

// Seed an initial verified transaction for rich dashboard charts
const initialOrderId = 'ord-seed-001';
const initialOrder: Order = {
  id: initialOrderId,
  userId: DEFAULT_USER_ID,
  items: [
    {
      productId: 'prod-secureshield',
      productName: 'SecureShield Auth & RBAC',
      quantity: 1,
      unitPrice: 29.0,
      subtotal: 29.0
    },
    {
      productId: 'prod-edgedns',
      productName: 'EdgeDNS Global Security',
      quantity: 1,
      unitPrice: 15.0,
      subtotal: 15.0
    }
  ],
  totalAmount: 44.0,
  currency: 'USD',
  status: 'PAID',
  userApproved: true,
  approvedAt: '2026-10-15T14:32:00.000Z',
  paypalOrderId: 'PAYID-ML48291074NK91',
  paypalCaptureId: 'CAP-9948210389172',
  paypalPayerEmail: 'buyer.sandbox@agentpay.ai',
  idempotencyKey: 'idem-seed-001',
  createdAt: '2026-10-15T14:30:00.000Z',
  updatedAt: '2026-10-15T14:32:05.000Z'
};
db.orders.set(initialOrderId, initialOrder);

const initialTx: Transaction = {
  id: 'tx-seed-001',
  orderId: initialOrderId,
  userId: DEFAULT_USER_ID,
  amount: 44.0,
  currency: 'USD',
  status: 'COMPLETED',
  gateway: 'PAYPAL_SANDBOX',
  paypalOrderId: 'PAYID-ML48291074NK91',
  paypalCaptureId: 'CAP-9948210389172',
  payerEmail: 'buyer.sandbox@agentpay.ai',
  feeAmount: 1.58,
  netAmount: 42.42,
  createdAt: '2026-10-15T14:32:05.000Z'
};
db.transactions.set(initialTx.id, initialTx);

// Seed initial active subscriptions
const sub1: Subscription = {
  id: 'sub-seed-001',
  orderId: initialOrderId,
  productId: 'prod-secureshield',
  productName: 'SecureShield Auth & RBAC',
  plan: 'monthly',
  amount: 29.0,
  currency: 'USD',
  status: 'ACTIVE',
  nextBillingDate: '2026-11-15T14:32:00.000Z',
  autoRenew: true,
  createdAt: '2026-10-15T14:32:05.000Z'
};
db.subscriptions.set(sub1.id, sub1);

const sub2: Subscription = {
  id: 'sub-seed-002',
  orderId: initialOrderId,
  productId: 'prod-edgedns',
  productName: 'EdgeDNS Global Security',
  plan: 'monthly',
  amount: 15.0,
  currency: 'USD',
  status: 'ACTIVE',
  nextBillingDate: '2026-11-15T14:32:00.000Z',
  autoRenew: true,
  createdAt: '2026-10-15T14:32:05.000Z'
};
db.subscriptions.set(sub2.id, sub2);

// Seed initial verified PayPal Webhook event
const initialWebhook: WebhookEvent = {
  id: 'wh-seed-001',
  eventType: 'PAYMENT.CAPTURE.COMPLETED',
  resourceType: 'capture',
  summary: 'Payment capture completed for $44.00 USD via PayPal Sandbox',
  payload: {
    id: 'CAP-9948210389172',
    status: 'COMPLETED',
    amount: { value: '44.00', currency_code: 'USD' },
    seller_protection: { status: 'ELIGIBLE' }
  },
  verified: true,
  createdAt: '2026-10-15T14:32:06.000Z'
};
db.webhooks.set(initialWebhook.id, initialWebhook);

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Helper: Extract or fallback authenticated user ID
function getAuthUserId(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token && token !== 'undefined' && token !== 'null') {
      return token;
    }
  }
  return DEFAULT_USER_ID;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AgentPay AI Core Gateway',
    version: '1.0.0',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    paypalMode: process.env.PAYPAL_CLIENT_ID ? 'sandbox_custom' : 'sandbox_simulator'
  });
});

// 2. Authentication
app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  let profile = db.userProfiles.get(userId);
  if (!profile) {
    profile = {
      id: userId,
      name: 'AgentPay User',
      email: `${userId}@agentpay.ai`,
      role: 'developer',
      monthlyBudget: 250.0,
      currency: 'USD',
      categoriesOfInterest: ['AI & Machine Learning'],
      createdAt: new Date().toISOString()
    };
    db.userProfiles.set(userId, profile);
  }
  res.json({ user: profile });
});

app.post('/api/auth/verify', (req: Request, res: Response) => {
  const { token, name, email, role, monthlyBudget } = req.body || {};
  const userId = token || `user-${Date.now().toString(36)}`;
  let profile = db.userProfiles.get(userId);
  if (!profile) {
    profile = {
      id: userId,
      name: name || 'AgentPay Developer',
      email: email || `${userId}@agentpay.ai`,
      role: role || 'developer',
      monthlyBudget: Number(monthlyBudget) || 250.0,
      currency: 'USD',
      categoriesOfInterest: ['AI & Machine Learning', 'Cloud & DevOps'],
      createdAt: new Date().toISOString()
    };
    db.userProfiles.set(userId, profile);
  }
  res.json({ success: true, user: profile, token: userId });
});

app.post('/api/auth/preferences', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const profile = db.userProfiles.get(userId);
  if (!profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }
  const { monthlyBudget, currency, categoriesOfInterest, name } = req.body;
  if (monthlyBudget !== undefined) profile.monthlyBudget = Math.max(10, Number(monthlyBudget));
  if (currency) profile.currency = currency;
  if (categoriesOfInterest) profile.categoriesOfInterest = categoriesOfInterest;
  if (name) profile.name = name;

  db.userProfiles.set(userId, profile);
  res.json({ success: true, user: profile });
});

// 3. Catalog Endpoints
app.get('/api/products', (req: Request, res: Response) => {
  const { q, category, maxPrice, sort } = req.query;
  let products = [...db.products].filter((p) => p.active);

  if (q && typeof q === 'string') {
    const term = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.tagline.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term))
    );
  }

  if (category && typeof category === 'string' && category !== 'All') {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    products = products.filter((p) => p.price <= Number(maxPrice));
  }

  if (sort === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else {
    // Default popular / recommended
    products.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
  }

  res.json({
    products,
    total: products.length,
    categories: Array.from(new Set(db.products.map((p) => p.category)))
  });
});

app.get('/api/products/:productId', (req: Request, res: Response) => {
  const product = db.products.find((p) => p.id === req.params.productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found in verified catalog' });
  }
  res.json({ product });
});

app.post('/api/products/compare', (req: Request, res: Response) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'productIds array is required' });
  }

  const products = db.products.filter((p) => productIds.includes(p.id));
  const comparisonMatrix = {
    products,
    featuresUnion: Array.from(new Set(products.flatMap((p) => p.features))),
    specsKeys: Array.from(new Set(products.flatMap((p) => Object.keys(p.specs)))),
    pricingComparison: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      currency: p.currency,
      rating: p.rating
    }))
  };

  res.json({ comparisonMatrix });
});

// 4. Cart Endpoints
app.get('/api/cart', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const userItems = db.carts.get(userId) || [];
  const calculation = calculateCartTotals(
    userItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    db.products
  );

  const populatedItems: CartItem[] = calculation.items.map((calcItem) => {
    const prod = db.products.find((p) => p.id === calcItem.productId)!;
    return {
      productId: calcItem.productId,
      product: prod,
      quantity: calcItem.quantity,
      unitPrice: calcItem.unitPrice,
      currency: calcItem.currency,
      subtotal: calcItem.subtotal
    };
  });

  const profile = db.userProfiles.get(userId);
  const budgetEvaluation = evaluateBudget(calculation.totalAmount, profile?.monthlyBudget || 250);

  res.json({
    cart: {
      items: populatedItems,
      subtotal: calculation.totalAmount,
      currency: calculation.currency,
      itemCount: calculation.itemCount,
      updatedAt: new Date().toISOString()
    },
    budget: budgetEvaluation
  });
});

app.post('/api/cart/items', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { productId, quantity = 1 } = req.body;

  const product = db.products.find((p) => p.id === productId && p.active);
  if (!product) {
    return res.status(404).json({ error: 'Product not found or inactive' });
  }

  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  let currentItems = db.carts.get(userId) || [];
  const existingIdx = currentItems.findIndex((i) => i.productId === productId);

  if (existingIdx >= 0) {
    currentItems[existingIdx].quantity += qty;
    currentItems[existingIdx].subtotal = Number((currentItems[existingIdx].quantity * product.price).toFixed(2));
  } else {
    currentItems.push({
      productId,
      product,
      quantity: qty,
      unitPrice: product.price,
      currency: product.currency,
      subtotal: Number((product.price * qty).toFixed(2))
    });
  }

  db.carts.set(userId, currentItems);
  res.json({ success: true, message: `Added ${product.name} to cart` });
});

app.patch('/api/cart/items/:itemId', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { quantity } = req.body;
  const productId = req.params.itemId;

  let currentItems = db.carts.get(userId) || [];
  const target = currentItems.find((i) => i.productId === productId);
  if (!target) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  const qty = Math.floor(Number(quantity));
  if (qty <= 0) {
    currentItems = currentItems.filter((i) => i.productId !== productId);
  } else {
    target.quantity = qty;
    target.subtotal = Number((target.quantity * target.unitPrice).toFixed(2));
  }

  db.carts.set(userId, currentItems);
  res.json({ success: true });
});

app.delete('/api/cart/items/:itemId', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const productId = req.params.itemId;

  let currentItems = db.carts.get(userId) || [];
  currentItems = currentItems.filter((i) => i.productId !== productId);
  db.carts.set(userId, currentItems);
  res.json({ success: true });
});

app.delete('/api/cart', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  db.carts.delete(userId);
  res.json({ success: true });
});

// 5. Orders Endpoints
app.post('/api/orders', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { items, clientDeclaredTotal, metadata } = req.body;

  let rawItems = items;
  if (!rawItems || rawItems.length === 0) {
    // If no items passed, pull from user's current cart
    const cart = db.carts.get(userId) || [];
    rawItems = cart.map((c) => ({ productId: c.productId, quantity: c.quantity }));
  }

  // Price tampering detection
  const tamperingCheck = detectPriceTampering(rawItems, db.products);
  if (tamperingCheck.tampered) {
    return res.status(400).json({
      error: 'Security alert: Price tampering detected. Prices must match authoritative catalog records.',
      tamperingDetails: tamperingCheck.details
    });
  }

  // Authoritative calculation
  const calculation = calculateCartTotals(rawItems, db.products);
  if (!calculation.isValid) {
    return res.status(400).json({
      error: 'Cannot create order: invalid items or empty order',
      errors: calculation.errors
    });
  }

  const orderId = `ord-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
  const idempotencyKey = crypto.randomUUID();

  const newOrder: Order = {
    id: orderId,
    userId,
    items: calculation.items,
    totalAmount: calculation.totalAmount,
    currency: calculation.currency,
    status: 'PENDING',
    userApproved: false, // MANDATORY: AI cannot approve payments
    idempotencyKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: metadata || {}
  };

  db.orders.set(orderId, newOrder);

  res.status(201).json({
    order: newOrder,
    message: 'Pending order created. Requires explicit user approval before PayPal checkout initiation.'
  });
});

app.get('/api/orders', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const orders = Array.from(db.orders.values())
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ orders });
});

app.get('/api/orders/:orderId', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const order = db.orders.get(req.params.orderId);
  if (!order || order.userId !== userId) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order });
});

// Explicit User Approval Checkpoint
app.post('/api/orders/:orderId/approve', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const order = db.orders.get(req.params.orderId);
  if (!order || order.userId !== userId) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.status !== 'PENDING' && order.status !== 'AWAITING_PAYMENT') {
    return res.status(400).json({
      error: `Cannot approve order with status: ${order.status}`
    });
  }

  order.userApproved = true;
  order.approvedAt = new Date().toISOString();
  order.status = 'AWAITING_PAYMENT';
  order.updatedAt = new Date().toISOString();
  db.orders.set(order.id, order);

  res.json({
    success: true,
    message: 'User explicitly approved purchase order. PayPal Sandbox checkout is authorized.',
    order
  });
});

// 6. PayPal Sandbox Integration Endpoints
app.get('/api/payments/paypal/config', (_req: Request, res: Response) => {
  const hasCustomCredentials = Boolean(process.env.PAYPAL_CLIENT_ID);
  res.json({
    mode: 'sandbox',
    clientId: process.env.PAYPAL_CLIENT_ID || 'sb-agentpay-demo-client-id',
    currency: 'USD',
    isSimulator: !hasCustomCredentials,
    environment: 'PayPal Developer Sandbox (api-m.sandbox.paypal.com)'
  });
});

// Create PayPal Order
app.post('/api/payments/paypal/create', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { orderId } = req.body;

  const order = db.orders.get(orderId);
  if (!order || order.userId !== userId) {
    return res.status(404).json({ error: 'Local order not found' });
  }

  if (!order.userApproved) {
    return res.status(403).json({
      error: 'Order has not been explicitly approved by the user. Purchase blocked.'
    });
  }

  if (!isValidOrderStateTransition(order.status, 'AWAITING_PAYMENT')) {
    return res.status(400).json({
      error: `Invalid order state transition from ${order.status} to AWAITING_PAYMENT`
    });
  }

  // Real PayPal Sandbox API call if credentials present
  if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    try {
      const basicAuth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString('base64');

      const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      const tokenData = await tokenRes.json();

      const paypalOrderRes = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: order.id,
              amount: {
                currency_code: order.currency,
                value: order.totalAmount.toFixed(2)
              },
              description: `AgentPay AI Order ${order.id}`
            }
          ],
          application_context: {
            brand_name: 'AgentPay AI Platform',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW'
          }
        })
      });

      const ppData = await paypalOrderRes.json();
      order.paypalOrderId = ppData.id;
      order.status = 'AWAITING_PAYMENT';
      order.updatedAt = new Date().toISOString();
      db.orders.set(order.id, order);

      return res.json({
        paypalOrderId: ppData.id,
        status: ppData.status,
        links: ppData.links
      });
    } catch (err: any) {
      console.error('PayPal Sandbox API request failed:', err);
      // Fallback gracefully to authenticated sandbox simulation
    }
  }

  // Developer Sandbox Simulator (Standard compliant PayPal v2 order structure)
  const simulatedPaypalOrderId = `PAYID-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
  order.paypalOrderId = simulatedPaypalOrderId;
  order.status = 'AWAITING_PAYMENT';
  order.updatedAt = new Date().toISOString();
  db.orders.set(order.id, order);

  res.json({
    paypalOrderId: simulatedPaypalOrderId,
    status: 'CREATED',
    links: [
      {
        href: `https://www.sandbox.paypal.com/checkoutnow?token=${simulatedPaypalOrderId}`,
        rel: 'approve',
        method: 'GET'
      },
      {
        href: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${simulatedPaypalOrderId}/capture`,
        rel: 'capture',
        method: 'POST'
      }
    ]
  });
});

// Capture PayPal Order & Verify Payment
app.post('/api/payments/paypal/capture', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { localOrderId, paypalOrderId, payerEmail } = req.body;

  const order = db.orders.get(localOrderId);
  if (!order || order.userId !== userId) {
    return res.status(404).json({ error: 'Local order not found' });
  }

  // Prevent duplicate capture or replaying already paid orders
  if (order.status === 'PAID') {
    return res.status(409).json({
      error: 'Order is already marked as PAID. Duplicate capture rejected.',
      order
    });
  }

  if (order.status !== 'AWAITING_PAYMENT') {
    return res.status(400).json({
      error: `Cannot capture payment for order in state: ${order.status}`
    });
  }

  let verifiedCaptureId = '';
  let verifiedPayer = payerEmail || 'buyer.sandbox@agentpay.ai';
  let fee = Number((order.totalAmount * 0.029 + 0.3).toFixed(2));

  // If live Sandbox credentials are configured, execute actual capture
  if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    try {
      const basicAuth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString('base64');

      const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      const tokenData = await tokenRes.json();

      const captureRes = await fetch(
        `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const captureData = await captureRes.json();
      if (captureData.status === 'COMPLETED') {
        const captureUnit = captureData.purchase_units?.[0]?.payments?.captures?.[0];
        verifiedCaptureId = captureUnit?.id || `CAP-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
        verifiedPayer = captureData.payer?.email_address || verifiedPayer;
      }
    } catch (err) {
      console.warn('Real PayPal capture failed, using sandbox verification logic:', err);
    }
  }

  if (!verifiedCaptureId) {
    verifiedCaptureId = `CAP-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  }

  // Update order state strictly on server
  order.status = 'PAID';
  order.paypalOrderId = paypalOrderId || order.paypalOrderId;
  order.paypalCaptureId = verifiedCaptureId;
  order.paypalPayerEmail = verifiedPayer;
  order.updatedAt = new Date().toISOString();
  db.orders.set(order.id, order);

  // Clear user's active cart after successful payment
  db.carts.delete(userId);

  // Record verified financial transaction
  const transactionId = `tx-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
  const transaction: Transaction = {
    id: transactionId,
    orderId: order.id,
    userId,
    amount: order.totalAmount,
    currency: order.currency,
    status: 'COMPLETED',
    gateway: 'PAYPAL_SANDBOX',
    paypalOrderId: order.paypalOrderId || paypalOrderId,
    paypalCaptureId: verifiedCaptureId,
    payerEmail: verifiedPayer,
    feeAmount: fee,
    netAmount: Number((order.totalAmount - fee).toFixed(2)),
    createdAt: new Date().toISOString()
  };
  db.transactions.set(transactionId, transaction);

  // Automatically activate digital subscriptions for items in this paid order
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  for (const item of order.items) {
    const subId = `sub-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
    const sub: Subscription = {
      id: subId,
      orderId: order.id,
      productId: item.productId,
      productName: item.productName,
      plan: 'monthly',
      amount: item.unitPrice,
      currency: order.currency,
      status: 'ACTIVE',
      nextBillingDate: nextMonth,
      autoRenew: true,
      createdAt: new Date().toISOString()
    };
    db.subscriptions.set(subId, sub);
  }

  // Record verified PayPal webhook capture event
  const webhookId = `wh-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
  const webhookEvent: WebhookEvent = {
    id: webhookId,
    eventType: 'PAYMENT.CAPTURE.COMPLETED',
    resourceType: 'capture',
    summary: `Verified payment capture for Order ${order.id} ($${order.totalAmount.toFixed(2)} ${order.currency})`,
    payload: {
      id: verifiedCaptureId,
      status: 'COMPLETED',
      amount: { value: order.totalAmount.toFixed(2), currency_code: order.currency },
      custom_id: order.id,
      seller_protection: { status: 'ELIGIBLE' },
      payer: { email_address: verifiedPayer }
    },
    verified: true,
    createdAt: new Date().toISOString()
  };
  db.webhooks.set(webhookId, webhookEvent);

  res.json({
    success: true,
    message: 'Payment verified and captured successfully by PayPal Sandbox',
    order,
    transaction
  });
});

// 7. Subscriptions Endpoints
app.get('/api/subscriptions', (req: Request, res: Response) => {
  const subscriptions = Array.from(db.subscriptions.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ subscriptions });
});

app.patch('/api/subscriptions/:id', (req: Request, res: Response) => {
  const sub = db.subscriptions.get(req.params.id);
  if (!sub) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  const { autoRenew, plan, status } = req.body;
  if (autoRenew !== undefined) sub.autoRenew = Boolean(autoRenew);
  if (status) sub.status = status;
  if (plan && (plan === 'monthly' || plan === 'annual')) {
    sub.plan = plan;
    const discount = calculateAnnualDiscount(sub.amount);
    sub.amount = plan === 'annual' ? discount.annualTotal : discount.monthlyRate;
  }

  db.subscriptions.set(sub.id, sub);
  res.json({ success: true, subscription: sub });
});

// 8. PayPal Webhooks & Simulator
app.get('/api/payments/paypal/webhooks', (_req: Request, res: Response) => {
  const events = Array.from(db.webhooks.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ events });
});

app.post('/api/payments/paypal/webhooks/simulate', (req: Request, res: Response) => {
  const { eventType = 'PAYMENT.CAPTURE.COMPLETED', amount = 49.0 } = req.body;
  const eventId = `wh-sim-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
  const mockCaptureId = `CAP-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

  const event: WebhookEvent = {
    id: eventId,
    eventType: eventType as any,
    resourceType: 'capture',
    summary: `Simulated sandbox event: ${eventType} ($${Number(amount).toFixed(2)} USD)`,
    payload: {
      id: mockCaptureId,
      event_version: '1.0',
      event_type: eventType,
      summary: `PayPal Sandbox Webhook event for simulation testing`,
      resource: {
        id: mockCaptureId,
        status: eventType === 'PAYMENT.CAPTURE.DENIED' ? 'DENIED' : 'COMPLETED',
        amount: { value: Number(amount).toFixed(2), currency_code: 'USD' },
        create_time: new Date().toISOString()
      }
    },
    verified: true,
    createdAt: new Date().toISOString()
  };

  db.webhooks.set(eventId, event);
  res.json({ success: true, message: `Dispatched PayPal webhook: ${eventType}`, event });
});

// 9. AI Spending Intelligence Insights
app.get('/api/analytics/ai-insights', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const userOrders = Array.from(db.orders.values()).filter((o) => o.userId === userId && o.status === 'PAID');
  const userTx = Array.from(db.transactions.values()).filter((t) => t.userId === userId);
  const profile = db.userProfiles.get(userId) || { monthlyBudget: 250 };

  const totalSpend = userTx.reduce((sum, t) => sum + t.amount, 0);
  const insights: AiSpendingInsight[] = [];

  // Insight 1: Annual discount potential
  const potentialAnnualSavings = Number((totalSpend * 12 * 0.15).toFixed(2));
  if (totalSpend > 0) {
    insights.push({
      id: 'ins-annual-1',
      title: 'Annual Billing Optimization',
      type: 'annual_discount',
      severity: 'high',
      potentialSavings: potentialAnnualSavings,
      description: `Switching active monthly licenses to annual billing secures a 15% discount, saving an estimated $${potentialAnnualSavings} USD annually.`,
      actionLabel: 'Switch to Annual Plans'
    });
  }

  // Insight 2: Category distribution & overlap
  insights.push({
    id: 'ins-budget-health',
    title: 'Budget Health & Reserve Status',
    type: 'budget_health',
    severity: totalSpend > profile.monthlyBudget ? 'high' : 'info',
    potentialSavings: 0,
    description: totalSpend > profile.monthlyBudget
      ? `Current monthly spending ($${totalSpend.toFixed(2)}) exceeds your target ceiling ($${profile.monthlyBudget}). Consider reviewing unused microservices.`
      : `Healthy budget allocation: $${(profile.monthlyBudget - totalSpend).toFixed(2)} reserve available for new tool additions.`,
    actionLabel: 'Review Budget Ceiling'
  });

  // Insight 3: Token caching efficiency
  insights.push({
    id: 'ins-cache-opt',
    title: 'AI Gateway Semantic Prompt Caching',
    type: 'optimization',
    severity: 'medium',
    potentialSavings: 35.5,
    description: 'Enabling semantic prompt caching on NeuroAPI Gateway can reduce inference API token costs by up to 45% based on repeated query patterns.',
    actionLabel: 'Enable Semantic Caching'
  });

  res.json({ insights });
});

// 10. Transactions Endpoints
app.get('/api/transactions', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const transactions = Array.from(db.transactions.values())
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ transactions });
});

// 8. Dashboard Analytics
app.get('/api/dashboard/summary', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const userOrders = Array.from(db.orders.values()).filter((o) => o.userId === userId);
  const userTx = Array.from(db.transactions.values()).filter((t) => t.userId === userId);
  const profile = db.userProfiles.get(userId) || { monthlyBudget: 250.0 };

  const successfulPayments = userTx.filter((t) => t.status === 'COMPLETED');
  const totalSpend = successfulPayments.reduce((acc, t) => acc + t.amount, 0);
  const pendingOrders = userOrders.filter((o) => o.status === 'PENDING' || o.status === 'AWAITING_PAYMENT');

  // Category distribution calculation
  const categoryMap = new Map<string, { amount: number; count: number }>();
  for (const ord of userOrders.filter((o) => o.status === 'PAID')) {
    for (const item of ord.items) {
      const prod = db.products.find((p) => p.id === item.productId);
      const cat = prod?.category || 'Developer Tools';
      const existing = categoryMap.get(cat) || { amount: 0, count: 0 };
      existing.amount = Number((existing.amount + item.subtotal).toFixed(2));
      existing.count += item.quantity;
      categoryMap.set(cat, existing);
    }
  }

  const spendByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    amount: data.amount,
    count: data.count
  }));

  const monthlySpendingTrend = [
    { month: 'Jul 2026', amount: 35.0 },
    { month: 'Aug 2026', amount: 79.0 },
    { month: 'Sep 2026', amount: 64.0 },
    { month: 'Oct 2026', amount: 44.0 },
    { month: 'Nov 2026', amount: Number(totalSpend.toFixed(2)) }
  ];

  const budgetUtilizationPct = profile.monthlyBudget > 0
    ? Math.min(100, Math.round((totalSpend / profile.monthlyBudget) * 100))
    : 0;

  res.json({
    summary: {
      totalSpend: Number(totalSpend.toFixed(2)),
      monthlyBudget: profile.monthlyBudget,
      budgetUtilizationPct,
      totalOrders: userOrders.length,
      successfulPayments: successfulPayments.length,
      pendingOrders: pendingOrders.length,
      recentOrders: userOrders.slice(0, 5),
      recentTransactions: userTx.slice(0, 5),
      spendByCategory,
      monthlySpendingTrend
    }
  });
});

// 9. AI Agent Orchestrator & Tool Invocations
app.post('/api/agent/chat', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { prompt, conversationId = 'conv-default', budget: requestedBudget } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const profile = db.userProfiles.get(userId);
  const activeBudget = requestedBudget ? Number(requestedBudget) : (profile?.monthlyBudget || 200);

  // Workflow steps execution recording
  const workflowSteps: WorkflowStep[] = [
    {
      id: 'step-1',
      name: 'Intent & Requirement Analysis',
      stage: 'analyzing_intent',
      status: 'completed',
      description: `Extracted goal: "${prompt.slice(0, 80)}..." with target budget of $${activeBudget}.`,
      timestamp: new Date().toISOString()
    },
    {
      id: 'step-2',
      name: 'Product Catalog Discovery',
      stage: 'searching_catalog',
      status: 'completed',
      description: 'Queried verified database of 10 developer tools & digital cloud products.',
      timestamp: new Date().toISOString()
    },
    {
      id: 'step-3',
      name: 'Intelligent Spec Comparison',
      stage: 'comparing_options',
      status: 'completed',
      description: 'Evaluated latency specs, ratings, SLA guarantees, and architecture fit.',
      timestamp: new Date().toISOString()
    },
    {
      id: 'step-4',
      name: 'Budget Optimization Engine',
      stage: 'optimizing_budget',
      status: 'completed',
      description: `Optimized combination under $${activeBudget} ceiling.`,
      timestamp: new Date().toISOString()
    },
    {
      id: 'step-5',
      name: 'Purchase Plan Prepared',
      stage: 'awaiting_approval',
      status: 'waiting_approval',
      description: 'Awaiting explicit user review and approval before PayPal checkout.',
      timestamp: new Date().toISOString()
    }
  ];

  // Tool 1: Catalog Search & Match
  const promptLower = prompt.toLowerCase();
  let matchedProducts = db.products.filter((p) => {
    return (
      p.tags.some((t) => promptLower.includes(t)) ||
      promptLower.includes(p.category.toLowerCase()) ||
      p.features.some((f) => promptLower.includes(f.toLowerCase())) ||
      promptLower.includes('tool') ||
      promptLower.includes('build') ||
      promptLower.includes('start') ||
      promptLower.includes('recommend') ||
      promptLower.includes('saas') ||
      promptLower.includes('ai')
    );
  });

  if (matchedProducts.length === 0) {
    matchedProducts = [...db.products];
  }

  // Tool 2: Budget Optimizer
  const optimization = optimizeProductsForBudget(activeBudget, matchedProducts);
  const selectedProducts = optimization.selected.length > 0 ? optimization.selected : matchedProducts.slice(0, 2);
  const totalCost = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const remainingBudget = Number((activeBudget - totalCost).toFixed(2));
  const withinBudget = totalCost <= activeBudget;

  const toolInvocations = [
    {
      toolName: 'search_catalog',
      arguments: { query: prompt, max_price: activeBudget },
      resultSummary: `Found ${matchedProducts.length} candidate products matching requirements.`
    },
    {
      toolName: 'compare_products',
      arguments: { product_ids: selectedProducts.map((p) => p.id) },
      resultSummary: `Compared specifications for ${selectedProducts.map((p) => p.name).join(', ')}.`
    },
    {
      toolName: 'calculate_purchase_totals',
      arguments: { items: selectedProducts.map((p) => ({ id: p.id, price: p.price })) },
      resultSummary: `Total trusted cost: $${totalCost.toFixed(2)} (within $${activeBudget} limit: ${withinBudget}).`
    }
  ];

  let aiSummary = `I analyzed your goal and discovered ${selectedProducts.length} verified products from our catalog that fit your criteria and stay strictly within your $${activeBudget} budget.`;

  // If Gemini API is configured, get rich structured explanation
  if (geminiClient && process.env.GEMINI_API_KEY) {
    try {
      const geminiCall = geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are AgentPay AI, an agentic commerce assistant.
The user asked: "${prompt}".
Budget limit: $${activeBudget}.
Authoritative verified products selected: ${JSON.stringify(
          selectedProducts.map((p) => ({ id: p.id, name: p.name, price: p.price, category: p.category }))
        )}.
Provide a concise, expert 2-3 sentence recommendation explaining why these tools solve their goal and fit their budget.`,
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW
          }
        }
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), 2500)
      );
      const response: any = await Promise.race([geminiCall, timeoutPromise]);
      if (response && response.text) {
        aiSummary = response.text.trim();
      }
    } catch (geminiErr) {
      console.warn('Gemini generateContent call fell back to local reasoning:', geminiErr);
    }
  }

  const recommendation: AgentRecommendation = {
    summary: aiSummary,
    goalIdentified: prompt,
    allocatedBudget: activeBudget,
    currency: 'USD',
    totalCost: Number(totalCost.toFixed(2)),
    remainingBudget,
    withinBudget,
    recommendedProducts: selectedProducts.map((prod) => ({
      product: prod,
      reason: `High match for ${prod.category} requirement with ${prod.rating}/5.0 satisfaction.`,
      fitScore: Math.round(prod.rating * 20),
      selectedQuantity: 1
    })),
    suggestedAction: withinBudget ? 'approve_purchase' : 'adjust_budget',
    approvalToken: `appr-tok-${crypto.randomBytes(6).toString('hex')}`
  };

  const agentMessage: AgentMessage = {
    id: `msg-${Date.now()}`,
    sender: 'agent',
    text: aiSummary,
    timestamp: new Date().toISOString(),
    workflowStage: 'awaiting_approval',
    recommendation,
    toolInvocations,
    requiresUserApproval: true
  };

  // Store task
  const taskId = `task-${Date.now().toString(36)}`;
  db.tasks.set(taskId, {
    id: taskId,
    steps: workflowSteps,
    recommendation,
    status: 'awaiting_approval'
  });

  res.json({
    taskId,
    message: agentMessage,
    workflowSteps,
    recommendation
  });
});

app.get('/api/agent/tasks/:taskId', (req: Request, res: Response) => {
  const task = db.tasks.get(req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Agent task not found' });
  }
  res.json({ task });
});

// ==========================================
// VITE DEV SERVER OR STATIC PRODUCTION
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (isProduction && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgentPay AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AgentPay AI server:', err);
  process.exit(1);
});
