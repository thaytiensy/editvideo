import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const aiTaskQueue = new Queue('ai-inference-tasks', {
  connection: redisConnection,
});

export async function dispatchAITask(taskType: string, payload: any) {
  const job = await aiTaskQueue.add(taskType, payload, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
  return job.id;
}
