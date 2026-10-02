import { FastifyPluginAsync } from 'fastify';
import { projectService } from '../services/ProjectService.js';

export const projectRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/projects', async () => {
    return await projectService.listProjects();
  });

  fastify.get('/api/projects/:id', async (req: any, reply) => {
    const project = await projectService.getProject(req.params.id);
    if (!project) return reply.status(404).send({ error: 'Project not found' });
    return project;
  });

  fastify.post('/api/projects', async (req: any) => {
    await projectService.saveProject(req.body);
    return { success: true };
  });
};
