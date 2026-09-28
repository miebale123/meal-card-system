import cors from 'cors';
import express from 'express';
import { authRouter, requireService } from './auth.js';
import { addClinicVisit } from './clinic.js';
import { getDormAssignment, saveDormAssignment } from './dorm.js';
import { tickTodaysMeal } from './meals.js';
import { findStudentByToken } from './students.js';

// CORS_ORIGIN is a comma-separated list; the default is Expo's web dev server.
const { PORT = 3000, CORS_ORIGIN = 'http://localhost:8081' } = process.env;

// Bodies are parsed only after requireService has let the request through.
const serviceRouter = () => express.Router().use(express.json());

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
// Only browsers enforce CORS, so this limits which websites can call the API; the phone app is unaffected.
app.use(cors({ origin: CORS_ORIGIN.split(',').map((origin) => origin.trim()) }));
app.use('/api/auth', authRouter);
// Each account belongs to one service, so cafeteria staff can't read or write clinic records.
app.use('/api/meals', requireService('meals'), meals);
app.use('/api/dorm', requireService('dorm'), dorm);
app.use('/api/clinic', requireService('clinic'), clinic);

// Replaces Express's default handler, which sends stack traces to clients outside production.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: 'The server couldn’t complete this request. Try again.' });
});

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Campus services API listening on port ${PORT}`);
});
