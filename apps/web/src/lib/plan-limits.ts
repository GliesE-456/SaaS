import { db } from '@cct/db';

export const PLAN_LIMITS: Record<string, {
  maxUrls: number;
  maxAiSummaries: number;
  aiSummariesPerMonth: number;
  allowedFrequencies: string[];
  historyRetentionDays: number;
}> = {
  FREE: {
    maxUrls: 3,
    maxAiSummaries: 10,
    aiSummariesPerMonth: 10,
    allowedFrequencies: ['DAILY'],
    historyRetentionDays: 7,
  },
  STARTER: {
    maxUrls: 25,
    maxAiSummaries: 200,
    aiSummariesPerMonth: 200,
    allowedFrequencies: ['DAILY', 'SIX_HOURS'],
    historyRetentionDays: 30,
  },
  GROWTH: {
    maxUrls: 100,
    maxAiSummaries: 99999,
    aiSummariesPerMonth: 99999,
    allowedFrequencies: ['ONE_HOUR', 'SIX_HOURS', 'DAILY'],
    historyRetentionDays: 90,
  },
  PRO: {
    maxUrls: 100,
    maxAiSummaries: 1000,
    aiSummariesPerMonth: 1000,
    allowedFrequencies: ['ONE_HOUR', 'SIX_HOURS', 'DAILY'],
    historyRetentionDays: 90,
  },
};

export async function checkPlanLimits(
  ownerId: string,
  resource: 'urls' | 'aiSummaries',
  currentCount: number,
  requestedFrequency?: string
) {
  // Retrieve workspace plan from DB
  const workspace = await db.workspace.findFirst({
    where: { ownerId },
  });

  const planName = (workspace?.planName || 'FREE').toUpperCase();
  const limits = PLAN_LIMITS[planName] || PLAN_LIMITS.FREE;

  if (resource === 'urls' && currentCount >= limits.maxUrls) {
    return { allowed: false, reason: 'URL limit reached', maxLimit: limits.maxUrls };
  }

  if (resource === 'aiSummaries' && currentCount >= limits.maxAiSummaries) {
    return { allowed: false, reason: 'AI summary limit reached', maxLimit: limits.maxAiSummaries };
  }

  if (requestedFrequency && !limits.allowedFrequencies.includes(requestedFrequency)) {
    return { allowed: false, reason: `Frequency ${requestedFrequency} not allowed on ${planName} plan` };
  }

  return { allowed: true };
}
