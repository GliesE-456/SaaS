# UI Specification & User Stories

This document outlines the User Interface (UI) specification, screens, components, design system, and navigation flows for the Competitor Change Tracker SaaS.

---

## 1. Screens

The application is divided into three primary zones: Marketing, Authentication, and the Authenticated Dashboard.

### Marketing & Public
- **Landing Page (`/`)**: 
  - *Purpose*: Explain the value proposition, showcase features, and provide clear calls-to-action (CTAs) for signing up.
  - *Elements*: Hero section with glassmorphism effects, feature highlights, pricing tiers, and a top navigation bar.

### Authentication
- **Sign In (`/sign-in`)**: Existing users can log in via email/password or OAuth (planned).
- **Sign Up (`/sign-up`)**: New users can register for an account. Upon registration, a default Workspace is created automatically.
- **Reset Password (`/reset-password`)**: Request a secure password reset link via email.
- **Set New Password (`/reset-password/[token]`)**: Form to securely submit a new password using a tokenized link.

### Authenticated Dashboard (`/dashboard`)
- **Overview (`/dashboard/overview`)**: 
  - *Purpose*: High-level summary of the workspace's status.
  - *Elements*: Metrics cards (Active URLs, Recent Changes, AI Summaries Used), Quick Add URL button, and a snapshot of the most recent high-impact change.
- **Tracked URLs (`/dashboard/urls`)**: 
  - *Purpose*: Manage competitor URLs being monitored.
  - *Elements*: List of `UrlCard`s showing status, last checked time, and frequency. Includes a dialog for adding new URLs.
- **Recent Changes (`/dashboard/changes`)**: 
  - *Purpose*: An intelligent feed of all detected updates across tracked pages.
  - *Elements*: A timeline-style `ChangeFeed` where each card details the change impact, before/after snapshots, and an AI-generated summary of business implications.
- **Settings (`/dashboard/settings`)**: 
  - *Purpose*: Manage workspace, billing, and user preferences.
  - *Elements*: Notification preferences (email digests), `BillingCard` (Stripe integration), `LimitsCard` (Usage meter), and basic profile management.

---

## 2. Components

The application is built using a component-driven architecture powered by React, Tailwind CSS, and `shadcn/ui`.

### Core UI Components (`shadcn/ui`)
Foundational, accessible components used throughout the application:
- `Button`, `Card`, `Badge`, `Input`, `Label`
- `Dialog`, `DropdownMenu`, `Select`, `Switch`, `Tabs`
- `Toast` (for flash messages and async feedback)

### Feature Components
Higher-order components tailored to specific domain logic:

**Layout & Navigation**
- `DashboardShell`: The main wrapper for authenticated pages, managing responsive layouts.
- `DashboardNav`: The sidebar navigation links.
- `UserNav`: The top-right dropdown menu for user profile and logout.

**URLs Module**
- `UrlList`: Data-fetching wrapper that renders a grid of URLs.
- `UrlCard`: Displays individual URL metadata, status badges, and a "Check Now" manual trigger.
- `AddUrlDialog`: A modal containing a form to input a new URL, competitor name, and desired check frequency.
- `UrlStatusBadge`: A visual indicator (Active, Paused, Error) using contextual colors.

**Changes Module**
- `ChangeFeed`: Paginated or infinite-scroll list of change events.
- `ChangeCard`: Displays an individual change event, including timestamps and visual diffs.
- `ImpactBadge`: Highlights whether a change is LOW, MEDIUM, or HIGH impact using color-coded icons.
- `AiSummaryCard`: A specialized component that renders the GPT-4 generated summary, key takeaways, and strategic recommendations.

**Settings & Billing**
- `BillingCard`: Displays the current active plan, price, and actions to upgrade or manage billing via Stripe Customer Portal.
- `LimitsCard`: Uses a `UsageMeter` to show the current progress against monthly plan quotas (e.g., 3/10 AI Summaries used).
- `NotificationSettings`: Toggles for enabling emails and setting digest frequencies (Immediate, Daily, Weekly).

---

## 3. Design System

The UI is designed to feel modern, sleek, and premium.

### Aesthetics
- **Theme**: Dark mode by default, utilizing deep dark backgrounds (`#0a0a0a`) mixed with subtle vibrant accents.
- **Glassmorphism**: Extensive use of `backdrop-blur`, semi-transparent borders, and contextual background glows to create depth and a high-end feel.
- **Micro-interactions**: Hover states (`hover:bg-accent`), smooth transitions (`transition-all duration-300`), and active state feedback.

### Typography
- **Primary Font**: `Inter` (or `Geist` via Next.js) for clean, highly legible sans-serif text across both marketing and dashboard interfaces.
- **Hierarchy**: Clear distinction between Page Headings (H1, `text-3xl font-bold`), Section Titles (H2, `text-xl font-semibold`), and body copy (`text-sm text-muted-foreground`).

### Color Palette
- **Backgrounds**: Slate/Zinc dark variants (`bg-background`).
- **Primary/Accent**: Vibrant Indigo/Violet gradients (`from-indigo-500 to-purple-500`) for primary buttons and active states.
- **Destructive/Error**: Red accents (`text-destructive`) for deletions, errors, or failed checks.
- **Status Indicators**:
  - *High Impact / Success*: Emerald / Green
  - *Medium Impact / Warning*: Amber / Yellow
  - *Low Impact / Muted*: Slate / Gray

---

## 4. Navigation Flow

### Public Flow
1. User lands on `/` (Marketing).
2. Clicks "Get Started" -> Redirects to `/sign-up`.
3. Completes registration -> Redirects to `/dashboard/overview`.

### Authenticated Flow
- **Sidebar (Desktop) / Hamburger Menu (Mobile)**:
  - **Overview**: Default landing after login.
  - **Tracked URLs**: Manage the core resources.
  - **Changes**: View the output and value of the application.
  - **Settings**: Bottom-aligned navigation for configuration.
- **Top Bar**:
  - Displays the current page title.
  - Contains the `UserNav` dropdown on the far right.
    - *Dropdown Actions*: "Billing" (shortcuts to Settings tab), "Support", "Log out".

### Contextual Actions
- **Adding a URL**: Can be triggered globally from the Dashboard Overview or directly within the Tracked URLs page via a floating/fixed primary button.
- **Upgrading Plan**: Users hitting a limit (e.g., trying to add a 4th URL on the Free plan) will trigger a modal prompting them to navigate to the Billing settings.
