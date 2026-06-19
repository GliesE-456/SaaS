import { db } from '@cct/db';
import { chromium } from 'playwright';
import TurndownService from 'turndown';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { uploadSnapshot, getSnapshot } from '../utils/s3';
import { computeDiff } from '../utils/diff';
import crypto from 'crypto';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// Remove noisy elements
turndownService.addRule('removeNoise', {
  filter: ['script', 'style', 'noscript', 'iframe', 'nav', 'footer', 'header'],
  replacement: () => ''
});

const connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
// Separate publisher connection (subscribe/publish can't share a connection)
const publisherConnection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
const aiQueue = new Queue('aiQueue', { connection: connection as any });
const analysisQueue = new Queue('analysisQueue', { connection: connection as any });
const notifyQueue = new Queue('notifyQueue', { connection: connection as any });

function getNextCheckAt(frequency: string): Date {
  const now = new Date();
  if (frequency === 'ONE_HOUR') now.setHours(now.getHours() + 1);
  else if (frequency === 'SIX_HOURS') now.setHours(now.getHours() + 6);
  else now.setDate(now.getDate() + 1); // DAILY
  return now;
}

async function publishProgress(jobId: string, payload: object) {
  try {
    await publisherConnection.publish(`checkProgress_${jobId}`, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to publish progress:', err);
  }
}

export async function processScrapeJob(data: { jobId?: string, trackedUrlId: string }) {
  const { trackedUrlId, jobId } = data;

  const trackedUrl = await db.trackedUrl.findUnique({ where: { id: trackedUrlId } });
  if (!trackedUrl) throw new Error(`TrackedUrl ${trackedUrlId} not found`);

  // Protect against SSRF in worker
  const urlObj = new URL(trackedUrl.url);
  const isInternalDemo = ['localhost', '127.0.0.1'].includes(urlObj.hostname) && urlObj.pathname.startsWith('/demo/competitor-');
  if (!isInternalDemo && (['localhost', '127.0.0.1', '169.254.169.254'].includes(urlObj.hostname) || urlObj.hostname.endsWith('.internal'))) {
     throw new Error('Blocked SSRF attempt');
  }

  const startTime = Date.now();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'CCTBot/1.0 (+https://cct.example.com/bot)',
  });
  const page = await context.newPage();

  let checkRunStatus: 'SUCCESS' | 'FAILED' = 'FAILED';
  let httpStatusCode: number | null = null;
  let errorMessage: string | null = null;
  let markdown = '';
  let contentHash = '';

  try {
    const response = await page.goto(trackedUrl.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    httpStatusCode = response ? response.status() : null;

    // Strip nav/footer/header before turndown for better results
    await page.evaluate(() => {
      const selectors = ['nav', 'header', 'footer', '.cookie-banner', '#ads'];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });
    });

    const html = await page.content();
    markdown = turndownService.turndown(html);
    contentHash = crypto.createHash('sha256').update(markdown).digest('hex');
    checkRunStatus = 'SUCCESS';
  } catch (err: any) {
    errorMessage = err.message || 'Unknown scrape error';
    checkRunStatus = 'FAILED';
  } finally {
    await browser.close();
  }

  const durationMs = Date.now() - startTime;
  const nextCheckAt = getNextCheckAt(trackedUrl.checkFrequency);

  // If failed, record it and update status
  if (checkRunStatus === 'FAILED') {
    await db.checkRun.create({
      data: {
        trackedUrlId: trackedUrl.id,
        status: 'FAILED',
        errorMessage: errorMessage?.substring(0, 500),
        durationMs,
      }
    });

    await db.trackedUrl.update({
      where: { id: trackedUrl.id },
      data: {
        lastCheckedAt: new Date(),
        consecutiveFails: { increment: 1 },
        status: trackedUrl.consecutiveFails >= 2 ? 'ERROR' : 'ACTIVE',
        nextCheckAt,
      }
    });

    if (jobId) {
      await publishProgress(jobId, { status: 'failed', error: errorMessage });
    }
    return;
  }

  // Get previous successful check run
  const lastSuccessCheckRun = await db.checkRun.findFirst({
    where: { trackedUrlId: trackedUrl.id, status: 'SUCCESS' },
    orderBy: { createdAt: 'desc' },
  });

  let hasChanges = false;
  let oldMarkdown = '';

  if (lastSuccessCheckRun) {
    if (lastSuccessCheckRun.contentHash !== contentHash) {
      hasChanges = true;
      if (lastSuccessCheckRun.snapshotKey) {
        oldMarkdown = await getSnapshot(lastSuccessCheckRun.snapshotKey);
      }
    }
  } else {
    // First time successful scrape
    hasChanges = true;
  }

  // Generate Key for R2
  const checkRunId = crypto.randomUUID();
  const s3Key = `snapshots/${trackedUrl.workspaceId}/${trackedUrl.id}/${checkRunId}.txt`;

  // Upload to S3/R2
  await uploadSnapshot(s3Key, markdown);

  // Create CheckRun record
  const checkRun = await db.checkRun.create({
    data: {
      id: checkRunId,
      trackedUrlId: trackedUrl.id,
      status: 'SUCCESS',
      httpStatusCode,
      contentHash,
      snapshotKey: s3Key,
      snapshotBytes: Buffer.byteLength(markdown, 'utf-8'),
      durationMs,
    }
  });

  let changeEventId: string | null = null;

  if (hasChanges) {
    // Compute diff
    const diffResult = computeDiff(oldMarkdown, markdown);

    // Check noise threshold
    if (diffResult.changePercent >= trackedUrl.noiseThreshold) {
      // Create ChangeEvent record
      const changeEvent = await db.changeEvent.create({
        data: {
          workspaceId: trackedUrl.workspaceId,
          trackedUrlId: trackedUrl.id,
          checkRunId: checkRun.id,
          changePercent: diffResult.changePercent,
          impactLevel: diffResult.impactLevel,
          beforeKey: lastSuccessCheckRun?.snapshotKey || s3Key,
          afterKey: s3Key,
          aiStatus: 'PENDING',
        }
      });

      changeEventId = changeEvent.id;

      // Enqueue AI job
      await aiQueue.add('generateSummary', { changeId: changeEvent.id });
      // Enqueue alert job immediately
      await notifyQueue.add('sendAlert', { changeId: changeEvent.id });
    }
  }

  // Update URL metadata
  const updatedUrl = await db.trackedUrl.update({
    where: { id: trackedUrl.id },
    data: {
      lastCheckedAt: new Date(),
      lastChangedAt: hasChanges ? new Date() : trackedUrl.lastChangedAt,
      lastContentHash: contentHash,
      consecutiveFails: 0,
      status: 'ACTIVE',
      nextCheckAt,
    }
  });

  // If analysis is pending, queue it
  if (updatedUrl.analysisStatus === 'PENDING') {
    await db.trackedUrl.update({
      where: { id: trackedUrl.id },
      data: { analysisStatus: 'PROCESSING' }
    });
    console.log(`[scrapeJob] Enqueuing competitor analysis for TrackedUrl ${trackedUrl.id}`);
    await analysisQueue.add('analyzeWebsite', { trackedUrlId: trackedUrl.id, snapshotKey: s3Key });
  }

  // Notify client if manual check
  if (jobId) {
    await publishProgress(jobId, { status: 'completed', changeEventId });
  }
}
// Force recompilation after schema update
