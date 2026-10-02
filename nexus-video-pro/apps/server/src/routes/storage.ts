import { FastifyPluginAsync } from 'fastify';
import { storageService } from '../services/StorageService.js';

export const storageRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/storage/upload-url', async (req: any) => {
    const { key, contentType } = req.body;
    const url = await storageService.getUploadPresignedUrl(key, contentType);
    return { uploadUrl: url, key };
  });

  fastify.get('/api/storage/download-url', async (req: any) => {
    const { key } = req.query;
    const url = await storageService.getDownloadPresignedUrl(key);
    return { downloadUrl: url };
  });
};
