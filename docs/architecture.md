# AgentPay AI — System Architecture & Design Specification

## 1. Executive Summary

**AgentPay AI** is an Agentic AI Platform for Intelligent Commerce and Payments designed for autonomous digital product discovery, spec comparison, knapsack budget optimization, and secure PayPal Developer Sandbox checkout.

Traditional AI commerce bots either act as static text recommenders with no transactional capabilities or dangerously attempt autonomous payment execution without human authorization. AgentPay AI bridges this gap with a **Verified Multi-Stage Workflow Engine** coupled to a **Mandatory User Authorization Gate** and **Server-Controlled Financial Settlement**.

---

## 2. Core Architectural Layers

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│   React 19 + TypeScript + Tailwind CSS + Framer Motion + Recharts      │
│   • AI Agent Workspace       • Catalog Discovery & Search              │
│   • Product Comparison Matrix • Cart & Budget Utilization Meter         │
│   • User Authorization Gate   • PayPal Sandbox Interactive Handoff     │
│   • Order History & Digital Receipts • Financial Analytics Dashboard   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST (Port 3000)
┌───────────────────────────────────▼────────────────────────────────────┐
│                  API & APPLICATION GATEWAY LAYER                       │
│   Node.js / Express Full-Stack Server & FastAPI Services               │
│   • Request Validation & Anti-Tampering Price Enforcement              │
│   • Idempotent Order State Machine (PENDING → AWAITING → PAID)         │
│   • Session Token & User Ownership Authorization                      │
└───────┬───────────────────────────┬────────────────────────────┬───────┘
        │                           │                            │
┌───────▼──────────────┐   ┌────────▼─────────────┐   ┌──────────▼───────┐
│   AI AGENT LAYER     │   │  COMMERCE & PAYMENT  │   │   PERSISTENCE    │
│  Gemini 3.8 Flash    │   │  PayPal Sandbox v2   │   │ Cloud Firestore/ │
│  SDK Orchestrator    │   │  Orders API Engine   │   │  Auditable Store │
│  • Intent Analysis   │   │  • Server Order Init │   │  • Products DB   │
│  • Tool Allowlist:   │   │  • Capture & Verify  │   │  • Orders Ledger │
│    - search_catalog  │   │  • Anti-Replay Guard │   │  • Transactions  │
│    - compare_products│   │  • Settlement Ledger │   │  • User Profiles │
│    - optimize_budget │   │                      │   │  • Workflow Logs │
└──────────────────────┘   └──────────────────────┘   └──────────────────┘
```

---

## 3. The 10-Stage Agentic Commerce Lifecycle

The central user journey proceeds strictly through verified checkpoints:

1. **Request Ingestion**: User submits goals and budget constraints in natural language (e.g. *"I have a budget of $200 and want developer tools to launch an AI SaaS"*).
2. **Requirement Extraction**: Agent extracts goal, category preferences, currency, and strict spending ceiling.
3. **Product Discovery**: Agent invokes `search_catalog` against authoritative database records (zero hallucinated products).
4. **Intelligent Comparison**: Evaluates latency benchmarks, SLA guarantees, features, and ratings across candidate tools.
5. **Budget Optimization**: Knapsack optimization engine selects the highest-utility combination strictly within the budget ceiling.
6. **Recommendation Synthesis**: Produces structured purchase plan, trade-off analysis, and remaining reserve calculations.
7. **Human Approval Gate (Mandatory Checkpoint)**: Nonce-bound explicit user approval checkbox. Autonomous AI payment initiation is strictly forbidden.
8. **PayPal Sandbox Order Creation**: Server authenticates with `api-m.sandbox.paypal.com` and creates a PayPal v2 order bound to local order ID.
9. **Payment Capture & Verification**: Server executes capture, verifies payment state, currency, and amount.
10. **Order Confirmation & Digital Receipt**: Order transitions to `PAID`, transaction ledger is sealed, and digital receipt is generated with JSON export.

---

## 4. Security & Anti-Tampering Rules

1. **Zero Client Price Trust**: Unit prices, currency codes, and subtotals sent by the browser are never trusted. All totals are recalculated server-side from authoritative catalog records.
2. **State Machine Enforcement**: Orders can only transition along approved lifecycles (`PENDING` → `AWAITING_PAYMENT` → `PAID`). Direct jumping to `PAID` without verified PayPal capture is impossible.
3. **Idempotency & Replay Protection**: Each order holds a unique UUID idempotency key; duplicate capture attempts return a `409 Conflict`.
4. **Secret Isolation**: PayPal Client Secrets and Gemini API keys reside exclusively on the server and are never bundled into the client browser build.
