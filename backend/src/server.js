import { createHash, timingSafeEqual } from 'node:crypto';
import express from 'express';
import { tickTodaysMeal } from './mealCard.js';

const { PORT = 3000, STAFF_KEY } = process.env;
if (!STAFF_KEY || STAFF_KEY.length < 16) {
  console.error('Set STAFF_KEY in backend/.env to a random value of at least 16 characters.');
  process.exit(1);
}

const sha256 = (value) => createHash('sha256').update(value).digest();
const staffKeyHash = sha256(STAFF_KEY);

function requireStaff(req, res, next) {
  const key = req.get('Authorization')?.replace(/^Bearer /, '') ?? '';
  // Hashing gives equal-length buffers, which timingSafeEqual requires.
  if (!timingSafeEqual(sha256(key), staffKeyHash)) {
    return res.status(401).json({ error: 'Staff key is not valid.' });
  }
  next();
}

const app = express();
app.disable('x-powered-by');
app.use('/api', requireStaff, express.json());

app.get('/api/staff', (req, res) => res.sendStatus(204));

app.post('/api/meals/scan', (req, res) => {
  const { qrToken } = req.body ?? {};
  const isToken = typeof qrToken === 'string' && /^[0-9a-f]{32}$/.test(qrToken);
  res.json(isToken ? tickTodaysMeal(qrToken) : { result: 'unknown_card' });
});

// Replaces Express's default handler, which sends stack traces to clients outside production.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: 'Request failed.' });
});

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Meal card API listening on port ${PORT}`);
});
