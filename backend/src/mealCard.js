import { randomBytes } from 'node:crypto';
import { db } from './db.js';

const insertStudent = db.prepare(
  'INSERT INTO students (id, name, qr_token) VALUES (?, ?, ?) ON CONFLICT (id) DO NOTHING',
);
const findStudentByToken = db.prepare('SELECT id, name FROM students WHERE qr_token = ?');
const insertTick = db.prepare(
  'INSERT INTO meal_ticks (student_id, meal_date, ticked_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING',
);
const findTick = db.prepare('SELECT ticked_at FROM meal_ticks WHERE student_id = ? AND meal_date = ?');

// Returns the token to encode in the student's QR code, or null if the ID is already registered.
export function addStudent(id, name) {
  const qrToken = randomBytes(16).toString('hex');
  const { changes } = insertStudent.run(id, name, qrToken);
  return changes ? qrToken : null;
}

// The (student_id, meal_date) primary key allows one meal per day, even across several scanners.
export function tickTodaysMeal(qrToken) {
  const student = findStudentByToken.get(qrToken);
  if (!student) return { result: 'unknown_card' };

  const now = new Date();
  const today = localDate(now);
  const { changes } = insertTick.run(student.id, today, now.toISOString());
  const { ticked_at: tickedAt } = findTick.get(student.id, today);
  return { result: changes ? 'ticked' : 'already_ticked', student, tickedAt };
}

function localDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
