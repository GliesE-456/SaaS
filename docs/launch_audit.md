# CCT Launch Audit — Brutally Honest Review
> Reviewed: June 19, 2026 | Codebase: Next.js 15 / BullMQ / Playwright / Stripe / Resend

---

## Executive Verdict

This is a well-architected Micro-SaaS. The backend pipeline (scrape → diff → alert → AI enrich) is correctly decoupled. Security fundamentals (SSRF guard, robots.txt, Zod validation) are in place. But **5 issues will kill conversion or cause a production incident within 48 hours of launch.** Fix those first.

---

## 🔴 CRITICAL (Fix before launch — these will cost you money or break the product)

---

### #1 — Alert email waits for AI summary before sending

**Severity:** Critical  
**Area:** Technical / Conversion  

**Why it matters:**  
The PRD explicitly states *"Alerts fire BEFORE AI is ready"* as a core design decision — decoupling was the entire point of the parallel pipeline. Yet `notifyJob.ts` line 51 does:
```ts
const aiSummaryText = change.aiSummary ? change.aiSummary : 'We detected changes on this page.'
```
This fallback *looks* fine, but the notify job is only enqueued from `aiJob.ts` (it wasn't found in `scrapeJob.ts` or `analysisJob.ts`). Cross-referencing: `scrapeJob.ts` only enqueues `aiQueue` — there is **no separate alert queue enqueue** after the ChangeEvent is created. The alert is only sent after the AI job completes. This means: if OpenAI is slow or down, your user's alert is delayed or dropped. The entire architectural advantage you designed (v2.0 fix #2) is not implemented.

**Exact fix:**  
In `scrapeJob.ts`, after creating the `changeEvent`, enqueue both jobs immediately:
```ts
// Enqueue alert job FIRST (priority: critical)
await alertQueue.add('sendAlert', { changeId: changeEvent.id }, { priority: 1 });
// Enqueue AI job (priority: low)
await aiQueue.add('generateSummary', { changeId: changeEvent.id }, { priority: 10 });
```
In `notifyJob.ts`, remove the AI summary dependency — send the diff excerpt only:
```ts
const aiSummaryText = 'AI analysis is loading in your dashboard...';
```

---

### #2 — SSRF guard is bypassed in the URL creation API

**Severity:** Critical  
**Area:** Security  

**Why it matters:**  
`/api/v1/urls/route.ts` performs a robots.txt check but **never calls `validateExternalUrl()`**. Your excellent `ssrf-guard.ts` module exists but is not wired into the URL addition flow. A malicious user can add `http://169.254.169.254/latest/meta-data/` (AWS metadata endpoint) and your Playwright worker will faithfully fetch it and return the content in a diff alert. This is a day-one cloud provider incident.

**Exact fix:**  
Add to `POST /api/v1/urls/route.ts` before the robots.txt check:
```ts
import { validateExternalUrl, SsrfError } from '@/lib/ssrf-guard';

try {
  await validateExternalUrl(data.url);
} catch (err) {
  if (err instanceof SsrfError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  throw err;
}
```

---

### #3 — Stripe `checkout.session.completed` doesn't update the plan

**Severity:** Critical  
**Area:** Billing / Revenue  

**Why it matters:**  
In `webhook/route.ts`, the `checkout.session.completed` handler (lines 27–54) only saves `stripeCustomerId` and `stripeSubscriptionId`. It does **not** set `planName`, `maxUrls`, `planStatus`, or any limits. The workspace stays on the Free plan after a user pays. Your user pays $29, gets redirected back, and still has a 3-URL limit. They will churn and dispute the charge.

The plan limits are only set in `customer.subscription.created`/`updated`. This should work IF Stripe fires those events reliably after checkout — but there's a race condition: the redirect to `/dashboard/billing?success=true` happens before the async webhook arrives. The user sees "Free plan" immediately after paying.

**Exact fix:**  
Merge the plan-setting logic into `checkout.session.completed`:
```ts
case 'checkout.session.completed': {
  const session = event.data.object as Stripe.Checkout.Session;
  // Retrieve the full subscription to get the price ID
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const priceId = subscription.items.data[0]?.price.id;
  // ... apply plan limits immediately, same as subscription.updated handler
}
```
Also add a 2-second polling UI on the success redirect page before showing plan status.

---

## 🟠 HIGH (Fix before launch — these directly damage conversion)

---

### #4 — Landing page has no pricing section

**Severity:** High  
**Area:** Landing Page / Conversion  

**Why it matters:**  
`page.tsx` has a hero, 3 feature cards, a footer. **No pricing.** The pricing page (`/pricing`) is listed as a route in middleware's `publicRoutes` but the file doesn't exist in `src/app/`. There's no link to pricing from the nav either. Every conversion expert will tell you: SaaS visitors who can't find pricing within 10 seconds leave. Your primary CTA leads directly to sign-up — no price anchor, no "try free", no plan comparison. You're asking for trust before giving information.

**Exact fix:**  
Add a pricing section directly to `page.tsx` before the footer. At minimum: a 2-column card (Free vs Starter) with price, key limits, and a CTA. Then create `/app/pricing/page.tsx` with the full plan table and add "Pricing" to the header nav.

---

### #5 — Onboarding wizard doesn't trigger a first check or show live progress

**Severity:** High  
**Area:** Onboarding / Activation  

**Why it matters:**  
`OnboardingWizard.tsx` `handleFinish()` adds the URL via `POST /api/v1/urls`, then immediately redirects to `/dashboard/overview`. The PRD specifies: *"Running your first check… SSE progress bar → confetti/success state."* None of this happens. The user lands on an empty dashboard with zero changes and a spinner. The "aha moment" (seeing the first snapshot result) never fires. This is your primary activation event — users who don't see value in the first session don't come back.

**Exact fix:**  
After the URL is created, call `POST /api/v1/jobs/[id]/check` to trigger a manual check, then redirect to `/dashboard/urls` with the `CheckProgressModal` open (passing the jobId via query param). Let the user see the progress bar complete before going to the dashboard.

---

### #6 — `ChangeList` uses "Load More" button instead of infinite scroll

**Severity:** High  
**Area:** UX/Dashboard  

**Why it matters:**  
The PRD specifies cursor-paginated **infinite scroll** via IntersectionObserver (US-020). `ChangeList.tsx` line 33 renders a `<Button>` with `onClick={loadMore}`. This is not infinite scroll — it's paginated load-more. For a dashboard where the core experience is *scanning a feed of changes*, forcing a click for each batch is a friction point. This is also a broken promise to yourself — the PRD exists for a reason.

**Exact fix:**  
Replace the button with an IntersectionObserver sentinel div:
```tsx
const sentinelRef = React.useRef<HTMLDivElement>(null);
React.useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting && !isReachingEnd && !isLoadingMore) loadMore(); },
    { threshold: 0.1 }
  );
  if (sentinelRef.current) observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [isReachingEnd, isLoadingMore, loadMore]);
// Replace Button with: <div ref={sentinelRef} className="h-4" />
```

---

### #7 — "Testing Tool" link is exposed in the production sidebar

**Severity:** High  
**Area:** UX / Security  

**Why it matters:**  
`Sidebar.tsx` line 32 shows a "Testing Tool" link pointing to `/dashboard/admin` for **every user**. This is a development artifact. Every paying customer will see this, click it, and either get confused or exposed to internal tools. It destroys trust and professionalism instantly. It also means your admin panel (which should be role-gated) is one click away from any authenticated user.

**Exact fix:**  
Gate the admin nav item on user role:
```tsx
// In Sidebar, pass user role as prop
{user?.role === 'ADMIN' && (
  <Link href="/dashboard/admin">Testing Tool</Link>
)}
```
Or remove it entirely from the sidebar and access via direct URL only.

---

## 🟡 MEDIUM (Fix within first week post-launch)

---

### #8 — Scheduler has a race condition under horizontal scale

**Severity:** Medium  
**Area:** Technical / Reliability  

**Why it matters:**  
`scheduler.ts` runs a `setInterval` every 60 seconds. It queries ALL active URLs, checks if they need scanning, then optimistically sets `lastCheckedAt`. If you run 2 worker instances (which you will if you Dockerize and scale), both instances will race to query and enqueue the same URLs within the same 60-second window. You'll get duplicate scrape jobs, duplicate ChangeEvents, and duplicate email alerts to users.

**Exact fix:**  
Use BullMQ's built-in repeatable jobs instead of a setInterval:
```ts
await scrapeQueue.add('automatedCheck', { trackedUrlId: url.id }, {
  repeat: { every: getFrequencyMs(url.checkFrequency) },
  jobId: `repeat_${url.id}`, // deduplicates
});
```
Or use a Postgres advisory lock around the scheduler tick.

---

### #9 — Alert email is unstyled raw HTML

**Severity:** Medium  
**Area:** UX / Brand  

**Why it matters:**  
`notifyJob.ts` sends a plain HTML string with `<h2>`, `<p>` tags and no styling. Your `ChangeAlertEmail.tsx` React Email template exists in `/src/emails/` but is never used by the worker. The email your user receives looks like a 2003 HTML email — no branding, no diff excerpt, no visual hierarchy. Email is your primary notification channel and the first impression after sign-up. A poorly designed alert email dramatically reduces the perceived value of the product.

**Exact fix:**  
In `notifyJob.ts`, import and render the React Email template:
```ts
import { render } from '@react-email/render';
import { ChangeAlertEmail } from '../../../apps/web/src/emails/ChangeAlertEmail';

const html = render(ChangeAlertEmail({ ... }));
await resend.emails.send({ ..., html });
```
Wire up the workspace and change data to the template props.

---

### #10 — No pricing page exists at `/pricing`

**Severity:** Medium  
**Area:** Landing / Conversion  

**Why it matters:**  
The middleware explicitly adds `/pricing` to `publicRoutes`, and the footer has a dead `Terms` and `Privacy` link (`href="#"`). These are the three pages that SaaS visitors specifically navigate to before converting. Missing legal pages (Terms, Privacy) will also get you banned from Google Ads and rejected by payment processors during compliance review.

**Exact fix:**  
- Create `/app/pricing/page.tsx` with the full 4-tier pricing table  
- Create `/app/terms/page.tsx` and `/app/privacy/page.tsx` (use a template or AI-generate a first draft — having *something* is mandatory)  
- Fix the footer links from `href="#"` to `href="/terms"` and `href="/privacy"`

---

## Summary Scoreboard

| # | Issue | Severity | Area |
|---|-------|----------|------|
| 1 | Alert fires after AI (defeats parallel pipeline design) | 🔴 Critical | Backend |
| 2 | SSRF guard not called in URL creation API | 🔴 Critical | Security |
| 3 | Stripe checkout doesn't apply plan limits on payment | 🔴 Critical | Billing |
| 4 | No pricing section on landing page | 🟠 High | Conversion |
| 5 | Onboarding doesn't trigger first check or show progress | 🟠 High | Activation |
| 6 | Dashboard uses button pagination instead of infinite scroll | 🟠 High | UX |
| 7 | Admin "Testing Tool" visible to all users in sidebar | 🟠 High | UX / Security |
| 8 | Scheduler race condition under horizontal scaling | 🟡 Medium | Reliability |
| 9 | Alert email is unstyled HTML (React Email template unused) | 🟡 Medium | Brand |
| 10 | `/pricing`, `/terms`, `/privacy` pages don't exist | 🟡 Medium | Conversion / Legal |

---

## What's Actually Good (Don't Break It)

- ✅ SSRF guard implementation (`ssrf-guard.ts`) is thorough and correct — just needs to be connected
- ✅ Zod validation on all API routes
- ✅ Webhook signature verification is correct
- ✅ BullMQ job architecture is sound
- ✅ Rate limiting infrastructure (Upstash) is in place with graceful fallback
- ✅ robots.txt integration with override acknowledgment is a nice touch
- ✅ `plan-guard.ts` pattern is clean
- ✅ Turndown + HTML stripping in scrapeJob is the right approach
- ✅ Non-blocking email verification banner (matches PRD US-003)
- ✅ Dark mode design system is consistent and well-executed
