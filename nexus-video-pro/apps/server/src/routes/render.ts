import { FastifyPluginAsync } from 'fastify';
import { renderQueue } from '../queues/renderQueue.js';

export const renderRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/render', async (req: any) => {
    const job = await renderQueue.add('render-timeline', req.body);
    return { jobId: job.id, status: 'queued' };
  });

  fastify.get('/api/render/:jobId', async (req: any, reply) => {
    const job = await renderQueue.getJob(req.params.jobId);
    if (!job) return reply.status(404).send({ error: 'Job not found' });
    const state = await job.getState();
    const progress = job.progress;
    return { id: job.id, state, progress, returnvalue: job.returnvalue };
  });
};
