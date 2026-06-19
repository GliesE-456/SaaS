import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { db } from '@cct/db';

export async function setupScheduler(connection: IORedis) {
  const scrapeQueue = new Queue('scrapeQueue', { connection: connection as any });

  // Simple interval-based scheduler to check for URLs that need scanning
  setInterval(async () => {
    try {
      const now = new Date();
      
      // Try to acquire distributed lock in Redis for 50 seconds to prevent race conditions on scale
      const lockKey = 'cct_scheduler_tick_lock';
      const acquired = await connection.set(lockKey, '1', 'PX', 50000, 'NX');
      if (!acquired) {
        return; // Another worker instance already ran this minute's tick
      }
      
      const urls = await db.trackedUrl.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, checkFrequency: true, lastCheckedAt: true }
      });

      for (const url of urls) {
        let shouldCheck = false;
        if (!url.lastCheckedAt) {
          shouldCheck = true;
        } else {
          const hoursSinceLastCheck = (now.getTime() - url.lastCheckedAt.getTime()) / (1000 * 60 * 60);
          
          switch (url.checkFrequency) {
            case 'ONE_HOUR':
              shouldCheck = hoursSinceLastCheck >= 1;
              break;
            case 'SIX_HOURS':
              shouldCheck = hoursSinceLastCheck >= 6;
              break;
            case 'DAILY':
              shouldCheck = hoursSinceLastCheck >= 24;
          }
        }

        if (shouldCheck) {
          // Add to BullMQ queue instead of DB Job table for automated cron checks
          await scrapeQueue.add('automatedCheck', { trackedUrlId: url.id }, {
            jobId: `auto_check_${url.id}_${now.getTime()}`,
            removeOnComplete: true,
            removeOnFail: true,
          });
          
          // Optimistically update lastCheckedAt to prevent duplicate enqueuing
          await db.trackedUrl.update({
            where: { id: url.id },
            data: { lastCheckedAt: now }
          });
        }
      }
    } catch (e) {
      console.error('Scheduler error:', e);
    }
  }, 60000); // Check every minute
}
