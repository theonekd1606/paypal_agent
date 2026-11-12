import { Product } from '../types';

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-neuroapi',
    name: 'NeuroAPI Enterprise Gateway',
    tagline: 'High-throughput LLM gateway with smart caching and rate limiting',
    description: 'Unified API gateway for cutting-edge generative AI models. Includes automatic prompt caching, fallback routing, and latency minimization.',
    category: 'AI & Machine Learning',
    price: 79.0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Multi-provider LLM routing & automatic failover',
      'Semantic prompt & completion caching (saves up to 45% tokens)',
      'Enterprise rate limiting and role-based quota management',
      'Streaming token analytics and detailed latency logs',
      '99.99% uptime SLA'
    ],
    specs: {
      'Latency Overhead': '< 15ms p99',
      'Max Requests/sec': '10,000 req/s',
      'Region Support': 'Global Edge (280+ PoPs)',
      'Compliance': 'SOC2 Type II, GDPR'
    },
    rating: 4.9,
    reviewsCount: 142,
    availability: 'IN_STOCK',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    active: true,
    isPopular: true,
    tags: ['ai', 'llm', 'gateway', 'inference', 'caching'],
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-10-20T00:00:00.000Z'
  },
  {
    id: 'prod-vectorbase',
    name: 'VectorBase Cloud',
    tagline: 'Fully managed distributed vector database for embeddings',
    description: 'Hyper-scale vector database engine optimized for real-time similarity search, semantic document retrieval, and RAG architectures.',
    category: 'AI & Machine Learning',
    price: 35.0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'HNSW and IVF indexing for sub-10ms nearest neighbor queries',
      'Up to 10M embeddings included on base tier',
      'Hybrid dense & sparse keyword search',
      'Automated daily backups with point-in-time recovery',
      'Direct LangChain & LlamaIndex connectors'
    ],
    specs: {
      'Query Latency': '< 8ms p95',
      'Embedding Dimensions': 'Up to 3,072 dims',
      'Storage Allocation': '50 GB SSD',
      'Replication': '3x multi-AZ replication'
    },
    rating: 4.8,
    reviewsCount: 98,
    availability: 'IN_STOCK',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    active: true,
    isPopular: true,
    tags: ['vector-db', 'rag', 'embeddings', 'similarity-search'],
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-10-22T00:00:00.000Z'
  },
  {
    id: 'prod-cloudpulse',
    name: 'CloudPulse APM & Observability',
    tagline: 'End-to-end cloud monitoring, distributed tracing & error detection',
    description: 'Full-stack application performance monitoring platform. Detect memory leaks, trace database bottlenecks, and get instant alerting across cloud clusters.',
    category: 'Cloud & DevOps',
    price: 49.0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Automated code-level profiling for Node.js, Python, and Go',
      'Distributed e2e tracing with OpenTelemetry native ingest',
      'AI anomaly detection for spikes in error rates and latency',
      'Custom dashboards with Recharts and Prometheus query support',
      'PagerDuty, Slack, and Discord webhook integrations'
    ],
    specs: {
      'Retention Period': '30 days raw spans',
      'Hosts Included': 'Up to 10 instances',
      'Trace Ingestion': '500 GB / month',
      'Sampling Rate': 'Adaptive intelligent sampling'
    },
    rating: 4.7,
    reviewsCount: 115,
    availability: 'IN_STOCK',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    active: true,
    tags: ['observability', 'apm', 'monitoring', 'metrics', 'tracing'],
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-10-18T00:00:00.000Z'
  },
  {
    id: 'prod-devflow',
    name: 'DevFlow CI/CD Engine',
    tagline: 'Lightning-fast container pipelines with zero configuration',
    description: 'Modern developer workflow engine that builds, tests, and deploys containers in parallel with intelligent step caching and instant rollbacks.',
    category: 'Cloud & DevOps',
    price: 39.0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Bare-metal NVMe runners for 3x faster Docker builds',
      'Automatic layer caching and artifact deduplication',
      'Native GitHub, GitLab, and Bitbucket webhooks',
      'Automated ephemeral staging environments per pull request',
      'Integrated security and dependency vulnerability scanning'
    ],
    specs: {
      'Concurrent Jobs': '4 concurrent runners',
      'Runner Hardware': '4 vCPU, 16GB RAM each',
      'Build Minutes': '5,000 build mins/month',
      'Registry Storage': '100 GB Docker registry'
    },
    rating: 4.8,
    reviewsCount: 86,
    availability: 'IN_STOCK',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    active: true,
    tags: ['cicd', 'devops', 'containers', 'docker', 'deploy'],
    createdAt: '2026-03-05T00:00:00.000Z',
    updatedAt: '2026-10-25T00:00:00.000Z'
  },
  {
    id: 'prod-secureshield',
    name: 'SecureShield Auth & RBAC',
    tagline: 'Modern authentication, user directory, and granular role management',
    description: 'Plug-and-play authentication service with multi-factor auth (MFA), passwordless passkeys, OAuth 2.0, and fine-grained permissions engine.',
    category: 'Security & Auth',
    price: 29.0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Biometric passkeys (WebAuthn) and TOTP authenticator MFA',
      'Pre-built drop-in login modals and SDKs for React & Next.js',
      'Fine-grained Role-Based Access Control (RBAC) & ABAC policies',
      'Real-time session revocation and suspicious IP blocking',
      'JWT signing with automated public key rotation'
    ],
    specs: {
      'Monthly Active Users': '15,000 MAU included',
      'Custom Domains': 'Up to 3 custom auth domains',
      'SSO Connections': 'Google, GitHub, Apple, SAML',
      'Compliance': 'HIPAA, GDPR, CCPA Ready'
    },
    rating: 4.9,
    reviewsCount: 167,
    availability: 'IN_STOCK',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
    active: true,
    isPopular: true,
    tags: ['auth', 'security', 'rbac', 'passkeys', 'sso'],
    createdAt: '2026-01-20T00:00:00.000Z',
    updatedAt: '2026-10-28T00:00:00.000Z'
  },
  {
    id: 'prod-paymentbridge',
    name: 'PaymentBridge Merchant Suite',
    tagline: 'Multi-currency payment orchestration & subscription billing engine',
    description: 'Developer-friendly checkout orchestration suite with smart routing, automatic retries, dispute automation, and recurring billing models.',
    category: 'Payments & Fintech',
    price: 45.0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Seamless PayPal Sandbox & Live checkout orchestration',
      'Automated recurring billing, invoicing, and proration',
      'Smart card routing and dunning management to recover lost sales',
      'Tax calculation engine across 140+ countries',
      'Real-time financial reconciliation reports'
    ],
    specs: {
      'Transaction Volume': '$50k/mo included',
      'Supported Currencies': '135+ world currencies',
      'Webhook Reliability': '99.999% with auto-retry',
      'PCI-DSS': 'PCI-DSS Level 1 Compliant'
    },
    rating: 4.8,
    reviewsCount: 79,
    availability: 'IN_STOCK',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
    active: true,
    tags: ['payments', 'fintech', 'paypal', 'billing', 'subscriptions'],
    createdAt: '2026-02-14T00:00:00.000Z',
    updatedAt: '2026-10-26T00:00:00.000Z'
  },
  {
    id: 'prod-docucraft',
    name: 'DocuCraft AI Engine',
    tagline: 'Interactive API documentation, SDK generator & playground',
    description: 'Transform OpenAPI/Swagger specs into beautiful, interactive developer documentation portals with AI-assisted code samples in 8 languages.',
    category: 'Developer Tools',
    price: 19.0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Instant generation from OpenAPI 3.0 / 3.1 specifications',
      'Interactive request playground with mock responses',
      'AI-generated SDKs in TypeScript, Python, Go, and Java',
      'Custom branding, vanity domain, and dark/light themes',
      'Search powered by semantic embeddings'
    ],
    specs: {
      'API Endpoints': 'Unlimited documentation pages',
      'Custom Domain': 'Included with free SSL',
      'Page Views': '100,000 views / month',
      'Version Control': 'Multi-version documentation support'
    },
    rating: 4.7,
    reviewsCount: 64,
    availability: 'IN_STOCK',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    active: true,
    tags: ['docs', 'api', 'openapi', 'developer-portal', 'generator'],
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-10-15T00:00:00.000Z'
  },
  {
    id: 'prod-logstream',
    name: 'LogStream Realtime Analytics',
    tagline: 'High-volume structured log ingestion, filtering & alerting',
    description: 'Blazing-fast log aggregation platform capable of indexing millions of JSON log lines per minute with zero indexing lag and live tailing.',
    category: 'Analytics',
    price: 25.0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Sub-second live tailing across all servers and microservices',
      'SQL-like querying over unstructured and JSON log fields',
      'Automated PII scrubbing (masks credit cards, tokens, passwords)',
      'Threshold-based alerts to Discord, Slack, and webhooks',
      'Cold storage archiving to S3/Cloud Storage'
    ],
    specs: {
      'Daily Ingestion': '5 GB / day included',
      'Query Speed': 'Up to 50M records/second',
      'Hot Retention': '14 days searchable retention',
      'Data Redundancy': 'Encrypted at rest (AES-256)'
    },
    rating: 4.6,
    reviewsCount: 52,
    availability: 'IN_STOCK',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&auto=format&fit=crop&q=80',
    active: true,
    tags: ['logs', 'analytics', 'realtime', 'observability', 'debugging'],
    createdAt: '2026-02-18T00:00:00.000Z',
    updatedAt: '2026-10-12T00:00:00.000Z'
  },
  {
    id: 'prod-edgedns',
    name: 'EdgeDNS Global Security',
    tagline: 'Ultra-low latency Anycast authoritative DNS with DDoS shield',
    description: 'Enterprise authoritative DNS service with 100% uptime SLA, georouting, automated SSL certificate provisioning, and Layer 7 DDoS mitigation.',
    category: 'Security & Auth',
    price: 15.0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Global Anycast network spanning 300+ edge locations',
      'GeoDNS routing directing users to the nearest cloud region',
      'Automated Let’s Encrypt wildcard SSL issuance and renewal',
      'Integrated Layer 3/4/7 DDoS mitigation up to 500 Gbps',
      'DNSSEC signing with single-click enablement'
    ],
    specs: {
      'Propagation Time': '< 3 seconds globally',
      'DNS Queries': '5,000,000 queries / month',
      'Zones Included': '5 domains',
      'Uptime Guarantee': '100% SLA with financial backing'
    },
    rating: 4.9,
    reviewsCount: 91,
    availability: 'IN_STOCK',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
    active: true,
    tags: ['dns', 'security', 'ddos', 'ssl', 'infrastructure'],
    createdAt: '2026-01-08T00:00:00.000Z',
    updatedAt: '2026-10-21T00:00:00.000Z'
  },
  {
    id: 'prod-syncqueue',
    name: 'SyncQueue Pro Message Broker',
    tagline: 'Distributed background job queue & pub/sub messaging engine',
    description: 'High-throughput, persistent message broker for asynchronous tasks, cron scheduling, webhook fan-out, and reliable microservice communication.',
    category: 'Developer Tools',
    price: 32.0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'At-least-once and exactly-once delivery guarantees',
      'Delayed scheduling, cron jobs, and exponential retry backoff',
      'Dead-letter queue (DLQ) inspection and replay UI',
      'Lightweight client libraries for Node.js, Python, and Go',
      'Zero infrastructure management, auto-scaling worker nodes'
    ],
    specs: {
      'Throughput': 'Up to 25,000 msg/sec',
      'Message Retention': '7 days unconsumed backlog',
      'Topic Queues': 'Up to 50 active topics',
      'Encryption': 'TLS in transit & KMS encryption at rest'
    },
    rating: 4.8,
    reviewsCount: 73,
    availability: 'IN_STOCK',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    active: true,
    tags: ['queue', 'pubsub', 'background-jobs', 'microservices', 'async'],
    createdAt: '2026-02-28T00:00:00.000Z',
    updatedAt: '2026-10-29T00:00:00.000Z'
  }
];
