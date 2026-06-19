import { db } from '@cct/db';
import { Queue } from 'bullmq';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('=== Starting E2E Competitor Change Detection Integration Test ===\n');

  // 1. Setup User & Workspace
  const email = 'testadmin@example.com';
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`Creating test user: ${email}...`);
    user = await db.user.create({
      data: {
        email,
        name: 'Test Admin',
        emailVerified: new Date(),
      },
    });
  }

  let workspace = await db.workspace.findFirst({
    where: { ownerId: user.id },
  });
  if (!workspace) {
    console.log('Creating default workspace...');
    workspace = await db.workspace.create({
      data: {
        name: 'Test Workspace',
        slug: `test-workspace-${Math.random().toString(36).substring(2, 6)}`,
        ownerId: user.id,
      },
    });

    await db.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'ADMIN',
        joinedAt: new Date(),
      },
    });
  }

  console.log(`Using Workspace ID: ${workspace.id}\n`);

  // 2. Clear old state
  const targetUrl = 'http://localhost:3002/demo/competitor-alpha';
  console.log(`Cleaning old tracked URLs matching: ${targetUrl}...`);
  const urlsToDelete = await db.trackedUrl.findMany({
    where: {
      workspaceId: workspace.id,
      url: targetUrl,
    },
    select: { id: true },
  });

  if (urlsToDelete.length > 0) {
    const urlIds = urlsToDelete.map((u) => u.id);
    await db.alert.deleteMany({
      where: { changeEvent: { trackedUrlId: { in: urlIds } } },
    });
    await db.changeEvent.deleteMany({
      where: { trackedUrlId: { in: urlIds } },
    });
    await db.checkRun.deleteMany({
      where: { trackedUrlId: { in: urlIds } },
    });
    await db.trackedUrl.deleteMany({
      where: { id: { in: urlIds } },
    });
  }

  // 3. Seed initial competitor-alpha content
  console.log('Resetting competitor-alpha to baseline pricing ($29/month)...');
  await db.demoCompetitor.upsert({
    where: { id: 'competitor-alpha' },
    update: {
      name: 'Alpha Cloud',
      pricing: '$29/month',
      description: 'The premier cloud platform for modern software development. Scale your infrastructure effortlessly with our distributed network.',
      features: 'Unlimited Projects\n24/7 Priority Support\nAdvanced Analytics Dashboard\n100GB High-speed Storage\nGlobal Edge CDN',
      ctaText: 'Start Free Trial',
    },
    create: {
      id: 'competitor-alpha',
      name: 'Alpha Cloud',
      pricing: '$29/month',
      description: 'The premier cloud platform for modern software development. Scale your infrastructure effortlessly with our distributed network.',
      features: 'Unlimited Projects\n24/7 Priority Support\nAdvanced Analytics Dashboard\n100GB High-speed Storage\nGlobal Edge CDN',
      ctaText: 'Start Free Trial',
    },
  });

  // 4. Create TrackedUrl record
  console.log(`Adding ${targetUrl} to TrackedUrls...`);
  const trackedUrl = await db.trackedUrl.create({
    data: {
      workspaceId: workspace.id,
      url: targetUrl,
      label: 'Alpha Cloud (Demo)',
      competitorName: 'Alpha Cloud',
      category: 'PRODUCT',
      checkFrequency: 'DAILY',
      noiseThreshold: 0.1, // low threshold to ensure change is captured
    },
  });

  // 5. Connect to Queue
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  console.log(`Connecting to Redis BullMQ at: ${redisUrl}`);
  const scrapeQueue = new Queue('scrapeQueue', {
    connection: { url: redisUrl } as any,
  });

  // 6. Trigger Baseline Check (First crawl)
  console.log('\n--- Triggering Baseline Crawl ---');
  let job = await scrapeQueue.add('manualCheck', { trackedUrlId: trackedUrl.id });
  console.log(`Baseline Crawl Job added with ID: ${job.id}`);

  // Poll for check completion
  console.log('Waiting for baseline crawl to complete...');
  let baselineCheckRun = null;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    baselineCheckRun = await db.checkRun.findFirst({
      where: { trackedUrlId: trackedUrl.id },
      orderBy: { createdAt: 'desc' },
    });
    if (baselineCheckRun) {
      console.log(`Crawl completed. Status: ${baselineCheckRun.status}`);
      break;
    }
  }

  if (!baselineCheckRun || baselineCheckRun.status !== 'SUCCESS') {
    await scrapeQueue.close();
    throw new Error(`Baseline crawl failed or timed out: ${baselineCheckRun?.errorMessage}`);
  }

  // 7. Update competitor-alpha pricing to $39/month (Simulate competitor updating page)
  console.log('\n--- Modifying Competitor Pricing ($29/month -> $39/month) ---');
  await db.demoCompetitor.update({
    where: { id: 'competitor-alpha' },
    data: {
      pricing: '$39/month',
      features: 'Unlimited Projects\n24/7 Priority Support\nAdvanced Analytics Dashboard\n200GB High-speed Storage\nGlobal Edge CDN', // also bumped storage
    },
  });
  console.log('Competitor content updated in DB successfully.');

  // 8. Trigger Second Check (Change detection crawl)
  console.log('\n--- Triggering Change Detection Crawl ---');
  job = await scrapeQueue.add('manualCheck', { trackedUrlId: trackedUrl.id });
  console.log(`Change Detection Job added with ID: ${job.id}`);

  // Poll for second check run & change event
  console.log('Waiting for crawl and change event generation...');
  let changeCheckRun = null;
  let changeEvent = null;

  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    // Find latest check run that is different from baseline
    changeCheckRun = await db.checkRun.findFirst({
      where: {
        trackedUrlId: trackedUrl.id,
        id: { not: baselineCheckRun.id },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (changeCheckRun) {
      console.log(`Crawl completed. Status: ${changeCheckRun.status}`);
      
      // Look for the ChangeEvent
      changeEvent = await db.changeEvent.findFirst({
        where: {
          trackedUrlId: trackedUrl.id,
          checkRunId: changeCheckRun.id,
        },
      });

      if (changeEvent) {
        console.log('SUCCESS! Change event successfully generated by monitoring system!');
        break;
      }
    }
  }

  await scrapeQueue.close();

  if (!changeEvent) {
    throw new Error('Change detection crawl completed but no ChangeEvent was generated.');
  }

  // 9. Print Results
  console.log('\n=== INTEGRATION TEST RESULTS ===');
  console.log(`Change Event ID: ${changeEvent.id}`);
  console.log(`Diff Percentage: ${changeEvent.changePercent}%`);
  console.log(`Impact Level:    ${changeEvent.impactLevel}`);
  console.log(`AI Summarization Status: ${changeEvent.aiStatus}`);
  console.log('=================================');
  console.log('\nTest completed successfully!');
}

runTest().catch((err) => {
  console.error('\nTest failed with error:', err);
  process.exit(1);
});
