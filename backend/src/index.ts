import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { reserveSeats, confirmPayment } from './controllers/bookingController.js';
import { getShowDetails } from './controllers/showController.js';

dotenv.config();
const isDemoMode = process.env.DEMO_MODE === 'true';
if (!isDemoMode) {
  await import('./queues/bookingQueue.js');
}

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const PORT = process.env.PORT || 3000;

app.get('/api/v1/shows/:showId', getShowDetails);
app.post('/api/v1/reserve', reserveSeats);
app.post('/api/v1/confirm-payment', confirmPayment);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
  if (isDemoMode) {
    console.log('Running in DEMO_MODE=true (no Redis/Postgres required).');
  }
});