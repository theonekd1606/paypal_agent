# AgentPay AI — API Reference Documentation

All endpoints are hosted on the API Gateway under `/api`.

## Authentication
Requests should include:
`Authorization: Bearer <user_token>`

---

### 1. Health
`GET /api/health`
- **Response**:
```json
{
  "status": "healthy",
  "service": "AgentPay AI Core Gateway",
  "geminiConfigured": true,
  "paypalMode": "sandbox_simulator"
}
```

---

### 2. User & Preferences
`GET /api/auth/me`
- **Response**: Returns authenticated user profile, monthly budget limit, and preferred categories.

`POST /api/auth/preferences`
- **Body**: `{ "monthlyBudget": 300, "currency": "USD" }`
- **Response**: Updated user record.

---

### 3. Products Catalog
`GET /api/products?q={query}&category={category}&maxPrice={maxPrice}&sort={sort}`
- **Query Params**:
  - `q`: Search keywords
  - `category`: Category name
  - `maxPrice`: Numerical filter
  - `sort`: `popular` | `rating` | `price-asc` | `price-desc`
- **Response**: Array of verified Product objects.

`GET /api/products/:productId`
- **Response**: Product details with verified specs and features.

`POST /api/products/compare`
- **Body**: `{ "productIds": ["prod-neuroapi", "prod-vectorbase"] }`
- **Response**: Comparison matrix with spec union and feature grid.

---

### 4. Cart Management
`GET /api/cart`
- **Response**: Populated cart items, authoritative recalculated subtotal, and user budget impact.

`POST /api/cart/items`
- **Body**: `{ "productId": "prod-neuroapi", "quantity": 1 }`
- **Response**: `{ "success": true }`

`PATCH /api/cart/items/:itemId`
- **Body**: `{ "quantity": 2 }`

`DELETE /api/cart/items/:itemId`
- **Response**: `{ "success": true }`

---

### 5. Orders & User Approval Checkpoint
`POST /api/orders`
- **Body**: `{ "items": [{ "productId": "prod-1", "quantity": 1 }] }`
- **Security**: Verifies prices against catalog. Detects price tampering attempts.
- **Initial Status**: `PENDING`, `userApproved: false`.

`POST /api/orders/:orderId/approve`
- **Description**: Explicit human authorization checkpoint.
- **Status Transition**: `PENDING` → `AWAITING_PAYMENT`, `userApproved: true`.

`GET /api/orders`
- **Response**: List of user orders with statuses (`PENDING`, `AWAITING_PAYMENT`, `PAID`, `CANCELLED`).

---

### 6. PayPal Sandbox Payments
`GET /api/payments/paypal/config`
- **Response**: Sandbox client configuration, environment, and simulator status.

`POST /api/payments/paypal/create`
- **Body**: `{ "orderId": "ord-123" }`
- **Verification**: Rejects order if `userApproved` is false. Authenticates with PayPal Sandbox v2.
- **Response**: `{ "paypalOrderId": "PAYID-...", "status": "CREATED", "links": [...] }`

`POST /api/payments/paypal/capture`
- **Body**: `{ "localOrderId": "ord-123", "paypalOrderId": "PAYID-...", "payerEmail": "..." }`
- **Verification**: Captures order, verifies amounts, transitions status to `PAID`, records transaction.

---

### 7. AI Agent Orchestrator
`POST /api/agent/chat`
- **Body**:
```json
{
  "prompt": "I have a budget of $200 and want developer tools to build and launch an AI SaaS.",
  "budget": 200
}
```
- **Response**:
```json
{
  "taskId": "task-xyz",
  "workflowSteps": [...],
  "recommendation": {
    "goalIdentified": "...",
    "allocatedBudget": 200,
    "totalCost": 114.0,
    "remainingBudget": 86.0,
    "withinBudget": true,
    "recommendedProducts": [...]
  }
}
```

---

### 8. Analytics & Financial Ledger
`GET /api/dashboard/summary`
- **Response**: Authoritative aggregate totals (Total Spend, Successful Payments, Pipeline Orders, Recharts spending trends, Category distribution).
