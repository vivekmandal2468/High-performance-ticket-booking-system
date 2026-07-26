import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

redisClient.on('connect', () => {
  console.log('Connected to Redis successfully.');
});

redisClient.on('error', (err) => {
  console.error('Redis Connection Error:', err);
});
