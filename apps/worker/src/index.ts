import * as dotenv from 'dotenv';
dotenv.config();

import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { db } from '@cct/db';
import { setupScheduler } from './scheduler';
import { processScrapeJob } from './jobs/scrapeJob';
import { processAiJob } from './jobs/aiJob';
import { processNotifyJob } from './jobs/notifyJob';
import { processAnalysisJob } from './jobs/analysisJob';

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

async function main() {
  console.log('Starting CCT Worker Service...');

  // Setup cron scheduler for checkFrequencies
  await setupScheduler(connection);

  // Scrape Queue Worker
  const scrapeWorker = new Worker(
    'scrapeQueue',
    async (job) => {
      console.log(`Processing SCRAPE job ${job.id}`);
      await processScrapeJob({ ...job.data, jobId: job.id });
    },
    { connection: connection as any, concurrency: 5 }
  );

  // AI Summary Queue Worker
  const aiWorker = new Worker(
    'aiQueue',
    async (job) => {
      console.log(`Processing AI job ${job.id}`);
      await processAiJob(job.data);
    },
    { connection: connection as any, concurrency: 3 }
  );

  // Competitor Analysis Queue Worker
  const analysisWorker = new Worker(
    'analysisQueue',
    async (job) => {
      console.log(`Processing Competitor Analysis job ${job.id}`);
      await processAnalysisJob(job.data);
    },
    { connection: connection as any, concurrency: 2 }
  );

  // Notification Queue Worker
  const notifyWorker = new Worker(
    'notifyQueue',
    async (job) => {
      console.log(`Processing NOTIFY job ${job.id}`);
      await processNotifyJob(job.data);
    },
    { connection: connection as any, concurrency: 5 }
  );

  scrapeWorker.on('completed', (job) => console.log(`SCRAPE job ${job.id} completed`));
  scrapeWorker.on('failed', (job, err) => console.error(`SCRAPE job ${job?.id} failed:`, err));

  aiWorker.on('completed', (job) => console.log(`AI job ${job.id} completed`));
  aiWorker.on('failed', (job, err) => console.error(`AI job ${job?.id} failed:`, err));

  analysisWorker.on('completed', (job) => console.log(`Competitor Analysis job ${job.id} completed`));
  analysisWorker.on('failed', (job, err) => console.error(`Competitor Analysis job ${job?.id} failed:`, err));

  notifyWorker.on('completed', (job) => console.log(`NOTIFY job ${job.id} completed`));
  notifyWorker.on('failed', (job, err) => console.error(`NOTIFY job ${job?.id} failed:`, err));

  console.log('Worker Service is running.');
}

main().catch(console.error);
