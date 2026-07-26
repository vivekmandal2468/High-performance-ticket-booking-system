import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

export const dbPool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'ticket_user',
  password: process.env.DB_PASSWORD || 'ticket_password',
  database: process.env.DB_NAME || 'ticket_booking_db',
  max: 20,
  idleTimeoutMillis: 30000,
});
