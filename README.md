# AgentPay AI 🤖💳
### An Agentic AI Platform for Intelligent Commerce and Payments

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![PayPal](https://img.shields.io/badge/PayPal-Developer_Sandbox_v2-00457C.svg)](https://developer.paypal.com)
[![Gemini](https://img.shields.io/badge/AI-Gemini_3.8_Flash-8E75C4.svg)](https://ai.google.dev)
[![TypeScript](https://img.shields.io/badge/Frontend-React_19_+_TypeScript-3178C6.svg)](https://react.dev)

---

## 🌟 Overview

**AgentPay AI** is an autonomous agentic commerce platform that helps developers, startup founders, and technical buyers discover, evaluate, compare, and purchase cloud infrastructure and SaaS tools using natural language.

### The Problem
Traditional e-commerce search requires users to manually hunt through dozens of SaaS pricing pages, cross-reference API latency benchmarks, calculate complex tier subtotals, and risk unexpected credit card charges. Conversely, purely autonomous AI agents pose serious financial risks if allowed to purchase tools without explicit human oversight.

### The Solution: Agentic Commerce with Human-in-the-Loop
AgentPay AI implements an end-to-end 10-stage commerce workflow:
```
User Request → AI Analysis → Product Discovery → Comparison → Budget Optimization → Cart → User Approval → PayPal Sandbox Checkout → Payment Verification → Order Confirmation
```

1. **Grounded Catalog Discovery**: The AI agent queries a database of verified software products with authoritative pricing (zero hallucinated products).
2. **Knapsack Budget Optimization**: Automatically balances recommended tools against a user-defined budget ceiling, maximizing utility while preserving reserve funds.
3. **Mandatory User Authorization Gate**: Strictly forbids autonomous payment execution. Every order requires explicit cryptographic human approval.
4. **Server-Verified PayPal Sandbox v2 Settlement**: Orders are created, validated, and captured server-side with anti-tampering guards and anti-replay protection.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti |
| **API & Gateway** | Node.js Express Fullstack Server + Python FastAPI microservices (`backend/`) |
| **AI Agent** | Gemini 3.8 Flash SDK (`@google/genai`), Tool Invocations, Structured JSON Outputs |
| **Payments** | PayPal Developer Sandbox (REST API v2 Orders & Captures) |
| **Data & Ledger** | Server-side verified in-memory store with Cloud Firestore schemas & JSON export |

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- Node.js `>= 18.0.0`
- npm or bun

### 1. Installation
Clone the repository and install all dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the template configuration:
```bash
cp .env.example .env
```
*(Optional)* Add your Google Gemini API key or PayPal Developer Sandbox credentials:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_MODE=sandbox
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch immediately at `http://localhost:3000`.

### 4. Run Automated Tests
```bash
npx --yes tsx --test src/utils/commerceLogic.test.ts
```

---

## 🧪 PayPal Sandbox Testing Guide

1. Navigate to the **AI Agent** tab or **Catalog** tab.
2. Select tools or ask the agent: *"I have a budget of $200 and want developer tools to build and launch an AI SaaS."*
3. Review the recommended stack and click **"Review & Approve Purchase on PayPal"**.
4. At the **User Authorization Checkpoint**, review the exact itemized subtotal and check the authorization box:
   > *"I explicitly review and authorize this purchase order of $X.XX USD."*
5. Click **"Pay with PayPal Sandbox"**.
6. The backend communicates with PayPal Sandbox v2, captures payment, seals the order as `PAID`, records a transaction with fee breakdown, and displays the digital invoice with JSON export!

---

## 📹 Under-3-Minute Demonstration Script

- **0:00 - 0:30 (Hook & Problem)**: Introduce AgentPay AI. Show the problem of modern cloud and developer SaaS discovery—too many tools, opaque pricing, and the risk of unconstrained AI buying things.
- **0:30 - 1:15 (Agent In Action)**: Type *"I have a budget of $200 and need developer tools to build and launch an AI SaaS."* Watch the live 5-step workflow stepper execute: analyzing intent, querying verified catalog, comparing specs, and running knapsack budget optimization.
- **1:15 - 1:45 (Spec Comparison & Catalog)**: Inspect the side-by-side comparison matrix with latency benchmarks and feature checkmarks.
- **1:45 - 2:30 (Human-in-the-Loop & PayPal Checkout)**: Show the mandatory User Authorization Gate. Explain that the AI cannot pay on its own. Authorize the purchase, trigger PayPal Sandbox checkout, watch server-side capture verification, and view the digital invoice.
- **2:30 - 3:00 (Analytics & Conclusion)**: Open the Analytics Dashboard showing Recharts spending trends, category distributions, and the immutable transaction audit ledger.

---

## 📄 License
This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
