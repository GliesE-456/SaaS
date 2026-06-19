# Technical Specification - Competitor Change Tracker

This document outlines the technical architecture, folder structure, and key components of the Competitor Change Tracker SaaS application. The project is built as a monorepo using Next.js 15, Node.js BullMQ workers, and a shared Prisma database package.

## 1. Folder Structure

The application follows a pnpm workspace monorepo structure with three primary packages:

```text
/
├── apps/
│   ├── web/                    # Next.js 15 Application (Frontend & API)
│   │   ├── src/
│   │   │   ├── app/            # App Router (Pages, Layouts, API Routes)
│   │   │   │   ├── api/        # REST APIs (Auth, Billing, Stripe Webhooks, v1 APIs)
│   │   │   │   ├── (auth)/     # Authentication pages (Sign-in, Sign-up, Reset)
│   │   │   │   ├── dashboard/  # Authenticated user dashboard (URLs, Changes, Settings)
│   │   │   │   └── page.tsx    # Marketing Landing Page
│   │   │   ├── components/     # React Components (UI, Layouts, Feature-specific)
│   │   │   ├── hooks/          # Custom React Hooks
│   │   │   └── lib/            # Shared Utilities (Stripe, Auth.js, Mail, Rate Limiting)
│   │   └── public/             # Static Assets
│   │
│   └── worker/                 # Node.js Background Worker Process
│       └── src/
│           ├── index.ts        # Worker Entrypoint & Scheduler
│           ├── queues/         # BullMQ Queue Initializations
│           └── workers/        # Job Processors (Scrape, AI, Notify)
│
├── packages/
│   └── db/                     # Shared Prisma ORM Package
│       ├── prisma/
│       │   └── schema.prisma   # Database Models & Enums
│       └── src/
│           └── index.ts        # Prisma Client Export
│
├── docs/                       # Project Documentation
├── package.json                # Root Workspace Package
└── pnpm-workspace.yaml         # PNPM Workspace Configuration
```

---

## 2. API Routes

The REST API is implemented using Next.js 15 Route Handlers inside `apps/web/src/app/api/`.

### Authentication (`/api/auth`)
- **`GET /api/auth/[...nextauth]`**: NextAuth.js (Auth.js v5) core handler.
- **`POST /api/auth/[...nextauth]`**: NextAuth.js core handler.
- **`POST /api/auth/register`**: Handles new user sign-ups and initial workspace creation.
- **`POST /api/auth/reset-password`**: Requests a password reset link.
- **`POST /api/auth/reset-password/confirm`**: Submits a new password securely.
- **`GET /api/auth/verify`**: Verifies user email from a magic link token.
- **`POST /api/auth/verify-email`**: Resends email verification links.

### Billing & Stripe (`/api/billing` & `/api/stripe`)
- **`POST /api/billing/checkout`**: Creates a Stripe Checkout session to upgrade plans.
- **`POST /api/billing/portal`**: Generates a Stripe Customer Portal session link for plan management.
- **`POST /api/stripe/webhook`**: Secure endpoint to receive Stripe event webhooks (e.g., `checkout.session.completed`, `customer.subscription.updated`). Implements idempotency via `ProcessedStripeEvent`.

### Core Application APIs (`/api/v1`)
- **`GET /api/v1/urls`**: Fetch all tracked URLs for the current workspace.
- **`POST /api/v1/urls`**: Add a new competitor URL to track. Enforces plan limits.
- **`DELETE /api/v1/urls/:id`**: Soft-delete a tracked URL.
- **`POST /api/v1/urls/:id/check`**: Manually trigger an immediate check/scrape for a specific URL.
- **`GET /api/v1/changes`**: Fetch recent changes and AI summaries, supports cursor-based pagination.
- **`PATCH /api/v1/settings/notifications`**: Update user notification preferences (e.g., email digest frequency).

---

## 3. Services

Services abstract complex logic out of route handlers and provide reusable functionality across the application.

### Frontend/Web Services (`apps/web/src/lib/`)
- **`auth.ts`**: Configures Auth.js with Prisma adapter, Credentials provider, and session enhancements (injecting workspace context).
- **`stripe.ts`**: Initializes the Stripe SDK and handles secure checkout/portal session generation.
- **`mail.ts`**: Wrapper for the Resend SDK. Handles sending verification emails, password resets, and change alerts.
- **`rate-limit.ts`**: Provides sliding-window rate limiting to protect API routes (e.g., manual URL checks).
- **`plan-limits.ts`**: Validates whether a user's current subscription allows for an action (e.g., max URLs, AI summaries, minimum check frequencies).

### Database Service (`packages/db/src/`)
- **`index.ts`**: Instantiates a singleton `PrismaClient` to ensure connections are reused effectively in Serverless environments.

---

## 4. Queue Jobs (BullMQ)

Background processing is decoupled from the web application using **BullMQ** running on a Redis data store. These queues live in `apps/worker/src/queues/` and `apps/worker/src/workers/`.

1. **`scrapeQueue` (`scrape.worker.ts`)**
   - **Trigger**: Fired by manual user request or the cron scheduler.
   - **Task**: 
     - Fetches raw HTML of the target URL using `node-fetch` or a headless browser (Playwright integration ready).
     - Extracts visible text content using `cheerio`.
     - Generates an MD5/SHA256 hash of the content.
     - Compares the new hash against the previously known hash.
     - If changes are detected, saves the new snapshot to Cloudflare R2 (or local mock), and enqueues a job to the `aiQueue`.

2. **`aiQueue` (`ai.worker.ts`)**
   - **Trigger**: Fired by `scrapeQueue` when a content change is detected.
   - **Task**:
     - Downloads the "before" and "after" snapshots from R2.
     - Sends a prompt to the **OpenAI API** (`gpt-4o-mini` or `gpt-4o`) to summarize the differences.
     - Calculates an `ImpactLevel` (LOW, MEDIUM, HIGH) and `impactScore`.
     - Updates the `ChangeEvent` in the database with the AI's summary.
     - Enqueues a job to the `notifyQueue`.

3. **`notifyQueue` (`notify.worker.ts`)**
   - **Trigger**: Fired by `aiQueue` after processing is complete.
   - **Task**:
     - Queries user notification preferences for the workspace.
     - Uses **Resend** to send email alerts containing the AI summary and impact score.
     - Handles digest aggregation logic (for DAILY/WEEKLY preferences).

---

## 5. Cron Jobs

Cron-based scheduling is managed within the Worker package (`apps/worker/src/index.ts`).

- **Scheduler Service**
  - **Frequency**: Runs continuously (e.g., checking every minute).
  - **Task**: Queries the PostgreSQL database for all `TrackedUrl` records where `status = ACTIVE` and `nextCheckAt <= NOW()`.
  - **Action**: Enqueues a check job to the `scrapeQueue` for each eligible URL and updates its `nextCheckAt` timestamp based on its configured `checkFrequency` (e.g., 1 hour, 6 hours, 24 hours).

---

## 6. Integrations

The system utilizes several external APIs and third-party services to function:

1. **Database & Storage**
   - **PostgreSQL (Neon)**: Serverless SQL database storing application state, users, auth, and metadata. Accessed via **Prisma ORM**.
   - **Redis (Upstash)**: Used by BullMQ to manage background job queues, states, and scheduling.
   - **Cloudflare R2**: S3-compatible blob storage for archiving large HTML snapshots and generating diffs without bloating the PostgreSQL database.

2. **Authentication & Identity**
   - **Auth.js v5**: Handles secure session management, OAuth (Google/GitHub planned), and custom Credentials authentication.

3. **Payments & Billing**
   - **Stripe**: Manages subscriptions, recurring billing, and plan quotas. Webhooks (`customer.subscription.updated`, `checkout.session.completed`) sync Stripe subscription states to the internal PostgreSQL `Workspace` model in real-time.

4. **Artificial Intelligence**
   - **OpenAI API**: Analyzes before/after website snapshots to generate human-readable summaries, detect pricing changes, and score the business impact of a competitor's updates.

5. **Email Delivery**
   - **Resend**: Transacts emails reliably, including Auth emails (verifications, resets) and Alert emails (competitor change notifications).

6. **Web Scraping**
   - **Cheerio**: Fast, native HTML parsing for extracting text content from static websites.
   - **Playwright (Planned)**: Full headless browser automation for scraping JS-heavy Single Page Applications (SPAs) and handling bot protections.
