# Database Specification - Competitor Change Tracker

This document outlines the database schema, including tables, relationships, constraints, and indexes, as defined in our Prisma ORM configuration (`schema.prisma`) for PostgreSQL.

---

## 1. Core Authentication & Identity

### `User`
Stores individual users registered on the platform.
- **Fields**: `id` (PK), `email`, `emailVerified`, `passwordHash`, `name`, `avatarUrl`, `role`, `stripeCustomerId`, `createdAt`, `updatedAt`
- **Relations**: 
  - 1:M with `Account`, `Session`, `WorkspaceMember`, `ApiKey`, `NotificationPreference`, `AuditLog`
  - 1:M with `Workspace` (as `ownedWorkspaces`)
- **Constraints**: `email` (UNIQUE), `stripeCustomerId` (UNIQUE)

### `Account`
Stores OAuth accounts (e.g., Google, GitHub) linked to a `User`.
- **Fields**: `id` (PK), `userId` (FK), `provider`, `providerAccountId`, `accessToken`, `refreshToken`, `expiresAt`, `createdAt`
- **Relations**: M:1 with `User`
- **Constraints**: Unique combination of `[provider, providerAccountId]`
- **Indexes**: `userId`

### `Session`
Stores active session tokens for logged-in users.
- **Fields**: `id` (PK), `userId` (FK), `token`, `expiresAt`, `createdAt`
- **Relations**: M:1 with `User`
- **Constraints**: `token` (UNIQUE)
- **Indexes**: `userId`, `expiresAt`

### `EmailVerification` / `PasswordReset`
Handles magic links, email verification, and password reset flows.
- **Fields**: `id` (PK), `userId` (FK/Unique), `token` (UNIQUE), `expiresAt`, `createdAt`
- **Indexes**: `userId` (for PasswordReset)

---

## 2. Multi-Tenancy & Workspaces

### `Workspace`
The primary container for billing, settings, and URLs. Limits are denormalized here from Stripe to avoid dual-write hazards.
- **Fields**: `id` (PK), `name`, `slug`, `ownerId` (FK), `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `planName`, `planStatus`, limits (`maxUrls`, `maxAiSummariesMonth`, etc.), `featureFlags`, `createdAt`, `updatedAt`
- **Relations**: 
  - M:1 with `User` (owner)
  - 1:M with `WorkspaceMember`, `TrackedUrl`, `ChangeEvent`, `Integration`, `AuditLog`
- **Constraints**: `slug` (UNIQUE), `stripeCustomerId` (UNIQUE), `stripeSubscriptionId` (UNIQUE)
- **Indexes**: `ownerId`

### `WorkspaceMember`
Associates a `User` with a `Workspace` under a specific role (ADMIN, EDITOR, VIEWER).
- **Fields**: `id` (PK), `workspaceId` (FK), `userId` (FK), `role`, `invitedAt`, `joinedAt`
- **Relations**: M:1 with `Workspace`, M:1 with `User`
- **Constraints**: Unique combination of `[workspaceId, userId]`
- **Indexes**: `userId`

### `Invite`
Stores pending invitations to join a `Workspace`.
- **Fields**: `id` (PK), `workspaceId` (FK), `email`, `role`, `token`, `expiresAt`, `acceptedAt`, `createdAt`
- **Constraints**: `token` (UNIQUE)
- **Indexes**: `workspaceId`, `token`

---

## 3. Core Application Models

### `TrackedUrl`
Represents a competitor URL being monitored for changes within a workspace.
- **Fields**: `id` (PK), `workspaceId` (FK), `url`, `label`, `competitorName`, `category`, `status`, `checkFrequency`, noise controls, state (`lastCheckedAt`, `lastChangedAt`, `nextCheckAt`, etc.)
- **Relations**: M:1 with `Workspace`, 1:M with `CheckRun`, `ChangeEvent`
- **Constraints**: Unique combination of `[workspaceId, url]`
- **Indexes**: `nextCheckAt`, `status`, `workspaceId`, `deletedAt`, `competitorName`

### `CheckRun`
A log of an individual scrape/check operation for a URL.
- **Fields**: `id` (PK), `trackedUrlId` (FK), `status`, `httpStatusCode`, `contentHash`, `snapshotKey`, `snapshotBytes`, `durationMs`, `errorMessage`, `robotsBlocked`, `createdAt`
- **Relations**: M:1 with `TrackedUrl`, 1:1 with `ChangeEvent`
- **Indexes**: `[trackedUrlId, createdAt]`, `createdAt`

### `ChangeEvent`
Created when a `CheckRun` detects a content change. Holds AI summaries and impact scoring.
- **Fields**: `id` (PK), `workspaceId` (FK), `trackedUrlId` (FK), `checkRunId` (FK/Unique), `changePercent`, `impactScore`, `impactLevel`, `beforeKey`, `afterKey`, `aiSummary`, `isRead`, `cursorId` (Pagination)
- **Relations**: M:1 with `Workspace`, M:1 with `TrackedUrl`, 1:1 with `CheckRun`, 1:M with `Alert`
- **Constraints**: `checkRunId` (UNIQUE)
- **Indexes**: `[workspaceId, cursorId]`, `[workspaceId, isRead, cursorId]`, `[trackedUrlId, cursorId]`, `[workspaceId, impactLevel, cursorId]`

### `Alert`
A notification sent to a user/channel regarding a `ChangeEvent`.
- **Fields**: `id` (PK), `changeEventId` (FK), `channel`, `status`, `sentAt`, `recipientEmail`, `webhookUrl`, `createdAt`
- **Relations**: M:1 with `ChangeEvent`
- **Indexes**: `changeEventId`, `[status, createdAt]`

---

## 4. Settings & Integrations

### `NotificationPreference`
User-specific notification settings per workspace (e.g., Email vs Slack, Digest Frequency).
- **Fields**: `id` (PK), `userId` (FK), `workspaceId` (FK), `emailEnabled`, `emailDigest`, `minImpactLevel`, `updatedAt`
- **Relations**: M:1 with `User`
- **Constraints**: Unique combination of `[userId, workspaceId]`
- **Indexes**: `userId`

### `Integration` (Post-MVP)
Third-party integrations configured for a workspace (e.g., Slack, Webhooks).
- **Fields**: `id` (PK), `workspaceId` (FK), `type`, `name`, `isActive`, token fields, `createdAt`, `updatedAt`
- **Relations**: M:1 with `Workspace`
- **Indexes**: `workspaceId`

### `ApiKey` (Post-MVP)
API keys generated by a user for programmatic access to a workspace.
- **Fields**: `id` (PK), `userId` (FK), `workspaceId` (FK), `name`, `keyHash`, `keyPrefix`, `createdAt`
- **Relations**: M:1 with `User`
- **Constraints**: `keyHash` (UNIQUE)
- **Indexes**: `userId`, `workspaceId`

---

## 5. System Models

### `RobotsTxtCache`
Caches fetched `robots.txt` files for domains to prevent repetitive network calls.
- **Fields**: `domain` (PK), `content`, `fetchedAt`, `expiresAt`
- **Indexes**: `expiresAt`

### `MonthlyUsage`
Upsert-safe composite PK table tracking resources used by a workspace in a given month.
- **Fields**: `workspaceId` (PK), `month` (PK), `checksRun`, `aiSummaries`, `alertsSent`, `bytesStored`
- **Constraints**: Primary key is a composite of `[workspaceId, month]`

### `AuditLog`
Append-only log tracking system and user actions for security and compliance.
- **Fields**: `id` (PK), `workspaceId` (FK), `userId` (FK), `action`, `targetType`, `targetId`, `metadata`, `ip`, `userAgent`, `createdAt`
- **Relations**: M:1 with `User`, M:1 with `Workspace`
- **Indexes**: `[workspaceId, createdAt]`, `[userId, createdAt]`

### `ProcessedStripeEvent`
Ensures idempotency for Stripe Webhooks.
- **Fields**: `stripeEventId` (PK), `processedAt`
