import { tryLockSeats, releaseSeatsLock } from '../services/lockService.js';
import { redisClient } from '../config/redis.js';
import { jest, describe, it,
expect, afterEach } from '@jest/globals';

jest.mock('../config/redis.js', () => ({
  redisClient: {
    eval: jest.fn(),
    del: jest.fn(),
  },
}));

describe('LockService Unit Tests (Atomic Lua Seat Locking)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully acquire lock when Redis Lua returns OK', async () => {
    (redisClient.eval as any).mockResolvedValue('OK');
    const result = await tryLockSeats('show_101', ['A1', 'A2'], 'bk_123', 600);
    expect(redisClient.eval).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    expect(result.result).toBe('OK');
  });

  it('should return failure when Redis Lua script throws SEAT_UNAVAIlABLE error', async () => {
    (redisClient.eval as any).mockRejectedValue(new Error('SEAT_UNAVAILABLE:A1'));
    const result = await tryLockSeats('show_101', ['A1', 'A2'], 'bk_123', 600);
    expect(redisClient.eval).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.error).toBe('SEAT_UNAVAILABLE:A1');
  });

  it('should delete keys from Redis when releaseSeatsLock is called', async () => {
    (redisClient.del as any).mockResolvedValue(2);
    await releaseSeatsLock('show_101', ['A1', 'A2']);
    expect(redisClient.del).toHaveBeenCalledWith('show:show_101:seat:A1', 'show:show_101:seat:A2');
  });
});
