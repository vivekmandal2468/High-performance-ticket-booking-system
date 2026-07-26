import { Request, Response } from 'express';
import { dbPool } from '../config/db.js';
import crypto from 'crypto';

export async function reserveSeats(req: Request, res: Response) {
  const { userId, showId, seatNumbers } = req.body;
  const isDemoMode = process.env.DEMO_MODE === 'true';

  if (!userId || !showId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ error: 'Invalid input parameters.' });
  }

  const bookingId = 'bk_' + crypto.randomBytes(8).toString('hex');
  const lockTTLSeconds = 600;
  if (isDemoMode) {
    return res.status(200).json({
      message: 'Seats reserved successfully! Complete payment within 10 minutes.',
      bookingId,
      expiresInSeconds: lockTTLSeconds,
    });
  }

  const { tryLockSeats } = await import('../services/lockService.js');
  const { bookingExpirationQueue } = await import('../queues/bookingQueue.js');

  const lockResult = await tryLockSeats(showId, seatNumbers, bookingId, lockTTLSeconds);

  if (!lockResult.success) {
    return res.status(409).json({
      error: 'One or more requested seats are already reserved/booked.',
      details: lockResult.error,
    });
  }

  const client = await dbPool.connect();
  try {
    await client.query(
      'INSERT INTO bookings (id, user_id, show_id, seat_numbers, status, amount) VALUES ($1, $2, $3, $4, $5, $6)',
      [bookingId, userId, showId, JSON.stringify(seatNumbers), 'PENDING', seatNumbers.length * 250.0]
    );

    await bookingExpirationQueue.add(
      'expire-reservation',
      { bookingId, showId, seatNumbers },
      { delay: lockTTLSeconds * 1000 }
    );

    return res.status(200).json({
      message: 'Seats reserved successfully! Complete payment within 10 minutes.',
      bookingId,
      expiresInSeconds: lockTTLSeconds,
    });
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
}

export async function confirmPayment(req: Request, res: Response) {
  const { bookingId } = req.body;
  const isDemoMode = process.env.DEMO_MODE === 'true';

  if (!bookingId) {
    return res.status(400).json({ error: 'bookingId is required.' });
  }
  if (isDemoMode) {
    return res.status(200).json({ message: 'Payment confirmed! Ticket booked successfully.', bookingId });
  }

  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');

    const bookingRes = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [bookingId]);
    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const booking = bookingRes.rows[0];
    if (booking.status !== 'PENDING') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Booking cannot be confirmed. Current status: ' + booking.status });
    }

    await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['CONFIRMED', bookingId]);

    const seatNumbers: string[] = JSON.parse(booking.seat_numbers);
    for (const seat of seatNumbers) {
      await client.query(
        'INSERT INTO seats (id, show_id, seat_number, status) VALUES ($1, $2, $3, $4) ON CONFLICT (show_id, seat_number) DO UPDATE SET status = $4',
        ['seat_' + crypto.randomBytes(6).toString('hex'), booking.show_id, seat, 'BOOKED']
      );
    }

    await client.query('COMMIT');
    return res.status(200).json({ message: 'Payment confirmed! Ticket booked successfully.', bookingId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Payment Error:', error);
    return res.status(500).json({ error: 'Payment processing failed.' });
  } finally {
    client.release();
  }
}