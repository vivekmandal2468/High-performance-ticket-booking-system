import { Request, Response } from 'express';
import { dbPool } from '../config/db.js';

function buildDefaultSeats(totalSeats: number): Record<string, string> {
  const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const seatsPerRow = 10;
  const seatStatuses: Record<string, string> = {};
  for (let r = 0; r < Math.ceil(totalSeats / seatsPerRow); r++) {
    for (let s = 1; s <= seatsPerRow && r * seatsPerRow + s <= totalSeats; s++) {
      const seatName = `${rows[r]}${s}`;
      seatStatuses[seatName] = 'AVAILABLE';
    }
  }
  return seatStatuses;
}

export async function getShowDetails(req: Request, res: Response) {
  const { showId } = req.params;
  const isDemoMode = process.env.DEMO_MODE === 'true';
  if (isDemoMode) {
    return res.status(200).json({
      show: {
        id: showId,
        title: 'Coldplay Live Concert',
        totalSeats: 100,
        createdAt: new Date().toISOString(),
      },
      seats: buildDefaultSeats(100),
    });
  }

  const client = await dbPool.connect();
  try {
    const showRes = await client.query('SELECT * FROM shows WHERE id = $1', [showId]);
    if (showRes.rows.length === 0) {
      return res.status(404).json({ error: 'Show not found.' });
    }

    const show = showRes.rows[0];
    const totalSeats = show.total_seats;
    const seatStatuses = buildDefaultSeats(totalSeats);

    const seatsRes = await client.query(
      'SELECT seat_number, status FROM seats WHERE show_id = $1',
      [showId]
    );
    for (const seat of seatsRes.rows) {
      seatStatuses[seat.seat_number] = seat.status;
    }

    const { redisClient } = await import('../config/redis.js');
    for (const seatName of Object.keys(seatStatuses)) {
      if (seatStatuses[seatName] === 'AVAILABLE') {
        const key = `show:${showId}:seat:${seatName}`;
        const locked = await redisClient.get(key);
        if (locked) {
          seatStatuses[seatName] = 'RESERVED';
        }
      }
    }

    return res.status(200).json({
      show: {
        id: show.id,
        title: show.title,
        totalSeats: show.total_seats,
        createdAt: show.created_at,
      },
      seats: seatStatuses,
    });
  } catch (error) {
    console.error('Error fetching show details:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
}
