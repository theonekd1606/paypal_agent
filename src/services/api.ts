import { Product, Cart, Order, Transaction, UserProfile, AgentMessage, WorkflowStep, AgentRecommendation, AnalyticsSummary, Subscription, WebhookEvent, AiSpendingInsight } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('agentpay_auth_token') || 'user-founder-01';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const api = {
  // Health
  async checkHealth(): Promise<{ status: string; geminiConfigured: boolean; paypalMode: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Auth & Profile
  async getProfile(): Promise<{ user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updatePreferences(prefs: Partial<UserProfile>): Promise<{ user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/preferences`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(prefs)
    });
    return res.json();
  },

  async verifyAuth(data: { token?: string; name?: string; email?: string; role?: string; monthlyBudget?: number }): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Products
  async getProducts(params?: { q?: string; category?: string; maxPrice?: number; sort?: string }): Promise<{ products: Product[]; total: number; categories: string[] }> {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.category) query.set('category', params.category);
    if (params?.maxPrice) query.set('maxPrice', params.maxPrice.toString());
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    return res.json();
  },

  async getProduct(id: string): Promise<{ product: Product }> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return res.json();
  },

  async compareProducts(productIds: string[]): Promise<any> {
    const res = await fetch(`${API_BASE}/products/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds })
    });
    return res.json();
  },

  // Cart
  async getCart(): Promise<{ cart: Cart; budget: any }> {
    const res = await fetch(`${API_BASE}/cart`, { headers: getAuthHeaders() });
    return res.json();
  },

  async addToCart(productId: string, quantity = 1): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity })
    });
    return res.json();
  },

  async updateCartItem(productId: string, quantity: number): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity })
    });
    return res.json();
  },

  async removeCartItem(productId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async clearCart(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Orders & Approval
  async createOrder(items?: { productId: string; quantity: number }[], metadata?: any): Promise<{ order: Order; message: string }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items, metadata })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create order');
    }
    return res.json();
  },

  async approveOrder(orderId: string): Promise<{ success: boolean; message: string; order: Order }> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to approve order');
    }
    return res.json();
  },

  async getOrders(): Promise<{ orders: Order[] }> {
    const res = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getOrder(orderId: string): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, { headers: getAuthHeaders() });
    return res.json();
  },

  // PayPal Sandbox Payments
  async getPayPalConfig(): Promise<{ mode: string; clientId: string; currency: string; isSimulator: boolean; environment: string }> {
    const res = await fetch(`${API_BASE}/payments/paypal/config`);
    return res.json();
  },

  async createPayPalOrder(orderId: string): Promise<{ paypalOrderId: string; status: string; links: any[] }> {
    const res = await fetch(`${API_BASE}/payments/paypal/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to initiate PayPal order');
    }
    return res.json();
  },

  async capturePayPalPayment(payload: { localOrderId: string; paypalOrderId: string; payerEmail?: string }): Promise<{ success: boolean; order: Order; transaction: Transaction; message: string }> {
    const res = await fetch(`${API_BASE}/payments/paypal/capture`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to capture PayPal payment');
    }
    return res.json();
  },

  // Transactions
  async getTransactions(): Promise<{ transactions: Transaction[] }> {
    const res = await fetch(`${API_BASE}/transactions`, { headers: getAuthHeaders() });
    return res.json();
  },

  // Dashboard Analytics
  async getDashboardSummary(): Promise<{ summary: AnalyticsSummary }> {
    const res = await fetch(`${API_BASE}/dashboard/summary`, { headers: getAuthHeaders() });
    return res.json();
  },

  // AI Agent
  async sendAgentChat(prompt: string, budget?: number): Promise<{
    taskId: string;
    message: AgentMessage;
    workflowSteps: WorkflowStep[];
    recommendation: AgentRecommendation;
  }> {
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt, budget })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'AI Agent request failed');
    }
    return res.json();
  },

  // Subscriptions & Licenses
  async getSubscriptions(): Promise<{ subscriptions: Subscription[] }> {
    const res = await fetch(`${API_BASE}/subscriptions`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateSubscription(id: string, data: { autoRenew?: boolean; plan?: 'monthly' | 'annual'; status?: 'ACTIVE' | 'CANCELLED' | 'PAUSED' }): Promise<{ success: boolean; subscription: Subscription }> {
    const res = await fetch(`${API_BASE}/subscriptions/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // PayPal Sandbox Webhooks
  async getWebhooks(): Promise<{ events: WebhookEvent[] }> {
    const res = await fetch(`${API_BASE}/payments/paypal/webhooks`);
    return res.json();
  },

  async simulateWebhook(eventType: string, amount?: number): Promise<{ success: boolean; message: string; event: WebhookEvent }> {
    const res = await fetch(`${API_BASE}/payments/paypal/webhooks/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, amount })
    });
    return res.json();
  },

  // AI Spending Insights
  async getAiInsights(): Promise<{ insights: AiSpendingInsight[] }> {
    const res = await fetch(`${API_BASE}/analytics/ai-insights`, { headers: getAuthHeaders() });
    return res.json();
  }
};
