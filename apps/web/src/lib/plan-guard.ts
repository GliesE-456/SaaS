import { prisma } from '@cct/db';

export class PlanLimitError extends Error {
  constructor(
    public limitType: string,
    public current: number,
    public max: number,
    public planName: string,
  ) {
    super(`Plan limit reached: ${limitType} (${current}/${max}) on plan "${planName}"`);
    this.name = 'PlanLimitError';
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

export async function assertAiSummaryLimit(workspaceId: string): Promise<void> {
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: { maxAiSummariesMonth: true, planName: true },
  });

  const month = new Date().toISOString().slice(0, 7);
  const usage = await prisma.monthlyUsage.findUnique({
    where: { workspaceId_month: { workspaceId, month } },
    select: { aiSummaries: true },
  });

  const current = usage?.aiSummaries ?? 0;
  if (current >= workspace.maxAiSummariesMonth) {
    throw new PlanLimitError(
      'ai_summaries',
      current,
      workspace.maxAiSummariesMonth,
      workspace.planName,
    );
  }
}

export async function getWorkspaceUsage(workspaceId: string) {
  const month = new Date().toISOString().slice(0, 7);
  const [workspace, usage, urlCount] = await Promise.all([
    prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: {
        planName: true,
        planStatus: true,
        maxUrls: true,
        maxAiSummariesMonth: true,
        checkFreqOptions: true,
        featureFlags: true,
        historyRetentionDays: true,
      },
    }),
    prisma.monthlyUsage.findUnique({
      where: { workspaceId_month: { workspaceId, month } },
    }),
    prisma.trackedUrl.count({ where: { workspaceId, deletedAt: null } }),
  ]);

  return {
    planName: workspace.planName,
    planStatus: workspace.planStatus,
    featureFlags: workspace.featureFlags,
    limits: {
      urls: { current: urlCount, max: workspace.maxUrls },
      aiSummaries: { current: usage?.aiSummaries ?? 0, max: workspace.maxAiSummariesMonth },
      checksRun: usage?.checksRun ?? 0,
      alertsSent: usage?.alertsSent ?? 0,
    },
    checkFreqOptions: workspace.checkFreqOptions,
    historyRetentionDays: workspace.historyRetentionDays,
  };
}

export async function incrementUsage(
  workspaceId: string,
  field: 'checksRun' | 'aiSummaries' | 'alertsSent',
  amount = 1,
): Promise<void> {
  const month = new Date().toISOString().slice(0, 7);
  await prisma.monthlyUsage.upsert({
    where: { workspaceId_month: { workspaceId, month } },
    create: {
      workspaceId,
      month,
      [field]: amount,
    },
    update: {
      [field]: { increment: amount },
    },
  });
}
