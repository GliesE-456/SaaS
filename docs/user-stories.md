# User Stories - Competitor Change Tracker

This document outlines the core user stories and scenarios that drive the features of the Competitor Change Tracker.

## Core Value Proposition
**As a** founder / business owner,  
**I want to** monitor my competitors' web pages,  
**So I can** react quickly to market changes, pricing updates, and new feature releases.

---

## 1. Onboarding & Account Management

- **As a** new user,
  **I want to** be able to easily sign up using my email and a password,
  **So that** I can securely create an account and begin setting up my workspace.

- **As a** returning user,
  **I want to** securely log into my account,
  **So that** I can view my dashboard and manage my tracked competitors.

- **As a** user who forgot their password,
  **I want to** be able to request a password reset link to my email,
  **So that** I can regain access to my account securely.

## 2. Managing Tracked Competitors

- **As a** user,
  **I want to** add a competitor's URL to my tracking list and assign it a readable label,
  **So that** I can start monitoring that specific page for changes.

- **As a** user,
  **I want to** configure how frequently a URL is checked (e.g., daily, every 6 hours),
  **So that** I can prioritize checking highly volatile pages more often without wasting checks on static pages.

- **As a** user,
  **I want to** manually trigger a "Check Now" action on a specific URL,
  **So that** I can verify if a change has occurred right at this moment without waiting for the scheduled job.

- **As a** user,
  **I want to** pause or delete a tracked URL,
  **So that** I can stop receiving notifications for a page I am no longer interested in monitoring.

## 3. Viewing Changes & Insights

- **As a** user,
  **I want to** view a chronological feed of all changes detected across my tracked pages,
  **So that** I can quickly catch up on what my competitors have been doing.

- **As a** user,
  **I want to** see an AI-generated summary of exactly what changed (e.g., "They lowered their Pro plan price by $10"),
  **So that** I don't have to read through raw HTML diffs to understand the business impact.

- **As a** user,
  **I want to** see an "Impact Level" (Low, Medium, High) assigned to each change,
  **So that** I can easily triage and prioritize which competitor updates need my immediate attention.

## 4. Notifications & Alerts

- **As a** user,
  **I want to** receive an email alert whenever a high-impact change is detected,
  **So that** I am informed immediately when a competitor makes a significant move.

- **As a** user,
  **I want to** configure my notification preferences to receive a daily or weekly digest instead of immediate alerts,
  **So that** my inbox is not overwhelmed by minor, low-impact website tweaks.

## 5. Billing & Subscription Limits

- **As a** user on the Free plan,
  **I want to** see clear indicators of my usage limits (e.g., 3 / 3 tracked URLs used),
  **So that** I know when it is time to upgrade my account.

- **As a** power user,
  **I want to** upgrade to a paid subscription seamlessly via Stripe,
  **So that** I can track more URLs, check them more frequently, and receive more AI summaries per month.

- **As a** paying customer,
  **I want to** access a billing portal to manage my payment methods, view invoices, or cancel my subscription,
  **So that** I have full control over my account's financial aspects.
