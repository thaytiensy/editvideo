import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import dotenv from 'dotenv';
import { projectRoutes } from './routes/projects.js';
import { renderRoutes } from './routes/render.js';
import { storageRoutes } from './routes/storage.js';
import { aiRoutes } from './routes/ai.js';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

await fastify.register(websocket);

// Register routes
await fastify.register(projectRoutes);
await fastify.register(renderRoutes);
await fastify.register(storageRoutes);
await fastify.register(aiRoutes);

// Health check
fastify.get('/health', async () => {
  return { status: 'healthy', service: 'Nexus Video Pro Fastify Server' };
});

// WebSocket for real-time render progress updates
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', (message: any) => {
      connection.socket.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
    });
  });
});

const PORT = parseInt(process.env.PORT || '8000');

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[Nexus Server] Running at http://localhost:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
