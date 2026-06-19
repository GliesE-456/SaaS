import { db } from '@cct/db';
import { Queue } from 'bullmq';

async function updatePortAndTrigger() {
  console.log('--- Updating Tracked URLs to port 3001 ---');
  
  // Update all URLs containing :3002 to :3001
  const urls = await db.trackedUrl.findMany();
  
  for (const u of urls) {
    if (u.url.includes('localhost:3002')) {
      const newUrl = u.url.replace('localhost:3002', 'localhost:3001');
      console.log(`Updating ${u.url} -> ${newUrl}`);
      
      await db.trackedUrl.update({
        where: { id: u.id },
        data: { url: newUrl },
      });
    }
  }

  // Trigger check for updated URLs
  const updatedUrls = await db.trackedUrl.findMany({
    where: {
      url: { contains: 'localhost:3001' }
    }
  });

  if (updatedUrls.length === 0) {
    console.log('No localhost:3001 URLs found to check.');
    return;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const scrapeQueue = new Queue('scrapeQueue', {
    connection: { url: redisUrl } as any,
  });

  for (const u of updatedUrls) {
    console.log(`Triggering check for URL: ${u.url} (ID: ${u.id})...`);
    await scrapeQueue.add('manualCheck', { trackedUrlId: u.id });
  }

  await scrapeQueue.close();
  console.log('Checks queued successfully.');
}

updatePortAndTrigger().catch(console.error);
