# Competitor Change Tracker (CCT) — Final PRD v2.0

> **Version:** 2.0 (Final)
> **Date:** June 2026
> **Status:** Approved for Implementation
> **Stack:** Next.js 15 · PostgreSQL (Neon) · Prisma · Stripe · Resend · OpenAI API · Playwright
> **Incorporates:** Architecture Review findings — all critical issues resolved

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Personas](#2-user-personas)
3. [Core User Problems](#3-core-user-problems)
4. [User Stories](#4-user-stories)
5. [MVP Scope — True 14-Day Build](#5-mvp-scope--true-14-day-build)
6. [Future Features (Post-MVP)](#6-future-features-post-mvp)
7. [Complete Feature Breakdown](#7-complete-feature-breakdown)
8. [Dashboard Structure](#8-dashboard-structure)
9. [User Flows](#9-user-flows)
10. [Database Schema](#10-database-schema)
11. [API Design](#11-api-design)
12. [Background Jobs Architecture](#12-background-jobs-architecture)
13. [Web Crawling Strategy](#13-web-crawling-strategy)
14. [Change Detection Logic](#14-change-detection-logic)
15. [AI Summarization Workflow](#15-ai-summarization-workflow)
16. [Notification System Design](#16-notification-system-design)
17. [Authentication System](#17-authentication-system)
18. [Billing System](#18-billing-system)
19. [Admin Panel Requirements](#19-admin-panel-requirements)
20. [Security Considerations](#20-security-considerations)
21. [Legal Architecture](#21-legal-architecture)
22. [Scaling Strategy](#22-scaling-strategy)
23. [Potential Failure Modes](#23-potential-failure-modes)
24. [Competitive Analysis](#24-competitive-analysis)
25. [Technical Architecture Diagram](#25-technical-architecture-diagram)
26. [30-Day Development Roadmap](#26-30-day-development-roadmap)
27. [90-Day Growth Roadmap](#27-90-day-growth-roadmap)

---

## 1. Executive Summary

### Product Vision
Competitor Change Tracker (CCT) is a Micro-SaaS platform that gives businesses an always-on competitive intelligence layer. It silently monitors competitor websites — pricing pages, feature lists, landing pages, ToS, and blog content — and delivers instant, AI-summarized alerts the moment anything changes. It is the only tool at the SMB price point that combines real JS-rendering with AI-generated business-context summaries.

### The Opportunity
Every SaaS founder has experienced the pain of discovering a competitor's pricing change weeks after the fact, or missing a new feature launch that repositioned their market. Manual monitoring is unreliable, expensive (analyst time), and doesn't scale. Existing enterprise tools (Crayon, Klue, Kompyte) cost $10,000–$50,000/year — leaving a massive under-served market of SMBs, indie founders, and agencies who need the same intelligence at 1/100th the cost.

### Business Model
- **SaaS Subscription** via Stripe (Starter · Growth · Agency tiers)
- **Target ARR at Month 12:** $150,000 (300 customers × $42 ARPU)
- **Payback Period Target:** < 3 months
- **Core Value Metric:** Number of tracked URLs (primary plan gate)
- **Infra Margin at Scale:** ~95% (infra ~$147/month at 100 customers)

### Why Now
- OpenAI's `gpt-4o-mini` makes AI change summarization cost ~$0.0003 per event
- Playwright makes headless rendering of JS-heavy SPAs reliable and scriptable
- Resend makes transactional email delivery developer-friendly and affordable
- Neon's serverless Postgres eliminates ops overhead for solo founders
- The build-in-public SaaS founder community is a ready-made distribution channel

### Why This Architecture
The v2.0 architecture was redesigned after a staff engineering review that identified 4 production-critical issues in v1.0:
1. Playwright launching a new browser per job → OOM at scale → **Fixed:** persistent browser pool
2. Email alerts blocked by OpenAI latency → alerts delayed during AI outages → **Fixed:** parallel pipeline, alerts fire before AI completes
3. Page content stored as Postgres TEXT blobs → DB performance cliff → **Fixed:** all content in Cloudflare R2
4. No legal shield for scraping activity → C&D exposure → **Fixed:** robots.txt layer + legal ToS clause

---

## 2. User Personas

### Persona 1 — "The Scrappy SaaS Founder" (Alex)
| Field | Detail |
|-------|--------|
| **Role** | Founder/CEO, 5-person B2B SaaS |
| **Stage** | Post-launch, pre-Series A, $10K–$80K MRR |
| **Pain** | Spends 2–3 hrs/week manually checking 5–10 competitor websites. Missed a competitor's pricing restructure that caused a sales objection he didn't know how to handle. |
| **Goal** | Know within hours if any competitor changes pricing, features, or positioning |
| **WTP** | $29–$79/month, no hesitation |
| **Tech** | High. Uses Linear, Notion, Slack, Intercom |

### Persona 2 — "The Agency Strategist" (Maria)
| Field | Detail |
|-------|--------|
| **Role** | Head of Strategy, 25-person digital marketing agency |
| **Stage** | Manages 15–30 client accounts simultaneously |
| **Pain** | Clients expect competitive intelligence reports monthly. Manual research consumes 20+ analyst hours per client per quarter. |
| **Goal** | Automate competitor monitoring across all clients. Export reports for client deliverables. |
| **WTP** | $199–$499/month for multi-workspace access |
| **Tech** | Medium-High. Prioritizes ease of use and reporting |

### Persona 3 — "The Product Manager" (Priya)
| Field | Detail |
|-------|--------|
| **Role** | Senior PM at a 100-person SaaS company |
| **Stage** | Growth-stage, has a dedicated competitive team |
| **Pain** | Competitive landscape changes faster than quarterly review cycles. Needs real-time intelligence to feed into roadmap decisions. |
| **Goal** | Track 20–50 competitor pages, route alerts to Slack, generate digest reports for leadership |
| **WTP** | $99–$199/month, expense-approved |
| **Tech** | High. Expects API access and integrations |

### Persona 4 — "The Competitive Intelligence Analyst" (Jordan)
| Field | Detail |
|-------|--------|
| **Role** | Competitive Intelligence Analyst at an enterprise (500+ employees) |
| **Stage** | Large org with a dedicated CI function |
| **Pain** | Enterprise tools are slow to configure, clunky, and prohibitively expensive. Needs fine-grained control over what's tracked and actionable AI summaries that non-technical stakeholders can act on. |
| **Goal** | Programmatically monitor hundreds of URLs, bulk-import competitors, receive structured data feeds |
| **WTP** | $499+/month with annual contract |
| **Tech** | High. Expects API, webhooks, SSO |

---

## 3. Core User Problems

| # | Problem | Severity | Frequency |
|---|---------|----------|-----------|
| P1 | Discovering competitor pricing changes too late, losing deals | Critical | Weekly |
| P2 | Wasting hours manually visiting competitor websites | High | Weekly |
| P3 | No structured history of competitor changes over time | High | Monthly |
| P4 | Raw diffs are noisy — hard to understand *what actually changed* | High | Weekly |
| P5 | Alerts go to email and get buried; no routing to Slack/Teams | Medium | Daily |
| P6 | No way to track JS-rendered SPA pages (modern competitor sites) | High | Always |
| P7 | No context around *why* a change matters strategically | Medium | Monthly |
| P8 | Multi-client agencies can't manage multiple competitor sets cleanly | Medium | Daily |
| P9 | No audit trail for compliance/legal (ToS monitoring) | Medium | Monthly |
| P10 | Enterprise tools cost too much for SMBs and solopreneurs | Critical | Always |

---

## 4. User Stories

### Authentication & Onboarding
- `US-001` As a new user, I can sign up with email/password or Google OAuth and immediately access the dashboard — **without** being blocked by email verification.
- `US-002` As a new user, I am guided through a 3-step onboarding wizard to add my first monitored URL within 2 minutes of signing up.
- `US-003` As a user, I see a non-blocking banner prompting me to verify my email, which I can dismiss and ignore initially.
- `US-004` As a user, my first URL check begins automatically right after I add it, and I see live progress feedback.

### URL Management
- `US-005` As a user, I can add a URL with a label, category tag, check frequency, and optional noise threshold.
- `US-006` As a user, I see a clear error if I try to add a URL I'm already tracking (duplicate prevention).
- `US-007` As a user, I can pause monitoring on a URL without losing its history.
- `US-008` As a user, I can delete a URL (soft delete — 30-day recovery window).
- `US-009` As a user, I can see the health status (Active / Paused / Error) of every URL I track.
- `US-010` As a user, I can optionally assign a URL to a named competitor for grouping in the dashboard.
- `US-011` As a user, I can trigger a manual check on any URL and see real-time progress via a status indicator.
- `US-012` As a user, I cannot trigger more than one manual check per URL per 10 minutes (rate limit).

### Change Detection & Alerts
- `US-013` As a user, I receive an email alert within minutes of a tracked page changing, including the diff excerpt — even before the AI summary is ready.
- `US-014` As a user, the email shows "AI analysis loading..." if the summary isn't ready, and the dashboard shows the full AI summary once it's enriched.
- `US-015` As a user, I can see a before/after text comparison of what changed.
- `US-016` As a user, I receive an AI-generated plain-English summary of what changed and why it might matter.
- `US-017` As a user, I can set a noise threshold per URL so minor changes (date updates, ad injections) don't trigger alerts.
- `US-018` As a user, I can mark an alert as "Reviewed" or "Archived."
- `US-019` As a user, I can filter my change feed by impact level (High / Medium / Low).

### Dashboard & History
- `US-020` As a user, I have a dashboard showing all recent changes across all tracked URLs, paginated by cursor (infinite scroll, no page-load degradation).
- `US-021` As a user, I can view the full change history for any specific URL.
- `US-022` As a user, I can see a screenshot of the page at the moment a change was detected.
- `US-023` As a user, new users with no changes yet see an empty state with helpful guidance ("Your first check is running…").

### Notifications
- `US-024` As a user, I can configure: immediate email, daily digest, or no email.
- `US-025` As a user, I can set a minimum impact level for email alerts (e.g., only HIGH impact).
- `US-026` As a user, I can configure quiet hours (time window + timezone) during which no emails are sent.

### Billing
- `US-027` As a user, I can subscribe to a paid plan via Stripe Checkout with a single click.
- `US-028` As a user, I can manage my subscription (upgrade, downgrade, cancel) via the Stripe Customer Portal.
- `US-029` As a user, I see a clear inline upgrade prompt the moment I hit a plan limit, not a generic error.
- `US-030` As a user on the Free tier, I can use the product with real value (3 URLs) without a credit card.

### Team & Workspace (Post-MVP)
- `US-031` As an Agency plan user, I can create multiple Workspaces (one per client).
- `US-032` As a workspace Admin, I can invite team members and assign roles (Admin / Editor / Viewer).

---

## 5. MVP Scope — True 14-Day Build

The MVP must validate the core value proposition and charge real money from Day 1. It is ruthlessly scoped to the minimum feature set that delivers the "aha moment": **add a competitor URL → receive an intelligent alert when it changes.**

### What "Aha Moment" Requires
1. Add a URL → immediately see first snapshot result
2. Competitor changes → receive email within minutes
3. Email contains enough context (diff excerpt + AI summary) to take action
4. Can pay → access removed if payment lapses

### MVP Inclusions ✅

| Feature | Priority | Day |
|---------|----------|-----|
| Email/Password auth + Google OAuth (non-blocking verification) | P0 | 1–2 |
| Stripe checkout — single "Starter" plan ($29/mo) | P0 | 2 |
| Add / pause / delete TrackedUrl | P0 | 3 |
| Playwright browser pool + R2 content storage | P0 | 4–5 |
| Hash comparison + Myers diff + noise filter | P0 | 6 |
| ChangeEvent creation + conservative impact scoring | P0 | 7 |
| Email alert via Resend (fires BEFORE AI completes) | P0 | 8 |
| Async AI enrichment (gpt-4o-mini) — updates ChangeEvent in background | P0 | 8 |
| Dashboard: change feed (cursor-paginated, infinite scroll) | P0 | 9 |
| Diff viewer: before/after text, highlighted changes | P0 | 10 |
| robots.txt checking + SSRF protection | P0 | 11 |
| Plan limit enforcement + upgrade prompt | P0 | 12 |
| Mark change as read / archived | P1 | 12 |
| URL category tag | P1 | 13 |
| Competitor name grouping (string field, not full model) | P1 | 13 |
| Empty states, error states, SSE check progress | P1 | 14 |
| Basic notification preferences (immediate / digest / off) | P1 | 14 |

### MVP Exclusions ❌ (Explicitly Deferred)

| Feature | When |
|---------|------|
| Slack / Webhook integration | Week 5–6 |
| CSS selector targeting | Week 5–6 |
| Multi-workspace (Agency plan) | Week 6–8 |
| Team member invites + RBAC | Week 6–8 |
| CSV bulk import | Week 5 |
| PDF / CSV export | Week 7 |
| Public REST API (v1) | Month 3 |
| Quiet hours / min impact level notification filters | Week 4 |
| White-labeling | Month 4+ |
| Screenshot comparison in diff viewer | Week 4 |
| Admin panel | Week 3–4 |
| 1h / 15min check frequency | Week 4 |

### MVP Success Criteria
- 10 paying customers within 14 days of launch
- < 5% false-positive alert rate (alert fired on a non-meaningful change)
- Page check latency: p95 < 30 seconds per URL
- Alert delivery: < 5 minutes from change detection to email in inbox
- System uptime: > 99%

---

## 6. Future Features (Post-MVP)

### Phase 2 — Month 2 (Retention + Expansion)
- Slack OAuth integration (connect workspace, choose channel)
- Outgoing webhook support (signed JSON payloads, Zapier-compatible)
- CSS selector targeting with live preview
- CSV bulk URL import (up to 100 URLs)
- Daily + weekly email digest (configurable send time)
- Quiet hours + minimum impact level notification filters
- Admin panel (user list, queue health, revenue dashboard)
- URL change history timeline visualization

### Phase 3 — Month 3 (Scale + API)
- Multi-workspace for Agency plan
- Team member invites + RBAC (Admin / Editor / Viewer)
- Public REST API (v1) with API key auth
- Competitive intelligence PDF report export
- CSV change history export
- Saved filter presets on the dashboard
- Keyword alerting (alert only if specific word appears/disappears)

### Phase 4 — Month 4–6 (Delight + Integrations)
- White-label for agencies (custom domain, logo)
- Browser extension (one-click "Track this page")
- Competitor profile pages (aggregated change history + velocity chart)
- AI-generated weekly competitive briefing email
- Jira / Linear / Notion: create task from change event
- Sitemap crawler (auto-suggest pages to track from a domain)
- Annual billing (2 months free)

### Phase 5 — Month 6–12 (Enterprise)
- Enterprise SSO (SAML / Okta)
- SOC 2 Type II compliance
- Custom data retention policies
- SLA-backed uptime guarantees
- RSS / blog monitoring mode
- Social media monitoring (Twitter/LinkedIn mentions)
- Competitive pricing benchmarking dashboard

---

## 7. Complete Feature Breakdown

### 7.1 URL Management Module

**Add URL Flow**
- URL input field with live validation:
  - Must be `http://` or `https://`
  - Must resolve via DNS
  - Must NOT resolve to a private IP (SSRF guard)
  - Must NOT already exist in this workspace (unique constraint)
  - robots.txt checked asynchronously; warning shown if disallowed (override allowed with acknowledged consent)
- Label field (required, max 100 chars)
- Competitor name (optional string — free-form, used for grouping in dashboard)
- Category tag: Pricing · Features · Product · Landing · ToS · Blog · Other
- Check frequency: Daily · Every 6h (plan-gated)
- Noise threshold: 1%–10% slider (default: category-based — Pricing=1%, ToS=0.5%, Blog=5%)
- Initial crawl triggered immediately on save; SSE progress indicator shown

**URL Health States**
| State | Visual | Condition |
|-------|--------|-----------|
| Active | 🟢 Green | Last check successful |
| Warning | 🟡 Yellow | Last check non-200 or empty content |
| Error | 🔴 Red | 3+ consecutive failures |
| Paused | ⚫ Grey | Manually paused |
| Deleted | — | Soft-deleted, in recovery window |

**URL List View**
- Sortable by: Last checked · Last changed · Label · Competitor
- Filterable by: Category · Status · Competitor name
- Inline actions: Pause · Resume · Check Now · Delete
- URL limit counter: "22 / 25 URLs used — Upgrade for more"

### 7.2 Change Detection Module

**Extraction Pipeline**
1. Playwright renders page with persistent browser pool (NOT per-job launch)
2. Wait strategy: `domcontentloaded` + element settle (NOT `networkidle`)
3. Extract visible text from `document.body.innerText`
4. Normalize: collapse whitespace, strip invisible characters, NFC Unicode
5. Compute SHA-256 hash of normalized text
6. Compare hash to `TrackedUrl.lastContentHash`

**Hash Match → No Change Path**
- Update `lastCheckedAt` + `nextCheckAt` on TrackedUrl
- Create minimal CheckRun record (status=SUCCESS, hash stored)
- No diff, no ChangeEvent, no alert, no AI call

**Hash Mismatch → Change Path**
- Upload normalized text to Cloudflare R2 as `snapshots/{workspaceId}/{urlId}/{checkRunId}.txt`
- Retrieve previous snapshot from R2 using `previousCheckRun.snapshotKey`
- Run Myers line-diff on the two texts
- Calculate `changePercent = (addedLines + removedLines) / totalLines × 100`
- Apply noise threshold: if `changePercent < threshold` → mark as noise → DONE
- Score impact on changed lines only (not full page text)
- Create ChangeEvent record
- Enqueue **alert** job (priority: CRITICAL) — fires immediately
- Enqueue **ai-enrich** job (priority: LOW) — fires when browser pool is free

**Noise Threshold Defaults by Category**

| Category | Default Threshold | Rationale |
|----------|-------------------|-----------|
| TOS | 0.5% | Any legal change matters |
| PRICING | 1.0% | Very sensitive |
| FEATURES | 2.0% | Allow minor copy tweaks |
| PRODUCT | 2.0% | Same |
| LANDING | 3.0% | Marketing copy changes often |
| BLOG | 5.0% | High natural update rate |
| OTHER | 2.0% | Safe default |

**Impact Scoring (diff-only, conservative)**

Impact is scored only on the *changed lines*, never the full page text. This eliminates false HIGH scoring when prices already exist on the page (they'd always exist in `afterText`).

| Signal | Condition | Weight |
|--------|-----------|--------|
| Price value changed | Different `$X` values in removed vs added lines | +60 |
| Price removed | `$X` pattern in removed lines, absent in added | +50 |
| Price added | `$X` pattern in added lines, absent in removed | +40 |
| Free tier removed | `free tier/plan` in removed, absent in added | +55 |
| Free tier added | `free tier/plan` in added, absent in removed | +30 |
| Deprecation signal | `deprecated/sunset/discontinue/removed/end of life` in changed lines | +45 |

Scoring cap: 100. Levels: **HIGH** ≥ 60 · **MEDIUM** ≥ 30 · **LOW** < 30.

### 7.3 AI Summarization Module (Async Enrichment)

- Model: `gpt-4o-mini` **always** in MVP (no dual-model complexity)
- Called **after** alert is already dispatched — never blocks alert delivery
- Input to AI: only the changed lines (not full page text) — keeps tokens low
- Output: `{ summary, key_changes[], business_impact, recommended_action }`
- On AI failure: `aiStatus = FAILED`, dashboard shows "Analysis unavailable"
- Circuit breaker: 5 consecutive failures → pause AI queue for 60s

### 7.4 Notification Module

**MVP Channels**
- Email only (via Resend)

**Post-MVP Channels**
- Slack (OAuth, channel selection)
- Webhook (signed HMAC-SHA256 JSON payload)
- Microsoft Teams
- In-app notification bell

**MVP Notification Preferences (per user per workspace)**
- Email: Immediate / Daily Digest / Off
- No alert filtering in MVP (all detected changes above threshold trigger email)
- Post-MVP: minimum impact level filter, quiet hours, per-URL overrides

**Key Constraint: Alerts fire BEFORE AI is ready.**
The email says "AI analysis is ready in the dashboard" until AI enrichment completes. This decoupling means the core value (fast alerts) is never degraded by OpenAI latency or outages.

### 7.5 Dashboard Module

**Overview Page (`/dashboard`)**
- Stats bar: URLs Monitored · Changes Last 7 Days · Open Alerts · Next Check
- Filter bar: All / High Impact / Unread / By Competitor
- Change feed: cursor-paginated, newest first, infinite scroll
- Empty state for new users: animated illustration + "Your first check is running — we'll show changes here"

**Change Feed Card**
```
┌────────────────────────────────────────────────────────────┐
│ 🔴 Acme Corp — Pricing Page                    2 hours ago │
│    12% of page changed · PRICING                           │
│                                                            │
│  AI: "Acme removed their free tier and increased Pro       │
│       from $49→$69/month. Annual billing introduced."      │
│                                                            │
│  [View Diff]  [Mark Reviewed]                              │
└────────────────────────────────────────────────────────────┘
```

**Diff View Page (`/dashboard/changes/[id]`)**
- Two-column: Before (red removed lines) | After (green added lines)
- "Jump to first change" button
- AI panel: summary, key changes, business impact, recommended action
- Metadata sidebar: URL, competitor, category, impact score, check timestamp
- Screenshot shown below diff (only taken when a change is detected)

### 7.6 Billing Module

**Plan Tiers**

| Feature | Free | Starter ($29/mo) | Growth ($79/mo) | Agency ($199/mo) |
|---------|------|-----------------|----------------|-----------------|
| Tracked URLs | 3 | 25 | 100 | 500 |
| Check Frequency | Daily | Daily · 6h | Daily · 6h · 1h | All + 15min |
| AI Summaries/mo | 10 | 200 | Unlimited | Unlimited |
| Competitor Groups | Unlimited | Unlimited | Unlimited | Unlimited |
| Team Members | 1 | 1 | 3 | 10 |
| Workspaces | 1 | 1 | 1 | 10 |
| History Retention | 7 days | 30 days | 90 days | 1 year |
| Slack / Webhook | ❌ | ✅ | ✅ | ✅ |
| CSV Export | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | Email | Chat | Dedicated |

> **MVP ships with Free + Starter plans only.** Growth and Agency plans are added in Week 3 once the core pipeline is stable.

---

## 8. Dashboard Structure

```
app/
├── (marketing)/                     ← Public marketing pages
│     ├── page.tsx                   ← Landing page
│     ├── pricing/page.tsx           ← Pricing page
│     └── blog/page.tsx              ← Blog (future)
│
├── (auth)/                          ← Auth flow pages
│     ├── sign-in/page.tsx
│     ├── sign-up/page.tsx
│     └── verify-email/page.tsx
│
└── (dashboard)/                     ← Protected dashboard
      ├── layout.tsx                 ← Dashboard shell (sidebar + header)
      ├── page.tsx                   ← Redirect to /dashboard/overview
      ├── onboarding/page.tsx        ← First-time setup wizard
      │
      ├── overview/page.tsx          ← Change feed (main dashboard)
      │
      ├── urls/
      │     ├── page.tsx             ← URL management list
      │     └── [id]/page.tsx        ← Single URL detail + history
      │
      ├── changes/
      │     ├── page.tsx             ← Change history + search
      │     └── [id]/page.tsx        ← Diff viewer + AI panel
      │
      └── settings/
            ├── page.tsx             ← Settings index (redirect)
            ├── profile/page.tsx     ← Name, email, avatar
            ├── notifications/page.tsx ← Email preferences
            └── billing/page.tsx     ← Plan + Stripe portal
```

**Sidebar Navigation**
```
[CCT Logo]

  Dashboard         /dashboard/overview
  Tracked URLs      /dashboard/urls
  Changes           /dashboard/changes
  ──────────────────
  Settings          /dashboard/settings
  Billing           /dashboard/settings/billing
  ──────────────────
  [User avatar]     → Profile / Sign out
```

**Page: `/dashboard/overview`**
- Header: stats bar (4 widgets)
- Filter bar: impact level tabs, competitor dropdown, unread toggle
- Body: `<ChangeList>` component — cursor-paginated, infinite scroll via IntersectionObserver
- Each card: competitor name, page label, category badge, impact level badge, change%, timestamp, AI summary snippet (or "Analyzing…"), action buttons

**Page: `/dashboard/changes/[id]`**
- Left panel: two-column diff (Before / After) with line-level highlights
- Right panel: AI summary card, metadata, screenshot (if available)
- Action bar: Mark Reviewed · Archive · Re-run AI
- Breadcrumb: Changes > Acme Corp — Pricing Page

---

## 9. User Flows

### Flow 1: New User Onboarding (Happy Path)

```
Sign Up (email or Google)
  → Dashboard immediately accessible (no email gate)
  → [Non-blocking] Email verification banner shown
  → Onboarding wizard starts automatically (first visit)

Step 1: "Who are you tracking?"
  → Type competitor name (e.g., "Acme Corp")
  → Optional: competitor website domain

Step 2: "Add a page to watch"
  → URL input (e.g., acme.com/pricing)
  → Category selector (Pricing selected by default)
  → Check frequency (Daily, default)

Step 3: "How do you want to be notified?"
  → Email: Immediate / Daily Digest / Off
  → [Start Monitoring] button

→ "Running your first check…" (SSE progress bar)
→ Dashboard overview with first snapshot card shown
→ Confetti / success state: "We're watching Acme Corp for you"

[If on Free tier and tries to add 4th URL]
→ Inline limit prompt: "Upgrade to Starter for 25 URLs — $29/mo"
```

### Flow 2: Change Detected → Alert Pipeline (Revised — Parallel AI)

```
Scheduler fires every 1 minute
  → Queries TrackedUrls WHERE nextCheckAt ≤ NOW() AND status = ACTIVE
  → Enqueues "check" jobs (batched, max 50/tick)

check job runs:
  → Acquires browser from warm pool (NOT launching new browser)
  → Checks robots.txt cache → if disallowed, mark ROBOTS_BLOCKED, skip
  → Navigates URL (waitUntil: domcontentloaded + 3s settle)
  → Extracts normalized text
  → Computes SHA-256 hash
  → Hash MATCH? → update timestamps, schedule next check → DONE
  → Hash MISMATCH? → uploads snapshot to R2 → enqueues "diff" job

diff job runs:
  → Downloads previous snapshot from R2
  → Runs Myers diff
  → Applies noise threshold → below threshold? → DONE (noise)
  → Scores impact on changed lines only
  → Creates ChangeEvent (beforeKey, afterKey in R2, aiStatus=PENDING)
  → Enqueues "alert" job [CRITICAL priority] ← fires immediately
  → Enqueues "ai-enrich" job [LOW priority] ← runs when pool is free

    alert and ai-enrich run IN PARALLEL:

    alert job:                           ai-enrich job:
    → Load ChangeEvent + workspace       → Fetch changed lines from R2
    → Load user notification prefs       → Build prompt (changed lines only)
    → Send email NOW via Resend          → Call gpt-4o-mini
      Subject: "⚠️ Acme changed pricing"  → Parse JSON response
      Body: diff excerpt + "AI loading"  → Update ChangeEvent
    → Create Alert record (SENT)         → aiStatus = DONE
                                         → Dashboard auto-updates (polling)
```

### Flow 3: Subscription Upgrade

```
User clicks "+ Add URL" → hits Free tier limit (3 URLs)
  → Inline banner: "You've reached your 3 URL limit"
  → [Upgrade to Starter — $29/mo] button (prominent, in-page)
  → Click → POST /api/billing/checkout { plan: 'starter' }
  → Redirect to Stripe Checkout (pre-filled email)
  → User completes payment
  → Stripe fires webhook: checkout.session.completed
  → Webhook handler: update Workspace.planName + limits in DB
  → User redirected to /dashboard/urls?upgraded=true
  → Success toast + confetti
  → URL add modal re-opens automatically
```

### Flow 4: Robots.txt Disallowed URL

```
User adds URL: stripe.com/pricing
  → URL is saved
  → First check runs
  → robots.txt for stripe.com is fetched and cached
  → robots.txt disallows our bot agent
  → CheckRun created with status: ROBOTS_BLOCKED
  → URL status set to WARNING
  → Dashboard shows: "⚠️ robots.txt disallows crawling this page"
  → Inline action: "Override (I accept responsibility)" → opens modal
  → Modal explains legal implications
  → User confirms → override flag set in DB → AuditLog entry created
  → Next check proceeds despite robots.txt restriction
```

### Flow 5: Manual Check with Live Feedback

```
User clicks "Check Now" button on URL card
  → POST /api/v1/urls/:id/check
  → Rate limit check: max 1 manual trigger per URL per 10 minutes
  → If rate limited: "Please wait X minutes before checking again"
  → Job enqueued with HIGH priority
  → Response: { jobId: "job_xxx", statusUrl: "/api/v1/jobs/job_xxx" }
  → UI opens SSE stream: GET /api/v1/jobs/job_xxx/stream
  → Progress events: "Launching browser…" → "Fetching page…" → "Comparing…"
  → On completion: SSE sends final event with changeEventId (if changed) or "no-change"
  → UI updates: new change card appears / "No changes detected" toast
```

---

## 10. Database Schema

```prisma
// schema.prisma — CCT v2.0
// Design decisions:
// - All text content stored in Cloudflare R2 (keys referenced here)
// - No separate Plan model (limits denormalized on Workspace)
// - Cursor-based pagination via autoincrement cursorId on ChangeEvent
// - NotificationPreference is USER-scoped, not workspace-scoped
// - Unique constraint on (workspaceId, url) prevents duplicates
// - Soft delete on TrackedUrl + ChangeEvent

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ════════════════════════════════════════════════
// USERS & AUTH
// ════════════════════════════════════════════════

model User {
  id               String    @id @default(cuid())
  email            String    @unique
  emailVerified    DateTime?
  passwordHash     String?
  name             String?
  avatarUrl        String?
  role             UserRole  @default(USER)
  stripeCustomerId String?   @unique

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  accounts         Account[]
  sessions         Session[]
  memberships      WorkspaceMember[]
  ownedWorkspaces  Workspace[]        @relation("WorkspaceOwner")
  apiKeys          ApiKey[]
  notifPrefs       NotificationPreference[]
  auditLogs        AuditLog[]
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  provider          String
  providerAccountId String
  accessToken       String?  @db.Text
  refreshToken      String?  @db.Text
  expiresAt         Int?
  createdAt         DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model EmailVerification {
  id        String   @id @default(cuid())
  userId    String   @unique
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model PasswordReset {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  @@index([userId])
}

// ════════════════════════════════════════════════
// WORKSPACES
// Plan limits are denormalized here — Stripe is source of truth.
// On subscription webhook: update these fields from Stripe Product metadata.
// No separate Plan table — eliminates dual-write consistency risk.
// ════════════════════════════════════════════════

model Workspace {
  id   String @id @default(cuid())
  name String
  slug String @unique

  ownerId String

  // Stripe billing state (cache — always sync from webhooks)
  stripeCustomerId     String?    @unique
  stripeSubscriptionId String?    @unique
  stripePriceId        String?
  planName             String     @default("free")
  planStatus           PlanStatus @default(ACTIVE)

  // Denormalized plan limits (synced on Stripe webhook)
  maxUrls              Int      @default(3)
  maxMembers           Int      @default(1)
  maxWorkspaces        Int      @default(1)
  maxAiSummariesMonth  Int      @default(10)
  checkFreqOptions     String[] @default(["daily"])
  historyRetentionDays Int      @default(7)

  // Feature flags (JSON for flexibility without migrations)
  // e.g. {"slack": false, "webhook": false, "api": false, "csv": false}
  featureFlags Json @default("{}")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner        User              @relation("WorkspaceOwner", fields: [ownerId], references: [id])
  members      WorkspaceMember[]
  trackedUrls  TrackedUrl[]
  changeEvents ChangeEvent[]
  integrations Integration[]
  auditLogs    AuditLog[]

  @@index([ownerId])
}

model WorkspaceMember {
  id          String        @id @default(cuid())
  workspaceId String
  userId      String
  role        WorkspaceRole @default(VIEWER)
  invitedAt   DateTime      @default(now())
  joinedAt    DateTime?

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
  @@index([userId])
}

model Invite {
  id          String        @id @default(cuid())
  workspaceId String
  email       String
  role        WorkspaceRole @default(VIEWER)
  token       String        @unique @default(cuid())
  expiresAt   DateTime
  acceptedAt  DateTime?
  createdAt   DateTime      @default(now())

  @@index([workspaceId])
  @@index([token])
}

// ════════════════════════════════════════════════
// TRACKED URLS
// ════════════════════════════════════════════════

model TrackedUrl {
  id          String @id @default(cuid())
  workspaceId String

  url           String
  label         String        @db.VarChar(100)
  competitorName String?      @db.VarChar(100)  // Free-form string (no FK in MVP)
  category      UrlCategory   @default(OTHER)
  status        UrlStatus     @default(ACTIVE)
  checkFrequency CheckFrequency @default(DAILY)

  // Noise control
  noiseThreshold Float @default(2.0)   // % threshold; 0.0 = alert on any change
  notifyMode     NotifyMode @default(ALWAYS)

  // Robots.txt compliance
  robotsTxtAllowed   Boolean?  // null=unchecked, true=allowed, false=blocked
  robotsTxtOverridden Boolean  @default(false)  // User explicitly overrode the block

  // State
  lastCheckedAt   DateTime?
  lastChangedAt   DateTime?
  lastContentHash String?    @db.VarChar(64)   // SHA-256 hex (64 chars)
  consecutiveFails Int       @default(0)
  nextCheckAt     DateTime?

  // Soft delete
  deletedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workspace    Workspace    @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  checkRuns    CheckRun[]
  changeEvents ChangeEvent[]

  // CRITICAL: Prevent duplicate URL tracking within a workspace
  @@unique([workspaceId, url])
  // Scheduler query: find all URLs due for checking
  @@index([nextCheckAt, status])
  // Soft delete filter for list queries
  @@index([workspaceId, deletedAt])
  // Competitor grouping
  @@index([workspaceId, competitorName])
}

// ════════════════════════════════════════════════
// CHECK RUNS
// Lightweight metadata only — NO content stored here.
// Content always lives in Cloudflare R2.
// ════════════════════════════════════════════════

model CheckRun {
  id           String      @id @default(cuid())
  trackedUrlId String
  status       CheckStatus

  httpStatusCode Int?
  contentHash    String?  @db.VarChar(64)
  snapshotKey    String?  // R2 object key: "snapshots/{wsId}/{urlId}/{checkRunId}.txt"
  snapshotBytes  Int?     // Size in bytes for storage cost tracking
  durationMs     Int?
  errorMessage   String?  @db.VarChar(500)   // Capped — no unbounded error strings
  robotsBlocked  Boolean  @default(false)

  createdAt DateTime @default(now())

  trackedUrl  TrackedUrl   @relation(fields: [trackedUrlId], references: [id], onDelete: Cascade)
  changeEvent ChangeEvent?

  // For diff job: "get previous successful CheckRun for this URL"
  @@index([trackedUrlId, createdAt(sort: Desc)])
  // For cleanup job: delete old CheckRuns by age
  @@index([createdAt])
}

// ════════════════════════════════════════════════
// CHANGE EVENTS
// Metadata + R2 references only. NO text blobs in Postgres.
// cursorId enables efficient cursor-based pagination.
// ════════════════════════════════════════════════

model ChangeEvent {
  id          String @id @default(cuid())
  workspaceId String
  trackedUrlId String
  checkRunId   String @unique

  // Change metrics
  changePercent Float
  impactScore   Int        @default(0)    // 0-100
  impactLevel   ImpactLevel @default(LOW)
  signals       String[]   @default([])  // e.g., ["price_value_changed", "free_tier_removed"]

  // R2 object keys (content is stored in R2, not here)
  beforeKey     String   // R2 key for previous snapshot text
  afterKey      String   // R2 key for current snapshot text
  screenshotKey String?  // R2 key for screenshot (only captured on change)

  // AI enrichment (async — populated after alert is already sent)
  aiStatus          AiStatus @default(PENDING)
  aiSummary         String?  @db.Text
  aiKeyChanges      String[] @default([])
  aiBusinessImpact  String?  @db.VarChar(1000)
  aiRecommendation  String?  @db.VarChar(500)
  aiModel           String?  @db.VarChar(50)
  aiProcessedAt     DateTime?
  aiRetries         Int      @default(0)

  // User interaction state
  isRead     Boolean @default(false)
  isArchived Boolean @default(false)

  // Soft delete
  deletedAt DateTime?

  // Cursor field for efficient pagination (replaces offset-based)
  cursorId BigInt @default(autoincrement())

  createdAt DateTime @default(now())

  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  trackedUrl  TrackedUrl @relation(fields: [trackedUrlId], references: [id])
  checkRun    CheckRun   @relation(fields: [checkRunId], references: [id])
  alerts      Alert[]

  // Dashboard feed (cursor-based, newest first)
  @@index([workspaceId, cursorId(sort: Desc)])
  // Unread feed (filtered view)
  @@index([workspaceId, isRead, cursorId(sort: Desc)])
  // Per-URL history
  @@index([trackedUrlId, cursorId(sort: Desc)])
  // Impact filtering
  @@index([workspaceId, impactLevel, cursorId(sort: Desc)])
}

// ════════════════════════════════════════════════
// ALERTS
// Record of each notification dispatched.
// ════════════════════════════════════════════════

model Alert {
  id            String      @id @default(cuid())
  changeEventId String
  channel       AlertChannel
  status        AlertStatus @default(PENDING)
  sentAt        DateTime?
  failureReason String?     @db.VarChar(500)
  retries       Int         @default(0)

  // Delivery metadata (no secrets here)
  recipientEmail String? @db.VarChar(255)
  webhookUrl     String? @db.VarChar(2048)
  slackChannel   String? @db.VarChar(100)

  createdAt DateTime @default(now())

  changeEvent ChangeEvent @relation(fields: [changeEventId], references: [id], onDelete: Cascade)

  @@index([changeEventId])
  @@index([status, createdAt])
}

// ════════════════════════════════════════════════
// NOTIFICATION PREFERENCES
// Per USER per WORKSPACE — not per workspace only.
// This allows team members to have individual preferences.
// ════════════════════════════════════════════════

model NotificationPreference {
  id          String @id @default(cuid())
  userId      String
  workspaceId String

  // Email
  emailEnabled Boolean         @default(true)
  emailDigest  DigestFrequency @default(IMMEDIATE)

  // Post-MVP fields (present in schema, gated in UI)
  slackEnabled    Boolean     @default(false)
  webhookEnabled  Boolean     @default(false)
  minImpactLevel  ImpactLevel @default(LOW)
  quietHoursStart String?     // "22:00"
  quietHoursEnd   String?     // "08:00"
  quietHoursTz    String      @default("UTC")

  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
  @@index([userId])
}

// ════════════════════════════════════════════════
// INTEGRATIONS (Post-MVP)
// ════════════════════════════════════════════════

model Integration {
  id          String          @id @default(cuid())
  workspaceId String
  type        IntegrationType
  name        String          @db.VarChar(100)
  isActive    Boolean         @default(true)

  // Slack
  slackTeamId   String?
  slackChannel  String?
  slackBotToken String? @db.Text  // Encrypted at application layer

  // Webhook
  webhookUrl    String? @db.VarChar(2048)  // Validated against SSRF blocklist on save
  webhookSecret String? @db.VarChar(64)    // HMAC-SHA256 signing secret

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId])
}

// ════════════════════════════════════════════════
// API KEYS (Post-MVP)
// ════════════════════════════════════════════════

model ApiKey {
  id          String   @id @default(cuid())
  userId      String
  workspaceId String
  name        String   @db.VarChar(100)
  keyHash     String   @unique   // SHA-256 hash — plaintext never stored
  keyPrefix   String   @db.VarChar(12)  // "cct_xxxx..." for display
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([workspaceId])
}

// ════════════════════════════════════════════════
// ROBOTS.TXT CACHE
// Cached per domain, expires after 24 hours.
// Prevents fetching robots.txt on every check.
// ════════════════════════════════════════════════

model RobotsTxtCache {
  domain    String   @id         // Primary key = domain (e.g., "acme.com")
  content   String   @db.Text
  fetchedAt DateTime @default(now())
  expiresAt DateTime

  @@index([expiresAt])
}

// ════════════════════════════════════════════════
// MONTHLY USAGE
// Composite PK eliminates lock contention from single-row updates.
// Use UPSERT with increment — no SELECT then UPDATE.
// ════════════════════════════════════════════════

model MonthlyUsage {
  workspaceId  String
  month        String  // "2026-06" (YYYY-MM)
  checksRun    Int     @default(0)
  aiSummaries  Int     @default(0)
  alertsSent   Int     @default(0)
  bytesStored  BigInt  @default(0)  // R2 bytes for cost tracking

  @@id([workspaceId, month])
}

// ════════════════════════════════════════════════
// AUDIT LOG
// Append-only. Never deleted. Used for admin ops + GDPR.
// ════════════════════════════════════════════════

model AuditLog {
  id          BigInt   @id @default(autoincrement())
  workspaceId String?
  userId      String?
  action      String   // "url.deleted", "plan.upgraded", "robots.overridden", etc.
  targetType  String?  // "TrackedUrl", "WorkspaceMember", etc.
  targetId    String?
  metadata    Json?
  ip          String?  @db.VarChar(45)
  userAgent   String?  @db.VarChar(300)
  createdAt   DateTime @default(now())

  user      User?      @relation(fields: [userId], references: [id])
  workspace Workspace? @relation(fields: [workspaceId], references: [id])

  @@index([workspaceId, createdAt(sort: Desc)])
  @@index([userId, createdAt(sort: Desc)])
}

// ════════════════════════════════════════════════
// ENUMS
// ════════════════════════════════════════════════

enum UserRole         { USER ADMIN }
enum WorkspaceRole    { ADMIN EDITOR VIEWER }
enum PlanStatus       { ACTIVE PAST_DUE CANCELED }
enum UrlCategory      { PRICING FEATURES PRODUCT LANDING TOS BLOG OTHER }
enum UrlStatus        { ACTIVE PAUSED ERROR }
enum CheckFrequency   { DAILY SIX_HOURS ONE_HOUR }
enum NotifyMode       { ALWAYS HIGH_IMPACT NEVER }
enum CheckStatus      { SUCCESS FAILED TIMEOUT BLOCKED ROBOTS_BLOCKED }
enum ImpactLevel      { LOW MEDIUM HIGH }
enum AlertChannel     { EMAIL SLACK WEBHOOK }
enum AlertStatus      { PENDING SENT FAILED }
enum DigestFrequency  { IMMEDIATE DAILY WEEKLY }
enum IntegrationType  { SLACK WEBHOOK }
enum AiStatus         { PENDING PROCESSING DONE FAILED SKIPPED }
```

---

## 11. API Design

### Base URL
```
Production:  https://app.competitortracker.io/api
Development: http://localhost:3000/api
```

### Authentication
- **Web sessions:** HTTP-only Secure cookie (`SameSite=Lax`), managed by Auth.js v5
- **API keys (Post-MVP):** `Authorization: Bearer cct_<key>` — resolved by SHA-256 hash lookup, must match `workspaceId` in route

### Global Rules
- All non-auth routes require authenticated session or API key
- All workspace-scoped routes validate membership before responding
- All mutation routes: idempotency via request IDs on critical operations
- Rate limits enforced via Upstash Redis (sliding window per user)

---

### Auth Endpoints

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| POST | `/api/auth/register` | Register with email + password | 5/min/IP |
| POST | `/api/auth/login` | Email/password login | 5/min/IP |
| POST | `/api/auth/logout` | Invalidate session | — |
| GET  | `/api/auth/me` | Current user + active workspace | — |
| POST | `/api/auth/forgot-password` | Send reset email | 3/hour/email |
| POST | `/api/auth/reset-password` | Confirm password reset | 5/min/IP |
| POST | `/api/auth/verify-email` | Verify email token | 10/hour |
| GET  | `/api/auth/google` | Google OAuth initiation | — |
| GET  | `/api/auth/google/callback` | Google OAuth callback | — |

---

### Tracked URL Endpoints (MVP Core)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/urls` | List tracked URLs (workspace-scoped) | Session |
| POST | `/api/v1/urls` | Add tracked URL | Session |
| GET | `/api/v1/urls/:id` | Get URL details + recent check status | Session |
| PATCH | `/api/v1/urls/:id` | Update URL config | Session |
| DELETE | `/api/v1/urls/:id` | Soft-delete URL | Session |
| POST | `/api/v1/urls/:id/check` | Trigger manual check | Session, 1/URL/10min |
| POST | `/api/v1/urls/:id/pause` | Pause monitoring | Session |
| POST | `/api/v1/urls/:id/resume` | Resume monitoring | Session |
| POST | `/api/v1/urls/:id/restore` | Restore soft-deleted URL | Session |

**POST `/api/v1/urls` — Request Body**
```json
{
  "url": "https://acme.com/pricing",
  "label": "Acme Pricing Page",
  "competitorName": "Acme Corp",
  "category": "PRICING",
  "checkFrequency": "DAILY",
  "noiseThreshold": 1.0
}
```

**POST `/api/v1/urls` — Validation Logic (server-side)**
1. URL format valid? (http/https only)
2. URL resolves via DNS? (with 5s timeout)
3. Resolved IP not in SSRF blocklist?
4. URL does not already exist in `(workspaceId, url)`?
5. Workspace `urlCount < workspace.maxUrls`?
6. robots.txt check: fetch + cache, set `robotsTxtAllowed`; if `false`, return 200 with `{ robotsWarning: true }` but save the URL

**POST `/api/v1/urls` — Response (201)**
```json
{
  "id": "clx...",
  "url": "https://acme.com/pricing",
  "label": "Acme Pricing Page",
  "competitorName": "Acme Corp",
  "category": "PRICING",
  "status": "ACTIVE",
  "checkFrequency": "DAILY",
  "noiseThreshold": 1.0,
  "robotsTxtAllowed": true,
  "nextCheckAt": "2026-06-17T07:00:00Z",
  "createdAt": "2026-06-16T07:00:00Z"
}
```

**GET `/api/v1/urls` — Response**
```json
{
  "data": [
    {
      "id": "clx...",
      "url": "https://acme.com/pricing",
      "label": "Acme Pricing Page",
      "competitorName": "Acme Corp",
      "category": "PRICING",
      "status": "ACTIVE",
      "lastCheckedAt": "2026-06-16T06:00:00Z",
      "lastChangedAt": "2026-06-15T14:22:00Z",
      "consecutiveFails": 0,
      "nextCheckAt": "2026-06-17T07:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "limit": 50
  }
}
```

---

### Change Event Endpoints (MVP Core)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/changes` | List change events (cursor-paginated) |
| GET | `/api/v1/changes/:id` | Get single change event + metadata |
| GET | `/api/v1/changes/:id/diff` | Get before/after text from R2 |
| PATCH | `/api/v1/changes/:id` | Mark read / archived |

**GET `/api/v1/changes` — Query Parameters**
```
cursor        string    Cursor from previous page (cursorId value)
limit         int       1-50, default 20
competitorName string   Filter by competitor name
category      string    PRICING|FEATURES|PRODUCT|LANDING|TOS|BLOG|OTHER
impactLevel   string    LOW|MEDIUM|HIGH
isRead        boolean   true|false
trackedUrlId  string    Filter by specific URL
```

**GET `/api/v1/changes` — Response**
```json
{
  "data": [
    {
      "id": "clx...",
      "cursorId": "8942",
      "trackedUrlId": "clx...",
      "url": "https://acme.com/pricing",
      "label": "Acme Pricing Page",
      "competitorName": "Acme Corp",
      "category": "PRICING",
      "changePercent": 12.4,
      "impactScore": 72,
      "impactLevel": "HIGH",
      "signals": ["price_value_changed", "free_tier_removed"],
      "aiStatus": "DONE",
      "aiSummary": "Acme removed their free tier...",
      "aiKeyChanges": ["Free tier removed", "Pro plan increased $49→$69"],
      "isRead": false,
      "isArchived": false,
      "screenshotKey": "screenshots/...",
      "createdAt": "2026-06-16T06:30:00Z"
    }
  ],
  "nextCursor": "8901",
  "hasMore": true
}
```

**GET `/api/v1/changes/:id/diff` — Response**
```json
{
  "changeEventId": "clx...",
  "before": "... normalized text before ...",
  "after": "... normalized text after ...",
  "diff": [
    { "type": "equal", "lines": ["Pricing", "Plans for every team"] },
    { "type": "removed", "lines": ["Free", "$0/month", "3 users"] },
    { "type": "added", "lines": ["Starter", "$29/month", "5 users"] }
  ]
}
```

---

### Job Status Endpoints (SSE)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/jobs/:jobId/stream` | SSE stream for job progress |
| GET | `/api/v1/jobs/:jobId` | Poll job status (fallback) |

**SSE Event Stream**
```
data: {"event":"started","message":"Browser initializing..."}
data: {"event":"progress","message":"Fetching page...","percent":30}
data: {"event":"progress","message":"Comparing content...","percent":70}
data: {"event":"complete","result":"changed","changeEventId":"clx..."}
   OR
data: {"event":"complete","result":"no-change"}
   OR
data: {"event":"error","message":"Page returned 404"}
```

---

### Billing Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/billing/usage` | Current plan + usage stats |
| POST | `/api/billing/checkout` | Create Stripe Checkout session |
| POST | `/api/billing/portal` | Create Stripe Customer Portal session |
| POST | `/api/stripe/webhook` | Stripe event handler (public, signature-verified) |

**POST `/api/billing/checkout` — Request Body**
```json
{
  "planName": "starter",
  "billingPeriod": "monthly"
}
```

**POST `/api/stripe/webhook` — Events Handled**
```
checkout.session.completed     → Activate subscription, update Workspace limits
customer.subscription.updated  → Update plan limits (upgrade/downgrade)
customer.subscription.deleted  → Downgrade to free, update Workspace limits
invoice.payment_failed         → Set planStatus=PAST_DUE, send warning email
invoice.payment_succeeded      → Set planStatus=ACTIVE
```

**Stripe Webhook Security**
```typescript
// Every webhook must pass signature verification before any DB write
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  rawBody,            // Raw Buffer, not parsed JSON
  sig,
  process.env.STRIPE_WEBHOOK_SECRET!
);
// If constructEvent throws → return 400 immediately
```

---

### Settings Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/settings/notifications` | Get user's notification prefs |
| PATCH | `/api/v1/settings/notifications` | Update notification prefs |
| GET | `/api/v1/settings/profile` | Get user profile |
| PATCH | `/api/v1/settings/profile` | Update name, avatar |
| DELETE | `/api/v1/account` | Delete account + all data (GDPR) |

---

## 12. Background Jobs Architecture

### Technology: pg-boss

PostgreSQL-native job queue. No Redis required in MVP. Uses `LISTEN/NOTIFY` for near-real-time job pickup (not polling). Poll interval fallback: 5 seconds (not the default 2s — reduces baseline DB load).

### Worker Service

Runs as a **separate process** from the Next.js app — its own Fly.io machine. This isolation means a Playwright crash cannot affect the web API. The worker process:
- Initializes the browser pool on startup (3 warm Chromium instances)
- Registers all job handlers with pg-boss
- Processes jobs with bounded concurrency per queue

### 4-Stage Job Pipeline

```
STAGE 1: "check"
  ├── Priority: NORMAL
  ├── Concurrency: 10 (bounded by browser pool size × page slots)
  ├── Timeout: 30s
  ├── Retries: 2 (with 30s backoff)
  └── Input: { trackedUrlId }

STAGE 2: "diff"
  ├── Priority: HIGH
  ├── Concurrency: 20
  ├── Timeout: 15s
  ├── Retries: 3
  └── Input: { checkRunId, trackedUrlId }

STAGE 3: "alert" ← FIRES IMMEDIATELY, NEVER WAITS FOR AI
  ├── Priority: CRITICAL
  ├── Concurrency: 20
  ├── Timeout: 15s
  ├── Retries: 5 (exponential backoff: 1s, 2s, 4s, 8s, 16s)
  └── Input: { changeEventId }

STAGE 4: "ai-enrich" ← RUNS IN PARALLEL WITH "alert"
  ├── Priority: LOW
  ├── Concurrency: 5 (OpenAI rate limit headroom)
  ├── Timeout: 45s
  ├── Retries: 3
  └── Input: { changeEventId }
```

### Scheduler (Cron, every 1 minute)

```
Every minute:
  SELECT id, nextCheckAt FROM TrackedUrl
  WHERE status = 'ACTIVE'
    AND nextCheckAt <= NOW()
    AND deletedAt IS NULL
  LIMIT 100
  FOR UPDATE SKIP LOCKED   ← Prevents double-scheduling in multi-worker future

  → Enqueue one "check" job per URL
  → SET nextCheckAt based on checkFrequency
```

Deadman monitoring: Sentry Crons monitors this job. If it doesn't complete within 2 minutes, an alert fires to the admin.

### Full Job Flow (Annotated)

```
SCHEDULER (cron, 1min)
  └─► Batch enqueue "check" jobs for due URLs

"check" job
  1. Acquire browser from pool (wait up to 30s)
  2. Check robots.txt cache:
     - Cache hit + not expired → use cached result
     - Cache miss → fetch robots.txt (5s timeout) → cache 24h
     - If disallowed AND not overridden → set status=ROBOTS_BLOCKED → DONE
  3. Create new browser context (NOT new browser)
  4. Navigate to URL:
     - waitUntil: 'domcontentloaded'
     - After load: wait for target element OR 3s (whichever first)
  5. Extract visible text (document.body.innerText)
  6. Normalize text (collapse whitespace, strip invisible chars)
  7. Compute SHA-256 hash
  8. Compare to TrackedUrl.lastContentHash
     - MATCH: update lastCheckedAt + nextCheckAt → DONE
     - MISMATCH:
       a. Upload normalized text to R2 as snapshot
       b. Create CheckRun { status: SUCCESS, hash, snapshotKey }
       c. Update TrackedUrl { lastCheckedAt, lastContentHash, nextCheckAt }
       d. Enqueue "diff" job { checkRunId, trackedUrlId }
  9. Release browser context
 10. Release browser back to pool
 11. On error: increment consecutiveFails, set status=ERROR if ≥ 3

"diff" job
  1. Load CheckRun (current) + TrackedUrl
  2. Load previous CheckRun:
     SELECT * FROM CheckRun
     WHERE trackedUrlId = :id AND status = 'SUCCESS'
     ORDER BY createdAt DESC
     LIMIT 1 OFFSET 1          ← The one before current
  3. Download previousSnapshot from R2 (previousCheckRun.snapshotKey)
  4. Download currentSnapshot from R2 (currentCheckRun.snapshotKey)
  5. Run Myers diff (diffLines)
  6. Calculate changePercent
  7. Apply noise threshold (from TrackedUrl.noiseThreshold)
     - Below threshold → mark CheckRun with note "noise" → DONE
  8. Score impact on changed lines only
  9. Capture screenshot → upload to R2 as screenshotKey
 10. Create ChangeEvent {
       beforeKey, afterKey, screenshotKey,
       changePercent, impactScore, impactLevel, signals,
       aiStatus: PENDING
     }
 11. Update TrackedUrl.lastChangedAt
 12. Enqueue "alert" { changeEventId }   [CRITICAL priority]
 13. Enqueue "ai-enrich" { changeEventId } [LOW priority]
     (Stages 3 and 4 run concurrently from this point)

"alert" job  (CRITICAL priority — runs first)
  1. Load ChangeEvent + TrackedUrl + Workspace
  2. Load NotificationPreference for each workspace member
  3. For each member with emailEnabled = true:
     a. Check quiet hours (post-MVP)
     b. Check minImpactLevel (post-MVP)
     c. Send email via Resend:
        - Subject: "⚠️ [CompetitorName] changed their [Label]"
        - Body: diff excerpt (first 5 changed lines), "AI analysis loading…"
        - CTA: "View Full Change →"
     d. Create Alert { channel: EMAIL, status: SENT }
  4. Increment MonthlyUsage.alertsSent via upsert

"ai-enrich" job  (LOW priority — runs when pool available)
  1. Check MonthlyUsage.aiSummaries vs Workspace.maxAiSummariesMonth
     - Limit reached → set aiStatus = SKIPPED → DONE
  2. Load ChangeEvent
  3. Download beforeSnapshot + afterSnapshot from R2
  4. Extract only changed lines (from diff)
  5. Build prompt (changed lines only — keeps tokens low)
  6. Call OpenAI gpt-4o-mini with circuit breaker
  7. Parse JSON response { summary, key_changes, business_impact, recommended_action }
  8. Update ChangeEvent {
       aiStatus: DONE,
       aiSummary, aiKeyChanges, aiBusinessImpact, aiRecommendation,
       aiModel: "gpt-4o-mini", aiProcessedAt
     }
  9. Increment MonthlyUsage.aiSummaries via upsert
 10. On failure (all retries exhausted): set aiStatus = FAILED
```

### Maintenance Jobs (Nightly Crons)

```
"cleanup" — runs daily at 02:00 UTC
  1. Delete CheckRuns older than max(plan.historyRetentionDays) for each workspace
     (use batched deletes of 500 rows — avoid table bloat)
  2. Delete expired sessions
  3. Delete expired email verification tokens
  4. Expire robots.txt cache entries
  5. Delete soft-deleted TrackedUrls older than 30 days

"usage-reset" — runs on the 1st of each month at 00:01 UTC
  No action needed — MonthlyUsage uses (workspaceId, month) as PK
  New month = new row on first upsert

"health-check" — runs every 5 minutes
  1. Ping browser pool: verify all instances are connected
  2. Replace any disconnected instance
  3. Report queue depths to Sentry metrics
```

---

## 13. Web Crawling Strategy

### Why Playwright

Most competitor sites (especially SaaS pricing pages) are JavaScript-rendered SPAs. A simple `fetch()` or `axios.get()` returns an empty HTML shell. Playwright runs a real Chromium browser, executes JavaScript, and extracts the fully-rendered content.

### Browser Pool Implementation

**Critical design choice:** One persistent browser pool per worker process. **Never** launch a new browser per job.

```typescript
// worker/browser-pool.ts
import { Browser, BrowserContext, chromium, LaunchOptions } from 'playwright';

const POOL_SIZE = 3;  // 3 instances = ~1.2GB RAM — safe on a 2GB Fly.io machine
const LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',   // Critical for Docker containers
  '--no-first-run',
  '--disable-extensions',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
];

const browsers: Browser[] = [];
const available: Browser[] = [];

export async function initBrowserPool(): Promise<void> {
  for (let i = 0; i < POOL_SIZE; i++) {
    const browser = await chromium.launch({ args: LAUNCH_ARGS });
    browsers.push(browser);
    available.push(browser);
  }
  // Health check: replace crashed instances every 60s
  setInterval(healPool, 60_000);
}

async function healPool(): Promise<void> {
  for (let i = 0; i < browsers.length; i++) {
    if (!browsers[i].isConnected()) {
      try {
        const fresh = await chromium.launch({ args: LAUNCH_ARGS });
        browsers[i] = fresh;
        if (!available.includes(fresh)) available.push(fresh);
      } catch (err) {
        console.error('Failed to replace crashed browser:', err);
      }
    }
  }
}

export async function acquireBrowser(timeoutMs = 30_000): Promise<Browser> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const browser = available.shift();
    if (browser?.isConnected()) return browser;
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Browser pool exhausted — increase POOL_SIZE or reduce concurrency');
}

export function releaseBrowser(browser: Browser): void {
  available.push(browser);
}
```

### Crawl Function

```typescript
// worker/crawler.ts
import { acquireBrowser, releaseBrowser } from './browser-pool';
import { validateExternalUrl } from '../lib/ssrf-guard';
import { isAllowedByRobots } from '../lib/robots';

interface CrawlResult {
  text: string;
  statusCode: number;
  durationMs: number;
  robotsBlocked: boolean;
}

export async function crawlUrl(
  url: string,
  options: {
    robotsTxtOverridden?: boolean;
    userAgent?: string;
  } = {}
): Promise<CrawlResult> {
  // SSRF guard always runs (even for overridden URLs)
  await validateExternalUrl(url);

  const start = Date.now();
  const browser = await acquireBrowser();
  let context = null;

  try {
    context = await browser.newContext({
      userAgent: options.userAgent ??
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      viewport: { width: 1440, height: 900 },
      // Block unnecessary resources to speed up crawl
      serviceWorkers: 'block',
    });

    // Block heavy resources that don't affect text content
    await context.route('**/*.{png,jpg,jpeg,gif,svg,mp4,woff,woff2,ttf}',
      route => route.abort()
    );

    const page = await context.newPage();

    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 15_000,
    });

    // Wait for content to settle: target selector or 3s, whichever comes first
    await Promise.race([
      page.waitForLoadState('load').catch(() => {}),
      new Promise(r => setTimeout(r, 3_000)),
    ]);

    const rawText = await page.evaluate(() => document.body.innerText);
    const text = normalizeText(rawText);

    return {
      text,
      statusCode: response?.status() ?? 0,
      durationMs: Date.now() - start,
      robotsBlocked: false,
    };
  } finally {
    await context?.close();     // Close context (not browser)
    releaseBrowser(browser);    // Return browser to pool
  }
}

function normalizeText(text: string): string {
  return text
    .replace(/\u200B/g, '')           // Zero-width spaces
    .replace(/[\u0000-\u0008]/g, '')  // Control characters
    .replace(/\t/g, ' ')              // Tabs → spaces
    .replace(/ {2,}/g, ' ')          // Multiple spaces → one
    .replace(/\n{3,}/g, '\n\n')      // Max 2 newlines in a row
    .replace(/^\s+|\s+$/gm, '')      // Trim each line
    .normalize('NFC')                 // Unicode normalization
    .trim();
}
```

### Content Storage in Cloudflare R2

All text snapshots and screenshots go to R2. Nothing goes into Postgres TEXT columns.

```typescript
// lib/r2.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

export async function uploadSnapshot(
  key: string,  // "snapshots/{workspaceId}/{urlId}/{checkRunId}.txt"
  content: string
): Promise<{ key: string; bytes: number }> {
  const buf = Buffer.from(content, 'utf-8');
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buf,
    ContentType: 'text/plain; charset=utf-8',
    // Auto-expire based on plan retention (set at upload time)
    // Enforced via R2 lifecycle rules per prefix
  }));
  return { key, bytes: buf.byteLength };
}

export async function downloadSnapshot(key: string): Promise<string> {
  const response = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const chunks: Buffer[] = [];
  for await (const chunk of response.Body as AsyncIterable<Buffer>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

export async function uploadScreenshot(
  key: string,  // "screenshots/{workspaceId}/{changeEventId}.png"
  buffer: Buffer
): Promise<{ key: string }> {
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
  }));
  return { key };
}
```

### Anti-Bot Measures

| Technique | Implementation |
|-----------|---------------|
| Realistic User-Agent | Pool of 5 real Chrome UA strings, rotated per check |
| Image blocking | Block image/video/font downloads (faster + less fingerprint surface) |
| Request jitter | Random 1–4s delay between jobs targeting the same domain |
| Per-domain rate limit | Max 1 concurrent request per domain at any time (Upstash Redis counter) |
| Realistic viewport | 1440×900 desktop |
| Context isolation | Fresh browser context per check (not shared cookies) |
| Proxy pool (Phase 2) | Residential proxies via Bright Data for blocked domains |

---

## 14. Change Detection Logic

### Step 1: Fast Hash Comparison

```typescript
import crypto from 'crypto';

export function computeHash(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf-8').digest('hex');
}

// Quick check before any expensive operations
const hasChanged = computeHash(newText) !== trackedUrl.lastContentHash;
if (!hasChanged) {
  // Update timestamps only — no diff, no AI, no alert
  return { changed: false };
}
```

### Step 2: Myers Diff (Line-Level)

```typescript
import * as Diff from 'diff';

export interface DiffResult {
  addedLines: string[];
  removedLines: string[];
  changePercent: number;
  formattedDiff: Array<{
    type: 'equal' | 'added' | 'removed';
    lines: string[];
  }>;
}

export function computeTextDiff(before: string, after: string): DiffResult {
  const parts = Diff.diffLines(before, after);

  const addedLines: string[] = [];
  const removedLines: string[] = [];
  const totalLines = before.split('\n').length;

  const formattedDiff = parts.map(part => {
    const lines = (part.value ?? '').split('\n').filter(l => l.length > 0);
    if (part.added) {
      addedLines.push(...lines);
      return { type: 'added' as const, lines };
    }
    if (part.removed) {
      removedLines.push(...lines);
      return { type: 'removed' as const, lines };
    }
    return { type: 'equal' as const, lines };
  });

  const changePercent = totalLines > 0
    ? ((addedLines.length + removedLines.length) / totalLines) * 100
    : 0;

  return { addedLines, removedLines, changePercent, formattedDiff };
}
```

### Step 3: Noise Filtering

```typescript
const CATEGORY_THRESHOLDS: Record<string, number> = {
  TOS: 0.5,
  PRICING: 1.0,
  FEATURES: 2.0,
  PRODUCT: 2.0,
  LANDING: 3.0,
  BLOG: 5.0,
  OTHER: 2.0,
};

export function isSignificant(
  changePercent: number,
  userThreshold: number | null,
  category: string
): boolean {
  const threshold = userThreshold ?? CATEGORY_THRESHOLDS[category] ?? 2.0;
  return changePercent >= threshold;
}
```

### Step 4: Impact Scoring (Diff-Only)

**Critical constraint:** Score is computed only on `addedLines` and `removedLines` — the changed content. Never the full page. This prevents false HIGH scoring when prices already exist on the page before the change.

```typescript
export interface ScoreResult {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  signals: string[];
}

export function scoreChange(
  addedLines: string[],
  removedLines: string[]
): ScoreResult {
  let score = 0;
  const signals: string[] = [];
  const addedText = addedLines.join('\n');
  const removedText = removedLines.join('\n');

  // Price value changed (different amounts in removed vs added)
  const pricesBefore = removedText.match(/\$[\d,]+(?:\.\d{2})?/g) ?? [];
  const pricesAfter = addedText.match(/\$[\d,]+(?:\.\d{2})?/g) ?? [];
  if (pricesBefore.length > 0 && pricesAfter.length > 0) {
    const changed = pricesBefore.some(p => !pricesAfter.includes(p));
    if (changed) { score += 60; signals.push('price_value_changed'); }
  } else if (pricesBefore.length > 0 && pricesAfter.length === 0) {
    score += 50; signals.push('price_removed');
  } else if (pricesBefore.length === 0 && pricesAfter.length > 0) {
    score += 40; signals.push('price_added');
  }

  // Free tier
  const freeRegex = /\bfree\s*(tier|plan|forever)?\b/i;
  const freeInRemoved = freeRegex.test(removedText);
  const freeInAdded = freeRegex.test(addedText);
  if (freeInRemoved && !freeInAdded) { score += 55; signals.push('free_tier_removed'); }
  if (!freeInRemoved && freeInAdded) { score += 30; signals.push('free_tier_added'); }

  // Deprecation language in changed lines
  if (/\b(deprecated|sunset|discontinu|end.of.life|removed|no.longer)\b/i.test(
    addedText + removedText
  )) {
    score += 45; signals.push('deprecation_signal');
  }

  const capped = Math.min(score, 100);
  const level = capped >= 60 ? 'HIGH' : capped >= 30 ? 'MEDIUM' : 'LOW';
  return { score: capped, level, signals };
}
```

---

## 15. AI Summarization Workflow

### Principles
- **AI enriches, it doesn't gate.** Alerts are sent before AI runs. AI is a delight layer.
- **gpt-4o-mini always** in MVP. No dual-model complexity. Re-evaluate at Month 3.
- **Token budget:** Input from changed lines only (not full page) → ~1,000 tokens average
- **Cost:** ~$0.0002 per summarization. At 5,000/month = $1.00. Negligible.
- **Circuit breaker:** 5 consecutive failures → skip for 60 seconds

### System Prompt

```
You are an elite competitive intelligence analyst. You monitor competitor websites 
for businesses and deliver concise, actionable insights.

You receive:
1. URL label and page category
2. Lines that were REMOVED from the page (before)
3. Lines that were ADDED to the page (after)

Respond with ONLY a valid JSON object — no markdown, no explanation:
{
  "summary": "2-3 sentence plain English summary of what changed. Be specific.",
  "key_changes": ["Change 1", "Change 2"],   // max 5, max 15 words each
  "business_impact": "1-2 sentences on competitive significance.",
  "recommended_action": "One concrete action to take right now."
}

Rules:
- Focus exclusively on what CHANGED, not what stayed the same
- Call out specific numbers (prices, percentages, feature names)
- If a free tier was removed or added, lead with that
- Avoid jargon. Write like you're texting a colleague.
- Summary must be under 80 words.
```

### User Prompt Template

```typescript
function buildPrompt(params: {
  label: string;
  category: string;
  addedLines: string[];
  removedLines: string[];
}): string {
  const removed = params.removedLines.slice(0, 50).join('\n');  // max 50 lines
  const added = params.addedLines.slice(0, 50).join('\n');

  return `
URL: ${params.label}
Category: ${params.category}

REMOVED LINES (what disappeared):
${removed || '(none)'}

ADDED LINES (what appeared):
${added || '(none)'}

Analyze the change and respond with JSON.
`.trim();
}
```

### OpenAI Call with Circuit Breaker

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

let circuitFailures = 0;
const CIRCUIT_THRESHOLD = 5;
let circuitResetTimer: NodeJS.Timeout | null = null;

async function callAI(prompt: string): Promise<AiResult> {
  if (circuitFailures >= CIRCUIT_THRESHOLD) {
    throw new Error('AI circuit breaker open');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,          // Deterministic for reliability
      max_tokens: 400,
    });

    const raw = response.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw);

    // Reset circuit on success
    circuitFailures = 0;
    if (circuitResetTimer) { clearTimeout(circuitResetTimer); circuitResetTimer = null; }

    return {
      summary: parsed.summary ?? null,
      keyChanges: Array.isArray(parsed.key_changes) ? parsed.key_changes : [],
      businessImpact: parsed.business_impact ?? null,
      recommendation: parsed.recommended_action ?? null,
    };
  } catch (error) {
    circuitFailures++;
    if (!circuitResetTimer) {
      circuitResetTimer = setTimeout(() => {
        circuitFailures = 0;
        circuitResetTimer = null;
      }, 60_000);
    }
    throw error;
  }
}
```

---

## 16. Notification System Design

### Core Design Principle

**Alerts are never blocked by AI.** The email sends immediately with a diff excerpt. The AI summary appears in the dashboard and — if the user hasn't opened the email yet — can be referenced there.

### Email Design (via Resend + React Email)

**Immediate Alert Email (Before AI)**
```
Subject: ⚠️ Acme Corp changed their Pricing Page

Hi [Name],

We detected a change on a page you're monitoring.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACME CORP — PRICING PAGE
Detected: June 16, 2026 · 6:30 AM UTC
Impact: 🔴 HIGH · 12% of page changed
Category: Pricing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT CHANGED (first 5 lines):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Free  $0/month  Up to 3 users
+ Starter  $29/month  Up to 5 users
- Most Popular: Pro ($49/month)
+ Most Popular: Business ($79/month)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI Analysis: Loading in dashboard...

[VIEW FULL CHANGE →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Competitor Change Tracker
Tracking: acme.com/pricing
[Manage Alerts] [Unsubscribe from this URL]
```

**After AI Enrichment — Dashboard Shows**
```
🤖 AI SUMMARY
Acme Corp removed their free tier and repositioned their Pro plan 
as "Business" with a $30/month price increase. The new Starter 
plan fills the entry-level gap at $29/month.

📋 KEY CHANGES
• Free tier eliminated
• New Starter plan: $29/mo (was free)
• Pro renamed Business: $49 → $79/mo
• "Most Popular" badge moved to Business plan

💼 BUSINESS IMPACT
Acme is moving upmarket. Your free tier becomes a stronger 
acquisition differentiator — promote it aggressively.

✅ RECOMMENDED ACTION
Update your battle cards and run a comparison ad campaign 
highlighting your free tier this week.
```

### Resend Implementation

```typescript
import { Resend } from 'resend';
import { ChangeAlertEmail } from '@/emails/change-alert';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendChangeAlert(params: {
  to: string;
  userName: string;
  label: string;
  competitorName: string;
  category: string;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  changePercent: number;
  diffExcerpt: Array<{ type: 'added' | 'removed'; line: string }>;
  changeUrl: string;
  trackedUrl: string;
  changeEventId: string;
}): Promise<void> {
  const impactEmoji = { LOW: '🟡', MEDIUM: '🟠', HIGH: '🔴' }[params.impactLevel];

  await resend.emails.send({
    from: 'CCT Alerts <alerts@competitortracker.io>',
    to: params.to,
    subject: `${impactEmoji} ${params.competitorName || params.label} changed their ${params.category.toLowerCase()} page`,
    react: ChangeAlertEmail(params),
    headers: {
      'List-Unsubscribe': `<https://app.competitortracker.io/unsubscribe?eventId=${params.changeEventId}>`,
      'X-Change-Event-Id': params.changeEventId,
    },
    tags: [
      { name: 'event_type', value: 'change_alert' },
      { name: 'impact_level', value: params.impactLevel.toLowerCase() },
    ],
  });
}
```

### Post-MVP: Slack Notification Payload

```json
{
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "🔴 Competitor Change Detected" }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Competitor:*\nAcme Corp" },
        { "type": "mrkdwn", "text": "*Page:*\nPricing Page" },
        { "type": "mrkdwn", "text": "*Impact:*\n🔴 HIGH (Score: 72/100)" },
        { "type": "mrkdwn", "text": "*Changed:*\n12% of page" }
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*AI Summary:*\nAcme removed their free tier and increased Pro from $49→$79/mo."
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "View Full Diff" },
          "url": "https://app.competitortracker.io/dashboard/changes/evt_xxx",
          "style": "primary"
        }
      ]
    }
  ]
}
```

### Post-MVP: Outbound Webhook Payload (HMAC-Signed)

```json
{
  "event": "change.detected",
  "version": "1.0",
  "timestamp": "2026-06-16T06:30:00Z",
  "signature": "sha256=<hmac-sha256-hex>",
  "data": {
    "changeId": "clx...",
    "url": "https://acme.com/pricing",
    "label": "Acme Pricing Page",
    "competitorName": "Acme Corp",
    "category": "PRICING",
    "changePercent": 12.4,
    "impactLevel": "HIGH",
    "impactScore": 72,
    "signals": ["price_value_changed", "free_tier_removed"],
    "aiSummary": "Acme removed the free tier...",
    "aiKeyChanges": ["Free tier removed", "Pro plan $49→$79"],
    "changeUrl": "https://app.competitortracker.io/dashboard/changes/clx...",
    "detectedAt": "2026-06-16T06:30:00Z"
  }
}
```

Signature verification for webhook recipients:
```javascript
const hmac = crypto.createHmac('sha256', webhookSecret);
hmac.update(rawBody);
const expected = 'sha256=' + hmac.digest('hex');
const valid = crypto.timingSafeEqual(
  Buffer.from(expected),
  Buffer.from(receivedSignature)
);
```

---

## 17. Authentication System

### Strategy

- **Web sessions:** Auth.js v5 (cookie-based, HTTP-only, Secure, SameSite=Lax)
- **Email/Password:** bcrypt, 12 rounds
- **Google OAuth:** Auth.js Google provider
- **Post-MVP API:** API key (SHA-256 hashed), prefix-only stored

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Email verification | Non-blocking banner (not a gate) | Industry data: 40–60% of sign-ups never verify. Don't lose them. |
| Session duration | 7 days, sliding window | Balance security vs. friction |
| Login rate limit | 5 attempts per 15 minutes per email | Brute force protection |
| Password reset | Token valid 1 hour, single-use | Prevents replay |
| API keys (Post-MVP) | SHA-256 hash only — plaintext shown once | Zero plaintext storage |

### Auth Flow (Email/Password)

```
POST /api/auth/register
  → Validate email format + password strength (min 8 chars)
  → Check email not already registered
  → Hash password (bcrypt 12 rounds)
  → Create User + default Workspace + NotificationPreference
  → Create email verification token (24h expiry)
  → Send verification email (non-blocking — user can proceed without it)
  → Create Session + set cookie
  → Return { user, workspace }
  → Redirect to /onboarding
```

### Middleware (Next.js)

```typescript
// middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isAuth = req.nextUrl.pathname.startsWith('/sign-in') ||
                 req.nextUrl.pathname.startsWith('/sign-up');

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  if (isAuth && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up'],
};
```

---

## 18. Billing System

### Architecture

Stripe is the **single source of truth** for subscription state. The Workspace model caches plan limits locally for performance. All changes to plan limits happen exclusively via Stripe webhook handlers — never via direct UI API calls.

```
User flow:
  Click "Upgrade" → POST /api/billing/checkout → Stripe Checkout Session
  → User pays → Stripe sends webhook → Webhook handler updates Workspace
  → User redirected to dashboard with success state

Plan limit reads:
  Any API route → reads Workspace.maxUrls (local cache)
  → Fast, no Stripe API call needed
  → Cache stays fresh via webhook sync
```

### Stripe Webhook Handler (Idempotent)

```typescript
// app/api/stripe/webhook/route.ts
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

const PLAN_LIMITS: Record<string, PlanLimits> = {
  'price_starter_monthly': {
    planName: 'starter', maxUrls: 25, maxMembers: 1, maxWorkspaces: 1,
    maxAiSummariesMonth: 200, checkFreqOptions: ['daily', 'six_hours'],
    historyRetentionDays: 30, featureFlags: { slack: true, webhook: true }
  },
  'price_growth_monthly': {
    planName: 'growth', maxUrls: 100, maxMembers: 3, maxWorkspaces: 1,
    maxAiSummariesMonth: 99999, checkFreqOptions: ['daily', 'six_hours', 'one_hour'],
    historyRetentionDays: 90, featureFlags: { slack: true, webhook: true, api: true, csv: true }
  },
  // ...
};

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  // Idempotency: skip if already processed
  const processed = await prisma.processedStripeEvent.findUnique({
    where: { stripeEventId: event.id }
  });
  if (processed) return new Response('Already processed', { status: 200 });

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const priceId = session.metadata?.priceId;
      const workspaceId = session.metadata?.workspaceId;
      const limits = PLAN_LIMITS[priceId!];
      if (limits && workspaceId) {
        await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            stripeSubscriptionId: session.subscription as string,
            stripePriceId: priceId,
            planStatus: 'ACTIVE',
            ...limits,
          },
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.workspace.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          planName: 'free', planStatus: 'CANCELED',
          maxUrls: 3, maxMembers: 1, maxAiSummariesMonth: 10,
          checkFreqOptions: ['daily'], historyRetentionDays: 7,
          featureFlags: {},
        },
      });
      break;
    }
    // ... handle other events
  }

  await prisma.processedStripeEvent.create({ data: { stripeEventId: event.id } });
  return new Response('OK', { status: 200 });
}
```

### Plan Limit Guard

```typescript
// lib/plan-guard.ts
import { prisma } from './prisma';

export class PlanLimitError extends Error {
  constructor(
    public limitType: string,
    public current: number,
    public max: number,
    public planName: string
  ) {
    super(`Plan limit reached: ${limitType} (${current}/${max})`);
  }
}

export async function assertUrlLimit(workspaceId: string): Promise<void> {
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: { maxUrls: true, planName: true },
  });

  const current = await prisma.trackedUrl.count({
    where: { workspaceId, deletedAt: null },
  });

  if (current >= workspace.maxUrls) {
    throw new PlanLimitError('urls', current, workspace.maxUrls, workspace.planName);
  }
}
```

---

## 19. Admin Panel Requirements

### Access Control
- Route: `/admin` — server-side check for `User.role === 'ADMIN'`
- Separate layout; not accessible from main nav
- All admin actions logged to AuditLog

### Features (MVP Admin — Week 3–4)

**User Management**
- List users: email, plan, last login, created date, URL count
- View user detail: workspaces, recent checks, change events
- Manually override plan limits (e.g., give 50 bonus URLs to a high-value lead)
- Soft-delete user account (GDPR compliance)

**System Health Dashboard**
- pg-boss queue depths (check, diff, alert, ai-enrich)
- Failed jobs in last 24h (with error messages)
- Browser pool status (all 3 instances healthy?)
- OpenAI API success rate (last 1h)
- Resend delivery success rate (last 24h)
- R2 storage total and per-plan distribution

**Revenue View**
- MRR, plan distribution, new subscriptions this week
- Sourced from Stripe API (not local DB)

**Crawler Tools**
- Manually trigger a check for any URL
- View per-domain success/failure rate
- Domain blocklist management (block specific domains from being tracked)

---

## 20. Security Considerations

### SSRF Protection (Defense in Depth)

The SSRF guard covers IPv6, link-local, CNAME chains, and DNS rebinding.

```typescript
// lib/ssrf-guard.ts
import dns from 'dns/promises';

const BLOCKED_CIDRS = [
  // IPv4
  { start: [10,0,0,0], mask: 8 },       // RFC 1918
  { start: [172,16,0,0], mask: 12 },    // RFC 1918
  { start: [192,168,0,0], mask: 16 },   // RFC 1918
  { start: [127,0,0,0], mask: 8 },      // Loopback
  { start: [169,254,0,0], mask: 16 },   // Link-local (AWS metadata)
  { start: [100,64,0,0], mask: 10 },    // Shared address space
  { start: [0,0,0,0], mask: 8 },        // Current network
  { start: [192,0,2,0], mask: 24 },     // TEST-NET
  { start: [198,51,100,0], mask: 24 },  // TEST-NET-2
  { start: [203,0,113,0], mask: 24 },   // TEST-NET-3
];

// IPv6 blocked prefixes
const BLOCKED_IPV6_PREFIXES = [
  '::1',           // Loopback
  'fc', 'fd',      // Unique local (fc00::/7)
  'fe80',          // Link-local (fe80::/10)
  '::ffff:',       // IPv4-mapped (check mapped address too)
];

function isIpBlocked(ip: string): boolean {
  // IPv6 check
  if (ip.includes(':')) {
    const lower = ip.toLowerCase();
    if (lower === '::1') return true;
    if (BLOCKED_IPV6_PREFIXES.some(p => lower.startsWith(p))) return true;
    // IPv4-mapped IPv6 (::ffff:10.0.0.1)
    if (lower.startsWith('::ffff:')) {
      const v4 = lower.replace('::ffff:', '');
      return isIpBlocked(v4);
    }
    return false;
  }
  // IPv4 check
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return true;  // Malformed — block
  for (const cidr of BLOCKED_CIDRS) {
    const shift = 32 - cidr.mask;
    const ipInt = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    const startInt = (cidr.start[0] << 24) | (cidr.start[1] << 16) |
                     (cidr.start[2] << 8) | cidr.start[3];
    if ((ipInt >>> shift) === (startInt >>> shift)) return true;
  }
  return false;
}

export async function validateExternalUrl(rawUrl: string): Promise<void> {
  let parsed: URL;
  try { parsed = new URL(rawUrl); }
  catch { throw new ValidationError('Invalid URL format'); }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new ValidationError('Only HTTP/HTTPS URLs are allowed');
  }

  if (parsed.port && !['', '80', '443'].includes(parsed.port)) {
    throw new ValidationError('Non-standard ports are not allowed');
  }

  // Resolve BOTH A and AAAA records to catch all addresses
  const [ipv4s, ipv6s] = await Promise.allSettled([
    dns.resolve4(parsed.hostname),
    dns.resolve6(parsed.hostname),
  ]);

  const allIps = [
    ...(ipv4s.status === 'fulfilled' ? ipv4s.value : []),
    ...(ipv6s.status === 'fulfilled' ? ipv6s.value : []),
  ];

  if (allIps.length === 0) {
    throw new ValidationError(`Cannot resolve hostname: ${parsed.hostname}`);
  }

  for (const ip of allIps) {
    if (isIpBlocked(ip)) {
      throw new ValidationError(
        `URL resolves to a private or reserved IP address. Internal URLs cannot be tracked.`
      );
    }
  }
}
```

### Additional Security Controls

| Control | Implementation |
|---------|---------------|
| SQL Injection | Prisma parameterized queries exclusively |
| XSS | Next.js auto-escaping + strict CSP headers |
| CSRF | Auth.js built-in CSRF tokens on all form POSTs |
| Clickjacking | `X-Frame-Options: DENY` header |
| Rate Limiting | Upstash Redis sliding window on all API routes |
| Brute Force | 5 login failures per email per 15 min → lockout |
| Session Security | HTTP-only, Secure, SameSite=Lax cookies |
| Stripe Webhooks | `stripe.webhooks.constructEvent()` signature check before any DB write |
| Outbound Webhooks (Post-MVP) | HMAC-SHA256 signed; SSRF-validated URL at creation time |
| Custom Headers | Whitelist only: User-Agent, Accept-Language, Accept. Block X-Forwarded, Host |
| Secrets | Environment variables only — never committed or logged |
| R2 Objects | Private bucket + signed URLs for reading content/screenshots |

---

## 21. Legal Architecture

### robots.txt Compliance

```typescript
// lib/robots.ts
import robotsParser from 'robots-parser';

const BOT_NAME = 'CCT-Bot';  // Registered in robots.txt as "CCT-Bot"

export async function checkRobotsTxt(
  url: string,
  db: PrismaClient
): Promise<{ allowed: boolean; fromCache: boolean }> {
  const { hostname, protocol } = new URL(url);
  const robotsUrl = `${protocol}//${hostname}/robots.txt`;

  // Cache hit
  const cached = await db.robotsTxtCache.findUnique({ where: { domain: hostname } });
  if (cached && cached.expiresAt > new Date()) {
    const robots = robotsParser(robotsUrl, cached.content);
    return { allowed: robots.isAllowed(url, BOT_NAME) ?? true, fromCache: true };
  }

  // Cache miss — fetch with 5s timeout
  try {
    const response = await fetch(robotsUrl, {
      signal: AbortSignal.timeout(5_000),
      headers: { 'User-Agent': BOT_NAME },
    });
    const content = response.ok ? await response.text() : '';
    const expiresAt = new Date(Date.now() + 86_400_000);  // 24h

    await db.robotsTxtCache.upsert({
      where: { domain: hostname },
      create: { domain: hostname, content, expiresAt },
      update: { content, fetchedAt: new Date(), expiresAt },
    });

    const robots = robotsParser(robotsUrl, content);
    return { allowed: robots.isAllowed(url, BOT_NAME) ?? true, fromCache: false };
  } catch {
    // Unreachable robots.txt → assume allowed (fail open)
    return { allowed: true, fromCache: false };
  }
}
```

### Required Legal Documents

**1. Terms of Service — Key Clauses (Required Before Launch)**
- *"You may only monitor publicly accessible web pages that do not require authentication."*
- *"You must not use CCT to scrape pages protected by anti-bot measures in a manner that circumvents those protections."*
- *"You represent that your use of CCT complies with all applicable laws in your jurisdiction."*
- *"You indemnify and hold CCT harmless from any claim arising from the URLs you choose to monitor."*
- *"CCT reserves the right to disable monitoring of specific URLs or domains at its sole discretion."*

**2. Privacy Policy — Required Disclosures**
- What data is collected (monitored page snapshots, user account data)
- How long it's retained (per plan tier)
- GDPR basis: Legitimate interest (business intelligence for the customer)
- Right to deletion: `/api/account` DELETE endpoint

**3. DMCA Agent Registration**
- Register a DMCA agent with the US Copyright Office before launch (~$6 fee)
- Creates safe harbor under DMCA Section 512 for user-submitted URLs

### Data Minimization Strategy

| Data | Storage | Retention | Rationale |
|------|---------|-----------|-----------|
| Normalized text snapshot | R2 | Per plan limit | Enough for diffs; not full HTML |
| Raw HTML | Never stored | — | Reduces copyright exposure |
| Screenshot | R2 | Per plan limit | Visual reference only |
| Changed lines (AI input) | Not stored | — | Processed in memory, never persisted |
| User account data | Postgres | Until deletion | Required for service |

### Data Residency (Post-MVP)
- Add `dataRegion` field to Workspace: `US` | `EU`
- Route EU workspaces to Neon EU (Frankfurt) + R2 EU (WEUR)
- Required for enterprise and agency customers in the EU

---

## 22. Scaling Strategy

### MVP Infrastructure (Day 1–60)

```
Vercel           Next.js app (Hobby → Pro at scale)        $0 → $20/mo
Fly.io           Worker service (1 machine, 2GB RAM)        ~$14/mo
Neon             PostgreSQL (Serverless, scales to zero)    $0 → $19/mo
Cloudflare R2    Screenshots + snapshots                    ~$1–5/mo
Upstash Redis    Rate limiting (free tier: 10K req/day)     $0
Resend           Email (free: 3K/mo)                        $0
OpenAI           AI summaries                               ~$1–5/mo
Sentry           Error tracking + Cron monitoring           $0 (free tier)
─────────────────────────────────────────────────────────────────────
Total at 0 users:  ~$14/mo
Total at 50 users: ~$35/mo
Total at 100 users: ~$60/mo
```

### Scale Infrastructure (Month 3+, 100–500 customers)

```
Vercel Pro       Next.js + edge caching                     $20/mo
Fly.io           2× workers (2GB each, autoscale)           $28/mo
Neon Pro         Dedicated compute, branching               $69/mo
Cloudflare R2    ~50GB storage, no egress fees              $0.75/mo
Upstash          Redis Pro (higher limits)                  $10/mo
Resend           Scale plan (50K emails/mo)                 $20/mo
OpenAI           ~10K summaries/month                       $2/mo
Sentry           Team plan                                  $26/mo
─────────────────────────────────────────────────────────────────────
Total at 200 users:  ~$176/mo
At $45 ARPU × 200 users = $9,000 MRR → 98% gross margin
```

### Database Scaling Milestones

| Volume | Strategy |
|--------|---------|
| 0–50K CheckRuns | Single Neon instance — no action needed |
| 50K–500K CheckRuns | Add index on `(trackedUrlId, createdAt DESC)` if query slows |
| 500K+ CheckRuns | Partition CheckRun by month `PARTITION BY RANGE (createdAt)` |
| 1M+ CheckRuns | Archive old partitions to cold storage / Postgres foreign tables |
| ChangeEvent content | Already in R2 — no DB migration needed |

### Browser Pool Scaling

| Users | URLs | Check/day | Workers | Pool Size | RAM/Worker |
|-------|------|-----------|---------|-----------|------------|
| 0–50 | 750 | 750 | 1 | 3 | 2GB |
| 50–200 | 5,000 | 10,000 | 2 | 5 each | 2GB |
| 200–500 | 25,000 | 50,000 | 4 | 5 each | 2GB |
| 500+ | 100,000+ | 200,000+ | Auto-scale | 10 each | 4GB |

---

## 23. Potential Failure Modes

| Failure | Likelihood | Impact | Mitigation |
|---------|-----------|--------|-----------|
| Browser pool exhausted | Medium | High | Queue backpressure; alert when pool wait > 10s |
| Playwright page timeout | High | Low | 15s timeout per page; mark as TIMEOUT; retry |
| Target site blocks crawler | High | Medium | Per-domain rate limit; jitter; proxy pool (Phase 2) |
| OpenAI API down | Low | Low | Circuit breaker; ai-enrich retries; alerts still send without AI |
| OpenAI returns invalid JSON | Low | Low | `response_format: json_object` + Zod validation + retry |
| Resend delivery failure | Low | High | 5 retries with exponential backoff |
| R2 upload failure | Low | Medium | Retry 3×; on persistent failure, fall back to Postgres TEXT (< 100KB only) |
| Stripe webhook missed | Low | High | Stripe retries webhooks for 3 days; idempotency key prevents double-processing |
| Scheduler cron dies | Medium | High | Sentry Crons dead-man switch alerts within 2 minutes |
| DB connection pool exhausted | Low | Critical | Neon connection pooler (PgBouncer built-in); max 25 connections |
| Duplicate check job scheduled | Low | Medium | `FOR UPDATE SKIP LOCKED` in scheduler query |
| Large page (> 5MB text) | Medium | Low | Content size check before upload; skip if > 500KB normalized |
| robots.txt fetch timeout | Medium | Low | 5s timeout; fail open (assume allowed) |
| Memory leak in worker | Medium | High | Worker restarts every 6h via Fly.io `restart_policy` |
| DNS rebinding attack | Very Low | Critical | SSRF guard re-validates URL before every crawl (not just on creation) |

---

## 24. Competitive Analysis

### Direct Competitors

| Product | Price | Strengths | Weaknesses |
|---------|-------|-----------|-----------|
| **Visualping** | $10–$40/mo | Simple, visual diffs | No AI summaries, no team features, doesn't handle SPAs well |
| **Distill.io** | $15–$50/mo | Browser extension, selector targeting | Complex UI, no AI, limited API |
| **Crayon** | $15K–$50K/yr | Enterprise-grade, deep integrations | Way too expensive for SMBs |
| **Klue** | $10K–$30K/yr | Battle cards, CRM integration | Enterprise only |
| **Kompyte** | $8K–$25K/yr | Auto-battle cards | Same as Klue |

### CCT's Market Position

```
                   COMPLEX/EXPENSIVE ◄─────────────────► SIMPLE/AFFORDABLE
                         │                                      │
    AI Summaries     Crayon, Klue                          [CCT] ◄── we own this
    (High Intel.)        │                                      │
                         │                              Visualping
    Raw Diffs            │                              Distill.io
    (Low Intel.)         │                                      │
                   ENTERPRISE ◄──────────────────────────────► SMB/INDIE
```

**CCT's Unfair Advantages**
1. **Only AI-native product at SMB price** — competitors at this price point offer raw diffs only
2. **Playwright-first** — correctly renders modern SaaS pricing pages (Stripe, Notion, Linear)
3. **Decoupled AI** — alerts arrive fast, AI arrives shortly after; never one blocks the other
4. **Developer-friendly** — clean API, webhooks, JSON payloads (Phase 3)
5. **Self-serve** — no sales call, immediate activation, transparent pricing

### GTM Strategy
- **Distribution:** Build-in-public on Twitter/X + Product Hunt launch
- **SEO:** "monitor competitor pricing" keyword cluster (informational → commercial intent)
- **Comparison pages:** "CCT vs Visualping", "CCT vs Crayon"
- **Content:** "Competitive Intelligence Playbook" (lead magnet → email list)
- **Affiliate:** 30% MRR recurring, 12-month cookie (launch with Month 2)
- **Integrations:** Zapier, Make app directory listings (distribution flywheel)

---

## 25. Technical Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                           USER (Browser)                             │
└───────────────────────────────────┬──────────────────────────────────┘
                                    │ HTTPS
┌───────────────────────────────────▼──────────────────────────────────┐
│                    NEXT.JS APP (Vercel)                               │
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────┐  │
│  │  App Router     │  │  API Routes      │  │  Auth.js v5         │  │
│  │  (RSC Pages)    │  │  /api/v1/*       │  │  Sessions + OAuth   │  │
│  │  Dashboard UI   │  │  /api/billing/*  │  │  HTTP-only cookies  │  │
│  │  Marketing pages│  │  /api/stripe/*   │  └─────────────────────┘  │
│  └─────────────────┘  └──────────────────┘                           │
└───────────────────────────────────┬──────────────────────────────────┘
                                    │ Prisma ORM
              ┌─────────────────────┼──────────────────────┐
              │                     │                      │
┌─────────────▼────────────┐  ┌─────▼──────────┐  ┌──────▼────────────┐
│   NEON POSTGRES           │  │  UPSTASH REDIS │  │  CLOUDFLARE R2    │
│   (Serverless PG)         │  │  (Rate limits) │  │  (Object Storage) │
│                           │  └────────────────┘  │                   │
│  Users, Workspaces        │                       │  snapshots/       │
│  TrackedUrls, CheckRuns   │                       │  screenshots/     │
│  ChangeEvents (metadata)  │                       │                   │
│  Alerts, AuditLog         │                       │  Private bucket   │
│  RobotsTxtCache           │                       │  Signed URL access│
│  MonthlyUsage             │                       └──────────────────┘
│  pg-boss job tables       │
└─────────────┬─────────────┘
              │ pg-boss LISTEN/NOTIFY
┌─────────────▼──────────────────────────────────────────────────────┐
│                   WORKER SERVICE (Fly.io, 2GB)                     │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PERSISTENT BROWSER POOL  (3 warm Chromium instances)       │   │
│  │                                                             │   │
│  │  context1 ─► page ─► crawl ─► extract ─► hash             │   │
│  │  context2 ─► page ─► crawl ─► extract ─► hash             │   │
│  │  context3 ─► page ─► crawl ─► extract ─► hash             │   │
│  │                                                             │   │
│  │  Each context is isolated per check (fresh cookies)         │   │
│  │  Browser instance is REUSED (no launch overhead)            │   │
│  └──────────────────────┬──────────────────────────────────────┘   │
│                         │                                           │
│  ┌──────────────────────▼──────────────────────────────────────┐   │
│  │  4-STAGE JOB PIPELINE                                       │   │
│  │                                                             │   │
│  │  Stage 1: check ──► diff ──► ┬─► alert    [CRITICAL] ──►  │   │
│  │                              └─► ai-enrich [LOW]     ──►  │   │
│  │                                                             │   │
│  │  alert and ai-enrich run IN PARALLEL                        │   │
│  │  Alerts NEVER wait for AI                                   │   │
│  └──────────────────────┬──────────────────────────────────────┘   │
│                         │                                           │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
          ┌───────────────┼────────────────────────┐
          │               │                        │
┌─────────▼──────┐  ┌─────▼──────────┐  ┌─────────▼───────────┐
│  RESEND API    │  │  OPENAI API    │  │  STRIPE API         │
│                │  │  gpt-4o-mini   │  │  Billing + webhooks │
│  Transactional │  │  AI summaries  │  └─────────────────────┘
│  email alerts  │  │  (async only)  │
└────────────────┘  └───────────────┘

External (Post-MVP):
┌──────────────────┐  ┌─────────────────────────────┐
│  SLACK API       │  │  USER'S WEBHOOK ENDPOINT     │
│  Channel alerts  │  │  (HMAC-SHA256 signed)        │
└──────────────────┘  └─────────────────────────────┘
```

---

## 26. 30-Day Development Roadmap

### Guiding Principles
- Ship something chargeable by Day 14
- True MVP = 8 core features, not 16
- Deploy to production (not staging) by Day 14
- Gather real user feedback from Day 15 onward

---

### Week 1 (Days 1–7): Infrastructure + Core Engine

| Day | Deliverables |
|-----|-------------|
| **1** | Repo setup: Next.js 15 App Router, TypeScript strict mode, ESLint, Prettier. Prisma + Neon connection. Full schema migration. Fly.io worker scaffold. |
| **2** | Auth.js v5: email/password (bcrypt 12 rounds) + Google OAuth. Registration, login, logout, session middleware. Email verification non-blocking (banner only). Resend integration for verification email. |
| **3** | Stripe: create Free + Starter plans in Stripe dashboard. `POST /api/billing/checkout`. `POST /api/stripe/webhook` with signature verification + idempotency. Plan limits sync to Workspace on webhook. |
| **4** | pg-boss: worker process scaffold. Scheduler cron (1 min). Browser pool init (3 instances). SSRF guard + robots.txt module. |
| **5** | Playwright: `crawlUrl()` function. `domcontentloaded` wait strategy. Text normalization. R2 upload. `check` job end-to-end (crawl → hash compare → R2 upload → enqueue diff). |
| **6** | `diff` job: Myers diff, noise filter, conservative impact scoring on changed lines only. ChangeEvent creation. Enqueue `alert` (CRITICAL) + `ai-enrich` (LOW) in parallel. |
| **7** | `alert` job: Resend email with diff excerpt (no AI required). React Email template. `ai-enrich` job: OpenAI gpt-4o-mini, circuit breaker, ChangeEvent update. **Full pipeline tested end-to-end.** |

**Milestone:** Crawl → detect change → send email → enrich with AI summary. Full pipeline verified locally.

---

### Week 2 (Days 8–14): Dashboard + Billing

| Day | Deliverables |
|-----|-------------|
| **8** | Dashboard shell: sidebar nav, header, auth middleware. `GET /api/v1/changes` (cursor-paginated). Change feed component (`<ChangeList>`). Change event card with impact badges. |
| **9** | `GET/POST /api/v1/urls`. URL list page. Add URL form: validation, robots.txt warning, duplicate detection. URL health status indicators. Plan limit enforcement with upgrade prompt. |
| **10** | Diff viewer page (`/dashboard/changes/[id]`). `GET /api/v1/changes/:id/diff` (fetches before/after from R2). Before/after text columns. Highlighted changed lines. AI panel (skeleton while AI pending, content when done). |
| **11** | Onboarding wizard (3 steps). Empty state for new users. SSE stream for manual check progress. `POST /api/v1/urls/:id/check` with rate limit. |
| **12** | Mark change as read / archived. Unread count badge in sidebar. Filter bar (impact level tabs). Basic notification preferences page (immediate / digest / off). |
| **13** | URL detail page (history of changes for one URL). URL pause/resume/delete (soft). Category tags. Competitor name grouping in dashboard. |
| **14** | 🚀 **Deploy to production.** Stripe checkout flow end-to-end smoke test. Error states: 404 URL, Playwright timeout, OpenAI failure, R2 upload failure. Sentry integration. |

**Milestone:** Full user journey on production. Add URL → check runs → change detected → email sent → dashboard shows diff. Ready for first beta users.

---

### Week 3 (Days 15–21): Polish + Admin

| Day | Deliverables |
|-----|-------------|
| **15** | Billing settings page (Stripe Customer Portal link, current plan display, usage meter). Growth plan added to Stripe + webhook handler. |
| **16** | Admin panel: user list, workspace list. Queue health dashboard (pg-boss queue depths). |
| **17** | Admin panel: manual check trigger for any URL. Per-domain crawl success rate. Domain blocklist. |
| **18** | URL list bulk actions (pause all, delete all). URL health error state (3+ failures → red + alert email to user). |
| **19** | Dashboard stats bar (URLs monitored, changes last 7d, unread alerts). Competitor overview grouped view. |
| **20** | Performance pass: add all DB indexes. Verify query plans on change feed. API response time < 200ms p95. |
| **21** | Security pass: CSP headers, `X-Frame-Options`, rate limit on all routes, SSRF guard smoke test. |

---

### Week 4 (Days 22–30): Launch Prep

| Day | Deliverables |
|-----|-------------|
| **22** | Marketing landing page (hero, features, pricing, testimonials, CTA). SEO meta tags. |
| **23** | Pricing page (plan comparison table). Stripe Checkout integration from landing page. |
| **24** | Agency plan added (Stripe + webhook). Screenshot capture in diff job (on change only). Screenshot display in diff viewer. |
| **25** | E2E tests (Playwright): register → add URL → trigger check → view change → upgrade plan. |
| **26** | Load test: simulate 50 concurrent URL checks. Verify browser pool doesn't exhaust. |
| **27** | Beta user onboarding: reach out to 10 target users (SaaS founders). Offer 60-day free Starter. |
| **28** | Feedback iteration from beta users. Priority bug fixes. |
| **29** | Product Hunt launch assets: thumbnail, tagline, first comment, scheduled time (12:01 AM PST Tuesday). |
| **30** | 🚀 **Product Hunt Launch.** Monitor, respond to comments, support first users. |

---

## 27. 90-Day Growth Roadmap

### Month 1 (Days 1–30) — Build + Launch
- Core product shipped
- Chargeable from Day 14
- First 10 beta users (free Starter access)
- Product Hunt launch on Day 30
- **Target:** $1,000 MRR

### Month 2 (Days 31–60) — Retention + Expansion

**Product**
- [ ] Slack OAuth integration (channel selection, test notification)
- [ ] Outbound webhook support (HMAC-signed, Zapier-compatible)
- [ ] CSS selector targeting (with live visual preview)
- [ ] CSV bulk URL import (up to 100 URLs)
- [ ] Daily + weekly email digest (configurable send time)
- [ ] Quiet hours + minimum impact level filter
- [ ] URL change history timeline (visual chart)
- [ ] Agency plan: multi-workspace UI

**Marketing**
- [ ] SEO blog: 10 posts targeting "monitor competitor pricing" cluster
- [ ] Comparison pages: "CCT vs Visualping", "CCT vs Crayon"
- [ ] Customer case study: 3 paying customers
- [ ] Newsletter: "Weekly Competitive Intelligence" (Substack)
- [ ] Indie Hackers milestone post

**Target:** $5,000 MRR (50 paying customers)

### Month 3 (Days 61–90) — Scale + API

**Product**
- [ ] Public REST API v1 with API key auth
- [ ] Zapier + Make integration
- [ ] Team member invites + RBAC (Growth + Agency)
- [ ] PDF competitive report export
- [ ] CSV change history export
- [ ] Keyword alerting (alert when specific word appears/disappears)
- [ ] Annual billing option (2 months free)
- [ ] Competitor profile page (aggregated change history + velocity chart)
- [ ] Browser extension (one-click URL tracking)

**Business**
- [ ] Affiliate program (30% recurring, 12-month cookie)
- [ ] Integration marketplace listings (Zapier, Make)
- [ ] NPS survey (in-app + email)
- [ ] Churn analysis → onboarding improvement
- [ ] Enterprise pilot ($500/mo anchor customer)

**Target:** $15,000 MRR (150 paying customers)

### KPI Dashboard

| Metric | Day 30 | Day 60 | Day 90 |
|--------|--------|--------|--------|
| MRR | $1,000 | $5,000 | $15,000 |
| Paying Customers | 10 | 50 | 150 |
| Monthly Churn Rate | < 10% | < 7% | < 5% |
| Alert Email Open Rate | > 50% | > 55% | > 55% |
| Free → Paid Conversion | — | > 8% | > 10% |
| AI Summary Accuracy (NPS of AI) | — | > 70% "useful" | > 80% |
| Avg Check Latency (p95) | < 30s | < 25s | < 20s |
| Alert Delivery Time (p95) | < 5 min | < 3 min | < 3 min |
| Infra Gross Margin | > 90% | > 93% | > 95% |

---

## Appendix A: Tech Stack Reference

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js App Router | 15.x | RSC + API routes in one project |
| Language | TypeScript | 5.x | Strict mode, Zod for runtime validation |
| Styling | Tailwind CSS + shadcn/ui | Latest | Fastest MVP UI |
| ORM | Prisma | 5.x | Type-safe, migrations, introspection |
| Database | Neon (Postgres) | 16.x | Serverless, scales to zero, branching |
| Job Queue | pg-boss | 9.x | No Redis needed, LISTEN/NOTIFY |
| Crawler | Playwright (Chromium) | 1.4x | JS-heavy SPA support |
| AI | OpenAI gpt-4o-mini | Latest | Fast, cheap, reliable JSON output |
| Email | Resend + React Email | Latest | DX-friendly, high deliverability |
| Billing | Stripe | Latest | Industry standard, webhooks |
| Auth | Auth.js v5 | 5.x | Multi-provider, session management |
| Storage | Cloudflare R2 | — | S3-compatible, free egress |
| App Hosting | Vercel | — | Next.js native, edge functions |
| Worker Hosting | Fly.io | — | Persistent processes, good DX |
| Rate Limiting | Upstash Redis | — | Serverless, free tier generous |
| Monitoring | Sentry | — | Errors + Cron monitoring |
| DNS/CDN | Cloudflare | — | DDoS protection, caching |

## Appendix B: Environment Variables Reference

```bash
# Database
DATABASE_URL=                    # Neon connection string
DIRECT_URL=                      # Neon direct (for migrations)

# Auth
NEXTAUTH_SECRET=                 # Random 32+ char secret
NEXTAUTH_URL=                    # https://app.competitortracker.io
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=               # sk_live_...
STRIPE_PUBLISHABLE_KEY=          # pk_live_...
STRIPE_WEBHOOK_SECRET=           # whsec_...
STRIPE_PRICE_STARTER_MONTHLY=    # price_...
STRIPE_PRICE_GROWTH_MONTHLY=     # price_...
STRIPE_PRICE_AGENCY_MONTHLY=     # price_...

# Email
RESEND_API_KEY=                  # re_...
EMAIL_FROM=alerts@competitortracker.io

# AI
OPENAI_API_KEY=                  # sk-proj-...

# Storage (Cloudflare R2)
CF_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=cct-snapshots

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Monitoring
SENTRY_DSN=
SENTRY_AUTH_TOKEN=               # For source maps

# App
NEXT_PUBLIC_APP_URL=https://app.competitortracker.io
NODE_ENV=production
```

---

*Document: Competitor Change Tracker PRD v2.0*
*Maintained by: Founding Team*
*Supersedes: PRD v1.0*
*Next Review: 30-Day Post-Launch Retrospective*
