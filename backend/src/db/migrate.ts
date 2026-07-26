import { dbPool } from '../config/db.js';

async function runMigrations() {
  const client = await dbPool.connect();
  try {
    console.log('Starting Database Migrations...');
    await client.query('BEGIN');
    await client.query('CREATE TABLE IF NOT EXISTS shows (id VARCHAR(50) PRIMARY KEY, title VARCHAR(255) NOT NULL, total_seats INT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);');
    await client.query('CREATE TABLE IF NOT EXISTS seats (id VARCHAR(50) PRIMARY KEY, show_id VARCHAR(50) REFERENCES shows(id), seat_number VARCHAR(10) NOT NULL, status VARCHAR(20) DEFAULT \'AVAILABLE\', version INT DEFAULT 1, UNIQUE(show_id, seat_number));');
    await client.query('CREATE TABLE IF NOT EXISTS bookings (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) NOT NULL, show_id VARCHAR(50) REFERENCES shows(id), seat_numbers JSONB NOT NULL, status VARCHAR(20) DEFAULT \'PENDING\', amount DECIMAL(10, 2) NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);');
    await client.query('INSERT INTO shows (id, title, total_seats) VALUES (\'show_101\', \'Coldplay Live Concert\', 100) ON CONFLICT (id) DO NOTHING;');
    await client.query('COMMIT');
    console.log('Migrations completed & initial show seeded successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

runMigrations();