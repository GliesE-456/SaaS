import { db } from '@cct/db';
import { Queue } from 'bullmq';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function doManualCheck() {
  console.log('=== Manually Triggering Competitor Price Update & Crawl Check ===\n');

  const newPrice = `$45/month (Updated at ${new Date().toLocaleTimeString()})`;
  console.log(`1. Updating Alpha Cloud price in mock page database to: ${newPrice}`);
  
  await db.demoCompetitor.update({
    where: { id: 'competitor-alpha' },
    data: {
      pricing: newPrice,
      features: 'Unlimited Projects\n24/7 Priority Support\nAdvanced Analytics Dashboard\n250GB High-speed Storage\nGlobal Edge CDN\nPremium Security Shield',
    },
  });

  const targetUrl = 'http://localhost:3001/demo/competitor-alpha';
  const trackedUrl = await db.trackedUrl.findFirst({
    where: { url: targetUrl },
    orderBy: { createdAt: 'desc' },
  });

  if (!trackedUrl) {
    console.error(`Error: No tracked URL found for ${targetUrl}`);
    return;
  }

  console.log(`2. Found Tracked Url: ${trackedUrl.label} (ID: ${trackedUrl.id})`);

  // Queue Scrape Job
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const scrapeQueue = new Queue('scrapeQueue', {
    connection: { url: redisUrl } as any,
  });

  console.log('3. Enqueuing scrape job...');
  const job = await scrapeQueue.add('manualCheck', { trackedUrlId: trackedUrl.id });
  console.log(`Job added with ID: ${job.id}`);

  // Poll for completion
  console.log('4. Waiting for background worker to complete crawl...');
  let latestCheckRun = null;
  let changeEvent = null;

  // Let's get the count of check runs beforehand
  const initialCheckRunsCount = await db.checkRun.count({
    where: { trackedUrlId: trackedUrl.id }
  });

  for (let i = 0; i < 20; i++) {
    await sleep(1000);
    
    // Find latest check run
    latestCheckRun = await db.checkRun.findFirst({
      where: { trackedUrlId: trackedUrl.id },
      orderBy: { createdAt: 'desc' },
    });

    if (latestCheckRun) {
      const currentCheckRunsCount = await db.checkRun.count({
        where: { trackedUrlId: trackedUrl.id }
      });

      if (currentCheckRunsCount > initialCheckRunsCount) {
        console.log(`Crawl finished. HTTP Code: ${latestCheckRun.httpStatusCode}, Status: ${latestCheckRun.status}`);
        
        // Find change event
        changeEvent = await db.changeEvent.findFirst({
          where: {
            trackedUrlId: trackedUrl.id,
            checkRunId: latestCheckRun.id,
          },
        });
        
        break;
      }
    }
  }

  await scrapeQueue.close();

  console.log('\n=== LATEST CRAWL REPORT ===');
  if (changeEvent) {
    console.log('✅ CHANGE DETECTED AND REPORT GENERATED!');
    console.log(`Change Event ID:  ${changeEvent.id}`);
    console.log(`Diff Percentage:  ${changeEvent.changePercent}%`);
    console.log(`Impact Level:     ${changeEvent.impactLevel}`);
  } else {
    console.log('ℹ️ Crawl completed but no ChangeEvent was generated (possibly no differences detected or below threshold).');
  }
  console.log('===========================\n');
}

doManualCheck().catch(console.error);
