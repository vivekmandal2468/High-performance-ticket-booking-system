import { Queue, Worker } from 'bullmq';
import { redisClient } from '../config/redis.js';
import { releaseSeatsLock } from '../services/lockService.js';
import { dbPool } from '../config/db.js';

export const bookingExpirationQueue = new Queue('booking-expiration-queue', {
  connection: redisClient,
});

export const bookingWorker = new Worker(
  'booking-expiration-queue',
  async (job) => {
    const { bookingId, showId, seatNumbers } = job.data;
    console.log('Processing expiration check for Booking ID: ' + bookingId);

    const client = await dbPool.connect();
    try {
      const res = await client.query('SELECT status FROM bookings WHERE id = $1', [bookingId]);
      if (res.rows.length > 0 && res.rows[0].status === 'PENDING') {
        await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['EXPIRED', bookingId]);
        await releaseSeatsLock(showId, seatNumbers);
        console.log('Booking ' + bookingId + ' expired. Seats ' + seatNumbers.join(', ') + ' released.');
      }
    } finally {
      client.release();
    }
  },
  { connection: redisClient }
);