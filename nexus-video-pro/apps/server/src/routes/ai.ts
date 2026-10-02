import { FastifyPluginAsync } from 'fastify';
import { dispatchAITask } from '../queues/aiTaskDispatcher.js';

export const aiRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/ai/dispatch', async (req: any) => {
    const { taskType, payload } = req.body;
    const taskId = await dispatchAITask(taskType, payload);
    return { taskId, status: 'dispatched' };
  });
};
