import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { renderService, RenderJobSpec } from '../services/RenderService.js';

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const renderQueue = new Queue('video-render-queue', {
  connection: redisConnection,
});

export const renderWorker = new Worker(
  'video-render-queue',
  async (job: Job<RenderJobSpec>) => {
    console.log(`[Worker] Starting render job ${job.id}`);
    const result = await renderService.renderTimeline(job.data, (percent) => {
      job.updateProgress(percent);
    });
    console.log(`[Worker] Finished render job ${job.id} -> ${result}`);
    return result;
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);
