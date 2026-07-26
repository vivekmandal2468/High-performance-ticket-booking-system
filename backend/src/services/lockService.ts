import { redisClient } from '../config/redis.js';

const reserveSeatsLua = 'local show_id = KEYS[1]\nlocal lock_ttl = ARGV[1]\nlocal lock_token = ARGV[2]\nfor i = 3, #ARGV do\n    local seat_key = "show:" .. show_id .. ":seat:" .. ARGV[i]\n    if redis.call("EXISTS", seat_key) == 1 then\n        return {err = "seat_unavailable:" .. ARGV[i]}\n    end\nend\nfor i = 3, #ARGV do\n    local seat_key = "show:" .. show_id .. ":seat:" .. ARGV[i]\n    redis.call("SET", seat_key, lock_token, "EX", lock_ttl)\nend\nreturn "OK"';

export async function tryLockSeats(showId: string, seatNumbers: string[], lockToken: string, ttlSeconds: number = 600) {
  try {
    const result = await redisClient.eval(
      reserveSeatsLua,
      1,
      showId,
      ttlSeconds.toString(),
      lockToken,
      ...seatNumbers
    );
    return { success: true, result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function releaseSeatsLock(showId: string, seatNumbers: string[]) {
  const keys = seatNumbers.map((seat: string) => 'show:' + showId + ':seat:' + seat);
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
}
