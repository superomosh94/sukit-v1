import { Queue } from 'bullmq';
import { getRedis } from '../utils/redis';

export const emailQueue = new Queue('sukit-emails', {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 86400 },
    removeOnFail: { age: 604800 },
  },
});
