import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { createSocketServer } from './websocket/server';
import { getRedis, closeRedis, hasRedis } from './utils/redis';
import { logger } from './utils/logger';

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startWorkers() {
  if (!hasRedis()) {
    logger.warn('Redis not configured — skipping background workers');
    return;
  }

  try {
    const { exportWorker } = await import('./workers/export-worker');
    const { emailWorker } = await import('./workers/email-worker');
    const { webhookWorker } = await import('./workers/webhook-worker');

    logger.info('Background workers started');
  } catch (err) {
    logger.warn('Failed to start background workers', (err as Error).message);
  }
}

async function main() {
  const io = await createSocketServer(httpServer);

  const PORT = parseInt(process.env.PORT || '3001', 10);
  const HOST = process.env.HOST || '0.0.0.0';

  const server = httpServer.listen(PORT, HOST, () => {
    logger.info(`SUKIT server running on ${HOST}:${PORT}`);
    getRedis();
    startWorkers();
  });

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server, io));
  process.on('SIGINT', () => gracefulShutdown('SIGINT', server, io));
}

main();

async function gracefulShutdown(
  signal: string,
  server: import('http').Server,
  io: import('socket.io').Server
) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  io.close(() => {
    server.close(async () => {
      await closeRedis();
      logger.info('All connections closed');
      process.exit(0);
    });
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}
