import { createHash, timingSafeEqual } from 'node:crypto';
import express from 'express';
import { addClinicVisit } from './clinic.js';
import { getDormAssignment, saveDormAssignment } from './dorm.js';
import { tickTodaysMeal } from './meals.js';
import { findStudentByToken } from './students.js';

const { PORT = 3000 } = process.env;
const PIN_NAMES = ['MEAL_STAFF_PIN', 'DORM_STAFF_PIN', 'CLINIC_STAFF_PIN'];
for (const name of PIN_NAMES) {
  if (!/^\d{4}$/.test(process.env[name] ?? '')) {
    console.error(`Set ${name} in backend/.env to a 4-digit PIN.`);
    process.exit(1);
  }
}
if (new Set(PIN_NAMES.map((name) => process.env[name])).size !== PIN_NAMES.length) {
  console.error('Give each service a different PIN in backend/.env.');
  process.exit(1);
}

const MAX_WRONG_PINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const sha256 = (value) => createHash('sha256').update(value).digest();

// Each service has its own PIN, so cafeteria staff can't read or write clinic records.
// Four digits are easy to guess, so each device gets 5 wrong tries per service every 15 minutes.
function requireStaffPin(envName) {
  const expected = sha256(process.env[envName]);
  const wrongTries = new Map();
  return (req, res, next) => {
    const now = Date.now();
    let tries = wrongTries.get(req.ip);
    if (tries && now - tries.firstAt >= LOCKOUT_MS) {
      wrongTries.delete(req.ip);
      tries = undefined;
    }
    if (tries?.count >= MAX_WRONG_PINS) {
      const minutes = Math.ceil((tries.firstAt + LOCKOUT_MS - now) / 60_000);
      return res.status(429).json({ error: `Too many wrong PINs. Try again in ${minutes} min.` });
    }
    const pin = req.get('Authorization')?.replace(/^Bearer /, '') ?? '';
    // Hashing gives equal-length buffers, which timingSafeEqual requires.
    if (!timingSafeEqual(sha256(pin), expected)) {
      wrongTries.set(req.ip, { count: (tries?.count ?? 0) + 1, firstAt: tries?.firstAt ?? now });
      return res.status(401).json({ error: 'Staff PIN is not valid.' });
    }
    wrongTries.delete(req.ip);
    next();
  };
}

// Every service answers GET /staff so the app can check a PIN at sign-in.
function serviceRouter() {
  const router = express.Router();
  router.use(express.json());
  router.get('/staff', (req, res) => res.sendStatus(204));
  return router;
}

function withStudent(req, res, next) {
  req.student = findStudentByToken(req.body?.qrToken);
  if (!req.student) return res.json({ result: 'unknown_card' });
  next();
}

// Trimmed text, or null when it's missing, not a string, or longer than maxLength.
function cleanText(value, maxLength) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text && text.length <= maxLength ? text : null;
}

const meals = serviceRouter();
meals.post('/scan', withStudent, (req, res) => res.json(tickTodaysMeal(req.student)));

const dorm = serviceRouter();
dorm.post('/lookup', withStudent, (req, res) => {
  res.json({ result: 'found', student: req.student, assignment: getDormAssignment(req.student.id) });
});
dorm.put('/assignment', withStudent, (req, res) => {
  const room = cleanText(req.body.room, 30);
  const bed = cleanText(req.body.bed, 10);
  const { itemCount } = req.body;
  if (!room || !bed || !Number.isInteger(itemCount) || itemCount < 0 || itemCount > 999) {
    return res.status(400).json({ error: 'Enter a room, a bed, and a number of items from 0 to 999.' });
  }
  res.json(saveDormAssignment(req.student.id, { room, bed, itemCount }));
});

const clinic = serviceRouter();
clinic.post('/lookup', withStudent, (req, res) => res.json({ result: 'found', student: req.student }));
clinic.post('/visits', withStudent, (req, res) => {
  const diagnosis = cleanText(req.body.diagnosis, 1000);
  const prescription = cleanText(req.body.prescription, 1000);
  if (!diagnosis || !prescription) {
    return res.status(400).json({ error: 'Enter a diagnosis and a prescription, up to 1000 characters each.' });
  }
  res.json(addClinicVisit(req.student.id, { diagnosis, prescription }));
});

const app = express();
app.disable('x-powered-by');
app.use('/api/meals', requireStaffPin('MEAL_STAFF_PIN'), meals);
app.use('/api/dorm', requireStaffPin('DORM_STAFF_PIN'), dorm);
app.use('/api/clinic', requireStaffPin('CLINIC_STAFF_PIN'), clinic);

// Replaces Express's default handler, which sends stack traces to clients outside production.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: 'The server couldn’t complete this request. Try again.' });
});

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Campus services API listening on port ${PORT}`);
});
